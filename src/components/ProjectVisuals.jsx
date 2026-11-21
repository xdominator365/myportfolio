import { useCallback, useEffect, useRef, useState } from "react";
import "../styles/arch-playground.css";
import { prefersReducedMotion } from "../hooks";

/** Live, simulated candlestick chart — a nod to MyDhira's paper-trading engine. */
export function TradingChart() {
  const canvasRef = useRef(null);
  const [price, setPrice] = useState(2480.5);
  const [delta, setDelta] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w, h, raf, interval;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const candles = [];
    let last = 2400;
    const open0 = last;

    const makeCandle = () => {
      const o = last;
      const drift = (Math.random() - 0.46) * 22;
      const c = Math.max(1900, o + drift);
      const hi = Math.max(o, c) + Math.random() * 10;
      const lo = Math.min(o, c) - Math.random() * 10;
      last = c;
      return { o, c, h: hi, l: lo, born: performance.now() };
    };
    for (let i = 0; i < 46; i++) candles.push({ ...makeCandle(), born: 0 });

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now) => {
      ctx.clearRect(0, 0, w, h);
      const vis = candles.slice(-46);
      const max = Math.max(...vis.map((c) => c.h));
      const min = Math.min(...vis.map((c) => c.l));
      const pad = 18;
      const y = (v) => pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2);
      const step = w / vis.length;

      // grid
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (h / 5) * i);
        ctx.lineTo(w, (h / 5) * i);
        ctx.stroke();
      }

      // moving-average area
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "rgba(139,92,246,0.35)");
      grad.addColorStop(1, "rgba(139,92,246,0)");
      ctx.beginPath();
      vis.forEach((c, i) => {
        const x = i * step + step / 2;
        const avg = vis.slice(Math.max(0, i - 5), i + 1).reduce((s, k) => s + k.c, 0) / Math.min(i + 1, 6);
        i ? ctx.lineTo(x, y(avg)) : ctx.moveTo(x, y(avg));
      });
      ctx.strokeStyle = "rgba(167,139,250,0.9)";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fillStyle = grad;
      ctx.fill();

      // candles
      vis.forEach((c, i) => {
        const grow = c.born ? Math.min(1, (now - c.born) / 400) : 1;
        const x = i * step + step / 2;
        const up = c.c >= c.o;
        ctx.strokeStyle = ctx.fillStyle = up ? "#34d399" : "#fb7185";
        ctx.beginPath();
        ctx.moveTo(x, y(c.h));
        ctx.lineTo(x, y(c.l));
        ctx.lineWidth = 1;
        ctx.stroke();
        const top = y(Math.max(c.o, c.c));
        const bh = Math.max(1.5, Math.abs(y(c.o) - y(c.c))) * grow;
        ctx.globalAlpha = 0.25 + 0.75 * grow;
        ctx.fillRect(x - step * 0.32, top, step * 0.64, bh);
        ctx.globalAlpha = 1;
      });

      // live price line
      const ly = y(vis[vis.length - 1].c);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(34,211,238,0.8)";
      ctx.beginPath();
      ctx.moveTo(0, ly);
      ctx.lineTo(w, ly);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#22d3ee";
      ctx.beginPath();
      ctx.arc(w - step / 2, ly, 3 + Math.sin(now / 200) * 1.2, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    resize();
    const reduced = prefersReducedMotion();
    if (!reduced) {
      raf = requestAnimationFrame(draw);
      interval = setInterval(() => {
        candles.push(makeCandle());
        if (candles.length > 120) candles.shift();
        setPrice(last);
        setDelta(((last - open0) / open0) * 100);
      }, 900);
    } else {
      draw(0);
      cancelAnimationFrame(raf);
    }
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const up = delta >= 0;
  return (
    <div className="viz viz-chart">
      <div className="viz-head">
        <div>
          <span className="viz-ticker">PAPER · DEMO/INR</span>
          <strong className="viz-price">₹{price.toFixed(2)}</strong>
          <span className={`viz-delta ${up ? "up" : "down"}`}>
            {up ? "▲" : "▼"} {Math.abs(delta).toFixed(2)}%
          </span>
        </div>
        <span className="viz-live"><i /> simulated feed</span>
      </div>
      <canvas ref={canvasRef} />
      <div className="viz-orders">
        <span>POST /api/v1/orders <b className="ok">201</b></span>
        <span>GET /portfolio <b className="ok">200</b></span>
        <span>trade_log: <b>append-only</b></span>
      </div>
    </div>
  );
}

