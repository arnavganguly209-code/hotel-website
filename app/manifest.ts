import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";
import { brandAsset } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} & Spa`,
    short_name: "Thamel Park",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#FAF6EE",
    theme_color: "#0F2420",
    orientation: "portrait-primary",
    scope: "/",
    id: "/",
    icons: [
      {
        src: brandAsset("/icons/icon-192.png"),
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: brandAsset("/icons/icon-512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: brandAsset("/icons/maskable-512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: brandAsset("/icons/monochrome-512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "monochrome",
      },
    ],
    categories: ["travel", "lifestyle"],
    lang: "en",
  };
}
