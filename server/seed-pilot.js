/**
 * NSO Pilot Data Seeder
 * Seeds realistic Bengaluru pilot listings: Products & Certified Services
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'nso_marketplace.db');

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON;');

console.log('[NSO SEEDER] Starting pilot catalog seed...');

// 1. Ensure Verified Seller User
const sellerId = 'seller_blr_retail_1';
const sellerPhone = '9845012345';
const sellerName = 'Orbit Retail Hub (Indiranagar)';

const existingSeller = db.prepare('SELECT id FROM users WHERE id = ? OR phone = ?').get(sellerId, sellerPhone);
if (!existingSeller) {
  db.prepare(`
    INSERT INTO users (id, phone, name, email, active_role, is_admin, approval_status, seller_status, provider_status, house_number, street_number, landmark, city, pincode, address, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'seller', 0, 'approved', 'approved', 'none', '12', '100ft Road', 'Near Metro', 'Bengaluru', '560038', 'Shop 12, 100ft Road, Indiranagar, Bengaluru - 560038', datetime('now'), datetime('now'))
  `).run(sellerId, sellerPhone, sellerName, 'orbit.retail@nso.in');
}

// 2. Ensure Verified Service Providers
const providers = [
  {
    id: 'prov_electrician_1',
    phone: '9845067890',
    name: 'Suresh Kumar',
    trade: 'Electrical',
    rate: 299,
    years: 8
  },
  {
    id: 'prov_plumber_1',
    phone: '9845067891',
    name: 'Manjunath Gowda',
    trade: 'Plumbing',
    rate: 249,
    years: 6
  },
  {
    id: 'prov_cleaning_1',
    phone: '9845067892',
    name: 'CleanPro Solutions',
    trade: 'Cleaning',
    rate: 1499,
    years: 5
  },
  {
    id: 'prov_ac_1',
    phone: '9845067893',
    name: 'Bengaluru Cool Care',
    trade: 'Appliance Care',
    rate: 499,
    years: 7
  }
];

for (const p of providers) {
  const exists = db.prepare('SELECT id FROM users WHERE id = ? OR phone = ?').get(p.id, p.phone);
  if (!exists) {
    db.prepare(`
      INSERT INTO users (id, phone, name, email, active_role, is_admin, approval_status, seller_status, provider_status, city, pincode, address, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'provider', 0, 'approved', 'none', 'approved', 'Bengaluru', '560001', 'Bengaluru Central Service Hub', datetime('now'), datetime('now'))
    `).run(p.id, p.phone, p.name, `${p.id}@nso.in`);
  }
}

// 3. Products Data
const products = [
  {
    id: 'prod_boat_earbuds',
    seller_id: sellerId,
    seller_name: sellerName,
    title: 'boAt Airdopes 141 ANC TWS Earbuds (42H Playtime, Fast Charge)',
    category: 'Electronics',
    price: 1499,
    original_price: 4490,
    discount_percentage: 66,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    stock: 25,
    delivery_estimate_days: 1,
    regional_delivery_fee: 0,
    variants: [
      { id: 'v1', name: 'Bold Black', inStock: true },
      { id: 'v2', name: 'Cider Cyan', inStock: true },
      { id: 'v3', name: 'Pure White', inStock: true }
    ],
    description: 'Immerse in your playlist with Active Noise Cancellation up to 32dB. Features ENx tech for crystal clear calls and Beast Mode 50ms low latency.',
    highlights: ['32 dB Active Noise Cancellation', '42 Hours Total Playtime', 'ASAP Charge: 10 mins = 150 mins', 'IPX5 Water & Sweat Resistance']
  },
  {
    id: 'prod_smartwatch_pulse',
    seller_id: sellerId,
    seller_name: sellerName,
    title: 'Noise ColorFit Pulse 2 Max 1.85" Display BT Calling Smartwatch',
    category: 'Electronics',
    price: 1999,
    original_price: 5999,
    discount_percentage: 66,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80',
    stock: 18,
    delivery_estimate_days: 1,
    regional_delivery_fee: 0,
    variants: [
      { id: 'v1', name: 'Jet Black', inStock: true },
      { id: 'v2', name: 'Deep Wine', inStock: true }
    ],
    description: 'Massive 1.85" TFT LCD screen with 550 nits brightness. Bluetooth calling with built-in mic and speaker, 100 sports modes, and 10-day battery life.',
    highlights: ['1.85" Bright Display (550 nits)', 'Direct Bluetooth Calling', '100 Sports Tracking Modes', 'Noise Health Suite with SpO2']
  },
  {
    id: 'prod_wildcraft_bag',
    seller_id: sellerId,
    seller_name: sellerName,
    title: 'Wildcraft Trail 28L Water-Resistant Everyday Backpack',
    category: 'Fashion',
    price: 1299,
    original_price: 2199,
    discount_percentage: 40,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    stock: 30,
    delivery_estimate_days: 2,
    regional_delivery_fee: 40,
    variants: [
      { id: 'v1', name: 'Slate Grey', inStock: true },
      { id: 'v2', name: 'Navy Blue', inStock: true }
    ],
    description: 'Ergonomically designed backpack with multi-level organizer and dedicated 15.6 inch laptop sleeve. Made of durable water-repellent polyester fabric.',
    highlights: ['28 Litres Capacity', 'Dedicated 15.6" Laptop Compartment', 'Water Repellent Polyester Fabric', 'Ergonomic Air-Mesh Back Support']
  },
  {
    id: 'prod_a2_milk',
    seller_id: sellerId,
    seller_name: sellerName,
    title: 'Akshayakalpa Organic Farm Fresh A2 Cow Milk (1 Litre Glass Bottle)',
    category: 'Groceries',
    price: 85,
    original_price: 95,
    discount_percentage: 10,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
    stock: 50,
    delivery_estimate_days: 1,
    regional_delivery_fee: 0,
    variants: [
      { id: 'v1', name: '1 Litre Bottle', inStock: true }
    ],
    description: 'Certified organic whole pasteurized cow milk sourced directly from free-grazing native Indian cows. Free from synthetic hormones, antibiotics, and chemicals.',
    highlights: ['100% Certified Organic A2 Milk', 'Untouched by Human Hands', 'Delivered Chilled at 4°C', 'Eco-friendly Glass Bottle Returnable']
  },
  {
    id: 'prod_alphonso_mango',
    seller_id: sellerId,
    seller_name: sellerName,
    title: 'Fresh GI-Tagged Ratnagiri Alphonso Mangoes (1 Dozen Box - ~2.8kg)',
    category: 'Groceries',
    price: 899,
    original_price: 1299,
    discount_percentage: 30,
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
    stock: 15,
    delivery_estimate_days: 1,
    regional_delivery_fee: 0,
    variants: [
      { id: 'v1', name: '1 Dozen (~2.8kg)', inStock: true }
    ],
    description: 'Naturally ripened carbide-free authentic Ratnagiri Hapus mangoes. Rich aromatic golden pulp with extraordinary natural sweetness.',
    highlights: ['100% Naturally Ripened', 'Zero Chemicals & Zero Carbide', 'GI Tagged Authentic Ratnagiri Hapus', 'Carefully Packed in Hay Crates']
  },
  {
    id: 'prod_philips_mixer',
    seller_id: sellerId,
    seller_name: sellerName,
    title: 'Philips Daily Collection 750W Mixer Grinder with 4 Jars',
    category: 'Home & Living',
    price: 2899,
    original_price: 4295,
    discount_percentage: 32,
    image: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600&auto=format&fit=crop&q=80',
    stock: 12,
    delivery_estimate_days: 2,
    regional_delivery_fee: 0,
    variants: [
      { id: 'v1', name: 'Standard (White/Purple)', inStock: true }
    ],
    description: 'Tough motor with air ventilation for continuous heavy grinding. Includes 4 leak-proof stainless steel jars for wet, dry, chutney and juicer grinding.',
    highlights: ['750 Watt Heavy Duty Motor', '4 Stainless Steel Multi-Utility Jars', 'Advanced Air Ventilation System', '2-Year Brand Warranty']
  }
];

// Insert or update products
for (const prod of products) {
  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(prod.id);
  if (!existing) {
    db.prepare(`
      INSERT INTO products (id, seller_id, seller_name, title, category, price, original_price, discount_percentage, image, stock, delivery_estimate_days, regional_delivery_fee, variants_json, description, highlights_json, approval_status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', datetime('now'), datetime('now'))
    `).run(
      prod.id,
      prod.seller_id,
      prod.seller_name,
      prod.title,
      prod.category,
      prod.price,
      prod.original_price,
      prod.discount_percentage,
      prod.image,
      prod.stock,
      prod.delivery_estimate_days,
      prod.regional_delivery_fee,
      JSON.stringify(prod.variants),
      prod.description,
      JSON.stringify(prod.highlights)
    );
  } else {
    db.prepare(`
      UPDATE products SET approval_status = 'approved', price = ?, original_price = ?, stock = ? WHERE id = ?
    `).run(prod.price, prod.original_price, prod.stock, prod.id);
  }
}
console.log(`[NSO SEEDER] Seeded ${products.length} pilot products.`);

// 4. Services Data
const services = [
  {
    id: 'serv_electrician_inspection',
    provider_id: 'prov_electrician_1',
    provider_name: 'Suresh Kumar (NSO-PROV-101)',
    title: 'Certified Electrician — Home Inspection, Wiring & MCB Repair',
    category: 'Electrical',
    price: 299,
    unit: 'visit & inspection',
    service_area: 'Bengaluru (East & Central)',
    modes: ['home_visit'],
    available_slots: ['09:00 AM - 11:00 AM', '11:30 AM - 01:30 PM', '02:30 PM - 04:30 PM', '05:00 PM - 07:00 PM'],
    description: 'Certified Grade-A licensed electrician. Diagnostics for power tripping, faulty switches, short circuits, fan/light installations and safety earthing.',
    cancellation_policy: 'Free cancellation up to 2 hours before scheduled slot.'
  },
  {
    id: 'serv_plumbing_doorstep',
    provider_id: 'prov_plumber_1',
    provider_name: 'Manjunath Gowda (NSO-PROV-102)',
    title: 'Doorstep Plumbing — Tap Leaks, Blocked Drains & Pump Repair',
    category: 'Plumbing',
    price: 249,
    unit: 'visit & inspection',
    service_area: 'Bengaluru (South & Central)',
    modes: ['home_visit'],
    available_slots: ['09:30 AM - 11:30 AM', '12:00 PM - 02:00 PM', '03:00 PM - 05:00 PM', '05:30 PM - 07:30 PM'],
    description: 'Expert plumber with 6+ years experience in bathroom fittings, pipe leak repairs, flush tank overhaul, water pressure pumps, and water heater connection.',
    cancellation_policy: 'Free cancellation up to 2 hours before scheduled slot.'
  },
  {
    id: 'serv_deep_cleaning_home',
    provider_id: 'prov_cleaning_1',
    provider_name: 'CleanPro Solutions (NSO-PROV-103)',
    title: 'Complete Home Deep Cleaning & Hospital-Grade Sanitization',
    category: 'Cleaning',
    price: 1499,
    unit: '1/2 BHK complete',
    service_area: 'Bengaluru All Zones',
    modes: ['home_visit'],
    available_slots: ['08:30 AM - 12:30 PM', '01:30 PM - 05:30 PM'],
    description: 'Intense machine scrubbing of floors, kitchen de-greasing, bathroom descaling, balcony wash, window glass cleaning, and eco-friendly sanitization.',
    cancellation_policy: 'Free cancellation up to 4 hours before scheduled slot.'
  },
  {
    id: 'serv_ac_jet_service',
    provider_id: 'prov_ac_1',
    provider_name: 'Bengaluru Cool Care (NSO-PROV-104)',
    title: 'Split AC Power Jet Deep Service & Gas Leak Check',
    category: 'Appliance Care',
    price: 499,
    unit: 'per indoor/outdoor unit',
    service_area: 'Bengaluru All Zones',
    modes: ['home_visit'],
    available_slots: ['10:00 AM - 12:00 PM', '01:00 PM - 03:00 PM', '04:00 PM - 06:00 PM'],
    description: 'High pressure water jet cleaning of cooling coils and condenser, drain pipe flushing to eliminate water leakage, and free refrigerant pressure check.',
    cancellation_policy: 'Free cancellation up to 2 hours before scheduled slot.'
  }
];

// Insert or update services
for (const serv of services) {
  const existing = db.prepare('SELECT id FROM services WHERE id = ?').get(serv.id);
  if (!existing) {
    db.prepare(`
      INSERT INTO services (id, provider_id, provider_name, title, category, price, unit, service_area, modes_json, available_slots_json, description, cancellation_policy, approval_status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', datetime('now'), datetime('now'))
    `).run(
      serv.id,
      serv.provider_id,
      serv.provider_name,
      serv.title,
      serv.category,
      serv.price,
      serv.unit,
      serv.service_area,
      JSON.stringify(serv.modes),
      JSON.stringify(serv.available_slots),
      serv.description,
      serv.cancellation_policy
    );
  } else {
    db.prepare(`
      UPDATE services SET approval_status = 'approved', price = ? WHERE id = ?
    `).run(serv.price, serv.id);
  }
}
console.log(`[NSO SEEDER] Seeded ${services.length} pilot services.`);
console.log('[NSO SEEDER] ✅ Pilot catalog seeding complete!');
