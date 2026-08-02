import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cms/auth";
import { verifyAllPaymentLogos } from "@/lib/cms/payment-logo-pipeline";
import { getContent, saveContent } from "@/lib/cms/store";
import { revalidateSiteContent } from "@/lib/cms/revalidate";
import { mediaFingerprint } from "@/lib/cms/media-fingerprint";
import { persistMediaSrc } from "@/lib/cms/media-url";
import type { SiteContent } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

/** Keep Orbit-cleared About images blank in DB (never leave stock paths after clear). */
function normalizeAboutMedia(content: SiteContent): SiteContent {
  const about = content.aboutPage;
  if (!about) return content;
  return {
    ...content,
    aboutPage: {
      ...about,
      hero: { ...about.hero, imageSrc: persistMediaSrc(about.hero?.imageSrc) },
      story: { ...about.story, imageSrc: persistMediaSrc(about.story?.imageSrc) },
      diningExperience: {
        ...about.diningExperience,
        imageSrc: persistMediaSrc(about.diningExperience?.imageSrc),
      },
      spaWellness: {
        ...about.spaWellness,
        imageSrc: persistMediaSrc(about.spaWellness?.imageSrc),
      },
      cta: {
        ...about.cta,
        backgroundImage: persistMediaSrc(about.cta?.backgroundImage),
      },
    },
  };
}

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
    const content = normalizeAboutMedia((await request.json()) as SiteContent);

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

    // Bump mediaRevision ONLY when media paths actually change.
    // Text-only Orbit saves must not force every public tab to remount images.
    let previousFp = "";
    let previousRevision = content.performanceSettings?.mediaRevision || "";
    try {
      const previous = await getContent();
      previousFp = mediaFingerprint(previous);
      previousRevision = previous.performanceSettings?.mediaRevision || previousRevision;
    } catch {
      /* first save / read failure — bump revision */
    }

    const nextFp = mediaFingerprint(content);
    const mediaChanged = !previousFp || previousFp !== nextFp;
    const mediaRevision = mediaChanged
      ? String(Date.now())
      : previousRevision || String(Date.now());

    await saveContent({
      ...content,
      performanceSettings: {
        ...content.performanceSettings,
        mediaRevision,
      },
    });
    revalidateSiteContent();
    console.info("[CMS] Database updated", { mediaRevision, mediaChanged });

    return NextResponse.json({
      success: true,
      message: "Content saved successfully",
      mediaRevision,
      mediaChanged,
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
