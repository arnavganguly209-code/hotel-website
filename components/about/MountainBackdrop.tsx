/** Soft Himalayan mountain silhouette for cream About backgrounds. */
export function MountainBackdrop({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <svg
        className="absolute bottom-0 left-1/2 h-[42%] w-[140%] -translate-x-1/2 opacity-[0.14]"
        viewBox="0 0 1440 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d="M0 320V210L180 120L320 190L480 70L640 160L800 40L960 150L1120 90L1280 170L1440 100V320H0Z"
          fill="#14352C"
        />
        <path
          d="M0 320V240L220 160L380 220L540 110L700 190L880 80L1040 180L1220 130L1440 200V320H0Z"
          fill="#1A2E26"
          opacity="0.55"
        />
        <path
          d="M0 320V270L260 210L420 260L620 180L820 250L1020 190L1240 240L1440 210V320H0Z"
          fill="#C9A227"
          opacity="0.18"
        />
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(201,162,39,0.06),transparent_45%),radial-gradient(ellipse_at_80%_100%,rgba(20,53,44,0.05),transparent_50%)]" />
    </div>
  );
}
