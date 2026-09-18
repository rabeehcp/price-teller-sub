import fs from 'fs';
import path from 'path';
import { KERALA_MALAYALAM_TRANSLATIONS } from './migrateProductNamesToMalayalam';

const dataFiles = [
  path.join(__dirname, '../data/pothysVegetables.json'),
  path.join(__dirname, '../data/pothysProducts.json'),
  path.join(__dirname, '../data/epeedikaProducts.json'),
];

for (const filePath of dataFiles) {
  if (!fs.existsSync(filePath)) continue;
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let updated = 0;
  for (const item of content) {
    const orig = item.name?.trim();
    if (!orig) continue;
    let target = KERALA_MALAYALAM_TRANSLATIONS[orig];
    if (!target) {
      let clean = orig
        .replace(/^Veg\s+/i, '')
        .replace(/^VEG\s+/i, '')
        .replace(/^Fresh\s+/i, '')
        .trim();
      target = KERALA_MALAYALAM_TRANSLATIONS[clean] || KERALA_MALAYALAM_TRANSLATIONS[`Veg ${clean}`];
    }
    if (target && target !== orig) {
      item.name = target;
      if (!item.englishNote) {
        item.englishNote = orig;
      }
      updated++;
    }
  }
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
  console.log(`Updated ${updated} items in ${path.basename(filePath)}`);
}
