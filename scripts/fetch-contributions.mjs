#!/usr/bin/env node
/**
 * Build-time GitHub contribution fetch → src/data/contributions.json
 *
 * Runs before every build (npm "prebuild"). Tries, in order:
 *   1. GraphQL API     — when GITHUB_TOKEN / GH_TOKEN is set (CI has one)
 *   2. Public calendar — github.com/users/<login>/contributions (no token)
 *   3. Nothing         — the component falls back to the committed snapshot
 * It never fails the build, and no token ever reaches the browser.
 *
 *   node scripts/fetch-contributions.mjs [--snapshot]   # --snapshot also refreshes the committed fallback
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const LOGIN = "xdominator365";
const OUT = fileURLToPath(new URL("../src/data/contributions.json", import.meta.url));
const SNAPSHOT = fileURLToPath(new URL("../src/data/contributions.snapshot.json", import.meta.url));
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

async function viaGraphQL() {
  const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json", "User-Agent": "portfolio-build" },
    body: JSON.stringify({ query, variables: { login: LOGIN } }),
  });
  const json = await res.json();
  const weeks = json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
  if (!weeks) throw new Error(json?.errors?.[0]?.message || `HTTP ${res.status}`);
  return weeks.flatMap((w) => w.contributionDays.map((d) => [d.date, d.contributionCount]));
}

async function viaPublicCalendar() {
  const res = await fetch(`https://github.com/users/${LOGIN}/contributions`, { headers: { "User-Agent": "portfolio-build" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const dateById = new Map();
  for (const m of html.matchAll(/<td[^>]*?data-date="(\d{4}-\d{2}-\d{2})"[^>]*?id="([^"]+)"/g)) dateById.set(m[2], m[1]);
  for (const m of html.matchAll(/<td[^>]*?id="([^"]+)"[^>]*?data-date="(\d{4}-\d{2}-\d{2})"/g)) dateById.set(m[1], m[2]);
  const counts = new Map();
  for (const m of html.matchAll(/<tool-tip[^>]*?for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = /^(\d+) contribution/.exec(m[2]);
    counts.set(m[1], n ? Number(n[1]) : 0);
  }
  if (dateById.size < 300) throw new Error("calendar markup changed");
  return [...dateById].map(([id, date]) => [date, counts.get(id) ?? 0]).sort((a, b) => a[0].localeCompare(b[0]));
}

const sources = [...(token ? [["graphql", viaGraphQL]] : []), ["public-calendar", viaPublicCalendar]];
for (const [source, fn] of sources) {
  try {
    const days = await fn();
    const data = { login: LOGIN, source, fetchedAt: new Date().toISOString(), days };
    const body = JSON.stringify(data) + "\n";
    writeFileSync(OUT, body);
    if (process.argv.includes("--snapshot")) writeFileSync(SNAPSHOT, body);
    const total = days.reduce((s, d) => s + d[1], 0);
    console.log(`✔ contributions: ${total} over ${days.length} days via ${source}`);
    process.exit(0);
  } catch (e) {
    console.warn(`⚠ contributions via ${source} failed: ${e.message}`);
  }
}
console.warn("⚠ contributions: using the committed snapshot");
