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
