/**
 * Live idea board.
 *
 * public/progress.json is the single source of truth. It's bundled as the
 * fallback (so the board renders instantly and offline), then re-fetched at
 * runtime with `no-cache` so a deploy that only touches the JSON shows up for
 * visitors without a code change — and again whenever the tab regains focus.
 */
import { useEffect, useState } from "react";
import bundled from "../../public/progress.json";

const URL_ = `${import.meta.env.BASE_URL}progress.json`;

const valid = (d) => d && Array.isArray(d.ideas) && d.ideas.every((i) => i.name && Number.isFinite(i.progress));

export function useLiveIdeas() {
  const [state, setState] = useState({ data: bundled, source: "bundled", syncedAt: null });

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(URL_, { cache: "no-cache" });
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        if (!valid(data)) throw new Error("bad shape");
        if (alive) setState({ data, source: "live", syncedAt: Date.now() });
      } catch {
        if (alive) setState((s) => ({ ...s, source: s.source === "live" ? "live" : "bundled" }));
      }
    };
    load();
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return state;
}

const rtf = typeof Intl !== "undefined" ? new Intl.RelativeTimeFormat("en", { numeric: "auto" }) : null;
const UNITS = [
  ["year", 31536e6],
  ["month", 2592e6],
  ["week", 6048e5],
  ["day", 864e5],
  ["hour", 36e5],
  ["minute", 6e4],
];

/** "3 hours ago", "yesterday", "just now". */
export function timeAgo(iso, now = Date.now()) {
  const t = new Date(iso).getTime();
  if (!rtf || !Number.isFinite(t)) return "";
  const diff = Math.min(0, t - now); // clamp clock skew: never "in 3 hours"
  for (const [unit, ms] of UNITS) if (Math.abs(diff) >= ms) return rtf.format(Math.round(diff / ms), unit);
  return "just now";
}

/** Change since the earliest point in history, and when that was. */
export function deltaOf(idea) {
  const h = idea.history || [];
  if (h.length < 2) return null;
  return { value: idea.progress - h[0][1], since: h[0][0] };
}
