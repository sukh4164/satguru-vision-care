const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const DB_DIR = path.join(__dirname, "..", "data");
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, "satguru_vision.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

console.log("Seeding Satguru Vision Care database...");

// Execute table creations
db.exec(`
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
    invoice_footer TEXT DEFAULT 'Thank you for trusting Satguru Vision Care! Warranty applies to frame manufacturing defects for 6 months. Progressive lenses have a 30-day adaptation guarantee.',
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

// Insert Roles
db.prepare("INSERT OR IGNORE INTO roles (name, description) VALUES ('admin', 'Full owner control')").run();
db.prepare("INSERT OR IGNORE INTO roles (name, description) VALUES ('staff', 'Staff optical user')").run();

const adminRole = db.prepare("SELECT id FROM roles WHERE name = 'admin'").get();
const staffRole = db.prepare("SELECT id FROM roles WHERE name = 'staff'").get();

// Store settings
db.prepare(`
  INSERT OR IGNORE INTO store_settings (
    id, store_name, tagline, address, city, state, pincode,
    mobile, whatsapp, email, gst_number, invoice_prefix,
    currency, currency_symbol, gst_rate, invoice_footer, business_hours
  ) VALUES (
    1,
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

// Seed Users: admin (admin / admin123), staff (staff / staff123)
const adminHash = bcrypt.hashSync("admin123", 10);
const staffHash = bcrypt.hashSync("staff123", 10);

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (id, employee_id, name, username, email, password_hash, mobile, role_id, status, joining_date)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertUser.run(1, "SVC-EMP-001", "Gurpreet Singh (Admin)", "admin", "admin@satguruvisioncare.com", adminHash, "+91 98200 11111", adminRole.id, "active", "2023-01-01");
insertUser.run(2, "SVC-EMP-002", "Rahul Sharma (Optometrist)", "staff", "rahul@satguruvisioncare.com", staffHash, "+91 98200 22222", staffRole.id, "active", "2023-06-15");
insertUser.run(3, "SVC-EMP-003", "Pooja Verma (Store Associate)", "pooja", "pooja@satguruvisioncare.com", staffHash, "+91 98200 33333", staffRole.id, "active", "2024-01-10");

// Product Categories
const categories = [
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
];

const insertCat = db.prepare("INSERT OR IGNORE INTO product_categories (name, description) VALUES (?, ?)");
categories.forEach(c => insertCat.run(c, `Premium collection of ${c.toLowerCase()}`));

// Sample Products
const products = [
  { code: "SVC-PRD-1001", sku: "RB-5154-CLUB", name: "Ray-Ban Clubmaster Classic", brand: "Ray-Ban", cat: "Spectacle Frames", model: "RB5154-2000", buy: 4200, sell: 6890, qty: 12, min: 4, desc: "Iconic browline acetate & metal frame, Black/Gold finish" },
  { code: "SVC-PRD-1002", sku: "OK-OX8046-AIR", name: "Oakley Airdrop Lightweight", brand: "Oakley", cat: "Spectacle Frames", model: "OX8046-0155", buy: 3800, sell: 5990, qty: 18, min: 5, desc: "O Matter lightweight durable rectangular design" },
  { code: "SVC-PRD-1003", sku: "TE-FLEX-TIT", name: "Titan Elegance Titanium Rimless", brand: "Titan Eyeplus", cat: "Spectacle Frames", model: "TE-RIM-88", buy: 2100, sell: 3950, qty: 8, min: 3, desc: "Featherlight pure titanium rimless mount with flexible memory bridge" },
  { code: "SVC-PRD-1004", sku: "VO-CAT-4084", name: "Vogue Eyewear Butterfly Chic", brand: "Vogue", cat: "Spectacle Frames", model: "VO4084-280", buy: 1900, sell: 3490, qty: 3, min: 5, desc: "Trendy rose gold metallic frame with subtle cat-eye silhouette (Low stock)" },
  { code: "SVC-PRD-1005", sku: "CRZ-PREV-156", name: "Crizal Prevencia Anti-Blue UV 1.56", brand: "Essilor", cat: "Blue Cut Lenses", model: "PREV-156", buy: 1400, sell: 2600, qty: 45, min: 10, desc: "Filters harmful blue-violet light while allowing beneficial blue-turquoise" },
  { code: "SVC-PRD-1006", sku: "ESS-VAR-COMF", name: "Essilor Varilux Comfort Max 1.60", brand: "Essilor", cat: "Progressive Lenses", model: "VAR-MAX-160", buy: 4800, sell: 8500, qty: 22, min: 6, desc: "Wider visual field for seamless transition from distance to intermediate to reading" },
  { code: "SVC-PRD-1007", sku: "HOYA-HILUX-150", name: "Hoya Hilux Single Vision Hard AR", brand: "Hoya", cat: "Single Vision Lenses", model: "HLX-150-AR", buy: 650, sell: 1450, qty: 60, min: 15, desc: "Multi-coated scratch resistant single vision stock lenses" },
  { code: "SVC-PRD-1008", sku: "KRY-BIF-D28", name: "Kryptok D-28 Bifocal Clear 1.50", brand: "Satguru Precision", cat: "Bifocal Lenses", model: "D28-BIF", buy: 550, sell: 1200, qty: 30, min: 8, desc: "Traditional D-shape segmented bifocal for sharp distance and reading" },
  { code: "SVC-PRD-1009", sku: "ACU-OASYS-12", name: "Acuvue Oasys with Hydraclear Plus (6 Pack)", brand: "Johnson & Johnson", cat: "Contact Lenses", model: "ACU-OAS-6P", buy: 1350, sell: 1950, qty: 15, min: 5, desc: "Bi-weekly breathable silicone hydrogel contact lenses" },
  { code: "SVC-PRD-1010", sku: "RB-3025-AVI", name: "Ray-Ban Aviator Classic Polarized G-15", brand: "Ray-Ban", cat: "Sunglasses", model: "RB3025-001/58", buy: 5500, sell: 8990, qty: 2, min: 4, desc: "Arista Gold teardrop sunglasses with classic green polarized crystal glass (Low stock)" },
  { code: "SVC-PRD-1011", sku: "OPT-CLOTH-MC", name: "Ultra-Soft Microfiber Cleaning Cloth", brand: "Satguru Vision", cat: "Accessories", model: "ACC-CLOTH-50", buy: 15, sell: 60, qty: 120, min: 20, desc: "Lint-free, scratch-free lens cleaning cloth with store imprint" },
  { code: "SVC-PRD-1012", sku: "REN-PLUS-355", name: "Renu Fresh Multi-Purpose Solution 355ml", brand: "Bausch & Lomb", cat: "Accessories", model: "REN-355ML", buy: 280, sell: 420, qty: 25, min: 8, desc: "Contact lens disinfectant, cleaner, and protein remover" },
];

const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (
    product_code, sku, name, brand, category_name, model_number,
    purchase_price, selling_price, stock_quantity, min_stock_alert, description
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

products.forEach(p => {
  insertProduct.run(p.code, p.sku, p.name, p.brand, p.cat, p.model, p.buy, p.sell, p.qty, p.min, p.desc);
});

// Sample Customers
const sampleCustomers = [
  { code: "SVC-CUST-1001", name: "Rameshwar Patel", mobile: "9820123456", wa: "9820123456", email: "ramesh.patel@gmail.com", dob: "1972-04-12", age: 52, gender: "Male", address: "Flat 402, Sai Krupa Towers, Link Road", city: "Mumbai", pin: "400053", date: "2023-04-10", notes: "Prefers progressive lenses. Complains of computer eye fatigue." },
  { code: "SVC-CUST-1002", name: "Priya Sharma", mobile: "9833445566", wa: "9833445566", email: "priya.sharma90@yahoo.com", dob: "1994-08-25", age: 30, gender: "Female", address: "B-12, Green Acres Apt, Bandra West", city: "Mumbai", pin: "400050", date: "2023-08-15", notes: "Fashion conscious, likes lightweight cat-eye or rose gold frames." },
  { code: "SVC-CUST-1003", name: "Dr. Rajesh Gupta", mobile: "9819876543", wa: "9819876543", email: "dr.rgupta@fortis.com", dob: "1965-11-03", age: 59, gender: "Male", address: "301, Doctors Enclave, Khar West", city: "Mumbai", pin: "400052", date: "2024-01-20", notes: "Surgeon. Requires precise high-index progressive with anti-reflective coating." },
  { code: "SVC-CUST-1004", name: "Anita Deshmukh", mobile: "9769012345", wa: "9769012345", email: "anita.desh@gmail.com", dob: "1988-02-14", age: 36, gender: "Female", address: "Plot 18, Silver Sands, Juhu Tara Road", city: "Mumbai", pin: "400049", date: "2024-03-05", notes: "Screen time > 10 hours daily. Needs Blue-Cut Essilor lenses." },
  { code: "SVC-CUST-1005", name: "Vikram Mehta", mobile: "9821098765", wa: "9821098765", email: "vikram.mehta@investcorp.in", dob: "1983-06-19", age: 41, gender: "Male", address: "Tower 2, Floor 14, Lodha Park", city: "Mumbai", pin: "400013", date: "2024-05-18", notes: "Sports enthusiast. Wears contact lenses for tennis, prescription sunglasses for driving." },
  { code: "SVC-CUST-1006", name: "Sunita Joshi", mobile: "9920334455", wa: "9920334455", email: "sunita.joshi@gmail.com", dob: "1958-09-30", age: 66, gender: "Female", address: "Shanti Nivas, 14th Road, Chembur", city: "Mumbai", pin: "400071", date: "2024-07-22", notes: "Bifocal user for 15 years. Mild cataract in left eye under observation." },
];

const insertCust = db.prepare(`
  INSERT OR IGNORE INTO customers (
    customer_code, name, mobile, whatsapp, email, dob, age, gender,
    address, city, pincode, registration_date, notes, created_by
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

sampleCustomers.forEach(c => {
  insertCust.run(c.code, c.name, c.mobile, c.wa, c.email, c.dob, c.age, c.gender, c.address, c.city, c.pin, c.date, c.notes);
});

// Sample Prescriptions (including historical vs latest comparison for repeat customer Ramesh Patel!)
const samplePrescriptions = [
  // Ramesh Patel - Previous Rx (1 year ago)
  {
    code: "SVC-RX-1001",
    cust_id: 1,
    date: "2023-04-10",
    next: "2024-04-10",
    doc: "Dr. A. K. Verma (M.S. Ophth)",
    type: "Progressive (PAL)",
    od_sph: "+1.25", od_cyl: "-0.50", od_axis: "90", od_add: "+2.00", od_pd: "31.5",
    os_sph: "+1.00", os_cyl: "-0.75", os_axis: "85", os_add: "+2.00", os_pd: "31.5",
    notes: "Old baseline prescription. Recommended transition to progressive lenses.",
  },
  // Ramesh Patel - Latest Rx (Current year - power has slightly increased for ADD and SPH)
  {
    code: "SVC-RX-1002",
    cust_id: 1,
    date: "2024-04-15",
    next: "2025-04-15",
    doc: "Dr. A. K. Verma (M.S. Ophth)",
    type: "Progressive (PAL)",
    od_sph: "+1.50", od_cyl: "-0.75", od_axis: "90", od_add: "+2.25", od_pd: "32.0",
    os_sph: "+1.25", os_cyl: "-0.75", os_axis: "90", os_add: "+2.25", os_pd: "31.5",
    notes: "Follow-up test: Reading add increased by +0.25 D. Sharp 6/6 distance acuity maintained.",
  },
  // Priya Sharma
  {
    code: "SVC-RX-1003",
    cust_id: 2,
    date: "2023-08-15",
    next: "2024-08-15",
    doc: "Rahul Sharma (Optometrist)",
    type: "Distance Vision",
    od_sph: "-1.75", od_cyl: "-0.50", od_axis: "180", od_add: "0.00", od_pd: "30.0",
    os_sph: "-2.00", os_cyl: "-0.25", os_axis: "175", os_add: "0.00", os_pd: "30.5",
    notes: "Myopia with mild astigmatism. Advised blue-cut anti-glare for daily laptop work.",
  },
  // Dr. Rajesh Gupta
  {
    code: "SVC-RX-1004",
    cust_id: 3,
    date: "2024-01-20",
    next: "2025-01-20",
    doc: "Self / Dr. R. Gupta",
    type: "Progressive (PAL)",
    od_sph: "+2.00", od_cyl: "-1.00", od_axis: "75", od_add: "+2.50", od_pd: "33.0",
    os_sph: "+2.25", od_cyl: "-1.25", od_axis: "105", od_add: "+2.50", os_pd: "32.5",
    notes: "Surgeon operating glasses. High clarity required with wide intermediate channel.",
  },
  // Anita Deshmukh
  {
    code: "SVC-RX-1005",
    cust_id: 4,
    date: "2024-03-05",
    next: "2025-03-05",
    doc: "Rahul Sharma (Optometrist)",
    type: "Computer / Blue Block",
    od_sph: "-0.75", od_cyl: "-0.25", od_axis: "90", od_add: "+0.75", od_pd: "31.0",
    os_sph: "-0.50", os_cyl: "-0.50", os_axis: "95", os_add: "+0.75", os_pd: "31.0",
    notes: "Mild digital eye strain. Prescribed anti-fatigue lenses with +0.75 accommodation boost.",
  },
  // Sunita Joshi
  {
    code: "SVC-RX-1006",
    cust_id: 6,
    date: "2024-07-22",
    next: "2025-01-22",
    doc: "Dr. Mehta Eye Clinic",
    type: "Bifocal (Kryptok / D-Bifocal)",
    od_sph: "+1.50", od_cyl: "0.00", od_axis: "0", od_add: "+2.75", od_pd: "31.5",
    os_sph: "+1.75", od_cyl: "-0.50", od_axis: "180", os_add: "+2.75", os_pd: "31.5",
    notes: "Long time bifocal wearer. Comfortable with D-28 segment.",
  },
];

const insertRx = db.prepare(`
  INSERT OR IGNORE INTO prescriptions (
    prescription_code, customer_id, prescription_date, next_checkup_date,
    doctor_name, prescription_type,
    od_sph, od_cyl, od_axis, od_add, od_pd,
    os_sph, os_cyl, os_axis, os_add, os_pd,
    pd_type, single_pd, notes, created_by
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Dual', '63.0', ?, 1)
`);

samplePrescriptions.forEach(rx => {
  insertRx.run(
    rx.code, rx.cust_id, rx.date, rx.next, rx.doc, rx.type,
    rx.od_sph, rx.od_cyl, rx.od_axis, rx.od_add, rx.od_pd,
    rx.os_sph, rx.os_cyl, rx.os_axis, rx.os_add, rx.os_pd,
    rx.notes
  );
});

// Sample Orders
const sampleOrders = [
  {
    code: "SVC-ORD-1001",
    cust_id: 1,
    rx_id: 2,
    date: "2024-04-15",
    delivery: "2024-04-19",
    status: "Delivered",
    frame: "Ray-Ban Clubmaster Classic (RB5154-2000)",
    lens: "Essilor Varilux Comfort Max 1.60 Progressive",
    f_amt: 6890,
    l_amt: 8500,
    add_chg: 100,
    disc: 500,
    gst_rate: 12,
    subtotal: 14990,
    grand: 16788.80, // (14990 - 500) * 1.12 = 14490 * 1.12 = 16228.80 + 100 fitting
    adv: 16788.80,
    bal: 0,
    method: "UPI",
    notes: "Fitted with Varilux warranty card and microfiber pouch.",
  },
  {
    code: "SVC-ORD-1002",
    cust_id: 2,
    rx_id: 3,
    date: "2024-10-28",
    delivery: "2024-11-02",
    status: "Ready for Delivery",
    frame: "Vogue Eyewear Butterfly Chic (VO4084-280)",
    lens: "Crizal Prevencia Anti-Blue UV 1.56",
    f_amt: 3490,
    l_amt: 2600,
    add_chg: 50,
    disc: 200,
    gst_rate: 12,
    subtotal: 6090,
    grand: 6652.80,
    adv: 3000,
    bal: 3652.80,
    method: "Debit/Credit Card",
    notes: "Customer notified via SMS/WhatsApp. Frame adjusted to petite fitting.",
  },
  {
    code: "SVC-ORD-1003",
    cust_id: 3,
    rx_id: 4,
    date: "2024-11-01",
    delivery: "2024-11-06",
    status: "Processing",
    frame: "Titan Elegance Titanium Rimless (TE-RIM-88)",
    lens: "Essilor Varilux Comfort Max 1.60 Progressive",
    f_amt: 3950,
    l_amt: 8500,
    add_chg: 200,
    disc: 650,
    gst_rate: 12,
    subtotal: 12450,
    grand: 13440.00,
    adv: 5000,
    bal: 8440.00,
    method: "UPI",
    notes: "Ordered rimless custom drilling with lab in Andheri.",
  },
  {
    code: "SVC-ORD-1004",
    cust_id: 4,
    rx_id: 5,
    date: "2024-11-03",
    delivery: "2024-11-07",
    status: "New",
    frame: "Oakley Airdrop Lightweight (OX8046-0155)",
    lens: "Crizal Prevencia Anti-Blue UV 1.56",
    f_amt: 5990,
    l_amt: 2600,
    add_chg: 0,
    disc: 400,
    gst_rate: 12,
    subtotal: 8590,
    grand: 9172.80,
    adv: 2000,
    bal: 7172.80,
    method: "Cash",
    notes: "New order today. Advance received in cash.",
  },
];

const insertOrder = db.prepare(`
  INSERT OR IGNORE INTO orders (
    order_code, customer_id, prescription_id, order_date, expected_delivery_date,
    status, frame_details, lens_details, frame_amount, lens_amount, additional_charges,
    discount_amount, gst_rate, gst_amount, subtotal, grand_total, advance_paid, remaining_balance,
    payment_method, order_notes, created_by
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

sampleOrders.forEach(o => {
  const taxable = o.subtotal - o.disc;
  const gst = Number((taxable * (o.gst_rate / 100)).toFixed(2));
  const grand = taxable + gst + o.add_chg;
  insertOrder.run(
    o.code, o.cust_id, o.rx_id, o.date, o.delivery,
    o.status, o.frame, o.lens, o.f_amt, o.l_amt, o.add_chg,
    o.disc, o.gst_rate, gst, o.subtotal, grand, o.adv, o.bal,
    o.method, o.notes
  );
});

// Sample Invoices
const sampleInvoices = [
  { code: "SVC-INV-1001", order_id: 1, cust_id: 1, date: "2024-04-15", subtotal: 14990, disc: 500, gst_rate: 12, gst_amt: 1738.80, grand: 16788.80, paid: 16788.80, bal: 0, status: "Paid" },
  { code: "SVC-INV-1002", order_id: 2, cust_id: 2, date: "2024-10-28", subtotal: 6090, disc: 200, gst_rate: 12, gst_amt: 706.80, grand: 6652.80, paid: 3000, bal: 3652.80, status: "Partial" },
  { code: "SVC-INV-1003", order_id: 3, cust_id: 3, date: "2024-11-01", subtotal: 12450, disc: 650, gst_rate: 12, gst_amt: 1416.00, grand: 13440.00, paid: 5000, bal: 8440.00, status: "Partial" },
  { code: "SVC-INV-1004", order_id: 4, cust_id: 4, date: "2024-11-03", subtotal: 8590, disc: 400, gst_rate: 12, gst_amt: 982.80, grand: 9172.80, paid: 2000, bal: 7172.80, status: "Partial" },
];

const insertInv = db.prepare(`
  INSERT OR IGNORE INTO invoices (
    invoice_code, order_id, customer_id, invoice_date, subtotal, discount,
    gst_rate, gst_amount, grand_total, paid_amount, remaining_balance, status, created_by
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

sampleInvoices.forEach(i => {
  insertInv.run(i.code, i.order_id, i.cust_id, i.date, i.subtotal, i.disc, i.gst_rate, i.gst_amt, i.grand, i.paid, i.bal, i.status);
});

// Sample Payments
const samplePayments = [
  { code: "SVC-PAY-1001", order_id: 1, inv_id: 1, cust_id: 1, amount: 16788.80, date: "2024-04-15", method: "UPI", ref: "UPI/410629819283", notes: "Full payment via GooglePay" },
  { code: "SVC-PAY-1002", order_id: 2, inv_id: 2, cust_id: 2, amount: 3000.00, date: "2024-10-28", method: "Debit/Credit Card", ref: "POS/TXN882739", notes: "Advance payment via HDFC Card" },
  { code: "SVC-PAY-1003", order_id: 3, inv_id: 3, cust_id: 3, amount: 5000.00, date: "2024-11-01", method: "UPI", ref: "UPI/430718291039", notes: "Advance payment" },
  { code: "SVC-PAY-1004", order_id: 4, inv_id: 4, cust_id: 4, amount: 2000.00, date: "2024-11-03", method: "Cash", ref: "CASH-REC-104", notes: "Cash advance counter receipt" },
];

const insertPay = db.prepare(`
  INSERT OR IGNORE INTO payments (
    payment_code, order_id, invoice_id, customer_id, amount, payment_date,
    payment_method, reference_number, notes, received_by
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

samplePayments.forEach(p => {
  insertPay.run(p.code, p.order_id, p.inv_id, p.cust_id, p.amount, p.date, p.method, p.ref, p.notes);
});

// Sample Followups
const sampleFollowups = [
  { cust_id: 1, order_id: 1, type: "Eye Checkup", date: "2025-04-15", status: "Pending", priority: "Medium", notes: "Annual vision acuity review reminder for progressive lenses." },
  { cust_id: 2, order_id: 2, type: "Delivery Ready", date: "2024-11-02", status: "Pending", priority: "High", notes: "Glasses ready in store. Call or WhatsApp customer for pickup & balance payment of ₹ 3,652.80." },
  { cust_id: 3, order_id: 3, type: "Delivery Ready", date: "2024-11-06", status: "Pending", priority: "High", notes: "Titanium rimless order dispatch expected from lab." },
  { cust_id: 6, order_id: null, type: "Eye Checkup", date: "2025-01-22", status: "Pending", priority: "Low", notes: "6-month cataract evaluation follow-up." },
];

const insertFollowup = db.prepare(`
  INSERT OR IGNORE INTO followups (
    customer_id, order_id, type, scheduled_date, status, priority, notes, created_by
  ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
`);

sampleFollowups.forEach(f => {
  insertFollowup.run(f.cust_id, f.order_id, f.type, f.date, f.status, f.priority, f.notes);
});

// Sample Activity Logs
const sampleLogs = [
  { user_id: 1, name: "Gurpreet Singh (Admin)", action: "Customer Added", entity: "customer", id: "SVC-CUST-1001", details: "Registered new customer Rameshwar Patel with initial progressive test" },
  { user_id: 1, name: "Gurpreet Singh (Admin)", action: "Prescription Created", entity: "prescription", id: "SVC-RX-1002", details: "Recorded revised eye power with ADD +2.25 D for Rameshwar Patel" },
  { user_id: 2, name: "Rahul Sharma (Optometrist)", action: "Order Created", entity: "order", id: "SVC-ORD-1002", details: "Booked Vogue frame with Crizal Prevencia blue-cut lenses for Priya Sharma" },
  { user_id: 2, name: "Rahul Sharma (Optometrist)", action: "Order Status Updated", entity: "order", id: "SVC-ORD-1002", details: "Status updated to Ready for Delivery" },
  { user_id: 1, name: "Gurpreet Singh (Admin)", action: "Payment Received", entity: "payment", id: "SVC-PAY-1004", details: "Received ₹ 2,000 cash advance from Anita Deshmukh" },
];

const insertLog = db.prepare(`
  INSERT INTO activity_logs (user_id, user_name, action, entity_type, entity_id, details)
  VALUES (?, ?, ?, ?, ?, ?)
`);

sampleLogs.forEach(l => {
  insertLog.run(l.user_id, l.name, l.action, l.entity, l.id, l.details);
});

console.log("Database seeded successfully with realistic optical store data!");

