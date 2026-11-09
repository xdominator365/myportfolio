import { useEffect, useState } from "react";
import { hobbies, persona } from "../data/content";
import { prefersReducedMotion, useCountUp, useReveal, useSpotlight, useTilt } from "../hooks";
import { Reveal, SectionHead } from "./Sections";

/* =====================================================================
   VISION — investor / builder persona
   ===================================================================== */

function CompoundCurve() {
  const [ref, visible] = useReveal({ threshold: 0.3 });
  const multiple = useCountUp(37.78, visible, { decimals: 2, duration: 2600 });
  // y = 1.01^x over a year, normalized into the viewBox
  const pts = Array.from({ length: 53 }, (_, w) => {
    const x = (w / 52) * 300;
    const v = Math.pow(1.01, w * 7);
    const y = 150 - ((v - 1) / (37.78 - 1)) * 135;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <div ref={ref} className={`compound ${visible ? "is-visible" : ""}`}>
      <div className="compound-head">
        <span className="card-kicker">The math I live by</span>
        <strong>
          1% better every day = <span className="grad-text">{multiple.toFixed(2)}×</span> in a year
        </strong>
      </div>
      <svg viewBox="0 0 300 160" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="cc-stroke" x1="0" x2="1">
            <stop offset="0" stopColor="#8b5cf6" />
            <stop offset=".6" stopColor="#ec4899" />
            <stop offset="1" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="cc-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="rgba(52,211,153,.35)" />
            <stop offset="1" stopColor="rgba(52,211,153,0)" />
          </linearGradient>
        </defs>
        <polygon className="cc-area" points={`0,160 ${pts} 300,160`} fill="url(#cc-fill)" />
        <polyline className="cc-line" points={pts} fill="none" stroke="url(#cc-stroke)" strokeWidth="3" pathLength="1" />
        <polyline points="0,150 300,150" className="cc-base" />
      </svg>
      <div className="compound-foot">
        <span>Day 1 · 1.00×</span>
        <span>Code · Capital · Health</span>
        <span>Day 365</span>
      </div>
    </div>
  );
}

function IdeaRow({ idea, i, start }) {
  const pct = useCountUp(idea.progress, start, { duration: 1400 + i * 250 });
  return (
    <li className={`idea stage-${idea.stage.toLowerCase()}`} style={{ "--i": i }}>
      <div className="idea-top">
        <div>
          <strong>{idea.name}</strong>
          <small>{idea.note}</small>
        </div>
        <span className="idea-stage">{idea.stage}</span>
      </div>
      <div className="idea-bar">
        <span style={{ width: `${pct}%` }} />
      </div>
    </li>
  );
}

export function Vision() {
  const spot = useSpotlight();
  const [boardRef, boardVisible] = useReveal({ threshold: 0.25 });
  return (
    <section id="vision" className="section">
      <SectionHead index="04" kicker="Vision" title="Engineer today. Investor & founder tomorrow.">
        Code is how I create value; capital is how I compound it. I'm building towards a life of owning
        products and investing in great ones.
      </SectionHead>

      <Reveal className="manifesto" delay={0.05}>
        {persona.manifesto.map((line, i) => (
          <span key={line} style={{ "--i": i }}>
            {line}
          </span>
        ))}
      </Reveal>

      <div className="pillars" ref={spot}>
        {persona.pillars.map((p, i) => (
          <Reveal key={p.title} className={`pillar spot-card accent-${p.accent}`} delay={i * 0.1} data-spot>
            <span className="pillar-icon">{p.icon}</span>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
            <div className="pillar-tags">
              {p.tags.map((t) => (
                <span key={t}>#{t}</span>
              ))}
            </div>
          </Reveal>
        ))}
      </div>

      <div className="vision-grid">
        <Reveal className="idea-board spot-card" delay={0.05}>
          <div className="idea-head">
            <span className="card-kicker">💡 Idea lab</span>
            <span className="idea-live">
              <i className="pulse-dot" /> pipeline
            </span>
          </div>
          <ul ref={boardRef}>
            {persona.ideas.map((idea, i) => (
              <IdeaRow key={idea.name} idea={idea} i={i} start={boardVisible} />
            ))}
          </ul>
          <p className="idea-foot">Want to build or back one of these? Let's talk ↓</p>
        </Reveal>
        <Reveal className="spot-card compound-card" delay={0.15}>
          <CompoundCurve />
        </Reveal>
      </div>
    </section>
  );
}

/* =====================================================================
   LIFE — hobbies
   ===================================================================== */

function GymCard({ h }) {
  const [idx, setIdx] = useState(0);
  const [ref, visible] = useReveal({ threshold: 0.3 });
  const reps = useCountUp(12, visible, { duration: 2400 });
  const tilt = useTilt(6);
  useEffect(() => {
    if (prefersReducedMotion() || h.photos.length < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % h.photos.length), 3800);
    return () => clearInterval(id);
  }, [h.photos.length]);
  return (
    <Reveal className="life-card gym-card" delay={0.05}>
      <div className="gym-inner tilt" ref={tilt}>
        <div className="gym-photos" ref={ref}>
          {h.photos.map((src, i) => (
            <img key={src} src={src} alt="Harshit training at the gym" loading="lazy" className={i === idx ? "on" : ""} />
          ))}
          <div className="gym-overlay" />
          <div className="gym-hud">
            <span className="hud-chip">🏋️ Set 4 · Rep {reps}/12</span>
            <span className="hud-chip live"><i /> PR mode</span>
          </div>
        </div>
        <div className="life-body">
          <span className="life-kicker">{h.kicker}</span>
          <h3>{h.title}</h3>
          <p>{h.body}</p>
          <div className="barbell" aria-hidden="true">
            <span className="plate" />
            <span className="plate small" />
            <span className="bar" />
            <span className="plate small" />
            <span className="plate" />
          </div>
        </div>
      </div>
    </Reveal>
  );
}

