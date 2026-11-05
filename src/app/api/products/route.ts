import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "inventory.view")) {
      return NextResponse.json({ error: "Access denied: Missing inventory view permission" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const lowStockOnly = searchParams.get("lowStock") === "true";

    let query = `
      SELECT p.*
      FROM products p
      WHERE p.status = 'active'
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (lower(p.name) LIKE ? OR lower(p.brand) LIKE ? OR lower(p.product_code) LIKE ? OR lower(p.sku) LIKE ? OR lower(p.model_number) LIKE ?)`;
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term, term, term, term);
    }

    if (category) {
      query += ` AND p.category_name = ?`;
      params.push(category);
    }

    if (lowStockOnly) {
      query += ` AND p.stock_quantity <= p.min_stock_alert`;
    }

    query += ` ORDER BY p.stock_quantity <= p.min_stock_alert DESC, p.id DESC`;

    const products = await db.prepare(query).all(...params);

    // Summary counts
    const totalCount = ((await db.prepare(`SELECT COUNT(*) as c FROM products WHERE status = 'active'`).get()) as any) || { c: 0 };
    const lowStockCount = ((await db.prepare(`SELECT COUNT(*) as c FROM products WHERE status = 'active' AND stock_quantity <= min_stock_alert`).get()) as any) || { c: 0 };

    return NextResponse.json({
      success: true,
      products,
      summary: {
        total: totalCount.c,
        lowStock: lowStockCount.c,
      },
    });
  } catch (err: any) {
    console.error("Products GET error:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "inventory.add")) {
      return NextResponse.json({ error: "Access denied: Missing inventory add permission" }, { status: 403 });
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
      stock_quantity,
      min_stock_alert,
      description,
      image_url,
    } = body;

    if (!name || !category_name || selling_price === undefined) {
      return NextResponse.json({ error: "Product name, category and selling price are required" }, { status: 400 });
    }

    // Auto-generate Product Code: SVC-PRD-xxxx
    const maxRow = ((await db.prepare(`SELECT MAX(id) as max_id FROM products`).get()) as unknown) as { max_id: number | null };
    const nextSeq = (maxRow?.max_id || 0) + 1001;
    const productCode = `SVC-PRD-${nextSeq}`;
    const cleanSku = sku ? sku.trim().toUpperCase() : `${brand ? brand.slice(0, 3).toUpperCase() : "SVC"}-${nextSeq}`;

    const initialQty = parseInt(stock_quantity || "0");
    const minAlert = parseInt(min_stock_alert || "5");

    const insertResult = await db.prepare(`
      INSERT INTO products (
        product_code, sku, name, brand, category_name, model_number,
        purchase_price, selling_price, stock_quantity, min_stock_alert,
        description, image_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).run(
      productCode,
      cleanSku,
      name.trim(),
      brand ? brand.trim() : null,
      category_name,
      model_number ? model_number.trim() : null,
      parseFloat(purchase_price || "0"),
      parseFloat(selling_price || "0"),
      initialQty,
      minAlert,
      description || null,
      image_url || null
    );

    const productId = insertResult.lastInsertRowid;

    // Log initial stock transaction if quantity > 0
    if (initialQty > 0) {
      await db.prepare(`
        INSERT INTO inventory_transactions (
          product_id, transaction_type, quantity, balance_after, notes, created_by
        ) VALUES (?, 'IN', ?, ?, 'Initial inventory batch setup', ?)
      `).run(productId, initialQty, initialQty, user.id);
    }

    await logActivity({
      userId: user.id,
      userName: user.name,
      action: "Product Added",
      entityType: "product",
      entityId: productCode,
      details: `Added new product ${name} (${brand || "Generic"}) with stock ${initialQty}`,
    });

    const newProduct = await db.prepare(`SELECT * FROM products WHERE id = ?`).get(productId);

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (err: any) {
    console.error("Product POST error:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
