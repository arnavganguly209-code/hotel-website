"use client";

interface AmenitiesMountainBackdropProps {
  goldColor: string;
  mistColor?: string;
  visible?: boolean;
}

/**
 * Soft Himalayan mountain artwork for the World-Class Amenities section.
 * Low-opacity ridges only — no left/right decorative plant shapes.
 */
export function AmenitiesMountainBackdrop({
  goldColor,
  mistColor = "#7FA68A",
  visible = true,
}: AmenitiesMountainBackdropProps) {
  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Soft vertical wash */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${mistColor}0A 55%, ${mistColor}18 100%)`,
        }}
      />

      {/* Full-width faded mountain layers */}
      <svg
        className="absolute inset-x-0 bottom-0 h-[58%] w-full opacity-[0.22] sm:h-[62%]"
        viewBox="0 0 1440 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax slice"
      >
        {/* Far peaks */}
        <path
          d="M0 240 L140 170 L260 210 L400 120 L560 190 L720 95 L880 185 L1040 125 L1200 200 L1340 150 L1440 210 L1440 360 L0 360 Z"
          fill={mistColor}
          opacity="0.35"
        />
        {/* Mid ridges */}
        <path
          d="M0 270 L180 200 L340 250 L500 160 L680 230 L860 145 L1040 220 L1220 175 L1440 235 L1440 360 L0 360 Z"
          fill={mistColor}
          opacity="0.45"
        />
        {/* Near foothills */}
        <path
          d="M0 300 L220 255 L420 290 L640 240 L860 280 L1080 250 L1280 285 L1440 260 L1440 360 L0 360 Z"
          fill={mistColor}
          opacity="0.55"
        />
        {/* Soft ridge line */}
        <path
          d="M40 255 L200 185 L340 230 L500 145 L700 210 L900 130 L1100 205 L1300 165 L1420 220"
          stroke={mistColor}
          strokeWidth="1.1"
          opacity="0.35"
        />
        <circle cx="720" cy="330" r="2" fill={goldColor} opacity="0.3" />
      </svg>
    </div>
  );
}
