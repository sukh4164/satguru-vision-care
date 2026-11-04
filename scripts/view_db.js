const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "satguru_vision.db");
const db = new Database(DB_PATH);

console.log("\n=======================================================");
console.log("   SATGURU VISION CARE - DATABASE LIVE INSPECTOR");
console.log("   Database File: " + DB_PATH);
console.log("=======================================================\n");

// 1. Stats Summary
const custCount = db.prepare("SELECT COUNT(*) as count FROM customers").get().count;
const rxCount = db.prepare("SELECT COUNT(*) as count FROM prescriptions").get().count;
const orderCount = db.prepare("SELECT COUNT(*) as count FROM orders").get().count;
const prodCount = db.prepare("SELECT COUNT(*) as count FROM products").get().count;
const invCount = db.prepare("SELECT COUNT(*) as count FROM invoices").get().count;
const payCount = db.prepare("SELECT COUNT(*) as count FROM payments").get().count;

console.log("📊 CURRENT DATABASE COUNTS:");
console.table([
  { Table: "Customers", "Total Records": custCount },
  { Table: "Prescriptions (Rx)", "Total Records": rxCount },
  { Table: "Orders", "Total Records": orderCount },
  { Table: "Invoices", "Total Records": invCount },
  { Table: "Payments", "Total Records": payCount },
  { Table: "Products (Inventory)", "Total Records": prodCount },
]);

// 2. Latest 5 Customers
console.log("\n👥 LATEST 5 CUSTOMERS IN DATABASE:");
const latestCustomers = db.prepare(`
  SELECT id, customer_code, name, mobile, age, gender, city, created_at 
  FROM customers 
  ORDER BY id DESC 
  LIMIT 5
`).all();
console.table(latestCustomers);

// 3. Latest 3 Eye Prescriptions
console.log("\n👓 LATEST 3 EYE PRESCRIPTIONS (OD / OS POWER):");
const latestRx = db.prepare(`
  SELECT 
    p.prescription_code, 
    c.name AS customer,
    'SPH: ' || p.od_sph || ' | CYL: ' || p.od_cyl || ' | AX: ' || p.od_axis AS Right_Eye_OD,
    'SPH: ' || p.os_sph || ' | CYL: ' || p.os_cyl || ' | AX: ' || p.os_axis AS Left_Eye_OS,
    p.prescription_date
  FROM prescriptions p
  JOIN customers c ON c.id = p.customer_id
  ORDER BY p.id DESC
  LIMIT 3
`).all();
console.table(latestRx);

// 4. Latest 3 Orders & Billing
console.log("\n💰 LATEST 3 ORDERS & INVOICES:");
const latestOrders = db.prepare(`
  SELECT 
    o.order_code, 
    c.name AS customer,
    '₹' || o.grand_total AS total,
    '₹' || o.advance_paid AS advance,
    '₹' || o.remaining_balance AS balance,
    o.status
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  ORDER BY o.id DESC
  LIMIT 3
`).all();
console.table(latestOrders);

console.log("\n=======================================================\n");
db.close();
