# Active Context

## Current Work Focus
- All major infrastructure (Admin Panel, POS API, POS Dashboard, Tiered Licensing) is fully implemented and deployed.
- The system is in a **maintenance and stabilization** phase.
- Outstanding enhancements are primarily around automation and security hardening.

## Recently Completed Work
- **Tiered Licensing System**: Fully implemented across Database, API, and Admin Panel. All phases (DB schema, API middleware, Admin UI controls) are complete.
- **Pricing Model Restructure**: Replaced 3-tier pricing (Başlangıç/Pro/Enterprise) with base subscription + add-ons model.
  - Base price: 900₺/month or 9,000₺/year (2 months free).
  - 14 add-on modules with individual pricing displayed on landing page.
  - Interactive pricing calculator in Admin Panel (`/pricing-calculator`) for customer communications.
- **Landing Page Updates**:
  - Transformed "Sektörel Çözümler" into "Verimlilik Odaklı Dijital Dönüşüm" focusing on cost management, speed, and reporting.
  - Switched pricing model from one-time fees to annual rates + VAT, with improved layout.
  - Added annual/monthly pricing toggle with pill-style UI and micro-animations.
  - Updated FAQ section with 4 new professional Q&As and smooth accordion animations.
- **POS API Production Upgrade**:
  - Phase 1: Added Zod input validation to `/api/transaction`
  - Phase 2: Created Winston logger with custom Supabase transport (`system_logs` table)
  - Phase 3: Built Admin Business Management page (`BusinessManagement.jsx`) with secure ID generation
  - Phase 4: Added API Key middleware (`withApiKey`) protecting both endpoints
  - Phase 5: Added JWT-based authentication for dashboard clients (`/api/dashboard-login`)
- **Admin Panel Reporting**:
  - Added `jspdf` and `jspdf-autotable` to `admin-panel` for client-side PDF generation.
  - Implemented `handleDownloadPDF` inside the "Edit Business" modal to export 30-day transaction history.
  - Added "Aylık Ekstre Gönder" button as a placeholder for future email automation.
  - Added RLS policy to `supabase_schema.sql` allowing `authenticated` admins to read `transactions`.
- **Tiered Dashboard Implementation**:
  - Updated API to serve tiered analytics entirely in memory.
  - Created modular dashboard UI that hides/shows charts, heatmaps, and device performance based on the active tier.
  - Added frontend date/time filtering for transactions table (exclusive to Pro/Enterprise tiers).
- **POS Dashboard Mobile Optimization**:
  - Split into tabbed mobile layout (Özet / İşlemler / Çıkış) with a fixed bottom navigation bar.
- **Branding**:
  - `logo-horizontal.svg` and `logo-square.svg` designed and deployed.
  - Logos implemented across all three sites: `eayazilim.tr`, `admin.eayazilim.tr`, `restoran.eayazilim.tr`.
  - Favicons updated on all three sites to use `logo-square.svg`.
  - Browser tab titles updated with proper product names.
- **Transaction Integrity**:
  - Shifted from 60-second time-based duplicate detection to **Primary Key (id)** based detection using **UUIDs**.
  - Implemented **Idempotent** behavior: If a duplicate `id` is submitted, the API returns `200 OK` instead of an error, ensuring POS systems don't get stuck in retry loops.
- **Secure Identification**:
  - Implemented 12-character cryptographically secure Business IDs (`XXXX-XXXX-XXXX`).
  - Implemented 6-digit Dashboard PINs for business owner login.
  - Integrated `bcryptjs` for hashing PINs before storing them in the database.
- **License Management**:
  - License expiry warning banner added to POS Dashboard (shown at 15, 10, 5, 3, 1 days remaining).
  - Auto-deactivation: When an expired business tries to log in or transact, `is_licensed` is set to `false` automatically via `licenseCheck.js` middleware.

## Next Steps
- **Email Automation**:
  - Integrate a service like Resend or Mailgun to send monthly statements.
  - Replace the placeholder button in the Admin Panel with actual functionality.
  - Note: The `admin_roles.email` column exists but the Edge Function does **not** currently populate it on user creation. This must be fixed before email workflows can rely on the `admin_roles` table for addresses.
- **Security Enhancements**:
  - Implement rate limiting on the API endpoints to prevent abuse.
  - Consider migrating dashboard endpoints from simple JWT to Supabase JWT/Auth for higher security.
- **Code Consistency**:
  - Landing page contact email and navigation labels are now aligned with branding (`bilgi@eayazilim.tr` and `Çözümler`).

## Active Decisions and Considerations
- Using a static HTML approach for the main marketing site for optimal performance.
- The Admin Panel uses a purely static React build communicating directly with Supabase via client-side requests.
- Sensitive user creation logic in the Admin Panel is offloaded to a Supabase Edge Function to avoid exposing the `service_role` key.
- Pricing model shifted from tiered packages to base + add-ons for greater flexibility and transparency.
- The POS API uses a dual-authentication middleware (`withApiKey`) to support both POS hardware clients (API Key) and browser-based dashboards (JWT) with a single unified pipeline.
