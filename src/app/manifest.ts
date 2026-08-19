import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";

/**
 * PWA manifest. The customer portal is the "app" half of this product, and our users are
 * overwhelmingly on phones — making it installable costs nothing and removes the browser
 * chrome from a workflow people return to repeatedly while an application is in progress.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${brand.name} — UAE Visas & Business Setup`,
    short_name: brand.name,
    description: brand.description,
    start_url: "/portal",
    display: "standalone",
    background_color: "#0a0f1a",
    theme_color: "#0a0f1a",
    orientation: "portrait-primary",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
