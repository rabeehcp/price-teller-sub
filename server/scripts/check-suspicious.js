const { pool } = require('../dist/db/pool');

async function detailedCheck() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, name, category_id FROM products ORDER BY category_id, name');

    // 1. Check vegetables: anything that is not fresh vegetable?
    const vegs = res.rows.filter(r => r.category_id === 'vegetables');
    const suspiciousVegs = vegs.filter(r => {
      const n = r.name.toLowerCase();
      return /\b(oil|masala|powder|soap|biscuit|juice|tea|coffee|paste|pickle|cleaner)\b/i.test(n);
    });
    console.log(`Suspicious in vegetables (${suspiciousVegs.length}):`);
    console.table(suspiciousVegs);

    // 2. Check fruits: anything that is not fresh fruit?
    const fruits = res.rows.filter(r => r.category_id === 'fruits');
    const suspiciousFruits = fruits.filter(r => {
      const n = r.name.toLowerCase();
      return /\b(oil|masala|powder|soap|biscuit|juice|tea|coffee|paste|pickle|cleaner|jam)\b/i.test(n);
    });
    console.log(`\nSuspicious in fruits (${suspiciousFruits.length}):`);
    console.table(suspiciousFruits);

    // 3. Check dairy: anything that is not dairy or eggs?
    const dairy = res.rows.filter(r => r.category_id === 'dairy');
    const suspiciousDairy = dairy.filter(r => {
      const n = r.name.toLowerCase();
      return /\b(soap|biscuit|shampoo|detergent|masala|oil|pickle|cleaner|popcorn|chip|snack)\b/i.test(n);
    });
    console.log(`\nSuspicious in dairy (${suspiciousDairy.length}):`);
    console.table(suspiciousDairy);

    // 4. Check cleaning-household: anything that is edible food?
    const cleaning = res.rows.filter(r => r.category_id === 'cleaning-household');
    const suspiciousCleaning = cleaning.filter(r => {
      const n = r.name.toLowerCase();
      return /\b(rice|dal|milk|tea|coffee|biscuit|juice|curd|oil|sugar|salt)\b/i.test(n) &&
        !/\b(detergent|cleaner|harpic|lizol|soap|dishwash|vim|exo|pril|surf|rin|wheel|ariel|camphor|incense)\b/i.test(n);
    });
    console.log(`\nSuspicious in cleaning (${suspiciousCleaning.length}):`);
    console.table(suspiciousCleaning);

    // 5. Check personal-care: anything that is food/edible?
    const pc = res.rows.filter(r => r.category_id === 'personal-care');
    const suspiciousPC = pc.filter(r => {
      const n = r.name.toLowerCase();
      return /\b(rice|dal|milk|tea|coffee|biscuit|juice|curd|sugar|salt|pickle|atta|maida|oats)\b/i.test(n) &&
        !/\b(soap|shampoo|oil|hair|face|toothpaste|cream|lotion|talc|wash|scrub|body|bath|shower)\b/i.test(n);
    });
    console.log(`\nSuspicious in personal care (${suspiciousPC.length}):`);
    console.table(suspiciousPC);

    // 6. Check beverages: anything that is not a drink?
    const bev = res.rows.filter(r => r.category_id === 'beverages');
    const suspiciousBev = bev.filter(r => {
      const n = r.name.toLowerCase();
      return /\b(baking\s*soda|soap|detergent|shampoo|rice|atta|maida|dal|oil|cleaner)\b/i.test(n);
    });
    console.log(`\nSuspicious in beverages (${suspiciousBev.length}):`);
    console.table(suspiciousBev);

    // 7. Check rice-grains: anything that is not rice/grains/flours?
    const rice = res.rows.filter(r => r.category_id === 'rice-grains');
    const suspiciousRice = rice.filter(r => {
      const n = r.name.toLowerCase();
      return /\b(soap|shampoo|detergent|cleaner|oregano|seasoning|herb|tea|coffee)\b/i.test(n);
    });
    console.log(`\nSuspicious in rice-grains (${suspiciousRice.length}):`);
    console.table(suspiciousRice);

  } finally {
    client.release();
    process.exit(0);
  }
}

detailedCheck().catch(err => {
  console.error(err);
  process.exit(1);
});
