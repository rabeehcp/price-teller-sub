import fs from 'fs';
import path from 'path';
import { getImageKitClient } from '../utils/imagekit';
import { pool, setPostgresConnected } from '../db/pool';

interface ProductEntry {
  id: string;
  name: string;
  image: string;
  emoji: string;
  categoryId: string;
  [key: string]: any;
}

export async function migrateCatalogToImageKit(concurrency = 10) {
  const ikClient = getImageKitClient();
  if (!ikClient) {
    throw new Error('ImageKit is not properly configured. Check IMAGEKIT_* in server/.env');
  }
  const ik = ikClient;

  const jsonPath = path.join(__dirname, '..', 'data', 'zeevProducts.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Catalog JSON not found at ${jsonPath}`);
  }

  const products: ProductEntry[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`🚀 Starting verified ImageKit migration for ${products.length} products...`);
  console.log(`⚡ Concurrency: ${concurrency}`);

  const client = await pool.connect();
  setPostgresConnected(true);

  let successCount = 0;
  let alreadyUploadedCount = 0;
  let noSourceCount = 0;
  let failCount = 0;
  let currentIndex = 0;

  async function processItem(p: ProductEntry, index: number): Promise<void> {
    const code = p.id.replace('zeev-', '');
    const fileName = `${code}.jpg`;
    const targetUrl = `https://ik.imagekit.io/rcparkd3663/priceteller-catalog/${fileName}`;

    if (p.image && p.image.includes('ik.imagekit.io')) {
      alreadyUploadedCount++;
      return;
    }

    const sourceUrl = `https://storage.googleapis.com/zeev-images/item_images/${fileName}`;

    try {
      // 1. Fetch image bytes directly from source
      const res = await fetch(sourceUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        },
      });

      if (!res.ok) {
        // Upstream 404 - no image exists for this product
        p.image = '';
        await client.query('UPDATE products SET image = $1 WHERE id = $2', ['', p.id]);
        noSourceCount++;
        return;
      }

      const arrayBuf = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);

      // Check if it's an XML error response or too small
      if (buffer.length < 500 || buffer.slice(0, 5).toString() === '<?xml') {
        p.image = '';
        await client.query('UPDATE products SET image = $1 WHERE id = $2', ['', p.id]);
        noSourceCount++;
        return;
      }

      // 2. Upload valid image buffer to ImageKit
      const upRes = await ik.upload({
        file: buffer,
        fileName: fileName,
        folder: '/priceteller-catalog/',
        useUniqueFileName: false,
      });

      const finalUrl = upRes.url || targetUrl;
      p.image = finalUrl;

      // 3. Update PostgreSQL
      await client.query('UPDATE products SET image = $1 WHERE id = $2', [finalUrl, p.id]);
      successCount++;
    } catch (err: any) {
      if (err?.message?.includes('already exists') || err?.error?.includes('already exists')) {
        p.image = targetUrl;
        await client.query('UPDATE products SET image = $1 WHERE id = $2', [targetUrl, p.id]);
        alreadyUploadedCount++;
      } else {
        console.warn(`[${index + 1}/${products.length}] Failed for ${p.id}:`, err?.message || err);
        failCount++;
      }
    }
  }

  // Worker queue
  const workers: Promise<void>[] = [];
  for (let w = 0; w < concurrency; w++) {
    workers.push(
      (async () => {
        while (currentIndex < products.length) {
          const idx = currentIndex++;
          const item = products[idx];
          await processItem(item, idx);

          const totalDone = successCount + alreadyUploadedCount + noSourceCount + failCount;
          if (totalDone % 50 === 0 || currentIndex >= products.length) {
            console.log(`📊 Progress: ${totalDone}/${products.length} (Uploaded: ${successCount}, Already on ImageKit: ${alreadyUploadedCount}, No image on source: ${noSourceCount}, Failed: ${failCount})`);
          }
        }
      })()
    );
  }

  await Promise.all(workers);

  // Save updated JSON
  fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), 'utf-8');
  client.release();

  console.log(`\n🎉 ImageKit Migration Completed Successfully!`);
  console.log(`   - Newly Uploaded to ImageKit: ${successCount}`);
  console.log(`   - Already on ImageKit: ${alreadyUploadedCount}`);
  console.log(`   - No source image available (clean fallback): ${noSourceCount}`);
  console.log(`   - Failed: ${failCount}`);
  console.log(`   - Database & local JSON updated with ImageKit URLs.`);

  return { successCount, alreadyUploadedCount, noSourceCount, failCount };
}

if (require.main === module) {
  migrateCatalogToImageKit(10)
    .then((r) => {
      console.log('Finished:', r);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal migration error:', err);
      process.exit(1);
    });
}
