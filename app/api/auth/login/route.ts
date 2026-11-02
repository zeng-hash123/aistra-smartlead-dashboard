import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    const expectedPassword = process.env.DASHBOARD_PASSWORD || "aistra2026";

    if (!password || password !== expectedPassword) {
      return NextResponse.json(
        { error: "Invalid password. Access denied." },
        { status: 401 }
      );
    }

    const token = await createSessionToken();

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_MS / 1000,
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal server error during authentication" },
      { status: 500 }
    );
  }
}
