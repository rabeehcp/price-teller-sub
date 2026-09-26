const { pool } = require('../dist/db/pool');
const fs = require('fs');

async function audit() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, name, category_id FROM products ORDER BY category_id, name');
    
    // Check biscuits-snacks specifically
    const snacks = res.rows.filter(r => r.category_id === 'biscuits-snacks');
    console.log(`Auditing ${snacks.length} products in biscuits-snacks...`);

    // Detect non-snack keywords in biscuits-snacks:
    const nonSnackTerms = [
      { term: 'oil', cat: 'oils-sugar', rx: /\b(oil|velichenna|gingelly|sunflower)\b/i },
      { term: 'ghee', cat: 'dairy', rx: /\b(ghee|neyyu)\b/i },
      { term: 'tea', cat: 'beverages', rx: /\b(tea|chai|chaya)\b/i },
      { term: 'coffee', cat: 'beverages', rx: /\b(coffee|kappi|bru|nescafe)\b/i },
      { term: 'masala', cat: 'spices', rx: /\b(masala|sambar|rasam|turmeric|coriander\s*powder|chilli\s*powder)\b/i },
      { term: 'dal', cat: 'pulses-legumes', rx: /\b(toor\s*dal|moong\s*dal|urad\s*dal|chana\s*dal|masoor\s*dal|parippu)\b/i },
      { term: 'rice', cat: 'rice-grains', rx: /\b(matta|basmati|biryani\s*rice|ponni|raw\s*rice)\b/i },
      { term: 'flour', cat: 'rice-grains', rx: /\b(atta|maida|wheat\s*flour|rice\s*flour|puttu\s*podi|appam\s*podi)\b/i },
      { term: 'soap', cat: 'personal-care', rx: /\b(soap|shampoo|toothpaste|face\s*wash|lotion|cream)\b/i },
      { term: 'detergent', cat: 'cleaning-household', rx: /\b(detergent|harpic|lizol|dishwash|vim|exo|cleaning)\b/i },
      { term: 'pickle', cat: 'sauces-condiments', rx: /\b(pickle|achar|ketchup|sauce|jam|mayonnaise)\b/i },
      { term: 'diaper', cat: 'baby-family', rx: /\b(diaper|pampers|baby\s*wipes)\b/i },
      { term: 'baking soda', cat: 'oils-sugar', rx: /\b(baking\s*soda|cooking\s*soda)\b/i },
      { term: 'oregano', cat: 'spices', rx: /\b(oregano|herbs|seasoning|thyme|basil)\b/i },
    ];

    const miscategorizedInSnacks = [];
    for (const p of snacks) {
      const n = p.name.toLowerCase();
      // If it's explicitly a biscuit, cookie, chips, cake, chocolate, candy, popcorn, noodles, it IS a snack
      const isDefinitelySnack = /\b(biscuit|cookie|rusk|cake|chips|popcorn|nachos|murukku|mixture|halwa|chocolate|cadbury|dairy\s*milk|kitkat|5\s*star|munch|perk|candy|toffee|jelly|maggi|noodles|pasta|macaroni|semiya|wafers)\b/i.test(n);
      
      if (!isDefinitelySnack) {
        for (const t of nonSnackTerms) {
          if (t.rx.test(n)) {
            miscategorizedInSnacks.push({
              id: p.id,
              name: p.name,
              reason: t.term,
              suggested: t.cat,
            });
            break;
          }
        }
      }
    }

    console.log(`Found ${miscategorizedInSnacks.length} clearly miscategorized non-snack items in biscuits-snacks!`);
    console.table(miscategorizedInSnacks.slice(0, 40));

    // Also check other categories for obvious misplacements
    const otherAnomalies = [];
    for (const p of res.rows) {
      if (p.category_id === 'beverages' && /\b(baking\s*soda)\b/i.test(p.name)) {
        otherAnomalies.push({ id: p.id, name: p.name, from: p.category_id, to: 'oils-sugar' });
      }
      if (p.category_id === 'rice-grains' && /\b(oregano|seasoning|herbs)\b/i.test(p.name)) {
        otherAnomalies.push({ id: p.id, name: p.name, from: p.category_id, to: 'spices' });
      }
      if (p.category_id === 'dairy' && /\b(peanut\s*butter)\b/i.test(p.name)) {
        otherAnomalies.push({ id: p.id, name: p.name, from: p.category_id, to: 'sauces-condiments' });
      }
    }

    console.log(`\nFound ${otherAnomalies.length} other anomalies:`);
    console.table(otherAnomalies);

  } finally {
    client.release();
    process.exit(0);
  }
}

audit().catch(err => {
  console.error(err);
  process.exit(1);
});
