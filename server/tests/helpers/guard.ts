// Refuse to run against anything other than a disposable local *_test database.
const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL must point to a local *_test database (see npm run test:db:up)');
const parsed = new URL(url);
if (!['localhost', '127.0.0.1'].includes(parsed.hostname) || !parsed.pathname.replace('/', '').endsWith('_test')) {
  throw new Error(`Refusing to run tests against ${parsed.hostname}${parsed.pathname}: only localhost *_test databases are allowed`);
}
process.env.PGSSL = 'false';
