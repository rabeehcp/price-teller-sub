import { pool, query, setPostgresConnected } from '../db/pool';

export async function unlistNonCoreFromShops() {
  console.log('📦 Connecting to PostgreSQL...');
  const client = await pool.connect();
  setPostgresConnected(true);

  // 1. Check current stats
  const totalBefore = await client.query('SELECT COUNT(*) FROM products');
  const alIqwanBefore = await client.query(
    `SELECT COUNT(*) FROM products WHERE (prices->>'Al-Iqwan')::numeric > 0`
  );
  console.log(`📊 Before unlisting:`);
  console.log(`   - Total products in master database: ${totalBefore.rows[0].count}`);
  console.log(`   - Products listed in Al-Iqwan: ${alIqwanBefore.rows[0].count}`);

  // 2. Perform the unlisting:
  // Unlist:
  // - All newly added Pothys snacks/chocolates ('pothys-snack-%')
  // - All items without valid images (image IS NULL OR TRIM(image) = '')
  // - Non-core non-grocery categories (personal-care, utensils, storage-containers, electronics, household)
  //
  // Keep their accurate selling price preserved under 'Master Catalog' so merchants
  // can re-list them anytime with one click from MasterCatalogPickerModal!
  console.log('🔄 Unlisting newly added snacks/chocolates, image-less items, and non-core items from shop store-fronts...');

  const updateResult = await client.query(`
    UPDATE products
    SET 
      prices = jsonb_build_object(
        'Master Catalog', 
        COALESCE(
          (prices->>'Al-Iqwan')::numeric, 
          (prices->>'Malabar supermarker')::numeric, 
          (prices->>'HP STORE')::numeric, 
          (prices->>'Master Catalog')::numeric,
          50
        )
      ),
      stock_status = '{}'::jsonb,
      last_updated = NOW()
    WHERE id LIKE 'pothys-snack%' 
       OR image IS NULL 
       OR TRIM(image) = ''
       OR category_id IN ('personal-care', 'utensils', 'storage-containers', 'electronics', 'household')
  `);

  console.log(`✅ Updated & unlisted ${updateResult.rowCount} products from shop inventories.`);

  // 3. Check stats after unlisting
  const totalAfter = await client.query('SELECT COUNT(*) FROM products');
  const alIqwanCarried = await client.query(
    `SELECT COUNT(*) FROM products WHERE (prices->>'Al-Iqwan')::numeric > 0`
  );
  const alIqwanMasterUnlisted = await client.query(
    `SELECT COUNT(*) FROM products WHERE (prices->>'Al-Iqwan') IS NULL OR (prices->>'Al-Iqwan')::numeric <= 0`
  );
  const malabarCarried = await client.query(
    `SELECT COUNT(*) FROM products WHERE (prices->>'Malabar supermarker')::numeric > 0`
  );

  console.log('\n=========================================');
  console.log('🎉 Catalog Distribution Summary:');
  console.log(`   - Total products in Master Catalog: ${totalAfter.rows[0].count}`);
  console.log(`   - Available in Master Catalog to add for Al-Iqwan: ${alIqwanMasterUnlisted.rows[0].count} (1500+)`);
  console.log(`   - Core shopping products listed in Al-Iqwan: ${alIqwanCarried.rows[0].count}`);
  console.log(`   - Core shopping products listed in Malabar Supermarket: ${malabarCarried.rows[0].count}`);
  console.log('=========================================\n');

  // Breakdown of remaining core grocery products in Al-Iqwan
  const breakdown = await client.query(`
    SELECT category_id, COUNT(*) 
    FROM products 
    WHERE (prices->>'Al-Iqwan')::numeric > 0
    GROUP BY category_id 
    ORDER BY count DESC
  `);
  console.log('🛒 Category breakdown of core shopping products remaining in shop:');
  console.table(breakdown.rows);

  client.release();
}

if (require.main === module || process.argv[1]?.includes('unlistNonCoreFromShops')) {
  unlistNonCoreFromShops()
    .then(() => {
      console.log('✅ Catalog successfully adjusted.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Failed to adjust catalog:', err);
      process.exit(1);
    });
}
