import { beforeAll, describe, expect, it } from 'vitest';
import { api, bearer, createShop, createUser, loginToken, resetDb } from './helpers/app';

type Route = [method: 'get' | 'post' | 'put' | 'delete', path: string];
const adminRoutes: Route[] = [
  ['get', '/api/admin/users'],
  ['post', '/api/admin/shops'],
  ['post', '/api/admin/wipe-all-data'],
  ['delete', '/api/admin/users/some-id'],
];
const merchantRoutes: Route[] = [
  ['get', '/api/merchant/shop'],
  ['put', '/api/merchant/shop'],
  ['get', '/api/merchant/sales'],
  ['post', '/api/merchant/deals'],
];

describe('role-based access control', () => {
  const tokens: Record<string, string> = {};
  beforeAll(async () => {
    await resetDb();
    await createShop('shop-r', 'Role Store');
    await createUser({ role: 'consumer', email: 'c@example.test', password: 'Consumer-pw-1' });
    await createUser({ role: 'merchant', email: 'm@example.test', password: 'Merchant-pw-1', shopId: 'shop-r', shopName: 'Role Store' });
    tokens.consumer = await loginToken('c@example.test', 'Consumer-pw-1');
    tokens.merchant = await loginToken('m@example.test', 'Merchant-pw-1');
  });

  it.each([...adminRoutes, ...merchantRoutes])('%s %s requires authentication', async (method, path) => {
    expect((await api()[method](path)).status).toBe(401);
  });

  it.each([...adminRoutes, ...merchantRoutes])('%s %s is forbidden for consumers', async (method, path) => {
    expect((await api()[method](path).set(bearer(tokens.consumer))).status).toBe(403);
  });

  it.each(adminRoutes)('%s %s is forbidden for merchants', async (method, path) => {
    expect((await api()[method](path).set(bearer(tokens.merchant))).status).toBe(403);
  });
});
