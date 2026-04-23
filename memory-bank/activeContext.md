# Active Context

## Current Work Focus
- The main website is built, and the current focus is on developing a secure, authenticated admin panel (`admin.eayazilim.tr`) to handle "Contact Us" submissions. Development is divided into 3 phases: secure backend integration, admin dashboard foundation, and super-admin RBAC capabilities.

## Recent Changes
- Updated contact and address info to '+90 541 554 75 47' and 'Manisa/Şehzadeler'.
- Created and linked legal pages (`kullanim-kosullari.html`, `gizlilik-politikasi.html`, `iade-politikasi.html`, `kvkk-aydinlatma-metni.html`).
- Set up and styled the landing page using Tailwind CSS v4.
- Integrated `form-handler.js` to securely send contact forms directly to Supabase.
- Built a React (Vite) Admin Panel with Vanilla CSS, Auth protection, forced password resets, and RBAC admin management.
- Debugged Supabase RLS loop issue and login routing loop.

## Next Steps
- Deploy the Supabase Edge Function (`supabase-edge-function.ts`).
- Build and deploy the React Admin Panel to `admin.eayazilim.tr`.

## Active Decisions and Considerations
- Using a static HTML approach for the main marketing site for optimal performance.
- The Admin Panel uses a purely static React build communicating directly with Supabase via client-side requests.
- Sensitive user creation logic in the Admin Panel is offloaded to a Supabase Edge Function to avoid exposing the `service_role` key.
