/**
 * Core Web Vitals for *this* visit, measured with the browser's own
 * PerformanceObserver — no library. `buffered: true` replays entries that
 * happened before we subscribed, so it's fine to start this late.
 *
 * INP here is the slowest interaction so far (the field metric uses a high
 * percentile across a whole session; for one visit, the worst is a fair read).
 */
export const THRESHOLDS = {
  ttfb: [800, 1800],
  fcp: [1800, 3000],
  lcp: [2500, 4000],
  cls: [0.1, 0.25],
  inp: [200, 500],
};

export const rate = (key, v) => (v == null ? "pending" : v <= THRESHOLDS[key][0] ? "good" : v <= THRESHOLDS[key][1] ? "meh" : "poor");

export function observeVitals(onChange) {
  if (typeof PerformanceObserver === "undefined") return () => {};
  const v = {};
  const emit = () => onChange({ ...v });
  const observers = [];
  const watch = (type, fn, extra = {}) => {
    try {
      const o = new PerformanceObserver((list) => {
        fn(list.getEntries());
        emit();
      });
      o.observe({ type, buffered: true, ...extra });
      observers.push(o);
    } catch {
      /* entry type unsupported in this browser — leave it pending */
    }
  };

  const nav = performance.getEntriesByType?.("navigation")?.[0];
  if (nav) v.ttfb = nav.responseStart;

  watch("paint", (es) => es.forEach((e) => e.name === "first-contentful-paint" && (v.fcp = e.startTime)));
  watch("largest-contentful-paint", (es) => (v.lcp = es[es.length - 1].startTime));
  let cls = 0;
  watch("layout-shift", (es) => {
    for (const e of es) if (!e.hadRecentInput) cls += e.value;
    v.cls = cls;
  });
  watch(
    "event",
    (es) => {
      for (const e of es) if (e.interactionId) v.inp = Math.max(v.inp || 0, e.duration);
    },
    { durationThreshold: 16 }
  );

  emit();
  return () => observers.forEach((o) => o.disconnect());
}

export const fmt = (key, v) => {
  if (v == null) return "—";
  if (key === "cls") return v.toFixed(3);
  return v >= 1000 ? `${(v / 1000).toFixed(2)} s` : `${Math.round(v)} ms`;
};
