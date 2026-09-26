require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('../dist/db/pool');

async function main() {
  console.log('--- Step 1: Fixing known individual outliers ---');
  await pool.query("UPDATE products SET category_id = 'oils-sugar' WHERE id = 'epeedika-grocery-2301'");
  await pool.query("UPDATE products SET category_id = 'spices' WHERE id = 'epeedika-grocery-2568'");
  console.log('Updated Baking Soda and Oregano.');

  console.log('\n--- Step 2: Checking all items in biscuits-snacks ---');
  const res = await pool.query("SELECT id, name, category_id FROM products WHERE category_id = 'biscuits-snacks'");
  console.log(`Total products currently in biscuits-snacks: ${res.rows.length}`);

  // Patterns that definitely do NOT belong in biscuits-snacks
  const rules = [
    // Beverages
    { regex: /\b(tea|coffee|juice|squash|syrup|bournvita|horlicks|boost|complan|glucon[- ]d|tang|rasna|green tea|black tea)\b/i, target: 'beverages' },
    // Oils & Sugar
    { regex: /\b(refined oil|sunflower oil|mustard oil|coconut oil|gingelly oil|sesame oil|palmolein|sugar|jaggery|baking soda|baking powder|rock salt|crystal salt|table salt)\b/i, target: 'oils-sugar' },
    // Spices & Seasonings
    { regex: /\b(masala|turmeric|chilli powder|coriander powder|pepper powder|cumin|mustard seeds|fenugreek|cardamom|cloves|cinnamon|garam masala|meat masala|chicken masala|fish masala|sambar powder|rasam powder|curry powder|perungayam|asafoetida)\b/i, target: 'spices' },
    // Sauces & Condiments
    { regex: /\b(pickle|sauce|ketchup|mayonnaise|jam|spread|vinegar|chutney|paste)\b/i, target: 'sauces-condiments' },
    // Rice & Grains
    { regex: /\b(rice|atta|maida|sooji|rava|poha|aval|wheat|dalia|vermicelli|semiya)\b/i, target: 'rice-grains' },
    // Pulses & Legumes
    { regex: /\b(dal|gram|chana|moong|urad|rajma|toor|lentil|soya chunks|green gram|black gram)\b/i, target: 'pulses-legumes' },
    // Cleaning & Household
    { regex: /\b(detergent|cleaner|harpic|dettol|vim|ariel|surf excel|rin|tide|comfort|lizol|colin|dishwash|scrubber|mop|broom|bleach|mosquito|hit|goodknight|all out|odonil|aer)\b/i, target: 'cleaning-household' },
    // Personal Care
    { regex: /\b(soap|shampoo|conditioner|toothpaste|toothbrush|body wash|facewash|cream|lotion|talc|deodorant|perfume|hair oil|shaving|razor|sanitary|pads)\b/i, target: 'personal-care' },
    // Dairy
    { regex: /\b(paneer|curd|yogurt|cheese slice|cheese cube|condensed milk|dairy whitener|fresh milk)\b/i, target: 'dairy' }
  ];

  // Specific snack exclusions where words like "cream" or "tea" are in the snack title (e.g. Bourbon Choco Cream, Britannia Tea Cake, Tea Rusk)
  function isLegitSnack(name) {
    const lower = name.toLowerCase();
    if (lower.includes('biscuit') || lower.includes('cookie') || lower.includes('rusk') || 
        lower.includes('cake') || lower.includes('wafer') || lower.includes('puff') || 
        lower.includes('chips') || lower.includes('crisps') || lower.includes('namkeen') || 
        lower.includes('mixture') || lower.includes('popcorn') || lower.includes('chocolate') ||
        lower.includes('candy') || lower.includes('toffee') || lower.includes('bar') ||
        lower.includes('snack') || lower.includes('crackers')) {
      return true;
    }
    return false;
  }

  const moves = [];
  for (const row of res.rows) {
    if (isLegitSnack(row.name)) {
      continue;
    }
    for (const rule of rules) {
      if (rule.regex.test(row.name)) {
        moves.push({ id: row.id, name: row.name, target: rule.target });
        break;
      }
    }
  }

  console.log(`Found ${moves.length} products to move out of biscuits-snacks:`);
  for (const m of moves) {
    console.log(`  -> Moving "${m.name}" to "${m.target}"`);
    await pool.query('UPDATE products SET category_id = $1 WHERE id = $2', [m.target, m.id]);
  }

  console.log('\n--- Step 3: Current Category Counts in Database ---');
  const catRes = await pool.query(`
    SELECT c.id, c.name, COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.id, c.name
    ORDER BY product_count DESC
  `);
  console.table(catRes.rows);

  console.log('\nAudit and updates completed successfully.');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
