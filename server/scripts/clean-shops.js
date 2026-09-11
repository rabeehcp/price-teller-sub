const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/[\?&]sslmode=[^&]+/, '') : null;

async function runCleanup() {
  console.log('=== Cleaning Database to Keep ONLY Al-Iqwan in PostgreSQL ===');

  // Clean PostgreSQL
  if (dbUrl) {
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });

    try {
      console.log('Connecting to PostgreSQL...');
      const client = await pool.connect();
      console.log('Connected to PostgreSQL.');

      await client.query('BEGIN');

      // Check current shops
      const allShopsRes = await client.query('SELECT id, name FROM shops');
      console.log('Current PostgreSQL shops:', allShopsRes.rows);

      // Ensure Al-Iqwan exists in Postgres
      await client.query(`
        INSERT INTO shops (id, name, location_id, address, distance_km, rating, review_count, shop_type, opening_hours, phone, is_verified, delivery_fee, free_delivery_threshold, color, categories)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          location_id = EXCLUDED.location_id,
          address = EXCLUDED.address,
          phone = EXCLUDED.phone,
          is_verified = true
      `, [
        'al-iqwan',
        'Al-Iqwan',
        'areekode',
        'South puthalam , Areakode',
        1.2,
        4.8,
        1,
        'supermarket',
        '8:00 AM - 10:00 PM',
        '9898989898',
        true,
        30,
        500,
        '#2563eb',
        JSON.stringify(["vegetables", "fruits", "staples", "dairy", "bakery-breakfast", "household", "oils-spices"])
      ]);

      // Remove dependent tables data for other shops
      await client.query(`DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE shop_id != 'al-iqwan')`);
      await client.query(`DELETE FROM conversations WHERE shop_id != 'al-iqwan'`);
      await client.query(`DELETE FROM pre_bookings WHERE shop_id != 'al-iqwan'`);
      await client.query(`DELETE FROM flash_deals WHERE shop_id != 'al-iqwan'`);
      await client.query(`DELETE FROM price_reports WHERE shop_id != 'al-iqwan'`);
      
      // Delete merchant users of other shops
      await client.query(`DELETE FROM users WHERE role = 'merchant' AND (shop_id IS NULL OR shop_id != 'al-iqwan')`);

      // Delete all shops except al-iqwan
      const delShopsRes = await client.query(`DELETE FROM shops WHERE id != 'al-iqwan'`);
      console.log(`Deleted ${delShopsRes.rowCount} other shops from PostgreSQL.`);

      // Update product prices & stock_status in PostgreSQL to only keep Al-Iqwan
      const prodsRes = await client.query('SELECT id, prices, stock_status FROM products');
      for (const row of prodsRes.rows) {
        let prices = typeof row.prices === 'string' ? JSON.parse(row.prices || '{}') : (row.prices || {});
        let stock = typeof row.stock_status === 'string' ? JSON.parse(row.stock_status || '{}') : (row.stock_status || {});

        const cleanPrices = {};
        const cleanStock = {};

        if (prices['Al-Iqwan'] !== undefined) {
          cleanPrices['Al-Iqwan'] = prices['Al-Iqwan'];
        } else if (prices['al-iqwan'] !== undefined) {
          cleanPrices['Al-Iqwan'] = prices['al-iqwan'];
        } else if (Object.keys(prices).length > 0) {
          cleanPrices['Al-Iqwan'] = Object.values(prices)[0];
        }

        if (stock['Al-Iqwan']) {
          cleanStock['Al-Iqwan'] = stock['Al-Iqwan'];
        } else {
          cleanStock['Al-Iqwan'] = 'in_stock';
        }

        await client.query(
          'UPDATE products SET prices = $1, stock_status = $2 WHERE id = $3',
          [JSON.stringify(cleanPrices), JSON.stringify(cleanStock), row.id]
        );
      }
      console.log(`Updated ${prodsRes.rowCount} products to only have Al-Iqwan prices.`);

      await client.query('COMMIT');
      client.release();

      const finalShops = await pool.query('SELECT id, name, location_id FROM shops');
      console.log('Final PostgreSQL Shops:', finalShops.rows);

      const finalUsers = await pool.query('SELECT id, name, email, role, shop_id FROM users');
      console.log('Final PostgreSQL Users:', finalUsers.rows);

    } catch (pgErr) {
      console.error('PostgreSQL cleanup error:', pgErr);
    } finally {
      await pool.end();
    }
  }

  console.log('=== All Done! ===');
}

runCleanup().catch(console.error);
