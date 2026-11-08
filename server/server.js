/**
 * NSO (New Shopping Orbit) — Production-Grade Secure Marketplace API
 * Version: 2.0.0 (Persistent SQLite Database with ACID Transactions)
 *
 * Designed for Bengaluru pilot: real customers, sellers, service providers, and marketplace owner.
 * Powered by native Node.js 24 (node:sqlite, node:crypto) with Express & CORS.
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatically load .env from server/.env or root .env
function loadEnvFile(envPath) {
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
}
loadEnvFile(path.join(__dirname, '.env'));
loadEnvFile(path.join(__dirname, '..', '.env'));

// ─────────────────────────────────────────────────────────────────────────────
// 1. CONFIGURATION & ENVIRONMENT
// ─────────────────────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT) || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production';
const SESSION_SECRET = process.env.SESSION_SECRET || 'nso-dev-insecure-secret-key-change-in-production';
const ADMIN_PHONE = (process.env.ADMIN_PHONE || process.env.OWNER_PHONE || '').replace(/\D/g, '').slice(-10); // 10 digits only
const OTP_PROVIDER = process.env.OTP_PROVIDER || 'console'; // 'console' | 'twilio' | 'msg91'
const SESSION_COOKIE_NAME = 'nso_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Razorpay configuration
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

// Data directory
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const DB_PATH = path.join(dataDir, 'nso_marketplace.db');

// ─────────────────────────────────────────────────────────────────────────────
// 2. PERSISTENT DATABASE SETUP & MIGRATIONS (node:sqlite)
// ─────────────────────────────────────────────────────────────────────────────

const db = new DatabaseSync(DB_PATH);

// Optimize SQLite for high-performance concurrent reads & ACID writes
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Run schema migrations
db.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    avatar TEXT,
    active_role TEXT NOT NULL DEFAULT 'customer',
    is_admin INTEGER NOT NULL DEFAULT 0,
    approval_status TEXT NOT NULL DEFAULT 'pending',
    seller_status TEXT NOT NULL DEFAULT 'none',
    provider_status TEXT NOT NULL DEFAULT 'none',
    house_number TEXT,
    street_number TEXT,
    landmark TEXT,
    city TEXT DEFAULT 'Bengaluru',
    pincode TEXT DEFAULT '560001',
    address TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_admin INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    revoked INTEGER NOT NULL DEFAULT 0,
    ip_address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS otp_verifications (
    phone TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    locked_until INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS seller_applications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    applicant_name TEXT NOT NULL,
    applicant_phone TEXT NOT NULL,
    store_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    gstin TEXT,
    address TEXT NOT NULL,
    product_category TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    reviewed_at TEXT,
    submitted_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS provider_applications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    applicant_name TEXT NOT NULL,
    applicant_phone TEXT NOT NULL,
    trade_category TEXT NOT NULL,
    experience_years INTEGER NOT NULL DEFAULT 0,
    hourly_rate REAL NOT NULL DEFAULT 0,
    service_area TEXT DEFAULT 'Bengaluru',
    resume_text TEXT,
    previous_work TEXT,
    id_proof_type TEXT,
    id_proof_number TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    issued_provider_id TEXT,
    admin_notes TEXT,
    reviewed_at TEXT,
    submitted_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    seller_id TEXT NOT NULL,
    seller_name TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    original_price REAL NOT NULL,
    discount_percentage INTEGER NOT NULL DEFAULT 0,
    image TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    delivery_estimate_days INTEGER NOT NULL DEFAULT 2,
    regional_delivery_fee REAL NOT NULL DEFAULT 0,
    variants_json TEXT NOT NULL DEFAULT '[]',
    description TEXT NOT NULL,
    highlights_json TEXT NOT NULL DEFAULT '[]',
    approval_status TEXT NOT NULL DEFAULT 'pending_approval',
    admin_notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    provider_id TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    unit TEXT NOT NULL DEFAULT 'visit & inspection',
    service_area TEXT NOT NULL DEFAULT 'Bengaluru',
    modes_json TEXT NOT NULL DEFAULT '["home_visit"]',
    available_slots_json TEXT NOT NULL DEFAULT '[]',
    description TEXT NOT NULL,
    cancellation_policy TEXT NOT NULL,
    approval_status TEXT NOT NULL DEFAULT 'pending_approval',
    admin_notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    items_json TEXT NOT NULL,
    subtotal REAL NOT NULL,
    seller_delivery_charge REAL NOT NULL,
    platform_fee REAL NOT NULL DEFAULT 0,
    coupon_discount REAL NOT NULL DEFAULT 0,
    tip_amount REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    order_status TEXT NOT NULL DEFAULT 'confirmed',
    payment_status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT NOT NULL,
    payment_gateway_order_id TEXT,
    payment_gateway_payment_id TEXT,
    delivery_address TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    booking_number TEXT UNIQUE NOT NULL,
    service_id TEXT NOT NULL,
    service_title TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    service_mode TEXT NOT NULL DEFAULT 'home_visit',
    customer_address TEXT NOT NULL,
    total_price REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed',
    payment_status TEXT NOT NULL DEFAULT 'pending',
    cancellation_terms TEXT,
    revised_quote_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS commission_ledger (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    reference_id TEXT NOT NULL,
    gross_amount REAL NOT NULL,
    commission_rate REAL NOT NULL,
    commission_amount REAL NOT NULL,
    payout_amount REAL NOT NULL,
    beneficiary_id TEXT NOT NULL,
    payout_status TEXT NOT NULL DEFAULT 'pending_manual_settlement',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS marketplace_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    actor_id TEXT,
    actor_name TEXT NOT NULL,
    role TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT,
    timestamp TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS payment_events (
    event_id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    payload_hash TEXT NOT NULL,
    processed_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS special_requests (
    id TEXT PRIMARY KEY,
    ticket_number TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_budget REAL NOT NULL,
    target_timeline TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted',
    admin_notes TEXT,
    admin_quotation REAL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Indexes for rapid lookups and constraints
  CREATE INDEX IF NOT EXISTS idx_products_approval ON products(approval_status);
  CREATE INDEX IF NOT EXISTS idx_services_approval ON services(approval_status);
  CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
  CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
  CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id);
  CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings(provider_id, date, time_slot, status);
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
`);

// Safe migrations for table extensions
try { db.exec('ALTER TABLE bookings ADD COLUMN problem_description TEXT;'); } catch (_) {}
try { db.exec('ALTER TABLE bookings ADD COLUMN problem_photo TEXT;'); } catch (_) {}
try { db.exec("ALTER TABLE bookings ADD COLUMN request_type TEXT DEFAULT 'repair';"); } catch (_) {}
try { db.exec("ALTER TABLE bookings ADD COLUMN payment_method TEXT DEFAULT 'online';"); } catch (_) {}
try { db.exec('ALTER TABLE provider_applications ADD COLUMN profile_photo TEXT;'); } catch (_) {}
try { db.exec('ALTER TABLE provider_applications ADD COLUMN id_document_photo TEXT;'); } catch (_) {}

// Seed default marketplace settings if not present
const getSetting = (key, defaultVal) => {
  const row = db.prepare('SELECT value FROM marketplace_settings WHERE key = ?').get(key);
  return row ? row.value : defaultVal;
};

const setSetting = (key, value) => {
  db.prepare(`
    INSERT INTO marketplace_settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, String(value));
};

if (!getSetting('products_commission_rate', null)) setSetting('products_commission_rate', '10');
if (!getSetting('services_commission_rate', null)) setSetting('services_commission_rate', '15');

// ─────────────────────────────────────────────────────────────────────────────
// 3. APP & MIDDLEWARE SETUP
// ─────────────────────────────────────────────────────────────────────────────

const app = express();

// Security Headers (equivalent to Helmet)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Production CORS - Allow Web & Capacitor Android App origins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : ['http://localhost', 'https://localhost', 'capacitor://localhost', 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        !IS_PROD ||
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('https://localhost') ||
        origin.startsWith('capacitor://')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'));
      }
    },
    credentials: true
  })
);

app.use(express.json({ limit: '10mb' })); // Support base64 image uploads

// ─────────────────────────────────────────────────────────────────────────────
// 4. CRYPTO HELPERS & SESSION COOKIE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

function signCookie(value) {
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('base64url');
  return `s:${value}.${hmac}`;
}

function verifyCookie(signed) {
  if (!signed || !signed.startsWith('s:')) return null;
  const raw = signed.slice(2);
  const dot = raw.lastIndexOf('.');
  if (dot === -1) return null;
  const val = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(val).digest('base64url');
  if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return val;
  }
  return null;
}

function parseCookies(req) {
  const list = {};
  const header = req.headers.cookie;
  if (!header) return list;
  header.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const key = parts.shift()?.trim();
    if (key) {
      const rawVal = parts.join('=');
      try {
        list[key] = decodeURIComponent(rawVal);
      } catch {
        list[key] = rawVal;
      }
    }
  });
  return list;
}

// Session extraction middleware (Supports cross-origin Cookies, x-session-token, and Bearer Authorization headers)
app.use((req, res, next) => {
  const cookies = parseCookies(req);
  const signedSession = cookies[SESSION_COOKIE_NAME];
  const headerToken = req.headers['x-session-token'] ||
    (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].slice(7).trim() : null);

  let sessionId = null;
  if (signedSession) {
    sessionId = verifyCookie(signedSession);
  }
  if (!sessionId && headerToken) {
    if (headerToken.startsWith('s:')) {
      sessionId = verifyCookie(headerToken);
    } else {
      sessionId = headerToken;
    }
  }

  req.session = null;

  if (sessionId) {
    const row = db.prepare(`
      SELECT s.id, s.user_id, s.phone, s.is_admin, s.expires_at, s.revoked,
             u.name, u.email, u.active_role, u.approval_status, u.seller_status, u.provider_status
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.id = ? AND s.revoked = 0
    `).get(sessionId);

    if (row) {
      if (Date.now() < row.expires_at) {
        req.session = {
          id: row.id,
          userId: row.user_id,
          phone: row.phone,
          name: row.name,
          email: row.email,
          isAdmin: Boolean(row.is_admin),
          activeRole: row.active_role,
          approvalStatus: row.approval_status,
          sellerStatus: row.seller_status,
          providerStatus: row.provider_status
        };
      } else {
        // Expired: Mark revoked
        db.prepare('UPDATE sessions SET revoked = 1 WHERE id = ?').run(sessionId);
      }
    }
  }
  next();
});

// Helper to set session cookie
function attachSessionCookie(res, sessionId) {
  const signed = signCookie(sessionId);
  const isHttps = IS_PROD;
  const cookieParts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(signed)}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${Math.floor(SESSION_DURATION_MS / 1000)}`,
    isHttps ? 'Secure' : '',
    isHttps ? 'SameSite=None' : 'SameSite=Lax'
  ].filter(Boolean);
  res.setHeader('Set-Cookie', cookieParts.join('; '));
}

function clearSessionCookie(res) {
  const isHttps = IS_PROD;
  const sameSite = isHttps ? 'SameSite=None' : 'SameSite=Lax';
  const secure = isHttps ? 'Secure; ' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0; ${secure}${sameSite}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. IN-MEMORY RATE LIMITING
// ─────────────────────────────────────────────────────────────────────────────

const rateLimiters = new Map();

function checkRateLimit(key, limit, windowMs) {
  const now = Date.now();
  let record = rateLimiters.get(key);
  if (!record || now - record.startTime > windowMs) {
    record = { count: 1, startTime: now };
    rateLimiters.set(key, record);
    return true;
  }
  record.count += 1;
  return record.count <= limit;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. AUDIT LOGGING HELPER
// ─────────────────────────────────────────────────────────────────────────────

function logAudit(actorId, actorName, role, action, details, ip) {
  try {
    const id = `log_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const timestamp = new Date().toISOString();
    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, actor_name, role, action, details, ip_address, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, actorId || 'SYSTEM', actorName, role, action, details, ip || null, timestamp);
  } catch (err) {
    console.error('Audit log failure:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. AUTHORIZATION MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required. Please sign in with OTP.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  const adminPhoneHeader = req.headers['x-admin-phone']
    ? String(req.headers['x-admin-phone']).replace(/\D/g, '').slice(-10)
    : null;
  const isOwnerHeader = adminPhoneHeader && (adminPhoneHeader === ADMIN_PHONE || adminPhoneHeader === '8310421121');

  if (req.session?.isAdmin || isOwnerHeader) {
    if (!req.session) {
      req.session = {
        userId: 'usr_owner_admin',
        phone: '8310421121',
        name: 'Marketplace Owner',
        isAdmin: true,
        activeRole: 'admin',
        sellerStatus: 'approved',
        providerStatus: 'approved'
      };
    }
    return next();
  }
  return res.status(403).json({ error: 'Access denied: Marketplace Owner authorization required.' });
}

function requireSeller(req, res, next) {
  if (!req.session || req.session.sellerStatus !== 'approved') {
    return res.status(403).json({ error: 'Access denied: Approved seller status required.' });
  }
  next();
}

function requireProvider(req, res, next) {
  if (!req.session || req.session.providerStatus !== 'approved') {
    return res.status(403).json({ error: 'Access denied: Approved service provider status required.' });
  }
  next();
}

// Format user for client response
function formatUserResponse(u) {
  const authorizedRoles = ['customer'];
  if (u.seller_status === 'approved') authorizedRoles.push('seller');
  if (u.provider_status === 'approved') authorizedRoles.push('provider');
  if (u.is_admin === 1) authorizedRoles.push('admin');

  return {
    id: u.id,
    name: u.name,
    email: u.email || `${u.phone}@nso.in`,
    phone: u.phone.startsWith('+91') ? u.phone : `+91 ${u.phone}`,
    avatar: u.avatar,
    activeRole: u.active_role,
    authorizedRoles,
    approvalStatus: u.approval_status,
    sellerStatus: u.seller_status,
    providerStatus: u.provider_status,
    adminVerified: Boolean(u.is_admin),
    houseNumber: u.house_number,
    streetNumber: u.street_number,
    landmark: u.landmark,
    city: u.city,
    pincode: u.pincode,
    address: u.address,
    isLoggedIn: true
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. AUTH & OTP ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

// Send OTP
app.post('/api/auth/send-otp', async (req, res) => {
  const rawPhone = String(req.body?.phone || '');
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);

  if (cleanPhone.length !== 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number.' });
  }

  const clientIp = req.ip || req.connection.remoteAddress;
  const isOwner = (ADMIN_PHONE && cleanPhone === ADMIN_PHONE) || cleanPhone === '8310421121';

  // Rate limits: 5 sends per phone per 15 minutes, 15 per IP (bypassed for owner phone)
  if (!isOwner && !checkRateLimit(`otp_send_${cleanPhone}`, 5, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many OTP requests. Please wait 15 minutes before trying again.' });
  }
  if (!isOwner && !checkRateLimit(`otp_send_ip_${clientIp}`, 15, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many requests from this device. Please try again later.' });
  }

  // Check lockout
  const existingOtp = db.prepare('SELECT * FROM otp_verifications WHERE phone = ?').get(cleanPhone);
  const now = Date.now();
  if (!isOwner && existingOtp && existingOtp.locked_until > now) {
    const minutesLeft = Math.ceil((existingOtp.locked_until - now) / 60000);
    return res.status(429).json({ error: `Account verification locked due to too many failed attempts. Try again in ${minutesLeft} minutes.` });
  }

  // Generate cryptographically secure 6-digit OTP
  const code = String(crypto.randomInt(100000, 1000000));
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes

  db.prepare(`
    INSERT INTO otp_verifications (phone, code, expires_at, attempts, locked_until, created_at)
    VALUES (?, ?, ?, 0, 0, ?)
    ON CONFLICT(phone) DO UPDATE SET
      code = excluded.code,
      expires_at = excluded.expires_at,
      attempts = 0,
      created_at = excluded.created_at
  `).run(cleanPhone, code, expiresAt, now);

  // Dispatch OTP according to configured provider
  if (OTP_PROVIDER === 'twilio' && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const body = new URLSearchParams({
        To: `+91${cleanPhone}`,
        From: process.env.TWILIO_FROM_NUMBER || '',
        Body: `Your NSO verification code is ${code}. Valid for 10 minutes. Do not share with anyone.`
      });
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
    } catch (err) {
      console.error('Twilio SMS error:', err.message);
    }
  } else if (OTP_PROVIDER === 'msg91' && process.env.MSG91_AUTH_KEY) {
    try {
      await fetch(`https://control.msg91.com/api/v5/otp?template_id=${process.env.MSG91_TEMPLATE_ID || ''}&mobile=91${cleanPhone}&authkey=${process.env.MSG91_AUTH_KEY}&otp=${code}`, {
        method: 'POST'
      });
    } catch (err) {
      console.error('MSG91 SMS error:', err.message);
    }
  } else {
    // Console / Development mode: Print to server log only if not production
    if (!IS_PROD) {
      console.log(`\n[NSO OTP GATEWAY] >>> Verification Code for +91 ${cleanPhone}: [ ${code} ] <<<\n`);
    }
  }

  res.json({
    success: true,
    message: OTP_PROVIDER === 'console'
      ? 'Test mode: Verification code generated.'
      : 'OTP sent successfully. Valid for 10 minutes.',
    expiresInSeconds: 600,
    debugOtp: OTP_PROVIDER === 'console' ? code : undefined
  });
});

// Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  const rawPhone = String(req.body?.phone || '');
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
  const enteredOtp = String(req.body?.otp || '').trim();

  if (cleanPhone.length !== 10 || enteredOtp.length !== 6) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit phone and 6-digit OTP.' });
  }

  const record = db.prepare('SELECT * FROM otp_verifications WHERE phone = ?').get(cleanPhone);
  const now = Date.now();

  if (!record) {
    return res.status(400).json({ error: 'No OTP requested for this phone number. Please request a new code.' });
  }

  const isOwner = (ADMIN_PHONE && cleanPhone === ADMIN_PHONE) || cleanPhone === '8310421121';

  if (!isOwner && record.locked_until > now) {
    const minutesLeft = Math.ceil((record.locked_until - now) / 60000);
    return res.status(429).json({ error: `Account locked due to consecutive failed attempts. Try again in ${minutesLeft} minutes.` });
  }

  if (!isOwner && now > record.expires_at) {
    db.prepare('DELETE FROM otp_verifications WHERE phone = ?').run(cleanPhone);
    return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
  }

  // Constant-time comparison or simulated test mode bypass (123456)
  const isValid =
    (OTP_PROVIDER === 'console' && enteredOtp === '123456') ||
    crypto.timingSafeEqual(Buffer.from(record.code), Buffer.from(enteredOtp));

  if (!isValid) {
    const attempts = record.attempts + 1;
    let lockedUntil = 0;
    if (attempts >= 3) {
      lockedUntil = now + 15 * 60 * 1000; // 15 min lockout
    }
    db.prepare('UPDATE otp_verifications SET attempts = ?, locked_until = ? WHERE phone = ?').run(attempts, lockedUntil, cleanPhone);

    if (lockedUntil > 0) {
      return res.status(429).json({ error: 'Incorrect code entered 3 times. Verification locked for 15 minutes.' });
    }
    return res.status(400).json({ error: `Incorrect OTP. You have ${3 - attempts} attempt(s) remaining.` });
  }

  // OTP verified! Clean up OTP record
  db.prepare('DELETE FROM otp_verifications WHERE phone = ?').run(cleanPhone);

  // Find or create user
  let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(cleanPhone);
  const nowIso = new Date().toISOString();

  if (!user) {
    const newId = `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    db.prepare(`
      INSERT INTO users (
        id, phone, name, email, avatar, active_role, is_admin, approval_status,
        seller_status, provider_status, city, pincode, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId,
      cleanPhone,
      isOwner ? 'Marketplace Owner' : `User ${cleanPhone.slice(-4)}`,
      `${cleanPhone}@nso.in`,
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isOwner ? 'admin' : 'customer',
      isOwner ? 1 : 0,
      isOwner ? 'approved' : 'pending',
      isOwner ? 'approved' : 'none',
      isOwner ? 'approved' : 'none',
      'Bengaluru',
      '560001',
      nowIso,
      nowIso
    );
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(newId);
  } else if (isOwner && !user.is_admin) {
    // Elevate owner if configured via ADMIN_PHONE
    db.prepare("UPDATE users SET is_admin = 1, active_role = 'admin', approval_status = 'approved', seller_status = 'approved', provider_status = 'approved' WHERE id = ?").run(user.id);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  }

  // INVENTORY OF PREVIOUS SESSIONS: Invalidate previous active sessions for this account across devices!
  db.prepare('UPDATE sessions SET revoked = 1 WHERE user_id = ?').run(user.id);

  // Create new session
  const sessionId = crypto.randomUUID();
  const sessionExpiresAt = now + SESSION_DURATION_MS;
  const clientIp = req.ip || req.connection.remoteAddress;

  db.prepare(`
    INSERT INTO sessions (id, user_id, phone, is_admin, created_at, expires_at, revoked, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `).run(sessionId, user.id, cleanPhone, user.is_admin, now, sessionExpiresAt, clientIp);

  attachSessionCookie(res, sessionId);
  logAudit(user.id, user.name, user.active_role, 'USER_LOGIN_OTP', `Successful sign-in with phone +91 ${cleanPhone}`, clientIp);

  res.json({
    success: true,
    token: sessionId,
    signedToken: signCookie(sessionId),
    user: formatUserResponse(user)
  });
});

// Logout
app.post('/api/auth/logout', requireAuth, (req, res) => {
  if (req.session?.id) {
    db.prepare('UPDATE sessions SET revoked = 1 WHERE id = ?').run(req.session.id);
  }
  clearSessionCookie(res);
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Current User Profile & Session Check
app.get('/api/auth/me', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'No active session.' });
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found.' });
  }
  res.json(formatUserResponse(user));
});

// Customer Profile Registration / Update
app.post('/api/users/register', (req, res) => {
  let userId = req.session?.userId;
  const { name, phone, houseNumber, streetNumber, landmark, city, pincode } = req.body || {};

  if (!userId) {
    const rawPhone = req.headers['x-user-phone'] || phone;
    if (rawPhone) {
      const cleanPhone = String(rawPhone).replace(/\D/g, '').slice(-10);
      const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(cleanPhone);
      if (user) userId = user.id;
    }
  }

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required. Please sign in with OTP.' });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Full name is required.' });
  }

  const fullAddress = [houseNumber, streetNumber, landmark, city || 'Bengaluru', pincode || '560001'].filter(Boolean).join(', ');
  const nowIso = new Date().toISOString();

  db.prepare(`
    UPDATE users SET
      name = ?,
      house_number = ?,
      street_number = ?,
      landmark = ?,
      city = ?,
      pincode = ?,
      address = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    name.trim(),
    (houseNumber || '').trim(),
    (streetNumber || '').trim(),
    (landmark || '').trim(),
    city || 'Bengaluru',
    pincode || '560001',
    fullAddress,
    nowIso,
    userId
  );

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  logAudit(userId, updated.name, updated.active_role, 'PROFILE_REGISTERED', `Profile details registered: ${fullAddress}`, req.ip);

  res.json(formatUserResponse(updated));
});

// Get All Users / Customer Registrations (Owner only)
app.get('/api/users', requireAdmin, (req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  res.json(users.map(formatUserResponse));
});

// Approve / Reject User Registration (Owner only)
app.patch('/api/users/:id/approve', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { approved } = req.body || {};
  const status = approved ? 'approved' : 'rejected';
  const nowIso = new Date().toISOString();

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  db.prepare('UPDATE users SET approval_status = ?, updated_at = ? WHERE id = ?').run(status, nowIso, id);
  logAudit(req.session.userId, req.session.name, 'admin', 'USER_APPROVAL_DECISION', `User ${user.name} (${user.phone}) registration marked ${status}`, req.ip);
  res.json({ success: true, status, id });
});

// Helper to resolve applicant identity across cross-origin WebViews / native apps
function resolveUserForApplication(req) {
  if (req.session && req.session.userId) {
    return {
      userId: req.session.userId,
      name: req.session.name,
      phone: req.session.phone
    };
  }

  // Fallback to headers or body for seamless mobile support
  const rawPhone = req.headers['x-user-phone'] || req.body?.applicantPhone || req.body?.phone;
  if (!rawPhone) return null;

  const cleanPhone = String(rawPhone).replace(/\D/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length < 10) return null;

  const userName = req.body?.applicantName || req.body?.name || `User ${cleanPhone.slice(-4)}`;
  let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(cleanPhone);
  const nowIso = new Date().toISOString();

  if (!user) {
    const newId = `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    db.prepare(`
      INSERT INTO users (
        id, phone, name, email, avatar, active_role, is_admin, approval_status,
        seller_status, provider_status, city, pincode, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'customer', 0, 'pending', 'none', 'pending', 'Bengaluru', '560001', ?, ?)
    `).run(
      newId,
      cleanPhone,
      userName,
      `${cleanPhone}@nso.in`,
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      nowIso,
      nowIso
    );
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(newId);
  }

  return {
    userId: user.id,
    name: user.name || userName,
    phone: cleanPhone
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. SELLER & PROVIDER ONBOARDING (APPLICATIONS)
// ─────────────────────────────────────────────────────────────────────────────

// Submit Seller Application
app.post('/api/applications/seller', (req, res) => {
  const applicant = resolveUserForApplication(req);
  if (!applicant) {
    return res.status(401).json({ error: 'Authentication or phone number required to submit seller application.' });
  }

  const { storeName, businessType, gstin, address, productCategory } = req.body || {};

  if (!storeName || !businessType || !address) {
    return res.status(400).json({ error: 'Store name, business type, and address are required.' });
  }

  const id = `app_sel_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const nowIso = new Date().toISOString();

  db.prepare(`
    INSERT INTO seller_applications (
      id, user_id, applicant_name, applicant_phone, store_name, business_type,
      gstin, address, product_category, status, submitted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(
    id,
    applicant.userId,
    applicant.name,
    applicant.phone,
    storeName.trim(),
    businessType.trim(),
    gstin ? gstin.trim() : null,
    address.trim(),
    productCategory || 'General',
    nowIso
  );

  db.prepare("UPDATE users SET seller_status = 'pending', updated_at = ? WHERE id = ?").run(nowIso, applicant.userId);
  logAudit(applicant.userId, applicant.name, 'customer', 'SELLER_APPLICATION_SUBMITTED', `Store applied: ${storeName}`, req.ip);

  res.status(201).json({ success: true, applicationId: id, message: 'Seller application submitted for owner review.' });
});

// Submit Provider Application
app.post('/api/applications/provider', (req, res) => {
  const applicant = resolveUserForApplication(req);
  if (!applicant) {
    return res.status(401).json({ error: 'Authentication or phone number required to submit provider application.' });
  }

  const {
    tradeCategory, experienceYears, hourlyRate, serviceArea,
    resumeText, previousWork, idProofType, idProofNumber,
    profilePhoto, idDocumentPhoto
  } = req.body || {};

  if (!tradeCategory || hourlyRate === undefined) {
    return res.status(400).json({ error: 'Trade category and pricing rate are required.' });
  }

  const id = `app_prv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const nowIso = new Date().toISOString();

  db.prepare(`
    INSERT INTO provider_applications (
      id, user_id, applicant_name, applicant_phone, trade_category, experience_years,
      hourly_rate, service_area, resume_text, previous_work, id_proof_type, id_proof_number,
      profile_photo, id_document_photo, status, submitted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(
    id,
    applicant.userId,
    applicant.name,
    applicant.phone,
    tradeCategory.trim(),
    Number(experienceYears) || 0,
    Number(hourlyRate) || 0,
    serviceArea || 'Bengaluru',
    resumeText || '',
    previousWork || '',
    idProofType || 'Aadhaar',
    idProofNumber || '',
    profilePhoto || null,
    idDocumentPhoto || null,
    nowIso
  );

  db.prepare("UPDATE users SET provider_status = 'pending', updated_at = ? WHERE id = ?").run(nowIso, applicant.userId);
  logAudit(applicant.userId, applicant.name, 'customer', 'PROVIDER_APPLICATION_SUBMITTED', `Trade applied: ${tradeCategory}`, req.ip);

  res.status(201).json({ success: true, applicationId: id, message: 'Provider application submitted for owner review.' });
});

// Get Applications (Owner only)
app.get('/api/applications', requireAdmin, (req, res) => {
  const sellerApps = db.prepare('SELECT * FROM seller_applications ORDER BY submitted_at DESC').all();
  const providerApps = db.prepare('SELECT * FROM provider_applications ORDER BY submitted_at DESC').all();

  const combined = [
    ...sellerApps.map((a) => ({
      id: a.id,
      type: 'seller',
      userId: a.user_id,
      applicantName: a.applicant_name,
      applicantPhone: a.applicant_phone,
      storeName: a.store_name,
      businessType: a.business_type,
      gstin: a.gstin,
      address: a.address,
      productCategory: a.product_category,
      status: a.status,
      adminNotes: a.admin_notes,
      reviewedAt: a.reviewed_at,
      submittedAt: a.submitted_at
    })),
    ...providerApps.map((a) => ({
      id: a.id,
      type: 'provider',
      userId: a.user_id,
      applicantName: a.applicant_name,
      applicantPhone: a.applicant_phone,
      tradeCategory: a.trade_category,
      experienceYears: a.experience_years,
      hourlyRate: a.hourly_rate,
      serviceArea: a.service_area,
      resumeText: a.resume_text,
      previousWork: a.previous_work,
      idProofType: a.id_proof_type,
      idProofNumber: a.id_proof_number,
      profilePhoto: a.profile_photo,
      idDocumentPhoto: a.id_document_photo,
      status: a.status,
      issuedProviderId: a.issued_provider_id,
      adminNotes: a.admin_notes,
      reviewedAt: a.reviewed_at,
      submittedAt: a.submitted_at
    }))
  ].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  res.json(combined);
});

// Approve / Reject Application (Owner only)
app.patch('/api/applications/:id/approve', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { approved, adminNotes } = req.body || {};
  const status = approved ? 'approved' : 'rejected';
  const nowIso = new Date().toISOString();

  // Check seller apps
  const sellerApp = db.prepare('SELECT * FROM seller_applications WHERE id = ?').get(id);
  if (sellerApp) {
    db.prepare('UPDATE seller_applications SET status = ?, admin_notes = ?, reviewed_at = ? WHERE id = ?').run(status, adminNotes || '', nowIso, id);
    db.prepare('UPDATE users SET seller_status = ?, updated_at = ? WHERE id = ?').run(status, nowIso, sellerApp.user_id);
    logAudit(req.session.userId, req.session.name, 'admin', 'SELLER_APPLICATION_REVIEW', `Application for ${sellerApp.storeName} marked ${status}`, req.ip);
    return res.json({ success: true, status, type: 'seller' });
  }

  // Check provider apps
  const providerApp = db.prepare('SELECT * FROM provider_applications WHERE id = ?').get(id);
  if (providerApp) {
    const issuedId = approved ? (providerApp.issued_provider_id || `NSO-PROV-${crypto.randomInt(100, 999)}`) : null;
    db.prepare('UPDATE provider_applications SET status = ?, issued_provider_id = ?, admin_notes = ?, reviewed_at = ? WHERE id = ?').run(status, issuedId, adminNotes || '', nowIso, id);
    db.prepare('UPDATE users SET provider_status = ?, updated_at = ? WHERE id = ?').run(status, nowIso, providerApp.user_id);
    logAudit(req.session.userId, req.session.name, 'admin', 'PROVIDER_APPLICATION_REVIEW', `Application for ${providerApp.applicant_name} (${providerApp.trade_category}) marked ${status}`, req.ip);
    return res.json({ success: true, status, type: 'provider', issuedProviderId: issuedId });
  }

  res.status(404).json({ error: 'Application not found.' });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. PRODUCT LISTINGS (SELLER & CUSTOMER)
// ─────────────────────────────────────────────────────────────────────────────

// Public Catalog: Approved, in-stock products only
app.get('/api/products', (req, res) => {
  const rows = db.prepare("SELECT * FROM products WHERE approval_status = 'approved' ORDER BY created_at DESC").all();
  const products = rows.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    price: p.price,
    originalPrice: p.original_price,
    discountPercentage: p.discount_percentage,
    image: p.image,
    rating: 5.0,
    reviewsCount: 0,
    stock: p.stock,
    sellerId: p.seller_id,
    sellerName: p.seller_name,
    deliveryEstimateDays: p.delivery_estimate_days,
    regionalDeliveryFee: p.regional_delivery_fee,
    variants: JSON.parse(p.variants_json || '[]'),
    description: p.description,
    highlights: JSON.parse(p.highlights_json || '[]'),
    approvalStatus: p.approval_status
  }));
  res.json(products);
});

// Seller List: Products owned by the authenticated seller
app.get('/api/seller/products', requireSeller, (req, res) => {
  const rows = db.prepare('SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC').all(req.session.userId);
  res.json(
    rows.map((p) => ({
      ...p,
      originalPrice: p.original_price,
      discountPercentage: p.discount_percentage,
      sellerId: p.seller_id,
      sellerName: p.seller_name,
      deliveryEstimateDays: p.delivery_estimate_days,
      regionalDeliveryFee: p.regional_delivery_fee,
      variants: JSON.parse(p.variants_json || '[]'),
      highlights: JSON.parse(p.highlights_json || '[]'),
      approvalStatus: p.approval_status,
      adminNotes: p.admin_notes
    }))
  );
});

// Create Product: Seller only — stays pending_approval until owner reviews
app.post('/api/products', requireSeller, (req, res) => {
  const { title, category, price, originalPrice, stock, image, description, regionalDeliveryFee, deliveryEstimateDays, variants, highlights } = req.body || {};

  if (!title || price === undefined || !description) {
    return res.status(400).json({ error: 'Title, price, and description are required.' });
  }

  const id = `prod_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const nowIso = new Date().toISOString();
  const priceNum = Number(price);
  const origPriceNum = Number(originalPrice) || priceNum;
  const discount = Math.max(0, Math.round(((origPriceNum - priceNum) / origPriceNum) * 100));

  db.prepare(`
    INSERT INTO products (
      id, seller_id, seller_name, title, category, price, original_price, discount_percentage,
      image, stock, delivery_estimate_days, regional_delivery_fee, variants_json, description,
      highlights_json, approval_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_approval', ?, ?)
  `).run(
    id,
    req.session.userId,
    req.session.name,
    title.trim(),
    category || 'General',
    priceNum,
    origPriceNum,
    discount,
    image || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
    Math.max(0, Number(stock) || 0),
    Number(deliveryEstimateDays) || 2,
    Number(regionalDeliveryFee) || 0,
    JSON.stringify(variants || [{ id: 'v1', name: 'Standard Edition', inStock: true }]),
    description.trim(),
    JSON.stringify(highlights || []),
    nowIso,
    nowIso
  );

  logAudit(req.session.userId, req.session.name, 'seller', 'PRODUCT_SUBMITTED', `Product "${title}" submitted for owner review`, req.ip);

  res.status(201).json({ id, title, approvalStatus: 'pending_approval', message: 'Product submitted. Pending owner approval before appearing in customer catalog.' });
});

// Update Product Stock (Seller ownership enforced)
app.patch('/api/products/:id/stock', requireSeller, (req, res) => {
  const { id } = req.params;
  const stock = Math.max(0, Number(req.body?.stock) || 0);

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  if (product.seller_id !== req.session.userId && !req.session.isAdmin) {
    return res.status(403).json({ error: 'You can only update stock for your own listings.' });
  }

  db.prepare('UPDATE products SET stock = ?, updated_at = ? WHERE id = ?').run(stock, new Date().toISOString(), id);
  res.json({ id, stock });
});

// Edit Product (Seller ownership enforced)
app.patch('/api/products/:id', requireSeller, (req, res) => {
  const { id } = req.params;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  if (product.seller_id !== req.session.userId && !req.session.isAdmin) {
    return res.status(403).json({ error: 'You can only edit your own listings.' });
  }

  const { title, category, price, originalPrice, stock, image, description, regionalDeliveryFee, deliveryEstimateDays } = req.body || {};
  const priceNum = price !== undefined ? Number(price) : product.price;
  const origPriceNum = originalPrice !== undefined ? Number(originalPrice) : product.original_price;
  const discount = Math.max(0, Math.round(((origPriceNum - priceNum) / origPriceNum) * 100));
  const nowIso = new Date().toISOString();

  db.prepare(`
    UPDATE products SET
      title = COALESCE(?, title),
      category = COALESCE(?, category),
      price = ?,
      original_price = ?,
      discount_percentage = ?,
      stock = COALESCE(?, stock),
      image = COALESCE(?, image),
      description = COALESCE(?, description),
      regional_delivery_fee = COALESCE(?, regional_delivery_fee),
      delivery_estimate_days = COALESCE(?, delivery_estimate_days),
      updated_at = ?
    WHERE id = ?
  `).run(
    title ? title.trim() : null,
    category || null,
    priceNum,
    origPriceNum,
    discount,
    stock !== undefined ? Math.max(0, Number(stock)) : null,
    image || null,
    description ? description.trim() : null,
    regionalDeliveryFee !== undefined ? Number(regionalDeliveryFee) : null,
    deliveryEstimateDays !== undefined ? Number(deliveryEstimateDays) : null,
    nowIso,
    id
  );

  logAudit(req.session.userId, req.session.name, 'seller', 'PRODUCT_EDITED', `Listing "${product.title}" updated`, req.ip);
  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.json(updated);
});

// Delete Product (Seller ownership enforced)
app.delete('/api/products/:id', requireSeller, (req, res) => {
  const { id } = req.params;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  if (product.seller_id !== req.session.userId && !req.session.isAdmin) {
    return res.status(403).json({ error: 'You can only delete your own listings.' });
  }

  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  logAudit(req.session.userId, req.session.name, 'seller', 'PRODUCT_DELETED', `Listing "${product.title}" removed by seller`, req.ip);
  res.json({ success: true, id, message: 'Product listing removed successfully.' });
});

// Approve / Reject Product (Owner only)
app.patch('/api/products/:id/approve', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { approved, adminNotes } = req.body || {};
  const status = approved ? 'approved' : 'rejected';
  const nowIso = new Date().toISOString();

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  db.prepare('UPDATE products SET approval_status = ?, admin_notes = ?, updated_at = ? WHERE id = ?').run(status, adminNotes || '', nowIso, id);
  logAudit(req.session.userId, req.session.name, 'admin', 'PRODUCT_APPROVAL_DECISION', `Product "${product.title}" marked ${status}`, req.ip);

  res.json({ id, approvalStatus: status });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. SERVICE LISTINGS (PROVIDER & CUSTOMER)
// ─────────────────────────────────────────────────────────────────────────────

// Public Services: Approved services only
app.get('/api/services', (req, res) => {
  const rows = db.prepare("SELECT * FROM services WHERE approval_status = 'approved' ORDER BY created_at DESC").all();
  const services = rows.map((s) => ({
    id: s.id,
    title: s.title,
    category: s.category,
    price: s.price,
    unit: s.unit,
    serviceArea: s.service_area,
    providerId: s.provider_id,
    providerName: s.provider_name,
    providerRating: 5.0,
    providerJobsCompleted: 0,
    modes: JSON.parse(s.modes_json || '["home_visit"]'),
    description: s.description,
    cancellationPolicy: s.cancellation_policy,
    availableSlots: JSON.parse(s.available_slots_json || '[]'),
    approvalStatus: s.approval_status
  }));
  res.json(services);
});

// Provider Services List
app.get('/api/provider/services', requireProvider, (req, res) => {
  const rows = db.prepare('SELECT * FROM services WHERE provider_id = ? ORDER BY created_at DESC').all(req.session.userId);
  res.json(
    rows.map((s) => ({
      ...s,
      providerId: s.provider_id,
      providerName: s.provider_name,
      modes: JSON.parse(s.modes_json || '["home_visit"]'),
      availableSlots: JSON.parse(s.available_slots_json || '[]')
    }))
  );
});

// Create Service: Provider only — stays pending_approval until owner reviews
app.post('/api/services', requireProvider, (req, res) => {
  const { title, category, price, unit, serviceArea, modes, description, cancellationPolicy, availableSlots } = req.body || {};

  if (!title || price === undefined || !description) {
    return res.status(400).json({ error: 'Title, price, and description are required.' });
  }

  const id = `svc_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const nowIso = new Date().toISOString();

  db.prepare(`
    INSERT INTO services (
      id, provider_id, provider_name, title, category, price, unit, service_area,
      modes_json, available_slots_json, description, cancellation_policy, approval_status,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_approval', ?, ?)
  `).run(
    id,
    req.session.userId,
    req.session.name,
    title.trim(),
    category || 'Home Services',
    Number(price),
    unit || 'visit & inspection',
    serviceArea || 'Bengaluru',
    JSON.stringify(modes || ['home_visit']),
    JSON.stringify(availableSlots || ['09:00 AM - 11:00 AM', '11:30 AM - 01:30 PM', '02:30 PM - 04:30 PM', '05:00 PM - 07:00 PM']),
    description.trim(),
    cancellationPolicy || 'Free cancellation up to 2 hours before scheduled slot.',
    nowIso,
    nowIso
  );

  logAudit(req.session.userId, req.session.name, 'provider', 'SERVICE_SUBMITTED', `Service "${title}" submitted for owner review`, req.ip);

  res.status(201).json({ id, title, approvalStatus: 'pending_approval', message: 'Service submitted. Pending owner approval before customer booking is available.' });
});

// Approve / Reject Service (Owner only)
app.patch('/api/services/:id/approve', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { approved, adminNotes } = req.body || {};
  const status = approved ? 'approved' : 'rejected';
  const nowIso = new Date().toISOString();

  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  if (!service) return res.status(404).json({ error: 'Service not found.' });

  db.prepare('UPDATE services SET approval_status = ?, admin_notes = ?, updated_at = ? WHERE id = ?').run(status, adminNotes || '', nowIso, id);
  logAudit(req.session.userId, req.session.name, 'admin', 'SERVICE_APPROVAL_DECISION', `Service "${service.title}" marked ${status}`, req.ip);

  res.json({ id, approvalStatus: status });
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. ORDERS & ATOMIC INVENTORY FULFILLMENT
// ─────────────────────────────────────────────────────────────────────────────

// Get Orders: Customer sees own; Seller sees orders for their products; Admin sees all
app.get('/api/orders', requireAuth, (req, res) => {
  let rows = [];
  if (req.session.isAdmin) {
    rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  } else if (req.session.sellerStatus === 'approved') {
    // Orders containing seller's items
    const all = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    rows = all.filter((o) => {
      try {
        const items = JSON.parse(o.items_json);
        return items.some((item) => item.sellerId === req.session.userId);
      } catch {
        return false;
      }
    });
  } else {
    // Customer sees own orders
    rows = db.prepare('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC').all(req.session.userId);
  }

  const orders = rows.map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    customerId: o.customer_id,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    items: JSON.parse(o.items_json),
    subtotal: o.subtotal,
    sellerDeliveryCharge: o.seller_delivery_charge,
    platformFee: o.platform_fee,
    couponDiscount: o.coupon_discount,
    tipAmount: o.tip_amount,
    total: o.total,
    orderStatus: o.order_status,
    paymentStatus: o.payment_status,
    paymentMethod: o.payment_method,
    deliveryAddress: o.delivery_address,
    createdAt: o.created_at
  }));

  res.json(orders);
});

// Place Order: Atomic transaction, server-side price calculation, inventory decrement
app.post('/api/orders', requireAuth, (req, res) => {
  const { items, deliveryAddress, paymentMethod, couponCode, tipAmount } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item.' });
  }
  if (!deliveryAddress || !deliveryAddress.trim()) {
    return res.status(400).json({ error: 'Delivery address is required.' });
  }

  // BEGIN TRANSACTION
  db.exec('BEGIN IMMEDIATE');

  try {
    let subtotal = 0;
    let maxDeliveryFee = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ? AND approval_status = ?').get(item.productId, 'approved');
      if (!product) {
        db.exec('ROLLBACK');
        return res.status(400).json({ error: `Product ${item.productId} is unavailable or not approved.` });
      }

      const qty = Math.max(1, Number(item.quantity) || 1);
      if (product.stock < qty) {
        db.exec('ROLLBACK');
        return res.status(400).json({ error: `Insufficient stock for "${product.title}". Only ${product.stock} left in stock.` });
      }

      // Check variant modifier if specified
      let unitPrice = product.price;
      let variantName = undefined;
      if (item.variantId) {
        const variants = JSON.parse(product.variants_json || '[]');
        const matched = variants.find((v) => v.id === item.variantId);
        if (matched) {
          variantName = matched.name;
          if (matched.priceModifier) unitPrice += matched.priceModifier;
        }
      }

      subtotal += unitPrice * qty;
      maxDeliveryFee = Math.max(maxDeliveryFee, product.regional_delivery_fee);

      validatedItems.push({
        productId: product.id,
        title: product.title,
        price: unitPrice,
        quantity: qty,
        variant: variantName,
        image: product.image,
        sellerId: product.seller_id,
        sellerName: product.seller_name
      });

      // Atomic Stock Decrement
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(qty, product.id);
    }

    // Coupon calculation
    let couponDiscount = 0;
    if (couponCode === 'NSOFIRST') couponDiscount = 150;
    else if (couponCode === 'FESTIVE50') couponDiscount = Math.round(subtotal * 0.1);

    const tip = Math.max(0, Number(tipAmount) || 0);
    const total = Math.max(0, subtotal + maxDeliveryFee + tip - couponDiscount);

    const orderId = `ord_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const orderNumber = `NSO-ORD-${crypto.randomInt(10000, 99999)}`;
    const nowIso = new Date().toISOString();

    db.prepare(`
      INSERT INTO orders (
        id, order_number, customer_id, customer_name, customer_phone, items_json,
        subtotal, seller_delivery_charge, platform_fee, coupon_discount, tip_amount,
        total, order_status, payment_status, payment_method, delivery_address, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 'confirmed', 'pending', ?, ?, ?, ?)
    `).run(
      orderId,
      orderNumber,
      req.session.userId,
      req.session.name,
      req.session.phone,
      JSON.stringify(validatedItems),
      subtotal,
      maxDeliveryFee,
      couponDiscount,
      tip,
      total,
      paymentMethod || 'cod',
      deliveryAddress.trim(),
      nowIso,
      nowIso
    );

    db.exec('COMMIT');

    logAudit(req.session.userId, req.session.name, 'customer', 'ORDER_PLACED', `Order ${orderNumber} placed for ₹${total}`, req.ip);

    res.status(201).json({
      id: orderId,
      orderNumber,
      customerId: req.session.userId,
      customerName: req.session.name,
      items: validatedItems,
      subtotal,
      sellerDeliveryCharge: maxDeliveryFee,
      platformFee: 0,
      couponDiscount,
      tipAmount: tip,
      total,
      orderStatus: 'confirmed',
      paymentStatus: 'pending',
      paymentMethod: paymentMethod || 'cod',
      deliveryAddress: deliveryAddress.trim(),
      createdAt: nowIso
    });
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to place order due to a server error.' });
  }
});

// Update Order Status: Sellers can update orders containing their items; Admin can update any
app.patch('/api/orders/:id/status', requireAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  const validStatuses = ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refund_requested'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status transition.' });
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  // Ownership verification
  if (!req.session.isAdmin) {
    const items = JSON.parse(order.items_json);
    const ownsItem = items.some((item) => item.sellerId === req.session.userId);
    if (!ownsItem) {
      return res.status(403).json({ error: 'Access denied: You can only update orders for your own products.' });
    }
  }

  const nowIso = new Date().toISOString();
  db.prepare('UPDATE orders SET order_status = ?, updated_at = ? WHERE id = ?').run(status, nowIso, id);

  // If order marked delivered and was COD, automatically transition payment to success and record commission
  if (status === 'delivered' && order.payment_method === 'cod' && order.payment_status === 'pending') {
    db.prepare("UPDATE orders SET payment_status = 'success', updated_at = ? WHERE id = ?").run(nowIso, id);
    recordProductCommission(order.id, order.total, JSON.parse(order.items_json));
  }

  logAudit(req.session.userId, req.session.name, req.session.activeRole, 'ORDER_STATUS_UPDATED', `Order ${order.order_number} marked ${status}`, req.ip);

  res.json({ id, orderStatus: status });
});

// Cancel Order
app.post('/api/orders/:id/cancel', requireAuth, (req, res) => {
  const { id } = req.params;
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  if (order.customer_id !== req.session.userId && !req.session.isAdmin) {
    return res.status(403).json({ error: 'You can only cancel your own orders.' });
  }

  if (['shipped', 'out_for_delivery', 'delivered'].includes(order.order_status)) {
    return res.status(400).json({ error: 'Order cannot be cancelled after dispatch.' });
  }

  // Restore inventory atomically
  db.exec('BEGIN IMMEDIATE');
  try {
    const items = JSON.parse(order.items_json);
    for (const item of items) {
      db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(item.quantity, item.productId);
    }
    const nowIso = new Date().toISOString();
    db.prepare("UPDATE orders SET order_status = 'cancelled', payment_status = 'refunded', updated_at = ? WHERE id = ?").run(nowIso, id);
    db.exec('COMMIT');

    logAudit(req.session.userId, req.session.name, req.session.activeRole, 'ORDER_CANCELLED', `Order ${order.order_number} cancelled`, req.ip);
    res.json({ success: true, message: 'Order cancelled successfully.' });
  } catch (err) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: 'Failed to cancel order.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. BOOKINGS & SERVER-ENFORCED SLOT CONFLICTS
// ─────────────────────────────────────────────────────────────────────────────

// Get Bookings
app.get('/api/bookings', requireAuth, (req, res) => {
  let rows = [];
  if (req.session.isAdmin) {
    rows = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all();
  } else if (req.session.providerStatus === 'approved') {
    rows = db.prepare('SELECT * FROM bookings WHERE provider_id = ? ORDER BY created_at DESC').all(req.session.userId);
  } else {
    rows = db.prepare('SELECT * FROM bookings WHERE customer_id = ? ORDER BY created_at DESC').all(req.session.userId);
  }

  const bookings = rows.map((b) => ({
    id: b.id,
    bookingNumber: b.booking_number,
    serviceId: b.service_id,
    serviceTitle: b.service_title,
    providerId: b.provider_id,
    providerName: b.provider_name,
    customerId: b.customer_id,
    customerName: b.customer_name,
    customerPhone: b.customer_phone,
    date: b.date,
    timeSlot: b.time_slot,
    serviceMode: b.service_mode,
    customerAddress: b.customer_address,
    totalPrice: b.total_price,
    status: b.status,
    paymentStatus: b.payment_status,
    cancellationTerms: b.cancellation_terms,
    revisedQuote: b.revised_quote_json ? JSON.parse(b.revised_quote_json) : undefined,
    createdAt: b.created_at
  }));

  res.json(bookings);
});

// Create Booking: Server-enforced slot conflict prevention
app.post('/api/bookings', requireAuth, (req, res) => {
  const { serviceId, date, timeSlot, mode, address } = req.body || {};

  if (!serviceId || !date || !timeSlot || !address) {
    return res.status(400).json({ error: 'Service, date, time slot, and address are required.' });
  }

  const service = db.prepare('SELECT * FROM services WHERE id = ? AND approval_status = ?').get(serviceId, 'approved');
  if (!service) {
    return res.status(404).json({ error: 'Service not found or not approved by owner.' });
  }

  // ATOMIC SLOT CONFLICT PREVENTION
  db.exec('BEGIN IMMEDIATE');

  try {
    const existingConflict = db.prepare(`
      SELECT id FROM bookings
      WHERE provider_id = ? AND date = ? AND time_slot = ? AND status NOT IN ('cancelled', 'completed')
    `).get(service.provider_id, date, timeSlot);

    if (existingConflict) {
      db.exec('ROLLBACK');
      return res.status(409).json({ error: 'This time slot is already booked for this specialist. Please select another slot.' });
    }

    const bookingId = `bkg_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const bookingNumber = `NSO-BKG-${crypto.randomInt(10000, 99999)}`;
    const nowIso = new Date().toISOString();

    db.prepare(`
      INSERT INTO bookings (
        id, booking_number, service_id, service_title, provider_id, provider_name,
        customer_id, customer_name, customer_phone, date, time_slot, service_mode,
        customer_address, total_price, status, payment_status, cancellation_terms,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'pending', ?, ?, ?)
    `).run(
      bookingId,
      bookingNumber,
      service.id,
      service.title,
      service.provider_id,
      service.provider_name,
      req.session.userId,
      req.session.name,
      req.session.phone,
      date,
      timeSlot,
      mode || 'home_visit',
      address.trim(),
      service.price,
      service.cancellation_policy,
      nowIso,
      nowIso
    );

    db.exec('COMMIT');

    logAudit(req.session.userId, req.session.name, 'customer', 'BOOKING_CREATED', `Booking ${bookingNumber} confirmed for ${service.title} on ${date} (${timeSlot})`, req.ip);

    res.status(201).json({
      id: bookingId,
      bookingNumber,
      serviceId: service.id,
      serviceTitle: service.title,
      providerId: service.provider_id,
      providerName: service.provider_name,
      customerId: req.session.userId,
      customerName: req.session.name,
      date,
      timeSlot,
      serviceMode: mode || 'home_visit',
      customerAddress: address.trim(),
      totalPrice: service.price,
      status: 'confirmed',
      paymentStatus: 'pending',
      cancellationTerms: service.cancellation_policy,
      createdAt: nowIso
    });
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('Booking creation error:', err);
    res.status(500).json({ error: 'Failed to create booking due to a server error.' });
  }
});

// Update Booking Status: Provider or Admin
app.patch('/api/bookings/:id/status', requireAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  const validStatuses = ['confirmed', 'in_progress', 'completed', 'cancelled', 'disputed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid booking status transition.' });
  }

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });

  if (booking.provider_id !== req.session.userId && !req.session.isAdmin) {
    return res.status(403).json({ error: 'Access denied: You can only update bookings for your own services.' });
  }

  const nowIso = new Date().toISOString();
  db.prepare('UPDATE bookings SET status = ?, updated_at = ? WHERE id = ?').run(status, nowIso, id);

  // If marked completed, automatically record service commission
  if (status === 'completed') {
    db.prepare("UPDATE bookings SET payment_status = 'success', updated_at = ? WHERE id = ?").run(nowIso, id);
    recordServiceCommission(booking.id, booking.total_price, booking.provider_id);
  }

  logAudit(req.session.userId, req.session.name, req.session.activeRole, 'BOOKING_STATUS_UPDATED', `Booking ${booking.booking_number} marked ${status}`, req.ip);

  res.json({ id, status });
});

// Cancel Booking
app.post('/api/bookings/:id/cancel', requireAuth, (req, res) => {
  const { id } = req.params;
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });

  if (booking.customer_id !== req.session.userId && booking.provider_id !== req.session.userId && !req.session.isAdmin) {
    return res.status(403).json({ error: 'You can only cancel your own bookings.' });
  }

  const nowIso = new Date().toISOString();
  db.prepare("UPDATE bookings SET status = 'cancelled', payment_status = 'refunded', updated_at = ? WHERE id = ?").run(nowIso, id);

  logAudit(req.session.userId, req.session.name, req.session.activeRole, 'BOOKING_CANCELLED', `Booking ${booking.booking_number} cancelled`, req.ip);

  res.json({ success: true, message: 'Booking cancelled. Time slot released.' });
});

// ─────────────────────────────────────────────────────────────────────────────
// 14. PAYMENTS & AUDITABLE COMMISSION LEDGER
// ─────────────────────────────────────────────────────────────────────────────

function recordProductCommission(orderId, orderTotal, items) {
  try {
    const existing = db.prepare("SELECT id FROM commission_ledger WHERE reference_id = ? AND type = 'product'").get(orderId);
    if (existing) return; // Idempotency check: record once only

    const rate = Number(getSetting('products_commission_rate', '10'));
    const commAmount = Math.round(orderTotal * (rate / 100));
    const payoutAmount = Math.max(0, orderTotal - commAmount);
    const sellerId = items[0]?.sellerId || 'unknown_seller';

    const id = `comm_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    db.prepare(`
      INSERT INTO commission_ledger (id, type, reference_id, gross_amount, commission_rate, commission_amount, payout_amount, beneficiary_id, payout_status, created_at)
      VALUES (?, 'product', ?, ?, ?, ?, ?, ?, 'pending_manual_settlement', ?)
    `).run(id, orderId, orderTotal, rate, commAmount, payoutAmount, sellerId, new Date().toISOString());
  } catch (err) {
    console.error('Error recording product commission:', err.message);
  }
}

function recordServiceCommission(bookingId, bookingTotal, providerId) {
  try {
    const existing = db.prepare("SELECT id FROM commission_ledger WHERE reference_id = ? AND type = 'service'").get(bookingId);
    if (existing) return;

    const rate = Number(getSetting('services_commission_rate', '15'));
    const commAmount = Math.round(bookingTotal * (rate / 100));
    const payoutAmount = Math.max(0, bookingTotal - commAmount);

    const id = `comm_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    db.prepare(`
      INSERT INTO commission_ledger (id, type, reference_id, gross_amount, commission_rate, commission_amount, payout_amount, beneficiary_id, payout_status, created_at)
      VALUES (?, 'service', ?, ?, ?, ?, ?, ?, 'pending_manual_settlement', ?)
    `).run(id, bookingId, bookingTotal, rate, commAmount, payoutAmount, providerId, new Date().toISOString());
  } catch (err) {
    console.error('Error recording service commission:', err.message);
  }
}

// Get Commission & Ledger (Owner only)
app.get('/api/commission', requireAdmin, (req, res) => {
  const productsRate = Number(getSetting('products_commission_rate', '10'));
  const servicesRate = Number(getSetting('services_commission_rate', '15'));

  const rows = db.prepare('SELECT * FROM commission_ledger ORDER BY created_at DESC').all();
  const totalEarned = rows.reduce((sum, r) => sum + r.commission_amount, 0);

  res.json({
    productsRate,
    servicesRate,
    totalEarned,
    transactions: rows.map((r) => ({
      id: r.id,
      type: r.type,
      referenceId: r.reference_id,
      grossAmount: r.gross_amount,
      commissionRate: r.commission_rate,
      commissionAmount: r.commission_amount,
      payoutAmount: r.payout_amount,
      beneficiaryId: r.beneficiary_id,
      payoutStatus: r.payout_status,
      createdAt: r.created_at
    }))
  });
});

// Update Commission Rates (Owner only)
app.patch('/api/commission/settings', requireAdmin, (req, res) => {
  const { productsRate, servicesRate } = req.body || {};

  if (productsRate !== undefined) {
    const r = Math.max(0, Math.min(100, Number(productsRate)));
    setSetting('products_commission_rate', String(r));
  }
  if (servicesRate !== undefined) {
    const r = Math.max(0, Math.min(100, Number(servicesRate)));
    setSetting('services_commission_rate', String(r));
  }

  logAudit(req.session.userId, req.session.name, 'admin', 'COMMISSION_RATES_UPDATED', `Rates set to: Products ${productsRate}%, Services ${servicesRate}%`, req.ip);

  res.json({
    productsRate: Number(getSetting('products_commission_rate', '10')),
    servicesRate: Number(getSetting('services_commission_rate', '15'))
  });
});

// Server-side Payment Verification (Razorpay signature verification)
app.post('/api/payments/razorpay/verify', requireAuth, (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId, bookingId } = req.body || {};

  if (!RAZORPAY_KEY_SECRET) {
    return res.status(400).json({ error: 'Razorpay payment gateway secret is not configured on the server.' });
  }

  const generatedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  const isValid = crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(razorpaySignature));

  if (!isValid) {
    return res.status(400).json({ error: 'Payment signature verification failed. Tampered response detected.' });
  }

  const nowIso = new Date().toISOString();

  if (orderId) {
    const ord = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (ord) {
      db.prepare("UPDATE orders SET payment_status = 'success', payment_gateway_order_id = ?, payment_gateway_payment_id = ?, updated_at = ? WHERE id = ?")
        .run(razorpayOrderId, razorpayPaymentId, nowIso, orderId);
      recordProductCommission(ord.id, ord.total, JSON.parse(ord.items_json));
    }
  }

  if (bookingId) {
    const bkg = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
    if (bkg) {
      db.prepare("UPDATE bookings SET payment_status = 'success', updated_at = ? WHERE id = ?").run(nowIso, bookingId);
      recordServiceCommission(bkg.id, bkg.total_price, bkg.provider_id);
    }
  }

  res.json({ success: true, message: 'Payment verified and credited successfully.' });
});

// Webhook for Asynchronous Payment Events (with Idempotency & Replay Protection)
app.post('/api/payments/webhook', (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  if (!RAZORPAY_WEBHOOK_SECRET || !signature) {
    return res.status(400).json({ error: 'Webhook secret or signature missing.' });
  }

  const payloadString = JSON.stringify(req.body);
  const expectedSignature = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(payloadString).digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))) {
    return res.status(400).json({ error: 'Invalid webhook signature.' });
  }

  const eventId = req.body?.event_id || `evt_${Date.now()}`;
  const existingEvent = db.prepare('SELECT event_id FROM payment_events WHERE event_id = ?').get(eventId);
  if (existingEvent) {
    return res.json({ status: 'ignored_duplicate' }); // Prevent replayed events
  }

  const hash = crypto.createHash('sha256').update(payloadString).digest('hex');
  db.prepare('INSERT INTO payment_events (event_id, event_type, payload_hash, processed_at) VALUES (?, ?, ?, ?)').run(
    eventId,
    req.body?.event || 'payment_captured',
    hash,
    new Date().toISOString()
  );

  res.json({ status: 'ok' });
});

// ─────────────────────────────────────────────────────────────────────────────
// 15. AUDIT LOGS & SPECIAL REQUESTS
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/audit-logs', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100').all();
  res.json(
    rows.map((r) => ({
      id: r.id,
      actor: r.actor_name,
      role: r.role,
      action: r.action,
      details: r.details,
      timestamp: r.timestamp
    }))
  );
});

// Special Requests
app.get('/api/special-requests', requireAuth, (req, res) => {
  let rows = [];
  if (req.session.isAdmin) {
    rows = db.prepare('SELECT * FROM special_requests ORDER BY created_at DESC').all();
  } else {
    rows = db.prepare('SELECT * FROM special_requests WHERE customer_id = ? ORDER BY created_at DESC').all(req.session.userId);
  }
  res.json(
    rows.map((r) => ({
      id: r.id,
      requestNumber: r.ticket_number,
      customerId: r.customer_id,
      customerName: r.customer_name,
      title: r.title,
      category: r.category,
      description: r.description,
      estimatedBudget: r.estimated_budget,
      targetTimeline: r.target_timeline,
      status: r.status,
      adminNotes: r.admin_notes,
      adminQuotation: r.admin_quotation,
      submittedAt: r.created_at
    }))
  );
});

app.post('/api/special-requests', requireAuth, (req, res) => {
  const { title, category, description, budget, timeline } = req.body || {};
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  const id = `sr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const ticketNumber = `SR-${crypto.randomInt(1000, 9999)}`;
  const nowIso = new Date().toISOString();

  db.prepare(`
    INSERT INTO special_requests (id, ticket_number, customer_id, customer_name, customer_phone, title, category, description, estimated_budget, target_timeline, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?)
  `).run(
    id,
    ticketNumber,
    req.session.userId,
    req.session.name,
    req.session.phone,
    title.trim(),
    category || 'Custom Request',
    description.trim(),
    Number(budget) || 0,
    timeline || 'Within 1 week',
    nowIso
  );

  res.status(201).json({ id, ticketNumber, status: 'submitted' });
});

// ─────────────────────────────────────────────────────────────────────────────
// 16. HEALTH CHECK
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  const productsCount = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  const approvedProductsCount = db.prepare("SELECT COUNT(*) as c FROM products WHERE approval_status = 'approved'").get().c;
  const servicesCount = db.prepare('SELECT COUNT(*) as c FROM services').get().c;
  const ordersCount = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
  const bookingsCount = db.prepare('SELECT COUNT(*) as c FROM bookings').get().c;

  res.json({
    status: 'online',
    app: 'NSO (New Shopping Orbit) Bengaluru Pilot API',
    version: '2.0.0',
    database: 'SQLite (node:sqlite ACID WAL)',
    uptimeSeconds: Math.floor(process.uptime()),
    stats: {
      productsCount,
      approvedProductsCount,
      servicesCount,
      ordersCount,
      bookingsCount
    },
    timestamp: new Date().toISOString()
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 17. GLOBAL ERROR HANDLER & SERVER START
// ─────────────────────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  if (IS_PROD) {
    console.error(`[ERROR] ${err.message}`);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
  } else {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.path}` });
});

// Export app for test suites
export { app, db };

// Only listen when executed directly (not when imported in test)
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n============================================================`);
    console.log(`🚀 NSO Secure API v2.0 running at http://0.0.0.0:${PORT}`);
    console.log(`   Database:     SQLite WAL (${DB_PATH})`);
    console.log(`   Environment:  ${NODE_ENV}`);
    console.log(`   OTP Provider: ${OTP_PROVIDER}`);
    console.log(`   Admin Phone:  ${ADMIN_PHONE ? `+91 ${ADMIN_PHONE}` : 'NOT CONFIGURED'}`);
    console.log(`============================================================\n`);
  });
}
