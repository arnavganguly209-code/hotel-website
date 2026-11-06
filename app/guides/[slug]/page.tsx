import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/cms/store";
import { SITE_URL } from "@/lib/seo";
import { buildBreadcrumbSchema, buildPageMetadata } from "@/lib/seo/page-metadata";
import { ALT_SEO_PAGES, altPagePath, getAltPage } from "@/lib/seo/alt-pages";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export function generateStaticParams() {
  return ALT_SEO_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getAltPage(slug);
  if (!page) return { title: "Guide", robots: { index: false, follow: false } };
  return buildPageMetadata(
    {
      title: page.title,
      description: page.description,
      canonical: altPagePath(page.slug),
      keywords: page.keyword,
      robots: "index,follow",
    },
    altPagePath(page.slug)
  );
}

export default async function AltGuidePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const page = getAltPage(slug);
  if (!page) notFound();

  const content = await getContent();
  const hotelName = content.hotel.name || "Hotel Thamel Park";
  const path = altPagePath(page.slug);
  const breadcrumb = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: page.h1, url: path },
  ]);
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: `${SITE_URL}${path}`,
    inLanguage: "en",
    about: { "@id": `${SITE_URL}/#hotel` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    primaryImageOfPage: content.seo.ogImage || undefined,
  };

  return (
    <article className="bg-[#f7f4ef] px-4 py-16 text-[#0f2420] sm:px-6 sm:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a6a32]">
          {hotelName} · Kathmandu
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{page.h1}</h1>
        <p className="mt-6 text-lg leading-relaxed text-[#3d4f46]">{page.intro}</p>
        {page.sections.map((section) => (
          <section key={section.heading} className="mt-10">
            <h2 className="font-display text-2xl">{section.heading}</h2>
            <p className="mt-3 leading-relaxed text-[#3d4f46]">{section.body}</p>
          </section>
        ))}
        <section className="mt-12">
          <h2 className="font-display text-2xl">Questions guests ask</h2>
          <div className="mt-4 space-y-4">
            {page.faqs.map((item) => (
              <details key={item.question} className="rounded-xl border border-[#e4d7bc] bg-white px-4 py-3" open>
                <summary className="cursor-pointer font-medium">{item.question}</summary>
                <p className="mt-2 leading-relaxed text-[#3d4f46]">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
        <nav className="mt-12 border-t border-[#e4d7bc] pt-6" aria-label="Related hotel pages">
          <h2 className="font-display text-2xl">Plan the stay</h2>
          <ul className="mt-4 space-y-2">
            {page.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-[#1d4d38] underline decoration-[#c5a059] underline-offset-4">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </article>
  );
}
