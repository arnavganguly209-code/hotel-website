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

  // Admin PMS and Orbit CMS use their own shells — never wrap with public site chrome.
  if (isOrbit || isAdmin) {
    return <>{children}</>;
  }

  const hotelName = stripSpaBrand(content.hotel.name || "Hotel Thamel Park");
  const header = {
    ...content.header,
    headerText: stripSpaBrand(content.header.headerText || "HOTEL THAMEL PARK"),
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
