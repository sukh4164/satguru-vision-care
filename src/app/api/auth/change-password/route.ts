import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hashPassword, comparePassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const row = ((await db
      .prepare("SELECT password_hash FROM users WHERE id = ?")
      .get(user.id)) as unknown) as { password_hash: string } | undefined;

    if (!row) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await comparePassword(currentPassword, row.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(newPassword);
    await db.prepare("UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
      newHash,
      user.id
    );

    await logActivity({
      userId: user.id,
      userName: user.name,
      action: "Password Changed",
      entityType: "auth",
      entityId: user.id,
      details: "User changed their password successfully",
    });

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}

