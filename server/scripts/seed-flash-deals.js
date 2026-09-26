import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/priceteller'
});

async function seedFlashDeals() {
  const client = await pool.connect();
  try {
    console.log('Seeding sample active flash deals into PostgreSQL...');
    await client.query('DELETE FROM flash_deals');

    const deals = [
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

    for (const d of deals) {
      await client.query(
        `INSERT INTO flash_deals (id, shop_id, shop_name, product_id, product_name, emoji, original_price, deal_price, discount_percentage, unit, expires_in_minutes, tag)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET
          deal_price = EXCLUDED.deal_price,
          discount_percentage = EXCLUDED.discount_percentage,
          expires_in_minutes = EXCLUDED.expires_in_minutes`,
        [
          d.id,
          d.shop_id,
          d.shop_name,
          d.product_id,
          d.product_name,
          d.emoji,
          d.original_price,
          d.deal_price,
          d.discount_percentage,
          d.unit,
          d.expires_in_minutes,
          d.tag
        ]
      );
    }

    console.log('✅ 4 active flash deals successfully seeded into flash_deals table.');
  } catch (err) {
    console.error('Failed to seed flash deals:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedFlashDeals();
