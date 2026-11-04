import { NextResponse } from "next/server";
import { COOKIE_NAME, getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (user) {
      logActivity({
        userId: user.id,
        userName: user.name,
        action: "Staff Logout",
        entityType: "auth",
        entityId: user.id,
        details: `${user.name} logged out`,
      });
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    response.cookies.set(COOKIE_NAME, "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}

