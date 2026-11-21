/**
 * Living favicon.
 *
 * The tab icon doubles as a tiny reading-progress gauge: a gradient ring fills
 * as the visitor scrolls. When the tab is hidden it desaturates and shows a
 * pause glyph (the title follows suit), and when the visitor returns it gives
 * one short pulse. Rendered on a 64×64 canvas — a redraw costs well under 1 ms,
 * and we only redraw when the rounded percentage actually changes.
 *
 * Safari ignores runtime favicon swaps; it simply keeps the static SVG.
 */
import { prefersReducedMotion } from "../hooks";

const SIZE = 64;
const STOPS = ["#8b5cf6", "#ec4899", "#22d3ee"];
const GREY = ["#55536b", "#6b6985", "#55536b"];

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function startLivingFavicon() {
  if (typeof document === "undefined") return () => {};
  const link = document.querySelector('link[rel="icon"]');
  if (!link) return () => {};

  const original = { href: link.href, type: link.type, title: document.title };
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  const reduced = prefersReducedMotion();

  let pct = -1;
  let hidden = document.hidden;
  let pulseRaf = 0;
  let scrollRaf = 0;

  const readProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    return max > 0 ? Math.min(100, Math.max(0, Math.round((scrollY / max) * 100))) : 0;
  };

  const draw = (glow = 0) => {
    const colors = hidden ? GREY : STOPS;
    const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
    colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));

    ctx.clearRect(0, 0, SIZE, SIZE);
    roundRect(ctx, 0, 0, SIZE, SIZE, 16);
    ctx.fillStyle = "#07060f";
    ctx.fill();

    // Track + progress arc, starting at 12 o'clock.
    const r = 27;
    ctx.lineWidth = 4 + glow * 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.arc(32, 32, r, 0, Math.PI * 2);
    ctx.stroke();
    if (pct > 0) {
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.arc(32, 32, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * pct) / 100);
      ctx.stroke();
    }

    if (hidden) {
      // Pause bars instead of the monogram — reads instantly at 16px.
      ctx.fillStyle = grad;
      roundRect(ctx, 21, 19, 8, 26, 2.5);
      ctx.fill();
      roundRect(ctx, 35, 19, 8, 26, 2.5);
      ctx.fill();
    } else {
      ctx.fillStyle = grad;
      ctx.font = `900 ${24 + glow * 4}px "Arial Black", Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("HY", 32, 34);
    }

    link.type = "image/png";
    link.href = canvas.toDataURL("image/png");
  };

  const pulse = () => {
    cancelAnimationFrame(pulseRaf);
    if (reduced) return draw();
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / 650);
      draw(Math.sin(t * Math.PI)); // 0 → 1 → 0
      if (t < 1) pulseRaf = requestAnimationFrame(step);
    };
    pulseRaf = requestAnimationFrame(step);
  };

  const onScroll = () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      const next = readProgress();
      if (next !== pct) {
        pct = next;
        draw();
      }
    });
  };

  const onVisibility = () => {
    hidden = document.hidden;
    if (hidden) {
      original.title = document.title;
      document.title = `⏸ ${pct}% read · ${original.title}`;
      draw();
    } else {
      document.title = original.title;
      pulse();
    }
  };

  pct = readProgress();
  draw();
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    cancelAnimationFrame(pulseRaf);
    cancelAnimationFrame(scrollRaf);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVisibility);
    link.href = original.href;
    link.type = original.type;
    if (document.title.startsWith("⏸")) document.title = original.title;
  };
}
