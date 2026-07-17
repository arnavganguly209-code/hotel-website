import { FOOTER } from "@/components/footer/footer-theme";

interface FooterAtmosphereProps {
  /** When false, mountain silhouettes are hidden (Orbit toggle). */
  showMountains?: boolean;
}

/** Deep emerald luxury backdrop with low-opacity Himalayan mountain art. */
export function FooterAtmosphere({ showMountains = true }: FooterAtmosphereProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 65% at 50% 35%, #1A4638 0%, #14352C 48%, #0F2820 100%)",
        }}
      />
      {/* Soft radial gold lighting */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 18% 8%, ${FOOTER.gold}14 0%, transparent 42%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 82% 92%, ${FOOTER.gold}0C 0%, transparent 38%)`,
        }}
      />
      {/* Luxury vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.22) 100%)",
        }}
      />
      {/* Subtle texture */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Full-width mountain + pine silhouette — very low opacity, behind content */}
      {showMountains !== false ? (
        <svg
          className="absolute inset-x-0 bottom-0 h-[55%] w-full opacity-[0.14]"
          viewBox="0 0 1440 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMax slice"
        >
          {/* Far mountain layer */}
          <path
            d="M0 220 L120 160 L240 200 L380 120 L520 180 L680 90 L840 170 L980 110 L1140 190 L1280 140 L1440 200 L1440 320 L0 320 Z"
            fill="#0A1F19"
          />
          {/* Mid mountain layer */}
          <path
            d="M0 250 L180 190 L320 230 L460 150 L620 210 L780 130 L940 200 L1100 155 L1260 215 L1440 175 L1440 320 L0 320 Z"
            fill="#0C241C"
            opacity="0.9"
          />
          {/* Near ridge */}
          <path
            d="M0 280 L200 240 L400 270 L600 220 L800 260 L1000 230 L1200 265 L1440 245 L1440 320 L0 320 Z"
            fill="#081A14"
            opacity="0.85"
          />
          {/* Pine silhouettes — left */}
          <g fill="#061510" opacity="0.95">
            <path d="M80 280 L95 230 L110 280 Z" />
            <path d="M92 280 V300 H98 V280" />
            <path d="M140 285 L152 245 L164 285 Z" />
            <path d="M149 285 V302 H155 V285" />
            <path d="M200 278 L218 220 L236 278 Z" />
            <path d="M214 278 V305 H222 V278" />
            {/* right pines */}
            <path d="M1220 275 L1238 225 L1256 275 Z" />
            <path d="M1234 275 V302 H1242 V275" />
            <path d="M1280 282 L1294 242 L1308 282 Z" />
            <path d="M1291 282 V300 H1297 V282" />
            <path d="M1340 270 L1362 210 L1384 270 Z" />
            <path d="M1356 270 V305 H1368 V270" />
          </g>
        </svg>
      ) : null}

      {/* Soft golden ornaments — corners only */}
      <div
        className="absolute left-8 top-10 h-16 w-16 opacity-30"
        style={{
          borderLeft: `1px solid ${FOOTER.gold}55`,
          borderTop: `1px solid ${FOOTER.gold}55`,
        }}
      />
      <div
        className="absolute bottom-10 right-8 h-16 w-16 opacity-30"
        style={{
          borderRight: `1px solid ${FOOTER.gold}55`,
          borderBottom: `1px solid ${FOOTER.gold}55`,
        }}
      />
      <div
        className="absolute left-[6%] right-[6%] top-0 h-px"
        style={{
          backgroundImage: `linear-gradient(to right, transparent, ${FOOTER.gold}70, transparent)`,
        }}
      />
    </div>
  );
}
