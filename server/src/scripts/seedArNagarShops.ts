import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../../.env') });
import { pool, query, setPostgresConnected } from '../db/pool';

async function main() {
  const client = await pool.connect();
  setPostgresConnected(true);

  console.log('🔄 Checking AR Nagar location...');
  await query(`
    INSERT INTO locations (id, name, sub_area, state, country, currency, currency_symbol, lat, lng, radius_km)
    VALUES ('ar-nagar', 'എ ആർ നഗർ (AR Nagar)', 'Town & Central Market', 'Kerala', 'India', 'INR', '₹', 11.0336, 75.9526, 15.0)
    ON CONFLICT (id) DO UPDATE SET
      name = 'എ ആർ നഗർ (AR Nagar)',
      lat = 11.0336,
      lng = 75.9526,
      radius_km = 15.0
  `);

  console.log('🔄 Seeding AR Nagar shops...');
  const arNagarShops = [
    {
      id: 'shop-arnagar-1',
      name: 'AR Nagar Supermarket',
      location_id: 'ar-nagar',
      address: 'Main Road, AR Nagar, Malappuram',
      distance_km: 0.8,
      rating: 4.8,
      review_count: 340,
      shop_type: 'supermarket',
      opening_hours: '7:30 AM - 10:00 PM',
      phone: '+91 98471 23456',
      is_verified: true,
      delivery_fee: 20,
      free_delivery_threshold: 400,
      color: '#0B8F68',
      categories: ['vegetables', 'fruits', 'staples', 'dairy', 'bakery-breakfast', 'household', 'oils-spices', 'beverages'],
      lat: 11.0340,
      lng: 75.9530,
    },
    {
      id: 'shop-arnagar-2',
      name: 'Al Madeena Hypermarket AR Nagar',
      location_id: 'ar-nagar',
      address: 'Near Bus Stand, AR Nagar',
      distance_km: 1.2,
      rating: 4.7,
      review_count: 512,
      shop_type: 'hypermarket',
      opening_hours: '8:00 AM - 10:30 PM',
      phone: '+91 98472 34567',
      is_verified: true,
      delivery_fee: 25,
      free_delivery_threshold: 500,
      color: '#2563EB',
      categories: ['vegetables', 'fruits', 'staples', 'dairy', 'bakery-breakfast', 'household', 'oils-spices', 'beverages', 'cleaning-household'],
      lat: 11.0325,
      lng: 75.9515,
    },
    {
      id: 'shop-arnagar-3',
      name: 'Kudumbashree Nattuchantha AR Nagar',
      location_id: 'ar-nagar',
      address: 'Gramapanchayat Road, AR Nagar',
      distance_km: 0.5,
      rating: 4.9,
      review_count: 185,
      shop_type: 'local_market',
      opening_hours: '6:30 AM - 8:30 PM',
      phone: '+91 98473 45678',
      is_verified: true,
      delivery_fee: 15,
      free_delivery_threshold: 300,
      color: '#10B981',
      categories: ['vegetables', 'fruits', 'staples', 'dairy', 'oils-spices'],
      lat: 11.0345,
      lng: 75.9520,
    },
  ];

  for (const s of arNagarShops) {
    await query(`
      INSERT INTO shops (id, name, location_id, address, distance_km, rating, review_count, shop_type, opening_hours, phone, is_verified, delivery_fee, free_delivery_threshold, color, categories, lat, lng)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        location_id = EXCLUDED.location_id,
        address = EXCLUDED.address,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count,
        shop_type = EXCLUDED.shop_type,
        is_verified = true,
        delivery_fee = EXCLUDED.delivery_fee,
        free_delivery_threshold = EXCLUDED.free_delivery_threshold,
        lat = EXCLUDED.lat,
        lng = EXCLUDED.lng
    `, [
      s.id, s.name, s.location_id, s.address, s.distance_km, s.rating, s.review_count,
      s.shop_type, s.opening_hours, s.phone, s.is_verified, s.delivery_fee,
      s.free_delivery_threshold, s.color, JSON.stringify(s.categories), s.lat, s.lng
    ]);
    console.log(`✅ Seeded shop: ${s.name}`);
  }

  console.log('🔄 Populating product prices for AR Nagar shops...');
  const prodsRes = await query(`SELECT id, category_id, prices, stock_status FROM products`);
  const products = prodsRes.rows;
  console.log(`Found ${products.length} products to populate.`);

  let updatedCount = 0;
  for (const p of products) {
    const prices = p.prices || {};
    const stockStatus = p.stock_status || {};

    // Determine baseline price
    const existingPriceList = Object.values(prices).filter((v: any) => typeof v === 'number' && v > 0) as number[];
    let base = existingPriceList.length > 0 ? Math.round(existingPriceList.reduce((a, b) => a + b, 0) / existingPriceList.length) : 40;
    if (base <= 0) base = 35;

    const cat = (p.category_id || '').toLowerCase();
    const isVegOrFruit = cat.includes('veg') || cat.includes('fruit');
    const isSnackOrBev = cat.includes('snack') || cat.includes('bev') || cat.includes('biscuit');

    // 1. AR Nagar Supermarket
    const arSuperPrice = base;
    prices['AR Nagar Supermarket'] = arSuperPrice;
    stockStatus['AR Nagar Supermarket'] = 'in_stock';

    // 2. Al Madeena Hypermarket (cheaper on packaged/snacks/groceries, standard on produce)
    const madeenaPrice = isSnackOrBev ? Math.max(10, Math.round(base * 0.94)) : Math.round(base * 1.02);
    prices['Al Madeena Hypermarket AR Nagar'] = madeenaPrice;
    stockStatus['Al Madeena Hypermarket AR Nagar'] = 'in_stock';

    // 3. Kudumbashree Nattuchantha (significantly cheaper on fresh veggies & fruits, staples)
    if (isVegOrFruit || cat.includes('staple') || cat.includes('grain') || cat.includes('rice')) {
      const kudumbaPrice = Math.max(10, Math.round(base * 0.88));
      prices['Kudumbashree Nattuchantha AR Nagar'] = kudumbaPrice;
      stockStatus['Kudumbashree Nattuchantha AR Nagar'] = 'in_stock';
    } else {
      prices['Kudumbashree Nattuchantha AR Nagar'] = base;
      stockStatus['Kudumbashree Nattuchantha AR Nagar'] = 'in_stock';
    }

    await query(`UPDATE products SET prices = $1, stock_status = $2 WHERE id = $3`, [
      JSON.stringify(prices),
      JSON.stringify(stockStatus),
      p.id
    ]);
    updatedCount++;
  }

  console.log(`✅ Successfully updated prices and stock status for ${updatedCount} products across AR Nagar shops!`);

  // Verify
  const shopCheck = await query(`SELECT count(*) FROM shops WHERE location_id = 'ar-nagar'`);
  console.log(`Verified AR Nagar shops in db: ${shopCheck.rows[0].count}`);

  client.release();
  process.exit(0);
}

main().catch(err => {
  console.error('Failed to seed AR Nagar shops:', err);
  process.exit(1);
});
