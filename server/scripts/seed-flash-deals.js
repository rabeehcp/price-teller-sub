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
        id: 'deal-matta-rice-5kg',
        shop_id: 'al-iqwan',
        shop_name: 'Al-Iqwan',
        product_id: 'zeev-159355',
        product_name: 'Matta Short Grain Rice 5 kg',
        emoji: '🌾',
        original_price: 359,
        deal_price: 339,
        discount_percentage: 6,
        unit: '5 kg',
        expires_in_minutes: 360,
        tag: '⚡ സൂപ്പർ ഡീൽ'
      },
      {
        id: 'deal-sadya-palada',
        shop_id: 'al-iqwan',
        shop_name: 'Al-Iqwan',
        product_id: 'zeev-palada-200',
        product_name: 'Tasty Nibbles Kerala Instant Sadya Palada Payasam Mix 200 g',
        emoji: '🥣',
        original_price: 95,
        deal_price: 49,
        discount_percentage: 48,
        unit: '200 g',
        expires_in_minutes: 240,
        tag: '🔥 48% OFF'
      },
      {
        id: 'deal-goodday-cookies',
        shop_id: 'al-iqwan',
        shop_name: 'Al-Iqwan',
        product_id: 'zeev-goodday-487',
        product_name: 'Britannia Goodday Fruit & Nut Cookies 487.5 g',
        emoji: '🍪',
        original_price: 200,
        deal_price: 99,
        discount_percentage: 51,
        unit: '487.5 g',
        expires_in_minutes: 180,
        tag: '🔥 50% OFF'
      },
      {
        id: 'deal-coconut-oil-1l',
        shop_id: 'al-iqwan',
        shop_name: 'Al-Iqwan',
        product_id: 'prod-coconut-oil-1l',
        product_name: 'നാടൻ ശുദ്ധ വെളിച്ചെണ്ണ (Pure Coconut Oil)',
        emoji: '🥥',
        original_price: 215,
        deal_price: 175,
        discount_percentage: 19,
        unit: '1 L',
        expires_in_minutes: 300,
        tag: '🔥 മെഗാ ഡ്രോപ്പ്'
      },
      {
        id: 'deal-horlicks-750g',
        shop_id: 'al-iqwan',
        shop_name: 'Al-Iqwan',
        product_id: 'zeev-horlicks-750',
        product_name: 'Horlicks Health & Nutrition Drink - Classic Malt 750 g',
        emoji: '🥛',
        original_price: 360,
        deal_price: 349,
        discount_percentage: 3,
        unit: '750 g',
        expires_in_minutes: 360,
        tag: '⚡ സ്പെഷ്യൽ'
      },
      {
        id: 'deal-boost-750g',
        shop_id: 'al-iqwan',
        shop_name: 'Al-Iqwan',
        product_id: 'zeev-151587',
        product_name: 'Boost Nutrition Drink Pouch 750 g',
        emoji: '⚡',
        original_price: 370,
        deal_price: 349,
        discount_percentage: 6,
        unit: '750 g',
        expires_in_minutes: 240,
        tag: '⚡ എനർജി ഡീൽ'
      },
      {
        id: 'deal-toor-dal-1kg',
        shop_id: 'al-iqwan',
        shop_name: 'Al-Iqwan',
        product_id: 'epeedika-grocery-778',
        product_name: '1st Thuvaraparippu / Toor Dal 500gm',
        emoji: '🫘',
        original_price: 95,
        deal_price: 72,
        discount_percentage: 24,
        unit: '500 g',
        expires_in_minutes: 360,
        tag: '⚡ നിത്യോപയോഗം'
      },
      {
        id: 'deal-aashirvaad-atta-5kg',
        shop_id: 'al-iqwan',
        shop_name: 'Al-Iqwan',
        product_id: 'atta',
        product_name: 'Aashirvaad Superior MP Atta (5 kg)',
        emoji: '🌾',
        original_price: 320,
        deal_price: 275,
        discount_percentage: 14,
        unit: '5 kg',
        expires_in_minutes: 300,
        tag: '🔥 ബെസ്റ്റ് പ്രൈസ്'
      },
      {
        id: 'deal-ujala-detergent-4kg',
        shop_id: 'al-iqwan',
        shop_name: 'Al-Iqwan',
        product_id: 'zeev-ujala-4kg',
        product_name: 'Ujala IDD Detergent Powder 4 Kg + 1 Kg Free',
        emoji: '🧺',
        original_price: 460,
        deal_price: 420,
        discount_percentage: 9,
        unit: '5 kg',
        expires_in_minutes: 240,
        tag: '⚡ 1 Kg സൗജന്യം'
      },
      {
        id: 'deal-head-shoulders-340',
        shop_id: 'al-iqwan',
        shop_name: 'Al-Iqwan',
        product_id: 'zeev-hs-340',
        product_name: 'Head & Shoulders 7 In 1 Anti-Dandruff Shampoo 340 ml',
        emoji: '🧴',
        original_price: 479,
        deal_price: 239,
        discount_percentage: 50,
        unit: '340 ml',
        expires_in_minutes: 180,
        tag: '🔥 50% ഇളവ്'
      },
      {
        id: 'deal-real-juice-1l',
        shop_id: 'al-iqwan',
        shop_name: 'Al-Iqwan',
        product_id: 'zeev-real-juice',
        product_name: 'Real Mixed Fruit Vitamin Boost Juice 1 L',
        emoji: '🧃',
        original_price: 150,
        deal_price: 79,
        discount_percentage: 47,
        unit: '1 L',
        expires_in_minutes: 240,
        tag: '🔥 47% OFF'
      },
      {
        id: 'deal-semiya-payasam',
        shop_id: 'al-iqwan',
        shop_name: 'Al-Iqwan',
        product_id: 'zeev-151762',
        product_name: 'Double Horse Payasam Mix - Instant Semiya 300 g',
        emoji: '🥣',
        original_price: 89,
        deal_price: 75,
        discount_percentage: 16,
        unit: '300 g',
        expires_in_minutes: 300,
        tag: '⚡ പായസം ഡീൽ'
      },
      {
        id: 'deal-dove-lotion-400',
        shop_id: 'al-iqwan',
        shop_name: 'Al-Iqwan',
        product_id: 'zeev-46323',
        product_name: 'Dove Nourishment Radiance Rich Body Lotion 400 ml',
        emoji: '🧴',
        original_price: 620,
        deal_price: 549,
        discount_percentage: 11,
        unit: '400 ml',
        expires_in_minutes: 360,
        tag: '⚡ ഗ്ലോ ഡീൽ'
      },
      {
        id: 'deal-bombay-mixture',
        shop_id: 'al-iqwan',
        shop_name: 'Al-Iqwan',
        product_id: 'pothys-snack-4166167',
        product_name: '24 Mantra Organic Bombay Mixture',
        emoji: '🥨',
        original_price: 65,
        deal_price: 48,
        discount_percentage: 26,
        unit: '150 g',
        expires_in_minutes: 240,
        tag: '🔥 ഓർഗാനിക്'
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
        id: 'deal-ariel-liquid-4l',
        shop_id: 'al-iqwan',
        shop_name: 'Al-Iqwan',
        product_id: 'zeev-ariel-4l',
        product_name: 'Ariel Matic Liquid Detergent Top Load 4 L',
        emoji: '🧼',
        original_price: 765,
        deal_price: 399,
        discount_percentage: 48,
        unit: '4 L',
        expires_in_minutes: 240,
        tag: '🔥 48% OFF'
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
