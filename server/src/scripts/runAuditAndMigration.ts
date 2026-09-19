import '../utils/dns-fallback';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });
import { pool } from '../db/pool';

interface ProductRow {
  id: string;
  name: string;
  category_id: string;
  default_unit: string;
  available_units: string[];
  unit_multiplier: Record<string, number>;
  prices: Record<string, number>;
}

export function cleanUnitString(raw: string): string {
  if (!raw) return '1 kg';
  let u = raw.trim();

  // Known awkward blunder unit strings
  if (/^banana\s*stem$/i.test(u)) return '1 pc';
  if (/^1\s*(unit|piece|pc|pcs|no)$/i.test(u)) return '1 pc';
  if (/^1\s*pack(et)?$/i.test(u)) return '1 pack';
  if (/^1\s*bunch$/i.test(u)) return '1 bunch';
  if (/^1\s*box$/i.test(u)) return '1 box';
  if (/^(\d+)\s*(piece|pc|pcs|no|nos)$/i.test(u)) {
    const num = u.match(/\d+/)?.[0] || '1';
    return `${num} ${parseInt(num, 10) > 1 ? 'pcs' : 'pc'}`;
  }

  // Capitalization and abbreviations
  u = u.replace(/\bKg\b/g, 'kg');
  u = u.replace(/\bKG\b/g, 'kg');
  u = u.replace(/\bgm\b/gi, 'g');
  u = u.replace(/\bGM\b/g, 'g');
  u = u.replace(/\bML\b/g, 'ml');
  u = u.replace(/\bMl\b/g, 'ml');
  u = u.replace(/\blitre\b/gi, 'L');
  u = u.replace(/\bltr\b/gi, 'L');
  u = u.replace(/\b(\d+)\s*l\b/gi, '$1 L');

  // Insert space between number and unit: 500g -> 500 g, 700ml -> 700 ml, 1kg -> 1 kg
  u = u.replace(/(\d+(?:\.\d+)?)\s*(kg|g|ml|l|pc|pack|box|bunch|pcs)\b/gi, '$1 $2');

  // Specific phrases
  u = u.replace(/\b1\s*Piece\b/gi, '1 pc');
  u = u.replace(/\b1\s*Pc\b/gi, '1 pc');
  u = u.replace(/\b1\s*Pcs\b/gi, '1 pc');
  u = u.replace(/\b1\s*No\b/gi, '1 pc');
  u = u.replace(/\b1\s*Bunch\b/gi, '1 bunch');
  u = u.replace(/\b1\s*Box\b/gi, '1 box');
  u = u.replace(/\b1\s*Pack\b/gi, '1 pack');
  u = u.replace(/\b(\d+)\s*Nos\b/gi, '$1 pcs');
  u = u.replace(/\b(\d+)\s*Pcs\b/gi, '$1 pcs');

  return u.trim();
}

export function computeMultiplier(unit: string, defaultUnit: string): number {
  if (unit === defaultUnit) return 1;

  // Grams to grams or kg
  const parseAmount = (u: string) => {
    const m = u.match(/([\d.]+)\s*(kg|g|ml|l|pc|pcs|bunch|pack|box)/i);
    if (!m) return null;
    const val = parseFloat(m[1]);
    const type = m[2].toLowerCase();
    if (type === 'kg') return { baseType: 'weight', val: val * 1000 };
    if (type === 'g') return { baseType: 'weight', val };
    if (type === 'l') return { baseType: 'volume', val: val * 1000 };
    if (type === 'ml') return { baseType: 'volume', val };
    if (type === 'pc' || type === 'pcs') return { baseType: 'count', val };
    if (type === 'bunch') return { baseType: 'bunch', val };
    if (type === 'pack') return { baseType: 'pack', val };
    if (type === 'box') return { baseType: 'box', val };
    return null;
  };

  const target = parseAmount(unit);
  const base = parseAmount(defaultUnit);

  if (target && base && target.baseType === base.baseType && base.val > 0) {
    return Math.round((target.val / base.val) * 100) / 100;
  }

  return 1;
}

