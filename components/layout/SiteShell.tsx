"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { PerformanceProvider } from "@/components/shared/PerformanceProvider";
import { MediaLiveSync } from "@/components/shared/MediaLiveSync";
import type { SiteContent } from "@/lib/cms/types";

interface SiteShellProps {
  children: React.ReactNode;
  content: SiteContent;
}

function stripSpaBrand(value: string) {
  return value
    .replace(/\s*&\s*SPA/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function SiteShell({ children, content }: SiteShellProps) {
  const pathname = usePathname();
  const isOrbit = pathname.startsWith("/orbit");
  const isAdmin = pathname.startsWith("/admin");
  const isPayLink = pathname.startsWith("/pay");

  // Admin PMS, Orbit CMS, and public Payment Links use their own chrome.
  if (isOrbit || isAdmin) {
    return <>{children}</>;
  }

  if (isPayLink) {
    return (
      <ThemeProvider theme={content.theme}>
        <PerformanceProvider value={content.performanceSettings}>{children}</PerformanceProvider>
      </ThemeProvider>
    );
  }

  const hotelName = stripSpaBrand(content.hotel.name || "Hotel Thamel Park");
  const header = {
    ...content.header,
    headerText: stripSpaBrand(content.header.headerText || "HOTEL THAMEL PARK"),
    phone: content.header.phone || content.hotel.phone || "",
  };

  return (
    <ThemeProvider theme={content.theme}>
      <PerformanceProvider value={content.performanceSettings}>
        <MediaLiveSync />
        <Header header={header} hotelName={hotelName} />
        <main className="pb-safe">{children}</main>
        <Footer content={content} />
      </PerformanceProvider>
    </ThemeProvider>
  );
}
