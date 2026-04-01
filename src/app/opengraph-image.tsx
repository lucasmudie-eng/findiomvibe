// src/app/opengraph-image.tsx
// Next.js auto-discovers this file and serves it as the default OG image.
// Dimensions: 1200×630 — standard Open Graph size.

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ManxHive – Isle of Man Events, Marketplace & Community";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
          padding: "64px 72px",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Decorative red blob */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(217,4,41,0.18)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(217,4,41,0.10)",
            filter: "blur(60px)",
          }}
        />

        {/* Ghost "IoM" watermark */}
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 60,
            fontSize: 180,
            fontWeight: 900,
            color: "rgba(255,255,255,0.04)",
            lineHeight: 1,
            letterSpacing: "-4px",
          }}
        >
          IoM
        </div>

        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 32,
              height: 3,
              background: "#D90429",
              borderRadius: 2,
            }}
          />
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#D90429",
              fontFamily: "sans-serif",
            }}
          >
            Isle of Man
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 82,
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 0.9,
            letterSpacing: "-2px",
            marginBottom: 28,
          }}
        >
          ManxHive
          <span style={{ color: "#D90429" }}>.</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 26,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "sans-serif",
            fontWeight: 400,
            lineHeight: 1.4,
            maxWidth: 700,
          }}
        >
          Events · Marketplace · Deals · Sports · Community
        </div>

        {/* URL pill */}
        <div
          style={{
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 100,
            padding: "10px 22px",
          }}
        >
          <span
            style={{
              fontSize: 17,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "sans-serif",
            }}
          >
            manxhive.com
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
