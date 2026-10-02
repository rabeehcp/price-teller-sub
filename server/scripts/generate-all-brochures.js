const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/usr/bin/google-chrome';
const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve(__dirname, '../brochure_assets');

const PDF_MERCHANT_PATH = path.resolve(__dirname, '../PeediaCart_Merchant_Brochure.pdf');
const PDF_CONSUMER_PATH = path.resolve(__dirname, '../PeediaCart_Consumer_Brochure.pdf');
const PDF_COMBINED_PATH = path.resolve(__dirname, '../PeediaCart_Official_Brochure.pdf');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getAuthenticatedUsers() {
  // 1. Consumer Auth
  let consumerRes = await fetch('http://localhost:5000/api/auth/consumer/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'brochure.consumer@peediacart.com', password: 'Password123!' }),
  }).then((r) => r.json()).catch(() => ({}));

  if (!consumerRes.success) {
    consumerRes = await fetch('http://localhost:5000/api/auth/consumer/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rahul Nair',
        email: 'brochure.consumer@peediacart.com',
        password: 'Password123!',
        phone: '+91 98470 12345',
      }),
    }).then((r) => r.json()).catch(() => ({}));
  }

  // 2. Merchant Auth
  let merchantRes = await fetch('http://localhost:5000/api/auth/merchant/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'brochure.merchant@peediacart.com', password: 'Password123!' }),
  }).then((r) => r.json()).catch(() => ({}));

  if (!merchantRes.success) {
    merchantRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Kalyan Hypermarket Manager',
        email: 'brochure.merchant@peediacart.com',
        password: 'Password123!',
        shopName: 'Kalyan Hypermarket',
        phone: '+91 98470 99887',
        address: 'Main Town, Areekode',
        shopType: 'supermarket',
      }),
    }).then((r) => r.json()).catch(() => ({}));
  }

  const token = merchantRes.token;

  // Ensure active merchant subscription
  try {
    const checkoutRes = await fetch('http://localhost:5000/api/subscription/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ planId: 'plan-starter-119' }),
    }).then((r) => r.json());

    if (checkoutRes.success && checkoutRes.data) {
      await fetch('http://localhost:5000/api/subscription/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          orderId: checkoutRes.data.orderId,
          paymentId: checkoutRes.data.paymentId,
          upiRefId: 'UTR998877665544',
        }),
      });
    }
  } catch (e) {}

  // Seed 150+ master catalogue items to Kalyan Hypermarket
  try {
    const prodsRes = await fetch('http://localhost:5000/api/products').then((r) => r.json());
    const allProds = prodsRes.data || prodsRes;
    if (Array.isArray(allProds) && allProds.length > 0) {
      const updates = allProds.slice(0, 150).map((p) => {
        const otherPrices = p.prices ? Object.values(p.prices).filter((v) => typeof v === 'number' && v > 0) : [];
        const basePrice = otherPrices.length > 0 ? otherPrices[0] : 45;
        return {
          productId: p.id,
          price: basePrice,
          stockStatus: 'in_stock',
        };
      });
      await fetch('http://localhost:5000/api/merchant/prices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          shopName: 'Kalyan Hypermarket',
          updates,
        }),
      });
    }
  } catch (e) {}

  return {
    consumerUser: consumerRes.user,
    merchantUser: merchantRes.user,
  };
}

async function captureAllScreens() {
  console.log('🚀 Authenticating and launching Chrome to capture all live mobile screens...');
  const { consumerUser, merchantUser } = await getAuthenticatedUsers();

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1200,900',
    ],
  });

  const screenshots = {};

  // -------------------------------------------------------------
  // PART 0: CAPTURE NEW OPENING LANDING SCREEN (MalayalamOpeningPage)
  // -------------------------------------------------------------
  const openingPage = await browser.newPage();
  await openingPage.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await openingPage.evaluateOnNewDocument(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(
      'priceteller_current_location',
      JSON.stringify({ id: 'loc-areekode', name: 'Areekode', district: 'Malappuram' })
    );
  });
  console.log('📸 Capturing Live Opening Screen (MalayalamOpeningPage)...');
  const openingFilePath = path.join(OUTPUT_DIR, 'screen_opening_page.png');
  await openingPage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await sleep(3500);
  await openingPage.screenshot({ path: openingFilePath });
  screenshots['opening_page'] = openingFilePath;

  // -------------------------------------------------------------
  // PART A: CAPTURE ALL MERCHANT TABS (Including Delivery Hub!)
  // -------------------------------------------------------------
  const merchantPage = await browser.newPage();
  await merchantPage.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await merchantPage.evaluateOnNewDocument((user) => {
    if (user) {
      localStorage.setItem('priceteller_auth_user', JSON.stringify(user));
      localStorage.setItem('priceteller_token', user.token);
      sessionStorage.setItem('priceteller_auth_user', JSON.stringify(user));
      sessionStorage.setItem('priceteller_token', user.token);
    }
  }, merchantUser);

  const merchantTabs = [
    'dashboard',
    'inventory',
    'billing',
    'prebookings',
    'delivery',
    'deals',
    'chats',
    'profile',
  ];

  for (const tab of merchantTabs) {
    console.log(`📸 Capturing Merchant Screen: ${tab}...`);
    const filePath = path.join(OUTPUT_DIR, `screen_merchant_${tab}.png`);
    await merchantPage.goto(`${BASE_URL}/merchant?tab=${tab}`, { waitUntil: 'domcontentloaded' });
    await sleep(3500);
    await merchantPage.screenshot({ path: filePath });
    screenshots[`merchant_${tab}`] = filePath;
  }

  // -------------------------------------------------------------
  // PART B: CAPTURE ALL CONSUMER TABS (With Rich Basket & Comparing)
  // -------------------------------------------------------------
  const consumerPage = await browser.newPage();
  await consumerPage.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await consumerPage.evaluateOnNewDocument((user) => {
    if (user) {
      localStorage.setItem('priceteller_auth_user', JSON.stringify(user));
      localStorage.setItem('priceteller_token', user.token);
      sessionStorage.setItem('priceteller_auth_user', JSON.stringify(user));
      sessionStorage.setItem('priceteller_token', user.token);
    }
    localStorage.setItem(
      'priceteller_current_location',
      JSON.stringify({ id: 'loc-areekode', name: 'Areekode', district: 'Malappuram' })
    );
    // Rich basket of staples for comparison duel
    localStorage.setItem(
      'priceteller_basket_items_v2',
      JSON.stringify([
        { productId: 'prod-tomato', quantity: 2, selectedUnit: 'kg' },
        { productId: 'prod-onion', quantity: 3, selectedUnit: 'kg' },
        { productId: 'prod-potato', quantity: 2, selectedUnit: 'kg' },
        { productId: 'prod-milk', quantity: 2, selectedUnit: 'pkt' },
        { productId: 'prod-coconut-oil', quantity: 1, selectedUnit: 'L' },
      ])
    );
  }, consumerUser);

  const consumerTabs = [
    { id: 'home', label: 'Home Discovery' },
    { id: 'compare', label: 'Smart Basket Price Duel' },
    { id: 'categories', label: 'Department Categories' },
    { id: 'shops', label: 'Storefront Catalogue' },
    { id: 'deals', label: 'Flash Deals & Discounts' },
    { id: 'orders', label: 'Customer Pre-Bookings & Orders' },
  ];

  for (const tab of consumerTabs) {
    console.log(`📸 Capturing Consumer Screen: ${tab.id} (${tab.label})...`);
    const filePath = path.join(OUTPUT_DIR, `screen_consumer_${tab.id}.png`);
    await consumerPage.goto(`${BASE_URL}/consumer?tab=${tab.id}`, { waitUntil: 'domcontentloaded' });
    await sleep(3200);
    await consumerPage.screenshot({ path: filePath });
    screenshots[`consumer_${tab.id}`] = filePath;
  }

  await browser.close();
  console.log('✅ All live mobile screens captured successfully.');
  return screenshots;
}

