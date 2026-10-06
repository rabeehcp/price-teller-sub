import fs from 'fs';
import path from 'path';
import { pool, setPostgresConnected } from '../db/pool';
import { getImageKitClient } from '../utils/imagekit';

interface SnackItemDef {
  id: string;
  name: string;
  categoryId: string;
  emoji: string;
  badge: string;
  defaultUnit: string;
  availableUnits: string[];
  unitMultiplier: Record<string, number>;
  nutritionalNote: string;
  prices: Record<string, number>;
  stockStatus: Record<string, 'in_stock' | 'low_stock' | 'out_of_stock'>;
  imageFileName: string;
  imageSource: { type: 'local'; filePath: string } | { type: 'remote'; url: string };
}

const KERALA_EVENING_SNACKS: SnackItemDef[] = [
  {
    id: 'snack-pazhampori',
    name: 'പഴംപൊരി / ഏത്തക്കപ്പം (Pazhampori / Banana Fritters)',
    categoryId: 'snacks',
    emoji: '🍌',
    badge: 'നാടൻ സ്പെഷ്യൽ',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack (5 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack (5 pcs)': 5 },
    nutritionalNote: 'Crispy golden ripe Nendran plantain fritters fried in cardamom infused batter',
    prices: { 'Al-Iqwan': 12, 'Bismi Mart': 12, 'cpstore': 12, 'rp mart': 12, 'Swargham Hot&Coolbar': 10, 'kunjan super market': 12 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-pazhampori.jpg',
    imageSource: { type: 'remote', url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9f/Banana_Fritters_and_tea.jpg/960px-Banana_Fritters_and_tea.jpg' }
  },
  {
    id: 'snack-veg-samosa',
    name: 'വെജ് സമോസ (Crispy Vegetable Samosa)',
    categoryId: 'snacks',
    emoji: '🥟',
    badge: 'ഹോട്ട് & ക്രിസ്പി',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack (5 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack (5 pcs)': 5 },
    nutritionalNote: 'Crispy triangular pastry stuffed with spicy mashed potato, green peas and cumin herbs',
    prices: { 'Al-Iqwan': 12, 'Bismi Mart': 12, 'cpstore': 12, 'rp mart': 12, 'Swargham Hot&Coolbar': 10, 'kunjan super market': 12 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-veg-samosa.jpg',
    imageSource: { type: 'remote', url: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Samosa_4.jpg' }
  },
  {
    id: 'snack-chicken-samosa',
    name: 'ചിക്കൻ സമോസ (Malabar Chicken Samosa)',
    categoryId: 'snacks',
    emoji: '🥟',
    badge: 'മലബാർ സ്പെഷ്യൽ',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack (5 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack (5 pcs)': 5 },
    nutritionalNote: 'Authentic Malabar tea stall samosa stuffed with aromatic spicy minced chicken masala',
    prices: { 'Al-Iqwan': 18, 'Bismi Mart': 18, 'cpstore': 18, 'rp mart': 18, 'Swargham Hot&Coolbar': 16, 'kunjan super market': 18 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-chicken-samosa.jpg',
    imageSource: { type: 'remote', url: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Chicken_samosa.jpg' }
  },
  {
    id: 'snack-meat-samosa',
    name: 'ബീഫ് സമോസ (Spicy Beef Samosa)',
    categoryId: 'snacks',
    emoji: '🥟',
    badge: 'തട്ടുകട സ്പെഷ്യൽ',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack (5 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack (5 pcs)': 5 },
    nutritionalNote: 'Crispy thin crust tea stall samosa packed with spicy roasted beef & onion masala',
    prices: { 'Al-Iqwan': 20, 'Bismi Mart': 20, 'cpstore': 20, 'rp mart': 20, 'Swargham Hot&Coolbar': 18, 'kunjan super market': 20 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-meat-samosa.jpg',
    imageSource: { type: 'local', filePath: '/home/student11/.gemini/antigravity-ide/brain/9599f221-1da8-4507-9252-b16e1d47f747/meat_samosa_kerala_1791251446509.jpg' }
  },
  {
    id: 'snack-parippuvada',
    name: 'പരിപ്പുവട (Kerala Parippu Vada / Dal Vada)',
    categoryId: 'snacks',
    emoji: '🫓',
    badge: 'ചായക്കട ഫേവറിറ്റ്',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack (5 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack (5 pcs)': 5 },
    nutritionalNote: 'Crunchy tea-time fritter made of coarsely crushed chana dal, shallots, curry leaves & green chilies',
    prices: { 'Al-Iqwan': 10, 'Bismi Mart': 10, 'cpstore': 10, 'rp mart': 10, 'Swargham Hot&Coolbar': 10, 'kunjan super market': 10 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-parippuvada.jpg',
    imageSource: { type: 'remote', url: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Parippuvada_2011.jpg' }
  },
  {
    id: 'snack-uzhunnuvada',
    name: 'ഉഴുന്നുവട (Uzhunnu Vada / Medu Vada)',
    categoryId: 'snacks',
    emoji: '🍩',
    badge: 'ക്രിസ്പി & സോഫ്റ്റ്',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack (4 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack (4 pcs)': 4 },
    nutritionalNote: 'Crispy on the outside, fluffy cloud-soft inside black gram savoury doughnut vada',
    prices: { 'Al-Iqwan': 12, 'Bismi Mart': 12, 'cpstore': 12, 'rp mart': 12, 'Swargham Hot&Coolbar': 10, 'kunjan super market': 12 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-uzhunnuvada.jpg',
    imageSource: { type: 'remote', url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Medu_Vada.JPG/960px-Medu_Vada.JPG' }
  },
  {
    id: 'snack-sukhiyan',
    name: 'സുഖിയൻ (Kerala Sukhiyan / Sugiyan)',
    categoryId: 'snacks',
    emoji: '🧆',
    badge: 'മധുര പലഹാരം',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack (5 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack (5 pcs)': 5 },
    nutritionalNote: 'Traditional sweet snack of boiled green gram & fresh coconut tossed in melted jaggery',
    prices: { 'Al-Iqwan': 12, 'Bismi Mart': 12, 'cpstore': 12, 'rp mart': 12, 'Swargham Hot&Coolbar': 10, 'kunjan super market': 12 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-sukhiyan.jpg',
    imageSource: { type: 'remote', url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Sughiyan.jpg/960px-Sughiyan.jpg' }
  },
  {
    id: 'snack-unniyappam',
    name: 'ഉണ്ണിയപ്പം (Traditional Kerala Unniyappam)',
    categoryId: 'snacks',
    emoji: '🧆',
    badge: 'തനത് കേരളം',
    defaultUnit: 'Pack of 4',
    availableUnits: ['1 pc', 'Pack of 4', 'Pack of 10'],
    unitMultiplier: { '1 pc': 0.25, 'Pack of 4': 1, 'Pack of 10': 2.5 },
    nutritionalNote: 'Soft, caramelized sweet fritters made with roasted rice flour, jaggery, ripe banana & ghee roasted coconut bits',
    prices: { 'Al-Iqwan': 30, 'Bismi Mart': 30, 'cpstore': 28, 'rp mart': 30, 'Swargham Hot&Coolbar': 25, 'kunjan super market': 30 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-unniyappam.jpg',
    imageSource: { type: 'remote', url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4e/Unniyappam_-_Karayappam_-_Kuzhiyappam.jpg/960px-Unniyappam_-_Karayappam_-_Kuzhiyappam.jpg' }
  },
  {
    id: 'snack-neyyappam',
    name: 'നെയ്യപ്പം (Kerala Neyyappam)',
    categoryId: 'snacks',
    emoji: '🫓',
    badge: 'നെയ്യ് മണം',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack of 4'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack of 4': 4 },
    nutritionalNote: 'Classic crispy-edged aromatic Kerala rice & jaggery cake fried in pure golden ghee',
    prices: { 'Al-Iqwan': 15, 'Bismi Mart': 15, 'cpstore': 15, 'rp mart': 15, 'Swargham Hot&Coolbar': 14, 'kunjan super market': 15 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-neyyappam.jpg',
    imageSource: { type: 'remote', url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c0/Kerala_Neyyappam.jpg/960px-Kerala_Neyyappam.jpg' }
  },
  {
    id: 'snack-ela-ada',
    name: 'ഇലയട (Traditional Ela Ada / Steamed Leaf Pocket)',
    categoryId: 'snacks',
    emoji: '🍃',
    badge: 'ആവിയിൽ വേവിച്ചത്',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack (4 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack (4 pcs)': 4 },
    nutritionalNote: 'Fragrant steamed rice pocket filled with sweet grated coconut & melted jaggery wrapped in banana leaf',
    prices: { 'Al-Iqwan': 15, 'Bismi Mart': 15, 'cpstore': 15, 'rp mart': 15, 'Swargham Hot&Coolbar': 12, 'kunjan super market': 15 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-ela-ada.jpg',
    imageSource: { type: 'remote', url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Ada_or_Ela_Ada.jpg/960px-Ada_or_Ela_Ada.jpg' }
  },
  {
    id: 'snack-kozhukkatta',
    name: 'കൊഴുക്കട്ട (Sweet Kozhukkatta / Steamed Rice Dumplings)',
    categoryId: 'snacks',
    emoji: '🥟',
    badge: 'തനത് പലഹാരം',
    defaultUnit: 'Pack of 2',
    availableUnits: ['Pack of 2', 'Pack of 4'],
    unitMultiplier: { 'Pack of 2': 1, 'Pack of 4': 2 },
    nutritionalNote: 'Steamed soft rice dumplings filled with sweet coconut, cardamom and melted jaggery',
    prices: { 'Al-Iqwan': 20, 'Bismi Mart': 20, 'cpstore': 20, 'rp mart': 20, 'Swargham Hot&Coolbar': 18, 'kunjan super market': 20 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-kozhukkatta.jpg',
    imageSource: { type: 'remote', url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Kozhukkatta-shraddha.jpg/960px-Kozhukkatta-shraddha.jpg' }
  },
  {
    id: 'snack-ullivada',
    name: 'ഉള്ളിവട (Crispy Kerala Ullivada / Onion Pakoda)',
    categoryId: 'snacks',
    emoji: '🧅',
    badge: 'തട്ടുകട ക്രിസ്പി',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack (5 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack (5 pcs)': 5 },
    nutritionalNote: 'Crunchy Kerala tea stall fritters packed with thinly sliced shallots, curry leaves and spices',
    prices: { 'Al-Iqwan': 12, 'Bismi Mart': 12, 'cpstore': 12, 'rp mart': 12, 'Swargham Hot&Coolbar': 10, 'kunjan super market': 12 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-ullivada.jpg',
    imageSource: { type: 'remote', url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Onion_pakora_-_a.jpg/960px-Onion_pakora_-_a.jpg' }
  },
  {
    id: 'snack-potato-bonda',
    name: 'ഉരുളക്കിഴങ്ങ് ബോണ്ട (Potato Masala Bonda)',
    categoryId: 'snacks',
    emoji: '🥔',
    badge: 'ഹോട്ട് & സ്പൈസി',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack (5 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack (5 pcs)': 5 },
    nutritionalNote: 'Golden round gram batter fritter stuffed with spiced mashed potato, mustard seeds and ginger',
    prices: { 'Al-Iqwan': 12, 'Bismi Mart': 12, 'cpstore': 12, 'rp mart': 12, 'Swargham Hot&Coolbar': 10, 'kunjan super market': 12 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-potato-bonda.jpg',
    imageSource: { type: 'remote', url: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Aloo_Bonda.jpg' }
  },
  {
    id: 'snack-mysore-bonda',
    name: 'മൈസൂർ ബോണ്ട (Soft Fluffy Mysore Bonda)',
    categoryId: 'snacks',
    emoji: '🧆',
    badge: 'സോഫ്റ്റ് & ക്രിസ്പി',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack (5 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack (5 pcs)': 5 },
    nutritionalNote: 'Crispy golden outside, pillowy soft fluffy inside tea-time bonda served with fresh coconut chutney',
    prices: { 'Al-Iqwan': 10, 'Bismi Mart': 10, 'cpstore': 10, 'rp mart': 10, 'Swargham Hot&Coolbar': 10, 'kunjan super market': 10 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-mysore-bonda.jpg',
    imageSource: { type: 'local', filePath: '/home/student11/.gemini/antigravity-ide/brain/9599f221-1da8-4507-9252-b16e1d47f747/mysore_bonda_kerala_1791251629988.jpg' }
  },
  {
    id: 'snack-egg-bajji',
    name: 'മുട്ട ബജ്ജി (Kerala Tea Stall Egg Bajji)',
    categoryId: 'snacks',
    emoji: '🥚',
    badge: 'ചായക്കട സ്പെഷ്യൽ',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack (4 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack (4 pcs)': 4 },
    nutritionalNote: 'Halved hard-boiled egg coated in spiced gram flour batter and deep fried until golden crispy',
    prices: { 'Al-Iqwan': 15, 'Bismi Mart': 15, 'cpstore': 15, 'rp mart': 15, 'Swargham Hot&Coolbar': 14, 'kunjan super market': 15 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-egg-bajji.jpg',
    imageSource: { type: 'remote', url: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Egg_Bonda.jpg' }
  },
  {
    id: 'snack-mulaku-bajji',
    name: 'മുളക് ബജ്ജി (Kerala Chilli Bajji)',
    categoryId: 'snacks',
    emoji: '🌶️',
    badge: 'എരിവും രുചിയും',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack (5 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack (5 pcs)': 5 },
    nutritionalNote: 'Crispy tea stall snack made with long green bajji peppers dipped in seasoned chickpea batter',
    prices: { 'Al-Iqwan': 12, 'Bismi Mart': 12, 'cpstore': 12, 'rp mart': 12, 'Swargham Hot&Coolbar': 10, 'kunjan super market': 12 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-mulaku-bajji.jpg',
    imageSource: { type: 'remote', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Mirchi_bada.jpg' }
  },
  {
    id: 'snack-chicken-cutlet',
    name: 'ചിക്കൻ കട്ട്ലറ്റ് (Kerala Bakery Chicken Cutlet)',
    categoryId: 'snacks',
    emoji: '🍗',
    badge: 'ബേക്കറി ഫേവറിറ്റ്',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack (5 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack (5 pcs)': 5 },
    nutritionalNote: 'Spiced minced chicken and potatoes crumbed and crisp fried with curry leaves and black pepper',
    prices: { 'Al-Iqwan': 20, 'Bismi Mart': 20, 'cpstore': 20, 'rp mart': 20, 'Swargham Hot&Coolbar': 18, 'kunjan super market': 20 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-chicken-cutlet.jpg',
    imageSource: { type: 'remote', url: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Cutlets.jpg' }
  },
  {
    id: 'snack-veg-cutlet',
    name: 'വെജ് കട്ട്ലറ്റ് (Crispy Vegetable Cutlet)',
    categoryId: 'snacks',
    emoji: '🥕',
    badge: '100% വെജിറ്റേറിയൻ',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack (5 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack (5 pcs)': 5 },
    nutritionalNote: 'Golden crumbed cutlet made with beetroot, potato, carrot, green peas and aromatic Kerala spices',
    prices: { 'Al-Iqwan': 15, 'Bismi Mart': 15, 'cpstore': 15, 'rp mart': 15, 'Swargham Hot&Coolbar': 14, 'kunjan super market': 15 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-veg-cutlet.jpg',
    imageSource: { type: 'remote', url: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Vegetable_Cutlet.jpg' }
  },
  {
    id: 'snack-beef-cutlet',
    name: 'ബീഫ് കട്ട്ലറ്റ് (Malabar Spicy Beef Cutlet)',
    categoryId: 'snacks',
    emoji: '🥩',
    badge: 'മലബാർ തനിമ',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack (5 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack (5 pcs)': 5 },
    nutritionalNote: 'Rich and spicy Kerala minced beef cutlet blended with onions, green chillies and roasted spices',
    prices: { 'Al-Iqwan': 22, 'Bismi Mart': 22, 'cpstore': 22, 'rp mart': 22, 'Swargham Hot&Coolbar': 20, 'kunjan super market': 22 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-beef-cutlet.jpg',
    imageSource: { type: 'local', filePath: '/home/student11/.gemini/antigravity-ide/brain/9599f221-1da8-4507-9252-b16e1d47f747/beef_cutlet_kerala_1791251424781.jpg' }
  },
  {
    id: 'snack-fish-cutlet',
    name: 'ഫിഷ് കട്ട്ലറ്റ് (Kerala Fish Cutlet)',
    categoryId: 'snacks',
    emoji: '🐟',
    badge: 'ഫ്രഷ് സീഫുഡ്',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack (5 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack (5 pcs)': 5 },
    nutritionalNote: 'Flaked fish mixed with pepper mashed potatoes, breadcrumbed and fried golden crisp',
    prices: { 'Al-Iqwan': 20, 'Bismi Mart': 20, 'cpstore': 20, 'rp mart': 20, 'Swargham Hot&Coolbar': 18, 'kunjan super market': 20 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-fish-cutlet.jpg',
    imageSource: { type: 'local', filePath: '/home/student11/.gemini/antigravity-ide/brain/9599f221-1da8-4507-9252-b16e1d47f747/fish_cutlet_kerala_1791251494571.jpg' }
  },
  {
    id: 'snack-egg-puffs',
    name: 'മുട്ട പഫ്സ് (Bakery Egg Puffs / Mutta Puffs)',
    categoryId: 'snacks',
    emoji: '🥐',
    badge: 'ബേക്കറി ക്ലാസിക്',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Pack of 2', 'Pack of 4'],
    unitMultiplier: { '1 pc': 1, 'Pack of 2': 2, 'Pack of 4': 4 },
    nutritionalNote: 'Multi-layered golden puff pastry filled with caramelized onion egg masala and boiled egg',
    prices: { 'Al-Iqwan': 20, 'Bismi Mart': 20, 'cpstore': 20, 'rp mart': 20, 'Swargham Hot&Coolbar': 18, 'kunjan super market': 20 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-egg-puffs.jpg',
    imageSource: { type: 'remote', url: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Egg_puff.jpg' }
  },
  {
    id: 'snack-chicken-puffs',
    name: 'ചിക്കൻ പഫ്സ് (Golden Bakery Chicken Puffs)',
    categoryId: 'snacks',
    emoji: '🥐',
    badge: 'സൂപ്പർ ക്രിസ്പി',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Pack of 2', 'Pack of 4'],
    unitMultiplier: { '1 pc': 1, 'Pack of 2': 2, 'Pack of 4': 4 },
    nutritionalNote: 'Flaky baked golden pastry filled with juicy shredded spicy Kerala chicken masala',
    prices: { 'Al-Iqwan': 25, 'Bismi Mart': 25, 'cpstore': 25, 'rp mart': 25, 'Swargham Hot&Coolbar': 22, 'kunjan super market': 25 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-chicken-puffs.jpg',
    imageSource: { type: 'local', filePath: '/home/student11/.gemini/antigravity-ide/brain/9599f221-1da8-4507-9252-b16e1d47f747/chicken_puffs_kerala_1791251469943.jpg' }
  },
  {
    id: 'snack-veg-puffs',
    name: 'വെജ് പഫ്സ് (Vegetable Masala Puffs)',
    categoryId: 'snacks',
    emoji: '🥐',
    badge: '100% വെജിറ്റേറിയൻ',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Pack of 2', 'Pack of 4'],
    unitMultiplier: { '1 pc': 1, 'Pack of 2': 2, 'Pack of 4': 4 },
    nutritionalNote: 'Crispy layered puff pastry loaded with spiced mixed vegetable masala filling',
    prices: { 'Al-Iqwan': 18, 'Bismi Mart': 18, 'cpstore': 18, 'rp mart': 18, 'Swargham Hot&Coolbar': 16, 'kunjan super market': 18 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-veg-puffs.jpg',
    imageSource: { type: 'local', filePath: '/home/student11/.gemini/antigravity-ide/brain/9599f221-1da8-4507-9252-b16e1d47f747/veg_puffs_kerala_1791251604129.jpg' }
  },
  {
    id: 'snack-beef-puffs',
    name: 'ബീഫ് പഫ്സ് (Kerala Meat Puffs / Beef Puffs)',
    categoryId: 'snacks',
    emoji: '🥐',
    badge: 'മലബാർ സ്പെഷ്യൽ',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Pack of 2', 'Pack of 4'],
    unitMultiplier: { '1 pc': 1, 'Pack of 2': 2, 'Pack of 4': 4 },
    nutritionalNote: 'Flaky puff pastry stuffed with spicy slow-roasted Kerala minced beef filling',
    prices: { 'Al-Iqwan': 25, 'Bismi Mart': 25, 'cpstore': 25, 'rp mart': 25, 'Swargham Hot&Coolbar': 22, 'kunjan super market': 25 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-beef-puffs.jpg',
    imageSource: { type: 'remote', url: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Curry_puffs.JPG' }
  },
  {
    id: 'snack-pazham-nirachathu',
    name: 'പഴം നിറച്ചത് (Malabar Stuffed Plantain / Pazham Nirachathu)',
    categoryId: 'snacks',
    emoji: '🍌',
    badge: 'റോയൽ മലബാർ',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Pack of 2'],
    unitMultiplier: { '1 pc': 1, 'Pack of 2': 2 },
    nutritionalNote: 'Whole ripe Nendran banana stuffed with scrambled egg, sweet coconut, cashews & raisins fried in pure ghee',
    prices: { 'Al-Iqwan': 25, 'Bismi Mart': 25, 'cpstore': 25, 'rp mart': 25, 'Swargham Hot&Coolbar': 22, 'kunjan super market': 25 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-pazham-nirachathu.jpg',
    imageSource: { type: 'local', filePath: '/home/student11/.gemini/antigravity-ide/brain/9599f221-1da8-4507-9252-b16e1d47f747/pazham_nirachathu_1791251360599.jpg' }
  },
  {
    id: 'snack-unnakaya',
    name: 'ഉന്നക്കായ (Malabar Unnakaya / Plantain Delicacy)',
    categoryId: 'snacks',
    emoji: '🍌',
    badge: 'മലബാർ പാരമ്പര്യം',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack (5 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack (5 pcs)': 5 },
    nutritionalNote: 'Spindle-shaped steamed banana rolls filled with sweetened coconut, eggs, nuts and cardamom, golden fried',
    prices: { 'Al-Iqwan': 20, 'Bismi Mart': 20, 'cpstore': 20, 'rp mart': 20, 'Swargham Hot&Coolbar': 18, 'kunjan super market': 20 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-unnakaya.jpg',
    imageSource: { type: 'remote', url: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Unnakai_%28%E0%B4%89%E0%B4%A8%E0%B5%8D%E0%B4%A8%E0%B4%95%E0%B5%8D%E0%B4%95%E0%B4%BE%E0%B4%AF%E0%B5%8D%E2%80%8C%29.jpg' }
  },
  {
    id: 'snack-kozhi-kaal',
    name: 'കോഴിക്കാൽ (Kozhi Kaal / Tapioca Fries)',
    categoryId: 'snacks',
    emoji: '🍟',
    badge: 'തട്ടുകട സൂപ്പർഹിറ്റ്',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack (5 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack (5 pcs)': 5 },
    nutritionalNote: 'Crispy spiced tapioca strips shaped and deep fried with spicy chilli batter and curry leaves',
    prices: { 'Al-Iqwan': 15, 'Bismi Mart': 15, 'cpstore': 15, 'rp mart': 15, 'Swargham Hot&Coolbar': 12, 'kunjan super market': 15 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-kozhi-kaal.jpg',
    imageSource: { type: 'local', filePath: '/home/student11/.gemini/antigravity-ide/brain/9599f221-1da8-4507-9252-b16e1d47f747/kozhi_kaal_snack_1791251384227.jpg' }
  },
  {
    id: 'snack-chicken-roll',
    name: 'ചിക്കൻ റോൾ (Kerala Bakery Chicken Roll)',
    categoryId: 'snacks',
    emoji: '🌯',
    badge: 'ഹോട്ട് റോൾ',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Pack of 2'],
    unitMultiplier: { '1 pc': 1, 'Pack of 2': 2 },
    nutritionalNote: 'Crumbed crisp fried cylindrical roll packed with savory minced chicken masala',
    prices: { 'Al-Iqwan': 25, 'Bismi Mart': 25, 'cpstore': 25, 'rp mart': 25, 'Swargham Hot&Coolbar': 22, 'kunjan super market': 25 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-chicken-roll.jpg',
    imageSource: { type: 'local', filePath: '/home/student11/.gemini/antigravity-ide/brain/9599f221-1da8-4507-9252-b16e1d47f747/chicken_roll_snack_1791251402141.jpg' }
  },
  {
    id: 'snack-bread-pakoda',
    name: 'ബ്രെഡ് പക്കോഡ (Stuffed Bread Pakoda)',
    categoryId: 'snacks',
    emoji: '🥪',
    badge: 'ടീ ടൈം സ്നാക്ക്',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2 },
    nutritionalNote: 'Triangular bread stuffed with seasoned potato masala, dipped in gram flour and fried golden',
    prices: { 'Al-Iqwan': 15, 'Bismi Mart': 15, 'cpstore': 15, 'rp mart': 15, 'Swargham Hot&Coolbar': 12, 'kunjan super market': 15 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-bread-pakoda.jpg',
    imageSource: { type: 'remote', url: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Bread_pakoda.jpg' }
  },
  {
    id: 'snack-madakku',
    name: 'മടക്ക് / മടക്കപ്പം (Madakku Sanja / Sweet Crispy Pastry)',
    categoryId: 'snacks',
    emoji: '🧇',
    badge: 'ബേക്കറി മധുരം',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack (5 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack (5 pcs)': 5 },
    nutritionalNote: 'Traditional multi-layered crispy folded pastry glistening with crystallized sugar coating',
    prices: { 'Al-Iqwan': 15, 'Bismi Mart': 15, 'cpstore': 15, 'rp mart': 15, 'Swargham Hot&Coolbar': 12, 'kunjan super market': 15 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-madakku.jpg',
    imageSource: { type: 'local', filePath: '/home/student11/.gemini/antigravity-ide/brain/9599f221-1da8-4507-9252-b16e1d47f747/kerala_madakku_snack_1791251531699.jpg' }
  },
  {
    id: 'snack-kaipola',
    name: 'കായ്പോള (Malabar Kaipola / Plantain Egg Cake)',
    categoryId: 'snacks',
    emoji: '🍰',
    badge: 'മലബാർ കേക്ക്',
    defaultUnit: '1 Slice',
    availableUnits: ['1 Slice', '2 Slices', 'Whole Cake'],
    unitMultiplier: { '1 Slice': 1, '2 Slices': 2, 'Whole Cake': 6 },
    nutritionalNote: 'Authentic Malabar slow-cooked banana egg cake with cardamom, crunchy cashews and raisins',
    prices: { 'Al-Iqwan': 20, 'Bismi Mart': 20, 'cpstore': 20, 'rp mart': 20, 'Swargham Hot&Coolbar': 18, 'kunjan super market': 20 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-kaipola.jpg',
    imageSource: { type: 'local', filePath: '/home/student11/.gemini/antigravity-ide/brain/9599f221-1da8-4507-9252-b16e1d47f747/malabar_kaipola_1791251554650.jpg' }
  },
  {
    id: 'snack-aval-nanachathu',
    name: 'അവൽ നനച്ചത് (Kerala Aval Nanachathu with Coconut & Jaggery)',
    categoryId: 'snacks',
    emoji: '🥣',
    badge: 'നാടൻ ഹെൽത്തി',
    defaultUnit: '1 Bowl (150 g)',
    availableUnits: ['1 Bowl (150 g)', 'Double Bowl (300 g)'],
    unitMultiplier: { '1 Bowl (150 g)': 1, 'Double Bowl (300 g)': 2 },
    nutritionalNote: 'Flattened rice poha softened with freshly scraped coconut, dark jaggery, cardamom and sliced banana',
    prices: { 'Al-Iqwan': 25, 'Bismi Mart': 25, 'cpstore': 25, 'rp mart': 25, 'Swargham Hot&Coolbar': 20, 'kunjan super market': 25 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-aval-nanachathu.jpg',
    imageSource: { type: 'local', filePath: '/home/student11/.gemini/antigravity-ide/brain/9599f221-1da8-4507-9252-b16e1d47f747/aval_nanachathu_snack_1791251578593.jpg' }
  },
  {
    id: 'snack-achappam',
    name: 'അച്ചപ്പം (Kerala Sweet Achappam / Rose Cookies)',
    categoryId: 'snacks',
    emoji: '🌸',
    badge: 'ക്രിസ്പി റോസ്',
    defaultUnit: 'Pack of 10',
    availableUnits: ['Pack of 10', 'Pack of 20'],
    unitMultiplier: { 'Pack of 10': 1, 'Pack of 20': 2 },
    nutritionalNote: 'Delicate flower-patterned crispy rose cookies made with rice flour, coconut milk and sesame seeds',
    prices: { 'Al-Iqwan': 45, 'Bismi Mart': 45, 'cpstore': 42, 'rp mart': 45, 'Swargham Hot&Coolbar': 40, 'kunjan super market': 45 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-achappam.jpg',
    imageSource: { type: 'remote', url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/Achappam.jpg/960px-Achappam.jpg' }
  },
  {
    id: 'snack-kuzhalappam',
    name: 'കുഴലപ്പം (Traditional Kerala Kuzhalappam)',
    categoryId: 'snacks',
    emoji: '🎺',
    badge: 'മൊരിഞ്ഞ കുഴലപ്പം',
    defaultUnit: '200 g Pack',
    availableUnits: ['200 g Pack', '500 g Pack'],
    unitMultiplier: { '200 g Pack': 1, '500 g Pack': 2.5 },
    nutritionalNote: 'Crunchy tube-shaped roasted rice flour snack spiced with cumin, shallots and sesame',
    prices: { 'Al-Iqwan': 45, 'Bismi Mart': 45, 'cpstore': 45, 'rp mart': 45, 'Swargham Hot&Coolbar': 40, 'kunjan super market': 45 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-kuzhalappam.jpg',
    imageSource: { type: 'remote', url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/%E0%B4%95%E0%B5%81%E0%B4%B4%E0%B4%B2%E0%B4%AA%E0%B5%8D%E0%B4%AA%E0%B4%82.jpg/960px-%E0%B4%95%E0%B5%81%E0%B4%B4%E0%B4%B2%E0%B4%AA%E0%B5%8D%E0%B4%AA%E0%B4%82.jpg' }
  },
  {
    id: 'snack-murukku',
    name: 'കൈ മുറുക്ക് (Kerala Kai Murukku)',
    categoryId: 'snacks',
    emoji: '🌀',
    badge: 'സൂപ്പർ ക്രഞ്ച്',
    defaultUnit: '200 g Pack',
    availableUnits: ['200 g Pack', '500 g Pack'],
    unitMultiplier: { '200 g Pack': 1, '500 g Pack': 2.5 },
    nutritionalNote: 'Hand-twisted spiral crunchy murukku seasoned with carom seeds and roasted cumin',
    prices: { 'Al-Iqwan': 45, 'Bismi Mart': 45, 'cpstore': 45, 'rp mart': 45, 'Swargham Hot&Coolbar': 40, 'kunjan super market': 45 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-murukku.jpg',
    imageSource: { type: 'remote', url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/A_Traditional_Tamil_Snack_Murukku.jpg/960px-A_Traditional_Tamil_Snack_Murukku.jpg' }
  },
  {
    id: 'snack-banana-chips',
    name: 'നേന്ത്രക്കായ ചിപ്സ് (Kerala Banana Chips in Coconut Oil)',
    categoryId: 'snacks',
    emoji: '🍌',
    badge: 'വെളിച്ചെണ്ണയിൽ വറുത്തത്',
    defaultUnit: '250 g Pack',
    availableUnits: ['250 g Pack', '500 g Pack', '1 kg'],
    unitMultiplier: { '250 g Pack': 1, '500 g Pack': 2, '1 kg': 4 },
    nutritionalNote: 'Thin crisp Nendran plantain chips fried to golden perfection in 100% pure Kerala coconut oil',
    prices: { 'Al-Iqwan': 95, 'Bismi Mart': 95, 'cpstore': 90, 'rp mart': 95, 'Swargham Hot&Coolbar': 85, 'kunjan super market': 95 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-banana-chips.jpg',
    imageSource: { type: 'remote', url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Banana_chips.jpg' }
  },
  {
    id: 'snack-sharkara-varatti',
    name: 'ശർക്കര വരട്ടി (Sharkara Varatti / Sarkara Upperi)',
    categoryId: 'snacks',
    emoji: '🍯',
    badge: 'ഓണത്തനിമ',
    defaultUnit: '250 g Pack',
    availableUnits: ['250 g Pack', '500 g Pack', '1 kg'],
    unitMultiplier: { '250 g Pack': 1, '500 g Pack': 2, '1 kg': 4 },
    nutritionalNote: 'Thick fried plantain chunks coated in rich jaggery syrup, dried ginger (chukku) and powdered cumin',
    prices: { 'Al-Iqwan': 105, 'Bismi Mart': 105, 'cpstore': 100, 'rp mart': 105, 'Swargham Hot&Coolbar': 95, 'kunjan super market': 105 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-sharkara-varatti.jpg',
    imageSource: { type: 'remote', url: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Sarkaraviratti4.jpg' }
  },
  {
    id: 'snack-ribbon-pakkavada',
    name: 'റിബൺ പക്കവട (Ribbon Pakkavada)',
    categoryId: 'snacks',
    emoji: '🎀',
    badge: 'എരിവുള്ള പക്കവട',
    defaultUnit: '200 g Pack',
    availableUnits: ['200 g Pack', '500 g Pack'],
    unitMultiplier: { '200 g Pack': 1, '500 g Pack': 2.5 },
    nutritionalNote: 'Spicy crispy ribbon-shaped tea-time crunch flavored with crushed garlic and red chilli',
    prices: { 'Al-Iqwan': 45, 'Bismi Mart': 45, 'cpstore': 45, 'rp mart': 45, 'Swargham Hot&Coolbar': 40, 'kunjan super market': 45 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-ribbon-pakkavada.jpg',
    imageSource: { type: 'remote', url: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Pakkavada.jpg' }
  },
  {
    id: 'snack-kerala-mixture',
    name: 'കേരള ഹോട്ട് മിക്സ്ചർ (Kerala Tea Stall Hot Mixture)',
    categoryId: 'snacks',
    emoji: '🥜',
    badge: 'തട്ടുകട മിക്സ്ചർ',
    defaultUnit: '200 g Pack',
    availableUnits: ['200 g Pack', '500 g Pack', '1 kg'],
    unitMultiplier: { '200 g Pack': 1, '500 g Pack': 2.5, '1 kg': 5 },
    nutritionalNote: 'Spicy crunchy tea stall mixture with fried sev, peanuts, roasted dal, curry leaves and garlic',
    prices: { 'Al-Iqwan': 45, 'Bismi Mart': 45, 'cpstore': 45, 'rp mart': 45, 'Swargham Hot&Coolbar': 40, 'kunjan super market': 45 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-hot-mixture.jpg',
    imageSource: { type: 'local', filePath: '/home/student11/.gemini/antigravity-ide/brain/9599f221-1da8-4507-9252-b16e1d47f747/kerala_hot_mixture_1791251656593.jpg' }
  },
  {
    id: 'snack-chattipathiri',
    name: 'ചട്ടിപ്പത്തിരി (Malabar Sweet Layered Chatti Pathiri)',
    categoryId: 'snacks',
    emoji: '🥞',
    badge: 'മലബാർ ഡെലിക്കസി',
    defaultUnit: '1 Piece',
    availableUnits: ['1 Piece', '2 Pieces', 'Whole Pathiri'],
    unitMultiplier: { '1 Piece': 1, '2 Pieces': 2, 'Whole Pathiri': 5 },
    nutritionalNote: 'Multi-layered Malabar pastry cake with sweetened egg, poppy seeds, cashew and cardamom filling',
    prices: { 'Al-Iqwan': 35, 'Bismi Mart': 35, 'cpstore': 35, 'rp mart': 35, 'Swargham Hot&Coolbar': 30, 'kunjan super market': 35 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-chattipathiri.jpg',
    imageSource: { type: 'remote', url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/Chattippathiri_snack_of_north_malabar_kerala.jpeg/960px-Chattippathiri_snack_of_north_malabar_kerala.jpeg' }
  },
  {
    id: 'snack-kinnathappam',
    name: 'കിണ്ണത്തപ്പം (Traditional Steamed Kinnathappam)',
    categoryId: 'snacks',
    emoji: '🍮',
    badge: 'സോഫ്റ്റ് മധുരം',
    defaultUnit: '1 Piece (200 g)',
    availableUnits: ['1 Piece (200 g)', 'Full Plate (500 g)'],
    unitMultiplier: { '1 Piece (200 g)': 1, 'Full Plate (500 g)': 2.5 },
    nutritionalNote: 'Delicate steamed sweet pudding cake made with rice flour, rich coconut milk, cumin and jaggery',
    prices: { 'Al-Iqwan': 35, 'Bismi Mart': 35, 'cpstore': 35, 'rp mart': 35, 'Swargham Hot&Coolbar': 30, 'kunjan super market': 35 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-kinnathappam.jpg',
    imageSource: { type: 'remote', url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6b/%E0%B4%95%E0%B4%BF%E0%B4%A3%E0%B5%8D%E0%B4%A3%E0%B4%A4%E0%B5%8D%E0%B4%A4%E0%B4%AA%E0%B5%8D%E0%B4%AA%E0%B4%82.JPG/960px-%E0%B4%95%E0%B4%BF%E0%B4%A3%E0%B5%8D%E0%B4%A3%E0%B4%A4%E0%B5%8D%E0%B4%A4%E0%B4%AA%E0%B5%8D%E0%B4%AA%E0%B4%82.JPG' }
  },
  {
    id: 'snack-masala-vada',
    name: 'മസാല വട / ആമ വട (Masala Vada / Crispy Chana Dal Vada)',
    categoryId: 'snacks',
    emoji: '🫓',
    badge: 'എരിവും മൊരിവും',
    defaultUnit: '1 pc',
    availableUnits: ['1 pc', 'Plate (2 pcs)', 'Pack (5 pcs)'],
    unitMultiplier: { '1 pc': 1, 'Plate (2 pcs)': 2, 'Pack (5 pcs)': 5 },
    nutritionalNote: 'Extra crunchy coarse Bengal gram fritters infused with fennel, dried red chilli and curry leaves',
    prices: { 'Al-Iqwan': 10, 'Bismi Mart': 10, 'cpstore': 10, 'rp mart': 10, 'Swargham Hot&Coolbar': 10, 'kunjan super market': 10 },
    stockStatus: { 'Al-Iqwan': 'in_stock', 'Bismi Mart': 'in_stock', 'cpstore': 'in_stock', 'rp mart': 'in_stock', 'Swargham Hot&Coolbar': 'in_stock', 'kunjan super market': 'in_stock' },
    imageFileName: 'kerala-snack-masala-vada.jpg',
    imageSource: { type: 'remote', url: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Masala_vada.jpg' }
  }
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getBufferForSource(source: SnackItemDef['imageSource']): Promise<Buffer | null> {
  if (source.type === 'local') {
    if (fs.existsSync(source.filePath)) {
      return fs.readFileSync(source.filePath);
    }
    console.warn(`Local file not found: ${source.filePath}`);
    return null;
  } else {
    try {
      const res = await fetch(source.url, {
        headers: {
          'User-Agent': 'PriceTellerKerala/1.0 (https://priceteller.com; contact@priceteller.com)',
        },
      });
      if (!res.ok) {
        console.warn(`Remote fetch failed for ${source.url}: HTTP ${res.status}`);
        return null;
      }
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err: any) {
      console.warn(`Remote fetch error for ${source.url}: ${err.message}`);
      return null;
    }
  }
}

export async function seedKeralaEveningSnacks() {
  console.log(`🍢 Starting Kerala Evening Snacks upload & database seeding for ${KERALA_EVENING_SNACKS.length} authentic items...`);

  const ik = getImageKitClient();
  if (!ik) {
    throw new Error('ImageKit client is not initialized. Please verify IMAGEKIT credentials in .env.');
  }

  const client = await pool.connect();
  setPostgresConnected(true);

  try {
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < KERALA_EVENING_SNACKS.length; i++) {
      const item = KERALA_EVENING_SNACKS[i];
      console.log(`\n[${i + 1}/${KERALA_EVENING_SNACKS.length}] Processing: ${item.name} (${item.id})`);

      try {
        const imageBuffer = await getBufferForSource(item.imageSource);
        let cdnImageUrl = '';

        if (imageBuffer && imageBuffer.length > 0) {
          console.log(`  ⬆️ Uploading ${item.imageFileName} (${imageBuffer.length} bytes) to ImageKit CDN...`);
          const uploadRes = await ik.upload({
            file: imageBuffer,
            fileName: item.imageFileName,
            folder: '/priceteller-catalog/',
            useUniqueFileName: false,
            tags: ['kerala-snacks', 'evening-snacks', 'priceteller-catalog'],
          });
          cdnImageUrl = uploadRes.url;
          console.log(`  ✅ ImageKit URL: ${cdnImageUrl}`);
        } else {
          console.warn(`  ⚠️ Could not acquire image buffer for ${item.id}, proceeding with empty/fallback`);
        }

        // Delete existing if already present to ensure clean fresh data
        await client.query(`DELETE FROM products WHERE id = $1`, [item.id]);

        // Insert into products table
        await client.query(
          `INSERT INTO products (
            id, name, category_id, emoji, image, default_unit, available_units, 
            unit_multiplier, is_organic, is_seasonal, badge, nutritional_note, 
            prices, stock_status, last_updated
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            item.id,
            item.name,
            item.categoryId,
            item.emoji,
            cdnImageUrl,
            item.defaultUnit,
            JSON.stringify(item.availableUnits),
            JSON.stringify(item.unitMultiplier),
            false,
            false,
            item.badge,
            item.nutritionalNote,
            JSON.stringify(item.prices),
            JSON.stringify(item.stockStatus),
            new Date().toISOString(),
          ]
        );

        console.log(`  💾 Saved into PostgreSQL products table with ${Object.keys(item.prices).length} shop prices`);
        successCount++;

        // Friendly sleep to respect network limits
        await sleep(800);
      } catch (itemErr: any) {
        console.error(`  ❌ Failed processing ${item.id}:`, itemErr.message || itemErr);
        failCount++;
      }
    }

    const totalCountRes = await client.query('SELECT COUNT(*) FROM products');
    console.log(`\n🎉 Completed seeding Kerala Evening Snacks!`);
    console.log(`   Successfully added: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    console.log(`   Total products in DB: ${totalCountRes.rows[0].count}`);

    return { successCount, failCount, totalProducts: parseInt(totalCountRes.rows[0].count, 10) };
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedKeralaEveningSnacks()
    .then((res) => {
      console.log('Result:', JSON.stringify(res, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal error during seeding:', err);
      process.exit(1);
    });
}
