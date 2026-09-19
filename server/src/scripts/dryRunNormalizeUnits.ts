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

// Helper to normalize unit strings cleanly
export function normalizeUnit(raw: string): string {
  if (!raw) return '1 kg';
  let u = raw.trim();

  // Fix known blunder units
  if (/^banana\s*stem$/i.test(u)) return '1 pc';
  if (/^1\s*(unit|piece|pc|pcs|no)$/i.test(u)) return '1 pc';
  if (/^1\s*pack(et)?$/i.test(u)) return '1 pack';
  if (/^1\s*bunch$/i.test(u)) return '1 bunch';
  if (/^1\s*box$/i.test(u)) return '1 box';

  // Capitalization and spacing
  u = u.replace(/\bKg\b/g, 'kg');
  u = u.replace(/\bgm\b/g, 'g');
  u = u.replace(/(\d+)(kg|g|ml|l|pc|pack|box|bunch|pcs)\b/gi, '$1 $2');
  u = u.replace(/\bL\b/g, 'L');
  u = u.replace(/\b1\s*Piece\b/i, '1 pc');
  u = u.replace(/\b1\s*Pc\b/i, '1 pc');
  u = u.replace(/\b1\s*Pcs\b/i, '1 pc');
  u = u.replace(/\b1\s*No\b/i, '1 pc');
  u = u.replace(/\b1\s*Bunch\b/i, '1 bunch');
  u = u.replace(/\b1\s*Box\b/i, '1 box');
  u = u.replace(/\b1\s*Pack\b/i, '1 pack');

  return u.trim();
}

