import { ImageResponse } from "next/og";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getHotelMailConfig } from "@/lib/email/config";
import { absoluteAssetUrl, formatUsdAmount } from "@/lib/pay-links/money";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = { params: Promise<{ token: string }> };

export default async function PayLinkOgImage({ params }: Params) {
  const { token } = await params;
  const hotel = getHotelMailConfig();
  const link = isDatabaseAvailable()
    ? await db.paymentLink.findUnique({ where: { publicToken: token.trim().toUpperCase() } })
    : null;
  const title = link?.title || "Payment Request";
  const amount = link ? `${formatUsdAmount(link.amountUsd)} USD` : "";
  const photo = link?.imageUrl ? absoluteAssetUrl(link.imageUrl) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          background: "#14352c",
          color: "#fffdf8",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            width: photo ? "560px" : "0px",
            height: "630px",
            display: "flex",
            overflow: "hidden",
          }}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" width={560} height={630} style={{ objectFit: "cover" }} />
          ) : null}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "56px",
            background: "linear-gradient(160deg,#14352c 0%,#1e4a3a 100%)",
          }}
        >
          <div style={{ fontSize: 22, letterSpacing: 6, color: "#e0c184", textTransform: "uppercase" }}>
            {hotel.name}
          </div>
          <div style={{ marginTop: 24, fontSize: 48, lineHeight: 1.15 }}>{title}</div>
          <div style={{ marginTop: 28, fontSize: 56, color: "#c5a059" }}>{amount}</div>
          <div style={{ marginTop: 18, fontSize: 22, color: "#d7c49d" }}>Secure payment request</div>
        </div>
      </div>
    ),
    size
  );
}
