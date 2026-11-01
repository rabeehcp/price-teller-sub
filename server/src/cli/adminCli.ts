/**
 * Administrator bootstrap and recovery CLI. Never runs at server startup.
 *
 *   npm run admin -- list-admins
 *   npm run admin -- create-admin --email <email> [--name "<name>"]
 *   npm run admin -- set-password --email <email>
 *
 * In a built container: node dist/cli/adminCli.js <command> ...
 * Passwords are read from a hidden prompt (or the first line of stdin when not a TTY)
 * and are never accepted as arguments or printed.
 */
import crypto from 'crypto';
import readline from 'readline';
import bcrypt from 'bcryptjs';
import { pool, query } from '../db/pool';

export const MIN_ADMIN_PASSWORD_LENGTH = 12;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePassword(password: string): void {
  if (!password || password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters`);
  }
}

export async function listAdmins(): Promise<{ email: string; name: string }[]> {
  const res = await query(`SELECT email, name FROM users WHERE role = 'admin' ORDER BY email`);
  return res.rows;
}

export async function createAdmin(email: string, name: string, password: string): Promise<{ id: string; email: string }> {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!EMAIL_PATTERN.test(cleanEmail)) throw new Error('A valid --email is required');
  validatePassword(password);
  const existing = await query(`SELECT role FROM users WHERE LOWER(email) = $1`, [cleanEmail]);
  if (existing.rows.length > 0) {
    throw new Error(
      existing.rows[0].role === 'admin'
        ? 'An administrator with this email already exists; use set-password instead'
        : 'A non-admin account already uses this email; choose a different email'
    );
  }
  const id = `usr-admin-${crypto.randomUUID()}`;
  await query(
    `INSERT INTO users (id, email, name, role, password, created_at, token) VALUES ($1, $2, $3, 'admin', $4, $5, NULL)`,
    [id, cleanEmail, name.trim() || 'Administrator', await bcrypt.hash(password, 12), new Date().toISOString()]
  );
  return { id, email: cleanEmail };
}

/** Sets a new password for an existing administrator and signs out its current sessions. */
export async function setAdminPassword(email: string, password: string): Promise<void> {
  const cleanEmail = String(email || '').trim().toLowerCase();
  validatePassword(password);
  const res = await query(
    `UPDATE users SET password = $1, token = NULL WHERE LOWER(email) = $2 AND role = 'admin'`,
    [await bcrypt.hash(password, 12), cleanEmail]
  );
  if ((res.rowCount ?? 0) === 0) throw new Error('No administrator account found with that email');
}

function describeTarget(): string {
  const url = process.env.DATABASE_URL;
  if (!url) return `${process.env.PGHOST || 'localhost'}/${process.env.PGDATABASE || 'priceteller'}`;
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`;
  } catch {
    return '(unparseable DATABASE_URL)';
  }
}

let stdinLines: string[] | null = null;
async function readStdinLine(): Promise<string> {
  if (stdinLines === null) {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
    stdinLines = Buffer.concat(chunks).toString('utf8').split(/\r?\n/);
  }
  return stdinLines.shift() ?? '';
}

function prompt(question: string, hidden: boolean): Promise<string> {
  if (!process.stdin.isTTY) return readStdinLine();
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      (rl as any)._writeToOutput = (text: string) => {
        if (text.includes(question)) process.stdout.write(question);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer);
    });
  });
}

async function readNewPassword(): Promise<string> {
  const first = await prompt('New password: ', true);
  if (process.stdin.isTTY) {
    const second = await prompt('Repeat password: ', true);
    if (first !== second) throw new Error('Passwords do not match');
  }
  return first;
}

async function confirm(email: string, yes: boolean): Promise<void> {
  console.log(`Target database: ${describeTarget()}`);
  if (yes) return;
  if (!process.stdin.isTTY) throw new Error('Non-interactive use requires --yes');
  const answer = await prompt(`Type the email (${email}) to confirm: `, false);
  if (answer.trim().toLowerCase() !== email.trim().toLowerCase()) throw new Error('Confirmation did not match; aborted');
}

function getFlag(args: string[], name: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
}

export async function main(argv: string[]): Promise<number> {
  const [command, ...args] = argv;
  const email = getFlag(args, 'email') || '';
  const yes = args.includes('--yes');
  try {
    if (command === 'list-admins') {
      console.log(`Target database: ${describeTarget()}`);
      const admins = await listAdmins();
      console.log(admins.length ? admins.map((a) => `- ${a.email} (${a.name})`).join('\n') : 'No administrator accounts.');
    } else if (command === 'create-admin') {
      await confirm(email, yes);
      const created = await createAdmin(email, getFlag(args, 'name') || 'Administrator', await readNewPassword());
      console.log(`Administrator created: ${created.email}`);
    } else if (command === 'set-password') {
      await confirm(email, yes);
      await setAdminPassword(email, await readNewPassword());
      console.log(`Password updated and existing sessions signed out for: ${email.trim().toLowerCase()}`);
    } else {
      console.error('Usage: admin-cli <list-admins | create-admin --email <e> [--name <n>] | set-password --email <e>> [--yes]');
      return 2;
    }
    return 0;
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    return 1;
  }
}

if (require.main === module) {
  main(process.argv.slice(2)).then(async (code) => {
    await pool.end();
    process.exit(code);
  });
}
