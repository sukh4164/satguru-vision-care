import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import fs from "fs";

// Read credentials from .env.local
const envFile = fs.readFileSync(".env.local", "utf-8");
const urlMatch = envFile.match(/TURSO_DATABASE_URL="?([^\s"\n]+)/);
const tokenMatch = envFile.match(/TURSO_AUTH_TOKEN="?([^\s"\n]+)/);

if (!urlMatch || !tokenMatch) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env.local");
  process.exit(1);
}

const client = createClient({
  url: urlMatch[1],
  authToken: tokenMatch[1],
});

async function main() {
  console.log("Connecting to Turso Database at:", urlMatch[1]);

  // 1. Clear out all dummy data
  console.log("Wiping dummy data...");
  const tablesToClear = [
    "activity_logs",
    "followups",
    "payments",
    "invoices",
    "order_items",
    "orders",
    "prescriptions",
    "customers",
    "products",
    "user_permissions",
    "users"
  ];

  for (const table of tablesToClear) {
    try {
      await client.execute(`DELETE FROM ${table}`);
      console.log(`✓ Cleared table: ${table}`);
    } catch (e) {
      console.log(`- Table ${table} skip/warning:`, e.message);
    }
  }

  // Ensure website column in store_settings
  try {
    await client.execute("ALTER TABLE store_settings ADD COLUMN website TEXT DEFAULT 'satguruvisioncare.com'");
  } catch (e) {
    // already exists
  }

  // 2. Ensure roles exist
  try {
    await client.execute(`INSERT OR IGNORE INTO roles (id, name, description) VALUES (1, 'admin', 'Store Owner / Administrator')`);
    await client.execute(`INSERT OR IGNORE INTO roles (id, name, description) VALUES (2, 'staff', 'Store Staff / Optometrist')`);
  } catch (e) {}

  // 3. Create Admin User: Sukhvender Singh
  const passwordHash = await bcrypt.hash("sukh@4164", 10);
  console.log("Creating primary user sukhbendarsingh...");
  
  await client.execute({
    sql: `
      INSERT INTO users (
        id, employee_id, name, username, email, password_hash, mobile, role_id, status, joining_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      1,
      "SVC-OWNER-01",
      "Sukhvender Singh",
      "sukhbendarsingh",
      "sukh4164@gmail.com",
      passwordHash,
      "+91 98708 33033",
      1, // admin role
      "active",
      new Date().toISOString().slice(0, 10),
    ]
  });
  console.log("✓ Created admin user: sukhbendarsingh (Sukhvender Singh)");

  // 4. Update store_settings
  console.log("Updating store_settings with Aligarh address and contact details...");
  await client.execute({
    sql: `
      UPDATE store_settings SET
        store_name = 'SATGURU VISION CARE',
        tagline = 'Eye Care • Eye Wear • Better Vision',
        address = 'Delhi gate',
        city = 'Aligarh',
        state = 'Uttar Pradesh',
        pincode = '202001',
        mobile = '+91 98708 33033',
        whatsapp = '+91 98708 33033',
        email = 'sukh4164@gmail.com',
        website = 'satguruvisioncare.com',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `,
    args: []
  });
  console.log("✓ Updated store_settings to Delhi gate, Aligarh 202001");

  // 5. Verify counts
  const userRows = await client.execute("SELECT id, name, username, email, mobile, role_id FROM users");
  console.log("\nCurrent Users in DB:", userRows.rows);

  const settingsRows = await client.execute("SELECT store_name, address, city, state, pincode, mobile, email, website FROM store_settings WHERE id = 1");
  console.log("\nCurrent Store Settings in DB:", settingsRows.rows);

  const customerCount = await client.execute("SELECT COUNT(*) as count FROM customers");
  const orderCount = await client.execute("SELECT COUNT(*) as count FROM orders");
  const productCount = await client.execute("SELECT COUNT(*) as count FROM products");
  console.log(`\nRemaining records: Customers=${customerCount.rows[0].count}, Orders=${orderCount.rows[0].count}, Products=${productCount.rows[0].count}`);

  console.log("\n✅ Database cleanup and Sukhvender Singh account setup completed successfully!");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
