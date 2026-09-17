import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { pool, setPostgresConnected } from './pool';
import { ALL_SYSTEM_CATEGORIES } from '../seedAllCatalogProducts';

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$/;

async function hashSeedPassword(password: string): Promise<string> {
  return BCRYPT_HASH_PATTERN.test(password) ? password : bcrypt.hash(password, 12);
}

const BASELINE_LOCATIONS = [
  { id: 'tirur', name: 'Tirur', subArea: 'Town & Central Market', state: 'Kerala', country: 'India', currency: 'INR', currencySymbol: '₹', lat: 10.9155, lng: 75.9238, radiusKm: 15.0 },
  { id: 'tirur-bpangadi', name: 'Tirur - BP Angadi', subArea: 'South Junction', state: 'Kerala', country: 'India', currency: 'INR', currencySymbol: '₹', lat: 10.9022, lng: 75.9351, radiusKm: 12.0 },
  { id: 'tanur', name: 'Tanur', subArea: 'Coastal Harbour Road', state: 'Kerala', country: 'India', currency: 'INR', currencySymbol: '₹', lat: 10.9744, lng: 75.8672, radiusKm: 15.0 },
  { id: 'kottakkal', name: 'Kottakkal', subArea: 'Ayurveda Town & Changuvetty', state: 'Kerala', country: 'India', currency: 'INR', currencySymbol: '₹', lat: 10.9991, lng: 76.0024, radiusKm: 15.0 },
  { id: 'parappanangadi', name: 'Parappanangadi', subArea: 'Railway Station Road', state: 'Kerala', country: 'India', currency: 'INR', currencySymbol: '₹', lat: 11.0478, lng: 75.8606, radiusKm: 15.0 },
  { id: 'areekode', name: 'Areekode', subArea: 'Town & River Junction', state: 'Kerala', country: 'India', currency: 'INR', currencySymbol: '₹', lat: 11.2384, lng: 76.0504, radiusKm: 15.0 },
  { id: 'malappuram', name: 'Malappuram', subArea: 'District HQ & Kizhakkethala', state: 'Kerala', country: 'India', currency: 'INR', currencySymbol: '₹', lat: 11.0510, lng: 76.0711, radiusKm: 15.0 },
  { id: 'manjeri', name: 'Manjeri', subArea: 'Court Road & Commercial Capital', state: 'Kerala', country: 'India', currency: 'INR', currencySymbol: '₹', lat: 11.1200, lng: 76.1200, radiusKm: 15.0 },
  { id: 'perinthalmanna', name: 'Perinthalmanna', subArea: 'Hospital City & Commercial Hub', state: 'Kerala', country: 'India', currency: 'INR', currencySymbol: '₹', lat: 10.9765, lng: 76.2269, radiusKm: 15.0 },
  { id: 'nilambur', name: 'Nilambur', subArea: 'Teak City & Railway Station', state: 'Kerala', country: 'India', currency: 'INR', currencySymbol: '₹', lat: 11.2855, lng: 76.2386, radiusKm: 15.0 },
  { id: 'ponnani', name: 'Ponnani', subArea: 'Port City & Harbour', state: 'Kerala', country: 'India', currency: 'INR', currencySymbol: '₹', lat: 10.7700, lng: 75.9000, radiusKm: 15.0 },
  { id: 'kondotty', name: 'Kondotty', subArea: 'Airport City & Vaidyar Smarakam', state: 'Kerala', country: 'India', currency: 'INR', currencySymbol: '₹', lat: 11.1467, lng: 75.9621, radiusKm: 15.0 },
  { id: 'kizhisseri', name: 'Kizhisseri', subArea: 'Kondotty - Areekode Highway', state: 'Kerala', country: 'India', currency: 'INR', currencySymbol: '₹', lat: 11.1895, lng: 76.0142, radiusKm: 15.0 },
  { id: 'pookkottur', name: 'Pookkottur', subArea: 'Calicut - Malappuram Highway', state: 'Kerala', country: 'India', currency: 'INR', currencySymbol: '₹', lat: 11.1012, lng: 76.0425, radiusKm: 15.0 },
  { id: 'vazhikkadavu', name: 'Vazhikkadavu', subArea: 'Nilambur - Gudalur Checkpost', state: 'Kerala', country: 'India', currency: 'INR', currencySymbol: '₹', lat: 11.3852, lng: 76.3314, radiusKm: 15.0 },
  { id: 'karuvarakundu', name: 'Karuvarakundu', subArea: 'Silent Valley Foothills', state: 'Kerala', country: 'India', currency: 'INR', currencySymbol: '₹', lat: 11.1415, lng: 76.3350, radiusKm: 15.0 },
];

