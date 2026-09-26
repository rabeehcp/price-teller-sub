const { pool } = require('../dist/db/pool');

/**
 * High-Precision, Hierarchical Category Classifier for PriceTeller Supermarket Catalog
 *
 * Evaluation order:
 * 1. Baby Care (diapers, baby wipes, baby food)
 * 2. Cleaning & Household (detergents, air fresheners, cleaners, mosquito repellents)
 * 3. Personal Care (toilet soaps, shampoos, toothpastes, hair oils, face creams, deodorants)
 * 4. Sauces, Pickles & Condiments (pickles, jams, ketchups, mayonnaise, vinegar, papad)
 * 5. Biscuits, Snacks & Confectionery (biscuits, popcorn, chips, chocolates, candies, noodles, cakes)
 * 6. Beverages (tea, coffee, soft drinks, juices, health drinks like Horlicks/Boost)
 * 7. Spices & Masala (whole spices, chilli/turmeric/coriander powders, meat/chicken/sambar masala)
 * 8. Oils, Sugar & Salt (cooking oils, sugar, jaggery, salt, honey)
 * 9. Dairy & Eggs (milk, curd, butter, paneer, cheese, eggs)
 * 10. Pulses & Legumes (dals, chana, green gram, rajma, peas, soya chunks)
 * 11. Rice, Grains & Flours (rice, atta, maida, puttu podi, oats, rava, aval)
 * 12. Fresh Fish & Seafood (raw fresh fish, prawns, crab)
 * 13. Fresh Meats (raw fresh chicken, mutton, beef)
 * 14. Fresh Fruits (fresh fruits)
 * 15. Fresh Vegetables (fresh vegetables)
 * 16. Kitchen Utensils
 * 17. Storage Containers
 * 18. Electronics
 */

const MANUAL_OVERRIDES = {
  "epeedika-grocery-778": "pulses-legumes",
  "zeev-35681": "beverages",
  "zeev-42059": "sauces-condiments",
  "epeedika-grocery-1127": "rice-grains",
  "atta": "rice-grains",
  "epeedika-grocery-533": "rice-grains",
  "zeev-149825": "beverages",
  "epeedika-grocery-761": "rice-grains",
  "zeev-163865": "personal-care",
  "zeev-27196": "cleaning-household",
  "zeev-45743": "personal-care",
  "epeedika-grocery-1260": "beverages",
  "zeev-46131": "personal-care",
  "pothys-snack-3139108": "biscuits-snacks",
  "pothys-snack-3136554": "biscuits-snacks",
  "pothys-snack-3138801": "biscuits-snacks",
  "epeedika-grocery-1589": "rice-grains",
  "epeedika-grocery-240": "spices",
  "epeedika-grocery-235": "spices",
  "zeev-48693": "personal-care",
  "shysha-bakery-8872": "beverages",
  "zeev-151587": "beverages",
  "epeedika-grocery-326": "beverages",
  "shysha-bakery-8875": "beverages",
  "coffee": "beverages",
  "epeedika-grocery-1416": "spices",
  "zeev-14592": "personal-care",
  "epeedika-grocery-296": "pulses-legumes",
  "epeedika-grocery-302": "pulses-legumes",
  "epeedika-grocery-231": "spices",
  "epeedika-grocery-74": "oils-sugar",
  "zeev-48707": "rice-grains",
  "pothys-snack-3138830": "biscuits-snacks",
  "pothys-snack-3395480": "biscuits-snacks",
  "shysha-bakery-3815": "biscuits-snacks",
  "pothys-snack-3138556": "biscuits-snacks",
  "epeedika-grocery-1982": "biscuits-snacks",
  "zeev-41377": "rice-grains",
  "zeev-41218": "rice-grains",
  "zeev-158754": "rice-grains",
  "zeev-49405": "personal-care",
  "epeedika-grocery-1227": "spices",
  "zeev-157986": "personal-care",
  "mutton-fresh": "meats",
  "fruit-njalipoovan-elakki": "fruits",
  "shysha-bakery-7133": "beverages",
  "pothys-snack-3138677": "biscuits-snacks",
  "zeev-15878": "baby-family",
  "pothys-snack-3397690": "personal-care",
  "fruit-black-grapes": "fruits"
};

