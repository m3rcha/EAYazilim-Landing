# System Patterns

## Architecture
- Static HTML multi-page website architecture.
- `index.html` serves as the main landing page with smooth scrolling sections for features, sectors, pricing, FAQ, and contact.
- Separate HTML files for distinct legal documents to keep the main page lightweight.

## Key Technical Decisions
- **Tailwind CSS (v4)**: Chosen for utility-first styling, enabling rapid UI development directly within HTML files without context-switching to CSS files.
- **Vanilla HTML/CSS**: No heavy frontend frameworks (React/Vue/Next.js) are used for the marketing site. This ensures simplicity, ease of hosting, and extremely fast load times.
- **Responsive Design**: Extensive use of Tailwind's responsive prefixes (`md:`, `lg:`) to ensure the design adapts from mobile phones to desktop displays.

## Component Relationships
- `index.html` links to a compiled CSS file (`./src/output.css`).
- Navigation links use relative paths for legal pages (e.g., `href="gizlilik-politikasi.html"`).
- Icons are implemented using inline SVG to avoid additional external requests.

## Admin Panel Architecture
- Developed as a separate React (Vite) Single Page Application inside the `admin-panel/` directory.
- Relies exclusively on **Vanilla CSS** for rich aesthetics, keeping it independent from the main site's Tailwind setup.
- Uses `react-router-dom` with robust route protection based on `supabase.auth` sessions.
- Security constraints heavily shape the architecture: it uses Supabase Edge Functions (`supabase-edge-function.ts`) to execute administrative tasks (like creating users) to prevent exposing the highly sensitive `service_role` key on the client side.
- Supabase Row Level Security (RLS) acts as the primary defense against unauthorized data access.
- Deployment architecture is optimized for **Vercel**, including a `vercel.json` rewrite rule (`"source": "/(.*)", "destination": "/index.html"`) to natively support React Router's client-side routing and prevent 404s on page refresh.

## POS Dashboard API Architecture
- Built as **Vercel Serverless Functions** inside the `pos-api/` directory, deployed as a separate Vercel project.
- Uses **Supabase service_role key** (server-side only) to bypass RLS for efficient aggregation queries.
- Two endpoints: `POST /api/transaction` (with Zod validation + 60-second duplicate detection) and `GET /api/dashboard-stats/[businessId]` (parallel aggregation queries with tier-based restrictions).
- **Middleware chain**: `withApiKey → withLicenseCheck → handler`. API key validated first (no DB call), then license status checked (1 DB query), then handler executes.
- **Tiered Licensing**: `businesses` table has `is_licensed`, `license_tier` (`basic`/`pro`/`enterprise`), and `license_expires_at`. Middleware returns 403 for deactivated or expired licenses.
- **Tier-based dashboard restrictions**: `basic` = daily stats + 5 recent, `pro` = daily + monthly + 10 recent, `enterprise` = full data including average ticket size.
- **Centralized logging**: Winston logger with custom Supabase transport writes errors/warnings to `system_logs` table.
- **Input validation**: Zod schema validation on `/api/transaction` with `z.coerce.number()` for .NET client compatibility.
- Security MVP: Dashboard access controlled via complex, non-predictable `business_id` codes (acts as a secret token). JWT auth planned for future.
- Businesses are managed via the Admin Panel (`/businesses` page) with auto-generated secure IDs.
- `transactions` table has composite indexes for fast filtering by `business_id + created_at` and duplicate detection.
