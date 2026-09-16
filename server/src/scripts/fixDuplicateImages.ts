import { pool, query, setPostgresConnected } from '../db/pool';
import { FRUITS_48_LIST } from '../seedFruits';

async function fixDuplicateImages() {
  const client = await pool.connect();
  setPostgresConnected(true);

  console.log('🔧 Restoring accurate fruit images from FRUITS_48_LIST...');
  let fruitsFixed = 0;

  for (const fruit of FRUITS_48_LIST) {
    const slug = fruit.englishName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const productId = `fruit-${fruit.idNum}-${slug}`;

    // Update the fruit product with its dedicated image URL
    const res = await client.query(
      `UPDATE products 
       SET image = $1, emoji = $2
       WHERE id = $3 OR (category_id = 'fruits' AND name = $4)`,
      [fruit.imageUrl, fruit.emoji, productId, fruit.malayalamName]
    );
    if (res.rowCount && res.rowCount > 0) {
      fruitsFixed += res.rowCount;
      console.log(` ✅ Restored image for ${fruit.englishName} (${fruit.malayalamName}) -> ${fruit.imageUrl}`);
    }
  }

  // Check any remaining products with test-banana-green that are NOT banana
  console.log('\n🍌 Checking for any remaining banana fallback errors...');
  const bananaProducts = await client.query(
    `SELECT id, name, category_id, image FROM products WHERE image LIKE '%test-banana-green%'`
  );
  for (const p of bananaProducts.rows) {
    const lowerName = p.name.toLowerCase();
    const isActuallyBanana = lowerName.includes('banana') || lowerName.includes('വാഴ') || lowerName.includes('പഴം') || lowerName.includes('നേന്ത്ര') || lowerName.includes('റോബസ്റ്റ');
    if (!isActuallyBanana) {
      console.log(` ⚠️ Removing banana image from non-banana product: [${p.id}] ${p.name}`);
      // Find matching fruit from list or clear
      const match = FRUITS_48_LIST.find(f => f.malayalamName === p.name || lowerName.includes(f.englishName.toLowerCase()));
      if (match) {
        await client.query(`UPDATE products SET image = $1 WHERE id = $2`, [match.imageUrl, p.id]);
      } else {
        await client.query(`UPDATE products SET image = '' WHERE id = $2`, [p.id]);
      }
    }
  }

  // Check vegetable products with coriander fallback
  console.log('\n🌿 Checking for vegetable products with coriander leaf fallback...');
  const corianderVegs = await client.query(
    `SELECT id, name, category_id, image FROM products WHERE image = 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-veg-3136483.jpg'`
  );
  for (const v of corianderVegs.rows) {
    const lower = v.name.toLowerCase();
    const isActuallyCoriander = lower.includes('coriander') || lower.includes('മല്ലിയില') || lower.includes('മല്ലി');
    if (!isActuallyCoriander) {
      console.log(` ⚠️ Removing coriander image from non-coriander veg: [${v.id}] ${v.name}`);
      await client.query(`UPDATE products SET image = '' WHERE id = $1`, [v.id]);
    }
  }

  console.log('\n✅ Database image fixes applied successfully!');
  client.release();
}

fixDuplicateImages().then(() => process.exit(0)).catch((e) => {
  console.error('Error fixing duplicate images:', e);
  process.exit(1);
});
