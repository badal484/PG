# ROOMLY — Verified PG & Co-living Management Platform

A full-stack SaaS platform for managed PG accommodations in India.  
Covers the entire lifecycle: discovery → booking → rent collection → move-out.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTS                             │
│  Next.js 16 (apps/web)                                      │
│  ├── Marketplace  (/search, /properties/[slug], /cities/)   │
│  ├── Tenant portal (/tenant/*)                              │
│  ├── Owner dashboard (/owner/*)                             │
│  ├── PMS mobile-first (/pms/[propertyId]/*)                 │
│  └── Admin panel (/admin/*)                                 │
└────────────────────┬────────────────────────────────────────┘
                     │ REST + JWT
┌────────────────────▼────────────────────────────────────────┐
│                    API  (apps/api)                           │
│  NestJS 11 · /api/v1/*                                      │
│  ├── Auth (OTP via MSG91 + JWT)                              │
│  ├── Properties / Beds (inventory)                           │
│  ├── Bookings (KYC → Payment → Agreement → Active)          │
│  ├── Payments (Razorpay Route split-settlement)             │
│  ├── PMS (rent, complaints, expenses, food, meters)         │
│  ├── Notifications (WhatsApp/SMS/Email/In-app)              │
│  └── Admin (verifications, disputes, escrow, audit log)     │
└──────┬─────────────┬──────────────┬──────────────┬──────────┘
       │             │              │              │
  PostgreSQL      Redis         Algolia        AWS
  (Prisma ORM)  (cache/queue)  (search)    (S3/SES/CW)
```

**Key integrations:**

| Service | Purpose |
|---|---|
| Razorpay Route | Split-settlement: deposit → escrow, rent → owner, commission → platform |
| AiSensy | WhatsApp notifications (12 templates) |
| MSG91 | OTP + transactional SMS |
| AWS SES | Transactional email with PDF attachments |
| AWS S3 + CloudFront | File storage (photos, KYC, agreements, receipts) |
| Algolia | Full-text + geo property search |
| Signzy | KYC verification (Aadhaar + PAN + Face) |
| Digio | e-Sign rental agreements |
| BullMQ + Redis | Background job queues |
| Puppeteer | Server-side PDF generation |

---

## Prerequisites

- **Node.js** 20+
- **pnpm** 9.1.0 — `npm install -g pnpm@9.1.0`
- **Docker + Docker Compose** (for local Postgres + Redis)
- **Git**

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/badal484/PG.git roomly && cd roomly

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL, JWT_SECRET, REFRESH_TOKEN_SECRET

# 4. Start infrastructure
docker compose up -d postgres redis

# 5. Run database migrations
cd packages/database && npx prisma migrate dev && cd ../..

# 6. Seed development data
cd packages/database && npx prisma db seed && cd ../..

# 7. Start dev servers (API + Web in parallel)
pnpm dev
```

- **Web:** http://localhost:3000
- **API:** http://localhost:4000/api/v1
- **Swagger:** http://localhost:4000/api/docs
- **pgAdmin:** http://localhost:5050 (admin@roomly.in / admin)

---

## Environment Variables

### Required (app will not start without these)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Min 32 chars — signs access tokens |
| `REFRESH_TOKEN_SECRET` | Min 32 chars — signs refresh tokens |

### Required in production (warn in dev, fatal in prod)

| Variable | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM key for S3 + SES + CloudWatch |
| `AWS_SECRET_ACCESS_KEY` | IAM secret |
| `AWS_S3_BUCKET` | S3 bucket name |
| `SES_FROM_EMAIL` | Verified SES sender address |
| `RAZORPAY_KEY_ID` | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature secret |
| `AISENSY_API_KEY` | AiSensy WhatsApp API key |
| `MSG91_AUTH_KEY` | MSG91 SMS API key |

### Optional (features degrade gracefully without these)

| Variable | Default | Description |
|---|---|---|
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `ALGOLIA_APP_ID` | — | Server-side Algolia sync |
| `ALGOLIA_ADMIN_KEY` | — | Server-side Algolia writes |
| `NEXT_PUBLIC_ALGOLIA_APP_ID` | — | Client-side search |
| `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` | — | Client-side search key |
| `CLOUDFRONT_URL` | S3 URL | CDN base for property photos |
| `SIGNZY_API_KEY` | — | KYC verification |
| `DIGIO_CLIENT_ID` | — | e-Sign agreements |
| `CW_LOG_GROUP` | — | CloudWatch log group for errors |

---

## Sandbox Accounts Setup

### Razorpay Test
1. Sign up at [razorpay.com](https://razorpay.com) → Test mode
2. Copy `rzp_test_*` key to `RAZORPAY_KEY_ID`
3. For Route (escrow): enable "Route" in the dashboard
4. Test card: `4111 1111 1111 1111` / any CVV / future expiry

### Signzy Sandbox (KYC)
```
SIGNZY_BASE_URL=https://preproduction.signzy.app/api/v3
SIGNZY_API_KEY=<from sandbox dashboard>
```
Test Aadhaar: `999941057058`

### Digio Sandbox (e-Sign)
```
DIGIO_BASE_URL=https://ext.digio.in:444
DIGIO_ENVIRONMENT=sandbox
```

### AiSensy WhatsApp
In sandbox mode messages go to your registered test number only.

### MSG91 OTP
In `NODE_ENV=development`, OTP is hardcoded to `123456` — no MSG91 calls are made.

---

## Running Tests

```bash
# All tests (turbo)
pnpm test

# API unit tests
pnpm --filter api test

# With coverage
pnpm --filter api test:cov

# E2E (requires running DB)
pnpm --filter api test:e2e
```

---

## Deployment

### Web → Vercel
```bash
cd apps/web && vercel --prod
```
Set all `NEXT_PUBLIC_*` env vars in Vercel dashboard.

### API → Railway / AWS ECS
```bash
cd apps/api && npm run build && npm run start:prod
```

**Pre-deployment checklist:**
- [ ] `NODE_ENV=production`
- [ ] All required env vars set (API refuses to start without them)
- [ ] `npx prisma migrate deploy` run against production DB
- [ ] Razorpay webhook URL set: `POST /api/v1/payments/webhook`
- [ ] S3 bucket CORS + CloudFront configured
- [ ] SES identity verified for `SES_FROM_EMAIL`

---

## API Documentation

Swagger UI at `/api/docs` (dev + staging only — disabled in production).

Endpoints requiring no auth:
- `GET /health`
- `POST /api/v1/auth/send-otp`
- `POST /api/v1/auth/verify-otp`
- `GET /api/v1/properties` (public search)
- `GET /api/v1/properties/:slug`

---

## Key Design Decisions

**Escrow model (Razorpay Route):** Deposits never touch ROOMLY's bank account. They go to a Razorpay Route sub-account and are released only after checkout inspection sign-off — protecting tenants from fraud and ROOMLY from liability.

**Bed-level inventory:** Bookings are at the individual bed level, not room level. This enables mixed-sharing rooms, precise vacancy tracking, and per-bed pricing.

**WhatsApp-first notifications:** All critical notifications (OTP, booking, rent reminders, dispute resolution) are sent via WhatsApp first, with SMS as fallback and email for PDFs.

**OTP-only auth:** No passwords — eliminates credential stuffing, password reset flows, and password storage liability.

**Role scoping:** MANAGER/WARDEN access is scoped to specific properties via `PropertyStaff` assignments, not at the account level.
