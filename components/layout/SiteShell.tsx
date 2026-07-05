"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import type { SiteContent } from "@/lib/cms/types";

interface SiteShellProps {
  children: React.ReactNode;
  content: SiteContent;
}

export function SiteShell({ children, content }: SiteShellProps) {
  const pathname = usePathname();
  const isOrbit = pathname.startsWith("/orbit");

  if (isOrbit) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider theme={content.theme}>
      <Header header={content.header} hotelName={content.hotel.name} />
      <main className="pb-safe">{children}</main>
      <Footer content={content} />
    </ThemeProvider>
  );
}
