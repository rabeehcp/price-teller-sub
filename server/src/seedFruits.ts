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
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Apple_With_White_Background.jpg',
    emoji: '🍎',
    badge: 'Farm Fresh',
  },
  {
    idNum: 2,
    englishName: 'Banana',
    malayalamName: 'വാഴപ്പഴം',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Banana_on_white_background.jpg',
    emoji: '🍌',
    badge: 'Daily Fresh',
  },
  {
    idNum: 3,
    englishName: 'Orange',
    malayalamName: 'ഓറഞ്ച്',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Oranges_white_background.jpg',
    emoji: '🍊',
    badge: 'Citrus Fresh',
  },
  {
    idNum: 4,
    englishName: 'Mosambi',
    malayalamName: 'മുസംബി / മധുരനാരങ്ങ',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Mosambi.JPG',
    emoji: '🍊',
    badge: 'Juice Special',
  },
  {
    idNum: 5,
    englishName: 'Mango',
    malayalamName: 'മാമ്പഴം',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Mango_on_a_white_background.png',
    emoji: '🥭',
    badge: 'Seasonal King',
  },
  {
    idNum: 6,
    englishName: 'Black Grapes',
    malayalamName: 'മുന്തിരി',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Grape_picture.jpg',
    emoji: '🍇',
    badge: 'Seedless',
  },
  {
    idNum: 7,
    englishName: 'Green Grapes',
    malayalamName: 'പച്ച മുന്തിരി',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Table_grapes_on_white.jpg',
    emoji: '🍇',
    badge: 'Crisp & Sweet',
  },
  {
    idNum: 8,
    englishName: 'Pomegranate',
    malayalamName: 'ഉറുമാൻപഴം',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Pomegranate_on_white.jpg',
    emoji: '🫐',
    badge: 'Premium Grade',
  },
  {
    idNum: 9,
    englishName: 'Guava',
    malayalamName: 'പേരയ്ക്ക',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Guava_fruit.jpg',
    emoji: '🍏',
    badge: 'Country Fresh',
  },
  {
    idNum: 10,
    englishName: 'Watermelon',
    malayalamName: 'തണ്ണിമത്തൻ',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Del_Mar_Packing_Watermelon_%2843117376454%29.jpg',
    emoji: '🍉',
    badge: 'Summer Sweet',
  },
  {
    idNum: 11,
    englishName: 'Shamam',
    malayalamName: 'ഷമാം',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Cucumis_melo_on_white_background.jpg',
    emoji: '🍈',
    badge: 'Fresh Melon',
  },
  {
    idNum: 12,
    englishName: 'Pineapple',
    malayalamName: 'കൈതച്ചക്ക',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Pineapple_and_cross_section.jpg',
    emoji: '🍍',
    badge: 'Vazhakulam Grade',
  },
  {
    idNum: 13,
    englishName: 'Jackfruit',
    malayalamName: 'ചക്ക',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Artocarpus_heterophyllus.jpg',
    emoji: '🍈',
    badge: 'State Fruit',
  },
  {
    idNum: 14,
    englishName: 'Sapota',
    malayalamName: 'സപ്പോട്ട / ചിക്കു',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Manilkara_zapota_-_Nispero_fruit_and_leaves_02.jpg',
    emoji: '🥔',
    badge: 'Sweet & Ripe',
  },
  {
    idNum: 15,
    englishName: 'Custard Apple',
    malayalamName: 'സീതപ്പഴം',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Annona_squamosa_(white_background).jpg',
    emoji: '🍈',
    badge: 'Creamy Ripe',
  },
  {
    idNum: 16,
    englishName: 'Rambutan',
    malayalamName: 'റംബൂട്ടാൻ',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Rambutan_white_background_alt.jpg',
    emoji: '🔴',
    badge: 'Farm Fresh',
  },
  {
    idNum: 17,
    englishName: 'Lychee',
    malayalamName: 'ലിച്ചി',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Lychee_(4245613997).jpg',
    emoji: '🍒',
    badge: 'Sweet & Juicy',
  },
  {
    idNum: 18,
    englishName: 'Kiwi',
    malayalamName: 'കിവി',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Kiwi_(Actinidia_chinensis)_1_Luc_Viatour.jpg',
    emoji: '🥝',
    badge: 'Zespri Imported',
  },
  {
    idNum: 19,
    englishName: 'Dragon Fruit',
    malayalamName: 'ഡ്രാഗൺ ഫ്രൂട്ട്',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Dragon_fruit_(pitaya)_on_white_background.jpg',
    emoji: '🐉',
    badge: 'Exotic Red',
  },
  {
    idNum: 20,
    englishName: 'Avocado',
    malayalamName: 'അവോക്കാഡോ / വെണ്ണപ്പഴം',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Hass_avocado_-white_background.jpg',
    emoji: '🥑',
    badge: 'Hass Butter',
  },
  {
    idNum: 21,
    englishName: 'Strawberry',
    malayalamName: 'സ്ട്രോബെറി',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Strawberry_on_white_background.jpg',
    emoji: '🍓',
    badge: 'Mahabaleshwar',
  },
  {
    idNum: 22,
    englishName: 'Blueberry',
    malayalamName: 'ബ്ലൂബെറി',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Single_Blueberry.jpg',
    emoji: '🫐',
    badge: 'Antioxidant Rich',
  },
  {
    idNum: 23,
    englishName: 'Raspberry',
    malayalamName: 'റാസ്ബെറി',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Three_Raspberries.jpg',
    emoji: '🍓',
    badge: 'Fresh Berries',
  },
  {
    idNum: 24,
    englishName: 'Blackberry',
    malayalamName: 'ബ്ലാക്ക്ബെറി',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Blackberry_(Rubus_fruticosus).jpg',
    emoji: '🫐',
    badge: 'Fresh Berries',
  },
  {
    idNum: 25,
    englishName: 'Cherry',
    malayalamName: 'ചെറി',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Cherry_fruit_on_white_background.jpg',
    emoji: '🍒',
    badge: 'Red Sweet',
  },
  {
    idNum: 26,
    englishName: 'Peach',
    malayalamName: 'പീച്ച്',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/White_peach_and_cross_section.jpg',
    emoji: '🍑',
    badge: 'Juicy Stonefruit',
  },
  {
    idNum: 27,
    englishName: 'Plum',
    malayalamName: 'പ്ലം',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Red-Plums.jpg',
    emoji: '🫐',
    badge: 'Red Sweet',
  },
  {
    idNum: 28,
    englishName: 'Pear',
    malayalamName: 'പിയർ / സബർജിൽ',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Rocha_Pear_2017_A1.jpg',
    emoji: '🍐',
    badge: 'Crisp & Sweet',
  },
  {
    idNum: 29,
    englishName: 'Fig',
    malayalamName: 'അത്തിപ്പഴം',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Ficus_carica_.jpg',
    emoji: '🫒',
    badge: 'Rich In Fibre',
  },
  {
    idNum: 30,
    englishName: 'Apricot',
    malayalamName: 'ആപ്രിക്കോട്ട്',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Apricot_whole444.jpg',
    emoji: '🍑',
    badge: 'Golden Sweet',
  },
  {
    idNum: 31,
    englishName: 'Persimmon',
    malayalamName: 'കാക്കിപ്പഴം',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Persimmon_2017_B3.jpg',
    emoji: '🍅',
    badge: 'Honey Sweet',
  },
  {
    idNum: 32,
    englishName: 'Passion Fruit',
    malayalamName: 'പാഷൻ ഫ്രൂട്ട്',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Passiflora_edulis_fruit_on_white_backgroung.jpg',
    emoji: '🟣',
    badge: 'Tangy Sweet',
  },
  {
    idNum: 33,
    englishName: 'Star Fruit',
    malayalamName: 'ചതുരപ്പുളി / നക്ഷത്രപ്പുളി',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Averrhoa_carambola_Fruit.JPG',
    emoji: '⭐',
    badge: 'Crisp Star',
  },
  {
    idNum: 34,
    englishName: 'Mangosteen',
    malayalamName: 'മാംഗോസ്റ്റീൻ',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Mangosteen1.jpg',
    emoji: '🟣',
    badge: 'Queen of Fruits',
  },
  {
    idNum: 35,
    englishName: 'Durian',
    malayalamName: 'ദുരിയാൻ',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Durian_fruit.JPG',
    emoji: '🍈',
    badge: 'Exotic King',
  },
  {
    idNum: 36,
    englishName: 'Longan',
    malayalamName: 'ലോഗൻ',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Longan_fruits.jpg',
    emoji: '🟤',
    badge: 'Dragon Eye',
  },
  {
    idNum: 37,
    englishName: 'Grapefruit',
    malayalamName: 'ചെറുമധുരനാരങ്ങ',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Citrus_paradisi_(Grapefruit,_pink)_white_bg.jpg',
    emoji: '🍊',
    badge: 'Pink Citrus',
  },
  {
    idNum: 38,
    englishName: 'Coconut',
    malayalamName: 'തേങ്ങ',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Coconut_on_white_background.jpg',
    emoji: '🥥',
    badge: 'Kerala Fresh',
  },
  {
    idNum: 39,
    englishName: 'Dates',
    malayalamName: 'ഈന്തപ്പഴം',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Phoenix_(botanical)_финики.jpg',
    emoji: '🌴',
    badge: 'Premium Saudi',
  },
  {
    idNum: 40,
    englishName: 'Cranberry',
    malayalamName: 'ക്രാൻബെറി',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Cranberry_cross_section.JPG',
    emoji: '🍒',
    badge: 'Tart & Rich',
  },
  {
    idNum: 41,
    englishName: 'Mulberry',
    malayalamName: 'മൾബെറി',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Morus_Rubra_ripe_fruit.jpg',
    emoji: '🫐',
    badge: 'Farm Fresh',
  },
  {
    idNum: 42,
    englishName: 'Gooseberry',
    malayalamName: 'ഗൂസ്ബെറി',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Gooseberries.jpg',
    emoji: '🟢',
    badge: 'Crisp & Tangy',
  },
  {
    idNum: 43,
    englishName: 'Amla',
    malayalamName: 'നെല്ലിക്ക',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Indian_Gooseberry_(Amla).jpg',
    emoji: '🟢',
    badge: 'Vitamin C Rich',
  },
  {
    idNum: 44,
    englishName: 'Tamarind',
    malayalamName: 'പുളി / വാളൻപുളി',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Tamarind_fruit.jpg',
    emoji: '🫘',
    badge: 'Ripe Pods',
  },
  {
    idNum: 45,
    englishName: 'Wood Apple',
    malayalamName: 'വിലാംപഴം',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Limonia_acidissima_syn_Limonia_elephantum_or_Fernonia_limonia_(wood-apple)_in_Talakona_forest,_AP_W_IMG_8333.jpg',
    emoji: '🥥',
    badge: 'Traditional Herb',
  },
  {
    idNum: 46,
    englishName: 'Bael',
    malayalamName: 'കൂവളം',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Bael_fruit_(4).jpg',
    emoji: '🍈',
    badge: 'Sacred Herbal',
  },
  {
    idNum: 47,
    englishName: 'Pomelo',
    malayalamName: 'കമ്പിളി നാരങ്ങ',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Citrus_grandis_-_Honey_White.jpg',
    emoji: '🍈',
    badge: 'Sweet Citrus',
  },
  {
    idNum: 48,
    englishName: 'Minneola',
    malayalamName: 'മിന്നിയോള',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Minneola_fruit.jpg',
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
