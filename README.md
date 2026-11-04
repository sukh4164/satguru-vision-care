# SATGURU VISION CARE
## Complete Optical Store ERP & Eye Prescription Management System

A production-grade, responsive optical store ERP, clinical eye prescription management, and billing system built specifically for **SATGURU VISION CARE**.

Designed for daily optical store operations, preserving complete customer history, eye power changes (OD & OS refraction), lens and frame inventory, job order workflows, GST tax billing, and role-based access control.

---

## 🌟 Key Features

### 1. Dedicated Eye Prescription Management (Core Module)
- **High-Precision OD & OS Refraction:**
  - **OD (Right Eye):** SPH, CYL, AXIS, ADD, PD
  - **OS (Left Eye):** SPH, CYL, AXIS, ADD, PD
  - **Pupillary Distance (PD):** Support for both Single PD (mm) and Dual PD (Right mm / Left mm)
- **Never Overwritten:** Every eye test is permanently preserved as a historical record.
- **Side-by-Side Comparison:** Automatic comparative audit between previous and latest eye power with highlighted diopter shifts.
- **Printable Clinical Rx Slip:** Doctor / Optometrist branded prescription slip with recall date and signature seal.

### 2. Dual Role-Based Access Control (RBAC)
- **Admin (Shop Owner):** Complete system access, store revenue visibility, staff account creation, granular permission matrix editor, store settings, and database backups.
- **Staff (Optometrists / Sales Team):** Individual employee logins restricted to permitted modules. Confidential business revenue and admin settings are strictly blocked on the backend.
- **Dynamic Granular Matrix:** Over 20+ fine-grained permissions for Customers, Prescriptions, Orders, Billing, Inventory, and Reports.

### 3. Customer 360° Profile
- Auto-generated Customer IDs (`SVC-CUST-xxxx`).
- Duplicate detection on mobile number with confirmation override.
- Automatic age calculation from Date of Birth.
- Lifetime purchase ledger, pending balances, all historical eye tests, and order tracking.

### 4. Product & Inventory Management
- Categorized for Spectacle Frames, Single Vision Lenses, Bifocal Lenses, Progressive Lenses, Blue Cut Lenses, Contact Lenses, Sunglasses, and Accessories.
- Low stock alert threshold warnings.
- Real-time Stock-In, Stock-Out, and inventory transaction audit logging.

### 5. Order Management & Lab Job Cards
- Links customer, selected frame, precision lenses, and eye prescription.
- Live workflow status progression: `New` ➔ `Processing` ➔ `Ordered from Supplier` ➔ `Ready for Delivery` ➔ `Delivered`.
- Auto-generates Tax Invoice and records advance payments upon booking.

### 6. Billing, GST Invoicing & Payments
- Itemized tax invoices with CGST + SGST breakdown, discounts, and lab fitting fees.
- Printable standard A4 Tax Invoice and 3-inch POS Thermal receipt layout.
- One-click **WhatsApp Invoice Sharing** pre-filled with customer bill breakdown.
- Multi-channel payment recording: Cash Counter, UPI (GPay/PhonePe), Debit/Credit Card, Bank Transfer.

### 7. Executive Analytics & Recalls
- Daily, weekly, and monthly sales progression charts.
- Category stock distribution charts.
- Top outstanding debtor accounts ranking.
- Staff productivity scoreboard (patients examined, orders handled, sales volume).
- Customer follow-up and eye recall calendar with direct WhatsApp recall messaging.

---

## 🔐 Default Login Credentials

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Store Owner (Admin)** | `admin` | `admin123` | Complete store access, financial turnover, staff management, settings |
| **Optometrist (Staff)** | `staff` | `staff123` | Patients, eye power tests, order booking, counter billing, reminders |
| **Sales Associate (Staff)** | `pooja` | `staff123` | Standard staff permissions |

*(1-click quick-fill buttons are also available directly on the login screen for rapid testing)*

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Database
Seeds realistic sample customers, previous vs latest eye prescriptions, frames, lenses, orders, invoices, and activity logs:
```bash
node scripts/seed.js
```

### 3. Start Development Server
```bash
npm run dev
# Server boots on http://localhost:3000 (or http://localhost:3005)
```

### 4. Run Automated Test Suite
Executes the comprehensive 13-stage end-to-end integration test verifying authentication, duplicate detection, prescription comparison, order creation, billing, and RBAC enforcement:
```bash
node scripts/test_app.js
```

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 📂 Architecture & Directory Structure

```
satguru-vision-care/
├── data/
│   └── satguru_vision.db      # SQLite relational database (WAL mode enabled)
├── scripts/
│   ├── seed.js                # Database initialization & sample optical data
│   └── test_app.js            # Automated integration test suite
├── src/
│   ├── app/
│   │   ├── api/               # 23 Next.js Backend REST API endpoints
│   │   │   ├── auth/          # Login, logout, session verification, password change
│   │   │   ├── customers/     # Customer CRUD & duplicate check
│   │   │   ├── prescriptions/ # Prescription CRUD & comparison
│   │   │   ├── products/      # Inventory & stock adjustment transactions
│   │   │   ├── orders/        # Order placement & workflow status updater
│   │   │   ├── invoices/      # Tax invoices & GST calculation
│   │   │   ├── payments/      # Payment receipt ledger
│   │   │   ├── followups/     # Eye checkup & delivery reminders
│   │   │   ├── reports/       # Executive turnover & productivity metrics
│   │   │   ├── staff/         # Employee account management & permission matrix
│   │   │   ├── activity-logs/ # Audit trail
│   │   │   └── settings/      # Store profile & invoice configuration
│   │   ├── dashboard/         # Role-adaptive admin & staff screens
│   │   ├── login/             # Branded authentication screen
│   │   ├── globals.css        # Clean UI & print styles (@media print)
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable UI components
│   │   ├── Logo.tsx           # Satguru Vision Care eye symbol & branding
│   │   ├── Sidebar.tsx        # Responsive role-aware sidebar navigation
│   │   ├── Header.tsx         # Quick search, alerts bell, action shortcuts
│   │   ├── PrescriptionInputTable.tsx # OD & OS SPH/CYL/AXIS/ADD/PD form
│   │   ├── PrescriptionComparisonCard.tsx # Side-by-side power shift visualizer
│   │   ├── PrintableInvoice.tsx # A4 Tax Invoice & WhatsApp share
│   │   ├── PrintablePrescription.tsx # Official clinic refraction slip
│   │   └── MetricCard.tsx     # Modern KPI card
│   └── lib/
│       ├── db.ts              # better-sqlite3 database connection & schema
│       ├── auth.ts            # JWT authentication, session cookies, RBAC
│       ├── constants.ts       # Diopter ranges, categories, permission codes
│       ├── logger.ts          # Activity audit logger
│       └── utils.ts           # Indian Rupee formatting, dates, age calculation
└── tailwind.config.ts         # Navy Blue & Sky Blue brand palette
```

