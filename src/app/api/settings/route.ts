import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";

export async function GET() {
  try {
    const settings = await db.prepare(`SELECT * FROM store_settings LIMIT 1`).get();
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "admin.settings")) {
      return NextResponse.json({ error: "Access denied: Admin only" }, { status: 403 });
    }

    const body = await req.json();
    const {
      store_name,
      tagline,
      address,
      city,
      state,
      pincode,
      mobile,
      whatsapp,
      email,
      website,
      gst_number,
      invoice_prefix,
      currency_symbol,
      gst_rate,
      invoice_footer,
      business_hours,
    } = body;

    await db.prepare(`
      UPDATE store_settings SET
        store_name = COALESCE(?, store_name),
        tagline = COALESCE(?, tagline),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        pincode = COALESCE(?, pincode),
        mobile = COALESCE(?, mobile),
        whatsapp = COALESCE(?, whatsapp),
        email = COALESCE(?, email),
        website = COALESCE(?, website),
        gst_number = COALESCE(?, gst_number),
        invoice_prefix = COALESCE(?, invoice_prefix),
        currency_symbol = COALESCE(?, currency_symbol),
        gst_rate = COALESCE(?, gst_rate),
        invoice_footer = COALESCE(?, invoice_footer),
        business_hours = COALESCE(?, business_hours),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(
      store_name?.trim(),
      tagline?.trim(),
      address?.trim(),
      city?.trim(),
      state?.trim(),
      pincode?.trim(),
      mobile?.trim(),
      whatsapp?.trim(),
      email?.trim(),
      website?.trim(),
      gst_number?.trim()?.toUpperCase(),
      invoice_prefix?.trim()?.toUpperCase(),
      currency_symbol?.trim(),
      gst_rate !== undefined ? parseFloat(gst_rate) : null,
      invoice_footer?.trim(),
      business_hours?.trim()
    );

    await logActivity({
      userId: user.id,
      userName: user.name,
      action: "Settings Updated",
      entityType: "settings",
      entityId: "1",
      details: "Store profile, GSTIN, and billing settings updated",
    });

    const updated = await db.prepare(`SELECT * FROM store_settings LIMIT 1`).get();
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    console.error("Settings PUT error:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