export async function initDb(): Promise<boolean> {
  console.log('🔄 Checking PostgreSQL connection...');
  let client;
  try {
    client = await pool.connect();
    setPostgresConnected(true);
    console.log('✅ Connected to PostgreSQL database successfully.');

    // Read and apply schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      await client.query(schemaSql);
      // Ensure columns and indexes exist
      await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS image TEXT;`);
      await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false;`);
      await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS client_msg_id VARCHAR(100);`);
      await client.query(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;`);
      await client.query(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;`);
      await client.query(`ALTER TABLE locations ADD COLUMN IF NOT EXISTS radius_km DOUBLE PRECISION NOT NULL DEFAULT 15.0;`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_client_msg_id ON messages(conversation_id, client_msg_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(conversation_id, is_read);`);
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS uq_messages_conversation_client_msg
        ON messages (conversation_id, client_msg_id)
        WHERE client_msg_id IS NOT NULL AND client_msg_id <> ''
      `);
      // Ensure Super Admin account is always restored
      await client.query(
        `INSERT INTO users (id, email, username, name, role, password, phone, created_at, token)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (email) DO UPDATE SET
           username = EXCLUDED.username,
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           password = EXCLUDED.password,
           phone = EXCLUDED.phone,
           token = EXCLUDED.token`,
        [
          'admin-1',
          'admin@priceteller.com',
          'priceteller10',
          'Super Admin',
          'admin',
          await hashSeedPassword('password123'),
          '+91 99999 00000',
          new Date().toISOString(),
          'tok-admin-1',
        ]
      );

      // Ensure merchant subscription plans exist
      await client.query(
        `INSERT INTO subscription_plans (id, name, duration_days, price_paise, currency, description, features, badge, is_active)
         VALUES 
          ('plan-monthly', 'Monthly Pro Plan', 30, 49900, 'INR', 'Full access to Store Partner Merchant Suite for 1 month.', 
           '["Unlimited Live Price Updates", "Full Hyperlocal Catalog Sync", "Direct Customer Orders & Pre-Bookings", "POS Billing & Daily Sales Analytics", "Direct WhatsApp & Instant In-App Chat"]'::jsonb, 
           'Flexible', true),
          ('plan-6month', '6-Month Growth Plan', 180, 249900, 'INR', 'Best value store partnership with uninterrupted 6 months access.', 
           '["Everything in Monthly Plan", "Priority Store Ranking in Search", "Flash Deals Promotion Engine", "Dedicated Verified Partner Badge", "Save ₹495 vs Monthly Billing"]'::jsonb, 
           'Save 17%', true),
          ('plan-year', '1-Year Annual Partner Plan', 365, 449900, 'INR', 'Ultimate store partnership with uninterrupted 1 full year access and premium merchant perks.', 
           '["Everything in 6-Month Plan", "Full 365 Days Limit Access", "Top Priority Ranking in Search & Recommendations", "Dedicated Priority Support", "Save ₹1,489 vs Monthly Billing"]'::jsonb, 
           'Save 25%', true)
         ON CONFLICT (id) DO NOTHING;`
      );

      console.log('✅ PostgreSQL tables verified, subscription plans, and Super Admin account active.');
    }

    // Baseline Locations
    for (const loc of BASELINE_LOCATIONS) {
      await client.query(
        `INSERT INTO locations (id, name, sub_area, state, country, currency, currency_symbol, lat, lng, radius_km)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [
          loc.id,
          loc.name,
          loc.subArea,
          loc.state,
          loc.country,
          loc.currency,
          loc.currencySymbol,
          loc.lat,
          loc.lng,
          loc.radiusKm,
        ]
      );
    }

    // Baseline Categories
    for (const cat of ALL_SYSTEM_CATEGORIES) {
      await client.query(
        `INSERT INTO categories (id, name, slug, icon, description)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [cat.id, cat.name, cat.slug, cat.icon, cat.description]
      );
    }

    // Ensure all shops in PostgreSQL have an associated merchant login account
    const shopsRes = await client.query('SELECT id, name, phone, location_id FROM shops');
    for (const s of shopsRes.rows) {
      const existingUser = await client.query(
        'SELECT id FROM users WHERE shop_id = $1 OR email = $2',
        [s.id, `${s.id}@gmail.com`]
      );
      if (existingUser.rowCount === 0) {
        const defaultHash = await hashSeedPassword('password123');
        await client.query(
          `INSERT INTO users (id, email, username, name, role, password, shop_id, shop_name, phone, location_id, created_at, token)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (email) DO UPDATE SET
             username = EXCLUDED.username,
             shop_id = EXCLUDED.shop_id,
             shop_name = EXCLUDED.shop_name`,
          [
            `usr-merchant-${s.id}`,
            `${s.id}@gmail.com`,
            s.id,
            `${s.name} Manager`,
            'merchant',
            defaultHash,
            s.id,
            s.name,
            s.phone || null,
            s.location_id || null,
            new Date().toISOString(),
            `tok-merchant-${s.id}`,
          ]
        );
      }
    }

    console.log('🎉 PostgreSQL clean locations, categories, and Super Admin synced.');
    client.release();
    return true;
  } catch (error: any) {
    if (client) client.release();
    setPostgresConnected(false);
    console.error(`❌ Fatal: PostgreSQL connection failed: ${error.message || 'Connection refused'}`);
    console.error(`👉 Ensure PostgreSQL is running and check DATABASE_URL in server/.env.`);
    throw error;
  }
}

if (require.main === module) {
  initDb()
    .then((ok) => {
      process.exit(ok ? 0 : 1);
    })
    .catch((err) => {
      console.error('Fatal initialization error:', err);
      process.exit(1);
    });
}
