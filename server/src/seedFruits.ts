import { pool, setPostgresConnected } from './db/pool';

export interface FruitEntry {
  idNum: number;
  englishName: string;
  malayalamName: string;
  imageUrl: string;
  emoji: string;
  badge?: string;
}

export const FRUITS_48_LIST: FruitEntry[] = [
  {
    idNum: 1,
    englishName: 'Apple',
    malayalamName: 'ആപ്പിൾ',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3194445.jpg',
    emoji: '🍎',
    badge: 'Farm Fresh',
  },
  {
    idNum: 2,
    englishName: 'Banana',
    malayalamName: 'വാഴപ്പഴം',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3136460.jpg',
    emoji: '🍌',
    badge: 'Daily Fresh',
  },
  {
    idNum: 3,
    englishName: 'Orange',
    malayalamName: 'ഓറഞ്ച്',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3137785.jpg',
    emoji: '🍊',
    badge: 'Citrus Fresh',
  },
  {
    idNum: 4,
    englishName: 'Mosambi',
    malayalamName: 'മുസംബി / മധുരനാരങ്ങ',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3136523.jpg',
    emoji: '🍊',
    badge: 'Juice Special',
  },
  {
    idNum: 5,
    englishName: 'Mango',
    malayalamName: 'മാമ്പഴം',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/catalog-ripe-mango.jpg',
    emoji: '🥭',
    badge: 'Seasonal King',
  },
  {
    idNum: 6,
    englishName: 'Black Grapes',
    malayalamName: 'മുന്തിരി',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3140459.jpg',
    emoji: '🍇',
    badge: 'Seedless',
  },
  {
    idNum: 7,
    englishName: 'Green Grapes',
    malayalamName: 'പച്ച മുന്തിരി',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3140766.jpg',
    emoji: '🍇',
    badge: 'Crisp & Sweet',
  },
  {
    idNum: 8,
    englishName: 'Pomegranate',
    malayalamName: 'ഉറുമാൻപഴം',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3136501.jpg',
    emoji: '🫐',
    badge: 'Premium Grade',
  },
  {
    idNum: 9,
    englishName: 'Guava',
    malayalamName: 'പേരയ്ക്ക',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3136501.jpg',
    emoji: '🍏',
    badge: 'Country Fresh',
  },
  {
    idNum: 10,
    englishName: 'Watermelon',
    malayalamName: 'തണ്ണിമത്തൻ',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3136927.jpg',
    emoji: '🍉',
    badge: 'Summer Sweet',
  },
  {
    idNum: 11,
    englishName: 'Shamam',
    malayalamName: 'ഷമാം',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3136927.jpg',
    emoji: '🍈',
    badge: 'Fresh Melon',
  },
  {
    idNum: 12,
    englishName: 'Pineapple',
    malayalamName: 'കൈതച്ചക്ക',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3197135.jpg',
    emoji: '🍍',
    badge: 'Vazhakulam Grade',
  },
  {
    idNum: 13,
    englishName: 'Jackfruit',
    malayalamName: 'ചക്ക',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/catalog-fresh-jackfruit.jpg',
    emoji: '🍈',
    badge: 'State Fruit',
  },
  {
    idNum: 14,
    englishName: 'Sapota',
    malayalamName: 'സപ്പോട്ട / ചിക്കു',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/catalog-sapota-chikoo.jpg',
    emoji: '🥔',
    badge: 'Sweet & Ripe',
  },
  {
    idNum: 15,
    englishName: 'Custard Apple',
    malayalamName: 'സീതപ്പഴം',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3194564.jpg',
    emoji: '🍈',
    badge: 'Creamy Ripe',
  },
  {
    idNum: 16,
    englishName: 'Rambutan',
    malayalamName: 'റംബൂട്ടാൻ',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/catalog-rambutan.jpg',
    emoji: '🔴',
    badge: 'Farm Fresh',
  },
  {
    idNum: 17,
    englishName: 'Lychee',
    malayalamName: 'ലിച്ചി',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/catalog-lychee.jpg',
    emoji: '🍒',
    badge: 'Sweet & Juicy',
  },
  {
    idNum: 18,
    englishName: 'Kiwi',
    malayalamName: 'കിവി',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3140461.jpg',
    emoji: '🥝',
    badge: 'Zespri Imported',
  },
  {
    idNum: 19,
    englishName: 'Dragon Fruit',
    malayalamName: 'ഡ്രാഗൺ ഫ്രൂട്ട്',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3137389.jpg',
    emoji: '🐉',
    badge: 'Exotic Red',
  },
  {
    idNum: 20,
    englishName: 'Avocado',
    malayalamName: 'അവോക്കാഡോ / വെണ്ണപ്പഴം',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3136456.jpg',
    emoji: '🥑',
    badge: 'Hass Butter',
  },
  {
    idNum: 21,
    englishName: 'Strawberry',
    malayalamName: 'സ്ട്രോബെറി',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3136670.jpg',
    emoji: '🍓',
    badge: 'Mahabaleshwar',
  },
  {
    idNum: 22,
    englishName: 'Blueberry',
    malayalamName: 'ബ്ലൂബെറി',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-4649866.jpg',
    emoji: '🫐',
    badge: 'Antioxidant Rich',
  },
  {
    idNum: 23,
    englishName: 'Raspberry',
    malayalamName: 'റാസ്ബെറി',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3136670.jpg',
    emoji: '🍓',
    badge: 'Fresh Berries',
  },
  {
    idNum: 24,
    englishName: 'Blackberry',
    malayalamName: 'ബ്ലാക്ക്ബെറി',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/catalog-blackberry.jpg',
    emoji: '🫐',
    badge: 'Fresh Berries',
  },
  {
    idNum: 25,
    englishName: 'Cherry',
    malayalamName: 'ചെറി',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3194464.jpg',
    emoji: '🍒',
    badge: 'Red Sweet',
  },
  {
    idNum: 26,
    englishName: 'Peach',
    malayalamName: 'പീച്ച്',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/catalog-peach.jpg',
    emoji: '🍑',
    badge: 'Juicy Stonefruit',
  },
  {
    idNum: 27,
    englishName: 'Plum',
    malayalamName: 'പ്ലം',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3196636.jpg',
    emoji: '🫐',
    badge: 'Red Sweet',
  },
  {
    idNum: 28,
    englishName: 'Pear',
    malayalamName: 'പിയർ / സബർജിൽ',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3196880.jpg',
    emoji: '🍐',
    badge: 'Crisp & Sweet',
  },
  {
    idNum: 29,
    englishName: 'Fig',
    malayalamName: 'അത്തിപ്പഴം',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3197150.jpg',
    emoji: '🫒',
    badge: 'Rich In Fibre',
  },
  {
    idNum: 30,
    englishName: 'Apricot',
    malayalamName: 'ആപ്രിക്കോട്ട്',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/catalog-apricot.jpg',
    emoji: '🍑',
    badge: 'Golden Sweet',
  },
  {
    idNum: 31,
    englishName: 'Persimmon',
    malayalamName: 'കാക്കിപ്പഴം',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/catalog-peach.jpg',
    emoji: '🍅',
    badge: 'Honey Sweet',
  },
  {
    idNum: 32,
    englishName: 'Passion Fruit',
    malayalamName: 'പാഷൻ ഫ്രൂട്ട്',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/catalog-passion-fruit.jpg',
    emoji: '🟣',
    badge: 'Tangy Sweet',
  },
  {
    idNum: 33,
    englishName: 'Star Fruit',
    malayalamName: 'ചതുരപ്പുളി / നക്ഷത്രപ്പുളി',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/catalog-star-fruit.jpg',
    emoji: '⭐',
    badge: 'Crisp Star',
  },
  {
    idNum: 34,
    englishName: 'Mangosteen',
    malayalamName: 'മാംഗോസ്റ്റീൻ',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/catalog-mangosteen.jpg',
    emoji: '🟣',
    badge: 'Queen of Fruits',
  },
  {
    idNum: 35,
    englishName: 'Durian',
    malayalamName: 'ദുരിയാൻ',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3197001.jpg',
    emoji: '🍈',
    badge: 'Exotic King',
  },
  {
    idNum: 36,
    englishName: 'Longan',
    malayalamName: 'ലോഗൻ',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/catalog-lychee.jpg',
    emoji: '🟤',
    badge: 'Dragon Eye',
  },
  {
    idNum: 37,
    englishName: 'Grapefruit',
    malayalamName: 'ചെറുമധുരനാരങ്ങ',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3137567.jpg',
    emoji: '🍊',
    badge: 'Pink Citrus',
  },
  {
    idNum: 38,
    englishName: 'Coconut',
    malayalamName: 'തേങ്ങ',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/catalog-fresh-coconut.jpg',
    emoji: '🥥',
    badge: 'Kerala Fresh',
  },
  {
    idNum: 39,
    englishName: 'Dates',
    malayalamName: 'ഈന്തപ്പഴം',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3197150.jpg',
    emoji: '🌴',
    badge: 'Premium Saudi',
  },
  {
    idNum: 40,
    englishName: 'Cranberry',
    malayalamName: 'ക്രാൻബെറി',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3136670.jpg',
    emoji: '🍒',
    badge: 'Tart & Rich',
  },
  {
    idNum: 41,
    englishName: 'Mulberry',
    malayalamName: 'മൾബെറി',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/catalog-mulberry.jpg',
    emoji: '🫐',
    badge: 'Farm Fresh',
  },
  {
    idNum: 42,
    englishName: 'Gooseberry',
    malayalamName: 'ഗൂസ്ബെറി',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/catalog-amla-gooseberry.jpg',
    emoji: '🟢',
    badge: 'Crisp & Tangy',
  },
  {
    idNum: 43,
    englishName: 'Amla',
    malayalamName: 'നെല്ലിക്ക',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/catalog-amla-gooseberry.jpg',
    emoji: '🟢',
    badge: 'Vitamin C Rich',
  },
  {
    idNum: 44,
    englishName: 'Tamarind',
    malayalamName: 'പുളി / വാളൻപുളി',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/catalog-tamarind.jpg',
    emoji: '🫘',
    badge: 'Ripe Pods',
  },
  {
    idNum: 45,
    englishName: 'Wood Apple',
    malayalamName: 'വിലാംപഴം',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3196880.jpg',
    emoji: '🥥',
    badge: 'Traditional Herb',
  },
  {
    idNum: 46,
    englishName: 'Bael',
    malayalamName: 'കൂവളം',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/catalog-amla-gooseberry.jpg',
    emoji: '🍈',
    badge: 'Sacred Herbal',
  },
  {
    idNum: 47,
    englishName: 'Pomelo',
    malayalamName: 'കമ്പിളി നാരങ്ങ',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3137785.jpg',
    emoji: '🍈',
    badge: 'Sweet Citrus',
  },
  {
    idNum: 48,
    englishName: 'Minneola',
    malayalamName: 'മിന്നിയോള',
    imageUrl: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-3137785.jpg',
    emoji: '🍊',
    badge: 'Honeybell Tangelo',
  },
];

