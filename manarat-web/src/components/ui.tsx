import Link from "next/link";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ layout */

/** One container width and one gutter, used by every section on the site. */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-6 sm:px-8 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}

/**
 * A page section.
 *
 * `tone` is the only way a section gets a background, so the page alternates
 * predictably instead of every block inventing its own treatment.
 */
export function Section({
  children,
  tone = "ground",
  className = "",
  id,
}: {
  children: ReactNode;
  tone?: "ground" | "surface" | "navy" | "wash";
  className?: string;
  id?: string;
}) {
  const tones = {
    ground: "bg-ground text-ink",
    surface: "bg-surface text-ink",
    wash: "bg-surface-2 text-ink",
    navy: "bg-navy-950 text-white",
  } as const;

  return (
    <section
      id={id}
      className={`relative py-16 sm:py-20 lg:py-24 ${tones[tone]} ${className}`}
    >
      {children}
    </section>
  );
}

/** Eyebrow → heading → lede, with one rhythm everywhere. */
export function SectionHead({
  eyebrow,
  title,
  lede,
  align = "left",
  onNavy = false,
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: string;
  align?: "left" | "center";
  onNavy?: boolean;
  action?: ReactNode;
}) {
  const centered = align === "center";
  return (
    <div
      className={`flex flex-wrap items-end gap-6 ${
        centered ? "flex-col text-center" : ""
      }`}
    >
      <div className={centered ? "mx-auto max-w-2xl" : "max-w-2xl"}>
        <p
          className={`text-[0.7rem] font-bold uppercase tracking-[0.18em] ${
            onNavy ? "text-blue-300" : "text-brand"
          }`}
        >
          {eyebrow}
        </p>
        <h2
          className={`mt-3 font-display text-[clamp(1.75rem,3.6vw,2.6rem)] font-extrabold leading-[1.12] ${
            onNavy ? "text-white" : "text-navy-900"
          }`}
        >
          {title}
        </h2>
        {lede && (
          <p
            className={`mt-4 text-[1.02rem] leading-[1.7] ${
              onNavy ? "text-white/70" : "text-ink-soft"
            }`}
          >
            {lede}
          </p>
        )}
      </div>
      {action && <div className={centered ? "" : "ml-auto pb-1"}>{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ buttons */

const BTN_BASE =
  "inline-flex items-center justify-center gap-2.5 rounded-chip font-bold transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand";

const BTN_SIZE = {
  md: "px-6 py-3 text-[0.9rem]",
  lg: "px-7 py-3.5 text-[0.95rem]",
} as const;

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "white" | "ghost-white";
  size?: "md" | "lg";
  className?: string;
}) {
  const variants = {
    primary:
      "bg-brand text-white shadow-brand hover:-translate-y-0.5 hover:bg-blue-700",
    outline:
      "border border-rule bg-surface text-navy-900 hover:-translate-y-0.5 hover:border-brand hover:shadow-md",
    white: "bg-white text-navy-950 hover:-translate-y-0.5 hover:shadow-lg",
    "ghost-white":
      "border border-white/30 text-white backdrop-blur-sm hover:border-white hover:bg-white/10",
  } as const;

  return (
    <Link href={href} className={`${BTN_BASE} ${BTN_SIZE[size]} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className="h-3.5 w-3.5 fill-none stroke-current stroke-[2]"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8h9M8.5 4.2 12.3 8l-3.8 3.8" />
    </svg>
  );
}

/* ------------------------------------------------------------------ surface */

/** One card treatment. Everything that is a card uses this. */
export function Card({
  children,
  className = "",
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={`rounded-card border border-rule bg-surface shadow-sm ${
        interactive
          ? "transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------- pattern */

/**
 * The khatim tile — the eight-pointed star that underpins Islamic geometric
 * ornament. Drawn, not fetched, so it costs nothing and scales cleanly.
 */
export function KhatimPattern({
  className = "",
  opacity = 0.06,
  size = 64,
  id = "khatim",
}: {
  className?: string;
  opacity?: number;
  size?: number;
  id?: string;
}) {
  const c = size / 2;
  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ opacity }}
    >
      <defs>
        <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path
              d={`M${c} ${size * 0.08} ${c + size * 0.13} ${c - size * 0.09} ${size * 0.92} ${c} ${c + size * 0.13} ${c + size * 0.09} ${c} ${size * 0.92} ${c - size * 0.13} ${c + size * 0.09} ${size * 0.08} ${c} ${c - size * 0.13} ${c - size * 0.09}Z`}
            />
            <rect
              x={size * 0.25}
              y={size * 0.25}
              width={size * 0.5}
              height={size * 0.5}
              transform={`rotate(45 ${c} ${c})`}
            />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/**
 * A generated visual, for use where a photograph will eventually go.
 *
 * Renders `src` when one is supplied. Otherwise it draws a real Islamic
 * geometric composition — a khatim star inside its generating circles, the
 * construction every girih pattern starts from — so the slot reads as
 * deliberate artwork rather than an empty box. Dropping in a photograph is a
 * one-prop change.
 */
export function Figure({
  src,
  alt,
  aspect = "4/3",
  seed = 0,
  className = "",
}: {
  src?: string | null;
  alt: string;
  aspect?: string;
  seed?: number;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`w-full rounded-card border border-rule object-cover ${className}`}
        style={{ aspectRatio: aspect }}
        loading="lazy"
      />
    );
  }

  const angle = 118 + seed * 24;
  const rotate = seed * 15;
  const uid = `fg${seed}`;

  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative overflow-hidden rounded-card border border-rule ${className}`}
      style={{
        aspectRatio: aspect,
        background: `linear-gradient(${angle}deg, #062b55 0%, #123a6b 50%, #1a4b85 100%)`,
      }}
    >
      <span className="absolute inset-0 text-blue-300">
        <KhatimPattern id={`tile-${uid}`} opacity={0.16} size={46} />
      </span>

      <svg
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <radialGradient id={`glow-${uid}`} cx="50%" cy="42%" r="58%">
            <stop offset="0%" stopColor="#8fd0f7" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#8fd0f7" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`star-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8fd0f7" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#1591dc" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        <rect width="200" height="200" fill={`url(#glow-${uid})`} />

        <g transform={`rotate(${rotate} 100 100)`} fill="none" stroke="#8fd0f7">
          <circle cx="100" cy="100" r="66" strokeOpacity="0.22" />
          <circle cx="100" cy="100" r="48" strokeOpacity="0.16" />
          <rect x="52" y="52" width="96" height="96" strokeOpacity="0.2" />
          <rect x="52" y="52" width="96" height="96" strokeOpacity="0.2" transform="rotate(45 100 100)" />
        </g>

        <g transform={`rotate(${rotate} 100 100)`}>
          <path
            d="M100.0 32.0 L110.9 73.7 L148.1 51.9 L126.3 89.1 L168.0 100.0 L126.3 110.9 L148.1 148.1 L110.9 126.3 L100.0 168.0 L89.1 126.3 L51.9 148.1 L73.7 110.9 L32.0 100.0 L73.7 89.1 L51.9 51.9 L89.1 73.7Z"
            fill={`url(#star-${uid})`}
            fillOpacity="0.28"
            stroke="#8fd0f7"
            strokeOpacity="0.6"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <circle cx="100" cy="100" r="9" fill="#8fd0f7" fillOpacity="0.5" />
        </g>
      </svg>

      <span className="absolute inset-x-0 bottom-0 flex items-end p-4">
        <span className="rounded-chip bg-navy-950/55 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-blue-300 backdrop-blur-sm">
          {alt}
        </span>
      </span>
    </div>
  );
}

/** Shared masthead for interior pages. */
export function PageMasthead({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-950 pb-32 pt-16 text-white sm:pt-20">
      <span aria-hidden className="absolute inset-0 text-blue-300">
        <KhatimPattern id={`mast-${eyebrow.replace(/\W/g, "")}`} opacity={0.06} size={72} />
      </span>
      <span
        aria-hidden
        className="absolute -right-40 -top-32 h-[500px] w-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(21,145,220,.3), transparent 68%)" }}
      />
      <Container className="relative">
        <div className="max-w-2xl">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-blue-300">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-[1.05]">
            {title}
          </h1>
          {lede && (
            <p className="mt-5 text-[1.05rem] leading-[1.7] text-white/72">{lede}</p>
          )}
        </div>
      </Container>
    </section>
  );
}
