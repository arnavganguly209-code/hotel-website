import { NextResponse } from "next/server";
import { verifyPassword, setSession, clearSession } from "@/lib/cms/auth";

export async function POST(request: Request) {
  try {
    const { password, action } = await request.json();

    if (action === "logout") {
      await clearSession();
      return NextResponse.json({ success: true });
    }

    if (!verifyPassword(password)) {
      return NextResponse.json({ error: "Invalid Secure Key" }, { status: 401 });
    }

    await setSession();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
