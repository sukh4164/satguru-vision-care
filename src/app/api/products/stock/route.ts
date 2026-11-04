import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "inventory.update_stock")) {
      return NextResponse.json({ error: "Access denied: Missing stock update permission" }, { status: 403 });
    }

    const { product_id, transaction_type, quantity, notes, reference_id } = await req.json();

    if (!product_id || !transaction_type || !quantity) {
      return NextResponse.json({ error: "Product, transaction type and quantity are required" }, { status: 400 });
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ error: "Quantity must be a positive number" }, { status: 400 });
    }

    const product = db.prepare(`SELECT * FROM products WHERE id = ?`).get(product_id) as any;
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let newStock = product.stock_quantity;
    if (transaction_type === "IN") {
      newStock += qty;
    } else if (transaction_type === "OUT") {
      if (product.stock_quantity < qty) {
        return NextResponse.json({ error: `Insufficient stock! Current stock is ${product.stock_quantity}` }, { status: 400 });
      }
      newStock -= qty;
    } else if (transaction_type === "ADJUSTMENT") {
      newStock = qty; // direct adjustment to new count
    } else {
      return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });
    }

    // Execute within a database transaction
    const updateTx = db.transaction(() => {
      db.prepare(`UPDATE products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(newStock, product.id);

      db.prepare(`
        INSERT INTO inventory_transactions (
          product_id, transaction_type, quantity, balance_after, reference_id, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(product.id, transaction_type, qty, newStock, reference_id || null, notes || null, user.id);
    });

    updateTx();

    logActivity({
      userId: user.id,
      userName: user.name,
      action: "Stock Adjusted",
      entityType: "product",
      entityId: product.product_code,
      details: `${transaction_type}: ${qty} units of ${product.name}. New balance: ${newStock}`,
    });

    const updatedProduct = db.prepare(`SELECT * FROM products WHERE id = ?`).get(product.id);
    return NextResponse.json({ success: true, product: updatedProduct, newStock });
  } catch (err: any) {
    console.error("Stock update error:", err);
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}