export async function populateMasterFruitsCatalog(): Promise<{
  created: number;
  skippedOrUpdated: number;
  errors: number;
  items: any[];
}> {
  console.log('🚀 Starting Master Catalog 48 Fruits Population...');

  const client = await pool.connect();
  setPostgresConnected(true);
  console.log('✅ Connected to PostgreSQL for Master Catalog population.');

  try {
    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const processedItems: any[] = [];

    for (const fruit of FRUITS_48_LIST) {
      try {
        const slug = fruit.englishName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const productId = `fruit-${fruit.idNum}-${slug}`;

        const productPayload = {
          id: productId,
          name: fruit.malayalamName,
          categoryId: 'fruits',
          emoji: fruit.emoji,
          image: fruit.imageUrl,
          defaultUnit: '1 kg',
          availableUnits: ['500 g', '1 kg', '2 kg'],
          unitMultiplier: { '500 g': 0.5, '1 kg': 1, '2 kg': 2 },
          isOrganic: false,
          isSeasonal: false,
          badge: fruit.badge || 'Farm Fresh',
          nutritionalNote: fruit.englishName,
          prices: {},
          stockStatus: {},
          lastUpdated: new Date().toISOString(),
        };

        await client.query(`DELETE FROM products WHERE name = $1 OR id = $2`, [
          fruit.malayalamName,
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
          idNum: fruit.idNum,
          name: fruit.malayalamName,
          english: fruit.englishName,
          image: fruit.imageUrl,
        });
      } catch (err: any) {
        console.error(`Error adding fruit #${fruit.idNum} (${fruit.englishName}):`, err);
        errorCount++;
      }
    }

    console.log(`🎉 Master Catalog import finished: ${createdCount} created, ${updatedCount} updated, ${errorCount} errors.`);
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
  populateMasterFruitsCatalog()
    .then((res) => {
      console.log('Result:', JSON.stringify(res, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal import failure:', err);
      process.exit(1);
    });
}
