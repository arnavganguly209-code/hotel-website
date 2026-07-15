import { FOOTER } from "@/components/footer/footer-theme";

/** Dark emerald luxury backdrop matching the premium footer reference. */
export function FooterAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 65% at 50% 35%, #1A3D32 0%, #0F2A22 48%, #0A1F19 100%)",
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
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.28) 100%)",
        }}
      />
      {/* Subtle texture */}
      <div
        className="absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E\")",
        }}
      />
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
