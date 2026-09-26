import fs from 'fs';
import path from 'path';

async function exportAllProducts() {
  try {
    console.log('Fetching all products from local server API...');
    const res = await fetch('http://localhost:5000/api/products');
    const json = await res.json();
    const products = json.data || [];

    console.log(`Fetched ${products.length} products. Processing categories...`);

    // Group products by category
    const byCategory = {};
    const suspiciousItems = [];

    // Keyword detection heuristics for miscategorization
    const heuristics = [
      {
        expectedCat: 'oils-sugar',
        keywords: ['oil', 'ghee', 'വെളിച്ചെണ്ണ', 'sugar', 'jaggery', 'ശർക്കര', 'പഞ്ചസാര'],
        notIn: ['oils-sugar', 'oils-spices']
      },
      {
        expectedCat: 'rice-grains',
        keywords: ['rice', 'അരി', 'atta', 'wheat', 'flour', 'ഗോതമ്പ്', 'rava', 'sooji', 'maida'],
        notIn: ['rice-grains', 'atta-flours', 'staples']
      },
      {
        expectedCat: 'pulses-legumes',
        keywords: ['dal', 'പരിപ്പ്', 'gram', 'chana', 'kadala', 'കടല', 'payar', 'പയർ', 'urad', 'moong', 'rajma', 'peas'],
        notIn: ['pulses-legumes', 'rice-grains', 'staples']
      },
      {
        expectedCat: 'beverages',
        keywords: ['tea', 'ചായ', 'coffee', 'കാപ്പി', 'horlicks', 'boost', 'bournvita', 'juice', 'squash'],
        notIn: ['beverages', 'tea-coffee', 'juices']
      },
      {
        expectedCat: 'spices',
        keywords: ['masala', 'pepper', 'chilli powder', 'turmeric', 'മഞ്ഞൾ', 'മുളക്', 'coriander', 'മല്ലി', 'cumin', 'ജീരകം', 'cardamom', 'ഏലയ്ക്ക', 'clove', 'കറുവപ്പട്ട', 'കടുക്', 'mustard'],
        notIn: ['spices', 'oils-spices']
      },
      {
        expectedCat: 'cleaning-household',
        keywords: ['detergent', 'washing', 'surf', 'ariel', 'tide', 'comfort', 'dishwash', 'vim', 'harpic', 'lyzol', 'floor cleaner'],
        notIn: ['cleaning-household', 'household']
      },
      {
        expectedCat: 'personal-care',
        keywords: ['soap', 'shampoo', 'toothpaste', 'brush', 'cream', 'lotion', 'powder', 'hair oil', 'facewash', 'deodorant'],
        notIn: ['personal-care', 'cosmetics']
      }
    ];

    products.forEach((p) => {
      const cat = p.categoryId || 'uncategorized';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(p);

      // Check heuristics
      const lowerName = (p.name || '').toLowerCase();
      for (const h of heuristics) {
        if (h.notIn.includes(cat)) {
          const match = h.keywords.find((k) => lowerName.includes(k));
          if (match) {
            suspiciousItems.push({
              id: p.id,
              name: p.name,
              currentCat: cat,
              suggestedCat: h.expectedCat,
              matchedKeyword: match
            });
            break;
          }
        }
      }
    });

    // 1. Build CSV Export
    let csvContent = 'Product ID,Product Name,Category ID,Default Unit,Price (₹)\n';
    products.forEach((p) => {
      const samplePrice = p.prices ? Object.values(p.prices)[0] || '' : '';
      const safeName = `"${(p.name || '').replace(/"/g, '""')}"`;
      csvContent += `${p.id},${safeName},${p.categoryId || ''},${p.defaultUnit || ''},${samplePrice}\n`;
    });
    fs.writeFileSync('c:/Users/hp/price-teller-sub/all_products_by_category.csv', csvContent, 'utf8');
    console.log('✅ CSV written to c:/Users/hp/price-teller-sub/all_products_by_category.csv');

    // 2. Build JSON Export
    const jsonOutput = {
      totalProducts: products.length,
      categoryCounts: Object.fromEntries(Object.entries(byCategory).map(([k, v]) => [k, v.length])),
      suspiciousMiscategorizedCount: suspiciousItems.length,
      suspiciousMiscategorizedSample: suspiciousItems.slice(0, 50),
      categories: byCategory
    };
    fs.writeFileSync('c:/Users/hp/price-teller-sub/all_products_by_category.json', JSON.stringify(jsonOutput, null, 2), 'utf8');
    console.log('✅ JSON written to c:/Users/hp/price-teller-sub/all_products_by_category.json');

    // 3. Build Detailed Markdown Artifact
    let md = `# Complete PeediyaCart Product Catalog by Category\n\n`;
    md += `**Total Catalog Products:** ${products.length} items across ${Object.keys(byCategory).length} categories.\n\n`;
    md += `> [!NOTE]\n`;
    md += `> This report lists every single product currently in the database along with its assigned category.\n`;
    md += `> Full CSV export is saved at: [all_products_by_category.csv](file:///c:/Users/hp/price-teller-sub/all_products_by_category.csv)\n`;
    md += `> Full JSON export is saved at: [all_products_by_category.json](file:///c:/Users/hp/price-teller-sub/all_products_by_category.json)\n\n`;

    md += `## 📊 Category Summary Breakdown\n\n`;
    md += `| Category ID | Category Name | Total Item Count |\n`;
    md += `| :--- | :--- | :--- |\n`;
    Object.entries(byCategory)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([cat, items]) => {
        md += `| \`${cat}\` | **${cat.toUpperCase().replace('-', ' ')}** | **${items.length}** |\n`;
      });

    if (suspiciousItems.length > 0) {
      md += `\n\n## ⚠️ Suspected Miscategorized Items (${suspiciousItems.length} items found)\n`;
      md += `These items appear to have been sorted into unexpected categories (e.g. staples/dal/oil inside \`biscuits-snacks\`):\n\n`;
      md += `| Product ID | Product Name | Current Category | Suggested Category | Matched Keyword |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- |\n`;
      suspiciousItems.slice(0, 100).forEach((s) => {
        md += `| \`${s.id}\` | ${s.name} | \`${s.currentCat}\` | **\`${s.suggestedCat}\`** | *${s.matchedKeyword}* |\n`;
      });
      if (suspiciousItems.length > 100) {
        md += `\n*... and ${suspiciousItems.length - 100} more suspected items (see full CSV/JSON for complete list).*\n`;
      }
    }

    md += `\n\n---\n\n## 📦 Complete Product Listings by Category\n\n`;

    Object.entries(byCategory)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([cat, items]) => {
        md += `### Category: \`${cat}\` (${items.length} items)\n\n`;
        md += `| No. | Product ID | Product Name | Unit | Sample Price |\n`;
        md += `| :--- | :--- | :--- | :--- | :--- |\n`;
        items.forEach((p, idx) => {
          const samplePrice = p.prices ? Object.values(p.prices)[0] || '-' : '-';
          md += `| ${idx + 1} | \`${p.id}\` | ${p.name} | ${p.defaultUnit || '-'} | ₹${samplePrice} |\n`;
        });
        md += `\n\n`;
      });

    const artifactPath = 'C:/Users/hp/.gemini/antigravity-ide/brain/93cb01b3-c42c-433e-b2d2-2b60d62ded9d/all_products_catalog_by_category.md';
    fs.writeFileSync(artifactPath, md, 'utf8');
    console.log(`✅ Artifact written to ${artifactPath}`);

  } catch (err) {
    console.error('Error exporting products:', err);
  }
}

exportAllProducts();
