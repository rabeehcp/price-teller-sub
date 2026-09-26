require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('../dist/db/pool');

async function fixSnacks() {
  console.log('--- Fixing misclassified snacks ---');

  // 1. All chips, namkeen, biscuits, cookies, chewing gum, instant noodles wrongly moved to personal-care, spices, oils-sugar, beverages
  const res = await pool.query(`
    SELECT id, name, category_id 
    FROM products 
    WHERE category_id IN ('personal-care', 'spices', 'oils-sugar', 'beverages', 'pulses-legumes')
  `);

  const toSnacks = [];

  for (const p of res.rows) {
    const name = p.name;
    const lower = name.toLowerCase();

    // Check if it's actually a snack / biscuit / confectionery / chips / namkeen / noodles
    const isSnackItem = (
      // Chips & Crisps & Namkeen brands & flavors
      lower.includes("lay's") || lower.includes("lays") || lower.includes("pringles") || 
      lower.includes("kurkure") || lower.includes("bingo") || lower.includes("unibic") ||
      lower.includes("parle") || lower.includes("sunfeast") || lower.includes("britannia") ||
      lower.includes("haldiram's moong dal") || lower.includes("haldiram's chana") || lower.includes("haldiram's masala kaju") ||
      lower.includes("masala peanut") || lower.includes("fried gram ball") || lower.includes("masala pori") ||
      lower.includes("masala bites") || lower.includes("masala nibbles") || lower.includes("french fries") ||
      lower.includes("turtle sour cream") || lower.includes("lotte fruito pie") ||
      // Chewing gum & mints
      lower.includes("orbit") || lower.includes("chewing gum") || lower.includes("mentos") || lower.includes("center fresh") ||
      // Biscuits & Cream sandwich
      lower.includes("choco cream") || lower.includes("bourbon") || lower.includes("dark fantasy") || 
      lower.includes("elaichi cream") || lower.includes("vanilla cream") || lower.includes("cream & onion") ||
      lower.includes("cream and onion") || lower.includes("cream n onion") || lower.includes("pineapple cream") ||
      // Noodles & Instant Pasta
      lower.includes("maggi") || lower.includes("yippee") || (lower.includes("instant pastta") || lower.includes("instant pasta"))
    );

    // Make sure personal care items that genuinely contain words like "cream" or "noodle" are NOT moved
    const isGenuinePersonalCare = (
      lower.includes("shampoo") || lower.includes("soap") || lower.includes("body wash") || 
      lower.includes("facewash") || lower.includes("face wash") || lower.includes("lotion") || 
      lower.includes("moisturizer") || lower.includes("cold cream") || lower.includes("soft creme") ||
      lower.includes("fair & lovely") || lower.includes("glow & lovely") || lower.includes("nivea") ||
      lower.includes("lakme") || lower.includes("ponds") || lower.includes("pond's") ||
      lower.includes("vaseline") || lower.includes("boroplus") || lower.includes("shaving")
    );

    const isGenuineSpice = (
      lower.includes("turmeric") || lower.includes("chilli powder") || lower.includes("coriander powder") ||
      lower.includes("garam masala") || lower.includes("chicken masala") || lower.includes("meat masala") ||
      lower.includes("fish masala") || lower.includes("sambar") || lower.includes("rasam") || 
      lower.includes("curry powder") || lower.includes("asafoetida") || lower.includes("perungayam") ||
      lower.includes("cumin") || lower.includes("mustard seeds") || lower.includes("fenugreek") ||
      lower.includes("cloves") || lower.includes("cardamom") || lower.includes("cinnamon") ||
      (lower.includes("bakers") && (lower.includes("oregano") || lower.includes("chilli flakes") || lower.includes("cinnamon")))
    );

    if (isSnackItem && !isGenuinePersonalCare && !isGenuineSpice) {
      toSnacks.push(p);
    }
  }

  console.log(`Found ${toSnacks.length} snack items to restore to biscuits-snacks:`);
  for (const item of toSnacks) {
    console.log(`  -> Restoring "${item.name}" from ${item.category_id} to biscuits-snacks`);
    await pool.query("UPDATE products SET category_id = 'biscuits-snacks' WHERE id = $1", [item.id]);
  }

  // Let's also check if there are raw pulses like "Durga Moong Dhall", "Bambino Moong Dhall", "A2B Moond Dal"
  // If A2B Moond Dal is a namkeen, it should be biscuits-snacks
  const a2b = await pool.query("SELECT id, name FROM products WHERE name ILIKE '%A2B Moond%'");
  for (const row of a2b.rows) {
    await pool.query("UPDATE products SET category_id = 'biscuits-snacks' WHERE id = $1", [row.id]);
  }

  console.log('\n--- Final Category Breakdown ---');
  const catRes = await pool.query(`
    SELECT c.id, c.name, COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.id, c.name
    ORDER BY product_count DESC
  `);
  console.table(catRes.rows);

  process.exit(0);
}

fixSnacks().catch(err => {
  console.error(err);
  process.exit(1);
});
