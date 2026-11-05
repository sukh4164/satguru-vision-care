import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "prescriptions.view")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const rx1Id = searchParams.get("rx1");
    const rx2Id = searchParams.get("rx2");
    const customerId = searchParams.get("customerId");

    let rx1: any = null;
    let rx2: any = null;

    if (rx1Id && rx2Id) {
      rx1 = await db.prepare(`SELECT p.*, c.name as customer_name, c.customer_code FROM prescriptions p JOIN customers c ON p.customer_id = c.id WHERE p.id = ?`).get(rx1Id);
      rx2 = await db.prepare(`SELECT p.*, c.name as customer_name, c.customer_code FROM prescriptions p JOIN customers c ON p.customer_id = c.id WHERE p.id = ?`).get(rx2Id);
    } else if (customerId) {
      const rows = ((await db.prepare(`
        SELECT p.*, c.name as customer_name, c.customer_code 
        FROM prescriptions p 
        JOIN customers c ON p.customer_id = c.id 
        WHERE p.customer_id = ? 
        ORDER BY p.prescription_date DESC, p.id DESC 
        LIMIT 2
      `).all(customerId)) as unknown) as any[];

      rx1 = rows[0] || null; // Latest
      rx2 = rows[1] || null; // Previous
    }

    if (!rx1) {
      return NextResponse.json({ error: "No prescription records found to compare" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      latest: rx1,
      previous: rx2,
    });
  } catch (err: any) {
    console.error("Prescription compare error:", err);
    return NextResponse.json({ error: "Failed to compare prescriptions" }, { status: 500 });
  }
}
