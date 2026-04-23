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
- `@tailwindcss/cli`: ^4.2.4
- `autoprefixer`: ^10.5.0
- `postcss`: ^8.5.10
- `tailwindcss`: ^4.2.4
*(All listed under devDependencies in `package.json`)*
