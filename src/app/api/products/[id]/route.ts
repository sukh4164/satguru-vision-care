import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "inventory.view")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const productId = params.id;
    const product = db
      .prepare(`SELECT * FROM products WHERE id = ? OR product_code = ? OR sku = ?`)
      .get(productId, productId, productId) as any;

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Transactions log
    const transactions = db
      .prepare(
        `
        SELECT t.*, u.name as staff_name
        FROM inventory_transactions t
        LEFT JOIN users u ON t.created_by = u.id
        WHERE t.product_id = ?
        ORDER BY t.created_at DESC LIMIT 50
      `
      )
      .all(product.id);

    return NextResponse.json({ success: true, product, transactions });
  } catch (err: any) {
    console.error("Product GET [id] error:", err);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "inventory.edit")) {
      return NextResponse.json({ error: "Access denied: Missing inventory edit permission" }, { status: 403 });
    }

    const productId = parseInt(params.id);
    const existing = db.prepare(`SELECT * FROM products WHERE id = ?`).get(productId) as any;

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      brand,
      category_name,
      model_number,
      sku,
      purchase_price,
      selling_price,
      min_stock_alert,
      description,
    } = body;

    db.prepare(`
      UPDATE products SET
        name = COALESCE(?, name),
        brand = COALESCE(?, brand),
        category_name = COALESCE(?, category_name),
        model_number = COALESCE(?, model_number),
        sku = COALESCE(?, sku),
        purchase_price = COALESCE(?, purchase_price),
        selling_price = COALESCE(?, selling_price),
        min_stock_alert = COALESCE(?, min_stock_alert),
        description = COALESCE(?, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name?.trim(),
      brand?.trim(),
      category_name,
      model_number?.trim(),
      sku?.trim()?.toUpperCase(),
      purchase_price !== undefined ? parseFloat(purchase_price) : null,
      selling_price !== undefined ? parseFloat(selling_price) : null,
      min_stock_alert !== undefined ? parseInt(min_stock_alert) : null,
      description,
      productId
    );

    logActivity({
      userId: user.id,
      userName: user.name,
      action: "Product Updated",
      entityType: "product",
      entityId: existing.product_code,
      details: `Updated details for ${existing.name}`,
    });

    const updated = db.prepare(`SELECT * FROM products WHERE id = ?`).get(productId);
    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    console.error("Product PUT error:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "inventory.delete")) {
      return NextResponse.json({ error: "Access denied: Missing inventory delete permission" }, { status: 403 });
    }

    const productId = parseInt(params.id);
    const existing = db.prepare(`SELECT * FROM products WHERE id = ?`).get(productId) as any;

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Soft delete product by setting status = 'deleted'
    db.prepare(`UPDATE products SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(productId);

    logActivity({
      userId: user.id,
      userName: user.name,
      action: "Product Deleted",
      entityType: "product",
      entityId: existing.product_code,
      details: `Removed product ${existing.name} (${existing.product_code})`,
    });

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (err: any) {
    console.error("Product DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