async function run() {
  try {
    const res = await pool.query<ProductRow>(`
      SELECT id, name, category_id, default_unit, available_units, unit_multiplier, prices
      FROM products
    `);

    console.log(`Auditing ${res.rows.length} products...`);
    const changes: any[] = [];

    for (const p of res.rows) {
      let newDefaultUnit = normalizeUnit(p.default_unit);
      let newAvailableUnits = Array.isArray(p.available_units)
        ? p.available_units.map(normalizeUnit)
        : [newDefaultUnit];
      let newMultiplier = { ...(p.unit_multiplier || {}) };
      let newPrices = { ...(p.prices || {}) };
      let reason = '';

      // 1. RICE & GRAINS: All staple/loose rice products must default to '1 kg'
      const isRice = (p.name.includes('അരി') || p.name.toLowerCase().includes('rice')) &&
                     !p.name.includes('പൊടിയരി') && !p.name.includes('അരിപ്പൊടി') && !p.name.includes('പാലട');

      if (isRice && p.category_id === 'rice-grains') {
        if (p.id === 'grain-1-rice') {
          // Kuruva rice was ₹227.5 (5kg price). Real 1 kg price is ₹45.50
          newDefaultUnit = '1 kg';
          newAvailableUnits = ['1 kg', '5 kg', '10 kg'];
          newMultiplier = { '1 kg': 1, '5 kg': 5, '10 kg': 10 };
          for (const shop of Object.keys(newPrices)) {
            newPrices[shop] = Math.round((newPrices[shop] / 5) * 10) / 10;
          }
          reason = 'Fixed Kuruva Rice unit to 1 kg and price to per-kg rate (was 5kg rate ₹227.5)';
        } else if (p.id === 'grain-2-matta-rice') {
          // Matta rice was ₹399 (8kg/10kg price). Real 1 kg price is ₹48
          newDefaultUnit = '1 kg';
          newAvailableUnits = ['1 kg', '5 kg', '10 kg'];
          newMultiplier = { '1 kg': 1, '5 kg': 5, '10 kg': 10 };
          for (const shop of Object.keys(newPrices)) {
            newPrices[shop] = Math.round((newPrices[shop] / 8) * 10) / 10;
          }
          reason = 'Fixed Matta Rice unit to 1 kg and price to per-kg rate (was bulk rate ₹399)';
        }
      }

      // 2. EGGS: dairy-10-egg is ₹38 which is for 6 eggs (not 1 single egg)
      if (p.id === 'dairy-10-egg') {
        newDefaultUnit = '6 pcs';
        newAvailableUnits = ['6 pcs', '12 pcs', '30 pcs'];
        newMultiplier = { '6 pcs': 1, '12 pcs': 2, '30 pcs': 5 };
        reason = 'Fixed chicken egg unit to 6 pcs (price ₹38 was for 6-pack, not 1 unit)';
      } else if (p.id === 'dairy-12-quail-egg') {
        newDefaultUnit = '10 pcs';
        newAvailableUnits = ['10 pcs'];
        newMultiplier = { '10 pcs': 1 };
        reason = 'Fixed quail egg unit to 10 pcs pack (price ₹38 is for 10 pcs)';
      } else if (p.id === 'prod-1788525998809-8809' && p.name.includes('താറാവ് മുട്ട')) {
        newDefaultUnit = '6 pcs';
        newAvailableUnits = ['6 pcs'];
        newMultiplier = { '6 pcs': 1 };
        reason = 'Fixed duck egg unit to 6 pcs pack';
      }

      // 3. BEEF: beef-fresh was copied with chicken price ₹160/kg. Kerala beef is ₹360-₹380/kg
      if (p.id === 'beef-fresh') {
        newDefaultUnit = '1 kg';
        newAvailableUnits = ['500 g', '1 kg', '2 kg'];
        newMultiplier = { '500 g': 0.5, '1 kg': 1, '2 kg': 2 };
        for (const shop of Object.keys(newPrices)) {
          newPrices[shop] = Math.round(newPrices[shop] * 2.3);
        }
        reason = 'Fixed fresh beef price from chicken rate ₹160 to authentic beef rate ~₹368/kg';
      }

      // 4. CHICKEN MASALA 100g: was copied with whole chicken price ₹160. 100g masala is ₹38
      if (p.id === 'spice-22-chicken-masala') {
        newDefaultUnit = '100 g';
        newAvailableUnits = ['100 g', '250 g'];
        newMultiplier = { '100 g': 1, '250 g': 2.4 };
        for (const shop of Object.keys(newPrices)) {
          newPrices[shop] = Math.round((newPrices[shop] / 160) * 38);
        }
        reason = 'Fixed chicken masala 100g price from whole chicken ₹160 to spice rate ₹38';
      }

      // 5. BANANA STEM: 'Banana Stem' -> '1 pc'
      if (p.id === 'pothys-veg-4649834' || p.default_unit === 'Banana Stem') {
        newDefaultUnit = '1 pc';
        newAvailableUnits = ['1 pc'];
        newMultiplier = { '1 pc': 1 };
        reason = 'Fixed Banana Stem unit from "Banana Stem" to "1 pc"';
      }

      // 6. Generic "1 Unit" in spices or vegetables
      if (p.category_id === 'spices' && (p.default_unit === '1 Unit' || p.default_unit === '1 unit')) {
        if (p.name.includes('ഏലക്ക')) {
          newDefaultUnit = '50 g';
          newAvailableUnits = ['50 g', '100 g'];
          newMultiplier = { '50 g': 1, '100 g': 2 };
          reason = 'Fixed cardamom from 1 Unit to 50 g';
        } else {
          newDefaultUnit = '100 g';
          newAvailableUnits = ['100 g'];
          newMultiplier = { '100 g': 1 };
          reason = 'Fixed spice packet from 1 Unit to 100 g';
        }
      }

      // Check if anything changed
      const unitChanged = newDefaultUnit !== p.default_unit;
      const availChanged = JSON.stringify(newAvailableUnits) !== JSON.stringify(p.available_units);
      const multChanged = JSON.stringify(newMultiplier) !== JSON.stringify(p.unit_multiplier);
      const pricesChanged = JSON.stringify(newPrices) !== JSON.stringify(p.prices);

      if (unitChanged || availChanged || multChanged || pricesChanged) {
        changes.push({
          id: p.id,
          name: p.name,
          oldUnit: p.default_unit,
          newUnit: newDefaultUnit,
          oldPrices: Object.values(p.prices || {})[0],
          newPrices: Object.values(newPrices || {})[0],
          reason: reason || 'Normalized unit formatting and capitalization',
        });
      }
    }

    console.log(`\nTotal products needing update: ${changes.length}`);
    console.log('Sample changes:');
    console.table(changes.slice(0, 30));

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
