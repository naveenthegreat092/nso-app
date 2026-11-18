import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'server', 'data', 'nso_marketplace.db');

const db = new DatabaseSync(dbPath);

console.log('=== RUNNING FULL END-TO-END VERIFICATION ===\n');

// 1. Check Approved Users & Stable Account IDs
const approvedUsers = db.prepare("SELECT id, name, phone, provider_status, account_id FROM users WHERE provider_status = 'approved'").all();
console.log(`[CHECK 1] Approved Provider Users: ${approvedUsers.length}`);
for (const u of approvedUsers) {
  console.log(`  - Provider: ${u.name} | User ID: ${u.id} | Stable Provider ID: ${u.account_id}`);
  if (!u.account_id) {
    throw new Error(`User ${u.id} has no account_id!`);
  }
}

// 2. Check Provider Applications
const apps = db.prepare("SELECT id, user_id, applicant_name, trade_category, status, issued_provider_id, previous_work_samples_json FROM provider_applications WHERE status = 'approved'").all();
console.log(`\n[CHECK 2] Approved Applications in Directory: ${apps.length}`);
for (const a of apps) {
  const samples = JSON.parse(a.previous_work_samples_json || '[]');
  console.log(`  - App ID: ${a.id} | Name: ${a.applicant_name} | Issued ID: ${a.issued_provider_id} | Portfolio Photos: ${samples.length}`);
  if (!a.issued_provider_id) {
    throw new Error(`Application ${a.id} missing issued_provider_id!`);
  }
}

// 3. Check Public Services & Front Page Eligibility
const services = db.prepare("SELECT id, title, provider_id, issued_provider_id, provider_name, approval_status, work_photos_json FROM services WHERE approval_status = 'approved'").all();
console.log(`\n[CHECK 3] Live Public Services: ${services.length}`);
for (const s of services) {
  const photos = JSON.parse(s.work_photos_json || '[]');
  console.log(`  - Service: "${s.title}"`);
  console.log(`    Provider Name: ${s.provider_name}`);
  console.log(`    Provider User ID: ${s.provider_id}`);
  console.log(`    Stable Provider ID: ${s.issued_provider_id}`);
  console.log(`    Work Photos Count: ${photos.length} (Eligible for public display: ${photos.length > 0})`);
  if (photos.length === 0) {
    throw new Error(`Service ${s.id} has no work photos!`);
  }
  if (!s.issued_provider_id) {
    throw new Error(`Service ${s.id} missing issued_provider_id!`);
  }
}

// 4. Check Customer Bookings & Provider Association
const bookings = db.prepare("SELECT id, booking_number, service_title, provider_id, provider_user_id, issued_provider_id, provider_name, customer_name, status FROM bookings").all();
console.log(`\n[CHECK 4] Customer Bookings: ${bookings.length}`);
for (const b of bookings) {
  console.log(`  - Booking #${b.booking_number}: ${b.service_title}`);
  console.log(`    Customer: ${b.customer_name}`);
  console.log(`    Assigned Provider: ${b.provider_name}`);
  console.log(`    Provider ID: ${b.provider_id}`);
  console.log(`    Provider User ID: ${b.provider_user_id}`);
  if (!b.provider_id.startsWith('NSO-PROV-')) {
    throw new Error(`Booking ${b.id} provider_id is not a stable provider ID: ${b.provider_id}`);
  }
}

console.log('\n✅ ALL VERIFICATION CHECKS PASSED PERFECTLY!');
