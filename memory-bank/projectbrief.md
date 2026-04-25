# Project Brief

## EA Yazılım Website & POS Ecosystem

**Description**: 
Landing page and static website for EA Yazılım, a company developing modern POS (Point of Sale) applications. The project has evolved into a multi-site ecosystem comprising a marketing landing page, a secure admin panel, a POS API backend, and a business owner dashboard.

**Core Requirements & Goals**:
- Provide a high-conversion, minimalist landing page for EA Yazılım POS software.
- Showcase the software's features, target sectors (cafes, restaurants, chain branches), and transparent pricing with a base subscription (900₺/month) plus optional add-on modules.
- Provide business contact information and integrated lead generation forms.
- Ensure legal compliance and build trust with dedicated pages for Terms of Service (Kullanım Koşulları), Privacy Policy (Gizlilik Politikası), KVKK Disclosure (KVKK Aydınlatma Metni), and Refund Policy (İade Politikası).
- Implement a secure admin panel (`admin.eayazilim.tr`) to handle contact form submissions, incorporating authentication and super-admin user management (RBAC), plus a pricing calculator for customer communications.
- Provide a POS Dashboard API (`pos-api`) for receiving transaction data from POS clients and serving aggregated analytics.
- Provide a Business Owner Dashboard (`restoran.eayazilim.tr`) for real-time sales tracking, accessible via secure Business ID and PIN.

**Domains**:
- `eayazilim.tr` — Main marketing site
- `admin.eayazilim.tr` — Admin Panel (React SPA)
- `restoran.eayazilim.tr` — Business Owner Dashboard (static HTML)
