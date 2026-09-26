const { pool } = require('../dist/db/pool');

const corrections = [
  { id: "epeedika-grocery-778", name: "1st Thuvaraparippu / Toor Dal 500gm", correctedCat: "pulses-legumes" },
  { id: "zeev-35681", name: "3 റോസസ് ഡസ്റ്റ് ചായപ്പൊടി 500g", correctedCat: "beverages" },
  { id: "zeev-42059", name: "Aachi Vathakulambu Rice Paste 200 g", correctedCat: "sauces-condiments" },
  { id: "epeedika-grocery-1127", name: "Aashirbad Kuruva / Cherumani Rice 1Kg / Loose", correctedCat: "rice-grains" },
  { id: "atta", name: "Aashirvaad Superior MP Atta", correctedCat: "rice-grains" },
  { id: "epeedika-grocery-533", name: "Ajmi Fresh Made Double Roasted Upma Rava 1 Kg", correctedCat: "rice-grains" },
  { id: "zeev-149825", name: "Akbar Green Tea Bag   37.5 g", correctedCat: "beverages" },
  { id: "epeedika-grocery-761", name: "Alibaba Basmati Rice 1 Kg (biryani rice)", correctedCat: "rice-grains" },
  { id: "zeev-163865", name: "Amrut Veni Hair Cleansing Nectar 50 ml (Hair Oil)", correctedCat: "personal-care" },
  { id: "zeev-27196", name: "Ariel Complete Detergent Washing Powder 4 kg", correctedCat: "cleaning-household" },
  { id: "zeev-45743", name: "Ashtapathy Mud Soap - Combo Pack 75 g", correctedCat: "personal-care" },
  { id: "epeedika-grocery-1260", name: "AVT Premium Tea 1 kg", correctedCat: "beverages" },
  { id: "zeev-46131", name: "Axe Bogo Deodorant 150 ml", correctedCat: "personal-care" },
  { id: "pothys-snack-3139108", name: "Bambino Moong Dhall", correctedCat: "biscuits-snacks" },
  { id: "pothys-snack-3136554", name: "Bambino Pastta Instant Tasty Masala Pasta", correctedCat: "biscuits-snacks" },
  { id: "pothys-snack-3138801", name: "Bambino Sugar Free Soan Papdi", correctedCat: "biscuits-snacks" },
  { id: "epeedika-grocery-1589", name: "Barkath silver premium biriyani rice 1 kg (Small rice)", correctedCat: "rice-grains" },
  { id: "epeedika-grocery-240", name: "Black Cumin Seed -Karimjeerakam", correctedCat: "spices" },
  { id: "epeedika-grocery-235", name: "Black Pepper 100g", correctedCat: "spices" },
  { id: "zeev-48693", name: "Bombay Shaving Company Deodorant For Men - Black Vibe 150 ml", correctedCat: "personal-care" },
  { id: "shysha-bakery-8872", name: "Boost Milk Shake 180 ml", correctedCat: "beverages" },
  { id: "zeev-151587", name: "Boost Nutrition Drink Pouch 750 g", correctedCat: "beverages" },
  { id: "epeedika-grocery-326", name: "Brooke Bond 3 Roses 100g Tea", correctedCat: "beverages" },
  { id: "shysha-bakery-8875", name: "Bru Cold Coffee Can 180ml", correctedCat: "beverages" },
  { id: "coffee", name: "Bru Instant Coffee Powder", correctedCat: "beverages" },
  { id: "epeedika-grocery-1416", name: "Cardamom / Elakkaya / 20 Rs/- pack", correctedCat: "spices" },
  { id: "zeev-14592", name: "Chandrika Ayurvedic  Soap 125 g", correctedCat: "personal-care" },
  { id: "epeedika-grocery-296", name: "Cherupayar 500g / Green Gram", correctedCat: "pulses-legumes" },
  { id: "epeedika-grocery-302", name: "Cherupayar Parippu 250gm", correctedCat: "pulses-legumes" },
  { id: "epeedika-grocery-231", name: "Clove / Grampu 10rs/- pack", correctedCat: "spices" },
  { id: "epeedika-grocery-74", name: "Dalda Vanaspati 100ml", correctedCat: "oils-sugar" },
  { id: "zeev-48707", name: "Double Horse Instant Parippu Pradhaman 200 g", correctedCat: "rice-grains" },
  { id: "pothys-snack-3138830", name: "Durga Moong Dhall", correctedCat: "biscuits-snacks" },
  { id: "pothys-snack-3395480", name: "Haldirams Moong Dal", correctedCat: "biscuits-snacks" },
  { id: "shysha-bakery-3815", name: "Parippu Vada 1 pcs", correctedCat: "biscuits-snacks" },
  { id: "pothys-snack-3138556", name: "Town Bus Chana Dal", correctedCat: "biscuits-snacks" },
  { id: "epeedika-grocery-1982", name: "ACT II Instant Popcorn - Chilly Surprise, 40 g Pouch", correctedCat: "biscuits-snacks" },
  { id: "zeev-41377", name: "Double Horse Appam - Idiyappam Pathiri 1 kg", correctedCat: "rice-grains" },
  { id: "zeev-41218", name: "Double Horse Easy Palappam Mix 1 kg", correctedCat: "rice-grains" },
  { id: "zeev-158754", name: "Double Horse Instant Tender Coconut Sago Payasam Mix 180 g", correctedCat: "rice-grains" },
  { id: "zeev-49405", name: "Oral-B  Cavity Defense Charcoal Soft   4 pcs", correctedCat: "personal-care" },
  { id: "epeedika-grocery-1227", name: "Perum Kayam 7g / Compounded Asafoetida Cake", correctedCat: "spices" },
  { id: "zeev-157986", name: "Dove Men + Care Hydration Boost Moisturiser 100 g", correctedCat: "personal-care" },
  { id: "mutton-fresh", name: "ഫ്രഷ് ആട്ടിറച്ചി (മട്ടൻ)", correctedCat: "meats" },
  { id: "fruit-njalipoovan-elakki", name: "ഞാലിപ്പൂവൻ പഴം (ഏലക്കി / Yelakki Banana)", correctedCat: "fruits" },
  { id: "shysha-bakery-7133", name: "ടാങ് ലെമൺ ഇൻസ്റ്റന്റ് മിക്സ് (നാരങ്ങ വെള്ളം) 500g", correctedCat: "beverages" },
  { id: "pothys-snack-3138677", name: "Bambino Chatpata Tomato Creamy Cheese Pasta", correctedCat: "biscuits-snacks" },
  { id: "zeev-15878", name: "Purepet Dog Food - Meat & Rice, Adult Dog 1 kg", correctedCat: "baby-family" },
  { id: "pothys-snack-3397690", name: "Mcaffeine Naked & Rich Choco Body Butter", correctedCat: "personal-care" },
  { id: "fruit-black-grapes", name: "കറുത്ത മുന്തിരി (Black Paneer Grapes)", correctedCat: "fruits" }
];

