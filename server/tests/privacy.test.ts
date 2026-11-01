import { beforeAll, describe, expect, it } from 'vitest';
import { api, bearer, createShop, createUser, loginToken, resetDb } from './helpers/app';

const PRIVATE = {
  merchantEmail: 'private-merchant@example.test',
  consumerEmail: 'private-consumer@example.test',
  consumerPhone: '+91 90000 11111',
};

describe('private data exposure', () => {
  let adminToken: string;
  beforeAll(async () => {
    await resetDb();
    await createShop('shop-p', 'Public Store');
    await createUser({ role: 'merchant', email: PRIVATE.merchantEmail, password: 'Merchant-pw-1', shopId: 'shop-p', shopName: 'Public Store' });
    await createUser({ role: 'consumer', email: PRIVATE.consumerEmail, password: 'Consumer-pw-1', phone: PRIVATE.consumerPhone });
    await createUser({ role: 'admin', email: 'admin@example.test', password: 'Admin-test-password-1' });
    adminToken = await loginToken('admin@example.test', 'Admin-test-password-1');
  });

  it('removed the public merchant and consumer account lists', async () => {
    expect((await api().get('/api/auth/quick-merchants')).status).toBe(404);
    expect((await api().get('/api/auth/quick-consumers')).status).toBe(404);
  });

  it.each(['/api/shops', '/api/products', '/api/deals', '/api/locations', '/api/categories', '/api/subscription/plans'])(
    'public endpoint %s leaks no account data',
    async (path) => {
      const res = await api().get(path);
      expect(res.status).toBe(200);
      const body = JSON.stringify(res.body);
      for (const value of Object.values(PRIVATE)) expect(body).not.toContain(value);
      expect(body).not.toMatch(/"(password|token)"\s*:/);
    }
  );

  it('returns a one-time temporary password only for newly created merchant logins', async () => {
    const res = await api().post('/api/admin/shops').set(bearer(adminToken)).send({
      name: 'Gamma Store', address: 'Main road', locationId: 'tirur', email: 'gamma@example.test',
    });
    expect(res.status).toBe(200);
    const account = res.body.merchantAccount;
    expect(account.created).toBe(true);
    expect(account.temporaryPassword).toMatch(/^[A-Za-z0-9_-]{16}$/);
    expect(account.password).toBeUndefined();
    expect(res.body.message).not.toContain(account.temporaryPassword);
    await loginToken('gamma@example.test', account.temporaryPassword);

    const again = await api().post('/api/admin/shops').set(bearer(adminToken)).send({
      name: 'Delta Store', address: 'Main road', locationId: 'tirur', email: PRIVATE.merchantEmail,
    });
    expect(again.status).toBe(200);
    expect(again.body.merchantAccount.created).toBe(false);
    expect(again.body.merchantAccount.temporaryPassword).toBeUndefined();
    await loginToken(PRIVATE.merchantEmail, 'Merchant-pw-1');
  });
});
