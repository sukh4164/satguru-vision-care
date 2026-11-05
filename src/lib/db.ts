import { createClient, Client, InStatement } from "@libsql/client";
import bcrypt from "bcryptjs";
import { ALL_PERMISSIONS, PRODUCT_CATEGORIES } from "./constants";

const url =
  process.env.TURSO_DATABASE_URL ||
  "libsql://satguru-vision-sukhvendersingh.aws-ap-south-1.turso.io";

const authToken =
  process.env.TURSO_AUTH_TOKEN ||
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTM4NTg3MDYsImlkIjoiMDFhMWFhM2ItMjgwMS03ZDM3LThhZjgtZGY0OTg2Mjg1NTIzIiwia2lkIjoiV3RqdmY4RHg5RmFUZzNxMWtGbXJjYnY2U25LWnhRR3hzRk9nUlpFLUZ1VSIsInJpZCI6IjQwNjdkM2U0LWRlNjctNDg0OS05OTc5LTMzN2EwOTA0MDMyYiJ9.5Pi8eIzUbZHT8w7o1kPXQo-P3KG4by6HOQwIwxyAV15CmtKOEmcbyZzVVOj88yoz61jB6s2VktzEcAFwWG8CAQ";

// Global singleton client for Next.js hot reloading
const globalForDb = global as unknown as { tursoClient?: Client };

export const client: Client =
  globalForDb.tursoClient ||
  createClient({
    url,
    authToken,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.tursoClient = client;
}

// Database wrapper with async prepare methods compatible with SQLite queries
export const db = {
  client,
  prepare(sql: string) {
    return {
      async all<T = any>(...params: any[]): Promise<T[]> {
        // Flatten array if passed as single array argument
        const args = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const rs = await client.execute({ sql, args });
        return rs.rows as unknown as T[];
      },
      async get<T = any>(...params: any[]): Promise<T | undefined> {
        const args = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const rs = await client.execute({ sql, args });
        return (rs.rows[0] as unknown as T) || undefined;
      },
      async run(...params: any[]): Promise<{ lastInsertRowid: number; changes: number }> {
        const args = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const rs = await client.execute({ sql, args });
        return {
          lastInsertRowid: Number(rs.lastInsertRowid ?? 0),
          changes: rs.rowsAffected,
        };
      },
    };
  },
  async exec(sql: string) {
    return client.executeMultiple(sql);
  },
  async batch(statements: InStatement[]) {
    return client.batch(statements);
  },
  async transaction(mode?: "write" | "read" | "deferred") {
    return client.transaction(mode);
  },
};

// Initialize schema on Turso if tables don't exist
export async function initDatabase() {
  try {
    await client.executeMultiple(`
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS role_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_code TEXT NOT NULL,
        UNIQUE(role_id, permission_code)
      );

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

      CREATE TABLE IF NOT EXISTS user_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        permission_code TEXT NOT NULL,
        granted INTEGER DEFAULT 1,
        UNIQUE(user_id, permission_code)
      );

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

      CREATE TABLE IF NOT EXISTS prescriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prescription_code TEXT UNIQUE NOT NULL,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        prescription_date TEXT NOT NULL,
        next_checkup_date TEXT,
        doctor_name TEXT,
        prescription_type TEXT DEFAULT 'Distance Vision',
        od_sph TEXT DEFAULT '0.00',
        od_cyl TEXT DEFAULT '0.00',
        od_axis TEXT DEFAULT '0',
        od_add TEXT DEFAULT '0.00',
        od_pd TEXT DEFAULT '31.5',
        os_sph TEXT DEFAULT '0.00',
        os_cyl TEXT DEFAULT '0.00',
        os_axis TEXT DEFAULT '0',
        os_add TEXT DEFAULT '0.00',
        os_pd TEXT DEFAULT '31.5',
        pd_type TEXT DEFAULT 'Dual',
        single_pd TEXT,
        notes TEXT,
        image_url TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS product_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT
      );

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

      CREATE TABLE IF NOT EXISTS inventory_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        transaction_type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        balance_after INTEGER NOT NULL,
        reference_id TEXT,
        notes TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_code TEXT UNIQUE NOT NULL,
        customer_id INTEGER NOT NULL REFERENCES customers(id),
        prescription_id INTEGER REFERENCES prescriptions(id),
        order_date TEXT NOT NULL,
        expected_delivery_date TEXT,
        status TEXT DEFAULT 'New',
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

      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        item_type TEXT NOT NULL,
        name TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL
      );

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
        status TEXT DEFAULT 'Pending',
        notes TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

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

      CREATE TABLE IF NOT EXISTS followups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        order_id INTEGER REFERENCES orders(id),
        type TEXT NOT NULL,
        scheduled_date TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        priority TEXT DEFAULT 'Medium',
        notes TEXT,
        assigned_to INTEGER REFERENCES users(id),
        created_by INTEGER REFERENCES users(id),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT
      );

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
    `);
  } catch (err) {
    console.error("Turso initDatabase warning:", err);
  }
}
