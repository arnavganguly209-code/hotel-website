import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF8F4",
          borderRadius: 4,
          border: "1px solid rgba(198,169,114,0.3)",
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 300,
            color: "#C6A972",
            fontFamily: "Georgia, serif",
          }}
        >
          T
        </span>
      </div>
    ),
    { ...size }
  );
}
