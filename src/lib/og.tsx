import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";

/**
 * Open Graph image generation.
 *
 * Rendered on demand rather than designed by hand for every page: with 14 services, 48
 * nationality pages and 12 free zones, hand-made cards would be stale within a week.
 *
 * Deliberately no external font fetch. ImageResponse would have to reach the network at
 * request time, which is a failure mode on a card nobody would notice was broken — the
 * system stack renders acceptably at this size.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export function ogImage({
  eyebrow,
  title,
  meta,
}: {
  eyebrow?: string;
  title: string;
  meta?: string;
}) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background:
          "radial-gradient(120% 80% at 50% 100%, #2f4f8f 0%, #16203a 45%, #0a0f1a 100%)",
        color: "#f5f7fa",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <svg width="52" height="52" viewBox="0 0 32 32" fill="none">
          <path
            d="M6 27V15a10 10 0 0 1 20 0v12"
            stroke="#4a7fd4"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M13 27v-11a3 3 0 0 1 6 0v11"
            stroke="#e0b062"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </svg>
        <span style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-0.02em" }}>
          {brand.name}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {eyebrow && (
          <span
            style={{
              fontSize: 24,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#e0b062",
              marginBottom: 20,
            }}
          >
            {eyebrow}
          </span>
        )}
        <span
          style={{
            fontSize: title.length > 60 ? 60 : 76,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            // ImageResponse has no line clamping, so long titles are trimmed at source.
            maxWidth: 1000,
          }}
        >
          {title.length > 110 ? `${title.slice(0, 107)}…` : title}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 26,
          color: "#9aa8bd",
        }}
      >
        <span>{brand.tagline}</span>
        {meta && (
          <span
            style={{
              color: "#f5f7fa",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: 999,
              padding: "10px 24px",
            }}
          >
            {meta}
          </span>
        )}
      </div>
    </div>,
    OG_SIZE,
  );
}
