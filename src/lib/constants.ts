export const APP_NAME = "SATGURU VISION CARE";
export const APP_TAGLINE = "Premium Optical & Eye Care Clinic";

export const PRODUCT_CATEGORIES = [
  "Spectacle Frames",
  "Single Vision Lenses",
  "Bifocal Lenses",
  "Progressive Lenses",
  "Blue Cut Lenses",
  "Computer Glasses",
  "Contact Lenses",
  "Sunglasses",
  "Reading Glasses",
  "Accessories",
  "Solutions & Cleaners",
];

export const ORDER_STATUSES = [
  { value: "New", label: "New Order", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "Processing", label: "In Lab / Processing", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "Ordered from Supplier", label: "Ordered from Supplier", color: "bg-purple-100 text-purple-800 border-purple-300" },
  { value: "Ready for Delivery", label: "Ready for Delivery", color: "bg-cyan-100 text-cyan-800 border-cyan-300" },
  { value: "Delivered", label: "Delivered", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { value: "Cancelled", label: "Cancelled", color: "bg-rose-100 text-rose-800 border-rose-300" },
] as const;

export const PRESCRIPTION_TYPES = [
  "Distance Vision",
  "Near Vision (Reading)",
  "Bifocal (Kryptok / D-Bifocal)",
  "Progressive (PAL)",
  "Computer / Blue Block",
  "Contact Lens",
  "Post-Op / Special",
];

export const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "Debit/Credit Card",
  "Bank Transfer",
  "Other",
] as const;

export const ALL_PERMISSIONS = [
  // Customers
  { code: "customers.view", category: "Customers", name: "View Customers", description: "Browse and view customer records and details" },
  { code: "customers.add", category: "Customers", name: "Add Customers", description: "Register new customers" },
  { code: "customers.edit", category: "Customers", name: "Edit Customers", description: "Update existing customer details" },
  { code: "customers.delete", category: "Customers", name: "Delete Customers", description: "Remove customer records" },
  { code: "customers.export", category: "Customers", name: "Export Customers", description: "Download customer reports in CSV/Excel" },

  // Prescriptions
  { code: "prescriptions.view", category: "Prescriptions", name: "View Prescriptions", description: "View prescription records and power history" },
  { code: "prescriptions.add", category: "Prescriptions", name: "Add Prescriptions", description: "Create new eye prescriptions" },
  { code: "prescriptions.edit", category: "Prescriptions", name: "Edit Prescriptions", description: "Modify prescription values" },
  { code: "prescriptions.delete", category: "Prescriptions", name: "Delete Prescriptions", description: "Delete prescription records" },

  // Orders
  { code: "orders.view", category: "Orders", name: "View Orders", description: "Browse customer spectacle and lens orders" },
  { code: "orders.create", category: "Orders", name: "Create Orders", description: "Place new optical orders" },
  { code: "orders.edit", category: "Orders", name: "Edit Orders", description: "Update order items and notes" },
  { code: "orders.update_status", category: "Orders", name: "Update Order Status", description: "Change workflow stage (e.g., Ready for Delivery)" },
  { code: "orders.cancel", category: "Orders", name: "Cancel Orders", description: "Mark orders as cancelled" },

  // Billing
  { code: "billing.view", category: "Billing", name: "View Invoices", description: "View invoices and sales bills" },
  { code: "billing.create", category: "Billing", name: "Create Invoices", description: "Generate sales bills and tax invoices" },
  { code: "billing.record_payment", category: "Billing", name: "Record Payments", description: "Collect and log payments and advance amounts" },
  { code: "billing.apply_discount", category: "Billing", name: "Apply Discounts", description: "Grant discounts on bills" },
  { code: "billing.view_outstanding", category: "Billing", name: "View Outstanding", description: "Access pending payment balances" },

  // Inventory
  { code: "inventory.view", category: "Inventory", name: "View Products", description: "Browse stock catalogue and frame collections" },
  { code: "inventory.add", category: "Inventory", name: "Add Products", description: "Create new products and SKUs" },
  { code: "inventory.edit", category: "Inventory", name: "Edit Products", description: "Update prices, names, and product details" },
  { code: "inventory.delete", category: "Inventory", name: "Delete Products", description: "Remove product records" },
  { code: "inventory.update_stock", category: "Inventory", name: "Update Stock", description: "Perform Stock-In, Stock-Out, or adjustments" },

  // Reports
  { code: "reports.daily", category: "Reports", name: "View Daily Reports", description: "Check today's sales and customer flow" },
  { code: "reports.monthly", category: "Reports", name: "View Monthly Reports", description: "View monthly revenue trends and charts" },
  { code: "reports.sales", category: "Reports", name: "View Sales Reports", description: "Comprehensive sales breakdown" },
  { code: "reports.export", category: "Reports", name: "Export Reports", description: "Download analytical spreadsheets" },

  // Admin-Only
  { code: "admin.staff", category: "Admin", name: "Manage Staff", description: "Create, edit and manage employee accounts" },
  { code: "admin.roles", category: "Admin", name: "Manage Roles & Permissions", description: "Configure staff access rights" },
  { code: "admin.settings", category: "Admin", name: "Store Settings", description: "Update store name, GSTIN, contacts, and invoice rules" },
  { code: "admin.revenue", category: "Admin", name: "View Complete Revenue", description: "Access overall profit margins and total turnover" },
  { code: "admin.backup", category: "Admin", name: "System Backup", description: "Export and manage database backups" },
];

// Helper to generate optical power ranges for SPH, CYL, ADD, AXIS, PD
export const SPH_OPTIONS = (() => {
  const list: string[] = ["Plano", "0.00"];
  for (let v = 0.25; v <= 16.0; v += 0.25) {
    list.push(`+${v.toFixed(2)}`);
  }
  for (let v = 0.25; v <= 20.0; v += 0.25) {
    list.push(`-${v.toFixed(2)}`);
  }
  return list;
})();

export const CYL_OPTIONS = (() => {
  const list: string[] = ["0.00"];
  for (let v = 0.25; v <= 8.0; v += 0.25) {
    list.push(`-${v.toFixed(2)}`);
  }
  for (let v = 0.25; v <= 6.0; v += 0.25) {
    list.push(`+${v.toFixed(2)}`);
  }
  return list;
})();

export const AXIS_OPTIONS = Array.from({ length: 180 }, (_, i) => `${i + 1}`);

export const ADD_OPTIONS = (() => {
  const list: string[] = ["None", "0.00"];
  for (let v = 0.5; v <= 4.0; v += 0.25) {
    list.push(`+${v.toFixed(2)}`);
  }
  return list;
})();

export const DUAL_PD_OPTIONS = (() => {
  const list: string[] = [];
  for (let v = 25.0; v <= 40.0; v += 0.5) {
    list.push(v.toFixed(1));
  }
  return list;
})();

export const SINGLE_PD_OPTIONS = (() => {
  const list: string[] = [];
  for (let v = 50.0; v <= 78.0; v += 0.5) {
    list.push(v.toFixed(1));
  }
  return list;
})();

