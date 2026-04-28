# Tech Context

## Technologies Used
- HTML5
- Tailwind CSS (v4.2.4)
- Vanilla JavaScript (for minimal interactions, if any)

## Development Setup
- Node.js environment utilized primarily for the Tailwind CSS build process.
- `package.json` contains the necessary scripts and devDependencies for Tailwind.
- CSS is written/configured in `src/input.css` and compiled to `./src/output.css`.

## Technical Constraints
- The project is a static site, meaning dynamic backend functionality (like sending emails directly from the contact form) will require an external service (e.g., Formspree, Netlify Forms) or a custom backend endpoint.

## Dependencies
### Root / Marketing Site (`package.json`)
- `@tailwindcss/cli`: ^4.2.4
- `autoprefixer`: ^10.5.0
- `postcss`: ^8.5.10
- `tailwindcss`: ^4.2.4
*(All listed under devDependencies)*

### POS API Dependencies (`pos-api/package.json`)
- `@supabase/supabase-js`: ^2.49.0
- `bcryptjs`: ^3.0.3
- `jsonwebtoken`: ^9.0.3
- `winston`: ^3.17.0
- `zod`: ^3.24.0

### Admin Panel Dependencies (`admin-panel/package.json`)
- `@supabase/supabase-js`: ^2.104.1
- `bcryptjs`: ^3.0.3 (for client-side PIN hashing)
- `jspdf`: ^4.2.1 (for client-side PDF generation)
- `jspdf-autotable`: ^5.0.7
- `lucide-react`: ^1.9.0
- `react`: ^19.2.5
- `react-dom`: ^19.2.5
- `react-router-dom`: ^7.14.2
- `vite`: ^8.0.10

### POS Dashboard (CDN-loaded, no package.json)
- Chart.js (CDN)
- SheetJS / xlsx (CDN)
- jsPDF + jspdf-autotable (CDN)
