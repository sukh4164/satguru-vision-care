import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { ALL_PERMISSIONS } from "@/lib/constants";
import { logActivity } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "admin.roles")) {
      return NextResponse.json({ error: "Access denied: Admin only module" }, { status: 403 });
    }

    const staffId = parseInt(params.id);
    const targetUser = db
      .prepare(`SELECT u.id, u.name, u.role_id, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?`)
      .get(staffId) as any;

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Role default permissions
    const rolePerms = db
      .prepare(`SELECT permission_code FROM role_permissions WHERE role_id = ?`)
      .all(targetUser.role_id) as { permission_code: string }[];
    const roleSet = new Set(rolePerms.map((rp) => rp.permission_code));

    // Custom overrides
    const overrides = db
      .prepare(`SELECT permission_code, granted FROM user_permissions WHERE user_id = ?`)
      .all(staffId) as { permission_code: string; granted: number }[];
    const overrideMap = new Map<string, boolean>();
    overrides.forEach((o) => overrideMap.set(o.permission_code, o.granted === 1));

    // Build complete permission map
    const permissionsWithStatus = ALL_PERMISSIONS.map((p) => {
      let isGranted = false;
      if (targetUser.role_name === "admin") {
        isGranted = true;
      } else if (overrideMap.has(p.code)) {
        isGranted = overrideMap.get(p.code)!;
      } else {
        isGranted = roleSet.has(p.code);
      }

      return {
        ...p,
        granted: isGranted,
        isCustomOverride: overrideMap.has(p.code),
      };
    });

    return NextResponse.json({
      success: true,
      targetUser,
      permissions: permissionsWithStatus,
    });
  } catch (err: any) {
    console.error("Permissions GET error:", err);
    return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "admin.roles")) {
      return NextResponse.json({ error: "Access denied: Admin only module" }, { status: 403 });
    }

    const staffId = parseInt(params.id);
    const { permissions } = await req.json(); // array of { code: string, granted: boolean }

    if (!Array.isArray(permissions)) {
      return NextResponse.json({ error: "Permissions array required" }, { status: 400 });
    }

    const targetUser = db.prepare(`SELECT name, employee_id FROM users WHERE id = ?`).get(staffId) as any;
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const saveTx = db.transaction(() => {
      // Clear previous custom overrides
      db.prepare(`DELETE FROM user_permissions WHERE user_id = ?`).run(staffId);

      const insertOverride = db.prepare(`
        INSERT INTO user_permissions (user_id, permission_code, granted)
        VALUES (?, ?, ?)
      `);

      permissions.forEach((p: { code: string; granted: boolean }) => {
        insertOverride.run(staffId, p.code, p.granted ? 1 : 0);
      });
    });

    saveTx();

    logActivity({
      userId: user.id,
      userName: user.name,
      action: "Permissions Updated",
      entityType: "user",
      entityId: targetUser.employee_id,
      details: `Custom permissions saved for ${targetUser.name}`,
    });

    return NextResponse.json({ success: true, message: "Permissions updated successfully" });
  } catch (err: any) {
    console.error("Permissions PUT error:", err);
    return NextResponse.json({ error: "Failed to update permissions" }, { status: 500 });
  }
}

