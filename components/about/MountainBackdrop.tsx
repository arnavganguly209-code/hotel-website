/** Soft cream–emerald Himalayan silhouette for luxury About backgrounds. */
export function MountainBackdrop({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <svg
        className="absolute bottom-0 left-1/2 h-[48%] w-[150%] -translate-x-1/2 opacity-[0.11]"
        viewBox="0 0 1440 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax slice"
      >
        {/* Far range — soft sage on cream */}
        <path
          d="M0 320V205L160 130L300 185L460 85L620 165L780 55L940 155L1100 95L1260 165L1440 110V320H0Z"
          fill="#B7D0C2"
        />
        {/* Mid range — light emerald mist */}
        <path
          d="M0 320V235L200 170L360 220L520 130L700 195L880 105L1040 185L1220 145L1440 195V320H0Z"
          fill="#9FBFB0"
          opacity="0.65"
        />
        {/* Near foothills — whisper of gold */}
        <path
          d="M0 320V265L240 220L420 255L620 200L820 245L1020 210L1240 245L1440 220V320H0Z"
          fill="#D4C49A"
          opacity="0.35"
        />
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_8%,rgba(201,162,39,0.045),transparent_42%),radial-gradient(ellipse_at_82%_92%,rgba(143,180,162,0.06),transparent_48%)]" />
    </div>
  );
}
