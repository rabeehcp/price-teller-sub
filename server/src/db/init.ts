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
      await client.query(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS is_delivery_available BOOLEAN NOT NULL DEFAULT true;`);
      await client.query(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS delivery_radius_km DOUBLE PRECISION NOT NULL DEFAULT 8.0;`);
      await client.query(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS min_delivery_order_amount DOUBLE PRECISION NOT NULL DEFAULT 0.0;`);
      await client.query(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS estimated_delivery_time VARCHAR(100) NOT NULL DEFAULT '30-45 mins';`);
      await client.query(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS delivery_hours VARCHAR(100) NOT NULL DEFAULT '8:00 AM - 9:00 PM';`);
      await client.query(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS delivery_notes TEXT DEFAULT '';`);
      await client.query(`ALTER TABLE pre_bookings ADD COLUMN IF NOT EXISTS fulfillment_type VARCHAR(50) NOT NULL DEFAULT 'pickup';`);
      await client.query(`ALTER TABLE pre_bookings ADD COLUMN IF NOT EXISTS delivery_address TEXT;`);
      await client.query(`ALTER TABLE pre_bookings ADD COLUMN IF NOT EXISTS delivery_landmark TEXT;`);
      await client.query(`ALTER TABLE pre_bookings ADD COLUMN IF NOT EXISTS delivery_fee DOUBLE PRECISION NOT NULL DEFAULT 0.0;`);
      await client.query(`ALTER TABLE locations ADD COLUMN IF NOT EXISTS radius_km DOUBLE PRECISION NOT NULL DEFAULT 15.0;`);
      await client.query(`ALTER TABLE merchant_subscriptions ADD COLUMN IF NOT EXISTS client_id VARCHAR(100);`);
      await client.query(`ALTER TABLE merchant_subscriptions ADD COLUMN IF NOT EXISTS client_code VARCHAR(50);`);
      await client.query(`ALTER TABLE subscription_payments ADD COLUMN IF NOT EXISTS client_id VARCHAR(100);`);
      await client.query(`ALTER TABLE subscription_payments ADD COLUMN IF NOT EXISTS client_code VARCHAR(50);`);
      await client.query(`ALTER TABLE subscription_payments ADD COLUMN IF NOT EXISTS commission_paise INT DEFAULT 0;`);
      await client.query(`ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;`);
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_client_code VARCHAR(50);`);

      // Ensure client_partners and client_payouts tables exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS client_partners (
          id VARCHAR(100) PRIMARY KEY,
          client_code VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          upi_id VARCHAR(100) NOT NULL,
          commission_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 50.0,
          min_shops_threshold INT NOT NULL DEFAULT 50,
          area VARCHAR(255),
          status VARCHAR(50) NOT NULL DEFAULT 'active',
          notes TEXT,
          total_shops_count INT NOT NULL DEFAULT 0,
          total_earnings_paise BIGINT NOT NULL DEFAULT 0,
          total_paid_paise BIGINT NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Migration for existing tables: add min_shops_threshold and update default commission to 50%
      await client.query(`
        ALTER TABLE client_partners ADD COLUMN IF NOT EXISTS min_shops_threshold INT NOT NULL DEFAULT 50;
        ALTER TABLE client_partners ALTER COLUMN commission_rate_percent SET DEFAULT 50.0;
        UPDATE client_partners SET commission_rate_percent = 50.0 WHERE commission_rate_percent = 20.0;
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS client_payouts (
          id VARCHAR(100) PRIMARY KEY,
          client_id VARCHAR(100) NOT NULL REFERENCES client_partners(id) ON DELETE CASCADE,
          amount_paise INT NOT NULL CHECK (amount_paise > 0),
          payment_method VARCHAR(50) NOT NULL DEFAULT 'upi',
          upi_ref_id VARCHAR(100),
          paid_to_upi VARCHAR(100),
          notes TEXT,
          status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);



      await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_client_msg_id ON messages(conversation_id, client_msg_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(conversation_id, is_read);`);
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS uq_messages_conversation_client_msg
        ON messages (conversation_id, client_msg_id)
        WHERE client_msg_id IS NOT NULL AND client_msg_id <> ''
      `);
      // Ensure Super Admin account is always restored with secure bcrypt hash (pcart3663)
      const adminPasswordHash = await hashSeedPassword('pcart3663');
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
          adminPasswordHash,
          '+91 99999 00000',
          new Date().toISOString(),
          'tok-admin-1',
        ]
      );

      // Explicitly guarantee all admin accounts have updated bcrypt hash
      await client.query(
        `UPDATE users SET password = $1 WHERE email = 'admin@priceteller.com' OR role = 'admin'`,
        [adminPasswordHash]
      );

      // Security guarantee: hash any legacy unhashed passwords across all users in DB
      const unhashedUsers = await client.query("SELECT id, password FROM users WHERE password NOT LIKE '$2%'");
      for (const u of unhashedUsers.rows) {
        if (u.password) {
          const secureHash = await hashSeedPassword(u.password);
          await client.query('UPDATE users SET password = $1 WHERE id = $2', [secureHash, u.id]);
        }
      }

      // Ensure merchant subscription plans exist (including the ₹119 official merchant partner plan)
      await client.query(
        `INSERT INTO subscription_plans (id, name, duration_days, price_paise, currency, description, features, badge, is_active)
         VALUES 
          ('plan-starter-119', 'Merchant Partner Plan', 30, 11900, 'INR', 'Official introductory merchant access plan (₹119/Month). Each shop onboarding credits 50% commission to partner.', 
           '["Unlimited Live Price Updates", "Full Hyperlocal Catalog Sync", "Direct Customer Orders & Pre-Bookings", "POS Billing & Daily Sales Analytics", "Direct WhatsApp & Instant In-App Chat"]'::jsonb, 
           '₹119 Official Plan', true),
          ('plan-monthly', 'Monthly Pro Plan', 30, 49900, 'INR', 'Full access to Store Partner Merchant Suite for 1 month.', 
           '["Unlimited Live Price Updates", "Full Hyperlocal Catalog Sync", "Direct Customer Orders & Pre-Bookings", "POS Billing & Daily Sales Analytics", "Direct WhatsApp & Instant In-App Chat"]'::jsonb, 
           'Flexible', true),
          ('plan-6month', '6-Month Growth Plan', 180, 249900, 'INR', 'Best value store partnership with uninterrupted 6 months access.', 
           '["Everything in Monthly Plan", "Priority Store Ranking in Search", "Flash Deals Promotion Engine", "Dedicated Verified Partner Badge", "Save ₹495 vs Monthly Billing"]'::jsonb, 
           'Save 17%', true),
          ('plan-year', '1-Year Annual Partner Plan', 365, 449900, 'INR', 'Ultimate store partnership with uninterrupted 1 full year access and premium merchant perks.', 
           '["Everything in 6-Month Plan", "Full 365 Days Limit Access", "Top Priority Ranking in Search & Recommendations", "Dedicated Priority Support", "Save ₹1,489 vs Monthly Billing"]'::jsonb, 
           'Save 25%', true)
         ON CONFLICT (id) DO UPDATE SET price_paise = EXCLUDED.price_paise, is_active = true;`
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

    // Ensure demo merchant account for Al-Iqwan exists
    const iqwanShopRes = await client.query("SELECT id, name, phone, location_id FROM shops WHERE id = 'al-iqwan'");
    if (iqwanShopRes.rows.length > 0) {
      const s = iqwanShopRes.rows[0];
      const existingIqwan = await client.query(
        "SELECT id FROM users WHERE email = 'iqwan@gmail.com' OR shop_id = 'al-iqwan'"
      );
      if (existingIqwan.rowCount === 0) {
        const defaultHash = await hashSeedPassword('password123');
        await client.query(
          `INSERT INTO users (id, email, username, name, role, password, shop_id, shop_name, phone, location_id, created_at, token)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (email) DO UPDATE SET
             shop_id = EXCLUDED.shop_id,
             shop_name = EXCLUDED.shop_name`,
          [
            'usr-merchant-iqwan',
            'iqwan@gmail.com',
            'iqwan',
            'Al-Iqwan Manager',
            'merchant',
            defaultHash,
            s.id,
            s.name,
            s.phone || null,
            s.location_id || null,
            new Date().toISOString(),
            'tok-merchant-iqwan',
          ]
        );
      }
    }

    // Ensure demo consumer account for rabeehsp3663@gmail.com exists
    const existingDemoConsumer = await client.query(
      "SELECT id FROM users WHERE email = 'rabeehsp3663@gmail.com'"
    );
    if (existingDemoConsumer.rowCount === 0) {
      const defaultHash = await hashSeedPassword('password123');
      await client.query(
        `INSERT INTO users (id, email, username, name, role, password, phone, created_at, token)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (email) DO NOTHING`,
        [
          'usr-consumer-demo',
          'rabeehsp3663@gmail.com',
          'rabeeh',
          'Rabeeh CP',
          'consumer',
          defaultHash,
          '+91 98470 12345',
          new Date().toISOString(),
          'tok-consumer-demo',
        ]
      );
    }

    // Seed default active flash deals if table is empty
    const dealsCountRes = await client.query('SELECT COUNT(*) AS count FROM flash_deals');
    if (parseInt(dealsCountRes.rows[0]?.count || '0', 10) === 0) {
      const sampleDeals = [
        {
          id: 'deal-toor-dal-500',
          shop_id: 'al-iqwan',
          shop_name: 'Al-Iqwan',
          product_id: 'epeedika-grocery-778',
          product_name: '1st Thuvaraparippu / Toor Dal 500gm',
          emoji: '🫘',
          original_price: 60,
          deal_price: 42,
          discount_percentage: 30,
          unit: '500 g',
          expires_in_minutes: 360,
          tag: '⚡ സൂപ്പർ ഡീൽ'
        },
        {
          id: 'deal-bombay-mixture',
          shop_id: 'al-iqwan',
          shop_name: 'Al-Iqwan',
          product_id: 'pothys-snack-4166167',
          product_name: '24 Mantra Organic Bombay Mixture',
          emoji: '🥨',
          original_price: 38,
          deal_price: 28,
          discount_percentage: 26,
          unit: '150 g',
          expires_in_minutes: 240,
          tag: '🔥 ലിമിറ്റഡ് ഓഫർ'
        },
        {
          id: 'deal-peanut-bar',
          shop_id: 'al-iqwan',
          shop_name: 'Al-Iqwan',
          product_id: 'pothys-snack-3137597',
          product_name: '24 Mantra Organic Peanut Bar',
          emoji: '🥜',
          original_price: 50,
          deal_price: 35,
          discount_percentage: 30,
          unit: '33 g',
          expires_in_minutes: 180,
          tag: '⚡ ഫ്ലാഷ് സെയിൽ'
        },
        {
          id: 'deal-pure-coconut-oil',
          shop_id: 'al-iqwan',
          shop_name: 'Al-Iqwan',
          product_id: 'prod-coconut-oil-1l',
          product_name: 'നാടൻ ശുദ്ധ വെളിച്ചെണ്ണ (Pure Coconut Oil)',
          emoji: '🥥',
          original_price: 165,
          deal_price: 135,
          discount_percentage: 18,
          unit: '1 L',
          expires_in_minutes: 300,
          tag: '🔥 മെഗാ ഡ്രോപ്പ്'
        }
      ];
      for (const d of sampleDeals) {
        await client.query(
          `INSERT INTO flash_deals (id, shop_id, shop_name, product_id, product_name, emoji, original_price, deal_price, discount_percentage, unit, expires_in_minutes, tag)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO NOTHING`,
          [d.id, d.shop_id, d.shop_name, d.product_id, d.product_name, d.emoji, d.original_price, d.deal_price, d.discount_percentage, d.unit, d.expires_in_minutes, d.tag]
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
