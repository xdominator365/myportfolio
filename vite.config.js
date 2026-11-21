import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const commit = (() => {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "dev";
  }
})();

/**
 * Emits dist/chat-context.json — the portfolio facts the Claude chat proxy
 * uses as its system prompt — generated from src/data/content.js via
 * src/lib/knowledge.js, so the AI can never contradict the site.
 */
const chatContext = () => ({
  name: "chat-context",
  apply: "build",
  async closeBundle() {
    const { createServer } = await import("vite");
    const server = await createServer({ configFile: false, logLevel: "silent", server: { middlewareMode: true }, appType: "custom" });
    try {
      const { buildKnowledge } = await server.ssrLoadModule("/src/lib/knowledge.js");
      const facts = buildKnowledge();
      writeFileSync("dist/chat-context.json", JSON.stringify({ generatedAt: new Date().toISOString(), facts }));
      console.log(`✔ chat-context.json: ${facts.length} facts`);
    } finally {
      await server.close();
    }
  },
});

export default defineConfig({
  plugins: [react(), chatContext()],
  base: "/myportfolio/",
  define: {
    __COMMIT__: JSON.stringify(commit),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
});
