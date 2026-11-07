/**
 * NSO Marketplace MVP Automated Test Suite
 * Tests authentication, authorization, role boundaries, OTP security,
 * listing approvals, inventory decrement, slot conflicts, and payment verification.
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { app, db } from '../server.js';
import http from 'node:http';

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

// Helper for HTTP requests
async function req(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, headers: res.headers, data: json };
}

describe('1. Health & Database', () => {
  test('GET /api/health returns database status and stats', async () => {
    const res = await req('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.data.status, 'online');
    assert.equal(res.data.database, 'SQLite (node:sqlite ACID WAL)');
    assert.ok(res.data.stats !== undefined);
  });
});

describe('2. OTP Security & Session Auth', () => {
  const testPhone = '9876543210';

  test('POST /api/auth/send-otp generates a 6-digit code', async () => {
    const res = await req('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: testPhone })
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);

    const otpRow = db.prepare('SELECT * FROM otp_verifications WHERE phone = ?').get(testPhone);
    assert.ok(otpRow, 'OTP record should exist in DB');
    assert.equal(otpRow.code.length, 6, 'OTP must be 6 digits');
  });

  test('POST /api/auth/verify-otp rejects invalid OTP and counts attempts', async () => {
    const res = await req('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: testPhone, otp: '000000' })
    });
    assert.equal(res.status, 400);

    const otpRow = db.prepare('SELECT attempts FROM otp_verifications WHERE phone = ?').get(testPhone);
    assert.equal(otpRow.attempts, 1);
  });

  test('POST /api/auth/verify-otp locks after 3 failed attempts', async () => {
    await req('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone: testPhone, otp: '111111' }) });
    const res = await req('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone: testPhone, otp: '222222' }) });
    assert.equal(res.status, 429);
    assert.match(res.data.error, /locked/i);
  });

  test('Successful OTP verification creates session cookie and authenticates', async () => {
    // Generate fresh OTP
    db.prepare('DELETE FROM otp_verifications WHERE phone = ?').run(testPhone);
    await req('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone: testPhone }) });
    const otpRow = db.prepare('SELECT code FROM otp_verifications WHERE phone = ?').get(testPhone);

    const res = await req('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: testPhone, otp: otpRow.code })
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.user);
    assert.equal(res.data.user.activeRole, 'customer');

    // Check session cookie
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie && setCookie.includes('nso_session'));

    // Check session in database
    const sessionInDb = db.prepare('SELECT * FROM sessions WHERE user_id = ? AND revoked = 0').get(res.data.user.id);
    assert.ok(sessionInDb);
  });

  test('New login invalidates previous sessions for that account', async () => {
    // Perform second login for same phone
    await req('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone: testPhone }) });
    const otpRow = db.prepare('SELECT code FROM otp_verifications WHERE phone = ?').get(testPhone);

    const secondLogin = await req('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: testPhone, otp: otpRow.code })
    });
    assert.equal(secondLogin.status, 200);

    // Verify older session was revoked
    const revokedSessions = db.prepare('SELECT count(*) as c FROM sessions WHERE user_id = ? AND revoked = 1').get(secondLogin.data.user.id);
    assert.ok(revokedSessions.c >= 1, 'Previous session must be revoked');
  });
});

describe('3. Role Boundaries & Authorization Protection', () => {
  let customerCookie;
  let customerUser;

  before(async () => {
    const phone = '9111122222';
    await req('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) });
    const otpRow = db.prepare('SELECT code FROM otp_verifications WHERE phone = ?').get(phone);
    const loginRes = await req('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp: otpRow.code }) });
    customerCookie = loginRes.headers.get('set-cookie')?.split(';')[0];
    customerUser = loginRes.data.user;
  });

  test('Unauthenticated requests are rejected with 401', async () => {
    const res = await req('/api/auth/me');
    assert.equal(res.status, 401);
  });

  test('Customer cannot access Owner applications endpoint (403)', async () => {
    const res = await req('/api/applications', { headers: { Cookie: customerCookie } });
    assert.equal(res.status, 403);
  });

  test('Customer cannot access Owner commission settings (403)', async () => {
    const res = await req('/api/commission', { headers: { Cookie: customerCookie } });
    assert.equal(res.status, 403);
  });

  test('Customer cannot access Owner audit logs (403)', async () => {
    const res = await req('/api/audit-logs', { headers: { Cookie: customerCookie } });
    assert.equal(res.status, 403);
  });

  test('Customer cannot post products without approved seller status (403)', async () => {
    const res = await req('/api/products', {
      method: 'POST',
      headers: { Cookie: customerCookie },
      body: JSON.stringify({ title: 'Test Product', price: 500, description: 'Test' })
    });
    assert.equal(res.status, 403);
  });

  test('Customer cannot post services without approved provider status (403)', async () => {
    const res = await req('/api/services', {
      method: 'POST',
      headers: { Cookie: customerCookie },
      body: JSON.stringify({ title: 'Test Service', price: 300, description: 'Test' })
    });
    assert.equal(res.status, 403);
  });
});

describe('4. Listing Approval Visibility Gate', () => {
  let sellerId;

  before(() => {
    sellerId = 'test_seller_1';
    db.prepare(`
      INSERT OR REPLACE INTO users (id, phone, name, email, active_role, is_admin, approval_status, seller_status, provider_status, created_at, updated_at)
      VALUES (?, '9888877777', 'Test Seller Store', 'seller@nso.in', 'seller', 0, 'approved', 'approved', 'none', datetime('now'), datetime('now'))
    `).run(sellerId);

    // Insert 1 approved product and 1 pending product
    db.prepare(`
      INSERT OR REPLACE INTO products (id, seller_id, seller_name, title, category, price, original_price, discount_percentage, image, stock, approval_status, description, created_at, updated_at)
      VALUES
        ('prod_approved_1', ?, 'Test Seller Store', 'Approved Fresh Item', 'Groceries', 200, 250, 20, 'http://img.jpg', 10, 'approved', 'Desc', datetime('now'), datetime('now')),
        ('prod_pending_2', ?, 'Test Seller Store', 'Unapproved Item', 'Groceries', 100, 100, 0, 'http://img.jpg', 10, 'pending_approval', 'Desc', datetime('now'), datetime('now'))
    `).run(sellerId, sellerId);
  });

  test('Public customer catalog GET /api/products returns ONLY approved listings', async () => {
    const res = await req('/api/products');
    assert.equal(res.status, 200);
    const ids = res.data.map((p) => p.id);
    assert.ok(ids.includes('prod_approved_1'), 'Approved item must be visible');
    assert.ok(!ids.includes('prod_pending_2'), 'Pending approval item must remain hidden from customers');
  });
});

describe('5. Atomic Orders & Inventory Decrement', () => {
  let customerCookie;

  before(async () => {
    const phone = '9222233333';
    await req('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) });
    const otpRow = db.prepare('SELECT code FROM otp_verifications WHERE phone = ?').get(phone);
    const loginRes = await req('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp: otpRow.code }) });
    customerCookie = loginRes.headers.get('set-cookie')?.split(';')[0];

    // Set product stock to 5
    db.prepare('UPDATE products SET stock = 5, price = 200 WHERE id = ?').run('prod_approved_1');
  });

  test('Placing an order atomically decrements stock in database', async () => {
    const res = await req('/api/orders', {
      method: 'POST',
      headers: { Cookie: customerCookie },
      body: JSON.stringify({
        items: [{ productId: 'prod_approved_1', quantity: 2 }],
        deliveryAddress: 'Flat 101, Indiranagar, Bengaluru - 560038',
        paymentMethod: 'cod'
      })
    });

    assert.equal(res.status, 201);
    assert.equal(res.data.total, 400); // 2 * 200

    // Verify stock decremented from 5 to 3
    const prod = db.prepare('SELECT stock FROM products WHERE id = ?').get('prod_approved_1');
    assert.equal(prod.stock, 3, 'Stock must decrement by order quantity');
  });

  test('Order fails atomically if requested quantity exceeds stock', async () => {
    const res = await req('/api/orders', {
      method: 'POST',
      headers: { Cookie: customerCookie },
      body: JSON.stringify({
        items: [{ productId: 'prod_approved_1', quantity: 10 }], // only 3 in stock
        deliveryAddress: 'Flat 101, Indiranagar, Bengaluru - 560038',
        paymentMethod: 'cod'
      })
    });

    assert.equal(res.status, 400);
    assert.match(res.data.error, /insufficient stock/i);

    // Verify stock did not change
    const prod = db.prepare('SELECT stock FROM products WHERE id = ?').get('prod_approved_1');
    assert.equal(prod.stock, 3);
  });
});

describe('6. Booking Slot Conflict Prevention', () => {
  let customerCookie;
  let providerId = 'test_provider_1';

  before(async () => {
    const phone = '9333344444';
    await req('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) });
    const otpRow = db.prepare('SELECT code FROM otp_verifications WHERE phone = ?').get(phone);
    const loginRes = await req('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp: otpRow.code }) });
    customerCookie = loginRes.headers.get('set-cookie')?.split(';')[0];

    // Create provider user and service
    db.prepare(`
      INSERT OR REPLACE INTO users (id, phone, name, email, active_role, is_admin, approval_status, seller_status, provider_status, created_at, updated_at)
      VALUES (?, '9444455555', 'Certified Plumber', 'plumber@nso.in', 'provider', 0, 'approved', 'none', 'approved', datetime('now'), datetime('now'))
    `).run(providerId);

    db.prepare(`
      INSERT OR REPLACE INTO services (id, provider_id, provider_name, title, category, price, approval_status, description, cancellation_policy, created_at, updated_at)
      VALUES ('svc_plumb_1', ?, 'Certified Plumber', 'Pipe Repair', 'Plumbing', 350, 'approved', 'Diagnostics & Repair', 'Free cancellation up to 2h', datetime('now'), datetime('now'))
    `).run(providerId);
  });

  test('First booking on slot succeeds', async () => {
    const res = await req('/api/bookings', {
      method: 'POST',
      headers: { Cookie: customerCookie },
      body: JSON.stringify({
        serviceId: 'svc_plumb_1',
        date: '2026-11-15',
        timeSlot: '10:00 AM - 12:00 PM',
        address: 'HSR Layout, Bengaluru'
      })
    });
    assert.equal(res.status, 201);
    assert.equal(res.data.status, 'confirmed');
  });

  test('Conflicting booking on identical provider/date/slot is rejected with 409', async () => {
    const res = await req('/api/bookings', {
      method: 'POST',
      headers: { Cookie: customerCookie },
      body: JSON.stringify({
        serviceId: 'svc_plumb_1',
        date: '2026-11-15',
        timeSlot: '10:00 AM - 12:00 PM', // Identical overlapping slot
        address: 'Different customer address'
      })
    });
    assert.equal(res.status, 409);
    assert.match(res.data.error, /already booked/i);
  });
});

describe('7. Payment Webhook Idempotency & Tamper Protection', () => {
  test('Webhook rejects missing signature', async () => {
    const res = await req('/api/payments/webhook', {
      method: 'POST',
      body: JSON.stringify({ event: 'payment.captured' })
    });
    assert.equal(res.status, 400);
  });
});
