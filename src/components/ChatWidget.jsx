import { useEffect, useMemo, useRef, useState } from "react";
import { profile } from "../data/content";
import { buildKnowledge } from "../lib/knowledge";
import { answerOffline, createIndex } from "../lib/chat-offline";
import { trackEvent } from "../lib/notify";
import "../styles/chat.css";

/**
 * "Ask my portfolio".
 * Live mode streams from the Claude proxy when VITE_CHAT_ENDPOINT is set at
 * build time. Without it — or if the proxy is down or over its daily cap — it
 * answers from an in-browser index of the same facts, and says so.
 */
const ENDPOINT = import.meta.env.VITE_CHAT_ENDPOINT || "";
const SESSION_CAP = 10;
const SUGGESTIONS = ["What does Harshit do at BDO?", "Tell me about MyDhira", "How strong is he on AWS?", "How do I reach him?"];

const used = () => Number(sessionStorage.getItem("hy-chat-n") || 0);

async function streamLive(history, onDelta, signal) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: history }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`proxy ${res.status}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf("\n\n")) >= 0) {
      const frame = buf.slice(0, i);
      buf = buf.slice(i + 2);
      const data = frame.split("\n").find((l) => l.startsWith("data: "))?.slice(6);
      if (!data) continue;
      const msg = JSON.parse(data);
      if (msg.error) throw new Error(msg.error);
      if (msg.t) onDelta(msg.t);
    }
  }
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]); // { role, content, sources?, mode? }
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState(() => SESSION_CAP - used());
  const search = useMemo(() => createIndex(buildKnowledge()), []);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [msgs]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const patchLast = (fn) => setMsgs((m) => [...m.slice(0, -1), fn(m[m.length - 1])]);

  // Offline answers "type" out so both modes feel the same.
  const typeOut = (text) =>
    new Promise((resolve) => {
      const words = text.split(/(\s+)/);
      let i = 0;
      const step = () => {
        i = Math.min(words.length, i + 3);
        patchLast((last) => ({ ...last, content: words.slice(0, i).join("") }));
        if (i < words.length) setTimeout(step, 18);
        else resolve();
      };
      step();
    });

  const ask = async (q) => {
    const question = q.trim().slice(0, 500);
    if (!question || busy) return;
    if (left <= 0) return;
    setInput("");
    setBusy(true);
    const n = used() + 1;
    sessionStorage.setItem("hy-chat-n", String(n));
    setLeft(SESSION_CAP - n);
    if (n === 1) trackEvent("💬 Someone started chatting with your portfolio", question);

    const history = [...msgs.map(({ role, content }) => ({ role, content })), { role: "user", content: question }];
    setMsgs((m) => [...m, { role: "user", content: question }, { role: "assistant", content: "", mode: ENDPOINT ? "live" : "offline" }]);

    try {
      if (!ENDPOINT) throw new Error("offline");
      abortRef.current = new AbortController();
      await streamLive(history, (t) => patchLast((last) => ({ ...last, content: last.content + t })), abortRef.current.signal);
    } catch (err) {
      if (err.name === "AbortError") return;
      const { text, sources } = answerOffline(search, question, profile.email);
      patchLast((last) => ({ ...last, content: "", sources, mode: "offline", note: ENDPOINT ? "The AI is resting — answering from my notes instead." : null }));
      await typeOut(text);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button className={`chat-fab ${open ? "is-open" : ""}`} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="chat-panel" data-cursor="Ask">
        <span className="chat-orb" aria-hidden="true" />
        <span className="chat-fab-label">{open ? "Close" : "Ask my portfolio"}</span>
      </button>

      <section id="chat-panel" className={`chat ${open ? "is-open" : ""}`} aria-label="Ask Harshit's portfolio" hidden={!open}>
        <header className="chat-head">
          <div>
            <strong>Ask Harshit's portfolio</strong>
            <small className={ENDPOINT ? "live" : "offline"}>
              <i /> {ENDPOINT ? "Claude · answers from portfolio data" : "offline · searches the portfolio"}
            </small>
          </div>
          <button className="chat-x" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
        </header>

        <div className="chat-list" ref={listRef} aria-live="polite">
          {msgs.length === 0 && (
            <div className="chat-empty">
              <p>Hi — I know Harshit's work, projects and stack. Ask me anything, or try:</p>
              <div className="chat-suggest">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => ask(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              {m.note && <span className="chat-note">{m.note}</span>}
              <p>{m.content || (busy && i === msgs.length - 1 ? <span className="chat-dots"><i /><i /><i /></span> : null)}</p>
              {m.sources?.length > 0 && <span className="chat-src">from: {m.sources.join(" · ")}</span>}
            </div>
          ))}
        </div>

        <form
          className="chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={left > 0 ? "Ask about experience, projects, stack…" : `That's ${SESSION_CAP} questions — email ${profile.email}`}
            maxLength={500}
            disabled={left <= 0}
            aria-label="Your question"
          />
          <button type="submit" disabled={busy || !input.trim() || left <= 0} aria-label="Send">➤</button>
        </form>
        <p className="chat-foot">{left > 0 ? `${left} of ${SESSION_CAP} questions left this session` : "Session limit reached — say hi by email instead!"}</p>
      </section>
    </>
  );
}
