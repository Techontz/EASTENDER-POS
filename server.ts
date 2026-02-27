import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("enterprise.db");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS countries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    country_id INTEGER,
    name TEXT NOT NULL,
    location TEXT,
    FOREIGN KEY(country_id) REFERENCES countries(id)
  );

  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    permissions TEXT -- JSON string of permissions
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER,
    role_id INTEGER,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT,
    email TEXT,
    FOREIGN KEY(branch_id) REFERENCES branches(id),
    FOREIGN KEY(role_id) REFERENCES roles(id)
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    barcode TEXT,
    category TEXT,
    price REAL NOT NULL,
    cost REAL NOT NULL,
    unit TEXT DEFAULT 'pcs'
  );

  CREATE TABLE IF NOT EXISTS stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER,
    product_id INTEGER,
    quantity INTEGER DEFAULT 0,
    UNIQUE(branch_id, product_id),
    FOREIGN KEY(branch_id) REFERENCES branches(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS stock_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER,
    product_id INTEGER,
    type TEXT CHECK(type IN ('IN', 'OUT', 'TRANSFER', 'DAMAGE')),
    quantity INTEGER NOT NULL,
    reference_id TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(branch_id) REFERENCES branches(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER,
    user_id INTEGER,
    customer_name TEXT,
    total_amount REAL NOT NULL,
    payment_method TEXT,
    status TEXT DEFAULT 'PAID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(branch_id) REFERENCES branches(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY(invoice_id) REFERENCES invoices(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS procurement_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER,
    user_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    estimated_cost REAL,
    status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, COMPLETED
    approved_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(branch_id) REFERENCES branches(id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(approved_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS attendance_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT CHECK(type IN ('IN', 'OUT')),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER,
    category TEXT,
    amount REAL NOT NULL,
    description TEXT,
    approved_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(branch_id) REFERENCES branches(id),
    FOREIGN KEY(approved_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS import_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    customer_name TEXT,
    order_details TEXT,
    total_amount REAL,
    status TEXT DEFAULT 'Pending', -- Pending, Processing, In Transit, Arrived at Warehouse, Out for Delivery, Delivered
    assigned_procurement_id INTEGER,
    assigned_logistics_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(assigned_procurement_id) REFERENCES users(id),
    FOREIGN KEY(assigned_logistics_id) REFERENCES users(id)
  );
`);

// Seed initial data if empty
const countryCount = db.prepare("SELECT COUNT(*) as count FROM countries").get() as { count: number };
if (countryCount.count === 0) {
  db.prepare("INSERT INTO countries (name, code) VALUES (?, ?)").run("Tanzania", "TZ");
  db.prepare("INSERT INTO countries (name, code) VALUES (?, ?)").run("Kenya", "KE");
  
  db.prepare("INSERT INTO branches (country_id, name, location) VALUES (?, ?, ?)").run(1, "Dar es Salaam HQ", "Posta");
  db.prepare("INSERT INTO branches (country_id, name, location) VALUES (?, ?, ?)").run(1, "Arusha Branch", "Clock Tower");
  
  db.prepare("INSERT INTO roles (name, permissions) VALUES (?, ?)").run("Admin", JSON.stringify(["all"]));
  db.prepare("INSERT INTO roles (name, permissions) VALUES (?, ?)").run("Manager", JSON.stringify(["dashboard", "sales", "inventory", "procurement", "logistics", "finance"]));
  db.prepare("INSERT INTO roles (name, permissions) VALUES (?, ?)").run("HR", JSON.stringify(["dashboard", "hr"]));
  db.prepare("INSERT INTO roles (name, permissions) VALUES (?, ?)").run("Cashier", JSON.stringify(["sales"]));
  
  db.prepare("INSERT INTO users (branch_id, role_id, username, password, full_name) VALUES (?, ?, ?, ?, ?)").run(1, 1, "admin", "admin123", "System Administrator");
  db.prepare("INSERT INTO users (branch_id, role_id, username, password, full_name) VALUES (?, ?, ?, ?, ?)").run(1, 2, "manager", "manager123", "Branch Manager");
  db.prepare("INSERT INTO users (branch_id, role_id, username, password, full_name) VALUES (?, ?, ?, ?, ?)").run(1, 3, "hr_user", "hr123", "HR Specialist");
  db.prepare("INSERT INTO users (branch_id, role_id, username, password, full_name) VALUES (?, ?, ?, ?, ?)").run(1, 4, "cashier", "cashier123", "Sales Cashier");
  
  db.prepare("INSERT INTO products (name, sku, barcode, category, price, cost) VALUES (?, ?, ?, ?, ?, ?)").run("Laptop Pro", "LP-001", "123456789", "Electronics", 2500000, 1800000);
  db.prepare("INSERT INTO products (name, sku, barcode, category, price, cost) VALUES (?, ?, ?, ?, ?, ?)").run("Wireless Mouse", "WM-002", "987654321", "Accessories", 45000, 25000);
}

// Ensure Roles exist and get their IDs
const roles = [
  { name: "Admin", permissions: ["all"] },
  { name: "Branch Manager", permissions: ["dashboard", "import-orders", "procurement", "inventory", "retail-sales", "logistics", "finance"] },
  { name: "Procurement Officer", permissions: ["import-orders", "procurement", "inventory"] },
  { name: "Cashier", permissions: ["retail-sales"] },
  { name: "HR Manager", permissions: ["dashboard", "hr"] },
];

for (const r of roles) {
  const role = db.prepare("SELECT id FROM roles WHERE name = ?").get(r.name) as any;
  if (!role) {
    db.prepare("INSERT INTO roles (name, permissions) VALUES (?, ?)").run(r.name, JSON.stringify(r.permissions));
  } else {
    db.prepare("UPDATE roles SET permissions = ? WHERE id = ?").run(JSON.stringify(r.permissions), role.id);
  }
}

// Get Role IDs
const getRoleId = (name: string) => (db.prepare("SELECT id FROM roles WHERE name = ?").get(name) as any).id;

// Ensure at least one branch exists
let branch = db.prepare("SELECT id FROM branches LIMIT 1").get() as any;
if (!branch) {
  db.prepare("INSERT INTO countries (name, code) VALUES (?, ?)").run("Tanzania", "TZ");
  db.prepare("INSERT INTO branches (country_id, name, location) VALUES (?, ?, ?)").run(1, "Dar es Salaam HQ", "Posta");
  branch = { id: 1 };
}

// Ensure specific users requested by the user exist and have correct passwords/roles
const usersToEnsure = [
  { username: "admin", password: "admin123", fullName: "System Administrator", roleName: "Admin" },
  { username: "manager_tz", password: "manager123", fullName: "Branch Manager", roleName: "Branch Manager" },
  { username: "hr_manager", password: "hr123", fullName: "HR Specialist", roleName: "HR Manager" },
  { username: "cashier1", password: "cashier123", fullName: "Sales Cashier", roleName: "Cashier" },
  { username: "procurement1", password: "procurement123", fullName: "Procurement Officer", roleName: "Procurement Officer" },
];

for (const u of usersToEnsure) {
  const roleId = getRoleId(u.roleName);
  const user = db.prepare("SELECT id FROM users WHERE username = ?").get(u.username) as any;
  if (!user) {
    db.prepare("INSERT INTO users (branch_id, role_id, username, password, full_name) VALUES (?, ?, ?, ?, ?)").run(branch.id, roleId, u.username, u.password, u.fullName);
  } else {
    // Update existing user to match requested credentials
    db.prepare("UPDATE users SET password = ?, role_id = ?, full_name = ? WHERE id = ?").run(u.password, roleId, u.fullName, user.id);
  }
}

// Seed some import orders for demo
const orderCount = db.prepare("SELECT COUNT(*) as count FROM import_orders").get() as { count: number };
if (orderCount.count === 0) {
  const adminUser = db.prepare("SELECT id FROM users WHERE username = 'admin'").get() as any;
  db.prepare(`
    INSERT INTO import_orders (user_id, customer_name, order_details, total_amount, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(adminUser.id, "Zuberi Mwinyi", "Electronics from Dubai", 1250000, "Pending");
  db.prepare(`
    INSERT INTO import_orders (user_id, customer_name, order_details, total_amount, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(adminUser.id, "Fatma Hassan", "Clothing from Turkey", 450000, "In Transit");
  db.prepare(`
    INSERT INTO import_orders (user_id, customer_name, order_details, total_amount, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(adminUser.id, "Said Juma", "Spare parts from China", 3200000, "Processing");
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // RBAC Middleware
  const checkPermission = (permission: string) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const userId = req.headers["x-user-id"];
      if (!userId) return next(); // Allow if no user ID for now, or enforce strictly? Let's enforce strictly for protected routes.
      
      const user = db.prepare(`
        SELECT r.permissions 
        FROM users u 
        JOIN roles r ON u.role_id = r.id 
        WHERE u.id = ?
      `).get(userId) as any;

      if (!user) return res.status(401).json({ message: "User not found" });

      const permissions = JSON.parse(user.permissions);
      if (permissions.includes("all") || permissions.includes(permission)) {
        next();
      } else {
        res.status(403).json({ message: "Access Denied" });
      }
    };
  };

  // Auth Routes
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare(`
      SELECT u.*, r.name as role_name, r.permissions 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.username = ? AND u.password = ?
    `).get(username, password) as any;

    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json({ success: true, user: { ...userWithoutPassword, permissions: JSON.parse(user.permissions) } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  // API Routes
  app.get("/api/dashboard/stats", (req, res) => {
    const retailSalesToday = db.prepare("SELECT SUM(total_amount) as total FROM invoices WHERE date(created_at) = date('now')").get() as { total: number };
    const totalImportOrders = db.prepare("SELECT COUNT(*) as count FROM import_orders").get() as { count: number };
    const ordersInTransit = db.prepare("SELECT COUNT(*) as count FROM import_orders WHERE status = 'In Transit'").get() as { count: number };
    const pendingProcurement = db.prepare("SELECT COUNT(*) as count FROM procurement_requests WHERE status = 'PENDING'").get() as { count: number };
    const activeDeliveries = db.prepare("SELECT COUNT(*) as count FROM import_orders WHERE status = 'Out for Delivery'").get() as { count: number };
    
    const products = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
    const users = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
    const branches = db.prepare("SELECT COUNT(*) as count FROM branches").get() as { count: number };
    
    res.json({
      retailSalesToday: retailSalesToday.total || 0,
      totalImportOrders: totalImportOrders.count,
      ordersInTransit: ordersInTransit.count,
      pendingProcurement: pendingProcurement.count,
      activeDeliveries: activeDeliveries.count,
      totalProducts: products.count,
      totalUsers: users.count,
      totalBranches: branches.count
    });
  });

  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.get("/api/branches", (req, res) => {
    const branches = db.prepare(`
      SELECT b.*, c.name as country_name 
      FROM branches b 
      JOIN countries c ON b.country_id = c.id
    `).all();
    res.json(branches);
  });

  app.post("/api/pos/checkout", (req, res) => {
    const { branchId, userId, customerName, items, totalAmount, paymentMethod } = req.body;
    
    const transaction = db.transaction(() => {
      const invoice = db.prepare(`
        INSERT INTO invoices (branch_id, user_id, customer_name, total_amount, payment_method)
        VALUES (?, ?, ?, ?, ?)
      `).run(branchId, userId, customerName, totalAmount, paymentMethod);
      
      const invoiceId = invoice.lastInsertRowid;
      
      for (const item of items) {
        db.prepare(`
          INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, subtotal)
          VALUES (?, ?, ?, ?, ?)
        `).run(invoiceId, item.id, item.quantity, item.price, item.price * item.quantity);
        
        // Update stock
        db.prepare(`
          INSERT INTO stock (branch_id, product_id, quantity)
          VALUES (?, ?, ?)
          ON CONFLICT(branch_id, product_id) DO UPDATE SET quantity = quantity - ?
        `).run(branchId, item.id, -item.quantity, item.quantity);

        db.prepare(`
          INSERT INTO stock_transactions (branch_id, product_id, type, quantity, reference_id)
          VALUES (?, ?, 'OUT', ?, ?)
        `).run(branchId, item.id, item.quantity, `INV-${invoiceId}`);
      }
      
      return invoiceId;
    });

    try {
      const id = transaction();
      res.json({ success: true, invoiceId: id });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/pos/history", (req, res) => {
    const orders = db.prepare("SELECT * FROM invoices ORDER BY created_at DESC").all();
    res.json(orders);
  });

  app.post("/api/products", (req, res) => {
    const { name, sku, barcode, category, price, cost } = req.body;
    try {
      const result = db.prepare("INSERT INTO products (name, sku, barcode, category, price, cost) VALUES (?, ?, ?, ?, ?, ?)").run(name, sku, barcode, category, price, cost);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.get("/api/procurement", (req, res) => {
    const requests = db.prepare(`
      SELECT p.*, u.full_name as requester_name, b.name as branch_name
      FROM procurement_requests p
      JOIN users u ON p.user_id = u.id
      JOIN branches b ON p.branch_id = b.id
      ORDER BY p.created_at DESC
    `).all();
    res.json(requests);
  });

  app.post("/api/procurement", (req, res) => {
    const { branchId, userId, title, description, estimatedCost } = req.body;
    db.prepare(`
      INSERT INTO procurement_requests (branch_id, user_id, title, description, estimated_cost)
      VALUES (?, ?, ?, ?, ?)
    `).run(branchId, userId, title, description, estimatedCost);
    res.json({ success: true });
  });

  app.get("/api/attendance", (req, res) => {
    const logs = db.prepare(`
      SELECT a.*, u.full_name, b.name as branch_name
      FROM attendance_logs a
      JOIN users u ON a.user_id = u.id
      JOIN branches b ON u.branch_id = b.id
      ORDER BY a.timestamp DESC
    `).all();
    res.json(logs);
  });

  app.post("/api/attendance", (req, res) => {
    const { userId, type } = req.body;
    db.prepare("INSERT INTO attendance_logs (user_id, type) VALUES (?, ?)").run(userId, type);
    res.json({ success: true });
  });

  // Import Orders Routes
  app.get("/api/import-orders", checkPermission("import-orders"), (req, res) => {
    const orders = db.prepare(`
      SELECT o.*, u.full_name as customer_name, p.full_name as procurement_officer, l.full_name as logistics_officer
      FROM import_orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN users p ON o.assigned_procurement_id = p.id
      LEFT JOIN users l ON o.assigned_logistics_id = l.id
      ORDER BY o.created_at DESC
    `).all();
    res.json(orders);
  });

  app.post("/api/import-orders", (req, res) => {
    const { userId, customerName, orderDetails, totalAmount } = req.body;
    db.prepare(`
      INSERT INTO import_orders (user_id, customer_name, order_details, total_amount)
      VALUES (?, ?, ?, ?)
    `).run(userId, customerName, orderDetails, totalAmount);
    res.json({ success: true });
  });

  app.patch("/api/import-orders/:id", checkPermission("import-orders"), (req, res) => {
    const { id } = req.params;
    const { status, assigned_procurement_id, assigned_logistics_id } = req.body;
    
    let query = "UPDATE import_orders SET ";
    const params = [];
    const updates = [];
    
    if (status) {
      updates.push("status = ?");
      params.push(status);
    }
    if (assigned_procurement_id) {
      updates.push("assigned_procurement_id = ?");
      params.push(assigned_procurement_id);
    }
    if (assigned_logistics_id) {
      updates.push("assigned_logistics_id = ?");
      params.push(assigned_logistics_id);
    }
    
    if (updates.length === 0) return res.json({ success: true });
    
    query += updates.join(", ") + " WHERE id = ?";
    params.push(id);
    
    db.prepare(query).run(...params);
    res.json({ success: true });
  });

  app.get("/api/users/by-role/:roleName", (req, res) => {
    const { roleName } = req.params;
    const users = db.prepare(`
      SELECT u.id, u.full_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE r.name = ?
    `).all(roleName);
    res.json(users);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
