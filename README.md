# NSO (NewShopping Orbit) — Production Marketplace MVP (Bengaluru Pilot)

> **Brand Identity:** NSO Red (`#E53935`)  
> **Slogan:** *"Your needs. Our orbit."*  
> **Concept:** Mobile-first marketplace for real physical products and bookable local services across Bengaluru. Built for real customers, real sellers, real service providers, and a private marketplace owner dashboard.

---

## 📌 Architecture Overview

1. **Backend Engine:** Node.js (v24 native `node:sqlite` + `node:crypto` + Express + CORS)
2. **Persistent Database:** SQLite WAL Mode (`server/data/nso_marketplace.db`) with automatic schema setup, ACID transactions, atomic inventory reservation, and booking conflict prevention.
3. **Authentication & Sessions:**
   - 6-digit real OTP via configurable SMS provider (`console` for dev, `twilio`, or `msg91` for production).
   - HMAC-SHA256 signed session cookies (`nso_session`).
   - Session invalidation across devices on new login.
   - Owner access granted strictly by server-side `ADMIN_PHONE` environment variable.
4. **Mobile & Frontend:**
   - React 19 + TypeScript 5.7 + Vite 6 + Tailwind CSS 3.4.
   - Native Android wrapping via Capacitor 8 (`com.nso.orbit`).
   - Android Debug APK built and packaged in `output/NSO_Marketplace_v2.0_debug.apk`.

---

## 🚀 Setup & Run Instructions

### 1. Prerequisites
- Node.js v24+ (v24.22.0 recommended)
- Java 21+ or Android Studio JBR (v25)
- Android SDK (API 34-36)

### 2. Environment Configuration
Copy the template to your active server `.env`:
```bash
cp .env.example .env
```
Fill in the following variables (never commit `.env`):
- `SESSION_SECRET`: Long random cryptographic string for cookie HMAC signing.
- `ADMIN_PHONE`: 10-digit mobile number of the marketplace owner (e.g. `8310421121`).
- `OTP_PROVIDER`: `console` (dev log only), `twilio`, or `msg91`.
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Razorpay gateway credentials for online checkout.
- `CORS_ORIGIN`: Allowed origins in production (e.g. `https://your-domain.com`).

### 3. Start Backend Server
```bash
npm run server
```
Server starts on `http://0.0.0.0:5000` with the SQLite database at `server/data/nso_marketplace.db`.

### 4. Start Frontend Development Server
```bash
npm run dev
```
Accessible at `http://localhost:3000`.

### 5. Automated Tests
Run the comprehensive test suite covering OTP, attempt limits, role checks, listing approval gates, inventory decrement, slot conflicts, and webhook verification:
```bash
npm test
```

### 6. Production Web Build
```bash
npm run build
```
Generates minified, tree-shaken static assets in `dist/`.

### 7. Sync & Build Android APK
Sync web assets to Capacitor and assemble debug APK:
```bash
npm run cap:sync
cd android && gradlew.bat assembleDebug --no-daemon
```
The output APK is located at:
`output/NSO_Marketplace_v2.0_debug.apk`

---

## 🔒 Security & Role Guardrails

| Role | Access Path | Verification Gate |
|---|---|---|
| **Customer** | Default on OTP verification | Validated phone number and registered delivery address |
| **Seller** | Seller Portal | Submits store name, business type, GSTIN, address. Stays pending until Owner approval |
| **Service Provider** | Provider Hub | Submits trade category, hourly rate, experience, ID proof. Stays pending until Owner approval |
| **Marketplace Owner** | Admin Console | Granted strictly when session phone matches server's `ADMIN_PHONE`. Zero client-side role switching |

- **Catalog Gate:** Customer-facing catalog displays **only** approved, in-stock products and approved services. New/edited listings remain invisible until approved by the owner.
- **Conflict Prevention:** Server-side transaction blocks overlapping service bookings for the same provider, date, and slot.
- **Inventory Safety:** Orders atomically decrement stock within SQLite `BEGIN IMMEDIATE` transaction. Tampered totals are rejected.
- **Commission Ledger:** Tracks gross amount, owner commission (configurable %, default 10% products, 15% services), and net seller/provider payout due.
