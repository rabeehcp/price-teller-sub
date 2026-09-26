const { pool } = require('../dist/db/pool');

// High-precision rules for categorizing supermarket products in Kerala
const CATEGORY_RULES = [
  // 1. FRESH FISH
  {
    category: 'fish',
    patterns: [
      /\b(fish|prawn|prawns|chemmeen|mathi|sardine|ayala|mackerel|karimeen|neymeen|seer\s*fish|choora|tuna|kilimeen|kallummakkaya|mussel|squid|koonthal|crab|nandu|rohu|katla|pomfret|avoli)\b/i,
      /മത്തി|അയല|ചെമ്മീൻ|കരിമീൻ|നെയ്മീൻ|ചൂര|കിളിമീൻ|കൂന്തൽ|ഞണ്ട്|മീൻ|ആവോലി/
    ]
  },

  // 2. FRESH MEATS
  {
    category: 'meats',
    patterns: [
      /\b(chicken|mutton|beef|pork|duck|tharavu|meat|goat\s*meat|lamb|pota\s*meat)\b/i,
      /ചിക്കൻ|പോത്തിറച്ചി|ബീഫ്|മട്ടൻ|താറാവ്|ഇറച്ചി/
    ],
    exclude: [/masala|powder|curry\s*powder|seasoning|bouillon|soup|flavour|flavoured/i]
  },

  // 3. VEGETABLES
  {
    category: 'vegetables',
    patterns: [
      /\b(tomato|onion|potato|carrot|cabbage|cauliflower|capsicum|brinjal|eggplant|ladies\s*finger|okra|drumstick|bitter\s*gourd|snake\s*gourd|bottle\s*gourd|ridge\s*gourd|ash\s*gourd|pumpkin|beetroot|radish|spinach|coriander\s*leaves|mint\s*leaves|curry\s*leaves|green\s*chilli|raw\s*banana|yam|tapioca|elephant\s*yam|colocasia|cucumber|ginger|garlic|mushroom|lemon|lime|beans|broad\s*beans|cluster\s*beans|french\s*beans|sweet\s*corn|baby\s*corn|lettuce|broccoli)\b/i,
      /തക്കാളി|സവാള|ഉരുളക്കിഴങ്ങ്|കാരറ്റ്|കാബേജ്|കോളിഫ്ലവർ|ക്യാപ്സിക്കം|വഴുതനങ്ങ|വെണ്ടയ്ക്ക|മുരിങ്ങക്കായ|പാവയ്ക്ക|പടവലങ്ങ|ചുരയ്ക്ക|പീച്ചിങ്ങ|കുമ്പളങ്ങ|മത്തങ്ങ|ബീറ്റ്‌റൂട്ട്|മുള്ളങ്കി|ചീര|മല്ലിയില|പുതിനയില|കറിവേപ്പില|പച്ചമുളക്|ഏത്തക്കായ|ചേന|കപ്പ|ചേമ്പ്|വെള്ളരിക്ക|ഇഞ്ചി|വെളുത്തുള്ളി|കൂൺ|ചെറുനാരങ്ങ|ബീൻസ്|സ്വീറ്റ്\s*കോൺ|ബ്രോക്കോളി|കൊത്തമര|ചെറിയ\s*ഉള്ളി|വാഴക്കൂമ്പ്|വാഴപ്പിണ്ടി/
    ],
    exclude: [/pickle|sauce|ketchup|paste|powder|chips|biscuit|mix\b|masala|soup\b/i]
  },

  // 4. FRESH FRUITS
  {
    category: 'fruits',
    patterns: [
      /\b(apple|banana|orange|grapes|mango|pomegranate|papaya|watermelon|guava|pineapple|kiwi|strawberry|muskmelon|mosambi|sweet\s*lime|pear|plum|chikoo|sapota|custard\s*apple|dragon\s*fruit|avocado|custard|apricot|berries|blueberry|cherry|fig|dates|anar)\b/i,
      /ആപ്പിൾ|ഏത്തപ്പഴം|ഓറഞ്ച്|മുന്തിരി|മാമ്പഴം|മാതളം|പപ്പായ|തണ്ണിമത്തൻ|പേരയ്ക്ക|കൈതച്ചക്ക|പൈനാപ്പിൾ|കിവി|സ്ട്രോബെറി|അത്തിപ്പഴം|ഈന്തപ്പഴം/
    ],
    exclude: [/juice|drink|squash|syrup|jam|biscuit|soap|shampoo|body\s*wash|candy|toffee|cream\b|cake|essence/i]
  },

  // 5. DAIRY & EGGS
  {
    category: 'dairy',
    patterns: [
      /\b(milk|curd|yogurt|butter|cheese|paneer|ghee|fresh\s*cream|buttermilk|sambharam|milma|amul\s*butter|amul\s*cheese|amul\s*milk|egg|eggs)\b/i,
      /പാൽ|തൈര്|വെണ്ണ|ചീസ്|പനീർ|നെയ്യ്|മുട്ട|മിൽമ/
    ],
    exclude: [/milk\s*biscuit|biscuit|soap|chocolate|dairy\s*milk|tea\s*with\s*milk/i]
  },

  // 6. RICE & GRAINS & FLOURS
  {
    category: 'rice-grains',
    patterns: [
      /\b(rice|matta|basmati|ponni|sona\s*masoori|jeerakasala|biryani\s*rice|raw\s*rice|boiled\s*rice|pacha\s*ari|puzhukkalari|atta|maida|wheat|flour|rice\s*powder|arippodi|puttu\s*podi|appam\s*podi|idiyappam\s*podi|rava|sooji|semolina|oats|muesli|corn\s*flakes|poha|aval|flattened\s*rice|quinoa|ragi|ragi\s*powder|multigrain\s*flour|chakki\s*fresh\s*atta|aashirvaad\s*atta)\b/i,
      /അരി|മട്ട|ബസ്മതി|പൊന്നി|ജീരകശാല|ബിരിയാണി\s*അരി|പച്ചരി|പുഴുക്കലരി|ആട്ട|മൈദ|ഗോതമ്പ്|പൊടി|അരിപ്പൊടി|പുട്ടുപൊടി|അപ്പം\s*പൊടി|ഇടിയപ്പം\s*പൊടി|റവ|ഓട്സ്|അവൽ|റാഗി/
    ],
    exclude: [/soap|oil|masala|paste|biscuit/i]
  },

  // 7. PULSES & LEGUMES
  {
    category: 'pulses-legumes',
    patterns: [
      /\b(toor\s*dal|thuvara\s*parippu|moong\s*dal|cherupayar|urad\s*dal|uzhunnu|chana\s*dal|kadala\s*parippu|masoor\s*dal|green\s*gram|bengal\s*gram|chana|kadala|kabuli\s*chana|rajma|kidney\s*beans|green\s*peas|pattani|cowpea|vanpayar|soya\s*chunks|soya\s*bean|lentils|dal\b|dhal\b|parippu)\b/i,
      /പരിപ്പ്|തുവരപ്പരിപ്പ്|ചെറുപയർ|ഉഴുന്ന്|കടലപ്പരിപ്പ്|കടല|കാബൂളി|രാജ്മ|പട്ടാണി|വൻപയർ|സോയാ\s*ചങ്ക്സ്/
    ],
    exclude: [/masala|oil|soap|pickle/i]
  },

  // 8. OILS, SUGAR & SALT
  {
    category: 'oils-sugar',
    patterns: [
      /\b(coconut\s*oil|cooking\s*oil|sunflower\s*oil|gingelly\s*oil|sesame\s*oil|mustard\s*oil|palm\s*oil|olive\s*oil|edible\s*oil|oil\b|sugar|panjasara|jaggery|sharkkara|sarkkara|salt|uppu|honey|thein|fortune\s*oil|kera|dhara|gold\s*winner|sunpure)\b/i,
      /വെളിച്ചെണ്ണ|എണ്ണ|പഞ്ചസാര|ശർക്കര|ഉപ്പ്|തേൻ|സൺഫ്ലവർ\s*ഓയിൽ|നല്ലെണ്ണ/
    ],
    exclude: [/hair\s*oil|body\s*oil|baby\s*oil|massage\s*oil|engine\s*oil|biscuit|soap|toothpaste/i]
  },

  // 9. SPICES & MASALA
  {
    category: 'spices',
    patterns: [
      /\b(chilli\s*powder|turmeric\s*powder|coriander\s*powder|pepper\s*powder|garam\s*masala|chicken\s*masala|meat\s*masala|fish\s*masala|sambar\s*powder|rasam\s*powder|biryani\s*masala|curry\s*powder|cardamom|elakka|cinnamon|karuvapatta|cloves|karampu|black\s*pepper|kurumulaku|star\s*anise|thakkolam|nutmeg|jathikka|cumin|jeerakam|fennel|perumjeerakam|mustard\s*seeds|kaduku|fenugreek|uluva|asafoetida|hing|kaayam|kashmiri\s*chilli|eastern|kitchen\s*treasures|nirapara|melam|everest\s*masala|kasuri\s*methi|bay\s*leaf|mace|jathipathri)\b/i,
      /മുളകുപൊടി|മഞ്ഞൾപ്പൊടി|മല്ലിപ്പൊടി|കുരുമുളകുപൊടി|ഗരം\s*മസാല|ചിക്കൻ\s*മസാല|മീറ്റ്\s*മസാല|ഫിഷ്\s*മസാല|സാമ്പാർ\s*പൊടി|രസം\s*പൊടി|ബിരിയാണി\s*മസാല|ഏലക്ക|കറുവപ്പട്ട|ഗ്രാമ്പൂ|കുരുമുളക്|തക്കോലം|ജാതിക്ക|ജീരകം|പെരുംജീരകം|കടുക്|ഉലുവ|കായം|കാശ്മീരി\s*മുളക്/
    ],
    exclude: [/biscuit|snack|sauce|pickle|chips/i]
  },

  // 10. BEVERAGES (TEA, COFFEE & DRINKS)
  {
    category: 'beverages',
    patterns: [
      /\b(tea|chai|chaya|green\s*tea|tea\s*powder|tea\s*bags|coffee|kappi|instant\s*coffee|filter\s*coffee|bru|nescafe|kanan\s*devan|avt|taj\s*mahal|red\s*label|3\s*roses|tata\s*tea|wagh\s*bakri|horlicks|boost|bournvita|complan|glucon-d|tang|rasna|juice|maaza|frooti|slice|tropicana|real\s*fruit|soft\s*drink|coca\s*cola|pepsi|sprite|7up|thums\s*up|fanta|mirinda|mountain\s*dew|limca|soda|kinley|aquafina|mineral\s*water|energy\s*drink|red\s*bull|sting|badam\s*drink)\b/i,
      /ചായപ്പൊടി|കാപ്പിപ്പൊടി|ഗ്രീൻ\s*ടീ|ഹോർലിക്സ്|ബൂസ്റ്റ്|ബോൺവിറ്റ|കോംപ്ലാൻ|ജ്യൂസ്|സോഡ/
    ],
    exclude: [/biscuit|cake|soap|cream|face\s*wash/i]
  },

  // 11. BISCUITS, SNACKS & CONFECTIONERY
  {
    category: 'biscuits-snacks',
    patterns: [
      /\b(biscuit|biscuits|cookie|cookies|rusk|rusks|cake|cakes|chips|crisps|banana\s*chips|tapioca\s*chips|potato\s*chips|lay\'?s|kurkure|bingo|pringles|murukku|mixture|pakkavada|achappam|kuzhalappam|halwa|namkeen|bhujia|sev|parle-g|good\s*day|marie|oreo|bourbon|dark\s*fantasy|50-50|monaco|krackjack|hide\s*&\s*seek|treat|bounce|jim\s*jam|unibic|britannia|sunfeast|chocolate|chocolates|dairy\s*milk|kitkat|5\s*star|munch|perk|snickers|gems|eclairs|cadbury|nestle|candy|toffee|lolipop|lollipop|popcorn|maggi|yippee|noodles|instant\s*noodles|pasta|macaroni|wafers)\b/i,
      /ബിസ്കറ്റ്|കുക്കീസ്|റസ്ക്|കേക്ക്|ചിപ്സ്|ഏത്തക്ക\s*ചിപ്സ്|മിക്സ്ചർ|മുറുക്ക്|ഹൽവ|ചോക്ലേറ്റ്|നൂഡിൽസ്|മാഗി|പാസ്ത/
    ]
  },

  // 12. SAUCES & PICKLES
  {
    category: 'sauces-condiments',
    patterns: [
      /\b(pickle|pickles|achar|ketchup|tomato\s*ketchup|sauce|chilli\s*sauce|soya\s*sauce|soy\s*sauce|mayonnaise|mayo|vinegar|papad|papads|appalam|pappadam|chutney|chammanthi|jam|kissan\s*jam|spread|peanut\s*butter)\b/i,
      /അച്ചാർ|കെച്ചപ്പ്|സോസ്|വിനാഗിരി|പപ്പടം|ചമ്മന്തി|ജാം/
    ]
  },

  // 13. PERSONAL CARE
  {
    category: 'personal-care',
    patterns: [
      /\b(soap|bath\s*soap|beauty\s*soap|lux|lifebuoy|dettol|dove|medimix|mysore\s*sandal|santoor|pears|cinthol|fiama|hamam|shampoo|conditioner|clinic\s*plus|sunsilk|head\s*&\s*shoulders|pantene|tresemme|hair\s*oil|parachute|bajaj\s*almond|navratna|indulekha|vatika|hair\s*color|hair\s*dye|toothpaste|colgate|close\s*up|pepsodent|sensodyne|dabur\s*red|meswak|vicco|toothbrush|mouthwash|face\s*wash|face\s*cream|fair\s*&\s*lovely|glow\s*&\s*lovely|nivea|ponds|vaseline|body\s*lotion|moisturizer|talc|talcum\s*powder|ponds\s*powder|deodorant|deo|body\s*spray|perfume|fog|wild\s*stone|axe|shaving\s*cream|shaving\s*foam|gillette|razor|blade|sanitary\s*napkin|whisper|stayfree|sofy|cotton\s*buds|lip\s*balm|handwash)\b/i,
      /സോപ്പ്|ഷാംപൂ|ഹെയർ\s*ഓയിൽ|ടൂത്ത്പേസ്റ്റ്|ടൂത്ത്ബ്രഷ്|ഫേസ്\s*വാഷ്|ബോഡി\s*ലോഷൻ|പൗഡർ|ഷേവിംഗ്|ഡിയോഡറന്റ്/
    ],
    exclude: [/dishwash|detergent|washing\s*soap|bar\s*soap\s*laundry/i]
  },

  // 14. CLEANING & HOUSEHOLD
  {
    category: 'cleaning-household',
    patterns: [
      /\b(detergent|washing\s*powder|surf\s*excel|ariel|tide|rin|wheel|henko|ghari|detergent\s*bar|rin\s*bar|comfort\s*fabric|fabric\s*conditioner|genteel|dishwash|vim|vim\s*bar|vim\s*liquid|pril|exo|exo\s*bar|floor\s*cleaner|lizol|domex|harpic|toilet\s*cleaner|colin|glass\s*cleaner|phenyle|bleaching\s*powder|mosquito|good\s*knight|all\s*out|mortein|hit\s*spray|hit|coil|broom|choothal|mop|wiper|scrubber|scotch\s*brite|sponge|garbage\s*bag|air\s*freshener|godrej\s*aer|odonil|naphthalene\s*balls|camphor|agarbatti|incense\s*sticks|matchbox|theepetty)\b/i,
      /ഡിറ്റർജന്റ്|വാഷിംഗ്\s*പൗഡർ|ഡിഷ്‌വാഷ്|വിം|ഹാർപ്പിക്|ലിസോൾ|ഫ്ലോർ\s*ക്ലീനർ|ചൂൽ|തുടപ്പൻ|അഗർബത്തി|തീപ്പെട്ടി/
    ]
  },

  // 15. BABY & FAMILY
  {
    category: 'baby-family',
    patterns: [
      /\b(baby|diaper|diapers|pampers|mamypoko|huggies|baby\s*wipes|wipes|cerelac|lactogen|nestum|baby\s*soap|baby\s*shampoo|baby\s*oil|baby\s*powder|johnson\'?s\s*baby|himalaya\s*baby|feeding\s*bottle|nipple)\b/i,
      /ഡയപ്പർ|ബേബി\s*വൈപ്സ്|സെറിലാക്|ബേബി\s*സോപ്പ്/
    ]
  },

  // 16. KITCHEN UTENSILS
  {
    category: 'utensils',
    patterns: [
      /\b(cookware|pressure\s*cooker|cooker|kadai|cheenachatti|fry\s*pan|tawa|saucepan|biryani\s*pot|plate|plates|spoon|spoons|fork|knife|knives|peeler|grater|strainer|arippa|chattukam|ladle|cooker\s*gasket|gas\s*lighter|lighter)\b/i,
      /കുക്കർ|ചീനച്ചട്ടി|ഫ്രൈ\s*പാൻ|തവ|പ്ലേറ്റ്|സ്പൂൺ|കത്തി|അരിപ്പ/
    ]
  },

  // 17. STORAGE CONTAINERS
  {
    category: 'storage-containers',
    patterns: [
      /\b(container|containers|storage\s*box|jar|jars|plastic\s*jar|glass\s*jar|steel\s*box|lunch\s*box|tiffin|water\s*bottle|flask|thermos|bucket|basin|mug)\b/i,
      /കണ്ടെയ്നർ|കുപ്പി|ടിഫിൻ\s*ബോക്സ്|ഫ്ലാസ്ക്|വാട്ടർ\s*ബോട്ടിൽ/
    ]
  },

  // 18. ELECTRONICS & APPLIANCES
  {
    category: 'electronics',
    patterns: [
      /\b(mixer\s*grinder|mixie|induction\s*cooker|electric\s*kettle|kettle|iron\s*box|iron|torch|battery|batteries|led\s*bulb|bulb|extension\s*cord)\b/i,
      /മിക്സി|ഇൻഡക്ഷൻ|കെറ്റിൽ|അയൺ\s*ബോക്സ്|ടോർച്ച്|ബാറ്ററി|ബൾബ്/
    ]
  }
];

function determineCategory(name, currentCategory) {
  const cleanName = name.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.exclude && rule.exclude.some(rx => rx.test(cleanName))) {
      continue;
    }
    if (rule.patterns.some(rx => rx.test(cleanName))) {
      return rule.category;
    }
  }

  // If no specific match, retain current category if it makes sense or return current
  return currentCategory;
}

async function analyze() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, name, category_id FROM products ORDER BY name');
    console.log(`Loaded ${res.rows.length} products from database.\n`);

    const changes = [];
    const unchanged = [];

    for (const p of res.rows) {
      const suggested = determineCategory(p.name, p.category_id);
      if (suggested && suggested !== p.category_id) {
        changes.push({
          id: p.id,
          name: p.name,
          from: p.category_id,
          to: suggested,
        });
      } else {
        unchanged.push(p);
      }
    }

    console.log(`Found ${changes.length} products to re-categorize!`);
    console.log(`Found ${unchanged.length} products that are already in correct categories.\n`);

    // Group changes by from -> to
    const grouped = {};
    for (const c of changes) {
      const key = `${c.from} ➜ ${c.to}`;
      grouped[key] = (grouped[key] || 0) + 1;
    }

    console.log('--- 📊 Proposed Re-categorization Breakdown ---');
    console.table(grouped);

    console.log('\n--- 🔍 Sample 30 Changes ---');
    console.table(changes.slice(0, 30));

  } finally {
    client.release();
    process.exit(0);
  }
}

analyze().catch(err => {
  console.error(err);
  process.exit(1);
});
