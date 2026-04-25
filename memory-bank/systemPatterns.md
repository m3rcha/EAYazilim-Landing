# System Patterns

## Architecture
- Static HTML multi-page website architecture for the main marketing site.
- `index.html` serves as the main landing page with smooth scrolling sections for features, sectors, pricing, FAQ, and contact.
- Separate HTML files for distinct legal documents to keep the main page lightweight.

## Key Technical Decisions
- **Tailwind CSS (v4)**: Chosen for utility-first styling, enabling rapid UI development directly within HTML files without context-switching to CSS files.
- **Vanilla HTML/CSS/JS**: No heavy frontend frameworks (React/Vue/Next.js) are used for the marketing site. This ensures simplicity, ease of hosting, and extremely fast load times.
- **Responsive Design**: Extensive use of Tailwind's responsive prefixes (`md:`, `lg:`) to ensure the design adapts from mobile phones to desktop displays.
- **Runtime Environment Config**: The main site loads `env.js` at runtime to inject Supabase credentials, avoiding the need for a build step for config changes.

## Component Relationships
- `index.html` links to a compiled CSS file (`./src/output.css`).
- Navigation links use relative paths for legal pages (e.g., `href="gizlilik-politikasi.html"`).
- Icons are implemented using inline SVG to avoid additional external requests.
- Contact form submissions are handled by `src/form-handler.js`, which uses the Supabase JS client (loaded from CDN) to insert directly into the `contacts` table.

## Admin Panel Architecture
- Developed as a separate React (Vite) Single Page Application inside the `admin-panel/` directory.
- Relies exclusively on **Vanilla CSS** (`index.css`) for rich aesthetics, keeping it independent from the main site's Tailwind setup.
- Uses `react-router-dom` with robust route protection based on `supabase.auth` sessions.
- Security constraints heavily shape the architecture: it uses Supabase Edge Functions (`supabase-edge-function.ts`) to execute administrative tasks (like creating users) to prevent exposing the highly sensitive `service_role` key on the client side.
- Supabase Row Level Security (RLS) acts as the primary defense against unauthorized data access.
- Deployment architecture is optimized for **Vercel**, including a `vercel.json` rewrite rule (`"source": "/(.*)", "destination": "/index.html"`) to natively support React Router's client-side routing and prevent 404s on page refresh.
- **Mobile-first responsive design**: The Admin Panel uses a bottom tab bar on mobile (transformed via CSS media queries), hide-on-mobile utility class, and responsive modals.

## POS Dashboard API Architecture
- Built as **Vercel Serverless Functions** inside the `pos-api/` directory, deployed as a separate Vercel project.
- Uses **Supabase service_role key** (server-side only) to bypass RLS for efficient aggregation queries.
- **Endpoints**:
  - `POST /api/transaction` — Zod validation + ID-based duplicate detection.
  - `GET /api/dashboard-stats/[businessId]` — Parallel aggregation queries with tier-based restrictions.
  - `POST /api/dashboard-login` — Authenticates business owners via Business ID + PIN, returns a JWT.
  - `GET|POST /api/license` — Verifies license status for a given business.
- **Middleware chain**: `withApiKey → withLicenseCheck → handler`.
  - `withApiKey` supports **dual authentication**:
    1. `X-API-Key` header for POS desktop clients.
    2. `Authorization: Bearer <JWT>` for dashboard clients.
  - For JWT auth, it verifies the token and ensures the `businessId` in the query matches the token's `businessId`.
- **Tiered Licensing**: `businesses` table has `is_licensed`, `license_tier` (`basic`/`pro`/`enterprise`), and `license_expires_at`. Middleware returns 403 for deactivated or expired licenses.
- **Auto-deactivation**: `licenseCheck.js` automatically sets `is_licensed = false` when an expired license is detected during a request.
- **Tier-based dashboard restrictions** (served by `/api/dashboard-stats/[businessId]`):
  - `basic`: daily stats, daily avg ticket, all monthly transactions.
  - `pro`: basic + monthly stats, monthly avg ticket, weekly comparison, cashier performance, 30-day chart.
  - `enterprise`: pro + annual revenue, peak hour heatmap.
- **Centralized logging**: Winston logger with custom Supabase transport writes errors/warnings to `system_logs` table.
- **Input validation**: Zod schema validation on `/api/transaction` with `z.coerce.number()` for .NET client compatibility.
- **Duplicate Detection**: `POST /api/transaction` is **idempotent**. If a client-provided `id` (UUID) already exists, it returns `200 OK` as if successful. This prevents POS systems from retrying indefinitely.
- **Security MVP**: Dashboard access controlled via complex, 12-character `business_id` codes (format: `XXXX-XXXX-XXXX`) and 6-digit hashed PINs. Login issues a **24-hour JWT** (`jsonwebtoken`) for subsequent API calls.
- Businesses are managed via the Admin Panel (`/businesses` page) with auto-generated secure IDs and PINs (hashed client-side with `bcryptjs`).
- `transactions` table uses a **UUID** as its primary key to naturally enforce data integrity and global uniqueness.

## POS Dashboard (Business Owner UI) Architecture
- Static single-page HTML application (`pos-dashboard/index.html`) with no build step.
- **Dark-mode UI** using CSS custom properties (`:root` variables).
- **Mobile-first tabbed layout**: On mobile, the dashboard splits into tabs (Özet / İşlemler / Çıkış) with a fixed bottom navigation bar.
- Uses **Chart.js** (CDN) for 30-day revenue charts and peak-hour heatmaps.
- Uses **SheetJS** (CDN) for Excel export and **jsPDF** (CDN) for PDF export (Enterprise tier only).
- **Session recovery**: Saves `business_id` and JWT token to `sessionStorage`; auto-refills the login form on refresh.
- **Auto-refresh**: Polls dashboard stats every 60 seconds.
- **License expiry warnings**: Displays a banner at 15, 10, 5, 3, and 1 days before expiration.
- Authentication flow:
  1. User submits Business ID + PIN to `/api/dashboard-login`.
  2. API verifies PIN with `bcryptjs` and returns a JWT.
  3. Dashboard uses `Authorization: Bearer <token>` for all subsequent `/api/dashboard-stats` requests.