/* =====================================================================
   Claim Getter — interactive architecture playground.

   Click any component to inspect it, walk through a concurrent write step by
   step, or "Break it": remove the optimistic lock and watch lost updates pile
   up in the simulation. That last toggle is the whole story of the project.
   ===================================================================== */

const NODES = {
  clients: {
    title: "Claim requests",
    what: "Callers create, update and re-prioritise claims — often the same claim, within milliseconds of each other.",
    flow: "Each request invokes the function with a claim id and the change to apply.",
    fails: "Duplicate submissions, upstream retries after timeouts, month-end bursts.",
  },
  lambda: {
    title: "AWS Lambda · Python",
    what: "Stateless handler: validates the payload, computes priority, reads the current item including its version number.",
    flow: "Scales out horizontally — three concurrent requests can mean three execution environments that know nothing about each other.",
    fails: "Cold starts, timeouts — and two instances reading the same version at the same moment.",
  },
  lock: {
    title: "Conditional write",
    what: "Optimistic locking: the write only succeeds if the item still has the version this instance read.",
    flow: "PutItem … ConditionExpression: version = :read, then version + 1. On ConditionalCheckFailed → re-read and retry with jittered backoff.",
    fails: "Without it, last writer wins: one update silently overwrites another. Nobody gets an error — the data is just wrong.",
  },
  dynamo: {
    title: "Amazon DynamoDB",
    what: "The single source of truth for claims. Conditional writes are atomic per item.",
    flow: "Correctness lives in the database, not in Lambda memory — so it holds no matter how far the functions scale.",
    fails: "Hot partitions on skewed keys and throttling, absorbed with exponential backoff.",
  },
};

// What the lock node says once it has been removed.
const LOCK_REMOVED = {
  title: "Lock removed",
  what: "Writes go straight through — no version check.",
  flow: "Two instances read version 7 and both write. The second write silently replaces the first.",
  fails: "Every collision in the counter above is a lost update — a change the caller thinks was saved, but isn't. No error, no alert. This is the class of bug that only shows up at 2 a.m.",
};

const STEPS = [
  { node: "clients", text: "Three updates to claim #4521 arrive within 5 ms of each other." },
  { node: "lambda", text: "Lambda fans out. Three instances each read the item — all of them see version 7." },
  { node: "lock", text: "All three attempt the write with ConditionExpression: version = 7." },
  { node: "dynamo", text: "DynamoDB accepts exactly one. The item moves to version 8; the other two get ConditionalCheckFailed." },
  { node: "lambda", text: "The two losers re-read version 8, re-apply their change and retry with jitter. All three updates land — none lost." },
];

const CLAIM_Y = [40, 105, 170];

function useClaimSim(locked) {
  const [sim, setSim] = useState({ requests: 1200, retried: 0, lost: 0, hit: 0 });
  useEffect(() => {
    const id = setInterval(() => {
      // How many writers hit the same claim in this window: usually 1, sometimes 2–3.
      const r = Math.random();
      const writers = r < 0.6 ? 1 : r < 0.88 ? 2 : 3;
      setSim((s) => ({
        requests: s.requests + writers,
        retried: s.retried + (locked ? writers - 1 : 0),
        lost: s.lost + (locked ? 0 : writers - 1),
        hit: writers > 1 ? s.hit + 1 : s.hit,
      }));
    }, 700);
    return () => clearInterval(id);
  }, [locked]);
  return [sim, setSim];
}

