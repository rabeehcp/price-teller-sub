import { pool, setPostgresConnected } from './db/pool';

export interface CatalogCategoryDef {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export const ALL_SYSTEM_CATEGORIES: CatalogCategoryDef[] = [
  { id: 'all', name: 'All Master Items', slug: 'all', icon: '✨', description: 'Explore full master catalog across all departments' },
  { id: 'vegetables', name: 'Vegetables', slug: 'vegetables', icon: '🥬', description: 'Daily fresh greens, roots, tubers & country vegetables' },
  { id: 'fruits', name: 'Fresh Fruits', slug: 'fruits', icon: '🍎', description: 'Farm-fresh, seasonal & exotic fruits' },
  { id: 'rice-grains', name: 'Rice & Grains', slug: 'rice-grains', icon: '🌾', description: 'Matta rice, biryani rice, flours, wheat & oats' },
  { id: 'pulses-legumes', name: 'Pulses & Legumes', slug: 'pulses-legumes', icon: '🫘', description: 'Dals, green gram, chana, toor dal & pulses' },
  { id: 'spices', name: 'Spices & Masala', slug: 'spices', icon: '🌶️', description: 'Chilli, turmeric, garam masala & whole spices' },
  { id: 'oils-sugar', name: 'Oil, Salt & Sugar', slug: 'oils-sugar', icon: '🫙', description: 'Coconut oil, cooking oils, ghee, salt & sugar' },
  { id: 'dairy', name: 'Dairy & Eggs', slug: 'dairy', icon: '🥛', description: 'Fresh milk, curd, ghee, paneer, butter & eggs' },
  { id: 'sauces-condiments', name: 'Sauces & Pickles', slug: 'sauces-condiments', icon: '🥫', description: 'Ketchup, vinegar, pickles, papad & condiments' },
  { id: 'biscuits-snacks', name: 'Biscuits & Snacks', slug: 'biscuits-snacks', icon: '🍪', description: 'Biscuits, rusks, bread, chips, murukku & snacks' },
  { id: 'beverages', name: 'Tea, Coffee & Drinks', slug: 'beverages', icon: '☕', description: 'Tea powder, coffee, Horlicks, Boost & fruit drinks' },
  { id: 'utensils', name: 'Kitchen Utensils', slug: 'utensils', icon: '🍳', description: 'Cookware, pots, pressure cookers, tawas & cutlery' },
  { id: 'cleaning-household', name: 'Cleaning & Household', slug: 'cleaning-household', icon: '🧹', description: 'Detergents, soaps, dishwash, brooms & mops' },
  { id: 'storage-containers', name: 'Storage Containers', slug: 'storage-containers', icon: '🧴', description: 'Plastic & steel jars, bottles, lunchboxes & flasks' },
  { id: 'baby-family', name: 'Baby & Family', slug: 'baby-family', icon: '🍼', description: 'Baby food, diapers, wipes, tissues & napkins' },
  { id: 'personal-care', name: 'Personal Care', slug: 'personal-care', icon: '🧼', description: 'Shampoo, hair oil, toothpaste, soaps & grooming' },
  { id: 'meats', name: 'Fresh Meats', slug: 'meats', icon: '🍗', description: 'Fresh broiler chicken, beef, mutton & poultry' },
  { id: 'fish', name: 'Fish & Seafood', slug: 'fish', icon: '🐟', description: 'Fresh sea fish, prawns, crab & river catch' },
  { id: 'electronics', name: 'Electronics & Appliances', slug: 'electronics', icon: '🔌', description: 'Mixer grinders, induction stoves & electric kettles' },
  { id: 'organic', name: 'Organic & Wellness', slug: 'organic', icon: '🌿', description: 'Certified 100% organic, pesticide-free goods' },
];

export interface NewMasterProductDef {
  id: string;
  name: string;
  categoryId: string;
  emoji: string;
  englishNote: string;
  defaultUnit: string;
  availableUnits: string[];
  unitMultiplier: Record<string, number>;
  badge?: string;
}

export const NEW_MASTER_PRODUCTS: NewMasterProductDef[] = [
  // --- 3. Rice & Grains ---
  { id: 'grain-1-rice', name: 'അരി', categoryId: 'rice-grains', emoji: '🌾', englishNote: 'Rice', defaultUnit: '1 kg', availableUnits: ['1 kg', '5 kg', '10 kg'], unitMultiplier: { '1 kg': 1, '5 kg': 5, '10 kg': 10 }, badge: 'Daily Staple' },
  { id: 'grain-2-matta-rice', name: 'മട്ട അരി', categoryId: 'rice-grains', emoji: '🌾', englishNote: 'Matta Rice', defaultUnit: '1 kg', availableUnits: ['1 kg', '5 kg', '10 kg'], unitMultiplier: { '1 kg': 1, '5 kg': 5, '10 kg': 10 }, badge: 'Kerala Special' },
  { id: 'grain-3-white-rice', name: 'വെള്ള അരി', categoryId: 'rice-grains', emoji: '🌾', englishNote: 'White Rice', defaultUnit: '1 kg', availableUnits: ['1 kg', '5 kg', '10 kg'], unitMultiplier: { '1 kg': 1, '5 kg': 5, '10 kg': 10 }, badge: 'Premium Quality' },
  { id: 'grain-4-raw-rice', name: 'പച്ചരി', categoryId: 'rice-grains', emoji: '🌾', englishNote: 'Raw Rice', defaultUnit: '1 kg', availableUnits: ['1 kg', '5 kg', '10 kg'], unitMultiplier: { '1 kg': 1, '5 kg': 5, '10 kg': 10 }, badge: 'Traditional' },
  { id: 'grain-5-boiled-rice', name: 'പുഴുങ്ങലരി', categoryId: 'rice-grains', emoji: '🌾', englishNote: 'Boiled Rice', defaultUnit: '1 kg', availableUnits: ['1 kg', '5 kg', '10 kg'], unitMultiplier: { '1 kg': 1, '5 kg': 5, '10 kg': 10 }, badge: 'Daily Healthy' },
  { id: 'grain-6-biryani-rice', name: 'ബിരിയാണി അരി', categoryId: 'rice-grains', emoji: '🍚', englishNote: 'Biryani Rice', defaultUnit: '1 kg', availableUnits: ['1 kg', '5 kg'], unitMultiplier: { '1 kg': 1, '5 kg': 5 }, badge: 'Aromatic Long Grain' },
  { id: 'grain-7-basmati-rice', name: 'ബാസ്മതി അരി', categoryId: 'rice-grains', emoji: '🍚', englishNote: 'Basmati Rice', defaultUnit: '1 kg', availableUnits: ['1 kg', '5 kg'], unitMultiplier: { '1 kg': 1, '5 kg': 5 }, badge: 'Royal Premium' },
  { id: 'grain-8-jeerakasala-rice', name: 'ജീരകശാല അരി', categoryId: 'rice-grains', emoji: '🍚', englishNote: 'Jeerakasala Rice', defaultUnit: '1 kg', availableUnits: ['1 kg', '5 kg'], unitMultiplier: { '1 kg': 1, '5 kg': 5 }, badge: 'Wayanad Special' },
  { id: 'grain-9-wheat', name: 'ഗോതമ്പ്', categoryId: 'rice-grains', emoji: '🌾', englishNote: 'Wheat Whole', defaultUnit: '1 kg', availableUnits: ['1 kg', '5 kg'], unitMultiplier: { '1 kg': 1, '5 kg': 5 }, badge: 'High Fibre' },
  { id: 'grain-10-wheat-flour', name: 'ഗോതമ്പ് പൊടി', categoryId: 'rice-grains', emoji: '🌾', englishNote: 'Wheat Flour / Chakki Atta', defaultUnit: '1 kg', availableUnits: ['1 kg', '5 kg'], unitMultiplier: { '1 kg': 1, '5 kg': 5 }, badge: '100% Whole Wheat' },
  { id: 'grain-11-maida', name: 'മൈദ', categoryId: 'rice-grains', emoji: '🥣', englishNote: 'Maida Refined Flour', defaultUnit: '1 kg', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Fine Grade' },
  { id: 'grain-12-semolina', name: 'റവ', categoryId: 'rice-grains', emoji: '🥣', englishNote: 'Semolina / Rava', defaultUnit: '1 kg', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Roasted Premium' },
  { id: 'grain-13-rice-flour', name: 'അരിപ്പൊടി', categoryId: 'rice-grains', emoji: '🥣', englishNote: 'Rice Flour', defaultUnit: '1 kg', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Fine Ground' },
  { id: 'grain-14-appam-flour', name: 'അപ്പം പൊടി', categoryId: 'rice-grains', emoji: '🥣', englishNote: 'Appam Flour / Easy Mix', defaultUnit: '1 kg', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Soft Appam' },
  { id: 'grain-15-puttu-flour', name: 'പുട്ടുപൊടി', categoryId: 'rice-grains', emoji: '🥣', englishNote: 'Puttu Flour', defaultUnit: '1 kg', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Steamed Special' },
  { id: 'grain-16-idiyappam-flour', name: 'ഇടിയപ്പം പൊടി', categoryId: 'rice-grains', emoji: '🥣', englishNote: 'Idiyappam Flour', defaultUnit: '1 kg', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Silky Texture' },
  { id: 'grain-17-corn-flour', name: 'കോൺഫ്ലവർ', categoryId: 'rice-grains', emoji: '🌽', englishNote: 'Corn Flour', defaultUnit: '500 g', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Pure Starch' },
  { id: 'grain-18-oats', name: 'ഓട്സ്', categoryId: 'rice-grains', emoji: '🥣', englishNote: 'Rolled Oats', defaultUnit: '500 g', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Heart Healthy' },

  // --- 4. Pulses & Legumes ---
  { id: 'pulse-1-dal', name: 'പരിപ്പ്', categoryId: 'pulses-legumes', emoji: '🫘', englishNote: 'Dal', defaultUnit: '1 kg', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Protein Rich' },
  { id: 'pulse-2-green-gram', name: 'ചെറുപയർ', categoryId: 'pulses-legumes', emoji: '🫘', englishNote: 'Green Gram / Moong', defaultUnit: '1 kg', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Daily Healthy' },
  { id: 'pulse-3-red-kidney-beans', name: 'വൻപയർ', categoryId: 'pulses-legumes', emoji: '🫘', englishNote: 'Red Kidney Beans / Rajma', defaultUnit: '1 kg', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Premium Grade' },
  { id: 'pulse-4-chickpeas', name: 'കടല', categoryId: 'pulses-legumes', emoji: '🫘', englishNote: 'Chickpeas / Black Kadala', defaultUnit: '1 kg', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Kerala Kadala' },
  { id: 'pulse-5-chana-dal', name: 'കടലപ്പരിപ്പ്', categoryId: 'pulses-legumes', emoji: '🫘', englishNote: 'Chana Dal', defaultUnit: '1 kg', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Polished Yellow' },
  { id: 'pulse-6-toor-dal', name: 'തുവരപ്പരിപ്പ്', categoryId: 'pulses-legumes', emoji: '🫘', englishNote: 'Toor Dal / Sambhar Dal', defaultUnit: '1 kg', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Rich Sambhar' },
  { id: 'pulse-7-urad-dal', name: 'ഉഴുന്ന്', categoryId: 'pulses-legumes', emoji: '🫘', englishNote: 'Urad Dal / Black Gram', defaultUnit: '1 kg', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Dosa Special' },
  { id: 'pulse-8-horse-gram', name: 'മുതിര', categoryId: 'pulses-legumes', emoji: '🫘', englishNote: 'Horse Gram / Muthira', defaultUnit: '1 kg', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Country Superfood' },
  { id: 'pulse-9-cowpea', name: 'വൻപയർ (Cowpea)', categoryId: 'pulses-legumes', emoji: '🫘', englishNote: 'Cowpea / Vanpayar', defaultUnit: '1 kg', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Naadan' },
  { id: 'pulse-10-pachapayar', name: 'പച്ചപ്പയർ', categoryId: 'pulses-legumes', emoji: '🫘', englishNote: 'Whole Green Gram', defaultUnit: '1 kg', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Sprout Quality' },
  { id: 'pulse-11-soybean', name: 'സോയാബീൻ', categoryId: 'pulses-legumes', emoji: '🫘', englishNote: 'Soybean', defaultUnit: '1 kg', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'High Protein' },
  { id: 'pulse-12-peas', name: 'പീസ്', categoryId: 'pulses-legumes', emoji: '🫛', englishNote: 'Green Peas Dry', defaultUnit: '1 kg', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Curry Special' },
  { id: 'pulse-13-dried-peas', name: 'പട്ടാണി', categoryId: 'pulses-legumes', emoji: '🫛', englishNote: 'Dried White Peas / Pattani', defaultUnit: '1 kg', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Snack & Curry' },

  // --- 5. Spices ---
  { id: 'spice-1-chilli-powder', name: 'മുളകുപൊടി', categoryId: 'spices', emoji: '🌶️', englishNote: 'Chilli Powder', defaultUnit: '500 g', availableUnits: ['250 g', '500 g', '1 kg'], unitMultiplier: { '250 g': 0.5, '500 g': 1, '1 kg': 2 }, badge: 'Fiery Red' },
  { id: 'spice-2-turmeric-powder', name: 'മഞ്ഞൾപ്പൊടി', categoryId: 'spices', emoji: '🌿', englishNote: 'Turmeric Powder', defaultUnit: '500 g', availableUnits: ['250 g', '500 g', '1 kg'], unitMultiplier: { '250 g': 0.5, '500 g': 1, '1 kg': 2 }, badge: '100% Pure' },
  { id: 'spice-3-coriander-powder', name: 'മല്ലിപ്പൊടി', categoryId: 'spices', emoji: '🌿', englishNote: 'Coriander Powder', defaultUnit: '500 g', availableUnits: ['250 g', '500 g', '1 kg'], unitMultiplier: { '250 g': 0.5, '500 g': 1, '1 kg': 2 }, badge: 'Aromatic' },
  { id: 'spice-4-cumin', name: 'ജീരകം', categoryId: 'spices', emoji: '🌿', englishNote: 'Cumin Seeds / Jeera', defaultUnit: '250 g', availableUnits: ['100 g', '250 g', '500 g'], unitMultiplier: { '100 g': 0.4, '250 g': 1, '500 g': 2 }, badge: 'Rich Aroma' },
  { id: 'spice-5-black-pepper', name: 'കുരുമുളക്', categoryId: 'spices', emoji: '🫒', englishNote: 'Wayanad Black Pepper', defaultUnit: '250 g', availableUnits: ['100 g', '250 g', '500 g'], unitMultiplier: { '100 g': 0.4, '250 g': 1, '500 g': 2 }, badge: 'Black Gold' },
  { id: 'spice-6-cardamom', name: 'ഏലം', categoryId: 'spices', emoji: '🌱', englishNote: 'Green Cardamom / Elakkaya', defaultUnit: '100 g', availableUnits: ['50 g', '100 g', '250 g'], unitMultiplier: { '50 g': 0.5, '100 g': 1, '250 g': 2.5 }, badge: 'Idukki Grade' },
  { id: 'spice-7-clove', name: 'ഗ്രാമ്പൂ', categoryId: 'spices', emoji: '🌱', englishNote: 'Clove / Krambu', defaultUnit: '100 g', availableUnits: ['50 g', '100 g', '250 g'], unitMultiplier: { '50 g': 0.5, '100 g': 1, '250 g': 2.5 }, badge: 'Aromatic' },
  { id: 'spice-8-cinnamon', name: 'കറുവപ്പട്ട', categoryId: 'spices', emoji: '🪵', englishNote: 'Cinnamon Bark / Patta', defaultUnit: '100 g', availableUnits: ['50 g', '100 g', '250 g'], unitMultiplier: { '50 g': 0.5, '100 g': 1, '250 g': 2.5 }, badge: 'Ceylon Quality' },
  { id: 'spice-9-fennel', name: 'പെരുംജീരകം', categoryId: 'spices', emoji: '🌿', englishNote: 'Fennel Seeds / Perumjeerakam', defaultUnit: '250 g', availableUnits: ['100 g', '250 g', '500 g'], unitMultiplier: { '100 g': 0.4, '250 g': 1, '500 g': 2 }, badge: 'Sweet Aroma' },
  { id: 'spice-10-fenugreek', name: 'ഉലുവ', categoryId: 'spices', emoji: '🫘', englishNote: 'Fenugreek Seeds / Uluva', defaultUnit: '250 g', availableUnits: ['100 g', '250 g', '500 g'], unitMultiplier: { '100 g': 0.4, '250 g': 1, '500 g': 2 }, badge: 'Digestive Herb' },
  { id: 'spice-11-mustard-seeds', name: 'കടുക്', categoryId: 'spices', emoji: '⚫', englishNote: 'Mustard Seeds / Kaduku', defaultUnit: '250 g', availableUnits: ['100 g', '250 g', '500 g'], unitMultiplier: { '100 g': 0.4, '250 g': 1, '500 g': 2 }, badge: 'Tadka Essential' },
  { id: 'spice-12-ajwain', name: 'അയമോദകം', categoryId: 'spices', emoji: '🌿', englishNote: 'Ajwain / Carom Seeds', defaultUnit: '100 g', availableUnits: ['50 g', '100 g', '250 g'], unitMultiplier: { '50 g': 0.5, '100 g': 1, '250 g': 2.5 }, badge: 'Ayurvedic' },
  { id: 'spice-13-nutmeg', name: 'ജാതിക്ക', categoryId: 'spices', emoji: '🌰', englishNote: 'Nutmeg / Jathikka', defaultUnit: '100 g', availableUnits: ['50 g', '100 g'], unitMultiplier: { '50 g': 0.5, '100 g': 1 }, badge: 'Kerala Spice' },
  { id: 'spice-14-mace', name: 'ജാതിപത്രി', categoryId: 'spices', emoji: '🌺', englishNote: 'Mace / Jathipathri', defaultUnit: '50 g', availableUnits: ['50 g', '100 g'], unitMultiplier: { '50 g': 1, '100 g': 2 }, badge: 'Exotic Spice' },
  { id: 'spice-15-asafoetida', name: 'കായം', categoryId: 'spices', emoji: '🧱', englishNote: 'Asafoetida / Kayam / Compounded Hing', defaultUnit: '100 g', availableUnits: ['50 g', '100 g'], unitMultiplier: { '50 g': 0.5, '100 g': 1 }, badge: 'Pure Hing' },
  { id: 'spice-16-garlic', name: 'വെളുത്തുള്ളി (Spices)', categoryId: 'spices', emoji: '🧄', englishNote: 'Garlic Bulbs', defaultUnit: '500 g', availableUnits: ['250 g', '500 g', '1 kg'], unitMultiplier: { '250 g': 0.5, '500 g': 1, '1 kg': 2 }, badge: 'Aromatic' },
  { id: 'spice-17-ginger', name: 'ഇഞ്ചി (Spices)', categoryId: 'spices', emoji: '🫚', englishNote: 'Fresh Ginger Root', defaultUnit: '500 g', availableUnits: ['250 g', '500 g', '1 kg'], unitMultiplier: { '250 g': 0.5, '500 g': 1, '1 kg': 2 }, badge: 'Fresh Crop' },
  { id: 'spice-18-dry-chilli', name: 'ഉണക്കമുളക്', categoryId: 'spices', emoji: '🌶️', englishNote: 'Sun Dried Red Chilli', defaultUnit: '500 g', availableUnits: ['250 g', '500 g', '1 kg'], unitMultiplier: { '250 g': 0.5, '500 g': 1, '1 kg': 2 }, badge: 'Naadan Dry' },
  { id: 'spice-19-curry-leaves', name: 'കറിവേപ്പില (Spices)', categoryId: 'spices', emoji: '🌿', englishNote: 'Fresh Curry Leaves', defaultUnit: '1 bunch', availableUnits: ['1 bunch', '2 bunches'], unitMultiplier: { '1 bunch': 1, '2 bunches': 2 }, badge: 'Aromatic Naadan' },
  { id: 'spice-20-biryani-masala', name: 'ബിരിയാണി മസാല', categoryId: 'spices', emoji: '🍲', englishNote: 'Biryani Masala Powder', defaultUnit: '100 g', availableUnits: ['100 g', '250 g'], unitMultiplier: { '100 g': 1, '250 g': 2.5 }, badge: 'Malabar Blend' },
  { id: 'spice-21-garam-masala', name: 'ഗരം മസാല', categoryId: 'spices', emoji: '🍲', englishNote: 'Garam Masala Blend', defaultUnit: '100 g', availableUnits: ['100 g', '250 g'], unitMultiplier: { '100 g': 1, '250 g': 2.5 }, badge: 'Rich Spice' },
  { id: 'spice-22-chicken-masala', name: 'ചിക്കൻ മസാല', categoryId: 'spices', emoji: '🍗', englishNote: 'Chicken Curry Masala', defaultUnit: '100 g', availableUnits: ['100 g', '250 g'], unitMultiplier: { '100 g': 1, '250 g': 2.5 }, badge: 'Tasty Gravy' },
  { id: 'spice-23-meat-masala', name: 'മീറ്റ് മസാല', categoryId: 'spices', emoji: '🥩', englishNote: 'Meat Roast Masala', defaultUnit: '100 g', availableUnits: ['100 g', '250 g'], unitMultiplier: { '100 g': 1, '250 g': 2.5 }, badge: 'Kerala Style' },
  { id: 'spice-24-turmeric-whole', name: 'മഞ്ഞൾ (Whole)', categoryId: 'spices', emoji: '🌿', englishNote: 'Dried Whole Turmeric Finger', defaultUnit: '250 g', availableUnits: ['100 g', '250 g', '500 g'], unitMultiplier: { '100 g': 0.4, '250 g': 1, '500 g': 2 }, badge: 'Pure Organics' },

  // --- 6. Oil, Salt & Sugar ---
  { id: 'oil-1-coconut-oil', name: 'വെളിച്ചെണ്ണ', categoryId: 'oils-sugar', emoji: '🥥', englishNote: 'Pure Coconut Oil / Velichenna', defaultUnit: '1 L', availableUnits: ['500 ml', '1 L', '2 L'], unitMultiplier: { '500 ml': 0.5, '1 L': 1, '2 L': 2 }, badge: '100% Roasted Pure' },
  { id: 'oil-2-sunflower-oil', name: 'സൺഫ്ലവർ ഓയിൽ', categoryId: 'oils-sugar', emoji: '🌻', englishNote: 'Refined Sunflower Oil', defaultUnit: '1 L', availableUnits: ['1 L', '5 L'], unitMultiplier: { '1 L': 1, '5 L': 5 }, badge: 'Light & Healthy' },
  { id: 'oil-3-rice-bran-oil', name: 'റൈസ് ബ്രാൻ ഓയിൽ', categoryId: 'oils-sugar', emoji: '🌾', englishNote: 'Physically Refined Rice Bran Oil', defaultUnit: '1 L', availableUnits: ['1 L', '5 L'], unitMultiplier: { '1 L': 1, '5 L': 5 }, badge: 'Oryzanol Enriched' },
  { id: 'oil-4-groundnut-oil', name: 'നിലക്കടല എണ്ണ', categoryId: 'oils-sugar', emoji: '🥜', englishNote: 'Cold Pressed Groundnut Oil', defaultUnit: '1 L', availableUnits: ['500 ml', '1 L'], unitMultiplier: { '500 ml': 0.5, '1 L': 1 }, badge: 'Traditional Kachi Ghani' },
  { id: 'oil-5-sesame-oil', name: 'എള്ളെണ്ണ', categoryId: 'oils-sugar', emoji: '🫗', englishNote: 'Gingelly / Sesame Oil', defaultUnit: '1 L', availableUnits: ['500 ml', '1 L'], unitMultiplier: { '500 ml': 0.5, '1 L': 1 }, badge: 'Pure Nalla Yenna' },
  { id: 'oil-6-olive-oil', name: 'ഒലിവ് ഓയിൽ', categoryId: 'oils-sugar', emoji: '🫒', englishNote: 'Extra Virgin Olive Oil', defaultUnit: '1 L', availableUnits: ['500 ml', '1 L'], unitMultiplier: { '500 ml': 0.5, '1 L': 1 }, badge: 'Mediterranean Grade' },
  { id: 'oil-7-salt', name: 'ഉപ്പ്', categoryId: 'oils-sugar', emoji: '🧂', englishNote: 'Iodized Salt', defaultUnit: '1 kg', availableUnits: ['1 kg'], unitMultiplier: { '1 kg': 1 }, badge: 'Daily Essential' },
  { id: 'oil-8-rock-salt', name: 'കല്ലുപ്പ്', categoryId: 'oils-sugar', emoji: '🧂', englishNote: 'Rock Salt / Crystal Salt', defaultUnit: '1 kg', availableUnits: ['1 kg'], unitMultiplier: { '1 kg': 1 }, badge: 'Natural Crystal' },
  { id: 'oil-9-sugar', name: 'പഞ്ചസാര', categoryId: 'oils-sugar', emoji: '🍚', englishNote: 'Refined White Sugar', defaultUnit: '1 kg', availableUnits: ['1 kg', '5 kg'], unitMultiplier: { '1 kg': 1, '5 kg': 5 }, badge: 'Cane Sweet' },
  { id: 'oil-10-jaggery', name: 'ശർക്കര', categoryId: 'oils-sugar', emoji: '🪵', englishNote: 'Maranayur / Kerala Jaggery Round', defaultUnit: '1 kg', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Sweet & Naadan' },
  { id: 'oil-11-powdered-salt', name: 'പൊടിയുപ്പ്', categoryId: 'oils-sugar', emoji: '🧂', englishNote: 'Free Flow Powdered Salt', defaultUnit: '1 kg', availableUnits: ['1 kg'], unitMultiplier: { '1 kg': 1 }, badge: 'Iodized' },

  // --- 7. Dairy & Eggs ---
  { id: 'dairy-1-milk', name: 'പാൽ', categoryId: 'dairy', emoji: '🥛', englishNote: 'Fresh Cow Milk', defaultUnit: '1 L', availableUnits: ['500 ml', '1 L'], unitMultiplier: { '500 ml': 0.5, '1 L': 1 }, badge: 'Daily Morning Fresh' },
  { id: 'dairy-2-curd', name: 'തൈര്', categoryId: 'dairy', emoji: '🍶', englishNote: 'Thick Naadan Curd', defaultUnit: '500 g', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Rich & Creamy' },
  { id: 'dairy-3-buttermilk', name: 'മോര്', categoryId: 'dairy', emoji: '🥛', englishNote: 'Spiced Sambharam / Buttermilk', defaultUnit: '500 ml', availableUnits: ['500 ml', '1 L'], unitMultiplier: { '500 ml': 0.5, '1 L': 1 }, badge: 'Refreshing' },
  { id: 'dairy-4-butter', name: 'വെണ്ണ', categoryId: 'dairy', emoji: '🧈', englishNote: 'Fresh Butter / Vennakkatti', defaultUnit: '500 g', availableUnits: ['100 g', '500 g'], unitMultiplier: { '100 g': 0.2, '500 g': 1 }, badge: 'Pure Dairy' },
  { id: 'dairy-5-ghee', name: 'നെയ്യ്', categoryId: 'dairy', emoji: '🧈', englishNote: 'Pure Cow Ghee', defaultUnit: '500 ml', availableUnits: ['200 ml', '500 ml', '1 L'], unitMultiplier: { '200 ml': 0.4, '500 ml': 1, '1 L': 2 }, badge: 'Aromatic Pure' },
  { id: 'dairy-6-paneer', name: 'പനീർ', categoryId: 'dairy', emoji: '🧀', englishNote: 'Fresh Malai Paneer', defaultUnit: '200 g', availableUnits: ['200 g', '500 g'], unitMultiplier: { '200 g': 1, '500 g': 2.5 }, badge: 'Soft & Rich' },
  { id: 'dairy-7-cheese', name: 'ചീസ്', categoryId: 'dairy', emoji: '🧀', englishNote: 'Processed Cheese Slices / Block', defaultUnit: '200 g', availableUnits: ['200 g', '500 g'], unitMultiplier: { '200 g': 1, '500 g': 2.5 }, badge: 'Melty Rich' },
  { id: 'dairy-8-cream', name: 'ക്രീം', categoryId: 'dairy', emoji: '🍶', englishNote: 'Fresh Dairy Cream', defaultUnit: '250 ml', availableUnits: ['250 ml', '500 ml'], unitMultiplier: { '250 ml': 1, '500 ml': 2 }, badge: 'Thick Cooking Cream' },
  { id: 'dairy-9-condensed-milk', name: 'കണ്ടൻസ്ഡ് മിൽക്ക്', categoryId: 'dairy', emoji: '🥫', englishNote: 'Sweetened Condensed Milk', defaultUnit: '400 g', availableUnits: ['400 g'], unitMultiplier: { '400 g': 1 }, badge: 'Dessert Special' },
  { id: 'dairy-10-egg', name: 'മുട്ട', categoryId: 'dairy', emoji: '🥚', englishNote: 'Farm Fresh White Eggs', defaultUnit: '6 pcs', availableUnits: ['6 pcs', '12 pcs', '30 pcs'], unitMultiplier: { '6 pcs': 1, '12 pcs': 2, '30 pcs': 5 }, badge: 'Farm Daily' },
  { id: 'dairy-11-chicken-egg', name: 'കോഴിമുട്ട', categoryId: 'dairy', emoji: '🥚', englishNote: 'Country / Naadan Chicken Eggs', defaultUnit: '6 pcs', availableUnits: ['6 pcs', '12 pcs'], unitMultiplier: { '6 pcs': 1, '12 pcs': 2 }, badge: 'Naadan Brown' },
  { id: 'dairy-12-quail-egg', name: 'കാടമുട്ട', categoryId: 'dairy', emoji: '🥚', englishNote: 'Quail Eggs / Kada Mutta', defaultUnit: '10 pcs', availableUnits: ['10 pcs', '20 pcs'], unitMultiplier: { '10 pcs': 1, '20 pcs': 2 }, badge: 'Nutrient Dense' },

  // --- 8. Sauces, Pickles & Condiments ---
  { id: 'sauce-1-tomato-ketchup', name: 'തക്കാളി സോസ്', categoryId: 'sauces-condiments', emoji: '🥫', englishNote: 'Tomato Ketchup', defaultUnit: '500 g', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Tangy Sweet' },
  { id: 'sauce-2-chilli-sauce', name: 'ചില്ലി സോസ്', categoryId: 'sauces-condiments', emoji: '🥫', englishNote: 'Green / Red Chilli Sauce', defaultUnit: '500 g', availableUnits: ['200 g', '500 g'], unitMultiplier: { '200 g': 0.4, '500 g': 1 }, badge: 'Spicy Hot' },
  { id: 'sauce-3-soy-sauce', name: 'സോയ സോസ്', categoryId: 'sauces-condiments', emoji: '🍶', englishNote: 'Dark Soy Sauce', defaultUnit: '200 ml', availableUnits: ['200 ml', '500 ml'], unitMultiplier: { '200 ml': 1, '500 ml': 2.5 }, badge: 'Umami Rich' },
  { id: 'sauce-4-vinegar', name: 'വിനാഗിരി', categoryId: 'sauces-condiments', emoji: '🍶', englishNote: 'Synthetic / Coconut Vinegar', defaultUnit: '500 ml', availableUnits: ['500 ml', '1 L'], unitMultiplier: { '500 ml': 0.5, '1 L': 1 }, badge: 'Pure Vinegar' },
  { id: 'sauce-5-mayonnaise', name: 'മയോണൈസ്', categoryId: 'sauces-condiments', emoji: '🥣', englishNote: 'Eggless Garlic Mayonnaise', defaultUnit: '500 g', availableUnits: ['250 g', '500 g'], unitMultiplier: { '250 g': 0.5, '500 g': 1 }, badge: 'Shawarma Special' },
  { id: 'sauce-6-pickle', name: 'അച്ചാർ', categoryId: 'sauces-condiments', emoji: '🫙', englishNote: 'Mixed Veg Pickle', defaultUnit: '400 g', availableUnits: ['200 g', '400 g'], unitMultiplier: { '200 g': 0.5, '400 g': 1 }, badge: 'Spicy Naadan' },
  { id: 'sauce-7-mango-pickle', name: 'മാങ്ങാ അച്ചാർ', categoryId: 'sauces-condiments', emoji: '🥭', englishNote: 'Kerala Cut Mango Pickle', defaultUnit: '400 g', availableUnits: ['400 g', '1 kg'], unitMultiplier: { '400 g': 1, '1 kg': 2.5 }, badge: 'Tender Mango' },
  { id: 'sauce-8-lime-pickle', name: 'നാരങ്ങാ അച്ചാർ', categoryId: 'sauces-condiments', emoji: '🍋', englishNote: 'Spicy Lime Pickle', defaultUnit: '400 g', availableUnits: ['400 g', '1 kg'], unitMultiplier: { '400 g': 1, '1 kg': 2.5 }, badge: 'Tangy Spicy' },
  { id: 'sauce-9-coconut-chutney', name: 'തേങ്ങ ചമ്മന്തി', categoryId: 'sauces-condiments', emoji: '🥥', englishNote: 'Traditional Roasted Coconut Chutney', defaultUnit: '1 pack', availableUnits: ['1 pack', '2 packs'], unitMultiplier: { '1 pack': 1, '2 packs': 2 }, badge: 'Home Style' },
  { id: 'sauce-10-chutney-powder', name: 'ചമ്മന്തി പൊടി', categoryId: 'sauces-condiments', emoji: '🥥', englishNote: 'Idli Podi / Chammanthi Podi', defaultUnit: '250 g', availableUnits: ['100 g', '250 g'], unitMultiplier: { '100 g': 0.4, '250 g': 1 }, badge: 'Kerala Gunpowder' },
  { id: 'sauce-11-papad', name: 'പപ്പടം', categoryId: 'sauces-condiments', emoji: '🫓', englishNote: 'Kerala Guruvayoor Papad', defaultUnit: '1 pack', availableUnits: ['1 pack', '2 packs', '5 packs'], unitMultiplier: { '1 pack': 1, '2 packs': 2, '5 packs': 5 }, badge: 'Crispy Fry' },
  { id: 'sauce-12-dried-chilli-fried', name: 'വറ്റൽമുളക് (Condiment)', categoryId: 'sauces-condiments', emoji: '🌶️', englishNote: 'Curd Chilli / Kondattam Mulaku', defaultUnit: '250 g', availableUnits: ['100 g', '250 g'], unitMultiplier: { '100 g': 0.4, '250 g': 1 }, badge: 'Salted & Dried' },

  // --- 9. Biscuits & Snacks ---
  { id: 'snack-1-biscuits', name: 'ബിസ്കറ്റ്', categoryId: 'biscuits-snacks', emoji: '🍪', englishNote: 'Assorted Tea Biscuits', defaultUnit: '1 pack', availableUnits: ['1 pack', '2 packs'], unitMultiplier: { '1 pack': 1, '2 packs': 2 }, badge: 'Crispy Snack' },
  { id: 'snack-2-cream-biscuits', name: 'ക്രീം ബിസ്കറ്റ്', categoryId: 'biscuits-snacks', emoji: '🍪', englishNote: 'Bourbon & Chocolate Cream Biscuits', defaultUnit: '1 pack', availableUnits: ['1 pack', '2 packs'], unitMultiplier: { '1 pack': 1, '2 packs': 2 }, badge: 'Kids Favorite' },
  { id: 'snack-3-marie-biscuits', name: 'മാരി ബിസ്കറ്റ്', categoryId: 'biscuits-snacks', emoji: '🍪', englishNote: 'Marie Light Tea Biscuits', defaultUnit: '1 pack', availableUnits: ['1 pack', '2 packs'], unitMultiplier: { '1 pack': 1, '2 packs': 2 }, badge: 'Low Sugar' },
  { id: 'snack-4-glucose-biscuits', name: 'ഗ്ലൂക്കോസ് ബിസ്കറ്റ്', categoryId: 'biscuits-snacks', emoji: '🍪', englishNote: 'Glucose Energy Biscuits', defaultUnit: '1 pack', availableUnits: ['1 pack', '2 packs'], unitMultiplier: { '1 pack': 1, '2 packs': 2 }, badge: 'Classic Energy' },
  { id: 'snack-5-bread', name: 'ബ്രെഡ്', categoryId: 'biscuits-snacks', emoji: '🍞', englishNote: 'Whole Wheat / White Bread', defaultUnit: '1 pack', availableUnits: ['1 pack', '2 packs'], unitMultiplier: { '1 pack': 1, '2 packs': 2 }, badge: 'Freshly Baked' },
  { id: 'snack-6-bun', name: 'ബൺ', categoryId: 'biscuits-snacks', emoji: '🥯', englishNote: 'Sweet Butter Bun', defaultUnit: '1 pack', availableUnits: ['1 pack', '2 packs'], unitMultiplier: { '1 pack': 1, '2 packs': 2 }, badge: 'Tea Time' },
  { id: 'snack-7-rusk', name: 'റസ്ക്', categoryId: 'biscuits-snacks', emoji: '🍞', englishNote: 'Elaichi Crispy Butter Rusk', defaultUnit: '1 pack', availableUnits: ['1 pack', '2 packs'], unitMultiplier: { '1 pack': 1, '2 packs': 2 }, badge: 'Crunchy Tea Dip' },
  { id: 'snack-8-cake', name: 'കേക്ക്', categoryId: 'biscuits-snacks', emoji: '🍰', englishNote: 'Plum & Tea Sponge Cake', defaultUnit: '1 unit', availableUnits: ['1 unit', '2 units'], unitMultiplier: { '1 unit': 1, '2 units': 2 }, badge: 'Fresh Bakery' },
  { id: 'snack-9-chips', name: 'ചിപ്സ്', categoryId: 'biscuits-snacks', emoji: '🥔', englishNote: 'Salted Potato Chips', defaultUnit: '250 g', availableUnits: ['100 g', '250 g'], unitMultiplier: { '100 g': 0.4, '250 g': 1 }, badge: 'Crisp & Light' },
  { id: 'snack-10-banana-chips', name: 'വാഴക്ക ചിപ്സ്', categoryId: 'biscuits-snacks', emoji: '🍌', englishNote: 'Kerala Nendran Banana Chips in Coconut Oil', defaultUnit: '500 g', availableUnits: ['250 g', '500 g', '1 kg'], unitMultiplier: { '250 g': 0.5, '500 g': 1, '1 kg': 2 }, badge: 'Pure Coconut Oil' },
  { id: 'snack-11-tapioca-chips', name: 'കപ്പ ചിപ്സ്', categoryId: 'biscuits-snacks', emoji: '🪵', englishNote: 'Crispy Kappa / Tapioca Chips', defaultUnit: '500 g', availableUnits: ['250 g', '500 g'], unitMultiplier: { '250 g': 0.5, '500 g': 1 }, badge: 'Kerala Crunch' },
  { id: 'snack-12-mixture', name: 'മിക്സ്ചർ', categoryId: 'biscuits-snacks', emoji: '🥨', englishNote: 'Kerala Spicy Mixture', defaultUnit: '500 g', availableUnits: ['250 g', '500 g'], unitMultiplier: { '250 g': 0.5, '500 g': 1 }, badge: 'Spicy & Savory' },
  { id: 'snack-13-murukku', name: 'മുറുക്ക്', categoryId: 'biscuits-snacks', emoji: '🥨', englishNote: 'Crunchy Rice Murukku', defaultUnit: '500 g', availableUnits: ['250 g', '500 g'], unitMultiplier: { '250 g': 0.5, '500 g': 1 }, badge: 'Traditional' },
  { id: 'snack-14-uzhunnu-vada', name: 'ഉഴുന്നുവട', categoryId: 'biscuits-snacks', emoji: '🍩', englishNote: 'Crispy Uzhunnu Vada (Snack Pack)', defaultUnit: '1 pack', availableUnits: ['1 pack (4 pcs)'], unitMultiplier: { '1 pack (4 pcs)': 1 }, badge: 'Hot & Crispy' },
  { id: 'snack-15-achappam', name: 'അച്ചപ്പം', categoryId: 'biscuits-snacks', emoji: '🌸', englishNote: 'Sweet Rose Cookie / Achappam', defaultUnit: '1 pack', availableUnits: ['1 pack', '2 packs'], unitMultiplier: { '1 pack': 1, '2 packs': 2 }, badge: 'Naadan Sweet' },
  { id: 'snack-16-kuzhalappam', name: 'കുഴലപ്പം', categoryId: 'biscuits-snacks', emoji: '🥖', englishNote: 'Crispy Rice Tube / Kuzhalappam', defaultUnit: '1 pack', availableUnits: ['1 pack', '2 packs'], unitMultiplier: { '1 pack': 1, '2 packs': 2 }, badge: 'Traditional Crunch' },

  // --- 10. Tea, Coffee & Drinks ---
  { id: 'bev-1-tea-powder', name: 'ചായപ്പൊടി', categoryId: 'beverages', emoji: '☕', englishNote: 'Dust Tea / Strong Kerala Chai Powder', defaultUnit: '500 g', availableUnits: ['250 g', '500 g', '1 kg'], unitMultiplier: { '250 g': 0.5, '500 g': 1, '1 kg': 2 }, badge: 'Strong & Kadak' },
  { id: 'bev-2-coffee-powder', name: 'കാപ്പിപ്പൊടി', categoryId: 'beverages', emoji: '☕', englishNote: 'Filter Coffee Powder (Chicory Blend)', defaultUnit: '250 g', availableUnits: ['100 g', '250 g', '500 g'], unitMultiplier: { '100 g': 0.4, '250 g': 1, '500 g': 2 }, badge: 'Wayanad Roast' },
  { id: 'bev-3-instant-coffee', name: 'ഇൻസ്റ്റന്റ് കോഫി', categoryId: 'beverages', emoji: '☕', englishNote: 'Pure Instant Coffee', defaultUnit: '100 g', availableUnits: ['50 g', '100 g', '200 g'], unitMultiplier: { '50 g': 0.5, '100 g': 1, '200 g': 2 }, badge: 'Instant Aroma' },
  { id: 'bev-4-green-tea', name: 'ഗ്രീൻ ടീ', categoryId: 'beverages', emoji: '🍵', englishNote: 'Antioxidant Green Tea Bags', defaultUnit: '25 bags', availableUnits: ['25 bags', '50 bags'], unitMultiplier: { '25 bags': 1, '50 bags': 2 }, badge: 'Detox & Healthy' },
  { id: 'bev-5-milk-powder', name: 'പാൽപ്പൊടി', categoryId: 'beverages', emoji: '🥛', englishNote: 'Dairy Whitener / Milk Powder', defaultUnit: '500 g', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Instant Dairy' },
  { id: 'bev-6-cocoa-powder', name: 'കോക്കോ പൗഡർ', categoryId: 'beverages', emoji: '🍫', englishNote: 'Pure Drinking Cocoa Powder', defaultUnit: '100 g', availableUnits: ['100 g', '250 g'], unitMultiplier: { '100 g': 1, '250 g': 2.5 }, badge: 'Rich Chocolate' },
  { id: 'bev-7-boost', name: 'ബൂസ്റ്റ്', categoryId: 'beverages', emoji: '⚡', englishNote: 'Boost Health Drink Jar', defaultUnit: '500 g', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Energy Drink' },
  { id: 'bev-8-horlicks', name: 'ഹോർലിക്സ്', categoryId: 'beverages', emoji: '🥛', englishNote: 'Horlicks Malt Health Drink', defaultUnit: '500 g', availableUnits: ['500 g', '1 kg'], unitMultiplier: { '500 g': 0.5, '1 kg': 1 }, badge: 'Nutrition Jar' },
  { id: 'bev-9-squash', name: 'സ്ക്വാഷ്', categoryId: 'beverages', emoji: '🍹', englishNote: 'Orange / Pineapple Fruit Squash', defaultUnit: '700 ml', availableUnits: ['700 ml'], unitMultiplier: { '700 ml': 1 }, badge: 'Fruit Concentrate' },
  { id: 'bev-10-fruit-juice', name: 'ഫ്രൂട്ട് ജ്യൂസ്', categoryId: 'beverages', emoji: '🧃', englishNote: 'Natural Mixed Fruit Juice Tetra Pack', defaultUnit: '1 L', availableUnits: ['1 L'], unitMultiplier: { '1 L': 1 }, badge: '100% Refreshing' },
  { id: 'bev-11-soft-drink', name: 'സോഫ്റ്റ് ഡ്രിങ്ക്', categoryId: 'beverages', emoji: '🥤', englishNote: 'Carbonated Soft Drink Bottle', defaultUnit: '750 ml', availableUnits: ['750 ml', '1.5 L'], unitMultiplier: { '750 ml': 1, '1.5 L': 2 }, badge: 'Chilled Fizzy' },
  { id: 'bev-12-mineral-water', name: 'മിനറൽ വാട്ടർ', categoryId: 'beverages', emoji: '💧', englishNote: 'Packaged Mineral Drinking Water', defaultUnit: '1 L', availableUnits: ['1 L', '2 L', '5 L'], unitMultiplier: { '1 L': 1, '2 L': 2, '5 L': 5 }, badge: 'Pure & Clean' },

  // --- 11. Kitchen Utensils ---
  { id: 'utensil-1-cooking-pot', name: 'ചട്ടി', categoryId: 'utensils', emoji: '🍲', englishNote: 'Cooking Pot', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Durable' },
  { id: 'utensil-2-pot', name: 'കലം', categoryId: 'utensils', emoji: '🍲', englishNote: 'Rice & Water Cooking Pot', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Traditional' },
  { id: 'utensil-3-curry-pot', name: 'കറിച്ചട്ടി', categoryId: 'utensils', emoji: '🍲', englishNote: 'Traditional Curry Pot', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Heavy Base' },
  { id: 'utensil-4-fish-curry-pot', name: 'മീൻചട്ടി', categoryId: 'utensils', emoji: '🍲', englishNote: 'Seasoned Fish Curry Clay Chatti', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Clay Seasoned' },
  { id: 'utensil-5-clay-pot', name: 'മൺചട്ടി', categoryId: 'utensils', emoji: '🍲', englishNote: 'Pure Earthen Clay Pot', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: '100% Natural' },
  { id: 'utensil-6-uruli', name: 'ഉരുളി', categoryId: 'utensils', emoji: '🥘', englishNote: 'Bronze / Heavy Uruli', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Traditional Heavy' },
  { id: 'utensil-7-kadai', name: 'കടായി', categoryId: 'utensils', emoji: '🥘', englishNote: 'Stainless Steel / Cast Iron Kadai', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Deep Frying' },
  { id: 'utensil-8-frying-pan', name: 'ഫ്രൈയിംഗ് പാൻ', categoryId: 'utensils', emoji: '🍳', englishNote: 'Non-Stick / Granite Frying Pan', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Non-Stick' },
  { id: 'utensil-9-tawa', name: 'തവ', categoryId: 'utensils', emoji: '🍳', englishNote: 'Flat Iron Roti Tawa', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Even Heat' },
  { id: 'utensil-10-dosa-tawa', name: 'ദോശ തവ', categoryId: 'utensils', emoji: '🍳', englishNote: 'Granite / Cast Iron Dosa Tawa', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Crispy Dosa' },
  { id: 'utensil-11-appam-pan', name: 'അപ്പം ചട്ടി', categoryId: 'utensils', emoji: '🍳', englishNote: 'Non-Stick Appam Maker with Lid', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Lace Appam' },
  { id: 'utensil-12-pressure-cooker', name: 'പ്രഷർ കുക്കർ', categoryId: 'utensils', emoji: '🍲', englishNote: 'Stainless Steel Pressure Cooker', defaultUnit: '3 L', availableUnits: ['3 L', '5 L'], unitMultiplier: { '3 L': 1, '5 L': 1.6 }, badge: 'ISI Certified' },
  { id: 'utensil-13-steamer', name: 'സ്റ്റീമർ', categoryId: 'utensils', emoji: '🍲', englishNote: 'Multi-Tier Idli / Momos Steamer', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Healthy Steam' },
  { id: 'utensil-14-puttu-maker', name: 'പുട്ടുകുടം', categoryId: 'utensils', emoji: '🍲', englishNote: 'Puttu Kudam & Steamer Base', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Steel Classic' },
  { id: 'utensil-15-puttu-mould', name: 'പുട്ടുകുറ്റി', categoryId: 'utensils', emoji: '🥢', englishNote: 'Stainless Steel Puttu Kutti Cylinder', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Kerala Puttu' },
  { id: 'utensil-16-idiyappam-press', name: 'ഇടിയപ്പം അച്ച്', categoryId: 'utensils', emoji: '🥢', englishNote: 'Brass / Steel Idiyappam / Sev Press', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Multi Disc' },
  { id: 'utensil-17-knife', name: 'കത്തി', categoryId: 'utensils', emoji: '🔪', englishNote: 'Stainless Steel Kitchen Knife Set', defaultUnit: '1 unit', availableUnits: ['1 unit', 'Set of 3'], unitMultiplier: { '1 unit': 1, 'Set of 3': 3 }, badge: 'Razor Sharp' },
  { id: 'utensil-18-kitchen-sickle', name: 'അരിവാൾ', categoryId: 'utensils', emoji: '🔪', englishNote: 'Arival / Vegetable Cutting Board Sickle', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Traditional Craft' },
  { id: 'utensil-19-cutting-board', name: 'കട്ടിംഗ് ബോർഡ്', categoryId: 'utensils', emoji: '🪵', englishNote: 'Wood / Food Grade Chopping Board', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Eco Friendly' },
  { id: 'utensil-20-coconut-scraper', name: 'തേങ്ങ ചിരവ', categoryId: 'utensils', emoji: '🥥', englishNote: 'Table-Top Coconut Scraper Chirava', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Stainless Blade' },
  { id: 'utensil-21-grater', name: 'ചിരവ', categoryId: 'utensils', emoji: '🔪', englishNote: 'Multi-Purpose Hand Grater & Slicer', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Stainless Steel' },
  { id: 'utensil-22-sieve', name: 'അരിപ്പ', categoryId: 'utensils', emoji: '🥣', englishNote: 'Flour Sieve / Arippa', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Fine Mesh' },
  { id: 'utensil-23-strainer', name: 'അരിച്ചട്ടി', categoryId: 'utensils', emoji: '🥣', englishNote: 'Stainless Steel Tea & Liquid Strainer', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Double Mesh' },
  { id: 'utensil-24-spoon', name: 'കരണ്ടി', categoryId: 'utensils', emoji: '🥄', englishNote: 'Dining Table Spoons', defaultUnit: 'Set of 6', availableUnits: ['Set of 6'], unitMultiplier: { 'Set of 6': 1 }, badge: 'Food Grade Steel' },
  { id: 'utensil-25-ladle', name: 'കറി കരണ്ടി', categoryId: 'utensils', emoji: '🥄', englishNote: 'Curry Serving Ladle Set', defaultUnit: '1 unit', availableUnits: ['1 unit', 'Set of 3'], unitMultiplier: { '1 unit': 1, 'Set of 3': 3 }, badge: 'Deep Scoop' },
  { id: 'utensil-26-spatula', name: 'ചട്ടുകം', categoryId: 'utensils', emoji: '🥢', englishNote: 'Steel / Wooden Dosa Turner Spatula', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Heat Resistant' },
  { id: 'utensil-27-plate', name: 'പ്ലേറ്റ്', categoryId: 'utensils', emoji: '🍽️', englishNote: 'Stainless Steel Dinner Plates', defaultUnit: 'Set of 4', availableUnits: ['Set of 4', '1 unit'], unitMultiplier: { 'Set of 4': 1, '1 unit': 0.25 }, badge: 'Mirror Polish' },
  { id: 'utensil-28-bowl', name: 'കിണ്ണം', categoryId: 'utensils', emoji: '🥣', englishNote: 'Stainless Steel Curry Bowls / Kinnam', defaultUnit: 'Set of 4', availableUnits: ['Set of 4', '1 unit'], unitMultiplier: { 'Set of 4': 1, '1 unit': 0.25 }, badge: 'Daily Kitchen' },
  { id: 'utensil-29-glass', name: 'ഗ്ലാസ്', categoryId: 'utensils', emoji: '🥛', englishNote: 'Stainless Steel Drinking Tumbler / Glass', defaultUnit: 'Set of 6', availableUnits: ['Set of 6'], unitMultiplier: { 'Set of 6': 1 }, badge: 'Heavy Steel' },
  { id: 'utensil-30-cup', name: 'കപ്പ്', categoryId: 'utensils', emoji: '☕', englishNote: 'Ceramic / Steel Tea Cups', defaultUnit: 'Set of 6', availableUnits: ['Set of 6'], unitMultiplier: { 'Set of 6': 1 }, badge: 'Tea Time Set' },
  { id: 'utensil-31-jug', name: 'ജഗ്', categoryId: 'utensils', emoji: '🏺', englishNote: 'Stainless Steel Water Jug Pitcher', defaultUnit: '1 unit', availableUnits: ['1 unit (1.5 L)'], unitMultiplier: { '1 unit (1.5 L)': 1 }, badge: 'Leakproof' },
  { id: 'utensil-32-tray', name: 'ട്രേ', categoryId: 'utensils', emoji: '🍱', englishNote: 'Serving Tray', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Elegant Serve' },

  // --- 12. Cleaning & Household ---
  { id: 'clean-1-dishwash-liquid', name: 'ഡിഷ് വാഷ്', categoryId: 'cleaning-household', emoji: '🧴', englishNote: 'Lemon Dishwash Gel', defaultUnit: '500 ml', availableUnits: ['500 ml', '1 L'], unitMultiplier: { '500 ml': 0.5, '1 L': 1 }, badge: 'Grease Buster' },
  { id: 'clean-2-soap', name: 'സോപ്പ് (Laundry / Dish)', categoryId: 'cleaning-household', emoji: '🧼', englishNote: 'Cleaning Bar Soap', defaultUnit: 'Pack of 4', availableUnits: ['Pack of 4'], unitMultiplier: { 'Pack of 4': 1 }, badge: 'Tough Stain' },
  { id: 'clean-3-washing-powder', name: 'അലക്കുപൊടി', categoryId: 'cleaning-household', emoji: '🧼', englishNote: 'Washing Powder / Laundry Detergent', defaultUnit: '1 kg', availableUnits: ['1 kg', '2 kg', '5 kg'], unitMultiplier: { '1 kg': 1, '2 kg': 2, '5 kg': 5 }, badge: 'Bright Wash' },
  { id: 'clean-4-scrubber', name: 'സ്ക്രബ്ബർ', categoryId: 'cleaning-household', emoji: '🧽', englishNote: 'Steel Wire & Nylon Scrub Pad', defaultUnit: 'Pack of 3', availableUnits: ['Pack of 3'], unitMultiplier: { 'Pack of 3': 1 }, badge: 'Heavy Duty' },
  { id: 'clean-5-sponge', name: 'സ്പോഞ്ച്', categoryId: 'cleaning-household', emoji: '🧽', englishNote: 'Cellulose Kitchen Sponge Wipe', defaultUnit: 'Pack of 2', availableUnits: ['Pack of 2'], unitMultiplier: { 'Pack of 2': 1 }, badge: 'Super Absorbent' },
  { id: 'clean-6-dish-brush', name: 'പാത്രം കഴുകുന്ന ബ്രഷ്', categoryId: 'cleaning-household', emoji: '🧹', englishNote: 'Dish & Bottle Cleaning Brush', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Ergonomic' },
  { id: 'clean-7-cloth', name: 'തുണി', categoryId: 'cleaning-household', emoji: '🧻', englishNote: 'Microfiber Cleaning Duster Cloth', defaultUnit: 'Pack of 3', availableUnits: ['Pack of 3'], unitMultiplier: { 'Pack of 3': 1 }, badge: 'Lint Free' },
  { id: 'clean-8-kitchen-cloth', name: 'അടുക്കള തുണി', categoryId: 'cleaning-household', emoji: '🧻', englishNote: 'Cotton Kitchen Towel Wipe', defaultUnit: 'Pack of 3', availableUnits: ['Pack of 3'], unitMultiplier: { 'Pack of 3': 1 }, badge: '100% Cotton' },
  { id: 'clean-9-dustbin', name: 'ചവറ്റുകുട്ട', categoryId: 'cleaning-household', emoji: '🗑️', englishNote: 'Pedal Foot Dustbin', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Odor Lock' },
  { id: 'clean-10-bucket', name: 'ബക്കറ്റ്', categoryId: 'cleaning-household', emoji: '🪣', englishNote: 'Heavy Duty Plastic Water Bucket', defaultUnit: '1 unit (15 L)', availableUnits: ['10 L', '15 L', '20 L'], unitMultiplier: { '10 L': 0.7, '15 L': 1, '20 L': 1.3 }, badge: 'Unbreakable' },
  { id: 'clean-11-mug', name: 'മഗ്', categoryId: 'cleaning-household', emoji: '🪣', englishNote: 'Plastic Bathroom Water Mug', defaultUnit: '1 unit (1 L)', availableUnits: ['1 unit (1 L)'], unitMultiplier: { '1 unit (1 L)': 1 }, badge: 'Sturdy Grip' },
  { id: 'clean-12-broom', name: 'ചൂൽ', categoryId: 'cleaning-household', emoji: '🧹', englishNote: 'Grass & Coconut Eerkil Broom', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Dust Free' },
  { id: 'clean-13-mop', name: 'മോപ്പ്', categoryId: 'cleaning-household', emoji: '🧹', englishNote: 'Spin Floor Cleaning Mop', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Easy Wring' },
  { id: 'clean-14-detergent-liquid', name: 'ഡിറ്റർജന്റ്', categoryId: 'cleaning-household', emoji: '🧴', englishNote: 'Liquid Fabric Washing Detergent', defaultUnit: '1 L', availableUnits: ['1 L', '2 L'], unitMultiplier: { '1 L': 1, '2 L': 2 }, badge: 'Color Care' },
  { id: 'clean-15-floor-cleaner', name: 'ഫ്ലോർ ക്ലീനർ', categoryId: 'cleaning-household', emoji: '🧴', englishNote: 'Disinfectant Pine Floor Cleaner', defaultUnit: '1 L', availableUnits: ['500 ml', '1 L'], unitMultiplier: { '500 ml': 0.5, '1 L': 1 }, badge: '99.9% Germ Kill' },
  { id: 'clean-16-toilet-cleaner', name: 'ടോയ്ലറ്റ് ക്ലീനർ', categoryId: 'cleaning-household', emoji: '🧴', englishNote: 'Power Toilet Cleaner Gel', defaultUnit: '1 L', availableUnits: ['500 ml', '1 L'], unitMultiplier: { '500 ml': 0.5, '1 L': 1 }, badge: 'Stain Remover' },
  { id: 'clean-17-glass-cleaner', name: 'ഗ്ലാസ് ക്ലീനർ', categoryId: 'cleaning-household', emoji: '🧴', englishNote: 'Spray Glass & Surface Cleaner', defaultUnit: '500 ml', availableUnits: ['500 ml'], unitMultiplier: { '500 ml': 1 }, badge: 'Shine & Sparkle' },

  // --- 13. Storage & Household Containers ---
  { id: 'store-1-plastic-container', name: 'പ്ലാസ്റ്റിക് പാത്രം', categoryId: 'storage-containers', emoji: '📦', englishNote: 'Airtight Plastic Kitchen Container', defaultUnit: 'Set of 3', availableUnits: ['Set of 3', '1 unit'], unitMultiplier: { 'Set of 3': 1, '1 unit': 0.35 }, badge: 'BPA Free' },
  { id: 'store-2-steel-container', name: 'സ്റ്റീൽ പാത്രം', categoryId: 'storage-containers', emoji: '🥫', englishNote: 'Stainless Steel Storage Dabba', defaultUnit: 'Set of 3', availableUnits: ['Set of 3', '1 unit'], unitMultiplier: { 'Set of 3': 1, '1 unit': 0.35 }, badge: 'Heavy Gauge' },
  { id: 'store-3-food-container', name: 'ഭക്ഷണ പാത്രം', categoryId: 'storage-containers', emoji: '🍱', englishNote: 'Microwave Safe Food Box', defaultUnit: 'Set of 3', availableUnits: ['Set of 3'], unitMultiplier: { 'Set of 3': 1 }, badge: 'Leakproof' },
  { id: 'store-4-water-bottle', name: 'വെള്ളക്കുപ്പി', categoryId: 'storage-containers', emoji: '🍶', englishNote: 'Steel & Fridge Water Bottle', defaultUnit: '1 unit (1 L)', availableUnits: ['1 unit (1 L)', 'Set of 2'], unitMultiplier: { '1 unit (1 L)': 1, 'Set of 2': 2 }, badge: 'BPA Free' },
  { id: 'store-5-bottle', name: 'കുപ്പി', categoryId: 'storage-containers', emoji: '🍶', englishNote: 'Glass & Storage Bottle', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Airtight Cap' },
  { id: 'store-6-storage-jar', name: 'ഭരണി', categoryId: 'storage-containers', emoji: '🏺', englishNote: 'Ceramic Pickle Bharani Storage Jar', defaultUnit: '1 unit (2 kg)', availableUnits: ['1 unit (2 kg)', '1 unit (5 kg)'], unitMultiplier: { '1 unit (2 kg)': 1, '1 unit (5 kg)': 2.5 }, badge: 'Traditional' },
  { id: 'store-7-spice-container', name: 'മസാല പാത്രം', categoryId: 'storage-containers', emoji: '📦', englishNote: 'Masala Dabba Spice Box with Spoons', defaultUnit: 'Set of 7 in 1', availableUnits: ['Set of 7 in 1'], unitMultiplier: { 'Set of 7 in 1': 1 }, badge: 'Organizer' },
  { id: 'store-8-rice-container', name: 'അരി പാത്രം', categoryId: 'storage-containers', emoji: '🪣', englishNote: 'Large Drum Container for Rice (Ari Dabba)', defaultUnit: '1 unit (25 kg)', availableUnits: ['10 kg', '25 kg'], unitMultiplier: { '10 kg': 0.4, '25 kg': 1 }, badge: 'Pest Guard' },
  { id: 'store-9-storage-box', name: 'ഡബ്ബ', categoryId: 'storage-containers', emoji: '📦', englishNote: 'Multi-Purpose Utility Storage Dabba', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Airtight' },
  { id: 'store-10-lunch-box', name: 'ലഞ്ച് ബോക്സ്', categoryId: 'storage-containers', emoji: '🍱', englishNote: 'Insulated Steel Tiffin Lunch Box', defaultUnit: '1 unit', availableUnits: ['1 unit'], unitMultiplier: { '1 unit': 1 }, badge: 'Hot & Fresh' },
  { id: 'store-11-flask', name: 'ഫ്ലാസ്ക്', categoryId: 'storage-containers', emoji: '🍶', englishNote: 'Vacuum Insulated Hot & Cold Thermos Flask', defaultUnit: '1 unit (1 L)', availableUnits: ['500 ml', '1 L'], unitMultiplier: { '500 ml': 0.6, '1 L': 1 }, badge: '24Hr Insulated' },
  { id: 'store-12-water-pot', name: 'വെള്ളക്കുടം', categoryId: 'storage-containers', emoji: '🏺', englishNote: 'Clay / Copper Water Pot Dispenser', defaultUnit: '1 unit (15 L)', availableUnits: ['10 L', '15 L'], unitMultiplier: { '10 L': 0.7, '15 L': 1 }, badge: 'Cool Natural' },

  // --- 14. Baby & Family Essentials ---
  { id: 'baby-1-baby-food', name: 'ബേബി ഫുഡ്', categoryId: 'baby-family', emoji: '🥣', englishNote: 'Infant Cereal Baby Food', defaultUnit: '400 g', availableUnits: ['400 g'], unitMultiplier: { '400 g': 1 }, badge: 'Nutrient Rich' },
  { id: 'baby-2-baby-bottle', name: 'ബേബി ബോട്ടിൽ', categoryId: 'baby-family', emoji: '🍼', englishNote: 'Anti-Colic Baby Feeding Bottle', defaultUnit: '1 unit (250 ml)', availableUnits: ['1 unit (250 ml)'], unitMultiplier: { '1 unit (250 ml)': 1 }, badge: 'BPA Free' },
  { id: 'baby-3-diaper', name: 'ഡയപ്പർ', categoryId: 'baby-family', emoji: '👶', englishNote: 'Comfort Baby Diaper Pants', defaultUnit: 'Pack of 30', availableUnits: ['Pack of 30', 'Pack of 60'], unitMultiplier: { 'Pack of 30': 1, 'Pack of 60': 2 }, badge: '12Hr Dryness' },
  { id: 'baby-4-baby-wipes', name: 'ബേബി വൈപ്പ്സ്', categoryId: 'baby-family', emoji: '🧻', englishNote: 'Gentle Aloe Baby Cleansing Wipes', defaultUnit: 'Pack of 80', availableUnits: ['Pack of 80'], unitMultiplier: { 'Pack of 80': 1 }, badge: '99% Pure Water' },
  { id: 'baby-5-tissue', name: 'ടിഷ്യു', categoryId: 'baby-family', emoji: '🧻', englishNote: 'Soft Facial Tissue Box', defaultUnit: 'Box of 100', availableUnits: ['Box of 100', 'Pack of 200'], unitMultiplier: { 'Box of 100': 1, 'Pack of 200': 2 }, badge: '2-Ply Soft' },
  { id: 'baby-6-napkin', name: 'നാപ്കിൻ', categoryId: 'baby-family', emoji: '🧻', englishNote: 'Cotton Table & Dining Napkins', defaultUnit: 'Pack of 20', availableUnits: ['Pack of 20'], unitMultiplier: { 'Pack of 20': 1 }, badge: 'Absorbent' },
  { id: 'baby-7-paper-towel', name: 'പേപ്പർ ടവൽ', categoryId: 'baby-family', emoji: '🧻', englishNote: 'Kitchen Paper Towel Rolls', defaultUnit: 'Pack of 2 Rolls', availableUnits: ['Pack of 2 Rolls'], unitMultiplier: { 'Pack of 2 Rolls': 1 }, badge: 'Heavy Absorbent' },

  // --- 15. Personal Care ---
  { id: 'care-1-shampoo', name: 'ഷാംപൂ', categoryId: 'personal-care', emoji: '🧴', englishNote: 'Hair Fall & Anti-Dandruff Shampoo', defaultUnit: '340 ml', availableUnits: ['180 ml', '340 ml', '650 ml'], unitMultiplier: { '180 ml': 0.5, '340 ml': 1, '650 ml': 1.9 }, badge: 'Smooth & Shiny' },
  { id: 'care-2-hair-oil', name: 'ഹെയർ ഓയിൽ', categoryId: 'personal-care', emoji: '🧴', englishNote: 'Ayurvedic Neelibhringadi & Coconut Hair Oil', defaultUnit: '200 ml', availableUnits: ['100 ml', '200 ml', '500 ml'], unitMultiplier: { '100 ml': 0.5, '200 ml': 1, '500 ml': 2.5 }, badge: 'Herbal Care' },
  { id: 'care-3-toothpaste', name: 'ടൂത്ത്പേസ്റ്റ്', categoryId: 'personal-care', emoji: '🪥', englishNote: 'Herbal Cavity Protection Toothpaste', defaultUnit: '150 g', availableUnits: ['100 g', '150 g', '200 g'], unitMultiplier: { '100 g': 0.7, '150 g': 1, '200 g': 1.3 }, badge: '12Hr Fresh' },
  { id: 'care-4-toothbrush', name: 'ടൂത്ത് ബ്രഷ്', categoryId: 'personal-care', emoji: '🪥', englishNote: 'Super Soft Bristles Toothbrush', defaultUnit: 'Pack of 4', availableUnits: ['1 unit', 'Pack of 4'], unitMultiplier: { '1 unit': 0.3, 'Pack of 4': 1 }, badge: 'Gum Care' },
  { id: 'care-5-body-soap', name: 'ബോഡി സോപ്പ്', categoryId: 'personal-care', emoji: '🧼', englishNote: 'Moisturizing & Ayurvedic Bathing Soap', defaultUnit: 'Pack of 4', availableUnits: ['Pack of 4'], unitMultiplier: { 'Pack of 4': 1 }, badge: 'Grade 1 Soap' },
  { id: 'care-6-hand-wash', name: 'ഹാൻഡ് വാഷ്', categoryId: 'personal-care', emoji: '🧴', englishNote: 'Antibacterial Liquid Hand Wash', defaultUnit: '250 ml', availableUnits: ['250 ml', '750 ml Refill'], unitMultiplier: { '250 ml': 1, '750 ml Refill': 2.5 }, badge: 'Germ Guard' },
  { id: 'care-7-face-wash', name: 'ഫേസ് വാഷ്', categoryId: 'personal-care', emoji: '🧴', englishNote: 'Neem & Tea Tree Purifying Face Wash', defaultUnit: '150 ml', availableUnits: ['100 ml', '150 ml'], unitMultiplier: { '100 ml': 0.7, '150 ml': 1 }, badge: 'Oil Free' },
  { id: 'care-8-cream', name: 'ക്രീം (Face & Body)', categoryId: 'personal-care', emoji: '🧴', englishNote: 'Moisturizing Cold & Body Cream', defaultUnit: '100 g', availableUnits: ['50 g', '100 g'], unitMultiplier: { '50 g': 0.5, '100 g': 1 }, badge: 'Soft Skin' },
  { id: 'care-9-talcum-powder', name: 'ടാൽക്കം പൗഡർ', categoryId: 'personal-care', emoji: '🧴', englishNote: 'Cooling Fragrance Talcum Powder', defaultUnit: '250 g', availableUnits: ['100 g', '250 g', '400 g'], unitMultiplier: { '100 g': 0.4, '250 g': 1, '400 g': 1.6 }, badge: 'All Day Fresh' },
  { id: 'care-10-shaving-cream', name: 'ഷേവിംഗ് ക്രീം', categoryId: 'personal-care', emoji: '🪒', englishNote: 'Menthol Smooth Shaving Cream', defaultUnit: '100 g', availableUnits: ['100 g'], unitMultiplier: { '100 g': 1 }, badge: 'Smooth Glide' },
  { id: 'care-11-razor', name: 'റേസർ', categoryId: 'personal-care', emoji: '🪒', englishNote: 'Triple Blade Safety Shaving Razor', defaultUnit: 'Pack of 5', availableUnits: ['1 unit', 'Pack of 5'], unitMultiplier: { '1 unit': 0.25, 'Pack of 5': 1 }, badge: 'Close Shave' },
];

export async function populateAllCategoriesMasterCatalog() {
  console.log(`🚀 Starting system master catalog population for ${NEW_MASTER_PRODUCTS.length} products across all categories...`);

  const client = await pool.connect();
  setPostgresConnected(true);
  console.log('✅ Connected to PostgreSQL for full Master Catalog population.');

  try {
    for (const cat of ALL_SYSTEM_CATEGORIES) {
      await client.query(
        `INSERT INTO categories (id, name, slug, icon, description)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           slug = EXCLUDED.slug,
           icon = EXCLUDED.icon,
           description = EXCLUDED.description`,
        [cat.id, cat.name, cat.slug, cat.icon, cat.description]
      );
    }

    let createdCount = 0;
    let errorCount = 0;

    for (const item of NEW_MASTER_PRODUCTS) {
      try {
        const productPayload = {
          id: item.id,
          name: item.name,
          categoryId: item.categoryId,
          emoji: item.emoji,
          image: '',
          defaultUnit: item.defaultUnit,
          availableUnits: item.availableUnits,
          unitMultiplier: item.unitMultiplier,
          isOrganic: false,
          isSeasonal: false,
          badge: item.badge || 'Quality Guaranteed',
          nutritionalNote: item.englishNote,
          prices: {},
          stockStatus: {},
          lastUpdated: new Date().toISOString(),
        };

        await client.query(`DELETE FROM products WHERE id = $1 OR (name = $2 AND category_id = $3)`, [
          item.id,
          item.name,
          item.categoryId,
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
      } catch (err: any) {
        console.error(`Error populating ${item.name} (${item.englishNote}):`, err);
        errorCount++;
      }
    }

    const countRes = await client.query('SELECT COUNT(*) FROM products');
    const totalCount = parseInt(countRes.rows[0].count, 10);

    console.log(`🎉 Master Catalog population finished: ${createdCount} items processed, total products in PostgreSQL: ${totalCount}`);
    return {
      added: createdCount,
      totalProducts: totalCount,
      errors: errorCount,
    };
  } finally {
    client.release();
  }
}

if (require.main === module) {
  populateAllCategoriesMasterCatalog()
    .then((res) => {
      console.log('Result:', JSON.stringify(res, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal population failure:', err);
      process.exit(1);
    });
}
