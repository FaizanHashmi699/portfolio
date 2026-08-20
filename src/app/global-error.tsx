"use client";

/**
 * Last-resort boundary: catches failures in the root layout itself, where none of the
 * design system is available. It must render its own <html> and <body>, and it cannot
 * import anything that might be the thing that broke — hence the inline styles.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#0a0f1a",
          color: "#f5f7fa",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "32rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 600, margin: 0 }}>
            Something went badly wrong.
          </h1>
          <p style={{ marginTop: "1rem", color: "#9aa8bd", lineHeight: 1.6 }}>
            The page failed to load entirely. Nothing you had entered has been
            submitted.
          </p>
          {error.digest && (
            <p style={{ marginTop: "1rem", color: "#6c7a91", fontSize: "0.8rem" }}>
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              background: "#e0b062",
              color: "#0a0f1a",
              border: 0,
              borderRadius: "999px",
              padding: "0.75rem 2rem",
              fontSize: "0.95rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
