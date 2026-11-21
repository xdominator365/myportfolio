/**
 * A deliberately small Markdown renderer for the posts in src/data/posts.
 *
 * Supports what essays actually use: front matter, ## / ### headings,
 * paragraphs, - / 1. lists, > quotes, --- rules, fenced code (with light
 * syntax colouring), `code`, **bold**, *italic* and [links](url).
 * Everything is HTML-escaped first, so a stray < in a post can't inject markup.
 */

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function inline(s) {
  const codes = [];
  let out = esc(s).replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`);
  out = out
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
}

const KEYWORDS = {
  python: /\b(def|async|await|return|if|elif|else|for|while|in|not|and|or|try|except|finally|raise|with|as|import|from|class|None|True|False|lambda|yield|pass)\b/g,
  js: /\b(const|let|var|function|return|if|else|for|while|await|async|import|from|export|default|new|try|catch|throw|class|null|true|false|undefined)\b/g,
};

function highlight(code, lang) {
  const kw = KEYWORDS[lang === "py" ? "python" : lang === "ts" || lang === "javascript" ? "js" : lang];
  const tokens = [];
  // Placeholders use private-use code points so later passes (numbers, keywords) can't match inside them.
  const stash = (cls) => (m) => `\u0001${String.fromCharCode(0xe000 + tokens.push(`<span class="tok-${cls}">${m}</span>`) - 1)}\u0001`;
  let out = esc(code)
    .replace(/(#[^\n]*|\/\/[^\n]*)/g, stash("comment"))
    .replace(/(&quot;[^\n]*?&quot;|'[^'\n]*')/g, stash("string"))
    .replace(/\b\d+(\.\d+)?\b/g, stash("number"));
  if (kw) out = out.replace(kw, stash("keyword"));
  return out.replace(/\u0001([\ue000-\uf8ff])\u0001/g, (_, c) => tokens[c.charCodeAt(0) - 0xe000]);
}

export function parseFrontMatter(src) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(src);
  if (!m) return { meta: {}, body: src };
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (/^\[.*\]$/.test(val)) val = val.slice(1, -1).split(",").map((t) => t.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    else val = val.replace(/^["']|["']$/g, "");
    meta[key] = val;
  }
  return { meta, body: src.slice(m[0].length) };
}

/** Markdown body → { html, blocks } where blocks describe the essay's shape. */
export function renderMarkdown(body) {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  const blocks = [];
  let i = 0;
  const words = (s) => (s.match(/\S+/g) || []).length;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const fence = /^```(\w*)/.exec(line);
    if (fence) {
      const lang = fence[1];
      const buf = [];
      for (i++; i < lines.length && !lines[i].startsWith("```"); i++) buf.push(lines[i]);
      i++;
      html.push(`<figure class="md-code"><figcaption>${esc(lang || "text")}</figcaption><pre><code>${highlight(buf.join("\n"), lang)}</code></pre></figure>`);
      blocks.push({ type: "code", size: buf.length });
      continue;
    }
    const h = /^(#{2,3})\s+(.*)/.exec(line);
    if (h) {
      const tag = h[1].length === 2 ? "h2" : "h3";
      html.push(`<${tag}>${inline(h[2])}</${tag}>`);
      blocks.push({ type: "heading", size: 1 });
      i++;
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      html.push("<hr />");
      i++;
      continue;
    }
    if (line.startsWith(">")) {
      const buf = [];
      for (; i < lines.length && lines[i].startsWith(">"); i++) buf.push(lines[i].replace(/^>\s?/, ""));
      html.push(`<blockquote><p>${inline(buf.join(" "))}</p></blockquote>`);
      blocks.push({ type: "quote", size: words(buf.join(" ")) });
      continue;
    }
    const list = /^(\s*)([-*]|\d+\.)\s+/.exec(line);
    if (list) {
      const ordered = /\d/.test(list[2]);
      const items = [];
      for (; i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i]); i++) items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ""));
      const tag = ordered ? "ol" : "ul";
      html.push(`<${tag}>${items.map((it) => `<li>${inline(it)}</li>`).join("")}</${tag}>`);
      blocks.push({ type: "list", size: words(items.join(" ")) });
      continue;
    }
    const buf = [];
    for (; i < lines.length && lines[i].trim() && !/^(```|#{2,3}\s|>|\s*([-*]|\d+\.)\s|---+$)/.test(lines[i]); i++) buf.push(lines[i]);
    html.push(`<p>${inline(buf.join(" "))}</p>`);
    blocks.push({ type: "text", size: words(buf.join(" ")) });
  }
  return { html: html.join("\n"), blocks };
}

/** Prose at ~230 wpm; code is read slower, ~12 lines a minute. */
export function readingTime(body) {
  const code = (body.match(/```[\s\S]*?```/g) || []).join("\n");
  const prose = body.replace(/```[\s\S]*?```/g, "");
  const proseWords = (prose.match(/\S+/g) || []).length;
  const codeLines = code.split("\n").filter((l) => l.trim() && !l.startsWith("```")).length;
  return { minutes: Math.max(1, Math.round(proseWords / 230 + codeLines / 12)), words: proseWords, codeLines };
}
