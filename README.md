# NSO (NewShopping Orbit) — Mobile Marketplace App

> **Brand Identity:** NSO Red (`#E53935`)  
> **Slogan:** *"Your needs. Our orbit."*  
> **Concept:** Mobile-first all-in-one marketplace for physical products and regular services with AI-assisted discovery, an Admin-controlled special request path, and authorized multi-role access.

---

## 📌 Executive Summary & Blueprint Alignment

This project strictly follows the **NSO Codex Mobile App Build Brief (Pages 1–10)**:
1. **Brand Standard:** The NSO logo and brand name are prominently red across splash, login, headers, and branded surfaces. Other app categories feature accessible, vibrant colors.
2. **One Account, Multiple Authorized Roles:** Customers, Product Sellers, Service Providers, and Admins share a single account model. Role switching requires explicit verification/approval (Sellers and Providers require Admin verification; Admin requires security authorization).
3. **Core Marketplace:** 
   - **Physical Products:** Product details, variant selection, seller attribution, regional delivery fee breakdown, full total before approval, order fulfillment pipeline (`Confirmed` → `Packed` → `Shipped` → `Out for Delivery` → `Delivered`).
   - **Regular Services:** Verified providers, home visit vs. provider hub selection, interactive slot picker, conflict prevention (blocking personal overlaps), and booking tracking.
4. **Guardrails & Provider Scheduling Rules:**
   - **AI Assistant:** *"A recommendation is not an order."* AI assists with comparisons and guidance; explicit customer confirmation is required before committing any checkout or booking.
   - **Provider Revised Quotations:** If on-site extra work is required, provider submits a revised quote → Admin reviews and approves → Customer explicitly accepts before extra work starts.
   - **Special Request to Admin:** Out-of-category custom requests go strictly to Admin for private coordination with an assigned Request ID. **No public gig/freelance board**.
5. **Transparency & Simulation Labeling:** All mock payments, simulated OTPs, and demo AI adapters are clearly tagged with `[DEMO / SIMULATION]` badges. No live wallets, escrow, or fund-holding mechanisms are present pending regulatory validation.

---

## 🚀 Setup & Run Instructions

### Prerequisites
- Node.js (v18+ or v24+ recommended)
- npm (v9+)

### Installation
Dependencies are already installed. If reinstalling from scratch:
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
The local server will start at `http://localhost:3000` (or `http://localhost:5173`).

### Production Build
```bash
npm run build
```

---

## 📱 Mobile-First Testing & Viewport Controls

The application includes an integrated **Viewport Simulator**:
- **Android Viewport:** Previews the app in a realistic 430px smartphone shell with an Android status bar, touch-friendly tap targets, and persistent bottom navigation bar: `Home`, `Explore`, `Ask NSO`, `Orders`, and `Account`.
- **Expanded View:** Expands the layout to test tablet or responsive display.

---

## 🔑 Demo Credentials & Quick Switch

- **Preloaded Profile:** Naveen U. (`+91 98765 43210`)
- **Simulated OTP:** Enter any 4 digits (e.g. `1234`)
- **Role Switcher:** Tap the role badge in the top right header to switch instantly between:
  - `Customer View`
  - `Seller Portal`
  - `Provider Portal`
  - `Admin Console`
- **Reset State:** Use "Reset Demo State" in the header or Account menu to reset `localStorage` data to initial defaults.

---

## ⚙️ Configuration & Pending Decisions Reference

Per Section 8 of the brief, the following policies are decoupled and configurable:
- `regionalDeliveryFee`: Configured per seller in `src/data/mockData.ts` and dynamically calculated at checkout.
- `cancellationPolicy`: Managed per service category.
- `platformCommissionRate`: Planned 10% commission on seller/provider transactions; ₹0 buyer fee.
- `auditLog`: Recorded automatically in `src/context/AppContext.tsx` for every critical action.

---

## 📋 Acceptance Checklist Status

| Requirement | Implementation Status | Location |
|---|---|---|
| **NSO Red Brand Rule** | ✅ Complete | [tailwind.config.js](file:///c:/NSO(NEW%20SHOPPIMG%20ORBIT)/tailwind.config.js), [BrandHeader.tsx](file:///c:/NSO(NEW%20SHOPPIMG%20ORBIT)/src/components/common/BrandHeader.tsx) |
| **Persistent Bottom Bar** | ✅ Complete | [BottomNav.tsx](file:///c:/NSO(NEW%20SHOPPIMG%20ORBIT)/src/components/common/BottomNav.tsx) |
| **Physical Product Cart & Checkout Total** | ✅ Complete | [CartCheckoutModal.tsx](file:///c:/NSO(NEW%20SHOPPIMG%20ORBIT)/src/components/customer/CartCheckoutModal.tsx) |
| **Service Booking & Slot Conflict Prevention** | ✅ Complete | [ServiceBookingModal.tsx](file:///c:/NSO(NEW%20SHOPPIMG%20ORBIT)/src/components/customer/ServiceBookingModal.tsx) |
| **AI Comparison & Explicit Approval Guardrail** | ✅ Complete | [AskNSOScreen.tsx](file:///c:/NSO(NEW%20SHOPPIMG%20ORBIT)/src/components/ai/AskNSOScreen.tsx) |
| **Special Request to Admin (No public gig board)**| ✅ Complete | [SpecialRequestModal.tsx](file:///c:/NSO(NEW%20SHOPPIMG%20ORBIT)/src/components/special/SpecialRequestModal.tsx) |
| **Provider Revised Quotes (Admin + Customer Sign-off)** | ✅ Complete | [ProviderDashboard.tsx](file:///c:/NSO(NEW%20SHOPPIMG%20ORBIT)/src/components/provider/ProviderDashboard.tsx), [OrdersScreen.tsx](file:///c:/NSO(NEW%20SHOPPIMG%20ORBIT)/src/components/customer/OrdersScreen.tsx) |
| **Role Dashboards (Seller, Provider, Admin)** | ✅ Complete | `src/components/seller`, `provider`, `admin` |
| **Audit Log with Actors & Timestamps** | ✅ Complete | [AdminDashboard.tsx](file:///c:/NSO(NEW%20SHOPPIMG%20ORBIT)/src/components/admin/AdminDashboard.tsx) |
