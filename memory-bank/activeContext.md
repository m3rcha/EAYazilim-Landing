# Active Context

## Current Work Focus
- Implementing Tiered Licensing System across Database, API, and Admin Panel.
- Phases 1 (DB schema) and 2 (API middleware) are complete. Phase 3 (Admin UI) is next.
- The dashboard is a client-side static application that consumes the `pos-api` analytics.
- The API uses Supabase (service_role key) as its data layer with `businesses` and `transactions` tables.

- **Pricing Model Restructure (completed):**
  - Replaced 3-tier pricing (Başlangıç/Pro/Enterprise) with base subscription + add-ons model.
  - Base price: 900₺/month or 9,000₺/year (2 months free).
  - 14 add-on modules with individual pricing displayed on landing page.
  - Created interactive pricing calculator in Admin Panel (`/pricing-calculator`) for customer communications.
  - Updated contact form dropdown to reflect new pricing structure.
- **Landing Page Updates (completed):**
  - Updated navigation labels from "Sektörler" to "Çözümler" to match the "Efficiency-Focused Digital Transformation" section content.
  - Updated contact email from `info@eayazilim.com` to `bilgi@eayazilim.tr` for consistency.
- **POS API Production Upgrade (completed):**
  - Phase 1: Added Zod input validation to `/api/transaction`
  - Phase 2: Created Winston logger with custom Supabase transport (`system_logs` table)
  - Phase 3: Built Admin Business Management page (`BusinessManagement.jsx`) with secure ID generation
  - Phase 4: Added API Key middleware (`withApiKey`) protecting both endpoints
- **Admin Panel Reporting (completed):**
  - Added `jspdf` and `jspdf-autotable` to `admin-panel` for client-side PDF generation.
  - Implemented `handleDownloadPDF` inside the "Edit Business" modal to export 30-day transaction history.
  - Added "Aylık Ekstre Gönder" button as a placeholder for future email automation.
  - Added RLS policy to `supabase_schema.sql` allowing `authenticated` admins to read `transactions` (fixing "0 rows" issue).
  - Fixed ES Module import pattern for `jspdf-autotable` to resolve `autoTable is not a function`.
- **Tiered Dashboard Implementation (completed):**
  - Updated API to serve tiered analytics entirely in memory, removing `.limit(50)` to serve all monthly transactions for all tiers.
  - Created modular dashboard UI that hides/shows charts, heatmaps, and device performance based on the active tier.
  - Added frontend date/time filtering for transactions table (exclusive to Pro/Enterprise tiers).
- Discussed Git architecture strategies (Submodules vs Subtree) for extracting `admin-panel` into a separate repository.
- Successfully deployed `admin-panel` to Vercel.
- Resolved and deployed Supabase Edge Function (`create-admin`) to fix admin creation functionality in production.
- Updated "Neden EA Yazılım?" section with focus on offline operation, modern UI, performance, and support.
- Transformed "Sektörel Çözümler" into "Verimlilik Odaklı Dijital Dönüşüm" focusing on cost management, speed, and reporting.
- Switched pricing model from one-time fees to annual rates + VAT, with improved layout.
- Added annual/monthly pricing toggle with pill-style UI and micro-animations.
- Updated FAQ section with 4 new professional Q&As and smooth accordion animations.
- Created POS Dashboard API (`pos-api/`) as Vercel Serverless Functions.
- Built the Business Owner Dashboard (`pos-dashboard/`) for `restoran.eayazilim.tr` with dark-mode UI and real-time stats.
- Extended Supabase schema with `businesses` and `transactions` tables (Phase 4).
- Fixed multiple POS API bugs (`dashboard-login.js` import paths, `apiKey.js` syntax errors) that were causing 500 errors disguised as CORS errors.
- Adjusted `pos-api` CORS settings to allow `*` for local `demo-pos.html` testing.
- **Secure Identification (completed):**
  - Implemented 12-character cryptographically secure Business IDs (`XXXX-XXXX-XXXX`).
  - Implemented 6-digit Dashboard PINs for business owner login.
  - Integrated `bcryptjs` for hashing PINs before storing them in the database.
- **Transaction Integrity (completed):**
  - Shifted from 60-second time-based duplicate detection to **Primary Key (id)** based detection using **UUIDs**.
  - Implemented **Idempotent** behavior: If a duplicate `id` is submitted, the API returns `200 OK` instead of an error, ensuring POS systems don't get stuck in retry loops.
  - The API now enforces that the `id` field in the payload is a valid UUID string (validated via Zod).
  - This ensures global uniqueness and prevents duplicate submissions by leveraging the database's primary key constraints.

## Next Steps
- **Email Automation:** 
  - Integrate a service like Resend or Mailgun to send monthly statements.
  - Replace the placeholder button in the Admin Panel with actual functionality.
- **Security Enhancements:**
  - Implement Supabase JWT/Auth for dashboard endpoints to replace the current ID+PIN mechanism for higher security.
  - Implement rate limiting on the API endpoints.
- **Maintenance:**
  - Run SQL migration for the `email` column in `admin_roles` on the production database.

## Active Decisions and Considerations
- Using a static HTML approach for the main marketing site for optimal performance.
- The Admin Panel uses a purely static React build communicating directly with Supabase via client-side requests.
- Sensitive user creation logic in the Admin Panel is offloaded to a Supabase Edge Function to avoid exposing the `service_role` key.
- Pricing model shifted from tiered packages to base + add-ons for greater flexibility and transparency.
