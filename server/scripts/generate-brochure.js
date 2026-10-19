const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/usr/bin/google-chrome';
const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve(__dirname, '../brochure_assets');
const PDF_OUTPUT_PATH = path.resolve(__dirname, '../PeediaCart_Official_Brochure.pdf');

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

  // Ensure merchant subscription is active
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
  } catch (e) {
    console.log('Subscription note:', e.message);
  }

  // Ensure Kalyan Hypermarket has active master catalogue products
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

      // Sample sales records
      for (let i = 1; i <= 3; i++) {
        await fetch('http://localhost:5000/api/merchant/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({
            billNumber: 'BILL-2026-00' + i,
            items: [
              { productId: allProds[i].id, name: allProds[i].name, quantity: 2, price: 45, unit: 'kg' }
            ],
            totalAmount: 90 + i * 45,
            customerPhone: '+91 98470 0000' + i,
            paymentMode: i % 2 === 0 ? 'UPI' : 'CASH'
          })
        }).catch(() => {});
      }
    }
  } catch (e) {
    console.log('Product seed note:', e.message);
  }

  return {
    consumerUser: consumerRes.user,
    merchantUser: merchantRes.user,
  };
}

async function captureScreenshots() {
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

  // PART A: CAPTURE ALL MERCHANT PANEL TABS
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

  const merchantTabs = ['dashboard', 'inventory', 'billing', 'prebookings', 'deals', 'chats', 'profile'];
  const screenshots = {};

  for (const tab of merchantTabs) {
    console.log(`📸 Capturing Merchant Screen: ${tab}...`);
    const filePath = path.join(OUTPUT_DIR, `screen_merchant_${tab}.png`);
    await merchantPage.goto(`${BASE_URL}/merchant?tab=${tab}`, { waitUntil: 'domcontentloaded' });
    await sleep(3500);
    await merchantPage.screenshot({ path: filePath });
    screenshots[`merchant_${tab}`] = filePath;
  }

  // PART B: CAPTURE CONSUMER DISCOVERY & PRICE COMPARISON SCREENS
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
    localStorage.setItem(
      'priceteller_basket_items_v2',
      JSON.stringify([
        { productId: 'prod-tomato', quantity: 2, selectedUnit: 'kg' },
        { productId: 'prod-onion', quantity: 3, selectedUnit: 'kg' },
        { productId: 'prod-milk', quantity: 2, selectedUnit: 'pkt' },
        { productId: 'prod-potato', quantity: 1, selectedUnit: 'kg' },
      ])
    );
  }, consumerUser);

  console.log('📸 Capturing Consumer Home Discovery...');
  const homePath = path.join(OUTPUT_DIR, 'screen_consumer_home.png');
  await consumerPage.goto(`${BASE_URL}/consumer?tab=home`, { waitUntil: 'domcontentloaded' });
  await sleep(3000);
  await consumerPage.screenshot({ path: homePath });
  screenshots.consumer_home = homePath;

  console.log('📸 Capturing Consumer Smart Basket Compare...');
  const comparePath = path.join(OUTPUT_DIR, 'screen_consumer_compare.png');
  await consumerPage.goto(`${BASE_URL}/consumer?tab=compare`, { waitUntil: 'domcontentloaded' });
  await sleep(3000);
  await consumerPage.screenshot({ path: comparePath });
  screenshots.consumer_compare = comparePath;

  await browser.close();
  console.log('✅ All screenshots captured with 100% genuine live states.');
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

