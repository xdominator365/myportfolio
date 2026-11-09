import { useEffect, useState } from "react";
import { profile } from "../data/content";
import { trackEvent } from "../lib/notify";
import { prefersReducedMotion, scrollToId, useMagnetic, useScramble, useTilt, useTypewriter } from "../hooks";

// Token stream for the live-typing editor: [className, text]
const CODE = [
  ["k", "from"], ["p", " "], ["n", "engineers"], ["p", " "], ["k", "import"], ["p", " "], ["c", "Engineer"], ["p", "\n\n"],
  ["d", "@dataclass"], ["p", "\n"],
  ["k", "class"], ["p", " "], ["c", "Harshit"], ["p", "("], ["c", "Engineer"], ["p", "):\n"],
  ["p", "    role     "], ["o", "="], ["p", " "], ["s", '"Senior Software Engineer"'], ["p", "\n"],
  ["p", "    company  "], ["o", "="], ["p", " "], ["s", '"BDO India"'], ["p", "  "], ["m", "# ex-Accenture"], ["p", "\n"],
  ["p", "    stack    "], ["o", "="], ["p", " ["], ["s", '"Python"'], ["p", ", "], ["s", '"AWS"'], ["p", ", "], ["s", '"FastAPI"'], ["p", "]\n"],
  ["p", "    certified"], ["o", "="], ["p", " "], ["s", '"AWS Developer"'], ["p", "\n"],
  ["p", "    long_game"], ["o", "="], ["p", " "], ["s", '"build → invest → compound"'], ["p", "\n\n"],
  ["p", "    "], ["k", "async def"], ["p", " "], ["f", "ship"], ["p", "("], ["n", "self"], ["p", ", idea):\n"],
  ["p", "        "], ["k", "async with"], ["p", " "], ["n", "self"], ["p", "."], ["f", "lock"], ["p", "(idea):  "], ["m", "# no race conditions"], ["p", "\n"],
  ["p", "            "], ["k", "return await"], ["p", " "], ["f", "deploy"], ["p", "(idea, scale"], ["o", "="], ["s", '"∞"'], ["p", ")"],
];
const FULL = CODE.map(([, t]) => t).join("");
const TOTAL = FULL.length;
const LINE_COUNT = FULL.split("\n").length;

function LiveCode({ start }) {
  const [n, setN] = useState(prefersReducedMotion() ? TOTAL : 0);
  useEffect(() => {
    if (!start || prefersReducedMotion()) return;
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setN(Math.min(i, TOTAL));
      if (i >= TOTAL) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [start]);

  let remaining = n;
  const out = [];
  for (let i = 0; i < CODE.length && remaining > 0; i++) {
    const [cls, text] = CODE[i];
    const slice = text.slice(0, remaining);
    remaining -= slice.length;
    out.push(<span key={i} className={`tk-${cls}`}>{slice}</span>);
  }
  const lines = (FULL.slice(0, n).match(/\n/g) || []).length + 1;

  return (
    <div className="code-body">
      <div className="code-gutter">
        {Array.from({ length: LINE_COUNT }, (_, i) => (
          <span key={i} className={i < lines ? "on" : ""}>{i + 1}</span>
        ))}
      </div>
      <pre>
        <code>
          {out}
          <span className="code-caret" />
        </code>
      </pre>
    </div>
  );
}

export default function Hero({ ready }) {
  const first = useScramble(profile.firstName.toUpperCase(), { start: ready, delay: 150 });
  const last = useScramble(profile.lastName.toUpperCase(), { start: ready, delay: 450 });
  const role = useTypewriter(profile.roles);
  const tiltRef = useTilt(12);
  const cta1 = useMagnetic(0.3);
  const cta2 = useMagnetic(0.3);

  return (
    <section id="home" className={`hero ${ready ? "is-ready" : ""}`}>
      <div className="hero-left">
        <div className="hero-badge reveal-up" style={{ "--d": "0.1s" }}>
          <span className="pulse-dot" />
          Currently engineering at <strong>{profile.company}</strong>
        </div>

        <p className="hero-hello reveal-up" style={{ "--d": "0.2s" }}>
          <span className="wave">👋</span> Hello, world — I'm
        </p>

        <h1 className="hero-name" aria-label={profile.name}>
          <span className="name-line grad-anim" data-text={first}>{first || " "}</span>
          <span className="name-line outline" data-text={last}>{last || " "}</span>
        </h1>

        <div className="hero-role reveal-up" style={{ "--d": "0.6s" }}>
          <span className="role-prompt">~/harshit $</span>
          <span className="role-text">{role}</span>
          <span className="caret" />
        </div>

        <p className="hero-sub reveal-up" style={{ "--d": "0.75s" }}>
          I build <em>scalable backend systems</em> with Python and AWS — APIs that stay fast under load,
          and data that stays consistent when a thousand requests hit at once. Next: products of my own.
        </p>

        <div className="hero-ctas reveal-up" style={{ "--d": "0.9s" }}>
          <button ref={cta1} className="btn btn-primary" onClick={() => scrollToId("projects")} data-cursor="Explore">
            <span>View my work</span>
            <span className="btn-arrow">→</span>
          </button>
          <a ref={cta2} className="btn btn-ghost" href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" data-cursor="PDF" onClick={() => trackEvent("📄 Someone opened your résumé")}>
            <span>Download résumé</span>
            <span className="btn-arrow">⇩</span>
          </a>
        </div>

        <div className="hero-meta reveal-up" style={{ "--d": "1.05s" }}>
          <span><b>{profile.yearsOfExperience}+</b> yrs experience</span>
          <span className="sep" />
          <span><b>AWS</b> Certified Developer</span>
          <span className="sep" />
          <span><b>📍</b> {profile.location}</span>
        </div>
      </div>

      <div className="hero-right reveal-scale" style={{ "--d": "0.5s" }}>
        <div className="code-card tilt" ref={tiltRef}>
          <div className="code-glow" />
          <div className="code-head">
            <span className="dots"><i /><i /><i /></span>
            <span className="code-tab">harshit.py</span>
            <span className="code-status">● live</span>
          </div>
          <LiveCode start={ready} />
          <div className="code-foot">
            <span>Python 3.12</span>
            <span>UTF-8</span>
            <span className="ok">✓ 0 problems</span>
          </div>
          <div className="float-chip chip-a">λ AWS Lambda</div>
          <div className="float-chip chip-b">⚡ FastAPI</div>
          <div className="float-chip chip-c">🔒 Thread-safe</div>
        </div>
      </div>

      <button className="scroll-cue" onClick={() => scrollToId("about")} aria-label="Scroll to About">
        <span className="mouse"><span /></span>
        <small>scroll</small>
      </button>
    </section>
  );
}
