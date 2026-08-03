# D.W.P. Core — Next.js Prototype (with real Auth + Database)

Premium AI-powered cloud warranty platform. Built with Next.js 14
(App Router), TypeScript, Tailwind CSS, Framer Motion, Prisma +
PostgreSQL, and NextAuth (credentials + JWT sessions, bcrypt password
hashing).

## Setup (VS Code)

1. **Get a PostgreSQL database.** Easiest options if you don't already
   have one running locally:
   - [Supabase](https://supabase.com) (free tier — matches the
     original tech stack) → Project Settings → Database → copy the
     connection string
   - [Neon](https://neon.tech) or [Railway](https://railway.app) (free tier)
   - Or a local Postgres install

2. **Copy the environment file:**
   ```bash
   cp .env.example .env
   ```
   Fill in `DATABASE_URL` with your connection string, and generate
   a secret for `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Push the schema to your database:**
   ```bash
   npm run db:push
   ```

5. **Seed test accounts** (one customer, one agent, one admin, all
   with password `password123`):
   ```bash
   npm run db:seed
   ```

6. **Run the app:**
   ```bash
   npm run dev
   ```
   Open **http://localhost:3000**.

## Test accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Customer | `customer@dwpcore.lk` | `password123` |
| Agent | `agent@dwpcore.lk` | `password123` |
| Admin | `admin@dwpcore.lk` | `password123` |

Log in at `/login` — each account lands on its own portal
automatically.

## How auth works

- `app/api/auth/[...nextauth]/route.ts` — NextAuth credentials
  provider; checks email + bcrypt-compared password against the
  `User` table, issues a JWT session with the user's `role` embedded.
- `app/api/register/route.ts` — validates input with Zod, hashes the
  password with bcrypt, creates the `User` (and a `Shop` if
  registering as an Agent).
- `middleware.ts` — protects `/dashboard`, `/agent`, `/admin`.
  Not logged in → redirected to `/login`. Logged in but wrong role
  (e.g. a customer visiting `/admin`) → redirected to their own
  portal instead.
- `components/AuthSessionProvider.tsx` — wraps the app so any page
  can call `useSession()` / `signIn()` / `signOut()`.

## Database schema

See `prisma/schema.prisma`. Tables: `User` (role: CUSTOMER / AGENT /
ADMIN), `Shop`, `Device`, `Warranty`, `Claim`, `Payment`,
`Commission`, `Notification`. Run `npm run db:studio` to browse the
data visually once it's seeded.

## Pages

| Route | What it is |
|---|---|
| `/` | Marketing home page — hero with live AI Warranty Advisor, plans, features, IMEI checker |
| `/login` | Real login — checks credentials against the database |
| `/register` | Real registration — Customer or Agent/Shop, writes to the database, auto logs in |
| `/dashboard` | **Customer Portal** — devices, warranties, payments/EMI, certificate + QR, claims, repair tracking, AI chat assistant, notifications, profile |
| `/agent` | **Agent Portal** — device registration workflow, stock, sales analytics, commission tracking, claims |
| `/admin` | **Admin Portal** — executive KPIs, revenue analytics, customer/agent/shop management, claims approval queue, operations, system settings |

Each dashboard is a single scrollable page — the sidebar links jump
to the relevant section (like Notion/Linear settings pages) rather
than being separate routes. As the data model grows, split the
busiest sections (Customer Management, Claims Approval) into their
own routes.

## What's included

- Real authentication: register → hashed password stored in Postgres,
  login → credentials checked against the database, JWT session
  carries the user's role
- Route protection by role via middleware — no more visiting
  `/admin` without an admin account
- Full Prisma schema covering devices, warranties, claims, payments,
  EMI, commissions and notifications
- Hero section with a **live AI Warranty Advisor** calculator
- Full Customer, Agent and Admin dashboards with sidebar navigation,
  stat cards, tables, and charts (Recharts)
- Dark mode / light mode toggle, mobile-first responsive design

## All three portals now use real data

Every table, stat card and chart in `/dashboard`, `/agent` and
`/admin` is fetched from Postgres — nothing is hardcoded in the page
files anymore. New accounts genuinely start empty (no devices, no
claims, no payments) because that's what's actually in the database.

**API routes:**

| Route | Method | What it does |
|---|---|---|
| `/api/customer/dashboard` | GET | This customer's devices, warranties, payments, claims, notifications |
| `/api/agent/dashboard` | GET | This agent's recent registrations, commissions, claims, 7-day sales chart |
| `/api/agent/devices` | POST | Registers a device: finds/creates the customer, calculates the warranty package, creates `Device` + `Warranty` + `Commission` |
| `/api/admin/dashboard` | GET | Network-wide counts, 6-month revenue chart, recent customers/agents/shops, claims queue |
| `/api/claims` | POST | Customer submits a new claim on one of their devices |
| `/api/claims/[id]` | PATCH | Admin approves or rejects a claim |

Each route checks `session.user.role` before returning anything —
a customer's token can't hit `/api/admin/dashboard`, for example.

**Try the full loop:**
1. Log in as `agent@dwpcore.lk` → go to `/agent#register` → fill in a
   new device with a new customer email → submit. A real `Device`,
   `Warranty` and `Commission` row are created.
2. Log in as the new customer's email won't work yet (they got a
   random temp password) — but log back in as `customer@dwpcore.lk`
   and submit a claim on the seeded iPhone from `/dashboard#claims`.
3. Log in as `admin@dwpcore.lk` → `/admin#claims` → approve or reject
   it. Refresh the customer's dashboard and the status has changed.

## What's still not wired up

- **AI Chat Assistant** and the **AI Warranty Advisor's** live
  reasoning — the pricing math in `lib/calculatePackage.ts` is real,
  but it's not calling an actual language model yet.
- **File uploads** — device photos, claim photos, certificates. Needs
  S3 or Supabase Storage.
- **Payment gateway** — PayHere / WebXPay integration for the
  EMI/full-payment flows. Right now nothing creates `Payment` rows;
  you'd add that when wiring up checkout.
- **SMS / Email notifications** — the `Notification` table exists but
  nothing writes to it yet.
- **Profile editing** — the form in `/dashboard#profile` is visual
  only; add a `PATCH /api/profile` route to make it real.

## Design tokens

| Token | Value |
|---|---|
| Deep navy | `#0A1628` |
| Silver | `#C9D2DD` |
| Cyan accent | `#4FDCE8` |
| Display font | Manrope |
| Body font | Inter |
| Data / mono font | IBM Plex Mono |
