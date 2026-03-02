"use client";

import { useEffect, useRef } from "react";

// Official Romanian heraldic colours
const BLUE: [number, number, number] = [0, 43, 127];
const YELLOW: [number, number, number] = [252, 209, 22];
const RED: [number, number, number] = [206, 17, 38];

// Logical canvas dimensions (CSS controls display size)
const LW = 300;
const LH = 200;

// Margins inside the canvas so wave peaks don't clip
const MX = 12;
const MY = 28;
const FW = LW - MX * 2; // 276 — flag body width
const FH = LH - MY * 2; // 144 — flag body height

// Mesh resolution — each vertical strip is ~5.75 px wide
const COLS = 48;

// Wave timing
const SPD = 0.0025; // rad / ms

/** Compound sine wave at normalised horizontal position u in [0, 1]. */
function wave(u: number, t: number): number {
  return (
    Math.sin(u * 4 * Math.PI - t * SPD) * 10 + // primary billow
    Math.sin(u * 7 * Math.PI - t * SPD * 1.35 + 0.8) * 3 + // secondary ripple
    Math.sin(u * 2.5 * Math.PI - t * SPD * 0.65 + 2.3) * 1.5 // tertiary texture
  );
}

/** Stripe colour for horizontal position u in [0, 1]. */
function stripe(u: number): [number, number, number] {
  return u < 1 / 3 ? BLUE : u < 2 / 3 ? YELLOW : RED;
}

const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)));

export function RomanianFlag({
  className,
  label = "Drapelul României",
}: {
  className?: string;
  label?: string;
}) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const el = cvs.current;
    if (!el) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = devicePixelRatio || 1;
    const pw = Math.round(LW * dpr);
    const ph = Math.round(LH * dpr);
    el.width = pw;
    el.height = ph;

    const ctx = el.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Scale once — every coordinate below is multiplied by s.
    const s = dpr;
    const ox = MX * s;
    const fw = FW * s;
    const fh = FH * s;
    const cy = (LH / 2) * s; // vertical centre

    /** Compute envelope + wave + height-scale for column at u. */
    function col(u: number, t: number) {
      const e = u ** 1.5; // wave grows from pole to free edge
      const dy = wave(u, t) * e * s;
      const hs = 1 + Math.sin(u * 4 * Math.PI - t * SPD + 1.57) * 0.015 * e;
      return { dy, hs };
    }

    const render = (t: number) => {
      ctx.clearRect(0, 0, pw, ph);

      // ── Flag mesh strips ──────────────────────────────────
      for (let i = 0; i < COLS; i++) {
        const u0 = i / COLS;
        const u1 = (i + 1) / COLS;

        const c0 = col(u0, t);
        const c1 = col(u1, t);

        // Four corners of the strip (+0.5 overlap avoids sub-pixel seams)
        const x0 = ox + u0 * fw;
        const x1 = ox + u1 * fw + 0.5;
        const t0 = cy - (fh / 2) * c0.hs + c0.dy;
        const b0 = cy + (fh / 2) * c0.hs + c0.dy;
        const t1 = cy - (fh / 2) * c1.hs + c1.dy;
        const b1 = cy + (fh / 2) * c1.hs + c1.dy;

        // Stripe colour + fold shading from wave slope
        const [br, bg, bb] = stripe((u0 + u1) / 2);
        const shade = ((c1.dy - c0.dy) / ((u1 - u0) * fw || 1)) * 55;

        ctx.beginPath();
        ctx.moveTo(x0, t0);
        ctx.lineTo(x1, t1);
        ctx.lineTo(x1, b1);
        ctx.lineTo(x0, b0);
        ctx.closePath();
        ctx.fillStyle = `rgb(${clamp(br + shade)},${clamp(bg + shade)},${clamp(bb + shade)})`;
        ctx.fill();
      }

      // ── Top-edge highlight (fabric catching light) ────────
      ctx.beginPath();
      for (let i = 0; i <= COLS; i++) {
        const u = i / COLS;
        const { dy, hs } = col(u, t);
        const x = ox + u * fw;
        const y = cy - (fh / 2) * hs + dy;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.lineWidth = 0.8 * s;
      ctx.stroke();

      // ── Bottom-edge shadow ────────────────────────────────
      ctx.beginPath();
      for (let i = 0; i <= COLS; i++) {
        const u = i / COLS;
        const { dy, hs } = col(u, t);
        const x = ox + u * fw;
        const y = cy + (fh / 2) * hs + dy;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(0,0,0,0.10)";
      ctx.lineWidth = 1 * s;
      ctx.stroke();
    };

    if (reduced) {
      render(0);
      return;
    }

    const loop = (t: number) => {
      render(t);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <div className={`relative ${className ?? ""}`} role="img" aria-label={label}>
      <canvas
        ref={cvs}
        className="block w-full h-full"
        style={{ filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.15))" }}
        tabIndex={-1}
      />
    </div>
  );
}
