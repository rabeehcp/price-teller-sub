import { beforeAll, describe, expect, it } from 'vitest';
import { query } from '../src/db/pool';
import { initDb } from '../src/db/init';
import { createAdmin, setAdminPassword, main as adminCliMain } from '../src/cli/adminCli';
import { api, bearer, createShop, createUser, loginToken, resetDb, TOKEN_PATTERN } from './helpers/app';

const ADMIN_PW = 'Admin-test-password-1';

describe('startup seeding', () => {
  beforeAll(resetDb);

  it('creates no user accounts on an empty database', async () => {
    const res = await query('SELECT COUNT(*)::int AS n FROM users');
    expect(res.rows[0].n).toBe(0);
  });

  it('does not change existing administrator passwords or tokens on restart', async () => {
    await createUser({ role: 'admin', email: 'keep-admin@example.test', password: ADMIN_PW });
    const token = await loginToken('keep-admin@example.test', ADMIN_PW);
    const before = await query(`SELECT password, token FROM users WHERE email = 'keep-admin@example.test'`);
    await initDb();
    await initDb();
    const after = await query(`SELECT password, token FROM users WHERE email = 'keep-admin@example.test'`);
    expect(after.rows[0]).toEqual(before.rows[0]);
    expect((await api().get('/api/admin/users').set(bearer(token))).status).toBe(200);
    expect((await query('SELECT COUNT(*)::int AS n FROM users')).rows[0].n).toBe(1);
  });
});

describe('administrator authentication and tokens', () => {
  beforeAll(async () => {
    await resetDb();
    await createUser({ role: 'admin', email: 'admin@example.test', password: ADMIN_PW, token: 'tok-admin-1' });
    await createUser({ role: 'merchant', email: 'legacy-merchant@example.test', password: 'Merchant-pw-1', token: 'tok-merchant-legacy-1700000000000' });
  });

  it('rejects the old fixed admin token and old-format tokens', async () => {
    for (const token of ['tok-admin-1', 'tok-merchant-legacy-1700000000000']) {
      expect((await api().get('/api/admin/users').set(bearer(token))).status).toBe(401);
      expect((await api().get('/api/auth/me').set(bearer(token))).body.success).not.toBe(true);
    }
  });

  it('rejects wrong passwords', async () => {
    const res = await api().post('/api/auth/login').send({ email: 'admin@example.test', password: 'wrong-password' });
    expect(res.body.success).not.toBe(true);
    expect(res.body.token).toBeUndefined();
  });

  it('issues a random 64-hex token on login, replacing the legacy token', async () => {
    const token = await loginToken('admin@example.test', ADMIN_PW);
    expect(token).toMatch(TOKEN_PATTERN);
    const me = await api().get('/api/auth/me').set(bearer(token));
    expect(me.body.user?.role).toBe('admin');
    expect(me.body.user?.password).toBeUndefined();
    expect((await api().get('/api/admin/users').set(bearer(token))).status).toBe(200);
    expect((await api().get('/api/admin/users').set(bearer('tok-admin-1'))).status).toBe(401);
  });

  it('requires a token for protected routes', async () => {
    expect((await api().get('/api/admin/users')).status).toBe(401);
  });

  it('invalidates the token on logout', async () => {
    const token = await loginToken('admin@example.test', ADMIN_PW);
    await api().post('/api/auth/logout').set(bearer(token));
    expect((await api().get('/api/admin/users').set(bearer(token))).status).toBe(401);
  });

  it('changes password only with the current password and rotates the token', async () => {
    const token = await loginToken('admin@example.test', ADMIN_PW);
    const wrong = await api().post('/api/auth/change-password').set(bearer(token)).send({ currentPassword: 'nope', newPassword: 'Another-long-password-2' });
    expect(wrong.status).toBe(401);
    const short = await api().post('/api/auth/change-password').set(bearer(token)).send({ currentPassword: ADMIN_PW, newPassword: 'short' });
    expect(short.status).toBe(400);
    const ok = await api().post('/api/auth/change-password').set(bearer(token)).send({ currentPassword: ADMIN_PW, newPassword: 'Another-long-password-2' });
    expect(ok.status).toBe(200);
    expect(ok.body.token).toMatch(TOKEN_PATTERN);
    expect((await api().get('/api/admin/users').set(bearer(token))).status).toBe(401);
    expect((await api().get('/api/admin/users').set(bearer(ok.body.token))).status).toBe(200);
    expect((await api().post('/api/auth/login').send({ email: 'admin@example.test', password: ADMIN_PW })).body.token).toBeUndefined();
    await loginToken('admin@example.test', 'Another-long-password-2');
  });
});

