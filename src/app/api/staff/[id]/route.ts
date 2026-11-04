import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "admin.staff")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const staffId = parseInt(params.id);
    const member = db
      .prepare(
        `
        SELECT 
          u.id, u.employee_id, u.name, u.username, u.email, u.mobile, u.status, u.joining_date,
          r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `
      )
      .get(staffId) as any;

    if (!member) {
      return NextResponse.json({ error: "Staff user not found" }, { status: 404 });
    }

    // Recent activity of this staff member
    const activities = db
      .prepare(`SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`)
      .all(staffId);

    return NextResponse.json({ success: true, member, activities });
  } catch (err: any) {
    console.error("Staff GET [id] error:", err);
    return NextResponse.json({ error: "Failed to fetch staff details" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "admin.staff")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const staffId = parseInt(params.id);
    const existing = db.prepare(`SELECT * FROM users WHERE id = ?`).get(staffId) as any;
    if (!existing) {
      return NextResponse.json({ error: "Staff user not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, email, mobile, status, role, newPassword } = body;

    let roleId = existing.role_id;
    if (role) {
      const roleRow = db.prepare(`SELECT id FROM roles WHERE name = ?`).get(role) as any;
      if (roleRow) roleId = roleRow.id;
    }

    let passwordHash = existing.password_hash;
    if (newPassword && newPassword.length >= 6) {
      passwordHash = await hashPassword(newPassword);
    }

    db.prepare(`
      UPDATE users SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        mobile = COALESCE(?, mobile),
        status = COALESCE(?, status),
        role_id = ?,
        password_hash = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name?.trim(),
      email?.trim()?.toLowerCase(),
      mobile?.trim(),
      status,
      roleId,
      passwordHash,
      staffId
    );

    logActivity({
      userId: user.id,
      userName: user.name,
      action: "Staff Updated",
      entityType: "user",
      entityId: existing.employee_id,
      details: `Updated details / permissions for ${existing.name}`,
    });

    const updated = db.prepare(`SELECT id, employee_id, name, username, email, mobile, status FROM users WHERE id = ?`).get(staffId);
    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    console.error("Staff PUT error:", err);
    return NextResponse.json({ error: "Failed to update staff user" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "admin.staff")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const staffId = parseInt(params.id);
    if (staffId === user.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    // Set to inactive instead of hard delete to preserve historical customer and order references
    db.prepare(`UPDATE users SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(staffId);

    logActivity({
      userId: user.id,
      userName: user.name,
      action: "Staff Deactivated",
      entityType: "user",
      entityId: staffId,
      details: `Deactivated staff account ID ${staffId}`,
    });

    return NextResponse.json({ success: true, message: "Staff account deactivated" });
  } catch (err: any) {
    console.error("Staff DELETE error:", err);
    return NextResponse.json({ error: "Failed to deactivate staff" }, { status: 500 });
  }
}

