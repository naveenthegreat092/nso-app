import pg from 'pg';

const { Client } = pg;

async function migrate() {
  const client = new Client({
    host: 'aws-0-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.dzzinexgdvaqqbssdrib',
    password: 'usnd06250826@#_&-+()/',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  console.log('Connecting to Supabase PostgreSQL at aws-0-ap-southeast-1.pooler.supabase.com...');
  await client.connect();
  console.log('Connected successfully!');

  await client.query(`
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
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      phone TEXT NOT NULL,
      is_admin INTEGER NOT NULL DEFAULT 0,
      created_at BIGINT NOT NULL,
      expires_at BIGINT NOT NULL,
      revoked INTEGER NOT NULL DEFAULT 0,
      ip_address TEXT
    );

    CREATE TABLE IF NOT EXISTS otp_verifications (
      phone TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      expires_at BIGINT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      locked_until BIGINT NOT NULL DEFAULT 0,
      created_at BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS seller_applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
      submitted_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS provider_applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      applicant_name TEXT NOT NULL,
      applicant_phone TEXT NOT NULL,
      trade_category TEXT NOT NULL,
      experience_years INTEGER NOT NULL DEFAULT 0,
      hourly_rate NUMERIC NOT NULL DEFAULT 0,
      service_area TEXT DEFAULT 'Bengaluru',
      resume_text TEXT,
      previous_work TEXT,
      id_proof_type TEXT,
      id_proof_number TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      issued_provider_id TEXT,
      admin_notes TEXT,
      reviewed_at TEXT,
      submitted_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      seller_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      seller_name TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      price NUMERIC NOT NULL,
      original_price NUMERIC NOT NULL,
      discount_percentage INTEGER NOT NULL DEFAULT 0,
      image TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      delivery_estimate_days INTEGER NOT NULL DEFAULT 2,
      regional_delivery_fee NUMERIC NOT NULL DEFAULT 0,
      variants_json TEXT NOT NULL DEFAULT '[]',
      description TEXT NOT NULL,
      highlights_json TEXT NOT NULL DEFAULT '[]',
      approval_status TEXT NOT NULL DEFAULT 'pending_approval',
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      provider_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider_name TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      price NUMERIC NOT NULL,
      unit TEXT NOT NULL DEFAULT 'visit & inspection',
      service_area TEXT NOT NULL DEFAULT 'Bengaluru',
      modes_json TEXT NOT NULL DEFAULT '["home_visit"]',
      available_slots_json TEXT NOT NULL DEFAULT '[]',
      description TEXT NOT NULL,
      cancellation_policy TEXT NOT NULL,
      approval_status TEXT NOT NULL DEFAULT 'pending_approval',
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      items_json TEXT NOT NULL,
      subtotal NUMERIC NOT NULL,
      seller_delivery_charge NUMERIC NOT NULL,
      platform_fee NUMERIC NOT NULL DEFAULT 0,
      coupon_discount NUMERIC NOT NULL DEFAULT 0,
      tip_amount NUMERIC NOT NULL DEFAULT 0,
      total NUMERIC NOT NULL,
      order_status TEXT NOT NULL DEFAULT 'confirmed',
      payment_status TEXT NOT NULL DEFAULT 'pending',
      payment_method TEXT NOT NULL,
      payment_gateway_order_id TEXT,
      payment_gateway_payment_id TEXT,
      delivery_address TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      booking_number TEXT UNIQUE NOT NULL,
      service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
      service_title TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      provider_name TEXT NOT NULL,
      customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      service_mode TEXT NOT NULL DEFAULT 'home_visit',
      customer_address TEXT NOT NULL,
      total_price NUMERIC NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      payment_status TEXT NOT NULL DEFAULT 'pending',
      cancellation_terms TEXT,
      revised_quote_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS commission_ledger (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      reference_id TEXT NOT NULL,
      gross_amount NUMERIC NOT NULL,
      commission_rate NUMERIC NOT NULL,
      commission_amount NUMERIC NOT NULL,
      payout_amount NUMERIC NOT NULL,
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
      customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      estimated_budget NUMERIC NOT NULL,
      target_timeline TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'submitted',
      admin_notes TEXT,
      admin_quotation NUMERIC,
      created_at TEXT NOT NULL
    );
  `);

  // Insert default owner account
  await client.query(`
    INSERT INTO users (id, phone, name, email, active_role, is_admin, approval_status, seller_status, provider_status, house_number, street_number, landmark, city, pincode, address, created_at, updated_at)
    VALUES (
      'usr_owner_seed',
      '8310421121',
      'NSO Owner',
      'owner@nso.in',
      'admin',
      1,
      'approved',
      'approved',
      'approved',
      'HQ-01',
      'Orbital Way',
      'MG Road Central',
      'Bengaluru',
      '560001',
      'NSO Executive Orbit HQ, MG Road, Bengaluru - 560001',
      '2026-11-07T00:00:00.000Z',
      '2026-11-07T00:00:00.000Z'
    )
    ON CONFLICT (phone) DO UPDATE SET is_admin = 1, approval_status = 'approved';
  `);

  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
  console.log('✅ Successfully migrated tables in Supabase:');
  for (const row of tables.rows) {
    console.log('  - ' + row.table_name);
  }

  await client.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