describe('administrator recovery CLI', () => {
  beforeAll(resetDb);

  it('bootstraps the first administrator on an empty database', async () => {
    await createAdmin('first-admin@example.test', 'First Admin', 'Bootstrap-password-1');
    const token = await loginToken('first-admin@example.test', 'Bootstrap-password-1');
    expect((await api().get('/api/admin/users').set(bearer(token))).status).toBe(200);
  });

  it('refuses to overwrite an existing account', async () => {
    await expect(createAdmin('first-admin@example.test', 'Dup', 'Bootstrap-password-2')).rejects.toThrow(/already exists/);
    await createUser({ role: 'consumer', email: 'shopper@example.test', password: 'Shopper-pw-1' });
    await expect(createAdmin('shopper@example.test', 'X', 'Bootstrap-password-3')).rejects.toThrow(/non-admin/);
  });

  it('rejects short passwords', async () => {
    await expect(createAdmin('weak@example.test', 'Weak', 'short')).rejects.toThrow(/at least 12/);
    await expect(setAdminPassword('first-admin@example.test', 'short')).rejects.toThrow(/at least 12/);
  });

  it('resets an administrator password and signs out existing sessions', async () => {
    const oldToken = await loginToken('first-admin@example.test', 'Bootstrap-password-1');
    await setAdminPassword('first-admin@example.test', 'Recovered-password-1');
    expect((await api().get('/api/admin/users').set(bearer(oldToken))).status).toBe(401);
    expect((await api().post('/api/auth/login').send({ email: 'first-admin@example.test', password: 'Bootstrap-password-1' })).body.token).toBeUndefined();
    await loginToken('first-admin@example.test', 'Recovered-password-1');
  });

  it('cannot be used to take over non-admin accounts', async () => {
    await expect(setAdminPassword('shopper@example.test', 'Takeover-password-1')).rejects.toThrow(/No administrator/);
    await expect(setAdminPassword('missing@example.test', 'Takeover-password-1')).rejects.toThrow(/No administrator/);
  });

  it('requires --yes when not interactive and rejects unknown commands', async () => {
    expect(await adminCliMain(['set-password', '--email', 'first-admin@example.test'])).toBe(1);
    expect(await adminCliMain(['unknown'])).toBe(2);
  });
});

describe('admin safety guards and registration', () => {
  let adminToken: string;
  beforeAll(async () => {
    await resetDb();
    await createUser({ role: 'admin', email: 'a1@example.test', password: ADMIN_PW, id: 'usr-admin-a1' });
    await createUser({ role: 'admin', email: 'a2@example.test', password: ADMIN_PW, id: 'usr-admin-a2' });
    await createUser({ role: 'merchant', email: 'm@example.test', password: 'Merchant-pw-1' });
    await createShop('shop-taken', 'Taken Store');
    adminToken = await loginToken('a1@example.test', ADMIN_PW);
  });

  it('blocks deleting your own administrator account', async () => {
    const res = await api().delete('/api/admin/users/usr-admin-a1').set(bearer(adminToken));
    expect(res.status).toBe(400);
  });

  it('requires explicit confirmation to wipe data and always keeps administrators', async () => {
    expect((await api().post('/api/admin/wipe-all-data').set(bearer(adminToken))).status).toBe(400);
    expect((await query(`SELECT COUNT(*)::int AS n FROM users WHERE role = 'merchant'`)).rows[0].n).toBe(1);
    const ok = await api().post('/api/admin/wipe-all-data').set(bearer(adminToken)).send({ confirm: 'WIPE ALL DATA' });
    expect(ok.status).toBe(200);
    const roles = (await query(`SELECT role, COUNT(*)::int AS n FROM users GROUP BY role`)).rows;
    expect(roles).toEqual([{ role: 'admin', n: 2 }]);
    expect((await api().get('/api/admin/users').set(bearer(adminToken))).status).toBe(200);
    await loginToken('a2@example.test', ADMIN_PW);
  });

  it('allows deleting another administrator while more than one remains', async () => {
    const res = await api().delete('/api/admin/users/usr-admin-a2').set(bearer(adminToken));
    expect(res.status).toBe(200);
  });

  it('requires a password and refuses to join an existing shop by name on merchant registration', async () => {
    await createShop('shop-taken-2', 'Second Taken Store');
    const noPw = await api().post('/api/auth/register').send({ name: 'X', email: 'x@example.test', shopName: 'Fresh Store' });
    expect(noPw.body.success).not.toBe(true);
    const taken = await api().post('/api/auth/register').send({ name: 'X', email: 'x@example.test', password: 'Merchant-pw-2', shopName: 'second taken store' });
    expect(taken.status).toBe(409);
  });
});
