import pg from 'pg';

let pool = null;
let syncTimeout = null;
let lastSyncTime = null;
let isSyncing = false;

const SYNC_TABLES = [
  'users',
  'products',
  'services',
  'orders',
  'bookings',
  'seller_applications',
  'provider_applications',
  'service_categories',
  'special_requests',
  'marketplace_settings',
  'commission_ledger',
  'audit_logs',
  'chat_messages',
  'device_tokens'
];

/**
 * Initialize PostgreSQL / Supabase synchronization
 */
export async function initPostgresSync(db) {
  // Prevent automated test fixtures from mutating production Supabase database
  if (process.env.NODE_ENV === 'test') {
    return false;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('[Supabase Sync] No DATABASE_URL configured. Running in local SQLite mode.');
    return false;
  }

  try {
    pool = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000
    });

    // Ensure metadata sync table exists in Supabase
    await pool.query(`
      CREATE TABLE IF NOT EXISTS nso_cloud_sync (
        table_name TEXT PRIMARY KEY,
        rows JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('✅ [Supabase Sync] Connected to PostgreSQL cloud database.');

    // ── 1. Hydrate / Restore from Cloud on Startup ──────────────────────────
    try {
      const { rows: cloudTables } = await pool.query('SELECT table_name, rows, updated_at FROM nso_cloud_sync');
      let restoredCount = 0;

      for (const record of cloudTables) {
        const tableName = record.table_name;
        const cloudRows = record.rows;

        if (!SYNC_TABLES.includes(tableName) || !Array.isArray(cloudRows) || cloudRows.length === 0) {
          continue;
        }

        // Check if table exists in local SQLite
        try {
          const localCount = db.prepare(`SELECT count(*) as count FROM ${tableName}`).get().count;

          // If cloud has data and local has fewer rows, restore from cloud
          if (cloudRows.length > localCount) {
            const sample = cloudRows[0];
            const columns = Object.keys(sample);
            const placeholders = columns.map(() => '?').join(', ');
            const stmt = db.prepare(`INSERT OR REPLACE INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`);

            for (const item of cloudRows) {
              const values = columns.map((col) => (item[col] === undefined ? null : item[col]));
              stmt.run(...values);
            }

            console.log(`📥 [Supabase Sync] Restored ${tableName}: ${cloudRows.length} rows imported to SQLite.`);
            restoredCount++;
          }
        } catch (tableErr) {
          console.warn(`[Supabase Sync] Skip restore for ${tableName}:`, tableErr.message);
        }
      }

      if (restoredCount > 0) {
        console.log(`🚀 [Supabase Sync] Initial restore complete (${restoredCount} tables synchronized).`);
      }
    } catch (restoreErr) {
      console.warn('[Supabase Sync] Cloud restore check failed:', restoreErr.message);
    }

    // ── 2. Initial backup push if local has data ────────────────────────────
    triggerCloudSync(db, 2000);

    // ── 3. Flush on graceful exit ───────────────────────────────────────────
    process.on('SIGTERM', async () => {
      console.log('[Supabase Sync] Flushing state before shutdown...');
      await flushCloudSync(db);
    });
    process.on('SIGINT', async () => {
      console.log('[Supabase Sync] Flushing state before shutdown...');
      await flushCloudSync(db);
    });

    return true;
  } catch (err) {
    console.warn('⚠️ [Supabase Sync] Failed to connect to PostgreSQL:', err.message);
    pool = null;
    return false;
  }
}

/**
 * Trigger debounced cloud sync (call this after any write/mutation)
 */
export function triggerCloudSync(db, delayMs = 3500) {
  if (!pool) return;
  if (syncTimeout) clearTimeout(syncTimeout);

  syncTimeout = setTimeout(() => {
    flushCloudSync(db).catch((err) => {
      console.warn('[Supabase Sync] Background sync failed:', err.message);
    });
  }, delayMs);
}

/**
 * Immediately flush all local tables to Supabase PostgreSQL
 */
export async function flushCloudSync(db) {
  if (!pool || isSyncing) return;
  isSyncing = true;

  try {
    for (const tableName of SYNC_TABLES) {
      try {
        const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
        if (rows && rows.length > 0) {
          await pool.query(
            `INSERT INTO nso_cloud_sync (table_name, rows, updated_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (table_name) DO UPDATE
             SET rows = EXCLUDED.rows, updated_at = NOW();`,
            [tableName, JSON.stringify(rows)]
          );
        }
      } catch (tableErr) {
        // Table might not exist or be empty
      }
    }
    lastSyncTime = new Date().toISOString();
  } catch (err) {
    console.warn('[Supabase Sync] Flush error:', err.message);
  } finally {
    isSyncing = false;
  }
}

/**
 * Get sync status report for admin dashboard / health check
 */
export function getCloudSyncStatus(db) {
  const isConnected = pool !== null;
  const tableCounts = {};

  if (db) {
    for (const t of SYNC_TABLES) {
      try {
        tableCounts[t] = db.prepare(`SELECT count(*) as count FROM ${t}`).get().count;
      } catch {
        tableCounts[t] = 0;
      }
    }
  }

  return {
    provider: isConnected ? 'Supabase PostgreSQL' : 'Local SQLite Only',
    connected: isConnected,
    lastSyncTime,
    monitoredTables: SYNC_TABLES.length,
    tableCounts
  };
}