const DESTINATIONS = ["Mountains ⛰️", "Beaches 🏝️", "Old cities 🏰", "Road trips 🚗", "Somewhere new ✈️"];

function TravelCard({ h }) {
  const [d, setD] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => setD((x) => (x + 1) % DESTINATIONS.length), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <Reveal className="life-card travel-card spot-card" delay={0.12} data-spot>
      <svg className="travel-map" viewBox="0 0 300 150" aria-hidden="true">
        <defs>
          <pattern id="dots" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,.12)" />
          </pattern>
        </defs>
        <rect width="300" height="150" fill="url(#dots)" />
        <path id="flight" d="M30 115 Q 150 -10 270 95" className="flight-path" />
        <circle cx="30" cy="115" r="5" className="pin" />
        <circle cx="270" cy="95" r="5" className="pin pin-b" />
        <circle cx="30" cy="115" r="5" className="pin-ring" />
        <circle cx="270" cy="95" r="5" className="pin-ring b" />
        <text className="plane" dy="5">
          ✈
          <animateMotion dur="4.5s" repeatCount="indefinite" rotate="auto">
            <mpath href="#flight" />
          </animateMotion>
        </text>
      </svg>
      <div className="life-body">
        <span className="life-kicker">{h.kicker}</span>
        <h3>{h.title}</h3>
        <p>{h.body}</p>
        <div className="next-dest">
          Next up: <b key={d}>{DESTINATIONS[d]}</b>
        </div>
      </div>
    </Reveal>
  );
}

const FILM = ["🎬", "🍿", "🎞️", "🌌", "🕵️", "🚀", "🎭", "🦸"];

function MoviesCard({ h }) {
  return (
    <Reveal className="life-card movies-card spot-card" delay={0.2} data-spot>
      <div className="filmstrip" aria-hidden="true">
        <div className="film-track">
          {[..."🎬🍿🎞️🌌🕵️🚀🎭🦸🎬🍿🎞️🌌🕵️🚀🎭🦸"].filter((c) => c.trim() && c !== "️").map((e, i) => (
            <span key={i}>{e}</span>
          ))}
        </div>
      </div>
      <div className="life-body">
        <span className="life-kicker">{h.kicker}</span>
        <h3>
          <span className="clapper" aria-hidden="true">🎬</span> {h.title}
        </h3>
        <p>{h.body}</p>
        <div className="ticket">
          <span>ADMIT ONE</span>
          <span>ROW H · SEAT 7</span>
        </div>
      </div>
    </Reveal>
  );
}

export function Life() {
  const spot = useSpotlight();
  const [gym, travel, movies] = hobbies;
  return (
    <section id="life" className="section">
      <SectionHead index="07" kicker="Off the clock" title="Lift. Travel. Watch. Repeat.">
        The non-negotiables that keep me sharp outside the terminal.
      </SectionHead>
      <div className="life-grid" ref={spot}>
        <GymCard h={gym} />
        <TravelCard h={travel} />
        <MoviesCard h={movies} />
      </div>
    </section>
  );
}
