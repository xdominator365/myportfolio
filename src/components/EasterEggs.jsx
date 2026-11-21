import { useCallback, useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../hooks";
import { profile } from "../data/content";
import { trackEvent } from "../lib/notify";
import "../styles/easter-eggs.css";

/* =====================================================================
   Secrets registry — shared with the command palette.
   ===================================================================== */

export const SECRETS = [
  { id: "konami", label: "Konami code", hint: "↑ ↑ ↓ ↓ ← → ← → B A" },
  { id: "sudo", label: "sudo hire harshit", hint: "type “sudo hire harshit” anywhere" },
  { id: "matrix", label: "Enter the Matrix", hint: "type “matrix” anywhere" },
  { id: "vim", label: "Exit Vim", hint: "type :q anywhere" },
];

const STORE = "hy-secrets";

export function foundSecrets() {
  try {
    return JSON.parse(localStorage.getItem(STORE)) || [];
  } catch {
    return [];
  }
}

function markFound(id) {
  const found = foundSecrets();
  if (found.includes(id)) return null;
  const next = [...found, id];
  try {
    localStorage.setItem(STORE, JSON.stringify(next));
  } catch {
    /* private mode — achievements just won't persist */
  }
  return next.length;
}

/** Fire an egg from anywhere (the command palette uses this). */
export const triggerEgg = (id) => window.dispatchEvent(new CustomEvent("hy:egg", { detail: id }));

/* =====================================================================
   Keyboard listener
   ===================================================================== */

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
const PHRASES = [
  ["sudo hire harshit", "sudo"],
  ["matrix", "matrix"],
  [":wq", "vim"],
  [":q!", "vim"],
  [":q", "vim"],
];

const isTypingTarget = (el) => el?.closest?.("input, textarea, select, [contenteditable='true']");

function useSecretKeys(onEgg) {
  useEffect(() => {
    let keys = [];
    let text = "";
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      const k = e.key.toLowerCase();

      keys = [...keys, k].slice(-KONAMI.length);
      if (keys.join() === KONAMI.join()) {
        keys = [];
        return onEgg("konami");
      }

      if (k.length !== 1) return;
      // Don't let the spaces in "sudo hire harshit" scroll the page mid-phrase.
      if (k === " " && /sudo$|sudo hire$/.test(text)) e.preventDefault();
      text = (text + k).slice(-24);
      const hit = PHRASES.find(([p]) => text.endsWith(p));
      if (hit) {
        text = "";
        onEgg(hit[1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onEgg]);
}

/* =====================================================================
   Confetti — two cannons, real-ish physics (gravity, drag, flutter).
   ===================================================================== */

const COLORS = ["#8b5cf6", "#ec4899", "#22d3ee", "#f59e0b", "#a3e635", "#34d399"];

function Confetti({ onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = innerWidth;
    const h = innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const cannon = (x, dir) =>
      Array.from({ length: 110 }, () => {
        const angle = (-Math.PI / 2) + dir * (0.25 + Math.random() * 0.45); // up and inward
        const speed = 13 + Math.random() * 11;
        return {
          x,
          y: h + 10,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          w: 6 + Math.random() * 6,
          h: 3 + Math.random() * 4,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.35,
          flutter: Math.random() * Math.PI * 2,
          color: COLORS[(Math.random() * COLORS.length) | 0],
        };
      });
    const parts = [...cannon(0, 1), ...cannon(w, -1)];

    let raf;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of parts) {
        p.vy += 0.32; // gravity
        p.vx *= 0.985; // air drag
        p.vy *= 0.985;
        p.flutter += 0.12;
        p.x += p.vx + Math.sin(p.flutter) * 0.6;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y < h + 40) alive++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.flutter)); // paper flipping in the air
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive) raf = requestAnimationFrame(tick);
      else onDone();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);
  return <canvas ref={ref} className="egg-canvas" aria-hidden="true" />;
}

/* =====================================================================
   Matrix rain — fades in over the page, click or Esc to wake up.
   ===================================================================== */

const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ0123456789λ{}<>=HARSHIT";

function MatrixRain({ onDone }) {
  const ref = useRef(null);
  const [leaving, setLeaving] = useState(false);
  const leave = useCallback(() => setLeaving(true), []);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(onDone, 700);
    return () => clearTimeout(t);
  }, [leaving, onDone]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const w = (canvas.width = innerWidth);
    const h = (canvas.height = innerHeight);
    const size = 16;
    const cols = Array.from({ length: Math.ceil(w / size) }, () => -Math.random() * 60);
    let raf;
    let last = 0;
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (now - last < 45) return; // ~22fps feels more "terminal" than 60
      last = now;
      ctx.fillStyle = "rgba(4, 8, 6, 0.12)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${size}px "JetBrains Mono", monospace`;
      cols.forEach((y, i) => {
        const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        ctx.fillStyle = "#d1fae5";
        ctx.fillText(ch, i * size, y * size);
        ctx.fillStyle = "#22c55e";
        ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], i * size, (y - 1) * size);
        cols[i] = y * size > h && Math.random() > 0.975 ? 0 : y + 1;
      });
    };
    raf = requestAnimationFrame(tick);
    const t = setTimeout(leave, 9000);
    const onKey = (e) => e.key === "Escape" && leave();
    addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      removeEventListener("keydown", onKey);
    };
  }, [leave]);

  return (
    <div className={`egg-matrix ${leaving ? "is-leaving" : ""}`} onClick={leave} role="presentation">
      <canvas ref={ref} aria-hidden="true" />
      <p className="egg-matrix-msg">
        Wake up, visitor… <span>the portfolio has you.</span>
        <small>click or press esc to take the blue pill</small>
      </p>
    </div>
  );
}

