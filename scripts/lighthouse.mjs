#!/usr/bin/env node
/**
 * Audit the live site with Lighthouse (mobile + desktop) and write the scores
 * the footer badge displays to src/data/lighthouse.json.
 *
 *   npm run lighthouse                 # audits the production URL
 *   npm run lighthouse -- <url>        # audits another URL (e.g. a preview)
 *
 * Each preset runs RUNS times and keeps the run with the median performance
 * score (Lighthouse's own guidance — single runs vary by ±10 points).
 * Needs Chrome installed locally. Scores are only ever what Lighthouse
 * measured — never edited by hand.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const URL_ = process.argv[2] || "https://xdominator365.github.io/myportfolio/";
const OUT = fileURLToPath(new URL("../src/data/lighthouse.json", import.meta.url));
const LH = "lighthouse@12.2.1";
const RUNS = Number(process.env.LH_RUNS || 3);

function audit(preset) {
  const runs = Array.from({ length: RUNS }, (_, i) => {
    console.log(`→ ${preset} audit ${i + 1}/${RUNS} of ${URL_} …`);
    return auditOnce(preset);
  });
  runs.sort((a, b) => a.scores.performance - b.scores.performance);
  const median = runs[Math.floor(runs.length / 2)];
  median.runs = runs.map((r) => r.scores.performance);
  return median;
}

function auditOnce(preset) {
  const args = ["-y", LH, URL_, "--quiet", "--output=json", "--output-path=stdout", "--chrome-flags=--headless=new"];
  if (preset === "desktop") args.push("--preset=desktop");
  const r = JSON.parse(execFileSync("npx", args, { maxBuffer: 64 * 1024 * 1024, encoding: "utf8" }));
  const score = (id) => Math.round(r.categories[id].score * 100);
  const num = (id) => Math.round(r.audits[id].numericValue * (id === "cumulative-layout-shift" ? 1000 : 1)) / (id === "cumulative-layout-shift" ? 1000 : 1);
  return {
    scores: {
      performance: score("performance"),
      accessibility: score("accessibility"),
      bestPractices: score("best-practices"),
      seo: score("seo"),
    },
    metrics: {
      fcp: num("first-contentful-paint"),
      lcp: num("largest-contentful-paint"),
      tbt: num("total-blocking-time"),
      cls: num("cumulative-layout-shift"),
      si: num("speed-index"),
    },
    lighthouseVersion: r.lighthouseVersion,
  };
}

const mobile = audit("mobile");
const desktop = audit("desktop");
const data = { url: URL_, measuredAt: new Date().toISOString(), lighthouseVersion: mobile.lighthouseVersion, mobile, desktop };
delete data.mobile.lighthouseVersion;
delete data.desktop.lighthouseVersion;
writeFileSync(OUT, JSON.stringify(data, null, 2) + "\n");

const row = (n, s) => `${n.padEnd(8)} perf ${s.performance}  a11y ${s.accessibility}  bp ${s.bestPractices}  seo ${s.seo}`;
console.log(`✔ wrote src/data/lighthouse.json\n  ${row("mobile", mobile.scores)}\n  ${row("desktop", desktop.scores)}`);
