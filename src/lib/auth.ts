import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "satguru-vision-care-secret-key-2024-optical-erp-system"
);

export const COOKIE_NAME = "satguru_session_token";

export interface SessionUser {
  id: number;
  employee_id: string;
  name: string;
  username: string;
  email: string;
  role: "admin" | "staff";
  role_id: number;
  permissions: string[];
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: {
  id: number;
  username: string;
  role: "admin" | "staff";
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { id: number; username: string; role: "admin" | "staff" };
  } catch {
    return null;
  }
}

export async function getUserWithPermissions(userId: number): Promise<SessionUser | null> {
  const user = (await db
    .prepare(
      `
      SELECT u.id, u.employee_id, u.name, u.username, u.email, u.role_id, u.status, r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ? AND u.status = 'active'
    `
    )
    .get(userId)) as
    | {
        id: number;
        employee_id: string;
        name: string;
        username: string;
        email: string;
        role_id: number;
        status: string;
        role_name: string;
      }
    | undefined;

  if (!user) return null;

  // Base permissions from role
  const rolePerms = ((await db
    .prepare(
      `
      SELECT permission_code FROM role_permissions WHERE role_id = ?
    `
    )
    .all(user.role_id)) as unknown) as { permission_code: string }[];

  const permSet = new Set(rolePerms.map((rp) => rp.permission_code));

  // Custom user overrides
  const userOverrides = ((await db
    .prepare(
      `
      SELECT permission_code, granted FROM user_permissions WHERE user_id = ?
    `
    )
    .all(user.id)) as unknown) as { permission_code: string; granted: number }[];

  userOverrides.forEach((o) => {
    if (o.granted === 1) {
      permSet.add(o.permission_code);
    } else {
      permSet.delete(o.permission_code);
    }
  });

  return {
    id: user.id,
    employee_id: user.employee_id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role_name as "admin" | "staff",
    role_id: user.role_id,
    permissions: Array.from(permSet),
  };
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const verified = await verifyToken(token);
  if (!verified?.id) return null;

  return await getUserWithPermissions(verified.id);
}

export function hasPermission(user: SessionUser | null, permissionCode: string): boolean {
  if (!user) return false;
  if (user.role === "admin") return true; // Admin has universal access
  return user.permissions.includes(permissionCode);
}