async function applyCorrections() {
  const client = await pool.connect();
  try {
    console.log(`Starting to apply ${corrections.length} product category corrections...`);
    await client.query('BEGIN');

    let updatedCount = 0;
    for (const c of corrections) {
      const res = await client.query(
        'UPDATE products SET category_id = $1 WHERE id = $2 RETURNING id, name, category_id',
        [c.correctedCat, c.id]
      );
      if (res.rowCount > 0) {
        updatedCount++;
        console.log(`[OK] Updated ${c.id} (${c.name}) -> ${c.correctedCat}`);
      } else {
        const byName = await client.query(
          'UPDATE products SET category_id = $1 WHERE name = $2 RETURNING id, name, category_id',
          [c.correctedCat, c.name]
        );
        if (byName.rowCount > 0) {
          updatedCount++;
          console.log(`[OK] Updated by name: ${c.name} -> ${c.correctedCat}`);
        } else {
          console.log(`[NOT FOUND] ${c.id} / ${c.name}`);
        }
      }
    }

    await client.query('COMMIT');
    console.log(`\nSuccessfully committed ${updatedCount}/${corrections.length} corrections.`);

    // Get current category breakdown
    const statsRes = await client.query(
      'SELECT category_id, COUNT(*) as count FROM products GROUP BY category_id ORDER BY count DESC'
    );
    console.log('\nUpdated Category Distribution in PostgreSQL:');
    console.table(statsRes.rows);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error applying corrections:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

applyCorrections();
