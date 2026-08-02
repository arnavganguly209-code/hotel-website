"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, FileText, Plus, Tag, FolderOpen, Image as ImageIcon, Clock, PenLine, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const ARTICLE_LINKS = [
  { href: "/admin/articles", label: "All Articles", icon: FileText },
  { href: "/admin/articles/new", label: "Add New Article", icon: Plus },
  { href: "/admin/articles/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/articles/tags", label: "Tags", icon: Tag },
  { href: "/admin/articles/media", label: "Media Library", icon: ImageIcon },
  { href: "/admin/articles/drafts", label: "Drafts", icon: PenLine },
  { href: "/admin/articles/scheduled", label: "Scheduled Articles", icon: Clock },
  { href: "/admin/articles/seo", label: "SEO Settings", icon: Search },
];

export function ArticlesNavGroup({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = pathname.startsWith("/admin/articles");
  const [open, setOpen] = useState(active);

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition",
          active
            ? "bg-gradient-to-r from-[#c5a059]/25 to-transparent text-[#f0dfb0]"
            : "text-white/70 hover:bg-white/5 hover:text-white"
        )}
      >
        <FileText className={cn("h-4 w-4 shrink-0", active && "text-[#c5a059]")} />
        <span className="flex-1 text-left">Articles</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="ml-3 space-y-0.5 border-l border-white/10 pl-2">
          {ARTICLE_LINKS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin/articles"
                ? pathname === "/admin/articles"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] transition",
                  isActive
                    ? "bg-white/10 text-[#f0dfb0]"
                    : "text-white/55 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-[#c5a059]/80" />
                {item.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
