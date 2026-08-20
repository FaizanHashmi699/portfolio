import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon. iOS does not respect SVG favicons, and it composites the icon onto a
 * white background unless the artwork fills the frame — so this one is drawn with its own
 * dark ground rather than relying on transparency.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0f1a",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32" fill="none">
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
      </div>
    ),
    size,
  );
}
