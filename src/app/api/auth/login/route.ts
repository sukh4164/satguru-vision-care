import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, signToken, COOKIE_NAME } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Username/Email and Password are required" },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    const user = db
      .prepare(
        `
        SELECT u.id, u.employee_id, u.name, u.username, u.email, u.password_hash, u.status, r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE lower(u.username) = ? OR lower(u.email) = ?
      `
      )
      .get(cleanIdentifier, cleanIdentifier) as
      | {
          id: number;
          employee_id: string;
          name: string;
          username: string;
          email: string;
          password_hash: string;
          status: string;
          role_name: "admin" | "staff";
        }
      | undefined;

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    if (user.status !== "active") {
      return NextResponse.json(
        { error: "This account has been deactivated. Please contact the administrator." },
        { status: 403 }
      );
    }

    const passwordMatches = await comparePassword(password, user.password_hash);
    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Sign JWT
    const token = await signToken({
      id: user.id,
      username: user.username,
      role: user.role_name,
    });

    logActivity({
      userId: user.id,
      userName: user.name,
      action: "Staff Login",
      entityType: "auth",
      entityId: user.id,
      details: `${user.role_name === "admin" ? "Admin" : "Staff"} logged in successfully`,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        employee_id: user.employee_id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role_name,
      },
    });

    // Set secure cookie
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}

