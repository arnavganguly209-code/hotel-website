import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Jost } from "next/font/google";
import { getContent } from "@/lib/cms/store";
import {
  SITE_NAME,
  SITE_KEYWORDS,
  SITE_URL,
  generateHotelSchema,
  generateLocalBusinessSchema,
} from "@/lib/seo";
import { SiteShell } from "@/components/layout/SiteShell";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-cinzel",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-jost",
});

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const viewport: Viewport = {
  themeColor: "#0F2420",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const verification: Metadata["verification"] = {};
  if (content.seo.googleSiteVerification) {
    verification.google = content.seo.googleSiteVerification;
  }
  if (content.seo.bingSiteVerification) {
    verification.other = {
      "msvalidate.01": content.seo.bingSiteVerification,
    };
  }

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
      index: content.seo.robotsAllow !== false,
      follow: content.seo.robotsAllow !== false,
      googleBot: {
        index: content.seo.robotsAllow !== false,
        follow: content.seo.robotsAllow !== false,
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
    verification: Object.keys(verification).length ? verification : undefined,
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: SITE_NAME,
    },
    applicationName: SITE_NAME,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getContent();
  const hotelSchema = generateHotelSchema(content.hotel);
  const localBusinessSchema = generateLocalBusinessSchema(content.hotel);
  const pwaEnabled = content.performanceSettings?.pwaEnabled !== false;

  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${cormorant.variable} ${jost.variable}`}
    >
      <head>
        {content.seo.favicon && <link rel="icon" href={content.seo.favicon} />}
        {content.seo.googleAnalytics && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${content.seo.googleAnalytics}`}
            />
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
        {content.seo.googleTagManager ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${content.seo.googleTagManager}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <SiteShell content={content}>{children}</SiteShell>
        {pwaEnabled ? <ServiceWorkerRegister /> : null}
      </body>
    </html>
  );
}
