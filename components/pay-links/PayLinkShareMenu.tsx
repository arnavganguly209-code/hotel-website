"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, Mail, Share2, X } from "lucide-react";
import { FaFacebookF, FaGoogle, FaLink, FaTelegramPlane, FaWhatsapp, FaYahoo } from "react-icons/fa";
import { FaFacebookMessenger, FaXTwitter } from "react-icons/fa6";
import { sharePayLinkMessage } from "@/lib/pay-links/money";

export type PayLinkShareTarget = {
  customerName: string;
  customerEmail?: string;
  title: string;
  publicUrl: string;
  publicToken?: string;
  cardFeeEnabled?: boolean;
  amountUsd?: unknown;
  subtotalAmountUsd?: unknown;
  cardFeeAmount?: unknown;
  totalAmountUsd?: unknown;
};

function tweetText(link: PayLinkShareTarget) {
  const first = `Payment request from Hotel Thamel Park: ${link.title}`;
  const combined = `${first} ${link.publicUrl}`;
  return combined.length > 260 ? `${first.slice(0, 200)} ${link.publicUrl}` : combined;
}

export function PayLinkShareMenu({
  link,
  className = "",
}: {
  link: PayLinkShareTarget;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState("");
  const [coords, setCoords] = useState({ top: 12, left: 12 });
  const [isMobile, setIsMobile] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const message = sharePayLinkMessage(link);
  const subject = `Payment Request – ${link.title} – Hotel Thamel Park`;
  const to = (link.customerEmail || "").trim();
  const url = link.publicUrl;

  useEffect(() => {
    function measure() {
      setIsMobile(window.innerWidth < 768);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointer(e: MouseEvent) {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  function toggle() {
    const next = !open;
    if (next && rootRef.current) {
      const r = rootRef.current.getBoundingClientRect();
      const width = 360;
      let left = r.right - width;
      if (left < 12) left = 12;
      if (left + width > window.innerWidth - 12) left = Math.max(12, window.innerWidth - width - 12);
      let top = r.bottom + 8;
      if (top + 360 > window.innerHeight) top = Math.max(12, r.top - 368);
      setCoords({ top, left });
    }
    setOpen(next);
  }

  async function copyText(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1600);
    } catch {
      setCopied("");
    }
  }

  async function moreShare() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: subject, text: message, url });
        setOpen(false);
        return;
      } catch {
        /* user cancelled or share failed */
      }
    }
    await copyText(url, "more");
  }

  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  const yahoo = `https://compose.mail.yahoo.com/?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(message)}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const telegram = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`;
  const twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText(link))}`;

  const items: {
    key: string;
    label: string;
    href?: string;
    onClick?: () => void;
    icon: ReactNode;
  }[] = [
    {
      key: "copy-link",
      label: copied === "link" ? "Copied" : "Copy Link",
      icon: copied === "link" ? <Check className="h-4 w-4" /> : <FaLink className="h-4 w-4" />,
      onClick: () => void copyText(url, "link"),
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: <FaWhatsapp className="h-4 w-4" />,
      href: whatsapp,
    },
    {
      key: "gmail",
      label: "Gmail",
      icon: <FaGoogle className="h-4 w-4" />,
      href: gmail,
    },
    {
      key: "yahoo",
      label: "Yahoo Mail",
      icon: <FaYahoo className="h-4 w-4" />,
      href: yahoo,
    },
    {
      key: "email",
      label: "Email",
      icon: <Mail className="h-4 w-4" />,
      href: mailto,
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: <FaFacebookF className="h-4 w-4" />,
      href: facebook,
    },
    {
      key: "messenger",
      label: copied === "messenger" ? "Copied" : "Messenger",
      icon: <FaFacebookMessenger className="h-4 w-4" />,
      onClick: () => {
        if (typeof navigator !== "undefined" && /iPhone|iPad|Android/i.test(navigator.userAgent)) {
          window.location.assign(`fb-messenger://share/?link=${encodeURIComponent(url)}`);
        }
        void copyText(url, "messenger");
      },
    },
    {
      key: "telegram",
      label: "Telegram",
      icon: <FaTelegramPlane className="h-4 w-4" />,
      href: telegram,
    },
    {
      key: "x",
      label: "X",
      icon: <FaXTwitter className="h-4 w-4" />,
      href: twitter,
    },
    {
      key: "copy-msg",
      label: copied === "msg" ? "Copied" : "Copy Message",
      icon: copied === "msg" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />,
      onClick: () => void copyText(message, "msg"),
    },
    {
      key: "more",
      label: copied === "more" ? "Copied" : "More",
      icon: <Share2 className="h-4 w-4" />,
      onClick: () => void moreShare(),
    },
  ];

  return (
    <div ref={rootRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Share payment link"
        onClick={toggle}
        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#c5a059]/40 bg-[#0f2420] px-4 py-2 text-xs font-medium text-[#f7f5ef] hover:bg-[#16352e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c5a059]"
      >
        <Share2 className="h-3.5 w-3.5" aria-hidden />
        Share
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <>
              <div className="fixed inset-0 z-[80] bg-[#0f2420]/40 md:bg-transparent" onClick={() => setOpen(false)} />
              <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="fixed z-[90] max-h-[85vh] overflow-y-auto border border-[#e4dcc9] bg-[#fffdf8] p-4 shadow-[0_12px_40px_rgba(15,36,32,0.16)]"
                style={
                  isMobile
                    ? { left: 0, right: 0, bottom: 0, borderRadius: "16px 16px 0 0" }
                    : { top: coords.top, left: coords.left, width: 360, borderRadius: 16 }
                }
              >
            <div className="mb-3 flex items-center justify-between md:mb-2">
              <p id={titleId} className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c5a059]">
                Share Payment Link
              </p>
              <button
                type="button"
                className="rounded-md p-1 text-[#5a635c] hover:bg-[#f7f2ea] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c5a059]"
                aria-label="Close share menu"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {items.map((item) => {
                const cls =
                  "inline-flex min-h-[44px] w-full items-center gap-2 rounded-xl border border-[#e4dcc9] bg-white px-3 py-2 text-left text-xs font-medium text-[#0f2420] transition hover:border-[#c5a059]/50 hover:bg-[#fbf8f1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c5a059]";
                if (item.href) {
                  return (
                    <a
                      key={item.key}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.label}
                      title={item.label}
                      className={cls}
                      onClick={() => setOpen(false)}
                    >
                      <span className="text-[#153a2a]">{item.icon}</span>
                      {item.label}
                    </a>
                  );
                }
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-label={item.label}
                    title={item.label}
                    className={cls}
                    onClick={item.onClick}
                  >
                    <span className="text-[#153a2a]">{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
            </div>
              </div>
            </>,
            document.body
          )
        : null}
    </div>
  );
}