/* =====================================================================
   sudo hire harshit — a terminal that "processes" the request.
   ===================================================================== */

const SUDO_LINES = [
  { t: "$ sudo hire harshit", cls: "cmd" },
  { t: "[sudo] password for recruiter: ••••••••••", cls: "dim" },
  { t: "✔ Access granted. You clearly have good taste.", cls: "ok" },
  { t: "→ verifying AWS certification ........ ok", cls: "" },
  { t: "→ checking for race conditions ....... 0 found", cls: "" },
  { t: "→ benchmarking under peak load ....... +40%", cls: "" },
  { t: "→ negotiating chai budget ............ ok", cls: "" },
  { t: "📨 Offer letter drafted. Ready to send.", cls: "ok" },
];

function SudoDialog({ onClose }) {
  const [shown, setShown] = useState(prefersReducedMotion() ? SUDO_LINES.length : 0);
  const sendRef = useRef(null);
  const done = shown >= SUDO_LINES.length;

  useEffect(() => {
    if (done) {
      sendRef.current?.focus();
      return;
    }
    const t = setTimeout(() => setShown((n) => n + 1), shown === 1 ? 900 : 380);
    return () => clearTimeout(t);
  }, [shown, done]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [onClose]);

  const subject = encodeURIComponent("Offer letter (via sudo hire harshit)");
  const body = encodeURIComponent(
    "Hi Harshit,\n\nI ran `sudo hire harshit` on your portfolio and it said access granted — so here we are.\n\nRole:\nTeam:\nWhen can we talk?\n\n"
  );

  return (
    <div className="egg-backdrop" onClick={onClose}>
      <div className="egg-term" role="dialog" aria-modal="true" aria-label="sudo hire harshit" onClick={(e) => e.stopPropagation()}>
        <div className="egg-term-head">
          <span className="egg-dots"><i /><i /><i /></span>
          <span>root@harshit.dev — zsh</span>
        </div>
        <div className="egg-term-body" aria-live="polite">
          {SUDO_LINES.slice(0, shown).map((l) => (
            <p key={l.t} className={l.cls}>{l.t}</p>
          ))}
          {!done && <span className="egg-caret" />}
        </div>
        <div className={`egg-term-actions ${done ? "is-ready" : ""}`}>
          <a
            ref={sendRef}
            className="btn btn-primary btn-sm"
            href={`mailto:${profile.email}?subject=${subject}&body=${body}`}
            onClick={() => trackEvent("🎮 Someone ran `sudo hire harshit` and opened the offer email")}
            tabIndex={done ? 0 : -1}
          >
            <span>Send the offer</span>
            <span className="btn-arrow">✉</span>
          </a>
          <button className="btn btn-ghost btn-sm" onClick={onClose} tabIndex={done ? 0 : -1}>
            <span>Not yet</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   Orchestrator
   ===================================================================== */

export default function EasterEggs({ toast }) {
  const [active, setActive] = useState(null); // konami | matrix | sudo | null
  const clear = useCallback(() => setActive(null), []);

  const fire = useCallback(
    (id) => {
      const count = markFound(id);
      const badge = count ? `  ·  🏆 secret ${count}/${SECRETS.length}` : "";
      const reduced = prefersReducedMotion();
      if (count) trackEvent(`🎮 Visitor found secret ${count}/${SECRETS.length}: ${id}`);

      switch (id) {
        case "konami":
          toast(`↑↑↓↓←→←→BA — 30 extra lives granted${badge}`);
          if (!reduced) setActive("konami");
          break;
        case "matrix":
          if (reduced) toast(`Matrix rain is off with reduced motion — you're already in the real world${badge}`);
          else {
            setActive("matrix");
            if (badge) toast(`There is no spoon${badge}`);
          }
          break;
        case "sudo":
          setActive("sudo");
          break;
        case "vim":
          toast(`You exited Vim. Most people never do${badge}`);
          break;
        default:
      }
    },
    [toast]
  );

  useSecretKeys(fire);

  useEffect(() => {
    const onEgg = (e) => fire(e.detail);
    window.addEventListener("hy:egg", onEgg);
    return () => window.removeEventListener("hy:egg", onEgg);
  }, [fire]);

  if (active === "konami") return <Confetti onDone={clear} />;
  if (active === "matrix") return <MatrixRain onDone={clear} />;
  if (active === "sudo") return <SudoDialog onClose={clear} />;
  return null;
}
