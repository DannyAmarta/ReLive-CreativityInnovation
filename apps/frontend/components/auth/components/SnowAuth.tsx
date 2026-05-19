import { memo } from "react";

type SnowflakeProps = {
  size?: number;
  opacity?: number;
  style?: React.CSSProperties;
};
/* ─────────────────────────────────────────────────────────────────
   GROUND SCENE — pine trees, snow drifts, crystals, stars
───────────────────────────────────────────────────────────────── */
export const GroundScene = memo(() => (
    <div
        aria-hidden
        style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "55%",
            pointerEvents: "none",
            zIndex: 20,
            overflow: "hidden",
        }}
    >
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 800 460"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* ── Snow drift — back layer ── */}
            <path
                d="M0,295 Q70,240 150,258 Q230,275 310,245 Q390,215 470,250 Q550,280 630,255 Q710,228 800,265 L800,460 L0,460 Z"
                fill="url(#drift1)"
                opacity="0.88"
            />
            {/* Snow drift — front layer ── */}
            <path
                d="M0,330 Q55,298 120,312 Q195,328 270,300 Q350,270 430,305 Q510,335 590,308 Q665,280 740,310 Q775,325 800,318 L800,460 L0,460 Z"
                fill="url(#drift2)"
                opacity="0.94"
            />
            {/* Highlight streak on front drift */}
            <path
                d="M0,328 Q55,296 120,310 Q195,326 270,298 Q350,268 430,303 Q510,333 590,306 Q665,278 740,308 Q775,323 800,316"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="2.8"
                fill="none"
                strokeLinecap="round"
            />

            {/* ── Sparkle dots ── */}
            {[
                [100, 310],
                [195, 293],
                [320, 272],
                [445, 284],
                [535, 289],
                [665, 286],
                [745, 300],
                [65, 348],
                [380, 316],
                [590, 328],
                [250, 325],
                [480, 322],
            ].map(([cx, cy], i) => (
                <circle
                    key={`sp-${i}`}
                    cx={cx}
                    cy={cy}
                    r="2.4"
                    fill="white"
                    opacity="0.25"
                >
                    <animate
                        attributeName="opacity"
                        values={`0.12;${0.65 + (i % 4) * 0.18};0.12`}
                        dur={`${1.6 + i * 0.3}s`}
                        repeatCount="indefinite"
                    />
                </circle>
            ))}

            {/* ── Stars in upper sky ── */}
            {Array.from({ length: 10 }, (_, i) => {
                const sx = (i * 131) % 800;
                const sy = (i * 67) % 200;
                const r = 0.7 + (i % 4) * 0.45;
                return (
                    <circle
                        key={`st-${i}`}
                        cx={sx}
                        cy={sy}
                        r={r}
                        fill="white"
                        opacity="0.18"
                    >
                        <animate
                            attributeName="opacity"
                            values={`0.07;${0.55 + (i % 5) * 0.2};0.07`}
                            dur={`${2.2 + i * 0.25}s`}
                            repeatCount="indefinite"
                        />
                    </circle>
                );
            })}

            <defs>
                <linearGradient id="drift1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4e5ff" stopOpacity="0.82" />
                    <stop offset="50%" stopColor="#b8d0ff" stopOpacity="0.9" />
                    <stop
                        offset="100%"
                        stopColor="#7aa4cc"
                        stopOpacity="0.95"
                    />
                </linearGradient>
                <linearGradient id="drift2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#eaf3ff" stopOpacity="0.92" />
                    <stop offset="55%" stopColor="#c8deff" stopOpacity="0.94" />
                    <stop
                        offset="100%"
                        stopColor="#90b8e0"
                        stopOpacity="0.96"
                    />
                </linearGradient>
                <linearGradient id="crystalG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e8f4ff" />
                    <stop
                        offset="100%"
                        stopColor="#7ba7ff"
                        stopOpacity="0.65"
                    />
                </linearGradient>
            </defs>
        </svg>
    </div>
));

/* ─────────────────────────────────────────────────────────────────
   STAR FIELD
───────────────────────────────────────────────────────────────── */
export const StarField = memo(() => (
    <div
        aria-hidden
        style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
        }}
    >
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 800 900"
            preserveAspectRatio="xMidYMid slice"
        >
            {Array.from({ length: 10 }, (_, i) => {
                const sx = (i * 137.5) % 800;
                const sy = (i * 73.1) % 550;
                const r = 0.7 + (i % 4) * 0.5;
                const dur = 2.2 + (i % 5) * 0.7;
                const del = (i * 0.18) % 3;
                return (
                    <circle
                        key={i}
                        cx={sx}
                        cy={sy}
                        r={r}
                        fill="white"
                        opacity="0.15"
                    >
                        <animate
                            attributeName="opacity"
                            values={`0.05;${0.45 + (i % 4) * 0.18};0.05`}
                            dur={`${dur}s`}
                            begin={`${del}s`}
                            repeatCount="indefinite"
                        />
                    </circle>
                );
            })}
        </svg>
    </div>
));

/* ─────────────────────────────────────────────────────────────────
   AURORA BLOBS
───────────────────────────────────────────────────────────────── */
export const AuroraLayer = memo(() => (
    <div
        aria-hidden
        style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            overflow: "hidden",
        }}
    >
        <div
            style={{
                position: "absolute",
                width: "72%",
                height: "48%",
                top: "15%",
                left: "6%",
                background:
                    "radial-gradient(ellipse, rgba(99,155,255,0.22) 0%, transparent 70%)",
                animation: "aurora 10s ease-in-out infinite",
            }}
        />
        <div
            style={{
                position: "absolute",
                width: "58%",
                height: "40%",
                top: "28%",
                right: "2%",
                background:
                    "radial-gradient(ellipse, rgba(167,139,250,0.17) 0%, transparent 70%)",
                animation: "aurora 14s ease-in-out infinite reverse",
            }}
        />
        <div
            style={{
                position: "absolute",
                width: "48%",
                height: "28%",
                top: "4%",
                left: "28%",
                background:
                    "radial-gradient(ellipse, rgba(56,189,248,0.09) 0%, transparent 70%)",
                animation: "aurora 18s ease-in-out infinite 3s",
            }}
        />
    </div>
));

/* ─────────────────────────────────────────────────────────────────
   DECORATIVE SVG SNOWFLAKE
───────────────────────────────────────────────────────────────── */

export const SnowflakeSVG = memo(
  ({ size = 40, opacity = 0.18, style = {} }: SnowflakeProps) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden
        style={{
          opacity,
          pointerEvents: "none",
          display: "block",
          ...style,
        }}
      >
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <g key={i} transform={`rotate(${angle}, 20, 20)`}>
            <line x1="20" y1="2" x2="20" y2="38" stroke="white" strokeWidth={1.8} strokeLinecap="round" />
            <line x1="20" y1="9" x2="15" y2="14" stroke="white" strokeWidth={1.3} strokeLinecap="round" />
            <line x1="20" y1="9" x2="25" y2="14" stroke="white" strokeWidth={1.3} strokeLinecap="round" />
            <line x1="20" y1="17" x2="14" y2="21" stroke="white" strokeWidth={1.1} strokeLinecap="round" />
            <line x1="20" y1="17" x2="26" y2="21" stroke="white" strokeWidth={1.1} strokeLinecap="round" />
          </g>
        ))}
        <circle cx="20" cy="20" r="2.5" fill="white" />
      </svg>
    );
  }
);
