import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cms/auth";
import { verifyAllPaymentLogos } from "@/lib/cms/payment-logo-pipeline";
import { getContent, saveContent } from "@/lib/cms/store";
import { revalidateSiteContent } from "@/lib/cms/revalidate";
import type { SiteContent } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const content = await getContent();
  return NextResponse.json(content, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const content = (await request.json()) as SiteContent;

    // Hard-verify payment logo filesystem paths before writing DB
    if (content.footer?.paymentLogos) {
      const verified = await verifyAllPaymentLogos(content.footer.paymentLogos);
      if (!verified.ok) {
        console.error("[CMS] Payment logo save blocked:", verified.details);
        return NextResponse.json(
          {
            error: verified.error,
            details: verified.details,
            code: "PAYMENT_LOGO_INVALID",
          },
          { status: 400 }
        );
      }
      content.footer.paymentLogos = verified.logos;
      console.info(
        "[CMS] Payment logos verified",
        verified.logos.map((l, i) => ({ slot: i + 1, src: l.src || "(cleared/empty)" }))
      );
    }

    await saveContent(content);
    revalidateSiteContent();
    console.info("[CMS] Database updated");

    return NextResponse.json({
      success: true,
      message: "Content saved successfully",
      paymentLogos: content.footer?.paymentLogos ?? null,
    });
  } catch (error) {
    console.error("[CMS] Save failed:", error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to save content",
        code: "SAVE_FAILED",
      },
      { status: 500 }
    );
  }
}