function base64Image(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    const ext = path.extname(filePath).replace('.', '') || 'png';
    const data = fs.readFileSync(filePath).toString('base64');
    return `data:image/${ext};base64,${data}`;
  }
  return '';
}

function getCommonCss() {
  return `
    @page {
      size: A4 portrait;
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #15221B;
      background: #F8FAF9;
      line-height: 1.5;
      font-size: 13px;
    }
    .page {
      width: 210mm;
      height: 297mm;
      page-break-after: always;
      position: relative;
      background: #FFFFFF;
      overflow: hidden;
      padding: 12mm 15mm 10mm 15mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* PREMIUM HEADER */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 9px;
      border-bottom: 1.5px solid #E3EBE7;
      margin-bottom: 10px;
    }
    .brand-logo-badge {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-logo-img {
      height: 32px;
      width: auto;
      object-fit: contain;
    }
    .brand-sub {
      font-size: 11.5px;
      font-weight: 800;
      color: #0D6344;
      margin-left: 6px;
      padding-left: 8px;
      border-left: 2px solid #CCD8D2;
      letter-spacing: 0.2px;
    }
    .page-badge {
      font-size: 10.5px;
      font-weight: 800;
      color: #0D6344;
      background: #EAF5EF;
      border: 1px solid #CCE3D6;
      padding: 3.5px 12px;
      border-radius: 20px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    /* ENLARGED TWO-COLUMN CONTENT GRID */
    .content-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 20px;
      align-items: center;
      flex: 1;
      margin-bottom: 6px;
    }
    .left-col {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 11px;
    }
    .feature-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 800;
      color: #0D6344;
      background: #EAF5EF;
      border: 1px solid #CCE3D6;
      padding: 3.5px 11px;
      border-radius: 20px;
      width: fit-content;
    }
    .page-title {
      font-family: 'Outfit', sans-serif;
      font-size: 25px;
      font-weight: 900;
      color: #122119;
      line-height: 1.15;
      letter-spacing: -0.5px;
    }
    .page-title-ml {
      font-family: 'Gayathri', sans-serif;
      font-size: 18.5px;
      font-weight: 700;
      color: #EA580C;
      margin-top: 1px;
      line-height: 1.3;
    }
    .page-desc {
      font-size: 12.5px;
      color: #384F43;
      line-height: 1.55;
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 2px 0;
    }
    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: #F7FCF9;
      border: 1px solid #DFEDE6;
      border-radius: 12px;
      padding: 8px 12px;
    }
    .feature-icon {
      font-size: 15px;
      line-height: 1;
      margin-top: 2px;
      color: #0D6344;
      flex-shrink: 0;
    }
    .feature-text-title {
      font-size: 12px;
      font-weight: 800;
      color: #14281E;
      margin-bottom: 2px;
    }
    .feature-text-desc {
      font-size: 11px;
      color: #556B60;
      line-height: 1.4;
    }

    .stat-pills-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 2px;
    }
    .stat-pill {
      background: #FFFFFF;
      border: 1px solid #D8EAE0;
      border-radius: 11px;
      padding: 8px 10px;
      text-align: center;
      box-shadow: 0 2px 6px rgba(13, 99, 68, 0.04);
    }
    .stat-val {
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 900;
      color: #0D6344;
    }
    .stat-lbl {
      font-size: 9.5px;
      font-weight: 700;
      color: #6C8276;
      margin-top: 1px;
    }

    /* PROMINENT ENLARGED IPHONE PHONE MOCKUP */
    .right-col {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .phone-mockup {
      width: 268px;
      height: 555px;
      border-radius: 40px;
      background: #111A15;
      padding: 9.5px;
      box-shadow: 0 24px 50px rgba(13, 74, 54, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.12) inset;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .phone-notch {
      width: 95px;
      height: 17px;
      background: #111A15;
      border-radius: 0 0 13px 13px;
      position: absolute;
      top: 9.5px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 30;
    }
    .phone-screen-container {
      width: 100%;
      height: 100%;
      border-radius: 32px;
      overflow: hidden;
      background: #FFFFFF;
      position: relative;
    }
    .phone-screenshot {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      display: block;
    }

    /* FOOTER */
    .page-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 7px;
      border-top: 1px solid #E5ECE8;
      font-size: 10px;
      color: #7A9185;
      font-weight: 600;
    }
    .footer-left {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .footer-highlight {
      color: #0D6344;
      font-weight: 800;
    }

    /* COVER PAGE SPECIAL STYLES */
    .cover-page {
      background: linear-gradient(145deg, #072E20 0%, #0D4A36 50%, #0A3627 100%);
      color: #FFFFFF;
      padding: 18mm 18mm;
      justify-content: space-between;
    }
    .cover-logo-wrapper {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .cover-logo-img {
      height: 48px;
      width: auto;
      background: #FFFFFF;
      padding: 6px 14px;
      border-radius: 14px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }
    .cover-logo-title {
      font-family: 'Outfit', sans-serif;
      font-size: 26px;
      font-weight: 900;
      color: #FFA439;
      letter-spacing: -0.5px;
    }
    .cover-logo-subtitle {
      font-size: 12.5px;
      color: #A3D4C1;
      font-weight: 600;
    }
    .cover-hero {
      margin: auto 0;
      space-y: 16px;
    }
    .cover-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 6px 16px;
      border-radius: 30px;
      font-size: 11.5px;
      font-weight: 800;
      color: #72E2B8;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .cover-heading {
      font-family: 'Outfit', sans-serif;
      font-size: 42px;
      font-weight: 900;
      line-height: 1.12;
      color: #FFFFFF;
      letter-spacing: -1px;
      margin: 12px 0 8px 0;
    }
    .cover-heading span {
      color: #FFA439;
    }
    .cover-heading-ml {
      font-family: 'Gayathri', sans-serif;
      font-size: 23px;
      font-weight: 700;
      color: #C8EEDB;
      line-height: 1.4;
      margin-bottom: 14px;
    }
    .cover-summary {
      font-size: 13.5px;
      color: #D3ECE0;
      line-height: 1.6;
      max-width: 580px;
    }

    .cover-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 22px;
    }
    .cover-card {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      padding: 13px;
    }
    .cover-card-icon {
      font-size: 20px;
      margin-bottom: 5px;
    }
    .cover-card-title {
      font-size: 13px;
      font-weight: 800;
      color: #FFFFFF;
      margin-bottom: 2px;
    }
    .cover-card-desc {
      font-size: 10.5px;
      color: #A7CDBC;
      line-height: 1.35;
    }

    .cover-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 12px;
      font-size: 10.5px;
      color: #92BFAC;
    }
  `;
}

// -----------------------------------------------------------------------------
// HTML GENERATOR 1: MERCHANT BROCHURE (10 Pages)
// -----------------------------------------------------------------------------
function generateMerchantBrochureHtml(screenshots, imgLogo) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PeediaCart - Official Merchant OS & Supermarket Brochure</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=Gayathri:wght@400;700&display=swap" rel="stylesheet">
  <style>${getCommonCss()}</style>
