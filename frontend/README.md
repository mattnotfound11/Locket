# Locket — Cookies & More

Storefront and ordering system for Locket, a bakery in Jaro, Iloilo City.

**Live:** https://locket-bakes.vercel.app

**Repository:** https://github.com/mattnotfound11/Locket

**Deployment:** https://locket-bakes-qgqwpu1t0-acadexa.vercel.app

Next.js 16 (App Router) + React 19 + Tailwind v4.

## Deploying

The Vercel project `locket-bakes` is connected to the GitHub repository, so a
push to `main` builds and deploys on its own. No CLI step is needed.

One setting makes that work: the repository root is the `LOCKET` workspace but
the app lives in `frontend/`, so the project's **Root Directory is set to
`frontend`**. Without it a Git build looks for `package.json` at the repository
root and fails.

To deploy by hand instead, run `vercel --prod` from `frontend/`.

## Running it

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
npx vitest run         # 39 domain tests
npx eslint src         # clean
```

## How the code is arranged

The business rules are kept away from React so they can be tested without a
browser and reused from both the API routes and the UI.

```
src/
  config/store.ts        Address, hours, phone, map. One source of truth.
  domain/                Pure rules. No I/O, no React, no framework imports.
    money.ts             Integer centavos. Never floats for money.
    catalog/             Products, categories, allergens, nutrition panels.
    fulfillment/         Slot generation, per-window caps, lead times.
    cart/                Line totals, delivery fees, deposit thresholds.
    orders/              Order model, reference codes, custom-order validation.
    payments/            Gateway port + method rules.
    __tests__/           39 tests over the rules above.
  infrastructure/        Adapters that touch the outside world.
  components/            UI, grouped by area.
  app/api/               Route handlers. Thin: validate, call domain, persist.
```

Two rules hold this together:

1. **The domain layer never imports from `app/` or `components/`.** It has no
   idea a web server exists, which is why the slot and pricing rules are
   testable in milliseconds.
2. **Prices and availability are recomputed server-side on every order.** The
   client's cart is a suggestion. `POST /api/orders` rebuilds the basket from
   the catalogue and re-checks the slot before it takes anything.

## Ordering rules

| Rule | Where it lives |
| --- | --- |
| Shop closed Mondays; hours vary by day | `config/store.ts` |
| Hourly windows inside opening hours | `domain/fulfillment/slots.ts` |
| 8 pickup / 5 delivery orders per window | `DEFAULT_RULES.capacity` |
| Same-day orders close at 2pm | `DEFAULT_RULES.sameDayCutoff` |
| 2 hours minimum prep | `DEFAULT_RULES.minimumPrepMinutes` |
| Whole cakes need 2 days | `Product.leadTimeDays` |
| Custom cakes need 5 days, or 10 over 40 servings | `domain/fulfillment/leadtime.ts` |
| Deposit of 50% over ₱1,500 | `domain/cart/totals.ts` |
| Delivery ₱120, free over ₱2,000 | `PRICING` |
| Delivery inside Iloilo City and two campuses only | `domain/fulfillment/delivery.ts` |
| Cash cannot cover a deposit order | `domain/payments/methods.ts` |

Changing a number in those files changes the site, the API and the tests
together. The home page reads its figures from the same constants, so the
marketing copy cannot drift away from what checkout enforces.

## Delivery area

Locket delivers inside Iloilo City only: all seven districts (City Proper, Jaro,
La Paz, Mandurriao, Molo, Arevalo, Lapuz), plus scheduled drops at University of
San Agustin and St. Paul University Iloilo.

This is enforced, not just written on the page. Checkout makes the customer pick
a zone, and `POST /api/orders` re-checks it, so a delivery to Bacolod or a
neighbouring town cannot be booked by typing it into the address box or by
posting straight at the API. Adding or removing an area is one entry in
`DELIVERY_ZONES`.

## Going live

Two things are simulated and both are swapped with configuration, not code.

### Payments

`domain/payments/gateway.ts` defines the port. `adapters.ts` ships two drivers:

- `SimulatedGateway` (default) approves everything and marks the order
  `simulated: true`. The confirmation page says so in plain language.
- `PayMongoGateway` covers GCash, Maya and cards through one API, which is the
  usual choice for a Philippine merchant.

Set `PAYMONGO_SECRET_KEY` in the Vercel project and the factory picks the live
driver on the next boot. No UI or domain code changes.

Cash on delivery needs no provider and already works.

### Persistence

`infrastructure/repositories/orders.ts` defines `OrderRepository` and ships an
in-memory implementation. It enforces caps correctly, but it lives in module
memory: **on serverless it is per-instance and resets on cold start.** It is
enough to demonstrate the flow, not to run a shop.

For production, implement the same interface against Postgres, Vercel KV or
Supabase and change the factory at the bottom of that file. Two requirements:

- `reserveSlot` must be atomic, so two simultaneous checkouts cannot both take
  the last space in a window. `SELECT ... FOR UPDATE`, or a unique constraint on
  `(slot, sequence)`, both do the job.
- `countsFor` takes an array and must return an entry for **every** key asked
  for, including windows nobody has booked. Omitting empty windows reads to the
  caller as zero demand and oversells them. It is batched on purpose: resolving
  a fortnight one key at a time is ~150 sequential round trips.

### Reference photo uploads

Custom-order photos go to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set, and
otherwise inline as data URLs so the flow works on a bare deploy. Capped at 5 MB
and restricted to JPG, PNG, WEBP and HEIC either way.

## Accessibility and security

Allergens are written as sentences, not icons, because icon-only allergen
labelling is guesswork for the person who most needs to read it. Every product
declares its allergens explicitly; an empty list is a deliberate statement
rather than missing data.

TLS and the HTTP-to-HTTPS redirect are Vercel's. `next.config.ts` adds HSTS,
`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and a
`Permissions-Policy` that switches off camera, microphone and geolocation.
