import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "Pending";
    const type = searchParams.get("type") || "";

    let query = `
      SELECT 
        f.*,
        c.name as customer_name,
        c.mobile as customer_mobile,
        c.whatsapp as customer_whatsapp,
        c.customer_code,
        o.order_code,
        u.name as creator_name
      FROM followups f
      JOIN customers c ON f.customer_id = c.id
      LEFT JOIN orders o ON f.order_id = o.id
      LEFT JOIN users u ON f.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== "All") {
      query += ` AND f.status = ?`;
      params.push(status);
    }

    if (type) {
      query += ` AND f.type = ?`;
      params.push(type);
    }

    query += ` ORDER BY f.scheduled_date ASC, f.id DESC`;

    const followups = db.prepare(query).all(...params);

    return NextResponse.json({ success: true, followups });
  } catch (err: any) {
    console.error("Followups GET error:", err);
    return NextResponse.json({ error: "Failed to fetch followups" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { customer_id, order_id, type, scheduled_date, priority, notes } = body;

    if (!customer_id || !type || !scheduled_date) {
      return NextResponse.json({ error: "Customer, type and scheduled date are required" }, { status: 400 });
    }

    const insertResult = db.prepare(`
      INSERT INTO followups (
        customer_id, order_id, type, scheduled_date, status, priority, notes, created_by
      ) VALUES (?, ?, ?, ?, 'Pending', ?, ?, ?)
    `).run(
      customer_id,
      order_id || null,
      type,
      scheduled_date,
      priority || "Medium",
      notes || null,
      user.id
    );

    const newFollowup = db.prepare(`SELECT * FROM followups WHERE id = ?`).get(insertResult.lastInsertRowid);
    return NextResponse.json({ success: true, followup: newFollowup }, { status: 201 });
  } catch (err: any) {
    console.error("Followup POST error:", err);
    return NextResponse.json({ error: "Failed to create followup" }, { status: 500 });
  }
}

