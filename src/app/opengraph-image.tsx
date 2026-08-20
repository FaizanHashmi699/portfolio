import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";
import { brand } from "@/config/brand";

export const alt = `${brand.name} — UAE visas and business setup, priced honestly`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    eyebrow: "UAE visas & business setup",
    title: "Know before you owe.",
    meta: "Free eligibility check",
  });
}
