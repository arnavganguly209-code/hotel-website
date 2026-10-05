"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function PayLinkConfirmingRefresh() {
  const router = useRouter();
  useEffect(() => {
    const t = window.setTimeout(() => router.refresh(), 4000);
    return () => window.clearTimeout(t);
  }, [router]);
  return null;
}
