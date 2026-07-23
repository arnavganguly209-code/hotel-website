interface HeritageMistBackdropProps {
  goldColor: string;
  mistColor?: string;
  visible?: boolean;
}

/** Cream / soft-green luxury mist with elegant mountain ridge outlines only. */
export function HeritageMistBackdrop({
  goldColor,
  mistColor = "#7FA68A",
  visible = true,
}: HeritageMistBackdropProps) {
  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent 0%, #f5f0e6aa 28%, ${mistColor}22 68%, ${mistColor}38 100%)`,
        }}
      />
      <svg
        className="absolute bottom-0 left-1/2 h-[180px] w-[140%] max-w-none -translate-x-1/2 opacity-[0.32] sm:h-[220px]"
        viewBox="0 0 1440 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax meet"
      >
        {/* Far soft ridge wash */}
        <path
          d="M0 168 C160 148 240 118 360 128 C480 138 560 98 700 108 C840 118 940 88 1080 102 C1200 114 1320 138 1440 152 L1440 220 L0 220 Z"
          fill={mistColor}
          opacity="0.22"
        />
        {/* Mid mountain mass */}
        <path
          d="M0 186 L140 152 L260 172 L400 128 L540 162 L700 118 L860 158 L1020 124 L1180 160 L1320 138 L1440 168 L1440 220 L0 220 Z"
          fill={mistColor}
          opacity="0.28"
        />
        {/* Near foothill */}
        <path
          d="M0 200 L200 178 L420 196 L640 168 L880 190 L1120 172 L1440 188 L1440 220 L0 220 Z"
          fill={mistColor}
          opacity="0.34"
        />
        {/* Elegant outline ridges */}
        <path
          d="M40 176 L180 142 L300 164 L440 122 L600 156 L760 112 L940 150 L1120 120 L1300 148 L1420 136"
          stroke={mistColor}
          strokeWidth="1.15"
          opacity="0.45"
        />
        <path
          d="M80 192 L240 170 L460 186 L700 154 L960 180 L1240 162 L1400 176"
          stroke={mistColor}
          strokeWidth="0.9"
          opacity="0.28"
        />
        <circle cx="720" cy="198" r="2" fill={goldColor} opacity="0.32" />
      </svg>
    </div>
  );
}
