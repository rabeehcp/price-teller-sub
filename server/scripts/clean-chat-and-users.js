const { pool } = require('../dist/db/pool');
const bcrypt = require('bcryptjs');

async function cleanChatAndUsers() {
  const client = await pool.connect();
  try {
    console.log('🔄 Starting cleanup: Clearing all chat data and extra accounts...');
    await client.query('BEGIN');

    // 1. Delete all chat messages and conversations
    const delMsgRes = await client.query('DELETE FROM messages');
    const delConvRes = await client.query('DELETE FROM conversations');
    console.log(`✅ Cleared ${delMsgRes.rowCount} chat messages and ${delConvRes.rowCount} conversations.`);

    // 2. Clear pre_bookings, merchant_sales, consumer_data, subscriptions for extra users
    const preservedEmails = ['rabeehsp3663@gmail.com', 'iqwan@gmail.com', 'admin@priceteller.com'];

    await client.query(`
      DELETE FROM pre_bookings 
      WHERE consumer_id NOT IN (SELECT id FROM users WHERE email = ANY($1::text[]))
    `, [preservedEmails]);

    await client.query(`
      DELETE FROM merchant_sales 
      WHERE merchant_id NOT IN (SELECT id FROM users WHERE email = ANY($1::text[]))
    `, [preservedEmails]);

    await client.query(`
      DELETE FROM consumer_data 
      WHERE user_id NOT IN (SELECT id FROM users WHERE email = ANY($1::text[]))
    `, [preservedEmails]);

    await client.query(`
      DELETE FROM subscription_payments 
      WHERE merchant_id NOT IN (SELECT id FROM users WHERE email = ANY($1::text[]))
    `, [preservedEmails]);

    await client.query(`
      DELETE FROM merchant_subscriptions 
      WHERE merchant_id NOT IN (SELECT id FROM users WHERE email = ANY($1::text[]))
    `, [preservedEmails]);

    // 3. Delete extra users
    const delUsersRes = await client.query(`
      DELETE FROM users 
      WHERE email NOT IN (SELECT unnest($1::text[]))
    `, [preservedEmails]);
    console.log(`✅ Removed ${delUsersRes.rowCount} other user accounts.`);

    // 4. Ensure preserved accounts are properly configured
    const defaultHash = await bcrypt.hash('password123', 12);
    const now = new Date().toISOString();

    // Ensure rabeehsp3663@gmail.com exists
    await client.query(`
      INSERT INTO users (id, email, username, name, role, password, phone, created_at, token)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (email) DO UPDATE SET
        name = 'Rabeeh CP',
        role = 'consumer',
        password = $6
    `, [
      'usr-consumer-demo',
      'rabeehsp3663@gmail.com',
      'rabeeh',
      'Rabeeh CP',
      'consumer',
      defaultHash,
      '+91 98470 12345',
      now,
      'tok-consumer-demo'
    ]);

    // Ensure consumer_data exists for rabeehsp3663@gmail.com
    const rabeehUser = await client.query("SELECT id FROM users WHERE email = 'rabeehsp3663@gmail.com'");
    if (rabeehUser.rows.length > 0) {
      await client.query(`
        INSERT INTO consumer_data (user_id, basket, saved_lists, favorites, trip_history)
        VALUES ($1, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)
        ON CONFLICT (user_id) DO NOTHING
      `, [rabeehUser.rows[0].id]);
    }

    // Ensure Iqwan merchant exists and is linked to al-iqwan shop
    await client.query(`
      INSERT INTO users (id, email, username, name, role, password, shop_id, shop_name, phone, created_at, token)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (email) DO UPDATE SET
        name = 'Al-Iqwan Manager',
        role = 'merchant',
        shop_id = 'al-iqwan',
        shop_name = 'Al-Iqwan',
        password = $6
    `, [
      'usr-merchant-iqwan',
      'iqwan@gmail.com',
      'iqwan',
      'Al-Iqwan Manager',
      'merchant',
      defaultHash,
      'al-iqwan',
      'Al-Iqwan',
      '+91 98470 99999',
      now,
      'tok-merchant-iqwan'
    ]);

    // Ensure Admin exists
    await client.query(`
      INSERT INTO users (id, email, username, name, role, password, phone, created_at, token)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (email) DO UPDATE SET
        username = 'priceteller10',
        name = 'Super Admin',
        role = 'admin',
        password = $6
    `, [
      'admin-1',
      'admin@priceteller.com',
      'priceteller10',
      'Super Admin',
      'admin',
      defaultHash,
      '+91 99999 00000',
      now,
      'tok-admin-1'
    ]);

    await client.query('COMMIT');

    // 5. Verify remaining data
    const usersFinal = await client.query('SELECT id, email, username, name, role, shop_id, shop_name FROM users ORDER BY role');
    const msgCount = await client.query('SELECT COUNT(*) FROM messages');
    const convCount = await client.query('SELECT COUNT(*) FROM conversations');

    console.log('\n--- 📋 Remaining Active Accounts ---');
    console.table(usersFinal.rows);
    console.log(`\n💬 Total Chat Messages remaining: ${msgCount.rows[0].count}`);
    console.log(`💬 Total Conversations remaining: ${convCount.rows[0].count}`);
    console.log('\n🎉 Cleanup completed successfully!');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Cleanup failed:', err);
    throw err;
  } finally {
    client.release();
    process.exit(0);
  }
}

cleanChatAndUsers().catch(err => {
  console.error(err);
  process.exit(1);
});
