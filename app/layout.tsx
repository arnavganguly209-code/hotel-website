import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Jost } from "next/font/google";
import { headers } from "next/headers";
import { getContent } from "@/lib/cms/store";
import {
  SITE_NAME,
  SITE_URL,
  generateHotelSchema,
  generateLocalBusinessSchema,
  generateOrganizationSchema,
  generateWebsiteSchema,
} from "@/lib/seo";
import {
  BRAND_APPLE_TOUCH_PATH,
  BRAND_FAVICON_PATH,
  BRAND_OG_IMAGE_PATH,
  brandAsset,
} from "@/lib/brand";
import { SiteShell } from "@/components/layout/SiteShell";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { trackSiteVisit } from "@/lib/analytics/track-visit";
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

  const ogImage = content.seo.ogImage || brandAsset(BRAND_OG_IMAGE_PATH);

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
    icons: {
      icon: [
        { url: brandAsset(BRAND_FAVICON_PATH), sizes: "any" },
        { url: brandAsset("/favicon-16x16.png"), sizes: "16x16", type: "image/png" },
        { url: brandAsset("/favicon-32x32.png"), sizes: "32x32", type: "image/png" },
        { url: brandAsset("/favicon-48x48.png"), sizes: "48x48", type: "image/png" },
        { url: brandAsset("/icons/icon-192.png"), sizes: "192x192", type: "image/png" },
        { url: brandAsset("/icons/icon-512.png"), sizes: "512x512", type: "image/png" },
      ],
      shortcut: brandAsset(BRAND_FAVICON_PATH),
      apple: [
        { url: brandAsset(BRAND_APPLE_TOUCH_PATH), sizes: "180x180", type: "image/png" },
        { url: brandAsset("/icons/icon-152.png"), sizes: "152x152", type: "image/png" },
        { url: brandAsset("/icons/icon-167.png"), sizes: "167x167", type: "image/png" },
      ],
      other: [
        {
          rel: "mask-icon",
          url: brandAsset("/icons/monochrome-512.png"),
        },
      ],
    },
    manifest: "/manifest.webmanifest",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: content.seo.title,
      description: content.seo.description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: content.seo.title,
      description: content.seo.description,
      images: [ogImage],
    },
    category: "hospitality",
    verification: Object.keys(verification).length ? verification : undefined,
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: SITE_NAME,
    },
    applicationName: SITE_NAME,
    other: {
      "msapplication-TileColor": "#0F2420",
      "msapplication-TileImage": brandAsset("/icons/mstile-150x150.png"),
      "msapplication-config": "/browserconfig.xml",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hdrs = await headers();
  const isAdminRoute = hdrs.get("x-admin-route") === "1";

  if (isAdminRoute) {
    return (
      <html
        lang="en"
        className={`${cinzel.variable} ${cormorant.variable} ${jost.variable}`}
      >
        <head>
          <meta name="robots" content="noindex, nofollow" />
        </head>
        <body className="min-h-screen antialiased bg-[#f3eee6]">{children}</body>
      </html>
    );
  }

  trackSiteVisit();
  const content = await getContent();
  const hotelSchema = generateHotelSchema(content.hotel);
  const localBusinessSchema = generateLocalBusinessSchema(content.hotel);
  const organizationSchema = generateOrganizationSchema(content.hotel);
  const websiteSchema = generateWebsiteSchema();
  const pwaEnabled = content.performanceSettings?.pwaEnabled !== false;
  const faviconHref = brandAsset(BRAND_FAVICON_PATH);

  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${cormorant.variable} ${jost.variable}`}
    >
      <head>
        <link rel="icon" href={faviconHref} sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href={brandAsset("/favicon-32x32.png")} />
        <link rel="icon" type="image/png" sizes="16x16" href={brandAsset("/favicon-16x16.png")} />
        <link rel="apple-touch-icon" href={brandAsset(BRAND_APPLE_TOUCH_PATH)} />
        <link rel="shortcut icon" href={faviconHref} />
        <meta name="msapplication-TileColor" content="#0F2420" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
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