</head>
<body>

  <!-- PAGE 1: COVER -->
  <div class="page cover-page">
    <div class="cover-logo-wrapper">
      <img src="${imgLogo}" alt="PeediaCart Logo" class="cover-logo-img" />
      <div>
        <div class="cover-logo-title">Merchant OS & Digital Retail</div>
        <div class="cover-logo-subtitle">Hyperlocal Grocery Commerce & Daily Rate Intelligence</div>
      </div>
    </div>
    <div class="cover-hero">
      <div class="cover-pill">🏪 SUPERMARKET DIGITIZATION BROCHURE</div>
      <h1 class="cover-heading">
        Take Your Supermarket Digital.<br />
        <span>Drive 3x Footfall</span> & Direct WhatsApp Orders.
      </h1>
      <div class="cover-heading-ml">
        നിങ്ങളുടെ സൂപ്പർമാർക്കറ്റ് ഓൺലൈനിലാക്കൂ, കൂടുതൽ കച്ചവടവും ലാഭവും നേടൂ.
      </div>
      <p class="cover-summary">
        PeediaCart gives local retailers a complete operational operating system: live 1-second price management, instant POS counter billing, local home delivery dispatch, customer WhatsApp pre-bookings, and 0% platform commission.
      </p>
      <div class="cover-grid">
        <div class="cover-card">
          <div class="cover-card-icon">💰</div>
          <div class="cover-card-title">0% Platform Fee</div>
          <div class="cover-card-desc">Zero commission on orders. 100% of customer payments stay with your shop.</div>
        </div>
        <div class="cover-card">
          <div class="cover-card-icon">⚡</div>
          <div class="cover-card-title">1-Sec Rate Updates</div>
          <div class="cover-card-desc">Adjust daily produce & grocery rates on mobile in under 5 seconds.</div>
        </div>
        <div class="cover-card">
          <div class="cover-card-icon">🚚</div>
          <div class="cover-card-title">Delivery & Fleet Hub</div>
          <div class="cover-card-desc">Set delivery fees, radius, and assign home deliveries with live tracking.</div>
        </div>
      </div>
    </div>
    <div class="cover-footer">
      <div>📍 Serving Kerala Towns & Hubs • Official Merchant Edition</div>
      <div>Edition: 2026.Q4</div>
    </div>
  </div>

  <!-- PAGE 2: DASHBOARD -->
  <div class="page">
    <div class="page-header">
      <div class="brand-logo-badge">
        <img src="${imgLogo}" alt="PeediaCart" class="brand-logo-img" />
        <span class="brand-sub">Merchant OS</span>
      </div>
      <div class="page-badge">SCREEN 01 • COMMAND CENTER</div>
    </div>
    <div class="content-grid">
      <div class="left-col">
        <div class="feature-tag">📊 EXECUTIVE STORE DASHBOARD</div>
        <h2 class="page-title">Real-Time Store Telemetry & Operations Command</h2>
        <div class="page-title-ml">തത്സമയ ബിസിനസ്സ് നിരീക്ഷണവും ഓർഡർ ഡാഷ്‌ബോർഡും</div>
        <p class="page-desc">Get bird's-eye visibility into your supermarket's daily sales performance, active customer footfall, inquiry leads, and store online status.</p>
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">🟢</div>
            <div>
              <div class="feature-text-title">Live Store Broadcast Toggle</div>
              <div class="feature-text-desc">Switch shop status between Online and Offline in 1 tap.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📈</div>
            <div>
              <div class="feature-text-title">Daily Sales & Order Velocity</div>
              <div class="feature-text-desc">Track today's total turnover, completed orders, and average bill size.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔔</div>
            <div>
              <div class="feature-text-title">Instant Order & Lead Alerts</div>
              <div class="feature-text-desc">Immediate alerts whenever a customer reserves a basket or sends an inquiry.</div>
            </div>
          </div>
        </div>
        <div class="stat-pills-row">
          <div class="stat-pill"><div class="stat-val">340+</div><div class="stat-lbl">Daily Views</div></div>
          <div class="stat-pill"><div class="stat-val">100%</div><div class="stat-lbl">Mobile Ready</div></div>
          <div class="stat-pill"><div class="stat-val">0%</div><div class="stat-lbl">Commission</div></div>
        </div>
      </div>
      <div class="right-col">
        <div class="phone-mockup"><div class="phone-notch"></div><div class="phone-screen-container"><img src="${base64Image(screenshots.merchant_dashboard)}" class="phone-screenshot" /></div></div>
      </div>
    </div>
    <div class="page-footer"><div class="footer-left"><span class="footer-highlight">PeediaCart Merchant OS</span> • Command Center</div><div>Page 02 / 10</div></div>
  </div>

  <!-- PAGE 3: INVENTORY & RATES -->
  <div class="page">
    <div class="page-header">
      <div class="brand-logo-badge">
        <img src="${imgLogo}" alt="PeediaCart" class="brand-logo-img" />
        <span class="brand-sub">Inventory & Rates</span>
      </div>
      <div class="page-badge">SCREEN 02 • PRICE MANAGER</div>
    </div>
    <div class="content-grid">
      <div class="left-col">
        <div class="feature-tag">⚡ 1-SECOND RATE MANAGEMENT</div>
        <h2 class="page-title">Live Rate Overrides & Stock Management</h2>
        <div class="page-title-ml">പച്ചക്കറി, പലചരക്ക് നിരക്കുകൾ നിമിഷങ്ങൾക്കകം മാറ്റാം</div>
        <p class="page-desc">Daily grocery rates fluctuate. PeediaCart provides the fastest mobile rate terminal to adjust prices with dirty-save indicators and stock toggles.</p>
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">✏️</div>
            <div>
              <div class="feature-text-title">Rapid In-Line Price Overrides</div>
              <div class="feature-text-desc">Edit prices in seconds with visual dirty-save indicators.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📦</div>
            <div>
              <div class="feature-text-title">Instant In-Stock / Out-of-Stock Toggle</div>
              <div class="feature-text-desc">Mark sold-out items with one click so shoppers see accurate availability.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔍</div>
            <div>
              <div class="feature-text-title">Bilingual Search & Master Catalogue</div>
              <div class="feature-text-desc">Search by Malayalam (തക്കാളി) or English (Tomatoes) across 5,000+ items.</div>
            </div>
          </div>
        </div>
        <div class="stat-pills-row">
          <div class="stat-pill"><div class="stat-val">&lt; 2s</div><div class="stat-lbl">Update Speed</div></div>
          <div class="stat-pill"><div class="stat-val">5,000+</div><div class="stat-lbl">SKU Support</div></div>
          <div class="stat-pill"><div class="stat-val">Live</div><div class="stat-lbl">Sync to App</div></div>
        </div>
      </div>
      <div class="right-col">
        <div class="phone-mockup"><div class="phone-notch"></div><div class="phone-screen-container"><img src="${base64Image(screenshots.merchant_inventory)}" class="phone-screenshot" /></div></div>
      </div>
    </div>
    <div class="page-footer"><div class="footer-left"><span class="footer-highlight">PeediaCart Merchant OS</span> • Live Price Terminal</div><div>Page 03 / 10</div></div>
  </div>

  <!-- PAGE 4: POS BILLING -->
  <div class="page">
    <div class="page-header">
      <div class="brand-logo-badge">
        <img src="${imgLogo}" alt="PeediaCart" class="brand-logo-img" />
        <span class="brand-sub">Smart Billing POS</span>
      </div>
      <div class="page-badge">SCREEN 03 • POS BILLING</div>
    </div>
    <div class="content-grid">
      <div class="left-col">
        <div class="feature-tag">💻 RAPID CHECKOUT TERMINAL</div>
        <h2 class="page-title">Cloud POS Billing & Thermal Invoice Workspace</h2>
        <div class="page-title-ml">ലളിതമായ കൗണ്ടർ ബില്ലിംഗും ഇൻസ്റ്റന്റ് ഇൻവോയ്സും</div>
        <p class="page-desc">Replace clunky billing systems with a lightweight cloud terminal. Generate receipts, compute GST/discounts, and print invoices instantly.</p>
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">⚡</div>
            <div>
              <div class="feature-text-title">Rapid Item Lookup & Auto-Complete</div>
              <div class="feature-text-desc">Add groceries by name, barcode, or code in milliseconds.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🖨️</div>
            <div>
              <div class="feature-text-title">Thermal 58mm/80mm & WhatsApp Invoice</div>
              <div class="feature-text-desc">Print paper receipts or send digital PDF invoices to buyer WhatsApp.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">💳</div>
            <div>
              <div class="feature-text-title">Integrated UPI & Cash Settlement</div>
              <div class="feature-text-desc">Dynamic UPI QR code for effortless digital payment collection.</div>
            </div>
          </div>
        </div>
        <div class="stat-pills-row">
          <div class="stat-pill"><div class="stat-val">3-Tap</div><div class="stat-lbl">Bill Creation</div></div>
          <div class="stat-pill"><div class="stat-val">Offline</div><div class="stat-lbl">Resilient</div></div>
          <div class="stat-pill"><div class="stat-val">₹0</div><div class="stat-lbl">Hardware Cost</div></div>
        </div>
      </div>
      <div class="right-col">
        <div class="phone-mockup"><div class="phone-notch"></div><div class="phone-screen-container"><img src="${base64Image(screenshots.merchant_billing)}" class="phone-screenshot" /></div></div>
      </div>
    </div>
    <div class="page-footer"><div class="footer-left"><span class="footer-highlight">PeediaCart Merchant OS</span> • Cloud POS Billing</div><div>Page 04 / 10</div></div>
  </div>

  <!-- PAGE 5: PRE-BOOKINGS -->
  <div class="page">
    <div class="page-header">
      <div class="brand-logo-badge">
        <img src="${imgLogo}" alt="PeediaCart" class="brand-logo-img" />
        <span class="brand-sub">Pre-Bookings</span>
      </div>
      <div class="page-badge">SCREEN 04 • ORDER QUEUE</div>
    </div>
    <div class="content-grid">
      <div class="left-col">
        <div class="feature-tag">📱 ZERO-COMMISSION DIRECT ORDERS</div>
        <h2 class="page-title">Customer WhatsApp Pre-Bookings & Order Queue</h2>
        <div class="page-title-ml">നേരിട്ടുള്ള WhatsApp ഓർഡറുകൾ മാനേജ് ചെയ്യാം</div>
        <p class="page-desc">Local families build monthly shopping lists and pre-book with your store for pickup or home delivery. Manage packing and dispatch smoothly.</p>
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">📋</div>
            <div>
              <div class="feature-text-title">Itemized Packing Lists</div>
              <div class="feature-text-desc">View customer basket quantities, unit weights, and substitutions.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔄</div>
            <div>
              <div class="feature-text-title">Order Lifecycle Status Tracker</div>
              <div class="feature-text-desc">Update status: Pending → Packed → Ready for Pickup → Completed.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">💬</div>
            <div>
              <div class="feature-text-title">1-Tap Customer WhatsApp Call / Chat</div>
              <div class="feature-text-desc">Connect with the buyer instantly to confirm delivery address or items.</div>
            </div>
          </div>
        </div>
        <div class="stat-pills-row">
          <div class="stat-pill"><div class="stat-val">100%</div><div class="stat-lbl">Direct to You</div></div>
          <div class="stat-pill"><div class="stat-val">0%</div><div class="stat-lbl">Deductions</div></div>
          <div class="stat-pill"><div class="stat-val">Instant</div><div class="stat-lbl">Alerts</div></div>
        </div>
      </div>
      <div class="right-col">
        <div class="phone-mockup"><div class="phone-notch"></div><div class="phone-screen-container"><img src="${base64Image(screenshots.merchant_prebookings)}" class="phone-screenshot" /></div></div>
      </div>
    </div>
    <div class="page-footer"><div class="footer-left"><span class="footer-highlight">PeediaCart Merchant OS</span> • WhatsApp Pre-Bookings</div><div>Page 05 / 10</div></div>
  </div>

  <!-- PAGE 6: LOCAL HOME DELIVERY -->
  <div class="page">
    <div class="page-header">
      <div class="brand-logo-badge">
        <img src="${imgLogo}" alt="PeediaCart" class="brand-logo-img" />
        <span class="brand-sub">Home Delivery Hub</span>
      </div>
      <div class="page-badge">SCREEN 05 • DELIVERY FLEET</div>
    </div>
    <div class="content-grid">
      <div class="left-col">
        <div class="feature-tag">🚚 HYPERLOCAL DISPATCH HUB</div>
        <h2 class="page-title">Local Home Delivery & Fleet Dispatch Hub</h2>
        <div class="page-title-ml">ഹോം ഡെലിവറി സർവീസ് എളുപ്പത്തിൽ നിയന്ത്രിക്കാം</div>
        <p class="page-desc">Expand your supermarket's delivery footprint. Set delivery radius, free-shipping minimum order limits, estimated arrival times, and manage your delivery boys.</p>
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">📍</div>
            <div>
              <div class="feature-text-title">Custom Delivery Radius (km)</div>
              <div class="feature-text-desc">Define your delivery reach (e.g. 8 km) across town and surrounding wards.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">💰</div>
            <div>
              <div class="feature-text-title">Free Delivery Thresholds & Fees</div>
              <div class="feature-text-desc">Set rules like Free Delivery above ₹500 or fixed ₹30 local charge.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">⏱️</div>
            <div>
              <div class="feature-text-title">ETA & Active Dispatch Orders</div>
              <div class="feature-text-desc">Notify shoppers with live 30-45 mins delivery estimates.</div>
            </div>
          </div>
        </div>
        <div class="stat-pills-row">
          <div class="stat-pill"><div class="stat-val">8 km</div><div class="stat-lbl">Town Radius</div></div>
          <div class="stat-pill"><div class="stat-val">30 min</div><div class="stat-lbl">Avg Delivery</div></div>
          <div class="stat-pill"><div class="stat-val">0%</div><div class="stat-lbl">Fleet Cut</div></div>
        </div>
      </div>
      <div class="right-col">
        <div class="phone-mockup"><div class="phone-notch"></div><div class="phone-screen-container"><img src="${base64Image(screenshots.merchant_delivery)}" class="phone-screenshot" /></div></div>
      </div>
    </div>
    <div class="page-footer"><div class="footer-left"><span class="footer-highlight">PeediaCart Merchant OS</span> • Delivery & Dispatch Hub</div><div>Page 06 / 10</div></div>
  </div>

  <!-- PAGE 7: FLASH DEALS -->
  <div class="page">
    <div class="page-header">
      <div class="brand-logo-badge">
        <img src="${imgLogo}" alt="PeediaCart" class="brand-logo-img" />
        <span class="brand-sub">Flash Deals</span>
      </div>
      <div class="page-badge">SCREEN 06 • PROMOTIONS</div>
    </div>
    <div class="content-grid">
      <div class="left-col">
        <div class="feature-tag">🏷️ DYNAMIC PROMOTIONS ENGINE</div>
        <h2 class="page-title">Flash Deals & Festival Offers Broadcast</h2>
        <div class="page-title-ml">ഓഫറുകളും ഡിസ്കൗണ്ടുകളും ഉപഭോക്താക്കളിലേക്ക് എത്തിക്കാം</div>
        <p class="page-desc">Clear excess inventory or launch weekend festive offers. Create countdown flash sales that broadcast directly to all active app users in your locality.</p>
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">⏳</div>
            <div>
              <div class="feature-text-title">Countdown-Based Flash Discounts</div>
              <div class="feature-text-desc">Set launch and expiry timers to generate urgency and fast sell-through.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🎯</div>
            <div>
              <div class="feature-text-title">Featured Badges on Consumer Home</div>
              <div class="feature-text-desc">Your deals get prime banner placement in the shopper feed.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📊</div>
            <div>
              <div class="feature-text-title">Live Deal Analytics</div>
              <div class="feature-text-desc">Monitor total views, claims, and WhatsApp inquiries generated per deal.</div>
            </div>
          </div>
        </div>
        <div class="stat-pills-row">
          <div class="stat-pill"><div class="stat-val">3x</div><div class="stat-lbl">Higher Reach</div></div>
          <div class="stat-pill"><div class="stat-val">1-Tap</div><div class="stat-lbl">Publish</div></div>
          <div class="stat-pill"><div class="stat-val">Instant</div><div class="stat-lbl">Broadcast</div></div>
        </div>
      </div>
      <div class="right-col">
        <div class="phone-mockup"><div class="phone-notch"></div><div class="phone-screen-container"><img src="${base64Image(screenshots.merchant_deals)}" class="phone-screenshot" /></div></div>
      </div>
    </div>
    <div class="page-footer"><div class="footer-left"><span class="footer-highlight">PeediaCart Merchant OS</span> • Promotions & Flash Deals</div><div>Page 07 / 10</div></div>
  </div>

  <!-- PAGE 8: CHATS & INQUIRIES -->
  <div class="page">
    <div class="page-header">
      <div class="brand-logo-badge">
        <img src="${imgLogo}" alt="PeediaCart" class="brand-logo-img" />
        <span class="brand-sub">Customer Chat</span>
      </div>
      <div class="page-badge">SCREEN 07 • CUSTOMER CONNECT</div>
    </div>
    <div class="content-grid">
      <div class="left-col">
        <div class="feature-tag">🤝 DIRECT ENGAGEMENT</div>
        <h2 class="page-title">Direct Customer Inquiries & Messaging Channel</h2>
        <div class="page-title-ml">ഉപഭോക്താക്കളുമായി നേരിട്ട് ആശയവിനിമയം നടത്താം</div>
        <p class="page-desc">Build personal customer loyalty. Answer queries regarding stock arrivals, fresh cuts, bulk bookings, or home delivery status seamlessly.</p>
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">⚡</div>
            <div>
              <div class="feature-text-title">In-App Live Chat Feed</div>
              <div class="feature-text-desc">Synchronized two-way communication between shopper and counter staff.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📲</div>
            <div>
              <div class="feature-text-title">WhatsApp Fallback Redirection</div>
              <div class="feature-text-desc">Shoppers can transfer chat to your official WhatsApp number with 1 tap.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔒</div>
            <div>
              <div class="feature-text-title">Chat & Inquiry Record Retention</div>
              <div class="feature-text-desc">Complete order inquiry logs preserved for reference.</div>
            </div>
          </div>
        </div>
        <div class="stat-pills-row">
          <div class="stat-pill"><div class="stat-val">&lt; 1 min</div><div class="stat-lbl">Response</div></div>
          <div class="stat-pill"><div class="stat-val">24/7</div><div class="stat-lbl">Lead Storage</div></div>
          <div class="stat-pill"><div class="stat-val">Direct</div><div class="stat-lbl">Customer Bond</div></div>
        </div>
      </div>
      <div class="right-col">
        <div class="phone-mockup"><div class="phone-notch"></div><div class="phone-screen-container"><img src="${base64Image(screenshots.merchant_chats)}" class="phone-screenshot" /></div></div>
      </div>
    </div>
    <div class="page-footer"><div class="footer-left"><span class="footer-highlight">PeediaCart Merchant OS</span> • Customer Messaging</div><div>Page 08 / 10</div></div>
  </div>

  <!-- PAGE 9: STORE PROFILE & GPS -->
  <div class="page">
    <div class="page-header">
      <div class="brand-logo-badge">
        <img src="${imgLogo}" alt="PeediaCart" class="brand-logo-img" />
        <span class="brand-sub">Store Settings</span>
      </div>
      <div class="page-badge">SCREEN 08 • STORE PROFILE</div>
    </div>
    <div class="content-grid">
      <div class="left-col">
        <div class="feature-tag">🏢 VERIFIED STORE IDENTITY</div>
        <h2 class="page-title">Digital Storefront Profile & Geo-Location Setup</h2>
        <div class="page-title-ml">കടയുടെ പ്രൊഫൈലും പ്രവർത്തന സമയവും സെറ്റ് ചെയ്യാം</div>
        <p class="page-desc">Configure your supermarket's public digital identity. Set exact GPS coordinates, delivery radius, operating schedule, and verified checkmarks.</p>
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">📍</div>
            <div>
              <div class="feature-text-title">Precise GPS Hub Mapping</div>
              <div class="feature-text-desc">Allows nearby shoppers to see accurate driving distances and ETA.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🕒</div>
            <div>
              <div class="feature-text-title">Operating Schedule & Break Hours</div>
              <div class="feature-text-desc">Set daily open/close hours to prevent off-hour order confusion.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🛡️</div>
            <div>
              <div class="feature-text-title">Verified Partner Certification Badge</div>
              <div class="feature-text-desc">Build trust with the official green verified merchant checkmark.</div>
            </div>
          </div>
        </div>
        <div class="stat-pills-row">
          <div class="stat-pill"><div class="stat-val">Verified</div><div class="stat-lbl">Store Badge</div></div>
          <div class="stat-pill"><div class="stat-val">GPS</div><div class="stat-lbl">Precision Pin</div></div>
          <div class="stat-pill"><div class="stat-val">100%</div><div class="stat-lbl">Customizable</div></div>
        </div>
      </div>
      <div class="right-col">
        <div class="phone-mockup"><div class="phone-notch"></div><div class="phone-screen-container"><img src="${base64Image(screenshots.merchant_profile)}" class="phone-screenshot" /></div></div>
      </div>
    </div>
    <div class="page-footer"><div class="footer-left"><span class="footer-highlight">PeediaCart Merchant OS</span> • Store Profile & GPS</div><div>Page 09 / 10</div></div>
  </div>

  <!-- PAGE 10: BACK COVER ONBOARDING -->
  <div class="page cover-page" style="padding: 18mm 18mm;">
    <div class="cover-logo-wrapper">
      <img src="${imgLogo}" alt="PeediaCart Logo" class="cover-logo-img" />
      <div>
        <div class="cover-logo-title">Partner With PeediaCart</div>
        <div class="cover-logo-subtitle">Simple 3-Step Merchant Onboarding Process</div>
      </div>
    </div>
    <div style="margin: auto 0; space-y: 18px;">
      <h2 style="font-family: 'Outfit', sans-serif; font-size: 30px; font-weight: 900; color: #FFA439; line-height: 1.2;">
        Get Your Supermarket Live in 5 Minutes.<br />
        <span style="color: #FFFFFF; font-size: 24px;">Zero Setup Fee • Full Training Included</span>
      </h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 18px;">
        <div class="cover-card" style="background: rgba(255, 255, 255, 0.1);">
          <div style="font-size: 22px; font-weight: 900; color: #FFA439; margin-bottom: 6px;">STEP 1</div>
          <div style="font-size: 13.5px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px;">Register Your Store</div>
          <div style="font-size: 11px; color: #C8EEDB; line-height: 1.4;">Submit store name, WhatsApp number, and address. Instant verification.</div>
        </div>
        <div class="cover-card" style="background: rgba(255, 255, 255, 0.1);">
          <div style="font-size: 22px; font-weight: 900; color: #FFA439; margin-bottom: 6px;">STEP 2</div>
          <div style="font-size: 13.5px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px;">Set Today's Rates</div>
          <div style="font-size: 11px; color: #C8EEDB; line-height: 1.4;">Input daily produce & essential rates using our fast 1-click mobile terminal.</div>
        </div>
        <div class="cover-card" style="background: rgba(255, 255, 255, 0.1);">
          <div style="font-size: 22px; font-weight: 900; color: #FFA439; margin-bottom: 6px;">STEP 3</div>
          <div style="font-size: 13.5px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px;">Receive Orders</div>
          <div style="font-size: 11px; color: #C8EEDB; line-height: 1.4;">Local families see your rates and send direct WhatsApp pre-orders!</div>
        </div>
      </div>
      <div style="background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 16px; padding: 16px; margin-top: 20px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-size: 14px; font-weight: 800; color: #FFFFFF;">Ready to digitize your supermarket?</div>
          <div style="font-size: 11.5px; color: #9FD9C3;">Contact our merchant support team or register directly online.</div>
        </div>
        <div style="background: #FFA439; color: #14231A; font-weight: 900; font-size: 12.5px; padding: 9px 18px; border-radius: 30px; box-shadow: 0 4px 15px rgba(255, 164, 57, 0.4);">
          📞 WhatsApp: +91 80759 50428
        </div>
      </div>
    </div>
    <div class="cover-footer">
      <div>PeediaCart Technologies Private Limited • Kerala, India</div>
      <div>Website: peediacart.in • Support: support@peediacart.in</div>
    </div>
  </div>

