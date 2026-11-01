import { beforeAll, describe, expect, it } from 'vitest';
import { query } from '../src/db/pool';
import { api, bearer, createShop, createUser, loginToken, resetDb } from './helpers/app';

describe('cross-merchant data access', () => {
  const t: Record<string, string> = {};
  let consumerId: string;

  beforeAll(async () => {
    await resetDb();
    await createShop('shop-a', 'Alpha Store');
    await createShop('shop-b', 'Beta Store');
    await createShop('shop-x', 'Spoof Store');
    consumerId = await createUser({ role: 'consumer', email: 'c@example.test', password: 'Consumer-pw-1' });
    const merchantB = await createUser({ role: 'merchant', email: 'b@example.test', password: 'Merchant-pw-B', shopId: 'shop-b', shopName: 'Beta Store' });
    await createUser({ role: 'merchant', email: 'a@example.test', password: 'Merchant-pw-A', shopId: 'shop-a', shopName: 'Alpha Store' });
    // A merchant whose stored shop name collides with Beta Store but whose shop ID differs.
    await createUser({ role: 'merchant', email: 'x@example.test', password: 'Merchant-pw-X', shopId: 'shop-x', shopName: 'Beta Store' });

    await query(`INSERT INTO conversations (id, consumer_id, consumer_name, shop_id, shop_name) VALUES ('conv-b', $1, 'C', 'shop-b', 'Beta Store')`, [consumerId]);
    await query(`INSERT INTO pre_bookings (id, consumer_id, consumer_name, shop_id, shop_name) VALUES ('pb-b', $1, 'C', 'shop-b', 'Beta Store')`, [consumerId]);
    await query(`INSERT INTO merchant_sales (id, merchant_id, shop_id, shop_name, bill_number) VALUES ('sale-b', $1, 'shop-b', 'Beta Store', 'B-1')`, [merchantB]);
    const cat = (await query(`SELECT id FROM categories LIMIT 1`)).rows[0].id;
    await query(
      `INSERT INTO products (id, name, category_id, emoji, default_unit, prices) VALUES ('prod-b', 'Beta Rice', $1, '🍚', '1 kg', $2)`,
      [cat, JSON.stringify({ 'Beta Store': { price: 50, unit: '1 kg' } })]
    );
    await query(
      `INSERT INTO flash_deals (id, shop_id, shop_name, product_id, product_name, emoji, original_price, deal_price, discount_percentage, unit, expires_in_minutes, tag)
       VALUES ('deal-b', 'shop-b', 'Beta Store', 'prod-b', 'Beta Rice', '🍚', 50, 40, 20, '1 kg', 60, 'test')`
    );
    t.a = await loginToken('a@example.test', 'Merchant-pw-A');
    t.b = await loginToken('b@example.test', 'Merchant-pw-B');
    t.x = await loginToken('x@example.test', 'Merchant-pw-X');
  });

  it('owner merchant can access its own records (control)', async () => {
    expect((await api().get('/api/conversations/conv-b/messages').set(bearer(t.b))).status).toBe(200);
    expect((await api().get('/api/pre-bookings/pb-b').set(bearer(t.b))).status).toBe(200);
    expect((await api().get('/api/merchant/sales/sale-b').set(bearer(t.b))).status).toBe(200);
  });

  for (const who of ['a', 'x'] as const) {
    describe(`merchant ${who === 'a' ? 'of another shop' : 'with a colliding shop name'}`, () => {
      it('cannot read or modify the other shop\'s conversation', async () => {
        expect((await api().get('/api/conversations/conv-b/messages').set(bearer(t[who]))).status).toBe(403);
        expect((await api().post('/api/conversations/conv-b/messages').set(bearer(t[who])).send({ text: 'hi' })).status).toBe(403);
        expect((await api().put('/api/conversations/conv-b/basket').set(bearer(t[who])).send({ basketSnapshot: {} })).status).toBe(403);
      });

      it('cannot read or update the other shop\'s pre-booking', async () => {
        expect((await api().get('/api/pre-bookings/pb-b').set(bearer(t[who]))).status).toBe(403);
        expect((await api().patch('/api/pre-bookings/pb-b/status').set(bearer(t[who])).send({ status: 'approved' })).status).toBe(403);
        expect((await query(`SELECT status FROM pre_bookings WHERE id = 'pb-b'`)).rows[0].status).toBe('pending');
      });

      it('cannot read or delete the other shop\'s sales', async () => {
        expect((await api().get('/api/merchant/sales/sale-b').set(bearer(t[who]))).status).toBe(403);
        expect((await api().delete('/api/merchant/sales/sale-b').set(bearer(t[who]))).status).toBe(403);
        expect((await query(`SELECT COUNT(*)::int AS n FROM merchant_sales WHERE id = 'sale-b'`)).rows[0].n).toBe(1);
      });
    });
  }

  it('cannot change images of products it does not sell', async () => {
    const res = await api().patch('/api/products/prod-b/image').set(bearer(t.a)).send({ image: 'https://example.test/x.png' });
    expect(res.status).toBe(403);
  });

  it('cannot delete another shop\'s deal or delist its products by naming that shop', async () => {
    await api().delete('/api/merchant/deals/deal-b').set(bearer(t.a)).send({ shopName: 'Beta Store' });
    expect((await query(`SELECT COUNT(*)::int AS n FROM flash_deals WHERE id = 'deal-b'`)).rows[0].n).toBe(1);
    await api().post('/api/merchant/products/prod-b/delist').set(bearer(t.a)).send({ shopName: 'Beta Store' });
    const prices = (await query(`SELECT prices FROM products WHERE id = 'prod-b'`)).rows[0].prices;
    expect(Object.keys(prices)).toContain('Beta Store');
  });

  it('cannot take over another shop by renaming to its name', async () => {
    const res = await api().put('/api/merchant/shop').set(bearer(t.a)).send({ name: 'Beta Store', address: 'Hijacked' });
    expect(res.status).toBe(409);
    const shops = (await query(`SELECT id, name, address FROM shops WHERE id IN ('shop-a', 'shop-b') ORDER BY id`)).rows;
    expect(shops).toEqual([
      { id: 'shop-a', name: 'Alpha Store', address: 'Test address' },
      { id: 'shop-b', name: 'Beta Store', address: 'Test address' },
    ]);
  });
});
