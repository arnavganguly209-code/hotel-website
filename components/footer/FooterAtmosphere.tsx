/** Dark emerald luxury backdrop matching the premium footer reference. */
export function FooterAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, #1A3D32 0%, #0F2A22 45%, #0C241C 100%)",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(200,161,69,0.08)_0%,transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_100%,rgba(200,161,69,0.05)_0%,transparent_40%)]" />
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="absolute left-[6%] right-[6%] top-0 h-px bg-gradient-to-r from-transparent via-[#C8A145]/40 to-transparent" />
    </div>
  );
}
