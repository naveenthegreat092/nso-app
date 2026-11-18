import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'server', 'data', 'nso_marketplace.db');

const db = new DatabaseSync(dbPath);

console.log('=== USERS WITH PROVIDER STATUS ===');
const provs = db.prepare("SELECT id, phone, name, provider_status, account_id FROM users WHERE provider_status = 'approved'").all();
console.log(provs);

console.log('\n=== PROVIDER APPLICATIONS ===');
const apps = db.prepare('SELECT * FROM provider_applications').all();
console.log(apps);

console.log('\n=== SERVICES ===');
const services = db.prepare('SELECT id, provider_id, provider_name, title, category, price, approval_status, work_photos_json FROM services').all();
console.log(services);

console.log('\n=== BOOKINGS ===');
const bookings = db.prepare('SELECT id, booking_number, service_id, service_title, provider_id, provider_name, customer_id, customer_name, status FROM bookings').all();
console.log(bookings);
