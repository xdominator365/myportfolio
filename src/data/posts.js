// Posts are plain Markdown files in ./posts — add one and it shows up. Newest first.
import { parseFrontMatter, readingTime, renderMarkdown } from "../lib/markdown";

const files = import.meta.glob("./posts/*.md", { eager: true, query: "?raw", import: "default" });

export const posts = Object.entries(files)
  .map(([path, src]) => {
    const { meta, body } = parseFrontMatter(src);
    const slug = path.split("/").pop().replace(/\.md$/, "");
    // First paragraph as plain text — used as the pull-quote on the featured card.
    const lede = body.split(/\n\s*\n/).find((b) => b.trim() && !/^(#|```|>|-|\d+\.)/.test(b.trim()))?.replace(/[*_`]/g, "").trim();
    return { slug, ...meta, lede, tags: meta.tags || [], ...renderMarkdown(body), reading: readingTime(body) };
  })
  .filter((p) => p.draft !== "true")
  .sort((a, b) => String(b.date).localeCompare(String(a.date)));
