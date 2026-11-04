import { db } from "./db";

export function logActivity({
  userId,
  userName,
  action,
  entityType,
  entityId,
  details,
  ipAddress,
}: {
  userId?: number | null;
  userName?: string | null;
  action: string;
  entityType: string;
  entityId?: string | number | null;
  details?: string | null;
  ipAddress?: string | null;
}) {
  try {
    db.prepare(
      `
      INSERT INTO activity_logs (user_id, user_name, action, entity_type, entity_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      userId || null,
      userName || "System",
      action,
      entityType,
      entityId ? String(entityId) : null,
      details || null,
      ipAddress || null
    );
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

