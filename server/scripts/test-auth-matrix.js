// Comprehensive Auth & RBAC Security Verification Test
const http = require('http');

const API_BASE = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const url = `${API_BASE}/${cleanPath}`;
  const parsedUrl = new URL(url);
  return new Promise((resolve, reject) => {
    const req = http.request(parsedUrl, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, body: json });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('==============================================');
  console.log('    PriceTeller Auth & RBAC Security Tests    ');
  console.log('==============================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message, debugData) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`, debugData !== undefined ? JSON.stringify(debugData) : '');
      failed++;
    }
  }

  try {
    // 1. Unauthenticated direct access (Logged out)
    console.log('[Test Suite 1: Unauthenticated Direct Access]');
    const unauthAdminShops = await request('/admin/shops');
    assert(unauthAdminShops.status === 401, `GET /api/admin/shops rejected with 401 (got ${unauthAdminShops.status})`);

    const unauthAdminProds = await request('/admin/products');
    assert(unauthAdminProds.status === 401, `GET /api/admin/products rejected with 401 (got ${unauthAdminProds.status})`);

    const unauthMerchantPrices = await request('/merchant/prices', { method: 'PUT', body: { updates: [] } });
    assert(unauthMerchantPrices.status === 401, `PUT /api/merchant/prices rejected with 401 (got ${unauthMerchantPrices.status})`);

    const unauthAuthMe = await request('/auth/me');
    assert(unauthAuthMe.status === 401, `GET /api/auth/me rejected with 401 (got ${unauthAuthMe.status})`);

    // 2. Token Bypass / Backdoor tests
    console.log('\n[Test Suite 2: Backdoor & Tampered Token Immunity]');
    const backdoorToken = await request('/admin/shops', {
      headers: { 'Authorization': 'Bearer admin-token-secret-999' }
    });
    assert(backdoorToken.status === 401, `Legacy backdoor token rejected with 401 (got ${backdoorToken.status})`);

    const forgedToken = await request('/admin/shops', {
      headers: { 'Authorization': 'Bearer forged-fake-admin-token' }
    });
    assert(forgedToken.status === 401, `Arbitrary forged token rejected with 401 (got ${forgedToken.status})`);

    // 3. Consumer Authentication & Role Boundaries
    console.log('\n[Test Suite 3: Consumer Role Security Boundaries]');
    const timestamp = Date.now();
    const consumerReg = await request('/auth/consumer/register', {
      method: 'POST',
      body: {
        name: 'Test Security Consumer',
        email: `consumer_${timestamp}@priceteller-test.com`,
        password: 'password123'
      }
    });
    assert(consumerReg.status === 200 && consumerReg.body.token, 'Consumer registration successful');
    const consumerToken = consumerReg.body.token;

    const consumerMe = await request('/auth/me', {
      headers: { 'Authorization': `Bearer ${consumerToken}` }
    });
    assert(consumerMe.status === 200 && consumerMe.body.user && consumerMe.body.user.role === 'consumer', `GET /api/auth/me validates consumer session (role: ${consumerMe.body.user ? consumerMe.body.user.role : 'undefined'})`);

    const consumerAdminShops = await request('/admin/shops', {
      headers: { 'Authorization': `Bearer ${consumerToken}` }
    });
    assert(consumerAdminShops.status === 403, `Consumer denied access to GET /api/admin/shops (403 Forbidden, got ${consumerAdminShops.status})`);

    const consumerAdminProds = await request('/admin/products', {
      headers: { 'Authorization': `Bearer ${consumerToken}` }
    });
    assert(consumerAdminProds.status === 403, `Consumer denied access to GET /api/admin/products (403 Forbidden, got ${consumerAdminProds.status})`);

    const consumerMerchantPrices = await request('/merchant/prices', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${consumerToken}` },
      body: { updates: [] }
    });
    assert(consumerMerchantPrices.status === 403, `Consumer denied access to PUT /api/merchant/prices (403 Forbidden, got ${consumerMerchantPrices.status})`);

    // 4. Merchant Authentication & Role Boundaries
    console.log('\n[Test Suite 4: Merchant Role Security Boundaries]');
    const locRes = await request('/locations');
    const validLocId = locRes.body && locRes.body.data && locRes.body.data[0] ? locRes.body.data[0].id : (locRes.body[0] ? locRes.body[0].id : 'loc-1');

    const merchantReg = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Test Security Merchant',
        email: `merchant_${timestamp}@priceteller-test.com`,
        password: 'password123',
        shopName: `Security Shop ${timestamp}`,
        locationId: validLocId
      }
    });
    assert(merchantReg.status === 200 && merchantReg.body.token, 'Merchant registration successful', merchantReg.body);
    const merchantToken = merchantReg.body.token;
    const merchantShopId = merchantReg.body.user ? merchantReg.body.user.shopId : null;

    const merchantMe = await request('/auth/me', {
      headers: { 'Authorization': `Bearer ${merchantToken}` }
    });
    assert(merchantMe.status === 200 && merchantMe.body.user && merchantMe.body.user.role === 'merchant', `GET /api/auth/me validates merchant session (role: ${merchantMe.body.user ? merchantMe.body.user.role : 'undefined'})`, merchantMe.body);

    const merchantAdminShops = await request('/admin/shops', {
      headers: { 'Authorization': `Bearer ${merchantToken}` }
    });
    assert(merchantAdminShops.status === 403, `Merchant denied access to GET /api/admin/shops (403 Forbidden, got ${merchantAdminShops.status})`, merchantAdminShops.body);

    const merchantAdminProds = await request('/admin/products', {
      headers: { 'Authorization': `Bearer ${merchantToken}` }
    });
    assert(merchantAdminProds.status === 403, `Merchant denied access to GET /api/admin/products (403 Forbidden, got ${merchantAdminProds.status})`, merchantAdminProds.body);

    // Merchant updating price of a shop they DO NOT own
    const hijackPriceUpdate = await request('/merchant/prices', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${merchantToken}` },
      body: {
        shopName: 'Unowned Alien Shop',
        updates: [
          { productId: 'p1', price: 10 }
        ]
      }
    });
    assert(hijackPriceUpdate.status === 403, `Merchant prevented from updating prices of other shops (403 Forbidden, got ${hijackPriceUpdate.status})`, hijackPriceUpdate.body);

    // Merchant updating own shop price
    const ownShopIdentifier = merchantReg.body.user.shopName || merchantShopId;
    if (ownShopIdentifier) {
      const ownPriceUpdate = await request('/merchant/prices', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${merchantToken}` },
        body: {
          shopName: ownShopIdentifier,
          updates: [
            { productId: 'p1', price: 25.5 }
          ]
        }
      });
      assert(ownPriceUpdate.status === 200, `Merchant authorized to update own shop prices (200 OK, got ${ownPriceUpdate.status})`, ownPriceUpdate.body);
    }

    // 5. Admin Authentication & Role Authorization
    console.log('\n[Test Suite 5: Admin Role Access Authorization]');
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: {
        username: 'priceteller10',
        password: 'password123',
        expectedRole: 'admin'
      }
    });
    assert(adminLogin.status === 200 && adminLogin.body.token, 'Super Admin login successful', adminLogin.body);
    const adminToken = adminLogin.body.token;

    const adminMe = await request('/auth/me', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(adminMe.status === 200 && adminMe.body.user && adminMe.body.user.role === 'admin', `GET /api/auth/me validates admin session (role: ${adminMe.body.user ? adminMe.body.user.role : 'undefined'})`, adminMe.body);

    const adminShops = await request('/admin/shops', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(adminShops.status === 200 && Array.isArray(adminShops.body.data || adminShops.body), `Admin authorized for GET /api/admin/shops (200 OK)`);

    const adminProducts = await request('/admin/products', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(adminProducts.status === 200 && Array.isArray(adminProducts.body.data || adminProducts.body), `Admin authorized for GET /api/admin/products (200 OK)`);

    const adminStats = await request('/stats', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(adminStats.status === 200, `Admin authorized for GET /api/stats (200 OK)`);

    // 6. Logout / Session Invalidation
    console.log('\n[Test Suite 6: Session Invalidation on Logout]');
    const logoutRes = await request('/auth/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(logoutRes.status === 200, 'POST /api/auth/logout succeeds');

    const postLogoutAdminShops = await request('/admin/shops', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(postLogoutAdminShops.status === 401, `Revoked token rejected on /admin/shops (401 Unauthorized, got ${postLogoutAdminShops.status})`);

    // 7. Google Identity Services Backend Verification
    console.log('\n[Test Suite 7: Google Identity Services Token Verification]');
    const missingGoogleToken = await request('/auth/google', {
      method: 'POST',
      body: {}
    });
    assert(missingGoogleToken.status === 400, `POST /api/auth/google rejects missing token with 400 (got ${missingGoogleToken.status})`);

    const invalidGoogleToken = await request('/auth/google', {
      method: 'POST',
      body: { credential: 'invalid_malformed_token_123' }
    });
    assert(invalidGoogleToken.status === 401, `POST /api/auth/google rejects invalid token with 401 (got ${invalidGoogleToken.status})`);

    const forgedGoogleToken = await request('/auth/google', {
      method: 'POST',
      body: { credential: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMyJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJzdWIiOiIxMjM0NTYiLCJlbWFpbCI6ImF0dGFja2VyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlfQ.fake_signature' }
    });
    assert(forgedGoogleToken.status === 401, `POST /api/auth/google rejects forged token with invalid signature (401 Unauthorized, got ${forgedGoogleToken.status})`);

    // Clean up test shop and user
    if (merchantShopId) {
      const adminLoginAgain = await request('/auth/login', {
        method: 'POST',
        body: { username: 'priceteller10', password: 'password123', expectedRole: 'admin' }
      });
      if (adminLoginAgain.body && adminLoginAgain.body.token) {
        await request(`/admin/shops/${merchantShopId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminLoginAgain.body.token}` }
        });
      }
    }

    console.log('\n==============================================');
    console.log(`Results: ${passed} PASSED | ${failed} FAILED`);
    console.log('==============================================');
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
