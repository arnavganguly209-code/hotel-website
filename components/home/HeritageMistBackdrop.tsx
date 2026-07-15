interface HeritageMistBackdropProps {
  goldColor: string;
  mistColor?: string;
  visible?: boolean;
}

/** Soft Nepal-inspired mist + temple silhouettes along the section floor. */
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
          background: `linear-gradient(180deg, transparent 0%, ${mistColor}18 45%, ${mistColor}33 100%)`,
        }}
      />
      <svg
        className="absolute bottom-0 left-1/2 h-[180px] w-[140%] max-w-none -translate-x-1/2 opacity-[0.28] sm:h-[220px]"
        viewBox="0 0 1440 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax meet"
      >
        <path
          d="M0 180 C120 160 180 120 260 140 C320 155 360 100 420 95 C480 90 520 130 580 125 C640 120 680 70 760 75 C840 80 880 130 960 125 C1040 120 1080 80 1160 90 C1240 100 1320 140 1440 160 L1440 220 L0 220 Z"
          fill={mistColor}
          opacity="0.35"
        />
        {/* Temple / pagoda silhouettes */}
        <g fill={mistColor} opacity="0.55">
          <path d="M180 168 L195 120 L210 168 Z" />
          <path d="M188 168 V190 H202 V168" />
          <path d="M195 108 L205 120 H185 Z" />
          <path d="M420 175 L440 125 L460 175 Z" />
          <path d="M432 175 V198 H448 V175" />
          <path d="M440 112 L455 125 H425 Z" />
          <path d="M720 170 L745 110 L770 170 Z" />
          <path d="M735 170 V200 H755 V170" />
          <path d="M745 95 L765 110 H725 Z" />
          <path d="M1020 172 L1040 128 L1060 172 Z" />
          <path d="M1032 172 V196 H1048 V172" />
          <path d="M1040 116 L1054 128 H1026 Z" />
          <path d="M1240 165 L1258 122 L1276 165 Z" />
          <path d="M1250 165 V190 H1266 V165" />
          <path d="M1258 110 L1272 122 H1244 Z" />
        </g>
        {/* Soft mountain ridges */}
        <path
          d="M60 190 L180 150 L280 175 L400 140 L520 170 L680 130 L820 165 L980 135 L1140 168 L1280 145 L1440 175"
          stroke={mistColor}
          strokeWidth="1.2"
          opacity="0.4"
        />
        <circle cx="720" cy="198" r="2" fill={goldColor} opacity="0.35" />
      </svg>
    </div>
  );
}