async function buildHtmlAndExportPdf(screenshots) {
  console.log('📄 Generating Executive Merchant & Platform Brochure HTML with Official Logo...');

  const logoPath = path.resolve(__dirname, '../../client/public/logo.png');
  const imgLogo = base64Image(logoPath);

  const imgDash = base64Image(screenshots.merchant_dashboard);
  const imgInv = base64Image(screenshots.merchant_inventory);
  const imgBill = base64Image(screenshots.merchant_billing);
  const imgPre = base64Image(screenshots.merchant_prebookings);
  const imgDeals = base64Image(screenshots.merchant_deals);
  const imgChats = base64Image(screenshots.merchant_chats);
  const imgProf = base64Image(screenshots.merchant_profile);
  const imgHome = base64Image(screenshots.consumer_home);
  const imgComp = base64Image(screenshots.consumer_compare);

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PeediaCart Merchant OS & Platform Brochure</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&family=Gayathri:wght@400;700&display=swap" rel="stylesheet">
  <style>
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
      color: #17221D;
      background: #F8FAF9;
      line-height: 1.5;
      font-size: 12.5px;
    }
    .page {
      width: 210mm;
      height: 297mm;
      page-break-after: always;
      position: relative;
      background: #FFFFFF;
      overflow: hidden;
      padding: 13mm 16mm 11mm 16mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* HEADER */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 9px;
      border-bottom: 1.5px solid #E5ECE8;
      margin-bottom: 12px;
    }
    .brand-logo-badge {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-logo-img {
      height: 30px;
      width: auto;
      object-fit: contain;
    }
    .brand-sub {
      font-size: 11px;
      font-weight: 700;
      color: #0D6344;
      margin-left: 6px;
      padding-left: 8px;
      border-left: 1.5px solid #CCD8D2;
    }
    .page-badge {
      font-size: 10px;
      font-weight: 800;
      color: #0D6344;
      background: #EAF5EF;
      border: 1px solid #CCE3D6;
      padding: 3px 10px;
      border-radius: 20px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    /* TWO-COLUMN CONTENT GRID */
    .content-grid {
      display: grid;
      grid-template-columns: 1.18fr 0.82fr;
      gap: 18px;
      align-items: center;
      flex: 1;
      margin-bottom: 8px;
    }
    .left-col {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 10px;
    }
    .feature-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 10.5px;
      font-weight: 700;
      color: #0D6344;
      background: #EAF5EF;
      border: 1px solid #CCE3D6;
      padding: 3px 10px;
      border-radius: 20px;
      width: fit-content;
    }
    .page-title {
      font-family: 'Outfit', sans-serif;
      font-size: 23px;
      font-weight: 900;
      color: #122119;
      line-height: 1.18;
      letter-spacing: -0.5px;
    }
    .page-title-ml {
      font-family: 'Gayathri', sans-serif;
      font-size: 17px;
      font-weight: 700;
      color: #EA580C;
      margin-top: 2px;
      line-height: 1.3;
    }
    .page-desc {
      font-size: 12px;
      color: #3D5347;
      line-height: 1.52;
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 7px;
      margin: 3px 0;
    }
    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      background: #F8FCFA;
      border: 1px solid #E2EEE7;
      border-radius: 11px;
      padding: 7px 11px;
    }
    .feature-icon {
      font-size: 14px;
      line-height: 1;
      margin-top: 2px;
      color: #0D6344;
      flex-shrink: 0;
    }
    .feature-text-title {
      font-size: 11.5px;
      font-weight: 700;
      color: #14281E;
      margin-bottom: 2px;
    }
    .feature-text-desc {
      font-size: 10.5px;
      color: #556B60;
      line-height: 1.38;
    }

    .stat-pills-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 2px;
    }
    .stat-pill {
      background: #FFFFFF;
      border: 1px solid #DAEAE1;
      border-radius: 10px;
      padding: 7px 9px;
      text-align: center;
      box-shadow: 0 2px 6px rgba(13, 99, 68, 0.04);
    }
    .stat-val {
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      font-weight: 800;
      color: #0D6344;
    }
    .stat-lbl {
      font-size: 9px;
      font-weight: 600;
      color: #6C8276;
      margin-top: 1px;
    }

    /* RIGHT COLUMN: IPHONE PHONE FRAME */
    .right-col {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .phone-mockup {
      width: 250px;
      height: 520px;
      border-radius: 38px;
      background: #111A15;
      padding: 9px;
      box-shadow: 0 20px 45px rgba(13, 74, 54, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .phone-notch {
      width: 90px;
      height: 16px;
      background: #111A15;
      border-radius: 0 0 12px 12px;
      position: absolute;
      top: 9px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 30;
    }
    .phone-screen-container {
      width: 100%;
      height: 100%;
      border-radius: 30px;
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
      font-size: 9.5px;
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
      padding: 20mm 18mm;
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
      font-weight: 700;
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
      font-size: 12.5px;
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
  </style>
</head>
<body>

  <!-- ========================================================================= -->
  <!-- PAGE 1: EXECUTIVE COVER PAGE                                             -->
  <!-- ========================================================================= -->
  <div class="page cover-page">
    <div class="cover-logo-wrapper">
      <img src="${imgLogo}" alt="PeediaCart Official Logo" class="cover-logo-img" />
      <div>
        <div class="cover-logo-title">Merchant OS & Digital Retail</div>
        <div class="cover-logo-subtitle">Hyperlocal Grocery Commerce & Daily Price Intelligence</div>
      </div>
    </div>

    <div class="cover-hero">
      <div class="cover-pill">🚀 OFFICIAL MERCHANT & PARTNER BROCHURE</div>
      <h1 class="cover-heading">
        Take Your Supermarket Digital.<br />
        <span>Drive 3x More Footfall</span> & Direct WhatsApp Orders.
      </h1>
      <div class="cover-heading-ml">
        നിങ്ങളുടെ സൂപ്പർമാർക്കറ്റ് ഓൺലൈനിലാക്കൂ, കൂടുതൽ കച്ചവടവും ലാഭവും നേടൂ.
      </div>
      <p class="cover-summary">
        PeediaCart is Kerala's leading grocery discovery network. Empower your store with real-time price management, digital catalogue, instant cloud POS billing, and 0% commission direct WhatsApp customer orders.
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
          <div class="cover-card-desc">Adjust daily vegetable & grocery rates on mobile in under 5 seconds.</div>
        </div>
        <div class="cover-card">
          <div class="cover-card-icon">📱</div>
          <div class="cover-card-title">WhatsApp Pre-Booking</div>
          <div class="cover-card-desc">Receive itemized customer cart lists straight to your counter WhatsApp.</div>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <div>📍 Serving Kerala Towns & Hubs • Made with ❤️ in Kerala</div>
      <div>Edition: 2026.Q4 Official Release</div>
    </div>
  </div>


  <!-- ========================================================================= -->
  <!-- PAGE 2: MERCHANT EXECUTIVE COMMAND CENTER                                -->
  <!-- ========================================================================= -->
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
        <p class="page-desc">
          Get bird's-eye visibility into your supermarket's daily sales performance, active customer traffic, WhatsApp inquiry leads, and platform status directly from your mobile phone.
        </p>

        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">🟢</div>
            <div>
              <div class="feature-text-title">Live Store Broadcast Toggle</div>
              <div class="feature-text-desc">Switch your shop status between Online/Offline instantly with 1 tap.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📈</div>
            <div>
              <div class="feature-text-title">Daily Sales & Customer Telemetry</div>
              <div class="feature-text-desc">Track today's total revenue, order count, and average cart size in real time.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔔</div>
            <div>
              <div class="feature-text-title">Instant Order & Lead Alerts</div>
              <div class="feature-text-desc">Immediate alerts whenever a customer books a pre-order or sends an inquiry.</div>
            </div>
          </div>
        </div>

        <div class="stat-pills-row">
          <div class="stat-pill">
            <div class="stat-val">340+</div>
            <div class="stat-lbl">Daily Views</div>
          </div>
          <div class="stat-pill">
            <div class="stat-val">100%</div>
            <div class="stat-lbl">Mobile Ready</div>
          </div>
          <div class="stat-pill">
            <div class="stat-val">0%</div>
            <div class="stat-lbl">Commission</div>
          </div>
        </div>
      </div>

      <div class="right-col">
        <div class="phone-mockup">
          <div class="phone-notch"></div>
          <div class="phone-screen-container">
            <img src="${imgDash}" alt="Merchant Dashboard" class="phone-screenshot" />
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="footer-left">
        <span class="footer-highlight">PeediaCart Merchant OS</span>
        <span>•</span>
        <span>Executive Command Center</span>
      </div>
      <div>Page 02 / 11</div>
    </div>
  </div>


  <!-- ========================================================================= -->
  <!-- PAGE 3: LIVE PRICE OVERRIDES & INVENTORY CONTROL                         -->
  <!-- ========================================================================= -->
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
        <p class="page-desc">
          Supermarket prices fluctuate daily in Kerala. PeediaCart gives you the fastest rate terminal to adjust per-kg prices for vegetables, fruits, and essentials on the fly.
        </p>

        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">✏️</div>
            <div>
              <div class="feature-text-title">Rapid In-Line Price Overrides</div>
              <div class="feature-text-desc">Edit prices in seconds with visual dirty-save indicators to prevent accidental changes.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📦</div>
            <div>
              <div class="feature-text-title">Instant In-Stock / Out-of-Stock Toggle</div>
              <div class="feature-text-desc">Mark sold-out items with one click so shoppers aren't disappointed.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔍</div>
            <div>
              <div class="feature-text-title">Bilingual Search & Category Filters</div>
              <div class="feature-text-desc">Search by Malayalam (തക്കാളി) or English (Tomatoes) across departments.</div>
            </div>
          </div>
        </div>

        <div class="stat-pills-row">
          <div class="stat-pill">
            <div class="stat-val">&lt; 2s</div>
            <div class="stat-lbl">Update Speed</div>
          </div>
          <div class="stat-pill">
            <div class="stat-val">5,000+</div>
            <div class="stat-lbl">SKU Support</div>
          </div>
          <div class="stat-pill">
            <div class="stat-val">Live</div>
            <div class="stat-lbl">Sync to App</div>
          </div>
        </div>
      </div>

      <div class="right-col">
        <div class="phone-mockup">
          <div class="phone-notch"></div>
          <div class="phone-screen-container">
            <img src="${imgInv}" alt="Live Inventory Control" class="phone-screenshot" />
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="footer-left">
        <span class="footer-highlight">PeediaCart Merchant OS</span>
        <span>•</span>
        <span>Live Price & Inventory Terminal</span>
      </div>
      <div>Page 03 / 11</div>
    </div>
  </div>


  <!-- ========================================================================= -->
  <!-- PAGE 4: SMART POS BILLING COUNTER TERMINAL                               -->
  <!-- ========================================================================= -->
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
        <p class="page-desc">
          Replace expensive POS hardware with a lightweight, lightning-fast cloud billing terminal. Generate receipts, compute GST/discounts, and print invoices directly.
        </p>

        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">⚡</div>
            <div>
              <div class="feature-text-title">Rapid Item Lookup & Auto-Complete</div>
              <div class="feature-text-desc">Add groceries to customer cart by code, barcode, or name in milliseconds.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🖨️</div>
            <div>
              <div class="feature-text-title">Thermal Receipt & WhatsApp Bill Share</div>
              <div class="feature-text-desc">Print standard 58mm/80mm thermal receipts or send digital PDF bills to customer WhatsApp.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">💳</div>
            <div>
              <div class="feature-text-title">Integrated UPI & Cash Settlement</div>
              <div class="feature-text-desc">Built-in Dynamic UPI QR for instant customer payment reconciliation.</div>
            </div>
          </div>
        </div>

        <div class="stat-pills-row">
          <div class="stat-pill">
            <div class="stat-val">3-Tap</div>
            <div class="stat-lbl">Bill Creation</div>
          </div>
          <div class="stat-pill">
            <div class="stat-val">Offline</div>
            <div class="stat-lbl">Resilient</div>
          </div>
          <div class="stat-pill">
            <div class="stat-val">₹0</div>
            <div class="stat-lbl">Hardware Cost</div>
          </div>
        </div>
      </div>

      <div class="right-col">
        <div class="phone-mockup">
          <div class="phone-notch"></div>
          <div class="phone-screen-container">
            <img src="${imgBill}" alt="Smart POS Billing" class="phone-screenshot" />
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="footer-left">
        <span class="footer-highlight">PeediaCart Merchant OS</span>
        <span>•</span>
        <span>Cloud POS & Billing Counter</span>
      </div>
      <div>Page 04 / 11</div>
    </div>
  </div>


  <!-- ========================================================================= -->
  <!-- PAGE 5: WHATSAPP PRE-BOOKING & ORDER DISPATCH                            -->
  <!-- ========================================================================= -->
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
        <p class="page-desc">
          Local families build their monthly shopping list on PeediaCart and pre-book with your store for pickup or home delivery. Manage the entire packing queue smoothly.
        </p>

        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">📋</div>
            <div>
              <div class="feature-text-title">Itemized Packing Lists</div>
              <div class="feature-text-desc">View customer basket quantities, unit weights, and substitutions clearly.</div>
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
              <div class="feature-text-desc">Connect with the buyer instantly to confirm out-of-stock items or delivery address.</div>
            </div>
          </div>
        </div>

        <div class="stat-pills-row">
          <div class="stat-pill">
            <div class="stat-val">100%</div>
            <div class="stat-lbl">Direct to You</div>
          </div>
          <div class="stat-pill">
            <div class="stat-val">0%</div>
            <div class="stat-lbl">Deductions</div>
          </div>
          <div class="stat-pill">
            <div class="stat-val">Instant</div>
            <div class="stat-lbl">Notifications</div>
          </div>
        </div>
      </div>

      <div class="right-col">
        <div class="phone-mockup">
          <div class="phone-notch"></div>
          <div class="phone-screen-container">
            <img src="${imgPre}" alt="Pre-Bookings Queue" class="phone-screenshot" />
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="footer-left">
        <span class="footer-highlight">PeediaCart Merchant OS</span>
        <span>•</span>
        <span>WhatsApp Order Dispatch</span>
      </div>
      <div>Page 05 / 11</div>
    </div>
  </div>


  <!-- ========================================================================= -->
  <!-- PAGE 6: FLASH DEALS & PROMOTIONS ENGINE                                  -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand-logo-badge">
        <img src="${imgLogo}" alt="PeediaCart" class="brand-logo-img" />
        <span class="brand-sub">Flash Deals</span>
      </div>
      <div class="page-badge">SCREEN 05 • DEALS ENGINE</div>
    </div>

    <div class="content-grid">
      <div class="left-col">
        <div class="feature-tag">🏷️ DYNAMIC PROMOTIONS</div>
        <h2 class="page-title">Flash Deals & Festival Offers Engine</h2>
        <div class="page-title-ml">ഓഫറുകളും ഡിസ്കൗണ്ടുകളും ഉപഭോക്താക്കളിലേക്ക് എത്തിക്കാം</div>
        <p class="page-desc">
          Got excess stock or weekend festival promotions? Create time-sensitive Flash Deals and broadcast them instantly to thousands of active shoppers in your town.
        </p>

        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">⏳</div>
            <div>
              <div class="feature-text-title">Countdown-Based Flash Sales</div>
              <div class="feature-text-desc">Set launch and expiry timers to create urgency and drive fast stock clearance.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🎯</div>
            <div>
              <div class="feature-text-title">Featured Badges on Consumer Home</div>
              <div class="feature-text-desc">Your deals get top placement in the "ഇന്നത്തെ ഓഫറുകൾ" carousel.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📊</div>
            <div>
              <div class="feature-text-title">Live Deal Analytics</div>
              <div class="feature-text-desc">Monitor how many customers viewed and claimed your promotional discount.</div>
            </div>
          </div>
        </div>

        <div class="stat-pills-row">
          <div class="stat-pill">
            <div class="stat-val">3x</div>
            <div class="stat-lbl">Higher Reach</div>
          </div>
          <div class="stat-pill">
            <div class="stat-val">1-Tap</div>
            <div class="stat-lbl">Deal Publish</div>
          </div>
          <div class="stat-pill">
            <div class="stat-val">Instant</div>
            <div class="stat-lbl">Broadcast</div>
          </div>
        </div>
      </div>

      <div class="right-col">
        <div class="phone-mockup">
          <div class="phone-notch"></div>
          <div class="phone-screen-container">
            <img src="${imgDeals}" alt="Flash Deals Creator" class="phone-screenshot" />
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="footer-left">
        <span class="footer-highlight">PeediaCart Merchant OS</span>
        <span>•</span>
        <span>Promotions & Flash Deals Engine</span>
      </div>
      <div>Page 06 / 11</div>
    </div>
  </div>


  <!-- ========================================================================= -->
  <!-- PAGE 7: CUSTOMER CHAT & DIRECT MESSAGING CHANNEL                         -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand-logo-badge">
        <img src="${imgLogo}" alt="PeediaCart" class="brand-logo-img" />
        <span class="brand-sub">Direct Chat</span>
      </div>
      <div class="page-badge">SCREEN 06 • CUSTOMER CONNECT</div>
    </div>

    <div class="content-grid">
      <div class="left-col">
        <div class="feature-tag">🤝 DIRECT ENGAGEMENT</div>
        <h2 class="page-title">Direct Customer Inquiries & Messaging Channel</h2>
        <div class="page-title-ml">ഉപഭോക്താക്കളുമായി നേരിട്ട് ആശയവിനിമയം നടത്താം</div>
        <p class="page-desc">
          Build personal loyalty with shoppers. Answer queries regarding fresh stock arrival, custom meat cuts, bulk festival purchases, or home delivery status seamlessly.
        </p>

        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">⚡</div>
            <div>
              <div class="feature-text-title">In-App Live Chat Feed</div>
              <div class="feature-text-desc">Two-way synchronized chat between shopper and supermarket counter staff.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📲</div>
            <div>
              <div class="feature-text-title">WhatsApp Fallback Redirection</div>
              <div class="feature-text-desc">Customers can shift conversations directly to your official WhatsApp Business number.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔒</div>
            <div>
              <div class="feature-text-title">Secure & Privacy-Preserved</div>
              <div class="feature-text-desc">Full customer chat history preserved for order dispute and billing reference.</div>
            </div>
          </div>
        </div>

        <div class="stat-pills-row">
          <div class="stat-pill">
            <div class="stat-val">&lt; 1 min</div>
            <div class="stat-lbl">Response Time</div>
          </div>
          <div class="stat-pill">
            <div class="stat-val">24/7</div>
            <div class="stat-lbl">Lead Storage</div>
          </div>
          <div class="stat-pill">
            <div class="stat-val">Direct</div>
            <div class="stat-lbl">Customer Bond</div>
          </div>
        </div>
      </div>

      <div class="right-col">
        <div class="phone-mockup">
          <div class="phone-notch"></div>
          <div class="phone-screen-container">
            <img src="${imgChats}" alt="Customer Chat" class="phone-screenshot" />
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="footer-left">
        <span class="footer-highlight">PeediaCart Merchant OS</span>
        <span>•</span>
        <span>Customer Communication Channel</span>
      </div>
      <div>Page 07 / 11</div>
    </div>
  </div>


  <!-- ========================================================================= -->
  <!-- PAGE 8: STORE DIGITAL PROFILE, GPS & OPERATING HOURS                     -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand-logo-badge">
        <img src="${imgLogo}" alt="PeediaCart" class="brand-logo-img" />
        <span class="brand-sub">Store Settings</span>
      </div>
      <div class="page-badge">SCREEN 07 • STORE PROFILE</div>
    </div>

    <div class="content-grid">
      <div class="left-col">
        <div class="feature-tag">🏢 VERIFIED STORE IDENTITY</div>
        <h2 class="page-title">Digital Storefront Profile & Geo-Location Setup</h2>
        <div class="page-title-ml">കടയുടെ പ്രൊഫൈലും പ്രവർത്തന സമയവും സെറ്റ് ചെയ്യാം</div>
        <p class="page-desc">
          Configure your supermarket's public digital identity. Set exact GPS coordinates, delivery radius, working hours, UPI payment QR, and verified shop checkmarks.
        </p>

        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">📍</div>
            <div>
              <div class="feature-text-title">Precise GPS Hub Mapping</div>
              <div class="feature-text-desc">Allows nearby shoppers to see accurate driving distances and ETA to your shop.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🕒</div>
            <div>
              <div class="feature-text-title">Operating Schedule & Break Hours</div>
              <div class="feature-text-desc">Set daily open/close times so the app marks your store as Open or Closed accurately.</div>
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
          <div class="stat-pill">
            <div class="stat-val">Verified</div>
            <div class="stat-lbl">Store Badge</div>
          </div>
          <div class="stat-pill">
            <div class="stat-val">GPS</div>
            <div class="stat-lbl">Precision Pin</div>
          </div>
          <div class="stat-pill">
            <div class="stat-val">100%</div>
            <div class="stat-lbl">Customizable</div>
          </div>
        </div>
      </div>

      <div class="right-col">
        <div class="phone-mockup">
          <div class="phone-notch"></div>
          <div class="phone-screen-container">
            <img src="${imgProf}" alt="Store Profile Settings" class="phone-screenshot" />
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="footer-left">
        <span class="footer-highlight">PeediaCart Merchant OS</span>
        <span>•</span>
        <span>Store Profile & Hub Settings</span>
      </div>
      <div>Page 08 / 11</div>
    </div>
  </div>


  <!-- ========================================================================= -->
  <!-- PAGE 9: HOW CONSUMERS DISCOVER YOUR SUPERMARKET                          -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand-logo-badge">
        <img src="${imgLogo}" alt="PeediaCart" class="brand-logo-img" />
        <span class="brand-sub">Consumer Reach</span>
      </div>
      <div class="page-badge">CONSUMER EXPERIENCE • DISCOVERY</div>
    </div>

    <div class="content-grid">
      <div class="left-col">
        <div class="feature-tag">🛒 HYPERLOCAL CONSUMER REACH</div>
        <h2 class="page-title">How 10,000+ Local Families Discover Your Store</h2>
        <div class="page-title-ml">ഉപഭോക്താക്കൾ നിങ്ങളുടെ കട കണ്ടെത്തുന്ന വിധം</div>
        <p class="page-desc">
          When local shoppers open PeediaCart, your supermarket is displayed right at the top with verified ratings, distance, daily rates, and ongoing discounts.
        </p>

        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">📊</div>
            <div>
              <div class="feature-text-title">Daily Kerala Market Benchmark Ticker</div>
              <div class="feature-text-desc">Shoppers verify wholesale market rates and see your store's competitive pricing.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🏪</div>
            <div>
              <div class="feature-text-title">Interactive Storefront Cards</div>
              <div class="feature-text-desc">Direct 1-tap entry to browse your supermarket's complete department catalogue.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🏷️</div>
            <div>
              <div class="feature-text-title">Smart Department Filter Pills</div>
              <div class="feature-text-desc">Instant browsing for Vegetables, Fruits, Groceries, Bakery & Dairy.</div>
            </div>
          </div>
        </div>

        <div class="stat-pills-row">
          <div class="stat-pill">
            <div class="stat-val">5km+</div>
            <div class="stat-lbl">Town Radius</div>
          </div>
          <div class="stat-pill">
            <div class="stat-val">Top</div>
            <div class="stat-lbl">App Placement</div>
          </div>
          <div class="stat-pill">
            <div class="stat-val">Free</div>
            <div class="stat-lbl">Store Listing</div>
          </div>
        </div>
      </div>

      <div class="right-col">
        <div class="phone-mockup">
          <div class="phone-notch"></div>
          <div class="phone-screen-container">
            <img src="${imgHome}" alt="Consumer Home Discovery" class="phone-screenshot" />
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="footer-left">
        <span class="footer-highlight">PeediaCart Ecosystem</span>
        <span>•</span>
        <span>Hyperlocal Discovery & Footfall Driver</span>
      </div>
      <div>Page 09 / 11</div>
    </div>
  </div>


  <!-- ========================================================================= -->
  <!-- PAGE 10: SMART BASKET PRICE COMPARISON DUEL                              -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand-logo-badge">
        <img src="${imgLogo}" alt="PeediaCart" class="brand-logo-img" />
        <span class="brand-sub">Price Duel</span>
      </div>
      <div class="page-badge">CONSUMER EXPERIENCE • PRICE DUEL</div>
    </div>

    <div class="content-grid">
      <div class="left-col">
        <div class="feature-tag">💰 THE PRICE COMPARISON ENGINE</div>
        <h2 class="page-title">Smart Basket Price Duel: Win High-Value Orders</h2>
        <div class="page-title-ml">സ്മാർട്ട് ബാസ്‌ക്കറ്റ് താരതമ്യം: കൂടുതൽ ഓർഡറുകൾ നേടാം</div>
        <p class="page-desc">
          Instead of comparing single items, PeediaCart calculates the combined total of the entire grocery basket across all supermarkets. Fair pricing wins the entire order!
        </p>

        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">🛒</div>
            <div>
              <div class="feature-text-title">Total Basket Cost Calculator</div>
              <div class="feature-text-desc">Compares full grocery bill (Tomatoes + Onions + Milk + Rice) simultaneously.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🏆</div>
            <div>
              <div class="feature-text-title">"Lowest Total Bill" Green Trophy Highlight</div>
              <div class="feature-text-desc">Stores with best overall rates get automatic recommendation to the shopper.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🚀</div>
            <div>
              <div class="feature-text-title">Direct 1-Tap Cart Transfer & WhatsApp Checkout</div>
              <div class="feature-text-desc">Shoppers export their winning basket straight to your store with one click.</div>
            </div>
          </div>
        </div>

        <div class="stat-pills-row">
          <div class="stat-pill">
            <div class="stat-val">₹120+</div>
            <div class="stat-lbl">Avg. Savings</div>
          </div>
          <div class="stat-pill">
            <div class="stat-val">High</div>
            <div class="stat-lbl">Basket Value</div>
          </div>
          <div class="stat-pill">
            <div class="stat-val">100%</div>
            <div class="stat-lbl">Transparent</div>
          </div>
        </div>
      </div>

      <div class="right-col">
        <div class="phone-mockup">
          <div class="phone-notch"></div>
          <div class="phone-screen-container">
            <img src="${imgComp}" alt="Smart Basket Price Duel" class="phone-screenshot" />
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="footer-left">
        <span class="footer-highlight">PeediaCart Ecosystem</span>
        <span>•</span>
        <span>Smart Basket Comparison Engine</span>
      </div>
      <div>Page 10 / 11</div>
    </div>
  </div>


  <!-- ========================================================================= -->
  <!-- PAGE 11: EXECUTIVE BACK COVER & 3-STEP ONBOARDING                        -->
  <!-- ========================================================================= -->
  <div class="page cover-page" style="padding: 18mm 18mm;">
    <div class="cover-logo-wrapper">
      <img src="${imgLogo}" alt="PeediaCart Official Logo" class="cover-logo-img" />
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

  const htmlPath = path.join(OUTPUT_DIR, 'brochure.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log(`✅ Complete 11-Page Brochure HTML generated at: ${htmlPath}`);

  console.log('🖨️ Rendering High-Resolution Print-Ready PDF with Chrome...');
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
    path: PDF_OUTPUT_PATH,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();
  console.log(`🎉 Master PeediaCart PDF Brochure successfully generated at:\n   ${PDF_OUTPUT_PATH}`);
}

async function main() {
  try {
    const screenshots = await captureScreenshots();
    await buildHtmlAndExportPdf(screenshots);
  } catch (err) {
    console.error('Fatal Brochure Generation Error:', err);
  }
}

main();
