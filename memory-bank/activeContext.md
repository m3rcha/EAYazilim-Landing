# Active Context

## Current Work Focus
- Implementing Tiered Licensing System across Database, API, and Admin Panel.
- Phases 1 (DB schema) and 2 (API middleware) are complete. Phase 3 (Admin UI) is next.
- The dashboard is a client-side static application that consumes the `pos-api` analytics.
- The API uses Supabase (service_role key) as its data layer with `businesses` and `transactions` tables.

## Recent Changes
- **POS API Production Upgrade (completed):**
  - Phase 1: Added Zod input validation to `/api/transaction`
  - Phase 2: Created Winston logger with custom Supabase transport (`system_logs` table)
  - Phase 3: Built Admin Business Management page (`BusinessManagement.jsx`) with secure ID generation
  - Phase 4: Added API Key middleware (`withApiKey`) protecting both endpoints
- **Tiered Licensing System (in progress):**
  - Phase 1 (DB): Added `is_licensed`, `license_tier`, `license_expires_at` columns to `businesses` table. Added super_admin UPDATE policy.
  - Phase 2 (API): Created `withLicenseCheck` middleware. Chain order: `withApiKey → withLicenseCheck → handler`. Added tier-based dashboard data restrictions (basic=daily only, pro=monthly, enterprise=full). Removed inline business checks from handlers.
- Previous: Updated contact info, legal pages, landing page design, admin panel with RBAC, POS Dashboard API and frontend.
- Updated contact and address info to '+90 541 554 75 47' and 'Manisa/Şehzadeler'.
- Created and linked legal pages (`kullanim-kosullari.html`, `gizlilik-politikasi.html`, `iade-politikasi.html`, `kvkk-aydinlatma-metni.html`).
- Set up and styled the landing page using Tailwind CSS v4.
- Integrated `form-handler.js` to securely send contact forms directly to Supabase.
- Built a React (Vite) Admin Panel with Vanilla CSS, Auth protection, forced password resets, and RBAC admin management.
- Debugged Supabase RLS loop issue and login routing loop.
- Added `vercel.json` to the `admin-panel` for SPA routing support.
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

## Next Steps
- **Tiered Dashboard Implementation (3 Phases):**
  - Phase 1: Database & API Updates (Adding mock data or new schema for products/cashiers, updating tier restrictions in API).
  - Phase 2: POS Dashboard HTML/CSS Updates (Creating tier-specific layouts, charts, and tables).
  - Phase 3: POS Dashboard JS Integration (Rendering correct components based on `license_tier` and resolving the 'loading' state bug for lower tiers).
- Implement Supabase JWT/Auth for dashboard endpoints (future security enhancement).

## Active Decisions and Considerations
- Using a static HTML approach for the main marketing site for optimal performance.
- The Admin Panel uses a purely static React build communicating directly with Supabase via client-side requests.
- Sensitive user creation logic in the Admin Panel is offloaded to a Supabase Edge Function to avoid exposing the `service_role` key.
