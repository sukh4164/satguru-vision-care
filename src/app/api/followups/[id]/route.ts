import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const followupId = parseInt(params.id);
    const body = await req.json();
    const { status, scheduled_date, notes, priority } = body;

    const existing = db.prepare(`SELECT * FROM followups WHERE id = ?`).get(followupId) as any;
    if (!existing) {
      return NextResponse.json({ error: "Followup not found" }, { status: 404 });
    }

    const completedAt = status === "Completed" ? new Date().toISOString() : null;

    db.prepare(`
      UPDATE followups SET
        status = COALESCE(?, status),
        scheduled_date = COALESCE(?, scheduled_date),
        notes = COALESCE(?, notes),
        priority = COALESCE(?, priority),
        completed_at = COALESCE(?, completed_at)
      WHERE id = ?
    `).run(status, scheduled_date, notes, priority, completedAt, followupId);

    logActivity({
      userId: user.id,
      userName: user.name,
      action: "Followup Updated",
      entityType: "followup",
      entityId: followupId,
      details: `Followup marked as ${status || existing.status}`,
    });

    const updated = db.prepare(`SELECT * FROM followups WHERE id = ?`).get(followupId);
    return NextResponse.json({ success: true, followup: updated });
  } catch (err: any) {
    console.error("Followup PUT error:", err);
    return NextResponse.json({ error: "Failed to update followup" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const followupId = parseInt(params.id);
    db.prepare(`DELETE FROM followups WHERE id = ?`).run(followupId);
    return NextResponse.json({ success: true, message: "Followup deleted" });
  } catch (err: any) {
    console.error("Followup DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete followup" }, { status: 500 });
  }
}

