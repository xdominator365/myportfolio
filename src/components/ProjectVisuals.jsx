import { useEffect, useRef, useState } from "react";
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

/** Animated serverless flow — requests race in, Lambda serializes them, DynamoDB stays consistent. */
export function ArchitectureDiagram() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => setCount((c) => c + 1), 700);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="viz viz-arch">
      <div className="viz-head">
        <div>
          <span className="viz-ticker">CLAIM-GETTER · us-east-1</span>
          <strong className="viz-price">{(1200 + count * 3).toLocaleString()}</strong>
          <span className="viz-delta up">requests · simulated</span>
        </div>
        <span className="viz-live"><i /> 0 write conflicts</span>
      </div>
      <svg viewBox="0 0 420 210" className="arch-svg" role="img" aria-label="Claims flow from clients into AWS Lambda and are written safely to DynamoDB">
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
        {[40, 105, 170].map((cy, i) => (
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

        {/* lambda */}
        <g className="lambda-node">
          <rect x="172" y="72" width="76" height="66" rx="16" className="node node-hot" />
          <text x="210" y="106" className="node-icon">λ</text>
          <text x="210" y="126" className="node-label">Lambda</text>
          <circle cx="210" cy="105" r="44" className="ring-pulse" />
        </g>

        {/* to dynamo */}
        <path id="out" d="M248 105 L 318 105" className="wire wire-strong" />
        <circle r="5" className="packet p-cyan" filter="url(#glow)">
          <animateMotion dur="0.9s" repeatCount="indefinite">
            <mpath href="#out" />
          </animateMotion>
        </circle>
        <text x="283" y="94" className="lock">🔒</text>

        {/* dynamodb */}
        <g>
          <ellipse cx="365" cy="80" rx="40" ry="11" className="node" />
          <path d="M325 80 v50 a40 11 0 0 0 80 0 v-50" className="node" />
          <ellipse cx="365" cy="105" rx="40" ry="11" className="db-band" />
          <text x="365" y="152" className="node-label">DynamoDB</text>
        </g>
      </svg>
      <div className="viz-orders">
        <span>concurrency: <b className="ok">safe</b></span>
        <span>runtime: <b>python</b></span>
        <span>infra: <b>serverless</b></span>
      </div>
    </div>
  );
}