async function run() {
  try {
    const res = await pool.query<ProductRow>(`
      SELECT id, name, category_id, default_unit, available_units, unit_multiplier, prices
      FROM products
    `);

    console.log(`Auditing and preparing updates for ${res.rows.length} products...`);
    const updates: {
      id: string;
      name: string;
      default_unit: string;
      available_units: string[];
      unit_multiplier: Record<string, number>;
      prices: Record<string, number>;
      notes: string;
    }[] = [];

    for (const p of res.rows) {
      let defaultUnit = cleanUnitString(p.default_unit);
      let availableUnits = Array.isArray(p.available_units)
        ? p.available_units.map(cleanUnitString)
        : [defaultUnit];
      let unitMultiplier = { ...(p.unit_multiplier || {}) };
      let prices = { ...(p.prices || {}) };
      let notes = '';

      // Clean existing multiplier keys
      const cleanedMultiplier: Record<string, number> = {};
      for (const [k, v] of Object.entries(unitMultiplier)) {
        cleanedMultiplier[cleanUnitString(k)] = v;
      }
      unitMultiplier = cleanedMultiplier;

      // 1. RICE & GRAINS: Loose rice staples
      if (p.id === 'grain-1-rice') {
        defaultUnit = '1 kg';
        availableUnits = ['1 kg', '5 kg', '10 kg'];
        unitMultiplier = { '1 kg': 1, '5 kg': 5, '10 kg': 10 };
        for (const shop of Object.keys(prices)) {
          // Normalize ₹227.5 down to real 1 kg rate ~₹45.50
          prices[shop] = Math.round((prices[shop] / 5) * 10) / 10;
        }
        notes = 'Fixed Kuruva Rice unit to 1 kg and price from 5kg bag (₹227.5) to ₹45.5/kg';
      } else if (p.id === 'grain-2-matta-rice') {
        defaultUnit = '1 kg';
        availableUnits = ['1 kg', '5 kg', '10 kg'];
        unitMultiplier = { '1 kg': 1, '5 kg': 5, '10 kg': 10 };
        for (const shop of Object.keys(prices)) {
          // Normalize ₹399 down to real 1 kg rate ~₹48-50
          prices[shop] = Math.round((prices[shop] / 8) * 10) / 10;
        }
        notes = 'Fixed Matta Rice unit to 1 kg and price from bulk bag (₹399) to ₹49.9/kg';
      }

      // 2. EGGS
      if (p.id === 'dairy-10-egg') {
        defaultUnit = '6 pcs';
        availableUnits = ['6 pcs', '12 pcs', '30 pcs'];
        unitMultiplier = { '6 pcs': 1, '12 pcs': 2, '30 pcs': 5 };
        notes = 'Fixed White Eggs default unit to 6 pcs (price ₹38 is for 6-pack)';
      } else if (p.id === 'dairy-11-chicken-egg') {
        defaultUnit = '6 pcs';
        availableUnits = ['6 pcs', '12 pcs'];
        unitMultiplier = { '6 pcs': 1, '12 pcs': 2 };
        for (const shop of Object.keys(prices)) {
          // Fixed chicken meat rate ₹260 down to real egg rate ₹58 for 6 pcs
          prices[shop] = Math.round((prices[shop] / 260) * 58);
        }
        notes = 'Fixed Naadan Eggs unit to 6 pcs and price from meat rate ₹260 to ₹58 for 6 pcs';
      } else if (p.id === 'dairy-12-quail-egg') {
        defaultUnit = '10 pcs';
        availableUnits = ['10 pcs', '20 pcs'];
        unitMultiplier = { '10 pcs': 1, '20 pcs': 2 };
        notes = 'Fixed Quail Eggs unit to 10 pcs (price ₹38 is for 10-pack)';
      } else if (p.id === 'prod-1788525998809-8809' && p.name.includes('താറാവ് മുട്ട')) {
        defaultUnit = '6 pcs';
        availableUnits = ['6 pcs', '12 pcs'];
        unitMultiplier = { '6 pcs': 1, '12 pcs': 2 };
        notes = 'Fixed Duck Eggs unit to 6 pcs pack';
      }

      // 3. MEAT - BEEF
      if (p.id === 'beef-fresh') {
        defaultUnit = '1 kg';
        availableUnits = ['500 g', '1 kg', '2 kg'];
        unitMultiplier = { '500 g': 0.5, '1 kg': 1, '2 kg': 2 };
        for (const shop of Object.keys(prices)) {
          // Scale from chicken rate ₹160 to authentic beef rate ₹368/kg
          prices[shop] = Math.round(prices[shop] * 2.3);
        }
        notes = 'Fixed fresh beef price from chicken rate ₹160 to authentic Kerala beef rate ₹368/kg';
      }

      // 4. SPICES - CHICKEN MASALA 100g
      if (p.id === 'spice-22-chicken-masala') {
        defaultUnit = '100 g';
        availableUnits = ['100 g', '250 g'];
        unitMultiplier = { '100 g': 1, '250 g': 2.4 };
        for (const shop of Object.keys(prices)) {
          // Scale from whole chicken ₹160 down to spice rate ₹38
          prices[shop] = Math.round((prices[shop] / 160) * 38);
        }
        notes = 'Fixed chicken masala 100g price from chicken rate ₹160 to spice rate ₹38';
      }

      // 5. BANANA STEM: 'Banana Stem' -> '1 pc'
      if (p.id === 'pothys-veg-4649834' || defaultUnit.toLowerCase() === 'banana stem') {
        defaultUnit = '1 pc';
        availableUnits = ['1 pc'];
        unitMultiplier = { '1 pc': 1 };
        notes = 'Fixed Banana Stem unit from "Banana Stem" to "1 pc"';
      }

      // 6. Generic "1 Unit" / "1 unit"
      if (defaultUnit === '1 pc' || defaultUnit === '1 Unit' || defaultUnit === '1 unit') {
        if (p.name.includes('പാക്കറ്റ്') || p.name.includes('പൊറോട്ട') || p.name.includes('മിക്സ്') || p.name.includes('കസ്കസ്') || p.name.includes('യീസ്റ്റ്') || p.name.includes('കൂട്ട്') || p.name.includes('കൊണ്ടാട്ടം')) {
          defaultUnit = '1 pack';
          availableUnits = ['1 pack'];
          unitMultiplier = { '1 pack': 1 };
          notes = 'Fixed packaged staple item from 1 Unit to 1 pack';
        } else if (p.category_id === 'spices') {
          defaultUnit = '1 pack';
          availableUnits = ['1 pack'];
          unitMultiplier = { '1 pack': 1 };
          notes = 'Fixed spice item from 1 Unit to 1 pack';
        } else if (['electronics', 'storage-containers', 'utensils'].includes(p.category_id)) {
          defaultUnit = '1 pc';
          availableUnits = ['1 pc'];
          unitMultiplier = { '1 pc': 1 };
        }
      }

      // 7. Leafy vegetables
      if (['vegetables', 'spices'].includes(p.category_id) && defaultUnit.toLowerCase().includes('bunch')) {
        defaultUnit = '1 bunch';
        availableUnits = ['1 bunch'];
        unitMultiplier = { '1 bunch': 1 };
      }

      // Ensure defaultUnit is in availableUnits
      if (!availableUnits.includes(defaultUnit)) {
        availableUnits.unshift(defaultUnit);
      }

      // Remove duplicate available units
      availableUnits = Array.from(new Set(availableUnits));

      // Ensure multiplier for each availableUnit is set
      for (const u of availableUnits) {
        if (unitMultiplier[u] === undefined) {
          unitMultiplier[u] = computeMultiplier(u, defaultUnit);
        }
      }
      // defaultUnit multiplier MUST ALWAYS be 1
      unitMultiplier[defaultUnit] = 1;

      // Check if product changed
      const unitChanged = defaultUnit !== p.default_unit;
      const availChanged = JSON.stringify(availableUnits) !== JSON.stringify(p.available_units);
      const multChanged = JSON.stringify(unitMultiplier) !== JSON.stringify(p.unit_multiplier);
      const priceChanged = JSON.stringify(prices) !== JSON.stringify(p.prices);

      if (unitChanged || availChanged || multChanged || priceChanged) {
        updates.push({
          id: p.id,
          name: p.name,
          default_unit: defaultUnit,
          available_units: availableUnits,
          unit_multiplier: unitMultiplier,
          prices,
          notes: notes || 'Normalized unit string formatting',
        });
      }
    }

    console.log(`Total products to be updated: ${updates.length}`);
    const keyFixes = updates.filter(u => u.notes && !u.notes.startsWith('Normalized'));
    console.log('\nKey Price and Unit Blunder Fixes:');
    console.table(keyFixes);

    // Apply updates in a transaction
    console.log('\nApplying updates to PostgreSQL database...');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const u of updates) {
        await client.query(`
          UPDATE products
          SET default_unit = $1,
              available_units = $2,
              unit_multiplier = $3,
              prices = $4
          WHERE id = $5
        `, [
          u.default_unit,
          JSON.stringify(u.available_units),
          JSON.stringify(u.unit_multiplier),
          JSON.stringify(u.prices),
          u.id
        ]);
      }
      await client.query('COMMIT');
      console.log(`\n Successfully updated ${updates.length} products in database!`);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
}

run();
