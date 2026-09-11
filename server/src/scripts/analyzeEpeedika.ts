import fs from 'fs';
import path from 'path';
import { pool } from '../db/pool';

async function run() {
  const res = await pool.query('SELECT id, name, category_id, image FROM products');
  const dbProducts = res.rows;
  console.log(`Total DB products: ${dbProducts.length}`);

  // Fetch epeedika page
  const response = await fetch('https://epeedikaonline.com/products/grocery', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const html = await response.text();

  const itemBlocks = html.split('<div class="featured__item">').slice(1);
  console.log(`Found item blocks: ${itemBlocks.length}`);

  const items: any[] = [];
  for (const block of itemBlocks) {
    const titleMatch = block.match(/<h6>\s*<a[^>]*>([\s\S]*?)<\/a>\s*<\/h6>/);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const imgMatch = block.match(/<img[^>]*src=[\x27\x22]([^\x27\x22]+)[\x27\x22]/);
    const imgUrl = imgMatch ? imgMatch[1].trim() : '';

    const idMatch = block.match(/data-product_id=[\x27\x22](\d+)[\x27\x22]/);
    const id = idMatch ? idMatch[1].trim() : '';

    const spMatch = block.match(/<h5>\s*₹\s*([\d\.]+)\s*<\/h5>/);
    const sp = spMatch ? parseFloat(spMatch[1]) : 0;

    const mrpMatch = block.match(/regular-price[^>]*>\s*₹\s*([\d\.]+)\s*<\/span>/);
    const mrp = mrpMatch ? parseFloat(mrpMatch[1]) : sp;

    if (title && id) {
      items.push({ id, title, imgUrl, sp, mrp });
    }
  }

  // Check image validity for all 260
  // Specifically:
  // 1. Is URL valid?
  // 2. Is it a placeholder image? (e.g. check if multiple products share the exact same image filename)
  const imgUrlCount = new Map<string, number>();
  for (const it of items) {
    imgUrlCount.set(it.imgUrl, (imgUrlCount.get(it.imgUrl) || 0) + 1);
  }

  const sharedImages = Array.from(imgUrlCount.entries()).filter(([url, count]) => count > 1);
  console.log(`Images shared by multiple products: ${sharedImages.length}`);
  for (const [url, count] of sharedImages) {
    console.log(`  Shared ${count} times: ${url}`);
    const sharingProds = items.filter(it => it.imgUrl === url).map(it => `[${it.id}] ${it.title}`);
    console.log(`    Products:`, sharingProds);
  }

  // Save the raw parsed items to scratch
  const outPath = path.join(__dirname, '..', 'data', 'epeedikaRawGrocery.json');
  fs.writeFileSync(outPath, JSON.stringify(items, null, 2), 'utf-8');
  console.log(`Saved raw items to ${outPath}`);

  process.exit(0);
}

run().catch(console.error);
