const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL;
const cleanUrl = dbUrl && (dbUrl.includes('aivencloud.com') || dbUrl.includes('sslmode=require'))
  ? dbUrl.replace(/[\?&]sslmode=[^&]+/, '')
  : dbUrl;

const pool = new Pool({
  connectionString: cleanUrl,
  ssl: { rejectUnauthorized: false }
});

function parseGrams(str) {
  if (!str) return null;
  const matchG = str.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|grams)/i);
  if (matchG) return parseFloat(matchG[1]);
  const matchKg = str.match(/(\d+(?:\.\d+)?)\s*kg/i);
  if (matchKg) return parseFloat(matchKg[1]) * 1000;
  const matchMl = str.match(/(\d+(?:\.\d+)?)\s*(?:ml|ltr|l)/i);
  if (matchMl) return parseFloat(matchMl[1]);
  return null;
}

async function fixSmallItems() {
  console.log('🔄 Fixing small chips, biscuits, chocolates, gums and confectionery prices...');
  const client = await pool.connect();

  try {
    const res = await client.query('SELECT id, name, default_unit, prices, category_id FROM products');
    const prods = res.rows;

    let updatedCount = 0;
    const queries = [];

    for (const p of prods) {
      const name = p.name.toLowerCase();
      const unit = (p.default_unit || '').toLowerCase();
      const grams = parseGrams(unit) || parseGrams(name);

      let targetPrice = null;

      // 1. Chewing Gums, Mints & Candies
      if (
        name.includes('chewing gum') || name.includes('orbit') || name.includes('center fresh') ||
        name.includes('lollipop') || name.includes('alpenliebe') || name.includes('candy') ||
        name.includes('mentos') || name.includes('eclairs') || name.includes('chupa') ||
        name.includes('doublemint') || name.includes('rol a cola') || name.includes('toffee')
      ) {
        if (grams) {
          if (grams <= 10) targetPrice = 5;
          else if (grams <= 25) targetPrice = 10;
          else if (grams <= 50) targetPrice = 15;
          else if (grams <= 90) targetPrice = 25;
          else if (grams <= 150) targetPrice = 35;
          else targetPrice = 45;
        } else {
          targetPrice = 5;
        }
      }

      // 2. Chips & Extruded snacks (Lays, Kurkure, Bingo, Parle Wafers, etc.)
      else if (
        name.includes('lay') || name.includes('kurkure') || name.includes('bingo') ||
        name.includes('chips') || name.includes('wafer') || name.includes('tangles') ||
        name.includes('corn chip') || name.includes('jeffs')
      ) {
        if (name.includes('gourmet')) {
          if (grams && grams <= 60) targetPrice = 30;
          else targetPrice = 50;
        } else if (grams) {
          if (grams <= 18) targetPrice = 5;      // Small ₹5 pouch (e.g. 12g)
          else if (grams <= 32) targetPrice = 10; // Classic ₹10 pouch (e.g. 20g, 24g, 25g)
          else if (grams <= 65) targetPrice = 20; // Classic ₹20 pouch (e.g. 40g, 44g, 50g, 52g)
          else if (grams <= 105) targetPrice = 35; // ₹35 pouch (e.g. 70g, 85g, 95g)
          else if (grams <= 180) targetPrice = 50; // ₹50 pack
          else if (grams <= 300) targetPrice = 85;
          else if (grams <= 500) targetPrice = 140;
          else targetPrice = 250;
        } else {
          if (unit.includes('1 pack') || unit.includes('1 no') || unit.includes('pouch')) targetPrice = 10;
        }
      }

      // 3. Biscuits & Cookies (Parle-G, 50-50, Tiger, Monaco, Bounce, Bourbon, Marie, Dark Fantasy, Oreo, etc.)
      else if (
        name.includes('biscuit') || name.includes('cookie') || name.includes('cracker') ||
        name.includes('rusk') || name.includes('parle') || name.includes('50-50') ||
        name.includes('monaco') || name.includes('bounce') || name.includes('dark fantasy') ||
        name.includes('marie') || name.includes('oreo') || name.includes('bourbon') ||
        name.includes('cream sandwich') || name.includes('milk bikis') || name.includes('potazos')
      ) {
        if (grams) {
          if (grams <= 32) targetPrice = 5;        // Mini pocket pack (20g, 25g, 29g) -> ₹5
          else if (grams <= 55) targetPrice = 10;   // ₹10 pack (35g, 38g, 45g, 50g) -> ₹10
          else if (grams <= 85) targetPrice = 15;   // Small standard pack (60g, 75g, 80g) -> ₹15
          else if (grams <= 140) targetPrice = 25;  // Medium pack (100g, 120g) -> ₹25
          else if (grams <= 220) targetPrice = 35;  // 150g - 200g pack -> ₹35
          else if (grams <= 350) targetPrice = 50;  // 250g - 300g pack -> ₹50
          else if (grams <= 500) targetPrice = 75;  // Family pack 400g-500g -> ₹75
          else targetPrice = 135;                   // 1kg mega pack -> ₹135
        } else {
          if (unit.includes('1 pc') || unit.includes('1 no')) targetPrice = 10;
        }
      }

      // 4. Chocolates & Candy Bars (Snickers, Perk, Munch, 5 Star, KitKat, Dairy Milk, Milkybar, Bauli Moonfils)
      else if (
        name.includes('snickers') || name.includes('perk') || name.includes('munch') ||
        name.includes('kitkat') || name.includes('5 star') || name.includes('dairy milk') ||
        name.includes('milkybar') || name.includes('moonfils') || name.includes('muffills') ||
        name.includes('choco bar') || name.includes('chocoliebe')
      ) {
        if (grams) {
          if (grams <= 15) targetPrice = 5;         // ₹5 small Perk / Munch / Dairy milk
          else if (grams <= 25) targetPrice = 10;   // ₹10 mini Snickers (20g) / Kitkat
          else if (grams <= 48) targetPrice = 20;   // ₹20 standard bar / Moonfils (45g)
          else if (grams <= 70) targetPrice = 40;   // ₹40 medium bar
          else if (grams <= 150) targetPrice = 75;  // ₹75 larger chocolate
          else targetPrice = 130;
        } else {
          if (unit.includes('1 pc') || unit.includes('1 no')) targetPrice = 10;
        }
      }

      // 5. Small single-serve noodles / Maggi
      else if (name.includes('maggi') || name.includes('yippee') || name.includes('instant noodle')) {
        if (grams && grams <= 80) targetPrice = 14; // Single 70g pack -> ₹14
        else if (grams && grams <= 150) targetPrice = 25;
      }

      // 6. Mini soaps <= 50g
      else if ((name.includes('soap') || name.includes('bar')) && p.category_id === 'personal-care') {
        if (grams && grams <= 50) targetPrice = 10;
      }

      if (targetPrice !== null) {
        // Create realistic store competition prices
        const iqwanPrice = targetPrice;
        const bismiPrice = Math.max(1, targetPrice <= 10 ? targetPrice : Math.round(targetPrice - (Math.random() > 0.6 ? 1 : 0)));

        const newPrices = {
          'Al-Iqwan': iqwanPrice,
          'Bismi Mart': bismiPrice
        };

        queries.push({ id: p.id, prices: newPrices });
      }
    }

    console.log(`Applying realistic pricing updates to ${queries.length} products...`);

    // Batch update into postgres
    for (const q of queries) {
      await client.query(
        'UPDATE products SET prices = $1, last_updated = NOW() WHERE id = $2',
        [JSON.stringify(q.prices), q.id]
      );
      updatedCount++;
    }

    console.log(`✅ Successfully updated ${updatedCount} small snack, lays, biscuit, and impulse products with realistic rates (₹5, ₹10, ₹15, ₹20)!`);

  } catch (err) {
    console.error('❌ Error fixing small items:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

fixSmallItems();
