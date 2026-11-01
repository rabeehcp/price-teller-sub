# Administrator access: bootstrap and recovery

The server **never** creates, resets or modifies accounts at startup. There are no built-in
administrator credentials or fixed tokens. Administrator accounts are managed only by:

1. Signing in and using **Change my password** (Admin panel → Overview), or `POST /api/auth/change-password`.
2. The operator CLI `server/src/cli/adminCli.ts`, which needs direct database access (`DATABASE_URL`)
   and is never run by the application itself.

## When to use the CLI
- First deployment with an empty database (the server logs a warning when no administrator exists).
- An administrator forgot their password and no other administrator can help.

## Prerequisites
- Database credentials for the target environment, kept in your secret store. Never paste them into chat or commit them.
- A machine with Node 22 and this repository checked out, or a shell inside the backend container.
- The CLI prints the target `host/database` (never credentials). Check it before confirming.

## Commands
From a checkout (`cd server && npm ci`):
```bash
DATABASE_URL='<from your secret store>' npm run admin -- list-admins
DATABASE_URL='<from your secret store>' npm run admin -- set-password --email you@example.com
DATABASE_URL='<from your secret store>' npm run admin -- create-admin --email you@example.com --name "Your Name"
```
Inside the built container (the image already has `DATABASE_URL`):
```bash
node dist/cli/adminCli.js set-password --email you@example.com
```
- The password is entered at a hidden prompt, twice. It is never accepted as an argument or printed.
- In interactive use you must type the email again to confirm. Non-interactive use requires `--yes`, and the password is read from the first line of stdin.
- Minimum length is 12 characters.

## What each command does
| Command | Effect | Safety |
|---|---|---|
| `list-admins` | Prints admin emails and names | Read-only |
| `create-admin` | Inserts a new `admin` user with a bcrypt hash | Refuses if the email already exists. Never promotes or overwrites another account. |
| `set-password` | Sets a new bcrypt hash for an **existing admin** and clears its session token | Only works on `role = 'admin'` rows. Consumers and merchants can't be changed this way. |

## Other lockout protections
- Restarting the server leaves admin passwords and tokens unchanged.
- `POST /api/admin/wipe-all-data` requires `{"confirm":"WIPE ALL DATA"}` and always keeps administrator accounts.
- Admins can't delete their own account, and the last administrator can't be deleted.

## Verification (local only)
`server/tests/auth.test.ts` covers bootstrap on an empty database, refusal to overwrite, short-password
rejection, reset that signs out old sessions, refusal to touch non-admin accounts, and the
`--yes` requirement. Run `npm run test:db:up && npm test`.
