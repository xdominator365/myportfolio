import { useEffect, useState } from "react";
import { prefersReducedMotion } from "../hooks";

const LINES = [
  "$ ssh harshit@portfolio",
  "→ resolving dependencies ........ ok",
  "→ warming up lambdas ............ ok",
  "→ acquiring dynamodb locks ...... ok",
  "→ compiling shaders ............. ok",
  "✔ ready. welcome.",
];

/** Terminal boot sequence + percentage, then a split-curtain reveal. */
export default function Preloader({ onDone }) {
  const [pct, setPct] = useState(0);
  const [lines, setLines] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setGone(true);
      onDone();
      return;
    }
    document.body.style.overflow = "hidden";
    const DURATION = 1900;
    const t0 = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / DURATION);
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      setPct(Math.round(eased * 100));
      setLines(Math.min(LINES.length, Math.floor(p * (LINES.length + 0.6))));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setTimeout(() => {
          setLeaving(true);
          onDone();
          document.body.style.overflow = "";
        }, 250);
        setTimeout(() => setGone(true), 1300);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, [onDone]);

  if (gone) return null;

  return (
    <div className={`preloader ${leaving ? "is-leaving" : ""}`} role="status" aria-label="Loading">
      <div className="preloader-curtain top" />
      <div className="preloader-curtain bottom" />
      <div className="preloader-inner">
        <div className="preloader-term">
          {LINES.slice(0, lines).map((l, i) => (
            <div key={i} className={`pl-line ${l.startsWith("✔") ? "ok" : ""}`}>
              {l}
            </div>
          ))}
          <span className="caret" />
        </div>
        <div className="preloader-count">
          <span className="grad-text">{String(pct).padStart(3, "0")}</span>
          <small>%</small>
        </div>
        <div className="preloader-bar">
          <span style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
      </div>
    </div>
  );
}
