/**
 * Seed Pending Applications into NSO SQLite database
 * Generates Customer registrations, Seller applications, and Provider applications
 */
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'nso_marketplace.db');

const db = new DatabaseSync(dbPath);

console.log('[NSO] Seeding pending applications...');

// Safe column migrations
try { db.exec('ALTER TABLE provider_applications ADD COLUMN profile_photo TEXT;'); } catch (_) {}
try { db.exec('ALTER TABLE provider_applications ADD COLUMN id_document_photo TEXT;'); } catch (_) {}

// 1. Pending Customer Registrations
const custStmt = db.prepare(`
  INSERT OR REPLACE INTO users (
    id, phone, name, email, active_role, is_admin, approval_status,
    house_number, street_number, landmark, city, pincode, address, created_at, updated_at
  ) VALUES (?, ?, ?, ?, 'customer', 0, 'pending', ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`);

custStmt.run(
  'usr_cust_pending_1',
  '9845112233',
  'Ananya Sharma',
  'ananya.sharma@gmail.com',
  'Flat 304, Green Glen Layout',
  'Outer Ring Road, Bellandur',
  'Behind Central Mall',
  'Bengaluru',
  '560103',
  'Flat 304, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru - 560103'
);

custStmt.run(
  'usr_cust_pending_2',
  '9741234567',
  'Karthik Raman',
  'karthik.raman@outlook.com',
  '#42, 12th Main Road',
  '4th Block, Koramangala',
  'Near Sony World Junction',
  'Bengaluru',
  '560034',
  '#42, 12th Main Road, 4th Block, Koramangala, Bengaluru - 560034'
);

// 2. Pending Seller User & Application
const selUserStmt = db.prepare(`
  INSERT OR REPLACE INTO users (
    id, phone, name, email, active_role, is_admin, approval_status, seller_status, address, created_at, updated_at
  ) VALUES (?, ?, ?, ?, 'customer', 0, 'approved', 'pending', ?, datetime('now'), datetime('now'))
`);
selUserStmt.run(
  'usr_seller_applicant_1',
  '9845098765',
  'Vikram Mehta',
  'vikram.mehta@blr-electronics.in',
  '#88, Brigade Road, Ashok Nagar, Bengaluru - 560025'
);

const selAppStmt = db.prepare(`
  INSERT OR REPLACE INTO seller_applications (
    id, user_id, applicant_name, applicant_phone, store_name, business_type,
    gstin, address, product_category, status, submitted_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
`);
selAppStmt.run(
  'app_sel_seed_1',
  'usr_seller_applicant_1',
  'Vikram Mehta',
  '+91 9845098765',
  'Bengaluru Electronics & Gadgets Hub',
  'Retail & Wholesale Electronics',
  '29ABCDE1234F1Z5',
  '#88, Brigade Road, Ashok Nagar, Bengaluru - 560025',
  'Electronics & Home Appliances'
);

// 3. Pending Provider Applications
const prvUserStmt = db.prepare(`
  INSERT OR REPLACE INTO users (
    id, phone, name, email, active_role, is_admin, approval_status, provider_status, created_at, updated_at
  ) VALUES (?, ?, ?, ?, 'customer', 0, 'approved', 'pending', datetime('now'), datetime('now'))
`);
prvUserStmt.run('usr_prv_applicant_1', '9900112244', 'Rajesh Sharma', 'rajesh.sharma@nso-services.in');
prvUserStmt.run('usr_prv_applicant_2', '9886001122', 'Mohammed Farooq', 'mohammed.farooq@nso-services.in');

const prvAppStmt = db.prepare(`
  INSERT OR REPLACE INTO provider_applications (
    id, user_id, applicant_name, applicant_phone, trade_category, experience_years,
    hourly_rate, service_area, resume_text, previous_work, id_proof_type, id_proof_number,
    profile_photo, id_document_photo, status, submitted_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
`);

prvAppStmt.run(
  'app_prv_seed_1',
  'usr_prv_applicant_1',
  'Rajesh Sharma',
  '+91 9900112244',
  'Electrical',
  7,
  350,
  'Indiranagar, Domlur, Koramangala',
  'Certified Wireman with 7+ years of experience in residential wiring and DB box servicing.',
  'Specialist in full house wiring, 3-phase load calculation, emergency short circuit repair.',
  'Aadhaar Card',
  'XXXX-XXXX-4589',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500'
);

prvAppStmt.run(
  'app_prv_seed_2',
  'usr_prv_applicant_2',
  'Mohammed Farooq',
  '+91 9886001122',
  'Plumbing',
  5,
  299,
  'Whitefield, Marathahalli, Bellandur',
  'Expert plumber handling leak detection, pressure pump installation, sanitary fittings.',
  'Repaired 400+ residential pipelines across East Bengaluru.',
  'Voter ID',
  'KA-04-XXXX912',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500'
);

console.log('✅ Successfully seeded pending applications into database!');
