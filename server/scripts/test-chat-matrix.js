const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
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

async function runChatAuditTests() {
  console.log('🧪 Starting Customer ↔ Merchant Chat Security & Integrity Matrix...\n');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  }

  try {
    // 1. Setup 2 Customers and 2 Merchants
    console.log('1. Setting up Test Users...');
    const ts = Date.now();
    const c1Res = await request('/auth/consumer/register', {
      method: 'POST',
      body: { email: `alice_${ts}@test.local`, name: 'Alice Customer', password: 'password123', locationId: 'tirur' },
    });
    const c1Token = c1Res.body.token;
    const c1User = c1Res.body.user;

    const c2Res = await request('/auth/consumer/register', {
      method: 'POST',
      body: { email: `bob_${ts}@test.local`, name: 'Bob Customer', password: 'password123', locationId: 'tirur' },
    });
    const c2Token = c2Res.body.token;
    const c2User = c2Res.body.user;

    const m1Res = await request('/auth/register', {
      method: 'POST',
      body: { email: `merchant_iqwan_${ts}@test.local`, name: 'Iqwan Manager', password: 'password123', shopName: 'Iqwan Supermarket', locationId: 'tirur' },
    });
    const m1Token = m1Res.body.token;

    const m2Res = await request('/auth/register', {
      method: 'POST',
      body: { email: `merchant_other_${ts}@test.local`, name: 'Other Manager', password: 'password123', shopName: 'Fresh Mart', locationId: 'tirur' },
    });
    const m2Token = m2Res.body.token;

    assert(c1Token && c2Token && m1Token && m2Token, 'Successfully created Customer 1, Customer 2, Merchant 1, Merchant 2 accounts');

    // 2. Unauthenticated access blocked
    console.log('\n2. Testing Authentication Enforcement...');
    const unauthGet = await request('/conversations');
    assert(unauthGet.status === 401, 'Unauthenticated GET /conversations is rejected with 401');

    const unauthPost = await request('/conversations', {
      method: 'POST',
      body: { shopId: 'iqwan-supermarket', shopName: 'Iqwan Supermarket' },
    });
    assert(unauthPost.status === 401, 'Unauthenticated POST /conversations is rejected with 401');

    // 3. Customer 1 initiates conversation with Iqwan Supermarket
    console.log('\n3. Testing Conversation Creation & Storage in DB...');
    const createConvRes = await request('/conversations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${c1Token}` },
      body: {
        shopId: 'iqwan-supermarket',
        shopName: 'Iqwan Supermarket',
        initialMessage: 'Hello Iqwan, is fresh milk in stock?',
        basketSnapshot: {
          items: [{ productId: 'p1', productName: 'Fresh Milk', quantity: 2, unit: 'L', lineTotal: 120, emoji: '🥛' }],
          itemCount: 1,
          totalQuantity: 2,
          estimatedTotal: 120,
          shopName: 'Iqwan Supermarket',
          createdAt: new Date().toISOString(),
        },
      },
    });

    assert(createConvRes.status === 200 && createConvRes.body.success, 'Customer 1 creates conversation successfully');
    const conv1 = createConvRes.body.data;
    assert(conv1 && conv1.id && conv1.consumerId === c1User.id, 'Conversation consumerId strictly set to authenticated Customer 1 user id');

    // 4. Conversation Ownership & Access Isolation
    console.log('\n4. Testing Conversation Access Authorization & Boundary Checks...');
    
    // Customer 1 listing conversations -> sees conv1
    const c1List = await request('/conversations', { headers: { Authorization: `Bearer ${c1Token}` } });
    assert(c1List.body.data.some((c) => c.id === conv1.id), 'Customer 1 can see own conversation in list');

    // Customer 2 listing conversations -> does NOT see conv1
    const c2List = await request('/conversations', { headers: { Authorization: `Bearer ${c2Token}` } });
    assert(!c2List.body.data.some((c) => c.id === conv1.id), 'Customer 2 CANNOT see Customer 1 conversation in list');

    // Customer 2 attempts direct access to Customer 1 conversation messages -> 403 Forbidden
    const c2AccessMessages = await request(`/conversations/${conv1.id}/messages`, {
      headers: { Authorization: `Bearer ${c2Token}` },
    });
    assert(c2AccessMessages.status === 403, 'Customer 2 direct GET /conversations/:id/messages blocked with 403 Forbidden');

    // Customer 2 attempts to post message to Customer 1 conversation -> 403 Forbidden
    const c2PostMessage = await request(`/conversations/${conv1.id}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${c2Token}` },
      body: { text: 'I am Bob trying to hijack this chat' },
    });
    assert(c2PostMessage.status === 403, 'Customer 2 direct POST /conversations/:id/messages blocked with 403 Forbidden');

    // Merchant 2 (Fresh Mart) attempts to access Iqwan conversation -> 403 Forbidden
    const m2AccessConv = await request(`/conversations/${conv1.id}/messages`, {
      headers: { Authorization: `Bearer ${m2Token}` },
    });
    assert(m2AccessConv.status === 403, 'Other Merchant (Fresh Mart) direct access to Iqwan conversation blocked with 403 Forbidden');

    // Merchant 1 (Iqwan Supermarket) access Iqwan conversation -> 200 OK
    const m1AccessConv = await request(`/conversations/${conv1.id}/messages`, {
      headers: { Authorization: `Bearer ${m1Token}` },
    });
    assert(m1AccessConv.status === 200, 'Legitimate Shop Merchant (Iqwan Supermarket) can access conversation messages');

    // 5. Read / Unread Status Tracking
    console.log('\n5. Testing Unread Count & Read Status Flow...');
    const m1ListBefore = await request('/conversations', { headers: { Authorization: `Bearer ${m1Token}` } });
    const convForM1 = m1ListBefore.body.data.find((c) => c.id === conv1.id);
    assert(convForM1 && convForM1.unreadCount >= 1, `Merchant correctly sees ${convForM1?.unreadCount} unread message(s) from customer`);

    // Merchant marks conversation as read
    const markReadRes = await request(`/conversations/${conv1.id}/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${m1Token}` },
    });
    assert(markReadRes.status === 200 && markReadRes.body.success, 'Merchant marks conversation as read');

    const m1ListAfter = await request('/conversations', { headers: { Authorization: `Bearer ${m1Token}` } });
    const convForM1After = m1ListAfter.body.data.find((c) => c.id === conv1.id);
    assert(convForM1After && convForM1After.unreadCount === 0, 'Merchant unread count reset to 0 after reading');

    // 6. Duplicate Send Prevention & Idempotency
    console.log('\n6. Testing Duplicate Send Prevention (Idempotency with clientMsgId)...');
    const clientMsgId = `cmsg-test-${Date.now()}`;
    const send1 = await request(`/conversations/${conv1.id}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${m1Token}` },
      body: { text: 'Yes, fresh milk is in stock and chilled!', clientMsgId },
    });
    assert(send1.status === 200 && send1.body.success, 'Merchant sends reply with clientMsgId');

    const sendDuplicate = await request(`/conversations/${conv1.id}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${m1Token}` },
      body: { text: 'Yes, fresh milk is in stock and chilled!', clientMsgId },
    });
    assert(sendDuplicate.status === 200 && sendDuplicate.body.data.id === send1.body.data.id, 'Duplicate send with same clientMsgId returns existing message and prevents duplicate DB rows');

    // 7. Full History Reconnect / Refresh Check
    console.log('\n7. Testing History Loading on Refresh / Reconnect...');
    const c1History = await request(`/conversations/${conv1.id}/messages`, {
      headers: { Authorization: `Bearer ${c1Token}` },
    });
    assert(
      c1History.status === 200 &&
      c1History.body.data.length === 2 &&
      c1History.body.data[0].text.includes('milk') &&
      c1History.body.data[1].text.includes('chilled'),
      'Customer receives full chronological 2-way message history'
    );

    console.log(`\n========================================`);
    console.log(`🎉 CHAT AUDIT SUMMARY: ${passed}/${total} assertions passed!`);
    console.log(`========================================\n`);

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runChatAuditTests();
