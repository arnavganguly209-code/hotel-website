"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SectionPreviewProps {
  href: string;
  label?: string;
  className?: string;
}

export function SectionPreviewLink({
  href,
  label = "View All",
  className,
}: SectionPreviewProps) {
  return (
    <div className={cn("mt-14 flex justify-center", className)}>
      <Button variant="outline" size="lg" asChild>
        <Link href={href}>
          {label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