</body>
</html>
  `;
}


// -----------------------------------------------------------------------------
// HTML GENERATOR 2: CONSUMER BROCHURE (8 Pages)
// -----------------------------------------------------------------------------
function generateConsumerBrochureHtml(screenshots, imgLogo) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PeediaCart - Official Shopper & Consumer Guide</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=Gayathri:wght@400;700&display=swap" rel="stylesheet">
  <style>${getCommonCss()}</style>
</head>
<body>

  <!-- PAGE 1: CONSUMER COVER -->
  <div class="page cover-page">
    <div class="cover-logo-wrapper">
      <img src="${imgLogo}" alt="PeediaCart Logo" class="cover-logo-img" />
      <div>
        <div class="cover-logo-title">Smart Grocery Comparison</div>
        <div class="cover-logo-subtitle">Kerala's Multi-Supermarket Basket Price Intelligence</div>
      </div>
    </div>
    <div class="cover-hero">
      <div class="cover-pill">🛒 CONSUMER & SHOPPER GUIDE</div>
      <h1 class="cover-heading">
        Every Grocery at the<br />
        <span>Lowest Local Price.</span>
      </h1>
      <div class="cover-heading-ml">
        ആവശ്യമായതെല്ലാം, മികച്ച വിലയിൽ കണ്ടെത്തൂ.
      </div>
      <p class="cover-summary">
        PeediaCart is the smart way Kerala families shop. Compare entire grocery baskets across nearby supermarkets, unlock daily market wholesale rates, and pre-book directly with local stores via WhatsApp.
      </p>
      <div class="cover-grid">
        <div class="cover-card">
          <div class="cover-card-icon">⚖️</div>
          <div class="cover-card-title">Basket Price Duel</div>
          <div class="cover-card-desc">Compare complete cart totals across Lulu, Kalyan, Bismi & local stores.</div>
        </div>
        <div class="cover-card">
          <div class="cover-card-icon">💵</div>
          <div class="cover-card-title">₹60–₹120 Savings</div>
          <div class="cover-card-desc">Save hundreds on every weekly grocery haul with transparent rate comparison.</div>
        </div>
        <div class="cover-card">
          <div class="cover-card-icon">📱</div>
          <div class="cover-card-title">1-Tap WhatsApp Order</div>
          <div class="cover-card-desc">Export your grocery list straight to your preferred store counter.</div>
        </div>
      </div>
    </div>
    <div class="cover-footer">
      <div>📍 Serving Kerala Towns & Hubs • Consumer Edition</div>
      <div>Edition: 2026.Q4</div>
    </div>
  </div>

  <!-- PAGE 2: HOME DISCOVERY -->
  <div class="page">
    <div class="page-header">
      <div class="brand-logo-badge">
        <img src="${imgLogo}" alt="PeediaCart" class="brand-logo-img" />
        <span class="brand-sub">Shopper Discovery</span>
      </div>
      <div class="page-badge">SCREEN 01 • HOME DISCOVERY</div>
    </div>
    <div class="content-grid">
      <div class="left-col">
        <div class="feature-tag">🌾 DAILY MARKET BENCHMARKS</div>
        <h2 class="page-title">Live Kerala Market Rates & Store Discovery</h2>
        <div class="page-title-ml">ഇന്നത്തെ വിപണി നിരക്കുകളും സമീപത്തെ സൂപ്പർമാർക്കറ്റുകളും</div>
        <p class="page-desc">Stay informed with daily updated market wholesale benchmarks for staples and find verified supermarkets within your immediate town radius.</p>
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">📊</div>
            <div>
              <div class="feature-text-title">Today's Staples Rate Ticker</div>
              <div class="feature-text-desc">Live per-kg prices for Tomatoes (₹28), Onions (₹35), Potatoes & Coconut.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🏪</div>
            <div>
              <div class="feature-text-title">Verified Nearby Supermarket Cards</div>
              <div class="feature-text-desc">View verified badges, distances, ratings, and active discount tags.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔍</div>
            <div>
              <div class="feature-text-title">Bilingual Search Engine</div>
              <div class="feature-text-desc">Search in Malayalam script or English with instant autocomplete.</div>
            </div>
          </div>
        </div>
        <div class="stat-pills-row">
          <div class="stat-pill"><div class="stat-val">100%</div><div class="stat-lbl">Transparent</div></div>
          <div class="stat-pill"><div class="stat-val">Daily</div><div class="stat-lbl">Rate Sync</div></div>
          <div class="stat-pill"><div class="stat-val">Nearby</div><div class="stat-lbl">Store Radar</div></div>
        </div>
      </div>
      <div class="right-col">
        <div class="phone-mockup"><div class="phone-notch"></div><div class="phone-screen-container"><img src="${base64Image(screenshots.opening_page || screenshots.consumer_home)}" class="phone-screenshot" /></div></div>
      </div>
    </div>
    <div class="page-footer"><div class="footer-left"><span class="footer-highlight">PeediaCart</span> • Live Home Discovery</div><div>Page 02 / 08</div></div>
  </div>

  <!-- PAGE 3: SMART BASKET PRICE DUEL -->
  <div class="page">
    <div class="page-header">
      <div class="brand-logo-badge">
        <img src="${imgLogo}" alt="PeediaCart" class="brand-logo-img" />
        <span class="brand-sub">Price Duel</span>
      </div>
      <div class="page-badge">SCREEN 02 • BASKET DUEL</div>
    </div>
    <div class="content-grid">
      <div class="left-col">
        <div class="feature-tag">⚖️ MULTI-STORE BASKET DUEL</div>
        <h2 class="page-title">Smart Basket Duel: Compare Complete Cart Bills</h2>
        <div class="page-title-ml">സ്മാർട്ട് ബാസ്‌ക്കറ്റ് വില താരതമ്യവും വൻ ലാഭവും</div>
        <p class="page-desc">Add multiple items to your basket (Veggies, Milk, Oil, Rice) and watch PeediaCart compute total billing across every local store simultaneously.</p>
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">🏆</div>
            <div>
              <div class="feature-text-title">Lowest Total Bill Trophy Highlight</div>
              <div class="feature-text-desc">Clearly marks the cheapest overall supermarket for your specific cart.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">💰</div>
            <div>
              <div class="feature-text-title">Instant Savings Breakdown</div>
              <div class="feature-text-desc">See exact savings (e.g. ₹65 Saved) compared to highest-cost competitor.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📲</div>
            <div>
              <div class="feature-text-title">1-Tap WhatsApp Checkout</div>
              <div class="feature-text-desc">Transfer your winning basket to the store counter via WhatsApp.</div>
            </div>
          </div>
        </div>
        <div class="stat-pills-row">
          <div class="stat-pill"><div class="stat-val">₹60–₹120</div><div class="stat-lbl">Avg. Savings</div></div>
          <div class="stat-pill"><div class="stat-val">Multi-Store</div><div class="stat-lbl">Comparison</div></div>
          <div class="stat-pill"><div class="stat-val">1-Tap</div><div class="stat-lbl">WhatsApp Cart</div></div>
        </div>
      </div>
      <div class="right-col">
        <div class="phone-mockup"><div class="phone-notch"></div><div class="phone-screen-container"><img src="${base64Image(screenshots.consumer_compare)}" class="phone-screenshot" /></div></div>
      </div>
    </div>
    <div class="page-footer"><div class="footer-left"><span class="footer-highlight">PeediaCart</span> • Smart Basket Comparison</div><div>Page 03 / 08</div></div>
  </div>

  <!-- PAGE 4: CATEGORIES -->
  <div class="page">
    <div class="page-header">
      <div class="brand-logo-badge">
        <img src="${imgLogo}" alt="PeediaCart" class="brand-logo-img" />
        <span class="brand-sub">Categories</span>
      </div>
      <div class="page-badge">SCREEN 03 • DEPARTMENTS</div>
    </div>
    <div class="content-grid">
      <div class="left-col">
        <div class="feature-tag">🥦 CURATED DEPARTMENTS</div>
        <h2 class="page-title">Department Categories & Malayalam Index</h2>
        <div class="page-title-ml">വിഭാഗങ്ങൾ അനുസരിച്ച് ഉൽപ്പന്നങ്ങൾ തിരയൂ</div>
        <p class="page-desc">Browse effortlessly through organized grocery departments: Fresh Vegetables, Farm Fruits, Staples & Rice, Bakery, Dairy & Kerala Snacks.</p>
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">🏷️</div>
            <div>
              <div class="feature-text-title">Sub-Category Filtering</div>
              <div class="feature-text-desc">Filter by Leafy Greens, Tubers, Organic, Kerala Brand Staples.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🛒</div>
            <div>
              <div class="feature-text-title">Quick Add with Quantity Increment</div>
              <div class="feature-text-desc">Add 1kg, 2kg, or custom units directly into your smart comparison cart.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🌾</div>
            <div>
              <div class="feature-text-title">Direct Local Sourcing Indicators</div>
              <div class="feature-text-desc">Clear badges for local farm produce and certified fresh arrivals.</div>
            </div>
          </div>
        </div>
        <div class="stat-pills-row">
          <div class="stat-pill"><div class="stat-val">10+</div><div class="stat-lbl">Departments</div></div>
          <div class="stat-pill"><div class="stat-val">Bilingual</div><div class="stat-lbl">Search</div></div>
          <div class="stat-pill"><div class="stat-val">Instant</div><div class="stat-lbl">Filter</div></div>
        </div>
      </div>
      <div class="right-col">
        <div class="phone-mockup"><div class="phone-notch"></div><div class="phone-screen-container"><img src="${base64Image(screenshots.consumer_categories)}" class="phone-screenshot" /></div></div>
      </div>
    </div>
    <div class="page-footer"><div class="footer-left"><span class="footer-highlight">PeediaCart</span> • Department Directory</div><div>Page 04 / 08</div></div>
  </div>

  <!-- PAGE 5: SHOP CATALOGUE -->
  <div class="page">
    <div class="page-header">
      <div class="brand-logo-badge">
        <img src="${imgLogo}" alt="PeediaCart" class="brand-logo-img" />
        <span class="brand-sub">Store Directory</span>
      </div>
      <div class="page-badge">SCREEN 04 • SHOP CATALOGUE</div>
    </div>
    <div class="content-grid">
      <div class="left-col">
        <div class="feature-tag">🏪 DIGITAL STOREFRONTS</div>
        <h2 class="page-title">Supermarket Profiles & Complete Store Catalogues</h2>
        <div class="page-title-ml">കടകളുടെ മുഴുവൻ കാറ്റലോഗും നേരിട്ട് കാണാം</div>
        <p class="page-desc">Explore the exact inventory of Kalyan Hypermarket, Lulu Daily, Bismi, and town stores. View store hours, driving distances, and contact details.</p>
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">⭐</div>
            <div>
              <div class="feature-text-title">Verified Customer Ratings</div>
              <div class="feature-text-desc">Transparent review scores based on genuine shopper experiences.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📍</div>
            <div>
              <div class="feature-text-title">Live Distance & Route Directions</div>
              <div class="feature-text-desc">Calculated km from your GPS location for easy in-store pickup.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📦</div>
            <div>
              <div class="feature-text-title">Full Catalogue Browse</div>
              <div class="feature-text-desc">Search specifically within one store's stock without distractions.</div>
            </div>
          </div>
        </div>
        <div class="stat-pills-row">
          <div class="stat-pill"><div class="stat-val">Verified</div><div class="stat-lbl">Partners</div></div>
          <div class="stat-pill"><div class="stat-val">GPS</div><div class="stat-lbl">Accurate</div></div>
          <div class="stat-pill"><div class="stat-val">Full</div><div class="stat-lbl">Catalogue</div></div>
        </div>
      </div>
      <div class="right-col">
        <div class="phone-mockup"><div class="phone-notch"></div><div class="phone-screen-container"><img src="${base64Image(screenshots.consumer_shops)}" class="phone-screenshot" /></div></div>
      </div>
    </div>
    <div class="page-footer"><div class="footer-left"><span class="footer-highlight">PeediaCart</span> • Supermarket Catalogues</div><div>Page 05 / 08</div></div>
  </div>

  <!-- PAGE 6: FLASH DEALS -->
  <div class="page">
    <div class="page-header">
      <div class="brand-logo-badge">
        <img src="${imgLogo}" alt="PeediaCart" class="brand-logo-img" />
        <span class="brand-sub">Deals & Offers</span>
      </div>
      <div class="page-badge">SCREEN 05 • FLASH OFFERS</div>
    </div>
    <div class="content-grid">
      <div class="left-col">
        <div class="feature-tag">🔥 DAILY SUPERMARKET OFFERS</div>
        <h2 class="page-title">Flash Deals & Limited-Time Grocery Discounts</h2>
        <div class="page-title-ml">ഇന്നത്തെ ഓഫറുകളും സ്പെഷ്യൽ ഡിസ്കൗണ്ടുകളും</div>
        <p class="page-desc">Never miss a discount in your town. Supermarkets publish limited-time deals, combo packs, and festival price drops directly on PeediaCart.</p>
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">⏳</div>
            <div>
              <div class="feature-text-title">Live Countdown Timers</div>
              <div class="feature-text-desc">Clear timer indicators showing hours left for each special deal.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🏷️</div>
            <div>
              <div class="feature-text-title">Percentage Discount Badges</div>
              <div class="feature-text-desc">Easily spot 20%, 30%, or 50% savings on top household brands.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📱</div>
            <div>
              <div class="feature-text-title">1-Tap Deal Pre-Booking</div>
              <div class="feature-text-desc">Lock in the discounted rate before stocks run out at the counter.</div>
            </div>
          </div>
        </div>
        <div class="stat-pills-row">
          <div class="stat-pill"><div class="stat-val">Up to 40%</div><div class="stat-lbl">Discounts</div></div>
          <div class="stat-pill"><div class="stat-val">Verified</div><div class="stat-lbl">Deals</div></div>
          <div class="stat-pill"><div class="stat-val">Daily</div><div class="stat-lbl">Refreshed</div></div>
        </div>
      </div>
      <div class="right-col">
        <div class="phone-mockup"><div class="phone-notch"></div><div class="phone-screen-container"><img src="${base64Image(screenshots.consumer_deals)}" class="phone-screenshot" /></div></div>
      </div>
    </div>
    <div class="page-footer"><div class="footer-left"><span class="footer-highlight">PeediaCart</span> • Flash Deals & Offers</div><div>Page 06 / 08</div></div>
  </div>

  <!-- PAGE 7: ORDERS & DISPATCH -->
  <div class="page">
    <div class="page-header">
      <div class="brand-logo-badge">
        <img src="${imgLogo}" alt="PeediaCart" class="brand-logo-img" />
        <span class="brand-sub">My Orders</span>
      </div>
      <div class="page-badge">SCREEN 06 • ORDER TRACKING</div>
    </div>
    <div class="content-grid">
      <div class="left-col">
        <div class="feature-tag">📦 SEAMLESS PRE-BOOKING</div>
        <h2 class="page-title">Track Pre-Bookings & Home Delivery Status</h2>
        <div class="page-title-ml">ഓർഡർ വിവരങ്ങളും ഡെലിവറി സ്റ്റാറ്റസും അറിയാം</div>
        <p class="page-desc">Track the exact preparation status of your reserved basket from the moment you send it to the store until it is packed and ready for pickup or dispatch.</p>
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">🔄</div>
            <div>
              <div class="feature-text-title">Real-Time Preparation Status</div>
              <div class="feature-text-desc">Live stages: Order Received → Packing → Packed → Ready for Delivery.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">💬</div>
            <div>
              <div class="feature-text-title">Direct Counter WhatsApp Support</div>
              <div class="feature-text-desc">Connect with the store manager directly for quick item changes.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🧾</div>
            <div>
              <div class="feature-text-title">Digital Purchase History</div>
              <div class="feature-text-desc">Access previous shopping lists for 1-tap reordering.</div>
            </div>
          </div>
        </div>
        <div class="stat-pills-row">
          <div class="stat-pill"><div class="stat-val">Live</div><div class="stat-lbl">Tracking</div></div>
          <div class="stat-pill"><div class="stat-val">Direct</div><div class="stat-lbl">WhatsApp</div></div>
          <div class="stat-pill"><div class="stat-val">Zero</div><div class="stat-lbl">Extra Fees</div></div>
        </div>
      </div>
      <div class="right-col">
        <div class="phone-mockup"><div class="phone-notch"></div><div class="phone-screen-container"><img src="${base64Image(screenshots.consumer_orders)}" class="phone-screenshot" /></div></div>
      </div>
    </div>
    <div class="page-footer"><div class="footer-left"><span class="footer-highlight">PeediaCart</span> • Orders & Delivery Status</div><div>Page 07 / 08</div></div>
  </div>

  <!-- PAGE 8: CONSUMER BACK COVER -->
  <div class="page cover-page" style="padding: 18mm 18mm;">
    <div class="cover-logo-wrapper">
      <img src="${imgLogo}" alt="PeediaCart Logo" class="cover-logo-img" />
      <div>
        <div class="cover-logo-title">Shop Smarter Every Day</div>
        <div class="cover-logo-subtitle">Start Saving on Your Family's Grocery Shopping Today</div>
      </div>
    </div>
    <div style="margin: auto 0; space-y: 18px;">
      <h2 style="font-family: 'Outfit', sans-serif; font-size: 30px; font-weight: 900; color: #FFA439; line-height: 1.2;">
        Join Thousands of Smart Shoppers in Kerala.<br />
        <span style="color: #FFFFFF; font-size: 24px;">100% Free • No App Install Required</span>
      </h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 18px;">
        <div class="cover-card" style="background: rgba(255, 255, 255, 0.1);">
          <div style="font-size: 22px; font-weight: 900; color: #FFA439; margin-bottom: 6px;">1</div>
          <div style="font-size: 13.5px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px;">Search Groceries</div>
          <div style="font-size: 11px; color: #C8EEDB; line-height: 1.4;">Add your weekly staples and produce to your smart shopping basket.</div>
        </div>
        <div class="cover-card" style="background: rgba(255, 255, 255, 0.1);">
          <div style="font-size: 22px; font-weight: 900; color: #FFA439; margin-bottom: 6px;">2</div>
          <div style="font-size: 13.5px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px;">Compare & Save</div>
          <div style="font-size: 11px; color: #C8EEDB; line-height: 1.4;">Instantly see which nearby supermarket gives you the lowest total bill.</div>
        </div>
        <div class="cover-card" style="background: rgba(255, 255, 255, 0.1);">
          <div style="font-size: 22px; font-weight: 900; color: #FFA439; margin-bottom: 6px;">3</div>
          <div style="font-size: 13.5px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px;">Pre-Book & Pickup</div>
          <div style="font-size: 11px; color: #C8EEDB; line-height: 1.4;">Send your order directly to the store via WhatsApp for fast pickup or delivery.</div>
        </div>
      </div>
      <div style="background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 16px; padding: 16px; margin-top: 20px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-size: 14px; font-weight: 800; color: #FFFFFF;">Ready to compare grocery prices?</div>
          <div style="font-size: 11.5px; color: #9FD9C3;">Visit peediacart.in directly on your mobile browser.</div>
        </div>
        <div style="background: #FFA439; color: #14231A; font-weight: 900; font-size: 12.5px; padding: 9px 18px; border-radius: 30px; box-shadow: 0 4px 15px rgba(255, 164, 57, 0.4);">
          🌐 Visit: peediacart.in
        </div>
      </div>
    </div>
    <div class="cover-footer">
      <div>PeediaCart Technologies Private Limited • Kerala, India</div>
      <div>Website: peediacart.in • Support: support@peediacart.in</div>
    </div>
  </div>

</body>
</html>
  `;
}