function NodeHit({ id, selected, onSelect, children, label }) {
  const onKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(id);
    }
  };
  return (
    <g
      className={`arch-node ${selected === id ? "is-selected" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={selected === id}
      onClick={() => onSelect(id)}
      onKeyDown={onKey}
      data-cursor="Inspect"
    >
      {children}
    </g>
  );
}

export function ArchitectureDiagram() {
  const [locked, setLocked] = useState(true);
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState(-1); // -1 = free exploration
  const [playing, setPlaying] = useState(false);
  const [sim, setSim] = useClaimSim(locked);
  const hitRef = useRef(sim.hit);
  const [flash, setFlash] = useState(0);

  // Flash the database on each collision.
  useEffect(() => {
    if (sim.hit !== hitRef.current) {
      hitRef.current = sim.hit;
      setFlash((f) => f + 1);
    }
  }, [sim.hit]);

  // Auto-advance the walkthrough.
  useEffect(() => {
    if (!playing) return;
    if (step >= STEPS.length - 1) return setPlaying(false);
    const t = setTimeout(() => setStep((s) => s + 1), 3600);
    return () => clearTimeout(t);
  }, [playing, step]);

  const focus = step >= 0 ? STEPS[step].node : selected;

  const select = useCallback((id) => {
    setPlaying(false);
    setStep(-1);
    setSelected((cur) => (cur === id ? null : id));
  }, []);

  const startTour = () => {
    if (playing) return setPlaying(false);
    setSelected(null);
    setLocked(true);
    setStep((s) => (s < 0 || s >= STEPS.length - 1 ? 0 : s));
    setPlaying(true);
  };

  const toggleLock = () => {
    setPlaying(false);
    setStep(-1);
    setLocked((l) => !l);
    setSelected("lock");
    setSim((s) => ({ ...s, retried: 0, lost: 0 }));
  };

  const node = focus === "lock" && !locked ? LOCK_REMOVED : focus ? NODES[focus] : null;

  return (
    <div className={`viz viz-arch ${locked ? "" : "is-broken"}`}>
      <div className="viz-head">
        <div>
          <span className="viz-ticker">CLAIM-GETTER · us-east-1</span>
          <strong className="viz-price">{sim.requests.toLocaleString()}</strong>
          <span className="viz-delta up">requests · simulated</span>
        </div>
        <span className={`viz-live arch-status ${locked ? "ok" : "bad"}`} aria-live="polite">
          <i />
          {locked ? `0 lost · ${sim.retried} retried` : `${sim.lost} lost update${sim.lost === 1 ? "" : "s"}`}
        </span>
      </div>

      <svg
        viewBox="0 0 420 210"
        className={`arch-svg ${focus ? "has-focus" : ""}`}
        role="group"
        aria-label="Claim Getter architecture: claim requests flow into AWS Lambda, which writes to DynamoDB through a conditional write. Select a component to learn more."
      >
        <defs>
          <linearGradient id="wire" x1="0" x2="1">
            <stop offset="0" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* incoming claims */}
        <NodeHit id="clients" selected={focus} onSelect={select} label="Claim requests">
          {CLAIM_Y.map((cy, i) => (
            <g key={cy}>
              <path id={`in${i}`} d={`M70 ${cy} C 120 ${cy}, 130 105, 172 105`} className="wire" />
              <circle r="4" className="packet p-violet" filter="url(#glow)">
                <animateMotion dur={`${1.6 + i * 0.35}s`} repeatCount="indefinite" begin={`${i * 0.4}s`}>
                  <mpath href={`#in${i}`} />
                </animateMotion>
              </circle>
              <rect x="12" y={cy - 16} width="58" height="32" rx="9" className="node" />
              <text x="41" y={cy + 4} className="node-label">claim #{i + 1}</text>
            </g>
          ))}
          <rect x="4" y="16" width="74" height="178" className="arch-hit" />
        </NodeHit>

        {/* lambda */}
        <NodeHit id="lambda" selected={focus} onSelect={select} label="AWS Lambda">
          <rect x="172" y="72" width="76" height="66" rx="16" className="node node-hot" />
          <text x="210" y="106" className="node-icon">λ</text>
          <text x="210" y="126" className="node-label">Lambda</text>
          <circle cx="210" cy="105" r="44" className="ring-pulse" />
        </NodeHit>

        {/* retry loop — only meaningful while the lock is in place */}
        {locked && (
          <g className="arch-retry">
            <path id="retry" d="M283 90 C 276 52, 236 50, 222 70" className="wire wire-retry" />
            <circle r="3.2" className="packet p-amber">
              <animateMotion dur="1.4s" repeatCount="indefinite" begin="0.3s">
                <mpath href="#retry" />
              </animateMotion>
            </circle>
            <text x="252" y="48" className="node-label arch-retry-label">retry</text>
          </g>
        )}

        {/* to dynamo */}
        <path id="out" d="M248 105 L 318 105" className="wire wire-strong" />
        <circle r="5" className={`packet ${locked ? "p-cyan" : "p-red"}`} filter="url(#glow)">
          <animateMotion dur="0.9s" repeatCount="indefinite">
            <mpath href="#out" />
          </animateMotion>
        </circle>
        {!locked && (
          <circle r="5" className="packet p-red" filter="url(#glow)">
            <animateMotion dur="0.9s" repeatCount="indefinite" begin="0.3s">
              <mpath href="#out" />
            </animateMotion>
          </circle>
        )}

        <NodeHit id="lock" selected={focus} onSelect={select} label="Conditional write (optimistic lock)">
          <circle cx="283" cy="105" r="15" className="node arch-lock" />
          <text x="283" y="110" className="lock">{locked ? "🔒" : "🔓"}</text>
        </NodeHit>

        {/* dynamodb */}
        <NodeHit id="dynamo" selected={focus} onSelect={select} label="Amazon DynamoDB">
          <g className="arch-db" key={flash}>
            <ellipse cx="365" cy="80" rx="40" ry="11" className="node" />
            <path d="M325 80 v50 a40 11 0 0 0 80 0 v-50" className="node" />
            <ellipse cx="365" cy="105" rx="40" ry="11" className="db-band" />
          </g>
          <text x="365" y="152" className="node-label">DynamoDB</text>
          {!locked && flash > 0 && (
            <text key={`l${flash}`} x="365" y="62" className="arch-loss">−1 update</text>
          )}
          <rect x="320" y="60" width="90" height="100" className="arch-hit" />
        </NodeHit>
      </svg>

      <div className="arch-panel" aria-live="polite">
        {step >= 0 ? (
          <>
            <div className="arch-panel-head">
              <span className="arch-step">Step {step + 1} of {STEPS.length}</span>
              <strong>{NODES[STEPS[step].node].title}</strong>
            </div>
            <p>{STEPS[step].text}</p>
            <div className="arch-progress">
              {STEPS.map((_, i) => (
                <button key={i} className={i <= step ? "on" : ""} onClick={() => { setPlaying(false); setStep(i); }} aria-label={`Go to step ${i + 1}`} />
              ))}
            </div>
          </>
        ) : node ? (
          <>
            <div className="arch-panel-head">
              <strong className={node === LOCK_REMOVED ? "arch-warn" : undefined}>{node.title}</strong>
              <button className="arch-close" onClick={() => setSelected(null)} aria-label="Close details">×</button>
            </div>
            <dl>
              <dt>What</dt><dd>{node.what}</dd>
              <dt>Flow</dt><dd>{node.flow}</dd>
              <dt>Breaks when</dt><dd>{node.fails}</dd>
            </dl>
          </>
        ) : (
          <p className="arch-hint">
            Tap any component to inspect it — or walk through what happens when three people update the same claim at once.
          </p>
        )}
      </div>

      <div className="arch-controls">
        <button className="arch-btn" onClick={startTour}>
          {playing ? "❚❚ Pause" : step >= 0 && step < STEPS.length - 1 ? "▶ Resume" : "▶ Walk through"}
        </button>
        {step >= 0 && (
          <>
            <button className="arch-btn icon" onClick={() => { setPlaying(false); setStep((s) => Math.max(0, s - 1)); }} disabled={step === 0} aria-label="Previous step">‹</button>
            <button className="arch-btn icon" onClick={() => { setPlaying(false); setStep((s) => Math.min(STEPS.length - 1, s + 1)); }} disabled={step === STEPS.length - 1} aria-label="Next step">›</button>
          </>
        )}
        <button className={`arch-btn ${locked ? "danger" : "fix"}`} onClick={toggleLock} aria-pressed={!locked}>
          {locked ? "🔓 Break it — remove the lock" : "🔒 Fix it — restore the lock"}
        </button>
      </div>
    </div>
  );
}
