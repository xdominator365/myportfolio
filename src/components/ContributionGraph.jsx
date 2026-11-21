import { useEffect, useMemo, useRef, useState } from "react";
import { useCountUp, useReveal } from "../hooks";
import "../styles/contributions.css";

// Fresh build-time data when the prebuild fetch succeeded, otherwise the committed snapshot.
const files = import.meta.glob("../data/contributions*.json", { eager: true, import: "default" });
const DATA = files["../data/contributions.json"] || files["../data/contributions.snapshot.json"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LEVEL_COLORS = ["", "#4c2f8f", "#7c4ddb", "#d04fc4", "#22d3ee"];
const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;

const parse = (d) => new Date(`${d}T00:00:00Z`);
const fmtDate = (d) => parse(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

function analyse(days) {
  // Lay days out GitHub-style: columns are weeks starting Sunday.
  const first = parse(days[0][0]).getUTCDay();
  const cells = days.map(([date, count], i) => ({ date, count, col: Math.floor((i + first) / 7), row: (i + first) % 7 }));
  const cols = cells[cells.length - 1].col + 1;

  const counts = days.map((d) => d[1]);
  const total = counts.reduce((a, b) => a + b, 0);
  const active = counts.filter(Boolean).length;
  let longest = 0;
  let run = 0;
  for (const c of counts) longest = Math.max(longest, (run = c ? run + 1 : 0));
  // Current streak: allow today to be empty (the day isn't over).
  let current = 0;
  for (let i = counts.length - 1; i >= 0; i--) {
    if (counts[i]) current++;
    else if (i !== counts.length - 1) break;
  }
  const best = cells.reduce((a, b) => (b.count > a.count ? b : a), cells[0]);

  // Levels by quartile of non-zero days, like GitHub.
  const sorted = counts.filter(Boolean).sort((a, b) => a - b);
  const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] || 1;
  const cuts = [q(0.25), q(0.5), q(0.75)];
  for (const c of cells) c.level = !c.count ? 0 : c.count <= cuts[0] ? 1 : c.count <= cuts[1] ? 2 : c.count <= cuts[2] ? 3 : 4;

  const months = [];
  cells.forEach((c) => {
    const d = parse(c.date);
    if (d.getUTCDate() <= 7 && c.row === 0) months.push({ col: c.col, label: MONTHS[d.getUTCMonth()] });
  });

  return { cells, cols, total, active, longest, current, best, max: best.count || 1, months };
}

function Grid({ a, visible, onHover }) {
  const w = a.cols * STEP + 28;
  const h = 7 * STEP + 18;
  return (
    <svg className="cg-grid" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${a.total} contributions in the last year`}>
      {a.months.map((m) => (
        <text key={`${m.col}${m.label}`} x={28 + m.col * STEP} y={9} className="cg-axis">{m.label}</text>
      ))}
      {[1, 3, 5].map((r) => (
        <text key={r} x={0} y={18 + r * STEP + 9} className="cg-axis">{["", "Mon", "", "Wed", "", "Fri"][r]}</text>
      ))}
      {a.cells.map((c) => (
        <rect
          key={c.date}
          x={28 + c.col * STEP}
          y={18 + c.row * STEP}
          width={CELL}
          height={CELL}
          rx={2.5}
          className={`cg-cell l${c.level} ${visible ? "is-in" : ""}`}
          style={{ "--d": `${(c.col + c.row) * 9}ms`, fill: LEVEL_COLORS[c.level] || undefined }}
          onPointerEnter={() => onHover(c)}
          onPointerLeave={() => onHover(null)}
        />
      ))}
    </svg>
  );
}

/** Oblique-projected towers: the same year, as a skyline. Heights ∝ √count. */
function Skyline({ a, onHover }) {
  const s = 12;
  const dx = -0.42 * s;
  const dy = 0.5 * s;
  const maxH = 90;
  const ox = 7 * -dx + 4;
  const oy = maxH + 10;
  const shade = (hex, k) => {
    const n = parseInt(hex.slice(1), 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v * k));
    return `rgb(${c.join(",")})`;
  };
  // Back rows first; within a row, right to left, so nearer towers paint over farther ones.
  const order = [...a.cells].sort((p, q) => p.row - q.row || q.col - p.col);
  const width = ox + a.cols * s + 6;
  const height = oy + 7 * dy + 10;
  return (
    <svg className="cg-sky" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Skyline of ${a.total} contributions in the last year`}>
      {order.map((c) => {
        const x = ox + c.col * s + c.row * dx;
        const y = oy + c.row * dy;
        const h = c.count ? 4 + Math.sqrt(c.count / a.max) * (maxH - 4) : 1.2;
        const fw = s * 0.82;
        const fdx = dx * 0.82;
        const fdy = dy * 0.82;
        const P = (px, py) => `${px.toFixed(1)},${py.toFixed(1)}`;
        const top = [P(x, y - h), P(x + fw, y - h), P(x + fw + fdx, y + fdy - h), P(x + fdx, y + fdy - h)].join(" ");
        const front = [P(x + fdx, y + fdy - h), P(x + fw + fdx, y + fdy - h), P(x + fw + fdx, y + fdy), P(x + fdx, y + fdy)].join(" ");
        const left = [P(x, y - h), P(x + fdx, y + fdy - h), P(x + fdx, y + fdy), P(x, y)].join(" ");
        const base = LEVEL_COLORS[c.level] || "#2a2840";
        return (
          <g
            key={c.date}
            className={`cg-tower ${c.count ? "has" : ""}`}
            style={{ "--d": `${c.col * 14}ms` }}
            onPointerEnter={() => onHover(c)}
            onPointerLeave={() => onHover(null)}
          >
            <polygon points={left} fill={shade(base, 0.45)} />
            <polygon points={front} fill={shade(base, 0.7)} />
            <polygon points={top} fill={base} />
          </g>
        );
      })}
    </svg>
  );
}

