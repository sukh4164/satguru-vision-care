import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");

    let query = `SELECT * FROM activity_logs WHERE 1=1`;
    const params: any[] = [];

    // If staff user and doesn't have admin role, only show their own activities
    if (user.role !== "admin") {
      query += ` AND user_id = ?`;
      params.push(user.id);
    } else if (userId) {
      query += ` AND user_id = ?`;
      params.push(userId);
    }

    if (action) {
      query += ` AND action = ?`;
      params.push(action);
    }

    query += ` ORDER BY id DESC LIMIT ?`;
    params.push(limit);

    const logs = db.prepare(query).all(...params);

    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    console.error("Activity logs GET error:", err);
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 });
  }
}
