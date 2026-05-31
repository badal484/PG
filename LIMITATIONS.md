# Known Limitations & Stubs

This document lists features that are architecturally stubbed, mocked, or simplified in the current implementation. Each item notes what is wired, what is missing, and what to do in production/v2.

---

## Integrations

### 360° Tour Viewer
**What's built:** `Tour360` model in DB, URL storage in S3, iframe embed on property detail page.  
**What's missing:** [Marzipano](https://www.marzipano.net/) or [Pannellum](https://pannellum.org/) integration for interactive sphere rendering.  
**Production fix:** Add `<Pannellum>` React component, pass `tour.url` from S3.

### KYC — Face Match
**What's built:** Signzy API call for Aadhaar + PAN verification; sandbox returns mock `VERIFIED`.  
**What's missing:** Real face matching between selfie and Aadhaar photo (Signzy's `faceMatch` endpoint).  
**Production fix:** Add selfie upload step in KYC flow; pass `selfieUrl` + `aadhaarFrontUrl` to Signzy `faceMatch` API.

### Smart Lock Integration
**What's built:** `asset.category === 'OTHER'` can represent a lock; structure exists in DB.  
**What's missing:** Physical lock API integration (TTLock, Nuki, or Yale).  
**Production fix:** Add `SmartLock` model, webhook for access events, OTP-based temp access codes.

### CCTV Feed
**What's built:** Placeholder boolean `hasCCTV` in property schema.  
**What's missing:** Camera feed integration or AI motion-alert webhooks.  
**Status:** Phase 3 only — requires hardware partnership.

### Biometric Attendance
**What's built:** `StaffAttendance` model in DB with check-in/out times.  
**What's missing:** Biometric device SDK integration (ZKTeco or similar).  
**Production fix:** Expose webhook endpoint; device pushes attendance events to `POST /api/v1/pms/:propertyId/attendance`.

---

## Features

### Smart Expense Categorization
**What's built:** Manual category selection + keyword-hint logic in UI.  
**What's missing:** ML-based auto-categorization from receipt OCR.  
**Production fix:** Integrate AWS Textract (receipt OCR) → GPT-4 classification → pre-fill category.

### Dynamic Pricing Suggestions
**What's built:** Static price display from DB.  
**What's missing:** "Market rate suggestion" that compares rent to nearby beds.  
**Production fix:** Compute 75th percentile rent for `(city, locality, genderPolicy, sharingType)` from analytics table. Needs 6+ months of data for reliable signal.

### Tenant Credit Scoring for Micro-lending
**What's built:** `trustScore` field in `TenantProfile` (default 100).  
**What's missing:** Score computation logic, lender integration.  
**Status:** Phase 3 — requires NBFC partnership and RBI compliance review.

### Predictive Vacancy Alerts
**What's built:** `Notice` model tracks upcoming move-outs.  
**What's missing:** Email/WhatsApp to waiting-list tenants when bed relists.  
**Production fix:** Add `WaitlistEntry` model; on notice creation, query waitlist for matching criteria and trigger `booking_available` WhatsApp template.

---

## PDF Generation

### Handlebars `eq` Helper
**What's built:** `INSPECTION_TEMPLATE` uses `{{#if (eq status 'DAMAGED')}}` in the Handlebars template.  
**What's missing:** The `eq` helper is not registered by default in Handlebars.  
**Fix:**
```typescript
Handlebars.registerHelper('eq', (a, b) => a === b);
```
Add this in `PdfService` constructor before any template compilation.

---

## Infrastructure

### Mobile Apps
**What's built:** Web-first responsive UI; PMS is mobile-optimized with bottom tabs.  
**What's missing:** Native iOS/Android apps.  
**Recommendation:** Flutter (single codebase), wrapping the same REST API.

### Offline Support
**What's built:** Basic Next.js static export capability.  
**What's missing:** Service Worker for offline shell; PMS pages need offline-capable read access.  
**Production fix:** Add `next-pwa` or Workbox; cache property detail and PMS home pages.

### Multi-region / CDN
**What's built:** Single-region AWS (ap-south-1).  
**What's missing:** Edge caching for property search results, multi-region DB read replicas.  
**Production fix:** CloudFront for API caching on `GET /properties`; Aurora read replicas for scaling.

### Horizontal API Scaling
**What's built:** Stateless API with Redis for session/cache — ready for horizontal scaling.  
**What's missing:** BullMQ workers run in the same process as the API server.  
**Production fix:** Extract `JobsModule` workers into a separate NestJS app (`apps/worker`) for independent scaling.

---

## Security

### File Upload Virus Scan
**What's built:** Type + size validation on upload; files go to S3.  
**What's missing:** Virus scan on upload (Lambda trigger → ClamAV or AWS Macie).  
**Note:** File uploads currently skip virus scanning. Add S3 event trigger → Lambda with ClamAV before exposing uploaded files to other users.

### PAN Encryption at Rest
**What's built:** PAN stored as plain text in `OwnerProfile.panNumber`.  
**What's missing:** AES-256 encryption before write, decryption on read.  
**Production fix:** Add `@BeforeInsert`/`@BeforeUpdate` Prisma middleware using `crypto.createCipheriv`.

### Aadhaar Masking
**What's built:** Aadhaar stored in `KYCRecord.aadhaarNumber` as plain text.  
**What's missing:** Masking (store only last 4 digits) + hash for dedup.  
**Legal requirement:** UIDAI guidelines prohibit storing full Aadhaar numbers without AUA/KUA registration. **Fix before going live.**

---

## Testing

### Frontend Tests
**What's built:** Vitest + React Testing Library config.  
**What's missing:** Actual component test files (MSW handlers, form tests).  
**Estimated effort:** 2 sprints to reach 60% coverage on critical flows.

### E2E Tests
**What's built:** Playwright config placeholder.  
**What's missing:** Full booking flow E2E (Playwright + Razorpay test mode).  
**Production fix:** Add Playwright tests for: homepage search → property detail → booking → payment (Razorpay test) → confirmation.
