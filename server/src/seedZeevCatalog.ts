import fs from 'fs';
import path from 'path';
import { pool, setPostgresConnected } from './db/pool';

export interface ZeevProductItem {
  id: string;
  name: string;
  categoryId: string;
  emoji: string;
  image: string;
  defaultUnit: string;
  availableUnits: string[];
  unitMultiplier: Record<string, number>;
  isOrganic: boolean;
  isSeasonal: boolean;
  badge: string;
  nutritionalNote: string;
  prices: Record<string, number>;
  stockStatus: Record<string, string>;
  originalMrp?: number;
  originalOfferPrice?: number;
}

export async function seedZeevMasterCatalog(): Promise<{ totalProcessed: number; totalInDb: number }> {
  const jsonPath = path.join(__dirname, 'data', 'zeevProducts.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Data file not found at ${jsonPath}`);
  }

  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const products: ZeevProductItem[] = JSON.parse(raw);

  console.log(`📦 Loaded ${products.length} products from zeevProducts.json. Connecting to PostgreSQL...`);
  const client = await pool.connect();
  setPostgresConnected(true);

  try {
    const BATCH_SIZE = 50;
    const now = new Date().toISOString();
    let processed = 0;

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      const valueClauses: string[] = [];
      const values: any[] = [];
      let paramIdx = 1;

      for (const p of batch) {
        valueClauses.push(`($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2}, $${paramIdx + 3}, $${paramIdx + 4}, $${paramIdx + 5}, $${paramIdx + 6}, $${paramIdx + 7}, $${paramIdx + 8}, $${paramIdx + 9}, $${paramIdx + 10}, $${paramIdx + 11}, $${paramIdx + 12}, $${paramIdx + 13}, $${paramIdx + 14})`);
        values.push(
          p.id,
          p.name,
          p.categoryId,
          p.emoji,
          p.image,
          p.defaultUnit,
          JSON.stringify(p.availableUnits),
          JSON.stringify(p.unitMultiplier),
          p.isOrganic,
          p.isSeasonal,
          p.badge,
          p.nutritionalNote,
          JSON.stringify(p.prices || {}),
          JSON.stringify(p.stockStatus || {}),
          now
        );
        paramIdx += 15;
      }

      const sql = `
        INSERT INTO products (
          id, name, category_id, emoji, image, default_unit, available_units,
          unit_multiplier, is_organic, is_seasonal, badge, nutritional_note,
          prices, stock_status, last_updated
        )
        VALUES ${valueClauses.join(', ')}
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category_id = EXCLUDED.category_id,
          emoji = EXCLUDED.emoji,
          image = EXCLUDED.image,
          default_unit = EXCLUDED.default_unit,
          available_units = EXCLUDED.available_units,
          unit_multiplier = EXCLUDED.unit_multiplier,
          badge = EXCLUDED.badge,
          nutritional_note = EXCLUDED.nutritional_note,
          last_updated = EXCLUDED.last_updated;
      `;

      await client.query(sql, values);
      processed += batch.length;
      console.log(`   Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(products.length / BATCH_SIZE)} (${processed}/${products.length} products)...`);
    }

    const countRes = await client.query('SELECT COUNT(*) FROM products');
    const totalCount = parseInt(countRes.rows[0].count, 10);

    console.log(`✅ Success! Seeded ${processed} Zeev products. Total products in PostgreSQL: ${totalCount}`);
    return {
      totalProcessed: processed,
      totalInDb: totalCount,
    };
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedZeevMasterCatalog()
    .then((result) => {
      console.log('Done:', JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal seeding error:', err);
      process.exit(1);
    });
}
