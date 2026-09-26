const { pool } = require('../dist/db/pool');
const { classifyProduct } = require('./classify-master-catalog');

async function reclassifyAllProducts() {
  const client = await pool.connect();
  try {
    console.log('🔄 Fetching all products from database for deep category analysis...');
    const res = await client.query('SELECT id, name, category_id FROM products ORDER BY name');
    console.log(`📦 Total products in catalog: ${res.rows.length}`);

    const updates = [];
    const unchanged = [];

    for (const p of res.rows) {
      const targetCategory = classifyProduct(p.name, p.category_id);
      if (targetCategory !== p.category_id) {
        updates.push({
          id: p.id,
          name: p.name,
          oldCategory: p.category_id,
          newCategory: targetCategory,
        });
      } else {
        unchanged.push(p);
      }
    }

    console.log(`\n🎯 Analysis results:`);
    console.log(`   - Correctly categorized products: ${unchanged.length}`);
    console.log(`   - Products to fix: ${updates.length}`);

    // Grouping summary
    const summary = {};
    for (const u of updates) {
      const key = `${u.oldCategory} ➜ ${u.newCategory}`;
      summary[key] = (summary[key] || 0) + 1;
    }

    console.log('\n📊 Category Correction Flow:');
    console.table(summary);

    console.log('\n🔍 Sample 25 Corrections:');
    console.table(updates.slice(0, 25));

    if (updates.length > 0) {
      console.log(`\n💾 Applying ${updates.length} category fixes to PostgreSQL...`);
      await client.query('BEGIN');

      let updatedCount = 0;
      for (const u of updates) {
        await client.query('UPDATE products SET category_id = $1 WHERE id = $2', [
          u.newCategory,
          u.id,
        ]);
        updatedCount++;
      }

      await client.query('COMMIT');
      console.log(`✅ Successfully updated ${updatedCount} products in PostgreSQL!`);

      // Print new category distribution
      const distRes = await client.query(`
        SELECT category_id, COUNT(*) as count 
        FROM products 
        GROUP BY category_id 
        ORDER BY count DESC
      `);
      console.log('\n📋 New Accurate Category Distribution:');
      console.table(distRes.rows);
    } else {
      console.log('✨ All products are already 100% correctly categorized!');
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error updating categories:', err);
    throw err;
  } finally {
    client.release();
    process.exit(0);
  }
}

reclassifyAllProducts().catch(err => {
  console.error(err);
  process.exit(1);
});