function classifyProduct(name, currentCat, id) {
  if (id && MANUAL_OVERRIDES[id]) {
    return MANUAL_OVERRIDES[id];
  }
  const n = name.trim().toLowerCase();

  // 1. BABY & FAMILY
  if (
    /\b(diaper|diapers|pampers|mamypoko|huggies|baby\s*wipes|cerelac|lactogen|nestum|baby\s*soap|baby\s*shampoo|baby\s*oil|baby\s*powder|baby\s*lotion|johnson\'?s\s*baby|feeding\s*bottle)\b/i.test(n) ||
    /ഡയപ്പർ|ബേബി\s*വൈപ്സ്|സെറിലാക്/i.test(n)
  ) {
    return 'baby-family';
  }

  // 2. CLEANING & HOUSEHOLD (takes priority over scent ingredients like lemon, jasmine, rose, berries)
  if (
    /\b(air\s*freshener|car\s*freshener|godrej\s*aer|ambi\s*pur|odonil|mosquito|good\s*knight|all\s*out|mortein|hit\s*spray|hit\s*cockroach|hit\s*mosquito|repellent|coil|harpic|lizol|domex|colin\s*glass|floor\s*cleaner|toilet\s*cleaner|bathroom\s*cleaner|tile\s*cleaner|drain\s*cleaner|detergent|surf\s*excel|ariel|tide|rin\s*bar|rin\s*powder|rin\s*advance|wheel\s*powder|wheel\s*bar|henko|ghari|comfort\s*fabric|fabric\s*conditioner|genteel|vanish|neelam|ujala|bleach|bleaching\s*powder|dishwash|vim\s*bar|vim\s*liquid|vim\s*gel|pril|exo\s*bar|exo\s*dish|exo\s*round|scrubber|scotch\s*brite|steel\s*scrubber|sponge|mop\b|broom|wiper|poocha|choothal|garbage\s*bag|dustbin|camphor|kapoor|karpooram|agarbatti|incense|cycle\s*pure|dhoop|matchbox|theepetty)\b/i.test(n) ||
    /ഡിറ്റർജന്റ്|വാഷിംഗ്|ഡിഷ്‌വാഷ്|വിം|ഹാർപ്പിക്|ലിസോൾ|ചൂൽ|തുടപ്പൻ|അഗർബത്തി|തീപ്പെട്ടി|കർപ്പൂരം/i.test(n)
  ) {
    return 'cleaning-household';
  }

  // 3. PERSONAL CARE (takes priority over natural extracts like coconut, almond, lemon, aloe vera, neem, saffron)
  if (
    /\b(shampoo|conditioner|clinic\s*plus|head\s*&\s*shoulders|sunsilk|pantene|tresemme|dove\s*shampoo|hair\s*oil|parachute|bajaj\s*almond|navratna|indulekha|vatika|hair\s*color|hair\s*colour|hair\s*dye|garnier\s*color|streax|godrej\s*expert|mehandi|henna|toothpaste|colgate|close\s*up|pepsodent|sensodyne|dabur\s*red|meswak|vicco|himalaya\s*toothpaste|toothbrush|oral-b|mouthwash|listerine|soap\b|bath\s*soap|bathing\s*bar|beauty\s*soap|lux\b|lifebuoy|dettol\s*soap|dettol\s*liquid|dettol\s*antiseptic|medimix|mysore\s*sandal|santoor|pears\s*soap|cinthol|fiama|hamam|margo|himalaya\s*soap|handwash|face\s*wash|cleanser|face\s*scrub|face\s*cream|fair\s*&\s*lovely|glow\s*&\s*lovely|fair\s*and\s*lovely|nivea|ponds|vaseline|boroline|boroplus|body\s*lotion|body\s*wash|shower\s*gel|moisturizer|cold\s*cream|talc|talcum\s*powder|ponds\s*powder|gokul\s*sandal|cuticura|dermicool|deodorant|deo\b|body\s*spray|perfume|fogg|wild\s*stone|axe\s*deo|engage|yardley|shaving\s*cream|shaving\s*foam|shaving\s*gel|after\s*shave|gillette|razor|blade|supermax|sanitary\s*napkin|sanitary\s*pad|whisper|stayfree|sofy|kotex|cotton\s*buds|earbuds|lip\s*balm|vaseline\s*lip|kajal|eyeliner|nail\s*polish|hair\s*gel|set\s*wet)\b/i.test(n) ||
    /ഷാംപൂ|ഹെയർ\s*ഓയിൽ|ടൂത്ത്പേസ്റ്റ്|ടൂത്ത്ബ്രഷ്|ഫേസ്\s*വാഷ്|ബോഡി\s*ലോഷൻ|പൗഡർ|ഷേവിംഗ്|ഡിയോഡറന്റ്|സോപ്പ്/i.test(n)
  ) {
    // Make sure laundry bars or dishwash bars aren't mistakenly caught here
    if (!/\b(dishwash|detergent|washing|laundry|vim|exo|pril|surf|rin|wheel)\b/i.test(n)) {
      return 'personal-care';
    }
  }

  // 4. SAUCES, PICKLES & CONDIMENTS (takes priority over fruit/vegetable ingredients like mango, lemon, garlic)
  if (
    /\b(pickle|pickles|achar|ketchup|tomato\s*ketchup|tomato\s*sauce|chilli\s*sauce|soya\s*sauce|soy\s*sauce|green\s*chilli\s*sauce|red\s*chilli\s*sauce|schezwan\s*sauce|pasta\s*sauce|pizza\s*sauce|mayonnaise|mayo|vinegar|syrup|jam\b|fruit\s*jam|mixed\s*fruit\s*jam|kissan\s*jam|peanut\s*butter|nutella|chocolate\s*spread|papad|papads|appalam|pappadam|chutney|chammanthi|chutney\s*powder|chammanthi\s*podi|ginger\s*garlic\s*paste|garlic\s*paste|ginger\s*paste|kasundi|mustard\s*paste)\b/i.test(n) ||
    /അച്ചാർ|കെച്ചപ്പ്|സോസ്|വിനാഗിരി|പപ്പടം|ചമ്മന്തിപ്പൊടി|ജാം/i.test(n)
  ) {
    return 'sauces-condiments';
  }

  // 5. BISCUITS, SNACKS, NOODLES & CONFECTIONERY (takes priority over flavoring words like butter, cheese, garlic, onion, tomato)
  if (
    /\b(biscuit|biscuits|cookie|cookies|rusk|rusks|cake|cakes|cupcake|plum\s*cake|roll|popcorn|act\s*ii|chips|crisps|banana\s*chips|tapioca\s*chips|potato\s*chips|lay\'?s|kurkure|bingo|pringles|doritos|nachos|nachoz|murukku|mixture|pakkavada|achappam|kuzhalappam|kuzhalappam|halwa|namkeen|bhujia|sev|khatta\s*meetha|bikanervala|bikano|haldiram|parle-g|good\s*day|marie\s*gold|marie\s*light|marie|oreo|bourbon|dark\s*fantasy|50-50|monaco|krackjack|hide\s*&\s*seek|treat|bounce|jim\s*jam|unibic|britannia|sunfeast|moms\s*magic|milano|chocolate|chocolates|dairy\s*milk|kitkat|kit\s*kat|5\s*star|munch|perk|snickers|gems|eclairs|cadbury|nestle|bar-one|candy|toffee|lollipop|lolipop|jelly|juzt\s*jelly|alpenliebe|mentos|chlor-mint|center\s*fresh|center\s*fruit|happydent|chewing\s*gum|maggi|yippee|noodles|instant\s*noodles|top\s*ramen|wai\s*wai|pasta|macaroni|vermicelli|semiya|bambino\s*semiya|payasam\s*mix|gulab\s*jamun\s*mix|wafers|waffle)\b/i.test(n) ||
    /ബിസ്കറ്റ്|കുക്കീസ്|റസ്ക്|കേക്ക്|ചിപ്സ്|മിക്സ്ചർ|മുറുക്ക്|ഹൽവ|ചോക്ലേറ്റ്|നൂഡിൽസ്|മാഗി|പാസ്ത|സേമിയ|പായസം\s*മിക്സ്/i.test(n)
  ) {
    return 'biscuits-snacks';
  }

  // 6. BEVERAGES (TEA, COFFEE, DRINKS, JUICES, SQUASH, SODA)
  if (
    /\b(tea\b|chai\b|chaya|green\s*tea|tea\s*powder|tea\s*bags|tea\s*dust|leaf\s*tea|coffee|kappi|instant\s*coffee|filter\s*coffee|coffee\s*powder|bru\b|nescafe|kanan\s*devan|avt\b|taj\s*mahal|red\s*label|3\s*roses|tata\s*tea|wagh\s*bakri|society\s*tea|horlicks|boost\b|bournvita|complan|milo|glucon-d|tang\b|rasna|rooh\s*afza|squash|badam\s*drink|badam\s*mix|juice|maaza|frooti|slice\s*mango|tropicana|real\s*fruit|real\s*juice|soft\s*drink|coca\s*cola|coke|pepsi|sprite|7up|thums\s*up|fanta|mirinda|mountain\s*dew|limca|appy\s*fizz|fizz|soda|club\s*soda|kinley|aquafina|mineral\s*water|packaged\s*drinking\s*water|energy\s*drink|red\s*bull|sting|monster\s*energy)\b/i.test(n) ||
    /ചായപ്പൊടി|കാപ്പിപ്പൊടി|ഗ്രീൻ\s*ടീ|ഹോർലിക്സ്|ബൂസ്റ്റ്|ബോൺവിറ്റ|കോംപ്ലാൻ|ജ്യൂസ്|സോഡ|മിനറൽ\s*വാട്ടർ/i.test(n)
  ) {
    return 'beverages';
  }

  // 7. SPICES & MASALA (whole spices & culinary spice powders)
  if (
    /\b(chilli\s*powder|chilli\s*flakes|turmeric\s*powder|coriander\s*powder|pepper\s*powder|black\s*pepper|white\s*pepper|garam\s*masala|chicken\s*masala|meat\s*masala|mutton\s*masala|beef\s*masala|fish\s*masala|fish\s*fry\s*masala|sambar\s*powder|rasam\s*powder|biryani\s*masala|kabab\s*masala|chana\s*masala|garlic\s*pepper|curry\s*powder|cardamom|elakka|cinnamon|karuvapatta|dalchini|cloves|karampu|laung|star\s*anise|thakkolam|nutmeg|jathikka|mace|jathipathri|cumin|jeerakam|jeera|fennel|perumjeerakam|saunf|mustard\s*seeds|kaduku|rai\b|fenugreek|uluva|methi\s*seeds|asafoetida|hing\b|kaayam|kashmiri\s*chilli|eastern|kitchen\s*treasures|nirapara|melam|everest|badshah|catch\s*spices|kasuri\s*methi|bay\s*leaf|biryani\s*leaf|ajwain|ayamodakam|dry\s*ginger|chukku)\b/i.test(n) ||
    /മുളകുപൊടി|മഞ്ഞൾപ്പൊടി|മല്ലിപ്പൊടി|കുരുമുളകുപൊടി|ഗരം\s*മസാല|ചിക്കൻ\s*മസാല|മീറ്റ്\s*മസാല|ഫിഷ്\s*മസാല|സാമ്പാർ\s*പൊടി|രസം\s*പൊടി|ബിരിയാണി\s*മസാല|ഏലക്ക|കറുവപ്പട്ട|ഗ്രാമ്പൂ|കുരുമുളക്|തക്കോലം|ജാതിക്ക|ജീരകം|പെരുംജീരകം|കടുക്|ഉലുവ|കായം|കാശ്മീരി\s*മുളക്/i.test(n)
  ) {
    return 'spices';
  }

  // 8. OILS, SUGAR & SALT
  if (
    /\b(coconut\s*oil|cooking\s*oil|sunflower\s*oil|gingelly\s*oil|sesame\s*oil|mustard\s*oil|palm\s*oil|palmolein|olive\s*oil|vegetable\s*oil|edible\s*oil|fortune\s*oil|sunpure|kera\b|dhara\b|gold\s*winner|saffola|sugar|white\s*sugar|brown\s*sugar|panjasara|jaggery|sharkkara|sarkkara|bella|cane\s*sugar|salt|table\s*salt|rock\s*salt|crystal\s*salt|iodized\s*salt|tata\s*salt|uppu|honey|pure\s*honey|dabur\s*honey|thein)\b/i.test(n) ||
    /വെളിച്ചെണ്ണ|എണ്ണ|പഞ്ചസാര|ശർക്കര|ഉപ്പ്|തേൻ|സൺഫ്ലവർ\s*ഓയിൽ|നല്ലെണ്ണ/i.test(n)
  ) {
    // Don't mistake hair oil or body oil
    if (!/\b(hair|shampoo|body|massage|baby)\b/i.test(n)) {
      return 'oils-sugar';
    }
  }

  // 9. DAIRY & EGGS
  if (
    /\b(milk|fresh\s*milk|pasteurized\s*milk|toned\s*milk|curd|yogurt|dahi|butter\b|table\s*butter|amul\s*butter|cheese|paneer|ghee|pure\s*ghee|cow\s*ghee|fresh\s*cream|buttermilk|sambharam|milma|amul|egg\b|eggs\b|farm\s*fresh\s*eggs|country\s*eggs|kozhi\s*mutta)\b/i.test(n) ||
    /പാൽ|തൈര്|വെണ്ണ|ചീസ്|പനീർ|നെയ്യ്|മുട്ട|മിൽമ/i.test(n)
  ) {
    // Avoid biscuits or chocolates with milk in title
    if (!/\b(biscuit|cookie|chocolate|candy|toffee|cream\s*biscuit)\b/i.test(n)) {
      return 'dairy';
    }
  }

  // 10. PULSES & LEGUMES
  if (
    /\b(toor\s*dal|thuvara\s*parippu|moong\s*dal|cherupayar|urad\s*dal|uzhunnu|chana\s*dal|kadala\s*parippu|masoor\s*dal|green\s*gram|bengal\s*gram|chana\b|black\s*chana|white\s*chana|kabuli\s*chana|kadala\b|rajma|kidney\s*beans|green\s*peas|dried\s*peas|pattani|cowpea|vanpayar|soya\s*chunks|mealmaker|soya\s*bean|lentils|parippu)\b/i.test(n) ||
    /പരിപ്പ്|തുവരപ്പരിപ്പ്|ചെറുപയർ|ഉഴുന്ന്|കടലപ്പരിപ്പ്|കടല|കാബൂളി|രാജ്മ|പട്ടാണി|വൻപയർ|സോയാ\s*ചങ്ക്സ്/i.test(n)
  ) {
    return 'pulses-legumes';
  }

  // 11. RICE, GRAINS & FLOURS
  if (
    /\b(rice\b|matta|matta\s*rice|basmati|basmati\s*rice|ponni|sona\s*masoori|jeerakasala|biryani\s*rice|raw\s*rice|boiled\s*rice|pacha\s*ari|puzhukkalari|atta|chakki\s*atta|aashirvaad|wheat\s*flour|maida|all\s*purpose\s*flour|flour\b|rice\s*flour|rice\s*powder|arippodi|puttu\s*podi|appam\s*podi|idiyappam\s*podi|rava|sooji|semolina|oats|rolled\s*oats|quaker|kellogg|corn\s*flakes|muesli|poha|aval|flattened\s*rice|ragi|ragi\s*flour|millet|millets|wheat\b|whole\s*wheat|gothambu)\b/i.test(n) ||
    /അരി|മട്ട|ബസ്മതി|പൊന്നി|ജീരകശാല|ബിരിയാണി\s*അരി|പച്ചരി|പുഴുക്കലരി|ആട്ട|മൈദ|ഗോതമ്പ്|അരിപ്പൊടി|പുട്ടുപൊടി|അപ്പം\s*പൊടി|ഇടിയപ്പം\s*പൊടി|റവ|ഓട്സ്|അവൽ|റാഗി/i.test(n)
  ) {
    return 'rice-grains';
  }

  // 12. FISH & SEAFOOD
  if (
    /\b(fish|prawn|prawns|chemmeen|mathi|sardine|ayala|mackerel|karimeen|neymeen|seer\s*fish|choora|tuna|kilimeen|kallummakkaya|mussel|squid|koonthal|crab|nandu|rohu|katla|pomfret|avoli|shark|sravu)\b/i.test(n) ||
    /മത്തി|അയല|ചെമ്മീൻ|കരിമീൻ|നെയ്മീൻ|ചൂര|കിളിമീൻ|കൂന്തൽ|ഞണ്ട്|മീൻ|ആവോലി/i.test(n)
  ) {
    // Exclude fish masala or fish pickle
    if (!/\b(masala|powder|curry\s*powder|pickle|achar|sauce)\b/i.test(n)) {
      return 'fish';
    }
  }

  // 13. MEATS
  if (
    /\b(chicken|broiler\s*chicken|country\s*chicken|mutton|beef|pork|duck|tharavu|meat|goat\s*meat|lamb|veal)\b/i.test(n) ||
    /ചിക്കൻ|പോത്തിറച്ചി|ബീഫ്|മട്ടൻ|താറാവ്|ഇറച്ചി/i.test(n)
  ) {
    // Exclude chicken masala or meat masala
    if (!/\b(masala|powder|curry\s*powder|pickle|achar|soup|flavour|flavoured|noodle|noodles)\b/i.test(n)) {
      return 'meats';
    }
  }

  // 14. FRESH FRUITS
  if (
    /\b(apple|banana|orange|grapes|mango|pomegranate|papaya|watermelon|guava|pineapple|kiwi|strawberry|muskmelon|mosambi|sweet\s*lime|pear|plum|chikoo|sapota|custard\s*apple|dragon\s*fruit|avocado|berries|blueberry|cherry|fig|dates|anar)\b/i.test(n) ||
    /ആപ്പിൾ|ഏത്തപ്പഴം|ഓറഞ്ച്|മുന്തിരി|മാമ്പഴം|മാതളം|പപ്പായ|തണ്ണിമത്തൻ|പേരയ്ക്ക|കൈതച്ചക്ക|പൈനാപ്പിൾ|കിവി|സ്ട്രോബെറി|അത്തിപ്പഴം|ഈന്തപ്പഴം/i.test(n)
  ) {
    // Exclude juice, jam, biscuits, ice cream, shampoo, soaps
    if (!/\b(juice|drink|squash|syrup|jam|biscuit|cookie|soap|shampoo|candy|toffee|cream|essence|flavour|flavoured|chips)\b/i.test(n)) {
      return 'fruits';
    }
  }

  // 15. FRESH VEGETABLES
  if (
    /\b(tomato|onion|potato|carrot|cabbage|cauliflower|capsicum|brinjal|eggplant|ladies\s*finger|okra|drumstick|bitter\s*gourd|snake\s*gourd|bottle\s*gourd|ridge\s*gourd|ash\s*gourd|pumpkin|beetroot|radish|spinach|coriander\s*leaves|mint\s*leaves|curry\s*leaves|green\s*chilli|yam|tapioca|elephant\s*yam|colocasia|cucumber|ginger|garlic|mushroom|lemon|lime|beans|broad\s*beans|cluster\s*beans|french\s*beans|sweet\s*corn|baby\s*corn|lettuce|broccoli)\b/i.test(n) ||
    /തക്കാളി|സവാള|ഉരുളക്കിഴങ്ങ്|കാരറ്റ്|കാബേജ്|കോളിഫ്ലവർ|ക്യാപ്സിക്കം|വഴുതനങ്ങ|വെണ്ടയ്ക്ക|മുരിങ്ങക്കായ|പാവയ്ക്ക|പടവലങ്ങ|ചുരയ്ക്ക|പീച്ചിങ്ങ|കുമ്പളങ്ങ|മത്തങ്ങ|ബീറ്റ്‌റൂട്ട്|മുള്ളങ്കി|ചീര|മല്ലിയില|പുതിനയില|കറിവേപ്പില|പച്ചമുളക്|ഏത്തക്കായ|ചേന|കപ്പ|ചേമ്പ്|വെള്ളരിക്ക|ഇഞ്ചി|വെളുത്തുള്ളി|കൂൺ|ചെറുനാരങ്ങ|ബീൻസ്|സ്വീറ്റ്\s*കോൺ|ബ്രോക്കോളി|കൊത്തമര|ചെറിയ\s*ഉള്ളി|വാഴക്കൂമ്പ്|വാഴപ്പിണ്ടി/i.test(n)
  ) {
    // Exclude chips, paste, masala, pickle, soap
    if (!/\b(chips|pickle|achar|paste|powder|masala|sauce|ketchup|soup|soap|shampoo)\b/i.test(n)) {
      return 'vegetables';
    }
  }

  // 16. UTENSILS
  if (
    /\b(pressure\s*cooker|cooker|kadai|pan\b|fry\s*pan|tawa|saucepan|biryani\s*pot|plate|plates|spoon|spoons|fork|knife|knives|peeler|grater|strainer|arippa|ladle|cooker\s*gasket|gas\s*lighter)\b/i.test(n) ||
    /കുക്കർ|ചീനച്ചട്ടി|ഫ്രൈ\s*പാൻ|തവ|പ്ലേറ്റ്|സ്പൂൺ|കത്തി|അരിപ്പ/i.test(n)
  ) {
    return 'utensils';
  }

  // 17. STORAGE CONTAINERS
  if (
    /\b(container|containers|storage\s*box|jar\b|jars\b|plastic\s*jar|glass\s*jar|steel\s*box|lunch\s*box|tiffin|water\s*bottle|flask|thermos|bucket|basin|mug)\b/i.test(n) ||
    /കണ്ടെയ്നർ|കുപ്പി|ടിഫിൻ\s*ബോക്സ്|ഫ്ലാസ്ക്|വാട്ടർ\s*ബോട്ടിൽ/i.test(n)
  ) {
    return 'storage-containers';
  }

  // 18. ELECTRONICS
  if (
    /\b(mixer\s*grinder|mixie|induction\s*cooker|electric\s*kettle|kettle|iron\s*box|iron\b|torch|battery|batteries|led\s*bulb|bulb|extension\s*cord)\b/i.test(n) ||
    /മിക്സി|ഇൻഡക്ഷൻ|കെറ്റിൽ|അയൺ\s*ബോക്സ്|ടോർച്ച്|ബാറ്ററി|ബൾബ്/i.test(n)
  ) {
    return 'electronics';
  }

  // If currently 'staples', map to rice-grains
  if (currentCat === 'staples') return 'rice-grains';
  // If currently 'oils-spices', map to spices
  if (currentCat === 'oils-spices') return 'spices';
  // If currently 'household', map to cleaning-household
  if (currentCat === 'household') return 'cleaning-household';
  // If currently 'bakery-breakfast', map to biscuits-snacks
  if (currentCat === 'bakery-breakfast') return 'biscuits-snacks';

  return currentCat;
}

module.exports = { classifyProduct };
