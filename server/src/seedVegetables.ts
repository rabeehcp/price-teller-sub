import { pool, setPostgresConnected } from './db/pool';

export interface VegetableEntry {
  idNum: number;
  englishName: string;
  malayalamName: string;
  emoji: string;
  defaultUnit: string;
  availableUnits: string[];
  unitMultiplier: Record<string, number>;
  badge?: string;
}

export const VEGETABLES_37_LIST: VegetableEntry[] = [
  {
    idNum: 1,
    englishName: 'Tomato',
    malayalamName: 'തക്കാളി',
    emoji: '🍅',
    defaultUnit: '1 kg',
    availableUnits: ['500 g', '1 kg', '2 kg'],
    unitMultiplier: { '500 g': 0.5, '1 kg': 1, '2 kg': 2 },
    badge: 'Daily Fresh',
  },
  {
    idNum: 2,
    englishName: 'Potato',
    malayalamName: 'ഉരുളക്കിഴങ്ങ്',
    emoji: '🥔',
    defaultUnit: '1 kg',
    availableUnits: ['500 g', '1 kg', '2 kg', '5 kg'],
    unitMultiplier: { '500 g': 0.5, '1 kg': 1, '2 kg': 2, '5 kg': 5 },
    badge: 'Farm Fresh',
  },
  {
    idNum: 3,
    englishName: 'Big Onion',
    malayalamName: 'സവാള',
    emoji: '🧅',
    defaultUnit: '1 kg',
    availableUnits: ['500 g', '1 kg', '2 kg', '5 kg'],
    unitMultiplier: { '500 g': 0.5, '1 kg': 1, '2 kg': 2, '5 kg': 5 },
    badge: 'Daily Essential',
  },
  {
    idNum: 4,
    englishName: 'Small Onion / Shallots',
    malayalamName: 'ചെറിയ ഉള്ളി',
    emoji: '🧅',
    defaultUnit: '1 kg',
    availableUnits: ['250 g', '500 g', '1 kg'],
    unitMultiplier: { '250 g': 0.25, '500 g': 0.5, '1 kg': 1 },
    badge: 'Naadan Special',
  },
  {
    idNum: 5,
    englishName: 'Ladies Finger / Okra',
    malayalamName: 'വെണ്ടക്ക',
    emoji: '🥬',
    defaultUnit: '1 kg',
    availableUnits: ['250 g', '500 g', '1 kg'],
    unitMultiplier: { '250 g': 0.25, '500 g': 0.5, '1 kg': 1 },
    badge: 'Tender & Fresh',
  },
  {
    idNum: 6,
    englishName: 'Brinjal / Eggplant',
    malayalamName: 'വഴുതന',
    emoji: '🍆',
    defaultUnit: '1 kg',
    availableUnits: ['500 g', '1 kg', '2 kg'],
    unitMultiplier: { '500 g': 0.5, '1 kg': 1, '2 kg': 2 },
    badge: 'Farm Fresh',
  },
  {
    idNum: 7,
    englishName: 'Green Chilli',
    malayalamName: 'പച്ചമുളക്',
    emoji: '🌶️',
    defaultUnit: '1 kg',
    availableUnits: ['100 g', '250 g', '500 g', '1 kg'],
    unitMultiplier: { '100 g': 0.1, '250 g': 0.25, '500 g': 0.5, '1 kg': 1 },
    badge: 'Spicy Hot',
  },
  {
    idNum: 8,
    englishName: 'Long Beans / Yardlong Beans',
    malayalamName: 'പയർ',
    emoji: '🫘',
    defaultUnit: '1 kg',
    availableUnits: ['250 g', '500 g', '1 kg'],
    unitMultiplier: { '250 g': 0.25, '500 g': 0.5, '1 kg': 1 },
    badge: 'Crisp & Tender',
  },
  {
    idNum: 9,
    englishName: 'Drumstick',
    malayalamName: 'മുരിങ്ങക്കായ',
    emoji: '🥢',
    defaultUnit: '1 kg',
    availableUnits: ['250 g', '500 g', '1 kg'],
    unitMultiplier: { '250 g': 0.25, '500 g': 0.5, '1 kg': 1 },
    badge: 'Fresh Harvest',
  },
  {
    idNum: 10,
    englishName: 'Bitter Gourd',
    malayalamName: 'പാവയ്ക്ക',
    emoji: '🥒',
    defaultUnit: '1 kg',
    availableUnits: ['250 g', '500 g', '1 kg'],
    unitMultiplier: { '250 g': 0.25, '500 g': 0.5, '1 kg': 1 },
    badge: 'Naadan Quality',
  },
  {
    idNum: 11,
    englishName: 'Snake Gourd',
    malayalamName: 'പടവലങ്ങ',
    emoji: '🥒',
    defaultUnit: '1 kg',
    availableUnits: ['500 g', '1 kg', '2 kg'],
    unitMultiplier: { '500 g': 0.5, '1 kg': 1, '2 kg': 2 },
    badge: 'Farm Fresh',
  },
  {
    idNum: 12,
    englishName: 'Bottle Gourd',
    malayalamName: 'ചുരയ്ക്ക',
    emoji: '🥒',
    defaultUnit: '1 kg',
    availableUnits: ['500 g', '1 kg', '2 kg'],
    unitMultiplier: { '500 g': 0.5, '1 kg': 1, '2 kg': 2 },
    badge: 'Hydrating & Fresh',
  },
  {
    idNum: 13,
    englishName: 'Ash Gourd',
    malayalamName: 'കുമ്പളങ്ങ',
    emoji: '🍈',
    defaultUnit: '1 kg',
    availableUnits: ['500 g', '1 kg', '2 kg'],
    unitMultiplier: { '500 g': 0.5, '1 kg': 1, '2 kg': 2 },
    badge: 'Daily Fresh',
  },
  {
    idNum: 14,
    englishName: 'Pumpkin',
    malayalamName: 'മത്തങ്ങ',
    emoji: '🎃',
    defaultUnit: '1 kg',
    availableUnits: ['500 g', '1 kg', '2 kg'],
    unitMultiplier: { '500 g': 0.5, '1 kg': 1, '2 kg': 2 },
    badge: 'Sweet & Ripe',
  },
  {
    idNum: 15,
    englishName: 'Cucumber / Malabar Cucumber',
    malayalamName: 'വെള്ളരിക്ക',
    emoji: '🥒',
    defaultUnit: '1 kg',
    availableUnits: ['500 g', '1 kg', '2 kg'],
    unitMultiplier: { '500 g': 0.5, '1 kg': 1, '2 kg': 2 },
    badge: 'Crisp & Cool',
  },
  {
    idNum: 16,
    englishName: 'Ivy Gourd',
    malayalamName: 'കോവയ്ക്ക',
    emoji: '🫒',
    defaultUnit: '1 kg',
    availableUnits: ['250 g', '500 g', '1 kg'],
    unitMultiplier: { '250 g': 0.25, '500 g': 0.5, '1 kg': 1 },
    badge: 'Farm Fresh',
  },
  {
    idNum: 17,
    englishName: 'Ridge Gourd',
    malayalamName: 'പീച്ചിങ്ങ',
    emoji: '🥒',
    defaultUnit: '1 kg',
    availableUnits: ['500 g', '1 kg'],
    unitMultiplier: { '500 g': 0.5, '1 kg': 1 },
    badge: 'Tender Cut',
  },
  {
    idNum: 18,
    englishName: 'Elephant Foot Yam',
    malayalamName: 'ചേന',
    emoji: '🥔',
    defaultUnit: '1 kg',
    availableUnits: ['500 g', '1 kg', '2 kg'],
    unitMultiplier: { '500 g': 0.5, '1 kg': 1, '2 kg': 2 },
    badge: 'Naadan Chena',
  },
  {
    idNum: 19,
    englishName: 'Taro Root / Colocasia',
    malayalamName: 'ചേമ്പ്',
    emoji: '🥔',
    defaultUnit: '1 kg',
    availableUnits: ['500 g', '1 kg'],
    unitMultiplier: { '500 g': 0.5, '1 kg': 1 },
    badge: 'Country Quality',
  },
  {
    idNum: 20,
    englishName: 'Tapioca / Cassava',
    malayalamName: 'കപ്പ',
    emoji: '🪵',
    defaultUnit: '1 kg',
    availableUnits: ['1 kg', '2 kg', '5 kg'],
    unitMultiplier: { '1 kg': 1, '2 kg': 2, '5 kg': 5 },
    badge: 'Kerala Special',
  },
  {
    idNum: 21,
    englishName: 'Chinese Potato',
    malayalamName: 'കൂർക്ക',
    emoji: '🥔',
    defaultUnit: '1 kg',
    availableUnits: ['500 g', '1 kg', '2 kg'],
    unitMultiplier: { '500 g': 0.5, '1 kg': 1, '2 kg': 2 },
    badge: 'Seasonal Root',
  },
  {
    idNum: 22,
    englishName: 'Sweet Potato',
    malayalamName: 'മധുരക്കിഴങ്ങ്',
    emoji: '🍠',
    defaultUnit: '1 kg',
    availableUnits: ['500 g', '1 kg', '2 kg'],
    unitMultiplier: { '500 g': 0.5, '1 kg': 1, '2 kg': 2 },
    badge: 'Rich & Sweet',
  },
  {
    idNum: 23,
    englishName: 'Carrot',
    malayalamName: 'കാരറ്റ്',
    emoji: '🥕',
    defaultUnit: '1 kg',
    availableUnits: ['250 g', '500 g', '1 kg', '2 kg'],
    unitMultiplier: { '250 g': 0.25, '500 g': 0.5, '1 kg': 1, '2 kg': 2 },
    badge: 'Ooty Fresh',
  },
  {
    idNum: 24,
    englishName: 'Beetroot',
    malayalamName: 'ബീറ്റ്റൂട്ട്',
    emoji: '🫒',
    defaultUnit: '1 kg',
    availableUnits: ['500 g', '1 kg', '2 kg'],
    unitMultiplier: { '500 g': 0.5, '1 kg': 1, '2 kg': 2 },
    badge: 'Vibrant & Sweet',
  },
  {
    idNum: 25,
    englishName: 'Radish',
    malayalamName: 'മുള്ളങ്കി',
    emoji: '🥕',
    defaultUnit: '1 kg',
    availableUnits: ['500 g', '1 kg'],
    unitMultiplier: { '500 g': 0.5, '1 kg': 1 },
    badge: 'Crispy White',
  },
  {
    idNum: 26,
    englishName: 'Cabbage',
    malayalamName: 'കാബേജ്',
    emoji: '🥬',
    defaultUnit: '1 kg',
    availableUnits: ['500 g', '1 kg', '2 kg'],
    unitMultiplier: { '500 g': 0.5, '1 kg': 1, '2 kg': 2 },
    badge: 'Farm Crisp',
  },
  {
    idNum: 27,
    englishName: 'Cauliflower',
    malayalamName: 'കോളിഫ്ലവർ',
    emoji: '🥦',
    defaultUnit: '1 unit',
    availableUnits: ['1 unit', '2 units'],
    unitMultiplier: { '1 unit': 1, '2 units': 2 },
    badge: 'Snow White',
  },
  {
    idNum: 28,
    englishName: 'French Beans',
    malayalamName: 'ബീൻസ്',
    emoji: '🫘',
    defaultUnit: '1 kg',
    availableUnits: ['250 g', '500 g', '1 kg'],
    unitMultiplier: { '250 g': 0.25, '500 g': 0.5, '1 kg': 1 },
    badge: 'Tender French Cut',
  },
  {
    idNum: 29,
    englishName: 'Green Peas',
    malayalamName: 'ഗ്രീൻ പീസ്',
    emoji: '🫛',
    defaultUnit: '1 kg',
    availableUnits: ['250 g', '500 g', '1 kg'],
    unitMultiplier: { '250 g': 0.25, '500 g': 0.5, '1 kg': 1 },
    badge: 'Sweet & Tender',
  },
  {
    idNum: 30,
    englishName: 'Spinach / Cheera',
    malayalamName: 'ചീര',
    emoji: '🥬',
    defaultUnit: '1 bunch',
    availableUnits: ['1 bunch', '2 bunches', '3 bunches'],
    unitMultiplier: { '1 bunch': 1, '2 bunches': 2, '3 bunches': 3 },
    badge: 'Fresh Greens 🌿',
  },
  {
    idNum: 31,
    englishName: 'Moringa Leaves',
    malayalamName: 'മുരിങ്ങയില',
    emoji: '🌿',
    defaultUnit: '1 bunch',
    availableUnits: ['1 bunch', '2 bunches'],
    unitMultiplier: { '1 bunch': 1, '2 bunches': 2 },
    badge: 'Superfood Greens',
  },
  {
    idNum: 32,
    englishName: 'Ginger',
    malayalamName: 'ഇഞ്ചി',
    emoji: '🫚',
    defaultUnit: '1 kg',
    availableUnits: ['100 g', '250 g', '500 g', '1 kg'],
    unitMultiplier: { '100 g': 0.1, '250 g': 0.25, '500 g': 0.5, '1 kg': 1 },
    badge: 'Wayanad Fresh',
  },
  {
    idNum: 33,
    englishName: 'Garlic',
    malayalamName: 'വെളുത്തുള്ളി',
    emoji: '🧄',
    defaultUnit: '1 kg',
    availableUnits: ['250 g', '500 g', '1 kg'],
    unitMultiplier: { '250 g': 0.25, '500 g': 0.5, '1 kg': 1 },
    badge: 'Pure Aromatic',
  },
  {
    idNum: 34,
    englishName: 'Curry Leaves',
    malayalamName: 'കറിവേപ്പില',
    emoji: '🌿',
    defaultUnit: '1 bunch',
    availableUnits: ['1 bunch', '2 bunches', '100 g'],
    unitMultiplier: { '1 bunch': 1, '2 bunches': 2, '100 g': 1 },
    badge: 'Aromatic Naadan',
  },
  {
    idNum: 35,
    englishName: 'Coriander Leaves',
    malayalamName: 'മല്ലിയില',
    emoji: '🌿',
    defaultUnit: '1 bunch',
    availableUnits: ['1 bunch', '2 bunches', '3 bunches'],
    unitMultiplier: { '1 bunch': 1, '2 bunches': 2, '3 bunches': 3 },
    badge: 'Fresh Herbs',
  },
  {
    idNum: 36,
    englishName: 'Mint Leaves / Pudina',
    malayalamName: 'പുതിന',
    emoji: '🌿',
    defaultUnit: '1 bunch',
    availableUnits: ['1 bunch', '2 bunches', '3 bunches'],
    unitMultiplier: { '1 bunch': 1, '2 bunches': 2, '3 bunches': 3 },
    badge: 'Cooling Aroma',
  },
  {
    idNum: 37,
    englishName: 'Capsicum / Bell Pepper',
    malayalamName: 'കാപ്സിക്കം',
    emoji: '🫑',
    defaultUnit: '1 kg',
    availableUnits: ['250 g', '500 g', '1 kg'],
    unitMultiplier: { '250 g': 0.25, '500 g': 0.5, '1 kg': 1 },
    badge: 'Crisp & Sweet',
  },
];