export default function ContributionGraph() {
  const a = useMemo(() => (DATA?.days?.length ? analyse(DATA.days) : null), []);
  const [ref, visible] = useReveal({ threshold: 0.25 });
  const [view, setView] = useState("grid");
  const [hover, setHover] = useState(null);
  const total = useCountUp(a?.total || 0, visible, { duration: 1800 });
  const stageRef = useRef(null);

  // On narrow screens the graph scrolls sideways — start at the most recent weeks.
  useEffect(() => {
    const el = stageRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [view]);

  if (!a) return null;

  const stats = [
    { k: "Active days", v: a.active },
    { k: "Longest streak", v: `${a.longest}d` },
    { k: "Current streak", v: `${a.current}d` },
    { k: "Best day", v: `${a.best.count}`, sub: fmtDate(a.best.date) },
  ];

  return (
    <div ref={ref} className={`cg ${visible ? "is-visible" : ""}`}>
      <div className="cg-head">
        <div>
          <span className="card-kicker">⌁ Proof of work · github.com/{DATA.login}</span>
          <strong className="cg-total">
            <span className="grad-text">{total.toLocaleString("en-IN")}</span> contributions in the last year
          </strong>
        </div>
        <div className="cg-toggle" role="tablist" aria-label="Graph style">
          {[
            ["grid", "Grid"],
            ["sky", "Skyline"],
          ].map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={view === id}
              className={view === id ? "on" : ""}
              onClick={() => {
                setView(id);
                setHover(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="cg-stage" ref={stageRef}>
        {view === "grid" ? <Grid a={a} visible={visible} onHover={setHover} /> : <Skyline a={a} onHover={setHover} />}
        <div className={`cg-tip ${hover ? "is-on" : ""}`} aria-hidden="true">
          {hover && (
            <>
              <b>{hover.count || "No"} contribution{hover.count === 1 ? "" : "s"}</b> · {fmtDate(hover.date)}
            </>
          )}
        </div>
      </div>

      <div className="cg-foot">
        <div className="cg-stats">
          {stats.map((s) => (
            <span key={s.k}>
              <b>{s.v}</b>
              {s.k}
              {s.sub && <small> · {s.sub}</small>}
            </span>
          ))}
        </div>
        <div className="cg-legend" aria-hidden="true">
          less
          {LEVEL_COLORS.map((c, i) => (
            <i key={i} className={`l${i}`} style={{ background: c || undefined }} />
          ))}
          more
        </div>
      </div>
    </div>
  );
}
