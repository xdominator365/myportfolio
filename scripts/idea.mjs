#!/usr/bin/env node
/**
 * Update the public idea board (public/progress.json).
 *
 *   npm run idea                                   # list ideas
 *   npm run idea -- mydhira 74                     # set progress
 *   npm run idea -- mydhira 80 --stage Beta        # …and stage
 *   npm run idea -- stealth 10 --note "Fintech, ask me"
 *
 * Every change stamps `updatedAt` and appends to `history` (one point per day),
 * which powers the "updated 3h ago", delta badge and sparkline on the site.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const FILE = fileURLToPath(new URL("../public/progress.json", import.meta.url));
const data = JSON.parse(readFileSync(FILE, "utf8"));
const [id, value, ...rest] = process.argv.slice(2);

if (!id) {
  for (const i of data.ideas) {
    const bar = "█".repeat(Math.round(i.progress / 5)).padEnd(20, "░");
    console.log(`${i.id.padEnd(18)} ${bar} ${String(i.progress).padStart(3)}%  ${i.stage}`);
  }
  process.exit(0);
}

const idea = data.ideas.find((i) => i.id === id);
if (!idea) {
  console.error(`Unknown idea "${id}". Known: ${data.ideas.map((i) => i.id).join(", ")}`);
  process.exit(1);
}

const progress = Number(value);
if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
  console.error("Progress must be a number from 0 to 100.");
  process.exit(1);
}

const flag = (name) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : undefined;
};

const now = new Date();
const today = now.toISOString().slice(0, 10);
const before = idea.progress;
idea.progress = progress;
idea.stage = flag("stage") ?? idea.stage;
idea.note = flag("note") ?? idea.note;
idea.updatedAt = now.toISOString();
idea.history = (idea.history || []).filter(([d]) => d !== today).concat([[today, progress]]).slice(-30);
data.updatedAt = idea.updatedAt;

writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n");
const d = progress - before;
console.log(`✔ ${idea.name}: ${before}% → ${progress}% (${d >= 0 ? "+" : ""}${d}) · ${idea.stage}`);
console.log("  Commit public/progress.json and push to main to publish.");
