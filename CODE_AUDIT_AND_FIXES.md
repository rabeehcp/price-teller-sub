# PriceTeller code audit and fixes

## Scope

Reviewed the uploaded project archive at source-file level across the client and server code, with a focused trace of authentication, PostgreSQL initialization, merchant inventory/catalog loading, product state, category filtering, chat idempotency, pre-booking authorization, and billing/subscription flows.

The archive contains 75 files; the TypeScript/TSX/JS/SQL source under `client/src` and `server/src` totals about 29k lines. A TypeScript parser pass was also run over 60 TS/TSX/JS files and found **0 syntax/parse errors**.

## Root causes of the merchant inventory bugs

### 1. Temporary `0 -> real count` flicker

The original `App.tsx` used the same product-loading effect for consumer, admin, and merchant views. For a merchant it called the admin-only endpoint `/api/admin/products`. That endpoint correctly returns 403 to a merchant. The frontend's `safeFetchJson()` converts any non-2xx response into `null`, and `fetchAdminProducts()` converts that into `[]`.

That empty array was then assigned to the shared `products` state while the merchant dashboard was also independently requesting the merchant catalog. This created a visible empty-state period and a race between multiple sources of product state.

There was also a second UI bug: `editablePrices` was initialized from `products` only once. When the asynchronous product catalog arrived later, the product rows had real prices, but the editable input state still had no entries, so the inputs displayed `0` through `editablePrices[p.id] ?? 0`.

### 2. Merchant was unnecessarily requesting the admin catalog

The merchant dashboard had its own `/api/merchant/master-catalog` request while `App.tsx` was separately requesting `/api/admin/products` and `/api/admin/shops`. This duplicated ownership of the same catalog state and made race conditions more likely.

### 3. Merchant category IDs and master catalog IDs are inconsistent

The merchant profile uses older broad groups such as `staples`, `oils-spices`, `household`, and `bakery-breakfast`.

The master catalog uses more granular IDs such as `rice-grains`, `pulses-legumes`, `oils-sugar`, `spices`, `cleaning-household`, `storage-containers`, `baby-family`, `personal-care`, and `biscuits-snacks`.

A strict equality check therefore makes legitimate catalog products disappear from the merchant's eligible catalog.

The fix adds explicit compatibility aliases in the merchant dashboard instead of silently changing existing database category IDs.

## Important persistent-data bug found

`server/src/db/init.ts` was loading `server/data/db.json` on every server startup and using `ON CONFLICT DO UPDATE` for products, shops, users, consumer data, price histories, and price reports.

That means a server restart could overwrite live PostgreSQL data with the stale JSON seed snapshot. In particular, merchant prices, product images, shop settings, user tokens/passwords, and consumer data could be reverted.

This is a major architectural bug when PostgreSQL is the production source of truth.

The initialization path has been changed so existing PostgreSQL records are **not overwritten by the fallback seed snapshot**. Existing records are preserved; seed data only fills missing rows.

## Other concrete fixes made

- Added a dedicated authenticated `/api/merchant/shop` endpoint that returns only the authenticated merchant's shop.
- Removed the merchant dashboard's duplicate master-catalog request; `App.tsx` now owns the portal catalog load.
- Added cancellation guards to portal/consumer async catalog effects so stale requests cannot update state after the effect is superseded.
- Added a product loading state to the merchant inventory UI instead of presenting an empty catalog as `0` while loading.
- Added safe synchronization of editable price/stock fields after async product loading without overwriting prices the merchant has already edited locally.
- Merchant-created products can no longer assign prices to arbitrary shop names; merchants are restricted to their own shop on the server.
- Merchant price updates now require finite positive prices and valid stock states.
- Relisting now rejects invalid/non-positive requested prices instead of allowing a negative value through.
- Fixed the PostgreSQL wipe operation's table-name typo: it referenced `chat_messages`, but the schema defines `messages`.
- Logout now also asks the backend to invalidate the session token instead of only deleting browser storage.
- Pre-booking list/detail/create routes now use the authenticated request identity rather than accepting tokens from query strings or request bodies. Creation is restricted to consumer/admin identities.

## Security / production blockers that remain and should be handled before public deployment

These were identified but intentionally not rewritten broadly in this pass because they require a deployment/security decision rather than a small bug fix:

1. **Passwords are stored/compared as plaintext** in the current user model and seed data. Production should migrate to a password-hash scheme (e.g. scrypt/Argon2/bcrypt) and remove hardcoded credentials.
2. **Session tokens are long-lived opaque values stored in the users table without expiry.** Production should use expiring sessions/tokens and rotation/revocation strategy.
3. **`/api/proxy-image` is an unauthenticated remote fetch endpoint.** It needs SSRF protection (URL allowlist or private-network/DNS blocking plus safe redirect handling) before production.
4. **CORS is currently open (`cors()` with no origin policy).** Production should configure the exact frontend origin.
5. **The JSON body limit is 50 MB**, while product image uploads are expected to be much smaller. This should be reduced and uploads should validate actual image type/size.
6. **Subscription verification is not a real payment-provider verification flow.** The current service can accept a supplied UPI reference/simulator data and activate a subscription. This is suitable only for development/demo mode, not real paid access.
7. **The public `includeUnverified=true` query path exists on several read endpoints.** It should either be removed from public routes or explicitly protected.
8. **The product image PATCH endpoint lets an authenticated merchant modify a master product image.** If master images are platform-owned, this should be admin-only or restricted to merchant-owned custom products.
9. **Merchant sales totals are recomputed but the endpoint still prefers client-supplied non-zero totals.** Financial totals should be fully server-derived from validated line items.
10. **Chat idempotency uses a check-then-insert without a database uniqueness constraint.** Concurrent duplicate requests can still race. A unique partial index on `(conversation_id, client_msg_id)` should be added after checking/cleaning existing duplicate rows.

## Deployment note

`localhost` remains correct for local PostgreSQL development. Production should provide `DATABASE_URL` through the hosting environment and should not change application source code just to change the database hostname.

## Validation

- All 60 TypeScript/TSX/JS files parsed successfully with TypeScript's parser: **0 syntax errors**.
- No database records were changed by this audit/fix process.
- The uploaded ZIP itself was not altered; a separate fixed project copy was produced.
- Full runtime/build validation was not possible without the project's npm dependencies being installed in the audit environment. The available global TypeScript compiler therefore produced dependency/type errors, but no syntax errors were found.
