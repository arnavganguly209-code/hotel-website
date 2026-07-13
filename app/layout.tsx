import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import {
  SITE_NAME,
  SITE_KEYWORDS,
  SITE_URL,
  generateHotelSchema,
  generateLocalBusinessSchema,
} from "@/lib/seo";
import { SiteShell } from "@/components/layout/SiteShell";
import "./globals.css";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: content.seo.title,
      template: `%s | ${SITE_NAME}`,
    },
    description: content.seo.description,
    keywords: content.seo.keywords,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: { canonical: SITE_URL },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: content.seo.title,
      description: content.seo.description,
      images: content.seo.ogImage ? [{ url: content.seo.ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: content.seo.title,
      description: content.seo.description,
    },
    category: "hospitality",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getContent();
  const hotelSchema = generateHotelSchema();
  const localBusinessSchema = generateLocalBusinessSchema();

  return (
    <html lang="en">
      <head>
        {content.seo.favicon && <link rel="icon" href={content.seo.favicon} />}
        {content.seo.googleAnalytics && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${content.seo.googleAnalytics}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${content.seo.googleAnalytics}');
                `,
              }}
            />
          </>
        )}
        {content.seo.googleTagManager && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${content.seo.googleTagManager}');
              `,
            }}
          />
        )}
      </head>
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <SiteShell content={content}>{children}</SiteShell>
      </body>
    </html>
  );
}
