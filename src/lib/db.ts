import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { ALL_PERMISSIONS, PRODUCT_CATEGORIES } from "./constants";

const DB_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, "satguru_vision.db");

// Singleton connection for Next.js hot reload
const globalForDb = global as unknown as { satguruDb?: Database.Database };

export const db: Database.Database =
  globalForDb.satguruDb ||
  new Database(DB_PATH, {
    // verbose: process.env.NODE_ENV === "development" ? console.log : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.satguruDb = db;
}

// Enable WAL mode and foreign keys
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Initialize Schema
export function initDatabase() {
  db.exec(`
    -- Roles table
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Permissions definition table
    CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT
    );

    -- Role default permissions
    CREATE TABLE IF NOT EXISTS role_permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      permission_code TEXT NOT NULL,
      UNIQUE(role_id, permission_code)
    );

    -- Users (Admin and Staff)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      mobile TEXT,
      role_id INTEGER NOT NULL REFERENCES roles(id),
      status TEXT DEFAULT 'active',
      joining_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Custom user permission overrides (Admin can toggle fine-grained permissions per staff member)
    CREATE TABLE IF NOT EXISTS user_permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      permission_code TEXT NOT NULL,
      granted INTEGER DEFAULT 1,
      UNIQUE(user_id, permission_code)
    );

    -- Store Settings
    CREATE TABLE IF NOT EXISTS store_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_name TEXT DEFAULT 'SATGURU VISION CARE',
      tagline TEXT DEFAULT 'Opticians, Optometrists & Contact Lens Specialists',
      address TEXT DEFAULT 'Shop No. 4, Ground Floor, Vision Plaza, Main Market Road',
      city TEXT DEFAULT 'Mumbai',
      state TEXT DEFAULT 'Maharashtra',
      pincode TEXT DEFAULT '400050',
      mobile TEXT DEFAULT '+91 98200 12345',
      whatsapp TEXT DEFAULT '+91 98200 12345',
      email TEXT DEFAULT 'contact@satguruvisioncare.com',
      gst_number TEXT DEFAULT '27AAAAA0000A1Z5',
      invoice_prefix TEXT DEFAULT 'SVC-INV-',
      currency TEXT DEFAULT 'INR',
      currency_symbol TEXT DEFAULT '₹',
      gst_rate REAL DEFAULT 12,
      invoice_footer TEXT DEFAULT 'Thank you for choosing Satguru Vision Care! Warranty applies to frame manufacturing defects for 6 months. Progressive lenses come with a 30-day adaptation guarantee.',
      business_hours TEXT DEFAULT 'Mon - Sat: 10:00 AM - 9:00 PM | Sunday: 11:00 AM - 7:00 PM',
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Customers
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      whatsapp TEXT,
      email TEXT,
      dob TEXT,
      age INTEGER,
      gender TEXT DEFAULT 'Male',
      address TEXT,
      city TEXT DEFAULT 'Mumbai',
      pincode TEXT,
      registration_date TEXT NOT NULL,
      notes TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile);
    CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
    CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(customer_code);

    -- Prescriptions (Every customer can have multiple; never overwritten)
    CREATE TABLE IF NOT EXISTS prescriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prescription_code TEXT UNIQUE NOT NULL,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      prescription_date TEXT NOT NULL,
      next_checkup_date TEXT,
      doctor_name TEXT,
      prescription_type TEXT DEFAULT 'Distance Vision',
      
      -- Right Eye (OD)
      od_sph TEXT DEFAULT '0.00',
      od_cyl TEXT DEFAULT '0.00',
      od_axis TEXT DEFAULT '0',
      od_add TEXT DEFAULT '0.00',
      od_pd TEXT DEFAULT '31.5',

      -- Left Eye (OS)
      os_sph TEXT DEFAULT '0.00',
      os_cyl TEXT DEFAULT '0.00',
      os_axis TEXT DEFAULT '0',
      os_add TEXT DEFAULT '0.00',
      os_pd TEXT DEFAULT '31.5',

      pd_type TEXT DEFAULT 'Dual', -- 'Single' or 'Dual'
      single_pd TEXT,
      notes TEXT,
      image_url TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_rx_customer ON prescriptions(customer_id);
    CREATE INDEX IF NOT EXISTS idx_rx_date ON prescriptions(prescription_date);

    -- Product Categories
    CREATE TABLE IF NOT EXISTS product_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT
    );

    -- Products / Inventory
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_code TEXT UNIQUE NOT NULL,
      sku TEXT UNIQUE,
      name TEXT NOT NULL,
      brand TEXT,
      category_id INTEGER REFERENCES product_categories(id),
      category_name TEXT NOT NULL,
      model_number TEXT,
      purchase_price REAL DEFAULT 0,
      selling_price REAL DEFAULT 0,
      stock_quantity INTEGER DEFAULT 0,
      min_stock_alert INTEGER DEFAULT 5,
      image_url TEXT,
      description TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_products_code ON products(product_code);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_name);

    -- Inventory Transactions (Stock In / Stock Out log)
    CREATE TABLE IF NOT EXISTS inventory_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      transaction_type TEXT NOT NULL, -- 'IN', 'OUT', 'ADJUSTMENT', 'ORDER_SALE'
      quantity INTEGER NOT NULL,
      balance_after INTEGER NOT NULL,
      reference_id TEXT,
      notes TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Orders
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code TEXT UNIQUE NOT NULL,
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      prescription_id INTEGER REFERENCES prescriptions(id),
      order_date TEXT NOT NULL,
      expected_delivery_date TEXT,
      status TEXT DEFAULT 'New', -- 'New', 'Processing', 'Ordered from Supplier', 'Ready for Delivery', 'Delivered', 'Cancelled'
      frame_details TEXT,
      lens_details TEXT,
      frame_amount REAL DEFAULT 0,
      lens_amount REAL DEFAULT 0,
      additional_charges REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      gst_rate REAL DEFAULT 12,
      gst_amount REAL DEFAULT 0,
      subtotal REAL DEFAULT 0,
      grand_total REAL NOT NULL,
      advance_paid REAL DEFAULT 0,
      remaining_balance REAL DEFAULT 0,
      payment_method TEXT DEFAULT 'Cash',
      order_notes TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);

    -- Order Items
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id),
      item_type TEXT NOT NULL, -- 'Frame', 'Lens', 'Accessory', 'Service'
      name TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL
    );

    -- Invoices
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_code TEXT UNIQUE NOT NULL,
      order_id INTEGER REFERENCES orders(id),
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      invoice_date TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      gst_rate REAL DEFAULT 12,
      gst_amount REAL DEFAULT 0,
      grand_total REAL NOT NULL,
      paid_amount REAL DEFAULT 0,
      remaining_balance REAL DEFAULT 0,
      status TEXT DEFAULT 'Pending', -- 'Paid', 'Partial', 'Unpaid'
      notes TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);

    -- Payments
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_code TEXT UNIQUE NOT NULL,
      order_id INTEGER REFERENCES orders(id),
      invoice_id INTEGER REFERENCES invoices(id),
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      amount REAL NOT NULL,
      payment_date TEXT NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'Cash',
      reference_number TEXT,
      notes TEXT,
      received_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
    CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);

    -- Follow-ups and Reminders
    CREATE TABLE IF NOT EXISTS followups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      order_id INTEGER REFERENCES orders(id),
      type TEXT NOT NULL, -- 'Eye Checkup', 'Delivery Ready', 'Pending Payment', 'General Feedback'
      scheduled_date TEXT NOT NULL,
      status TEXT DEFAULT 'Pending', -- 'Pending', 'Completed', 'Cancelled'
      priority TEXT DEFAULT 'Medium', -- 'Low', 'Medium', 'High'
      notes TEXT,
      assigned_to INTEGER REFERENCES users(id),
      created_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_followups_date ON followups(scheduled_date);

    -- Activity Logs
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_logs_created ON activity_logs(created_at);
  `);

  // Ensure default roles exist
  const insertRole = db.prepare(`INSERT OR IGNORE INTO roles (name, description) VALUES (?, ?)`);
  insertRole.run("admin", "Full administrative control of optical store, staff, revenue and settings");
  insertRole.run("staff", "Optician/Employee access for customers, prescriptions, orders and billing");

  const adminRole = db.prepare("SELECT id FROM roles WHERE name = 'admin'").get() as { id: number };
  const staffRole = db.prepare("SELECT id FROM roles WHERE name = 'staff'").get() as { id: number };

  // Ensure permissions catalogue exists
  const insertPerm = db.prepare(`
    INSERT OR REPLACE INTO permissions (code, category, name, description)
    VALUES (?, ?, ?, ?)
  `);
  ALL_PERMISSIONS.forEach((p) => {
    insertPerm.run(p.code, p.category, p.name, p.description);
  });

  // Default role permissions
  // Admin gets all permissions
  const insertRolePerm = db.prepare(`
    INSERT OR IGNORE INTO role_permissions (role_id, permission_code)
    VALUES (?, ?)
  `);
  ALL_PERMISSIONS.forEach((p) => {
    insertRolePerm.run(adminRole.id, p.code);
  });

  // Staff gets everyday optical management permissions, but NOT admin-only settings or full revenue deletion
  const staffAllowedPerms = [
    "customers.view",
    "customers.add",
    "customers.edit",
    "prescriptions.view",
    "prescriptions.add",
    "prescriptions.edit",
    "orders.view",
    "orders.create",
    "orders.edit",
    "orders.update_status",
    "billing.view",
    "billing.create",
    "billing.record_payment",
    "billing.view_outstanding",
    "inventory.view",
    "inventory.update_stock",
    "reports.daily",
  ];
  staffAllowedPerms.forEach((p) => {
    insertRolePerm.run(staffRole.id, p);
  });

  // Default Store Settings
  const storeCheck = db.prepare("SELECT count(*) as cnt FROM store_settings").get() as { cnt: number };
  if (storeCheck.cnt === 0) {
    db.prepare(`
      INSERT INTO store_settings (
        store_name, tagline, address, city, state, pincode,
        mobile, whatsapp, email, gst_number, invoice_prefix,
        currency, currency_symbol, gst_rate, invoice_footer, business_hours
      ) VALUES (
        'SATGURU VISION CARE',
        'Opticians, Optometrists & Contact Lens Specialists',
        'Shop No. 4, Ground Floor, Vision Plaza, Main Market Road',
        'Mumbai', 'Maharashtra', '400050',
        '+91 98200 12345', '+91 98200 12345', 'contact@satguruvisioncare.com',
        '27AAAAA0000A1Z5', 'SVC-INV-',
        'INR', '₹', 12.0,
        'Thank you for trusting Satguru Vision Care! Warranty applies to frame manufacturing defects for 6 months. Progressive lenses have a 30-day adaptation guarantee.',
        'Mon - Sat: 10:00 AM - 9:00 PM | Sunday: 11:00 AM - 7:00 PM'
      )
    `).run();
  }

  // Default Product Categories
  const insertCategory = db.prepare("INSERT OR IGNORE INTO product_categories (name, description) VALUES (?, ?)");
  PRODUCT_CATEGORIES.forEach((cat) => {
    insertCategory.run(cat, `High quality ${cat.toLowerCase()} collection`);
  });

  // Ensure default Admin user exists: admin / admin123
  const userCheck = db.prepare("SELECT count(*) as cnt FROM users").get() as { cnt: number };
  if (userCheck.cnt === 0) {
    const adminPassHash = bcrypt.hashSync("admin123", 10);
    const staffPassHash = bcrypt.hashSync("staff123", 10);

    const insertUser = db.prepare(`
      INSERT INTO users (employee_id, name, username, email, password_hash, mobile, role_id, status, joining_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      "SVC-EMP-001",
      "Gurpreet Singh (Admin)",
      "admin",
      "admin@satguruvisioncare.com",
      adminPassHash,
      "+91 98200 11111",
      adminRole.id,
      "active",
      "2023-01-01"
    );

    insertUser.run(
      "SVC-EMP-002",
      "Rahul Sharma (Optometrist)",
      "staff",
      "rahul@satguruvisioncare.com",
      staffPassHash,
      "+91 98200 22222",
      staffRole.id,
      "active",
      "2023-06-15"
    );
  }
}

// Automatically initialize schema when module loads
initDatabase();