async function renderPdfFromHtml(htmlContent, outputPath) {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'load' });
  await sleep(2500);

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();
  console.log(`🎉 PDF generated at: ${outputPath}`);
}

async function main() {
  try {
    const screenshots = await captureAllScreens();

    const logoPath = path.resolve(__dirname, '../../client/public/logo.png');
    const imgLogo = base64Image(logoPath);

    // 1. Generate Merchant Brochure PDF
    console.log('\n📄 Building Merchant Brochure PDF...');
    const merchantHtml = generateMerchantBrochureHtml(screenshots, imgLogo);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'merchant_brochure.html'), merchantHtml, 'utf8');
    await renderPdfFromHtml(merchantHtml, PDF_MERCHANT_PATH);

    // 2. Generate Consumer Brochure PDF
    console.log('\n📄 Building Consumer Brochure PDF...');
    const consumerHtml = generateConsumerBrochureHtml(screenshots, imgLogo);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'consumer_brochure.html'), consumerHtml, 'utf8');
    await renderPdfFromHtml(consumerHtml, PDF_CONSUMER_PATH);

    // 3. Keep combined official brochure as well
    fs.copyFileSync(PDF_MERCHANT_PATH, PDF_COMBINED_PATH);

    console.log('\n✅ ALL BROCHURES GENERATED SUCCESSFULLY!');
  } catch (err) {
    console.error('Fatal Brochure Generation Error:', err);
  }
}

main();
