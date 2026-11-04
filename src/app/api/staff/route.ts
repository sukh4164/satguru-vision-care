import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "admin.staff")) {
      return NextResponse.json({ error: "Access denied: Admin only module" }, { status: 403 });
    }

    const staff = db
      .prepare(
        `
        SELECT 
          u.id,
          u.employee_id,
          u.name,
          u.username,
          u.email,
          u.mobile,
          u.status,
          u.joining_date,
          u.created_at,
          r.name as role_name,
          (SELECT COUNT(*) FROM customers c WHERE c.created_by = u.id) as customers_added,
          (SELECT COUNT(*) FROM orders o WHERE o.created_by = u.id) as orders_handled,
          (SELECT COUNT(*) FROM prescriptions p WHERE p.created_by = u.id) as prescriptions_tested,
          COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.received_by = u.id), 0) as payments_collected
        FROM users u
        JOIN roles r ON u.role_id = r.id
        ORDER BY u.id ASC
      `
      )
      .all();

    return NextResponse.json({ success: true, staff });
  } catch (err: any) {
    console.error("Staff GET error:", err);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "admin.staff")) {
      return NextResponse.json({ error: "Access denied: Admin only module" }, { status: 403 });
    }

    const body = await req.json();
    const { name, username, email, password, mobile, role, joining_date } = body;

    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: "Name, username, email, and password are required" },
        { status: 400 }
      );
    }

    // Check unique username and email
    const existing = db
      .prepare(`SELECT id, username, email FROM users WHERE lower(username) = ? OR lower(email) = ?`)
      .get(username.trim().toLowerCase(), email.trim().toLowerCase()) as any;

    if (existing) {
      return NextResponse.json(
        { error: "A user with this username or email already exists" },
        { status: 400 }
      );
    }

    // Get role ID
    const roleRecord = db
      .prepare(`SELECT id FROM roles WHERE name = ?`)
      .get(role === "admin" ? "admin" : "staff") as { id: number };

    // Auto-generate Employee ID: SVC-EMP-xxxx
    const maxRow = db.prepare(`SELECT MAX(id) as max_id FROM users`).get() as { max_id: number | null };
    const nextSeq = String((maxRow?.max_id || 0) + 1).padStart(3, "0");
    const employeeId = `SVC-EMP-${nextSeq}`;

    const passHash = await hashPassword(password);

    const insertResult = db
      .prepare(
        `
        INSERT INTO users (
          employee_id, name, username, email, password_hash, mobile,
          role_id, status, joining_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)
      `
      )
      .run(
        employeeId,
        name.trim(),
        username.trim().toLowerCase(),
        email.trim().toLowerCase(),
        passHash,
        mobile || null,
        roleRecord.id,
        joining_date || new Date().toISOString().split("T")[0]
      );

    const newUserId = insertResult.lastInsertRowid;

    logActivity({
      userId: user.id,
      userName: user.name,
      action: "User Created",
      entityType: "user",
      entityId: employeeId,
      details: `Created new ${role === "admin" ? "Admin" : "Staff"} user "${name}" (${username})`,
    });

    const newUser = db
      .prepare(
        `
        SELECT u.id, u.employee_id, u.name, u.username, u.email, u.mobile, u.status, u.joining_date, r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `
      )
      .get(newUserId);

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (err: any) {
    console.error("Staff POST error:", err);
    return NextResponse.json({ error: "Failed to create staff user" }, { status: 500 });
  }
}

