import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    const body = (await req.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { success: false, error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    const subscriber = await db.newsletterSubscriber.upsert({
      where: { email },
      create: { email, status: "active" },
      update: { status: "active" },
    });

    return NextResponse.json({ success: true, subscriber: { email: subscriber.email } });
  } catch (error) {
    console.error("[Newsletter]", error);
    return NextResponse.json({ success: false, error: "Subscription failed" }, { status: 500 });
  }
}