export async function populateMasterVegetablesCatalog() {
  console.log(`🚀 Starting Master Catalog import for ${VEGETABLES_37_LIST.length} vegetables...`);

  const client = await pool.connect();
  setPostgresConnected(true);
  console.log('✅ Connected to PostgreSQL for Master Catalog vegetables population.');

  try {
    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const processedItems: any[] = [];

    for (const veg of VEGETABLES_37_LIST) {
      try {
        const slug = veg.englishName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const productId = `veg-${veg.idNum}-${slug}`;

        const productPayload = {
          id: productId,
          name: veg.malayalamName,
          categoryId: 'vegetables',
          emoji: veg.emoji,
          image: '',
          defaultUnit: veg.defaultUnit,
          availableUnits: veg.availableUnits,
          unitMultiplier: veg.unitMultiplier,
          isOrganic: false,
          isSeasonal: false,
          badge: veg.badge || 'Daily Fresh',
          nutritionalNote: veg.englishName,
          prices: {},
          stockStatus: {},
          lastUpdated: new Date().toISOString(),
        };

        await client.query(`DELETE FROM products WHERE name = $1 OR id = $2`, [
          veg.malayalamName,
          productId,
        ]);

        await client.query(
          `INSERT INTO products (id, name, category_id, emoji, image, default_unit, available_units, unit_multiplier, is_organic, is_seasonal, badge, nutritional_note, prices, stock_status, last_updated)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            productPayload.id,
            productPayload.name,
            productPayload.categoryId,
            productPayload.emoji,
            productPayload.image,
            productPayload.defaultUnit,
            JSON.stringify(productPayload.availableUnits),
            JSON.stringify(productPayload.unitMultiplier),
            productPayload.isOrganic,
            productPayload.isSeasonal,
            productPayload.badge,
            productPayload.nutritionalNote,
            JSON.stringify(productPayload.prices),
            JSON.stringify(productPayload.stockStatus),
            productPayload.lastUpdated,
          ]
        );
        createdCount++;

        processedItems.push({
          idNum: veg.idNum,
          name: veg.malayalamName,
          english: veg.englishName,
          unit: veg.defaultUnit,
        });
      } catch (err: any) {
        console.error(`Error adding vegetable #${veg.idNum} (${veg.englishName}):`, err);
        errorCount++;
      }
    }

    console.log(`🎉 Master Vegetables Catalog import finished: ${createdCount} created, ${updatedCount} updated, ${errorCount} errors.`);
    return {
      created: createdCount,
      skippedOrUpdated: updatedCount,
      errors: errorCount,
      items: processedItems,
    };
  } finally {
    client.release();
  }
}

if (require.main === module) {
  populateMasterVegetablesCatalog()
    .then((res) => {
      console.log('Result:', JSON.stringify(res, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal import failure:', err);
      process.exit(1);
    });
}
