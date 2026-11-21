import { useEffect, useRef, useState } from "react";
import report from "../data/lighthouse.json";
import { fmt, observeVitals, rate } from "../lib/vitals";
import "../styles/lighthouse.css";

const CATS = [
  ["performance", "Performance"],
  ["accessibility", "Accessibility"],
  ["bestPractices", "Best practices"],
  ["seo", "SEO"],
];
const VITALS = [
  ["ttfb", "TTFB", "Time to first byte"],
  ["fcp", "FCP", "First contentful paint"],
  ["lcp", "LCP", "Largest contentful paint"],
  ["cls", "CLS", "Cumulative layout shift"],
  ["inp", "INP", "Slowest interaction so far"],
];

// Lighthouse's own colour bands.
const band = (s) => (s >= 90 ? "good" : s >= 50 ? "meh" : "poor");

function Gauge({ score, label, size = 44 }) {
  const r = size / 2 - 3;
  const c = 2 * Math.PI * r;
  return (
    <div className={`lh-gauge ${band(score)}`} style={{ "--size": `${size}px` }}>
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} className="lh-track" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="lh-arc"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <b>{score}</b>
      {label && <span>{label}</span>}
    </div>
  );
}

export default function LighthouseBadge() {
  const [open, setOpen] = useState(false);
  const [device, setDevice] = useState("mobile");
  const [vitals, setVitals] = useState({});
  const wrapRef = useRef(null);
  const run = report[device];
  const measured = new Date(report.measuredAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  useEffect(() => observeVitals(setVitals), []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !wrapRef.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const s = report.mobile.scores;
  return (
    <span className="lh" ref={wrapRef}>
      <button
        className="lh-badge"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="lh-pop"
        data-cursor="Details"
        title="Lighthouse scores for this site"
      >
        <span className="lh-bolt" aria-hidden="true">⚡</span>
        Lighthouse
        {CATS.map(([k, name]) => (
          <i key={k} className={band(s[k])} aria-label={`${name} ${s[k]}`}>
            {s[k]}
          </i>
        ))}
      </button>

      <div id="lh-pop" className={`lh-pop ${open ? "is-open" : ""}`} role="dialog" aria-label="Performance report" hidden={!open}>
        <div className="lh-pop-head">
          <div>
            <strong>Lighthouse {report.lighthouseVersion}</strong>
            <small>live site · median of {run.runs?.length || 1} runs · {measured}</small>
          </div>
          <div className="lh-toggle" role="tablist" aria-label="Device">
            {["mobile", "desktop"].map((d) => (
              <button key={d} role="tab" aria-selected={device === d} className={device === d ? "on" : ""} onClick={() => setDevice(d)}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="lh-gauges">
          {CATS.map(([k, name]) => (
            <Gauge key={k} score={run.scores[k]} label={name} />
          ))}
        </div>
        <p className="lh-lab">
          Lab: FCP {fmt("fcp", run.metrics.fcp)} · LCP {fmt("lcp", run.metrics.lcp)} · TBT {fmt("tbt", run.metrics.tbt)} · CLS{" "}
          {fmt("cls", run.metrics.cls)}
        </p>

        <div className="lh-field">
          <span className="lh-field-title">
            <i className="pulse-dot" /> Your visit, measured live in this browser
          </span>
          <ul>
            {VITALS.map(([k, short, long]) => (
              <li key={k} className={rate(k, vitals[k])} title={long}>
                <span>{short}</span>
                <b>{fmt(k, vitals[k])}</b>
              </li>
            ))}
          </ul>
          <small>Real numbers from your device and network — not a lab. Interact with the page to see INP.</small>
        </div>
      </div>
    </span>
  );
}
