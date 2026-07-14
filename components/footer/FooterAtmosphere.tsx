/** Soft luxury backdrop — cream depth, gold light, faint ornament. Never busy. */
export function FooterAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Base cream → ivory → soft gold wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #FFF9F2 0%, #FAF6EE 28%, #F7F0E4 55%, #FAF6EE 78%, #F3EBD8 100%)",
        }}
      />

      {/* Soft gold radial glow */}
      <div className="absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(200,161,69,0.10)_0%,transparent_68%)]" />
      <div className="absolute -right-16 bottom-0 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(200,161,69,0.08)_0%,transparent_70%)]" />
      <div className="absolute left-1/2 top-1/3 h-[280px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(24,56,47,0.03)_0%,transparent_70%)]" />

      {/* Fine paper grain */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Soft ornamental lattice (very light) */}
      <div
        className="absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 8c2 6 6 10 12 12-6 2-10 6-12 12-2-6-6-10-12-12 6-2 10-6 12-12z' fill='none' stroke='%23C8A145' stroke-width='0.6'/%3E%3C/svg%3E\")",
          backgroundSize: "72px 72px",
        }}
      />

      {/* Corner mandala accents */}
      <svg
        className="absolute left-3 top-3 h-28 w-28 text-luxury-gold opacity-[0.09] sm:left-6 sm:top-6 sm:h-36 sm:w-36"
        viewBox="0 0 120 120"
        fill="none"
      >
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="0.4" />
        <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="0.4" />
        <path d="M24 2v8M24 38v8M2 24h8M38 24h8" stroke="currentColor" strokeWidth="0.45" />
        <path
          d="M10 10l5 5M33 10l-5 5M10 38l5-5M33 38l-5-5"
          stroke="currentColor"
          strokeWidth="0.4"
        />
      </svg>
      <svg
        className="absolute bottom-3 right-3 h-28 w-28 rotate-180 text-luxury-gold opacity-[0.09] sm:bottom-6 sm:right-6 sm:h-36 sm:w-36"
        viewBox="0 0 120 120"
        fill="none"
      >
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="0.4" />
        <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="0.4" />
        <path d="M24 2v8M24 38v8M2 24h8M38 24h8" stroke="currentColor" strokeWidth="0.45" />
        <path
          d="M10 10l5 5M33 10l-5 5M10 38l5-5M33 38l-5-5"
          stroke="currentColor"
          strokeWidth="0.4"
        />
      </svg>

      {/* Delicate gold horizontal rules */}
      <div className="absolute left-[8%] right-[8%] top-0 h-px bg-gradient-to-r from-transparent via-luxury-gold/35 to-transparent" />
      <div className="absolute bottom-0 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-luxury-gold/20 to-transparent" />

      {/* Soft forest green accent veil at the base (very light) */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[rgba(24,56,47,0.035)] to-transparent" />
    </div>
  );
}
