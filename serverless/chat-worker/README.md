# Portfolio chat proxy (Cloudflare Worker)

Streams answers from Claude for the "Ask my portfolio" widget. The API key
stays here; the browser never sees it.

```
browser ──POST {messages}──▶ Worker ──stream──▶ Claude
        ◀──── SSE {"t": "…"} ────┘
```

The Worker's knowledge comes from `https://xdominator365.github.io/myportfolio/chat-context.json`,
which `npm run build` generates from `src/data/content.js`. Update the site and
the bot learns it on the next deploy (cached for 10 minutes), so there's nothing to keep in sync.

## Deploy (≈5 minutes)

```bash
cd serverless/chat-worker
npm install
npx wrangler login                          # free Cloudflare account
npx wrangler secret put ANTHROPIC_API_KEY   # paste a key from console.anthropic.com
npx wrangler kv namespace create LIMITS     # optional: durable daily caps → paste id into wrangler.toml
npx wrangler deploy                         # prints https://portfolio-chat.<you>.workers.dev
```

Then in the GitHub repo, go to **Settings → Secrets and variables → Actions → Variables**,
add `CHAT_ENDPOINT` = the Worker URL, and re-run the deploy workflow. The widget
switches from offline mode to Claude.

## Guard rails and cost

| Control | Default | Where |
|---|---|---|
| Origin allow-list | github.io + localhost | `ALLOWED_ORIGINS` |
| Question length | 500 chars | `MAX_QUESTION_CHARS` |
| History sent | last 8 turns | `MAX_TURNS` |
| Answer length | 1,024 tokens max | `MAX_TOKENS` |
| Per visitor (IP) | 20 / day | `PER_IP_DAILY` |
| Whole site | 500 / day | `GLOBAL_DAILY` |
| Per browser session | 10 questions | widget |

Model: `MODEL` in `wrangler.toml` (default `claude-opus-5-5`, effort `low`). The
static system prompt is sent with `cache_control`, so repeat requests read it from
the prompt cache at a fraction of the input price. The worst case is bounded by
`GLOBAL_DAILY × MAX_TOKENS` output tokens a day. Also set a monthly spend limit in the
Anthropic Console as a hard backstop.

Every request logs `{in, cached, out, stop}` token usage, visible via `npx wrangler tail`.

## Local dev

```bash
npm run dev    # http://localhost:8787; set CONTEXT_URL to a local build if needed
npm run typecheck
```
