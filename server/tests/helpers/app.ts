import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app, setDbReady } from '../../src/server';
import { query } from '../../src/db/pool';
import { initDb } from '../../src/db/init';

export const api = () => request(app);
export const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

export async function resetDb(): Promise<void> {
  await query('DROP SCHEMA IF EXISTS public CASCADE');
  await query('CREATE SCHEMA public');
  await initDb();
  setDbReady(true);
}

export async function createUser(o: {
  role: 'admin' | 'merchant' | 'consumer';
  email: string;
  password: string;
  shopId?: string | null;
  shopName?: string | null;
  phone?: string;
  token?: string | null;
  id?: string;
}): Promise<string> {
  const id = o.id || `usr-${o.role}-${Math.random().toString(36).slice(2, 10)}`;
  await query(
    `INSERT INTO users (id, email, name, role, password, shop_id, shop_name, phone, created_at, token)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [id, o.email, `${o.role} ${id}`, o.role, await bcrypt.hash(o.password, 4), o.shopId ?? null, o.shopName ?? null, o.phone ?? null, new Date().toISOString(), o.token ?? null]
  );
  if (o.role === 'consumer') {
    await query(`INSERT INTO consumer_data (user_id) VALUES ($1) ON CONFLICT DO NOTHING`, [id]);
  }
  return id;
}

export async function loginToken(email: string, password: string): Promise<string> {
  const res = await api().post('/api/auth/login').send({ email, password });
  if (!res.body?.token) throw new Error(`login failed for ${email}: ${res.status}`);
  return res.body.token;
}

export async function createShop(id: string, name: string): Promise<void> {
  await query(`INSERT INTO shops (id, name, address) VALUES ($1, $2, 'Test address')`, [id, name]);
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });
