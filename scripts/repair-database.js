import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'server', 'data', 'nso_marketplace.db');

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON;');

console.log('[REPAIR] Starting database repair and sync for providers and services...');

// 1. Ensure columns exist
try { db.exec("ALTER TABLE users ADD COLUMN account_id TEXT;"); } catch (_) {}
try { db.exec("ALTER TABLE services ADD COLUMN issued_provider_id TEXT;"); } catch (_) {}
try { db.exec("ALTER TABLE bookings ADD COLUMN provider_user_id TEXT;"); } catch (_) {}
try { db.exec("ALTER TABLE bookings ADD COLUMN issued_provider_id TEXT;"); } catch (_) {}
try { db.exec("ALTER TABLE provider_applications ADD COLUMN profile_photo TEXT;"); } catch (_) {}
try { db.exec("ALTER TABLE provider_applications ADD COLUMN id_document_photo TEXT;"); } catch (_) {}
try { db.exec("ALTER TABLE provider_applications ADD COLUMN previous_work_samples_json TEXT DEFAULT '[]';"); } catch (_) {}
try { db.exec("ALTER TABLE provider_applications ADD COLUMN work_videos_json TEXT DEFAULT '[]';"); } catch (_) {}

// 2. Define standard approved providers and their stable IDs
const providerProfiles = [
  {
    userId: 'prov_electrician_1',
    phone: '9845067890',
    name: 'Suresh Kumar',
    issuedId: 'NSO-PROV-101',
    trade: 'Electrical',
    rate: 299,
    years: 8,
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
    workSamples: [
      { id: 'ws_elec_1', title: 'Main MCB Distribution Board Wiring', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800', tag: 'Electrical' },
      { id: 'ws_elec_2', title: 'Concealed Conduit LED Installation', image: 'https://images.unsplash.com/photo-1558227691-41ea78d1f631?w=800', tag: 'Lighting' }
    ]
  },
  {
    userId: 'prov_plumber_1',
    phone: '9845067891',
    name: 'Manjunath Gowda',
    issuedId: 'NSO-PROV-102',
    trade: 'Plumbing',
    rate: 249,
    years: 6,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    workSamples: [
      { id: 'ws_plumb_1', title: 'Bathroom Fixture & Diverter Overhaul', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800', tag: 'Plumbing' },
      { id: 'ws_plumb_2', title: 'High Pressure Water Pump Repair', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800', tag: 'Piping' }
    ]
  },
  {
    userId: 'prov_cleaning_1',
    phone: '9845067892',
    name: 'CleanPro Solutions',
    issuedId: 'NSO-PROV-103',
    trade: 'Cleaning',
    rate: 1499,
    years: 5,
    avatar: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150',
    workSamples: [
      { id: 'ws_clean_1', title: 'Deep Kitchen Degreasing & Sanitization', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800', tag: 'Cleaning' }
    ]
  },
  {
    userId: 'prov_ac_1',
    phone: '9845067893',
    name: 'Bengaluru Cool Care',
    issuedId: 'NSO-PROV-104',
    trade: 'Appliance Care',
    rate: 499,
    years: 7,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    workSamples: [
      { id: 'ws_ac_1', title: 'Split AC Power Jet Cleaning', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800', tag: 'AC Service' }
    ]
  },
  {
    userId: 'test_provider_1',
    phone: '9444455555',
    name: 'Certified Plumber',
    issuedId: 'NSO-PROV-105',
    trade: 'Plumbing',
    rate: 350,
    years: 5,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    workSamples: [
      { id: 'ws_cert_plumb_1', title: 'Copper Pipe Leak Soldering & Joint Sealing', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800', tag: 'Plumbing' },
      { id: 'ws_cert_plumb_2', title: 'Water Tank Float Valve Replacement', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800', tag: 'Piping' }
    ]
  }
];

const now = new Date().toISOString();

for (const prov of providerProfiles) {
  // A. Ensure user exists and has account_id and provider_status = approved
  const existingUser = db.prepare('SELECT id, account_id FROM users WHERE id = ? OR phone = ?').get(prov.userId, prov.phone);
  if (existingUser) {
    db.prepare('UPDATE users SET provider_status = ?, account_id = ?, updated_at = ? WHERE id = ?')
      .run('approved', prov.issuedId, now, existingUser.id);
  } else {
    db.prepare(`
      INSERT INTO users (id, phone, name, email, active_role, is_admin, approval_status, seller_status, provider_status, account_id, city, pincode, address, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'provider', 0, 'approved', 'none', 'approved', ?, 'Bengaluru', '560001', 'Indiranagar Hub, Bengaluru', ?, ?)
    `).run(prov.userId, prov.phone, prov.name, `${prov.userId}@nso.in`, prov.issuedId, now, now);
  }

  // B. Ensure provider_applications record exists and is approved
  const existingApp = db.prepare('SELECT id FROM provider_applications WHERE user_id = ?').get(prov.userId);
  const appId = existingApp ? existingApp.id : `app_${prov.userId}`;
  const workSamplesJson = JSON.stringify(prov.workSamples);

  if (existingApp) {
    db.prepare(`
      UPDATE provider_applications SET
        status = 'approved',
        issued_provider_id = ?,
        applicant_name = ?,
        trade_category = ?,
        hourly_rate = ?,
        previous_work_samples_json = ?,
        reviewed_at = ?
      WHERE id = ?
    `).run(prov.issuedId, prov.name, prov.trade, prov.rate, workSamplesJson, now, appId);
  } else {
    db.prepare(`
      INSERT INTO provider_applications (
        id, user_id, applicant_name, applicant_phone, trade_category,
        experience_years, hourly_rate, service_area, previous_work,
        status, issued_provider_id, reviewed_at, submitted_at,
        previous_work_samples_json, profile_photo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Bengaluru', 'Verified specialist approved by NSO Admin', 'approved', ?, ?, ?, ?, ?)
    `).run(
      appId, prov.userId, prov.name, prov.phone, prov.trade,
      prov.years, prov.rate, prov.issuedId, now, now,
      workSamplesJson, prov.avatar
    );
  }
}

// 3. Repair existing services and ensure work photos are populated
const existingServices = db.prepare('SELECT * FROM services').all();
for (const svc of existingServices) {
  const prov = providerProfiles.find(p => p.userId === svc.provider_id || svc.provider_name.includes(p.name));
  const issuedId = prov ? prov.issuedId : (svc.issued_provider_id || 'NSO-PROV-101');
  const photos = prov ? prov.workSamples.map(ws => ws.image) : ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800'];
  const formattedName = svc.provider_name.includes('(') ? svc.provider_name : `${svc.provider_name} (${issuedId})`;

  db.prepare(`
    UPDATE services SET
      issued_provider_id = ?,
      provider_name = ?,
      work_photos_json = ?,
      approval_status = 'approved',
      updated_at = ?
    WHERE id = ?
  `).run(issuedId, formattedName, JSON.stringify(photos), now, svc.id);
}

// 4. Also ensure standard pilot services exist so customer explore & booking has complete services
const servicesToSeed = [
  {
    id: 'serv_electrician_inspection',
    provider_id: 'prov_electrician_1',
    issued_provider_id: 'NSO-PROV-101',
    provider_name: 'Suresh Kumar (NSO-PROV-101)',
    title: 'Certified Electrician — Home Inspection, Wiring & MCB Repair',
    category: 'Electrical',
    price: 299,
    unit: 'visit & inspection',
    service_area: 'Bengaluru (East & Central)',
    modes: ['home_visit'],
    available_slots: ['09:00 AM - 11:00 AM', '11:30 AM - 01:30 PM', '02:30 PM - 04:30 PM', '05:00 PM - 07:00 PM'],
    description: 'Certified Grade-A licensed electrician. Diagnostics for power tripping, faulty switches, short circuits, fan/light installations and safety earthing.',
    cancellation_policy: 'Free cancellation up to 2 hours before scheduled slot.',
    photos: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800', 'https://images.unsplash.com/photo-1558227691-41ea78d1f631?w=800']
  },
  {
    id: 'serv_plumbing_doorstep',
    provider_id: 'prov_plumber_1',
    issued_provider_id: 'NSO-PROV-102',
    provider_name: 'Manjunath Gowda (NSO-PROV-102)',
    title: 'Doorstep Plumbing — Tap Leaks, Blocked Drains & Pump Repair',
    category: 'Plumbing',
    price: 249,
    unit: 'visit & inspection',
    service_area: 'Bengaluru (South & Central)',
    modes: ['home_visit'],
    available_slots: ['09:30 AM - 11:30 AM', '12:00 PM - 02:00 PM', '03:00 PM - 05:00 PM', '05:30 PM - 07:30 PM'],
    description: 'Expert plumber with 6+ years experience in bathroom fittings, pipe leak repairs, flush tank overhaul, water pressure pumps, and water heater connection.',
    cancellation_policy: 'Free cancellation up to 2 hours before scheduled slot.',
    photos: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800']
  },
  {
    id: 'serv_deep_cleaning_home',
    provider_id: 'prov_cleaning_1',
    issued_provider_id: 'NSO-PROV-103',
    provider_name: 'CleanPro Solutions (NSO-PROV-103)',
    title: 'Complete Home Deep Cleaning & Hospital-Grade Sanitization',
    category: 'Cleaning',
    price: 1499,
    unit: '1/2 BHK complete',
    service_area: 'Bengaluru All Zones',
    modes: ['home_visit'],
    available_slots: ['08:30 AM - 12:30 PM', '01:30 PM - 05:30 PM'],
    description: 'Intense machine scrubbing of floors, kitchen de-greasing, bathroom descaling, balcony wash, window glass cleaning, and eco-friendly sanitization.',
    cancellation_policy: 'Free cancellation up to 4 hours before scheduled slot.',
    photos: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800']
  },
  {
    id: 'serv_ac_jet_service',
    provider_id: 'prov_ac_1',
    issued_provider_id: 'NSO-PROV-104',
    provider_name: 'Bengaluru Cool Care (NSO-PROV-104)',
    title: 'Split AC Power Jet Deep Service & Gas Leak Check',
    category: 'Appliance Care',
    price: 499,
    unit: 'per indoor/outdoor unit',
    service_area: 'Bengaluru All Zones',
    modes: ['home_visit'],
    available_slots: ['10:00 AM - 12:00 PM', '01:00 PM - 03:00 PM', '04:00 PM - 06:00 PM'],
    description: 'High pressure water jet cleaning of cooling coils and condenser, drain pipe flushing to eliminate water leakage, and free refrigerant pressure check.',
    cancellation_policy: 'Free cancellation up to 2 hours before scheduled slot.',
    photos: ['https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800']
  }
];

for (const serv of servicesToSeed) {
  const existing = db.prepare('SELECT id FROM services WHERE id = ?').get(serv.id);
  if (!existing) {
    db.prepare(`
      INSERT INTO services (
        id, provider_id, issued_provider_id, provider_name, title, category, price,
        unit, service_area, modes_json, available_slots_json, description,
        cancellation_policy, approval_status, work_photos_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?, ?)
    `).run(
      serv.id, serv.provider_id, serv.issued_provider_id, serv.provider_name, serv.title,
      serv.category, serv.price, serv.unit, serv.service_area,
      JSON.stringify(serv.modes), JSON.stringify(serv.available_slots), serv.description,
      serv.cancellation_policy, JSON.stringify(serv.photos), now, now
    );
  } else {
    db.prepare(`
      UPDATE services SET
        issued_provider_id = ?,
        provider_name = ?,
        work_photos_json = ?,
        approval_status = 'approved',
        updated_at = ?
      WHERE id = ?
    `).run(serv.issued_provider_id, serv.provider_name, JSON.stringify(serv.photos), now, serv.id);
  }
}

// 5. Repair existing bookings
const existingBookings = db.prepare('SELECT * FROM bookings').all();
for (const b of existingBookings) {
  const prov = providerProfiles.find(p => p.userId === b.provider_id || b.provider_name?.includes(p.name));
  const issuedId = prov ? prov.issuedId : 'NSO-PROV-105';
  const providerUserId = prov ? prov.userId : b.provider_id;
  const formattedName = b.provider_name?.includes('(') ? b.provider_name : `${b.provider_name} (${issuedId})`;

  db.prepare(`
    UPDATE bookings SET
      provider_id = ?,
      provider_user_id = ?,
      issued_provider_id = ?,
      provider_name = ?,
      updated_at = ?
    WHERE id = ?
  `).run(issuedId, providerUserId, issuedId, formattedName, now, b.id);
}

console.log('[REPAIR] Database repair complete! All providers, applications, services, and bookings synced.');
