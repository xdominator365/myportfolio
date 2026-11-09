import { useState } from "react";
import {
  certifications,
  education,
  experience,
  interests,
  marquee,
  profile,
  projects,
  skills,
  socials,
  stats,
  testimonial,
  timeline,
} from "../data/content";
import { useClock, useCountUp, useMagnetic, useReveal, useSpotlight, useTilt } from "../hooks";
import { ArchitectureDiagram, TradingChart } from "./ProjectVisuals";
import { sendMessage, trackEvent } from "../lib/notify";

/* ---------- shared ---------- */

export function SectionHead({ index, kicker, title, children }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={`section-head ${visible ? "is-visible" : ""}`}>
      <span className="kicker">
        <span className="kicker-index">{index}</span>
        <span className="kicker-line" />
        {kicker}
      </span>
      <h2 className="section-title">
        {title.split(" ").map((word, i) => (
          <span className="word" key={i}>
            <span style={{ "--i": i }}>{word}&nbsp;</span>
          </span>
        ))}
      </h2>
      {children && <p className="section-lede">{children}</p>}
    </div>
  );
}

export function Reveal({ as: Tag = "div", className = "", delay = 0, children, ...rest }) {
  const [ref, visible] = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${visible ? "is-visible" : ""} ${className}`} style={{ "--d": `${delay}s` }} {...rest}>
      {children}
    </Tag>
  );
}

/* ---------- marquee ---------- */

export function Marquee() {
  const row = [...marquee, ...marquee];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {row.map((t, i) => (
          <span key={i}>
            {t}
            <i>✦</i>
          </span>
        ))}
      </div>
      <div className="marquee-track reverse">
        {row.map((t, i) => (
          <span key={i} className="outline-text">
            {t}
            <i>✦</i>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- about ---------- */

function Stat({ s, start, i }) {
  const v = useCountUp(s.value, start, { decimals: s.decimals || 0, duration: 1600 + i * 200 });
  return (
    <div className="stat">
      <strong className="grad-text">
        {s.prefix}
        {s.decimals ? v.toFixed(s.decimals) : v.toLocaleString("en-IN")}
        {s.suffix}
      </strong>
      <span>{s.label}</span>
    </div>
  );
}

function PhotoStack() {
  const photos = profile.photos;
  const [front, setFront] = useState(0);
  const tilt = useTilt(8);
  const next = () => setFront((f) => (f + 1) % photos.length);
  return (
    <div className="photo-stack" data-count={photos.length}>
      {photos.map((src, i) => {
        const pos = (i - front + photos.length) % photos.length;
        return (
          <div
            key={src}
            className={`portrait ${pos === 0 ? "tilt is-front" : "is-back"}`}
            ref={pos === 0 ? tilt : undefined}
            style={{ "--pos": pos }}
            onClick={photos.length > 1 ? next : undefined}
            data-cursor={photos.length > 1 ? (pos === 0 ? "Shuffle" : "Bring up") : undefined}
          >
            <div className="portrait-border" />
            <img src={src} alt={`Photo of ${profile.name}`} loading="lazy" />
            <div className="portrait-shine" />
            {pos === 0 && (
              <div className="portrait-tag">
                <span className="pulse-dot" />
                <div>
                  <strong>{profile.name}</strong>
                  <small>{profile.title} · {profile.company}</small>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {photos.length > 1 && (
        <div className="stack-dots">
          {photos.map((_, i) => (
            <button key={i} className={i === front ? "on" : ""} onClick={() => setFront(i)} aria-label={`Show photo ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export function About() {
  const [statsRef, statsVisible] = useReveal({ threshold: 0.4 });
  return (
    <section id="about" className="section">
      <SectionHead index="01" kicker="About" title="Engineer who sweats the edge cases.">
        I like the hard parts of engineering — the race condition that only shows up at 2 a.m.,
        the endpoint that needs to be ten times faster, the deploy that should never need a human.
        And I like building things that outlast the sprint.
      </SectionHead>

      <div className="about-grid">
        <Reveal className="portrait-wrap" delay={0.1}>
          <PhotoStack />
        </Reveal>

        <div className="about-copy">
          <Reveal delay={0.15} className="terminal">
            <div className="terminal-head">
              <span className="dots"><i /><i /><i /></span>
              <span>zsh — whoami</span>
            </div>
            <div className="terminal-body">
              <p><span className="t-prompt">❯</span> whoami</p>
              <p className="t-out">{profile.name} — {profile.title.toLowerCase()} @ {profile.company.toLowerCase()}</p>
              <p><span className="t-prompt">❯</span> cat intro.md</p>
              {profile.intro.map((line, i) => (
                <p key={i} className="t-out">
                  <span className="t-bullet">▹</span> {line}
                </p>
              ))}
              <p><span className="t-prompt">❯</span> <span className="caret" /></p>
            </div>
          </Reveal>

          <div ref={statsRef} className={`stats ${statsVisible ? "is-visible" : ""}`}>
            {stats.map((s, i) => (
              <Stat key={s.label} s={s} start={statsVisible} i={i} />
            ))}
          </div>

          <Reveal delay={0.2} className="about-links">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="link-chip" data-cursor="Open">
                <span>{s.label}</span>
                <small>@{s.handle}</small>
                <span className="arrow">↗</span>
              </a>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- experience ---------- */

export function Experience() {
  const [lineRef, lineVisible] = useReveal({ threshold: 0.1 });
  const [active, setActive] = useState(0);
  const job = experience[active];
  const tilt = useTilt(4);
  return (
    <section id="experience" className="section">
      <SectionHead index="02" kicker="Experience" title="Where I ship things.">
        Production systems, real users, on-call reality. {profile.yearsOfExperience}+ years and counting.
      </SectionHead>

      <div className="exp-grid">
        <Reveal className="job-card-wrap" delay={0.05}>
          <div className="job-tabs" role="tablist" style={{ "--active": active, "--count": experience.length }}>
            <span className="job-tabs-indicator" />
            {experience.map((j, i) => (
              <button
                key={j.id}
                role="tab"
                aria-selected={i === active}
                className={i === active ? "is-active" : ""}
                onClick={() => setActive(i)}
              >
                {j.current && <span className="pulse-dot" />}
                {j.company}
              </button>
            ))}
          </div>
          <article className="job-card tilt spot-card" ref={tilt} key={job.id}>
            <div className="job-head">
              <div className="job-logo" style={{ background: job.logoBg }}>{job.logo}</div>
              <div>
                <h3>{job.role}</h3>
                <p className="job-company">
                  {job.company}
                  {job.unit && <span className="job-unit"> · {job.unit}</span>}
                  <span className="job-place"> · {job.place}</span>
                </p>
              </div>
              <span className={`job-period ${job.current ? "" : "past"}`}>
                {job.current && <span className="pulse-dot" />}
                {job.period}
              </span>
            </div>
            {job.summary && <p className="job-summary">{job.summary}</p>}
            {job.highlights.length > 0 && (
              <ul className="job-list">
                {job.highlights.map((h, i) => (
                  <li key={i} className={`accent-${h.accent}`} style={{ "--i": i }}>
                    <span className="job-tag">{h.tag}</span>
                    <span>{h.text}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="chips">
              {job.stack.map((s) => (
                <span key={s} className="chip">{s}</span>
              ))}
            </div>
          </article>
        </Reveal>

        <div ref={lineRef} className={`timeline ${lineVisible ? "is-visible" : ""}`}>
          <div className="timeline-line"><span /></div>
          {timeline.map((t, i) => (
            <div className="t-item" key={t.title} style={{ "--i": i }}>
              <span className="t-node" />
              <span className="t-year">{t.year}</span>
              <strong>{t.title}</strong>
              <small>{t.place}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- projects ---------- */

function ProjectCard({ p, i }) {
  const tilt = useTilt(5);
  const magnetic = useMagnetic(0.25);
  return (
    <Reveal className={`project ${i % 2 ? "flip" : ""}`} delay={0.05}>
      <div className="project-visual tilt" ref={tilt}>
        {p.visual === "chart" ? <TradingChart /> : <ArchitectureDiagram />}
      </div>
      <div className="project-body">
        <div className="project-meta">
          <span className="project-num">0{i + 1}</span>
          <span>{p.date}</span>
        </div>
        <h3 className="project-name">
          <span className="grad-anim">{p.name}</span>
        </h3>
        <p className="project-tagline">{p.tagline}</p>
        <p className="project-desc">{p.description}</p>
        <ul className="project-list">
          {p.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
        <div className="chips">
          {p.stack.map((s) => (
            <span key={s} className="chip">{s}</span>
          ))}
        </div>
        {p.link ? (
          <a ref={magnetic} href={p.link} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" data-cursor="Code">
            <span>View source on GitHub</span>
            <span className="btn-arrow">↗</span>
          </a>
        ) : (
          <span className="private-note">🔒 Enterprise project — source is private</span>
        )}
      </div>
    </Reveal>
  );
}

export function Projects() {
  return (
    <section id="projects" className="section">
      <SectionHead index="03" kicker="Projects" title="Selected work.">
        Live widgets, not screenshots. The visuals below are animated simulations of what each system does.
      </SectionHead>
      <div className="projects">
        {projects.map((p, i) => (
          <ProjectCard key={p.id} p={p} i={i} />
        ))}
      </div>
    </section>
  );
}

/* ---------- skills ---------- */

export function Skills() {
  const spot = useSpotlight();
  return (
    <section id="skills" className="section">
      <SectionHead index="05" kicker="Toolbox" title="The stack I reach for.">
        Python on the backend, AWS underneath, React on top — and the tooling to prove it all works under load.
      </SectionHead>
      <div className="bento" ref={spot}>
        {skills.map((g, i) => (
          <Reveal key={g.group} className={`bento-card accent-${g.accent} ${i === 0 ? "wide" : ""}`} delay={i * 0.07} data-spot>
            <div className="bento-glow" />
            <span className="bento-index">0{i + 1}</span>
            <h3>{g.group}</h3>
            <div className="bento-items">
              {g.items.map((it, j) => (
                <span key={it} style={{ "--j": j }}>{it}</span>
              ))}
            </div>
          </Reveal>
        ))}
        <Reveal className="bento-card orbit-card" delay={0.45} data-spot>
          <div className="orbit">
            <div className="orbit-core">
              <span>🐍</span>
            </div>
            <div className="orbit-ring r1"><span>λ</span><span>⚛</span></div>
            <div className="orbit-ring r2"><span>☁</span><span>⛁</span><span>⚙</span></div>
          </div>
          <p>Python at the core, everything else in orbit.</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- credentials (certs + education + interests + testimonial) ---------- */

export function Credentials() {
  const tilt = useTilt(14);
  const spot = useSpotlight();
  const interestsSpot = useSpotlight();
  const { featured, others } = certifications;
  return (
    <section id="credentials" className="section">
      <SectionHead index="06" kicker="Credentials" title="Verified, certified, graduated." />

      <div className="cred-grid">
        <Reveal className="aws-wrap" delay={0.05}>
          <a href={featured.href} target="_blank" rel="noopener noreferrer" className="aws-card tilt" ref={tilt} data-cursor="Verify">
            <div className="holo" />
            <div className="aws-top">
              <span className="aws-logo">aws</span>
              <span className="aws-verified">✓ Verified</span>
            </div>
            <div className="aws-badge">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <polygon points="50,4 92,27 92,73 50,96 8,73 8,27" />
              </svg>
              <span>DVA</span>
            </div>
            <h3>{featured.name}</h3>
            <p>{featured.issuer}</p>
            <div className="aws-foot">
              <span>Valid {featured.validity}</span>
              <span>View certificate ↗</span>
            </div>
          </a>
        </Reveal>

        <div className="cred-side" ref={spot}>
          <Reveal className="edu-card spot-card" delay={0.1} data-spot>
            <span className="card-kicker">🎓 Education</span>
            <h3>{education.degree}</h3>
            <p>{education.school}</p>
            <div className="edu-foot">
              <span>{education.period}</span>
              <span className="cgpa">
                CGPA <b className="grad-text">{education.cgpa}</b>
              </span>
            </div>
          </Reveal>

          <Reveal className="awards spot-card" delay={0.18} data-spot>
            <span className="card-kicker">🏆 Achievements</span>
            <ul>
              {others.map((o, i) => (
                <li key={o.name} style={{ "--i": i }}>
                  <strong>{o.name}</strong>
                  <span>{o.detail}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>

      <div className="interests" ref={interestsSpot}>
        {interests.map((it, i) => (
          <Reveal key={it.title} className="interest spot-card" delay={i * 0.08} data-spot>
            <span className="interest-num">/0{i + 1}</span>
            <h4>{it.title}</h4>
            <p>{it.body}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="quote-card" delay={0.1}>
        <span className="quote-mark">“</span>
        <blockquote>{testimonial.quote}</blockquote>
        <a href={testimonial.href} target="_blank" rel="noopener noreferrer" className="quote-author">
          — {testimonial.author} ↗
        </a>
      </Reveal>
    </section>
  );
}

/* ---------- contact + footer ---------- */

function ContactForm({ toast }) {
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.website) return setStatus("sent"); // honeypot: bots fill hidden fields
    const last = Number(sessionStorage.getItem("hy-last-msg") || 0);
    if (Date.now() - last < 30000) return toast("Easy there — give it 30 seconds between messages");
    setStatus("sending");
    try {
      await sendMessage(form);
      sessionStorage.setItem("hy-last-msg", String(Date.now()));
      setStatus("sent");
      toast("Message delivered straight to my phone 📲");
      setForm({ name: "", email: "", message: "", website: "" });
    } catch {
      setStatus("error");
    }
  };

  const waText = encodeURIComponent(
    form.message ? `Hi Harshit! ${form.name ? `I'm ${form.name}. ` : ""}${form.message}` : "Hi Harshit! I came across your portfolio and wanted to connect."
  );

  return (
    <form className={`contact-form is-${status}`} onSubmit={submit}>
      <div className="form-row">
        <label className="field">
          <input required maxLength={80} value={form.name} onChange={set("name")} placeholder=" " autoComplete="name" />
          <span>Your name</span>
        </label>
        <label className="field">
          <input type="email" maxLength={120} value={form.email} onChange={set("email")} placeholder=" " autoComplete="email" />
          <span>Email (so I can reply)</span>
        </label>
      </div>
      <label className="field">
        <textarea required minLength={5} maxLength={2000} rows={4} value={form.message} onChange={set("message")} placeholder=" " />
        <span>What's on your mind?</span>
      </label>
      <input className="hp" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} aria-hidden="true" />
      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={status === "sending"} data-cursor="Send">
          <span>{status === "sending" ? "Sending…" : status === "sent" ? "Sent — thank you!" : "Send message"}</span>
          <span className="btn-arrow">{status === "sent" ? "✓" : "➤"}</span>
        </button>
        <a
          className="btn btn-whatsapp"
          href={`https://wa.me/${profile.whatsapp}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="Chat"
          onClick={() => trackEvent("💚 WhatsApp chat opened from portfolio")}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
          </svg>
          <span>WhatsApp me</span>
        </a>
      </div>
      {status === "error" && (
        <p className="form-error">
          Couldn't send right now — please use WhatsApp or email <a href={`mailto:${profile.email}`}>{profile.email}</a>.
        </p>
      )}
    </form>
  );
}

export function Contact({ toast }) {
  const big = useMagnetic(0.2);
  const time = useClock(profile.timezone);
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(profile.email).then(() => {
      setCopied(true);
      toast("Email copied — talk soon!");
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <section id="contact" className="section contact">
      <SectionHead index="08" kicker="Contact" title="Let's build something that scales." />
      <Reveal className="contact-card" delay={0.1}>
        <div className="contact-glow" />
        <div className="contact-split">
          <div className="contact-left">
            <p className="contact-lede">
              A role, a product idea, an investment conversation, or a gnarly backend problem — drop a message.
              It lands on my phone instantly.
            </p>
            <a ref={big} href={`mailto:${profile.email}`} className="contact-email" data-cursor="Say hi">
              <span className="grad-anim">{profile.email}</span>
            </a>
            <div className="contact-actions">
              <button className="btn btn-ghost btn-sm" onClick={copy} data-cursor="Copy">
                <span>{copied ? "Copied ✓" : "Copy email"}</span>
                <span className="btn-arrow">⧉</span>
              </button>
              <a className="btn btn-ghost btn-sm" href={`tel:${profile.phone.replace(/-/g, "")}`}>
                <span>{profile.phone}</span>
                <span className="btn-arrow">☏</span>
              </a>
            </div>
          </div>
          <ContactForm toast={toast} />
        </div>
        <div className="contact-meta">
          <span><i className="pulse-dot" /> {profile.location} · IST {time}</span>
          <div className="contact-socials">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                {s.label} ↗
              </a>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  const built = new Date(__BUILD_DATE__).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return (
    <footer className="footer">
      <div className="footer-big" aria-hidden="true">
        <span className="outline-text">HARSHIT</span>
      </div>
      <div className="footer-row">
        <span>© {new Date().getFullYear()} {profile.name}. Designed & engineered by hand. Anonymous visit stats are collected.</span>
        <span className="footer-build">
          <i className="pulse-dot" /> build <code>{__COMMIT__}</code> · {built}
        </span>
        <span>React · Vite · Canvas · zero UI libraries</span>
      </div>
    </footer>
  );
}
