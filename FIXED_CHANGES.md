# PriceTeller — fixed package notes

This archive includes the original audit fixes plus additional repairs so the project can run and is safer for development.

## Critical repairs in this package

1. **Missing server services restored**
   - `server/src/services/locationService.ts` — hyperlocal distance helpers used by the API.
   - `server/src/services/subscriptionService.ts` — merchant subscription checkout / verify / extend / cancel (demo payment flow).

2. **DB helpers**
   - `cancelMerchantSubscription()` added on the data layer so admin cancel works end-to-end.

3. **Safer PostgreSQL seeding (`server/src/db/init.ts`)**
   - Locations and categories now use `ON CONFLICT DO NOTHING` so restarts do not overwrite live master data.
   - Products, histories, reports, users, etc. already used non-destructive inserts.
   - Unique partial index for chat message idempotency is applied on startup.

4. **Schema**
   - Unique partial index on `(conversation_id, client_msg_id)` where `client_msg_id` is present.

5. **Server hardening (partial)**
   - JSON body limit reduced from 50 MB → 5 MB.
   - CORS can be locked via `FRONTEND_ORIGIN` env (comma-separated). Unset = open (dev).
   - Remote image fetch has basic SSRF guards (blocks localhost / private ranges / non-http(s)).

## Already present from prior audit (kept)

- Dedicated `/api/merchant/shop` endpoint.
- Merchant uses master-catalog instead of admin products.
- Category aliases in merchant dashboard (staples ↔ rice-grains, etc.).
- Cancellation guards + loading state for portal catalog in `App.tsx`.
- Editable price/stock sync without wiping local merchant edits.
- Logout invalidates server token.
- Pre-booking routes use authenticated identity.

## Still required before public production

These are intentionally **not** fully rewritten here (need product/security decisions):

- Password hashing (currently plaintext compare).
- Expiring / rotatable session tokens.
- Real payment-provider verification (current flow is demo/UPI-simulator).
- Stronger SSRF protection (DNS rebinding, redirect chain validation).
- Rate limiting, helmet, structured logging.
- Normalize financial totals purely server-side for every sale endpoint.
- Full test suite.

## How to run

```bash
# root
npm install
cd server && npm install
cd ../client && npm install

# configure server/.env from .env.example (DATABASE_URL required; connects to PostgreSQL/Aiven)
cd ../server && npm run db:init   # optional explicit init
cd .. && npm run dev              # client :5173 + server :5000
```

Default seeded admin (change immediately): `priceteller10` / `password123`.
