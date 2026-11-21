import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { posts } from "../data/posts";
import { profile } from "../data/content";
import { useSpotlight } from "../hooks";
import { Reveal, SectionHead } from "./Sections";
import "../styles/writing.css";

const fmtDate = (d) => new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/**
 * The essay's waveform: one bar per block, height ∝ √words, coloured by kind.
 * You can tell a story post from a code walkthrough before reading a word.
 */
function Shape({ blocks }) {
  const max = Math.max(...blocks.map((b) => b.size), 1);
  const w = 4;
  const gap = 2;
  return (
    <svg className="post-shape" viewBox={`0 0 ${blocks.length * (w + gap)} 28`} preserveAspectRatio="none" aria-hidden="true">
      {blocks.map((b, i) => {
        const h = b.type === "heading" ? 28 : 3 + Math.sqrt(b.size / max) * 22;
        return <rect key={i} x={i * (w + gap)} y={28 - h} width={w} height={h} rx="1.5" className={`shape-${b.type}`} style={{ "--i": i }} />;
      })}
    </svg>
  );
}

function Reader({ post, onClose, onOpen }) {
  const scrollRef = useRef(null);
  const closeRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const next = posts[(posts.indexOf(post) + 1) % posts.length];

  useEffect(() => {
    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      removeEventListener("keydown", onKey);
      prevFocus?.focus?.();
    };
  }, [onClose]);

  useEffect(() => {
    const el = scrollRef.current;
    el.scrollTop = 0;
    setProgress(0);
  }, [post]);

  const onScroll = (e) => {
    const el = e.currentTarget;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? el.scrollTop / max : 1);
  };

  const left = Math.ceil(post.reading.minutes * (1 - progress));
  const subject = encodeURIComponent(`Re: ${post.title}`);

  return (
    <div className="reader" role="dialog" aria-modal="true" aria-labelledby="reader-title">
      <div className="reader-bar" style={{ transform: `scaleX(${progress})` }} />
      <div className="reader-top">
        <span className="reader-left" aria-live="off">
          {progress > 0.98 ? "✓ finished" : `${left} min left`}
        </span>
        <button ref={closeRef} className="reader-close" onClick={onClose} aria-label="Close article">
          <span>esc</span> ✕
        </button>
      </div>
      <div className="reader-scroll" ref={scrollRef} onScroll={onScroll}>
        <article className="reader-article">
          <header>
            <div className="post-tags">
              {post.tags.map((t) => (
                <span key={t}>#{t}</span>
              ))}
            </div>
            <h1 id="reader-title">{post.title}</h1>
            <p className="reader-meta">
              {profile.name} · {fmtDate(post.date)} · {post.reading.minutes} min read
              {post.reading.codeLines > 0 && ` · ${post.reading.codeLines} lines of code`}
            </p>
          </header>
          <div className="md" dangerouslySetInnerHTML={{ __html: post.html }} />
          <footer className="reader-foot">
            <p>Thoughts, disagreements, war stories of your own?</p>
            <div className="reader-actions">
              <a className="btn btn-primary btn-sm" href={`mailto:${profile.email}?subject=${subject}`}>
                <span>Reply by email</span>
                <span className="btn-arrow">✉</span>
              </a>
              {next !== post && (
                <button className="btn btn-ghost btn-sm" onClick={() => onOpen(next)}>
                  <span>Next: {next.title}</span>
                  <span className="btn-arrow">→</span>
                </button>
              )}
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}

export default function Writing() {
  const spot = useSpotlight();
  const [open, setOpen] = useState(null);
  if (!posts.length) return null;

  return (
    <section id="writing" className="section">
      <SectionHead index="05" kicker="Writing" title="Thinking in public.">
        Notes from production, side projects and the long game — written down so I have to think them through.
      </SectionHead>

      <div className="posts" ref={spot}>
        {posts.map((p, i) => (
          <Reveal key={p.slug} as="article" className={`post-card spot-card ${i === 0 ? "featured" : ""}`} delay={i * 0.08} data-spot>
            <button className="post-hit" onClick={() => setOpen(p)} aria-label={`Read: ${p.title}`} data-cursor="Read" />
            <div className="post-meta">
              <time dateTime={p.date}>{fmtDate(p.date)}</time>
              <span>{p.reading.minutes} min read</span>
            </div>
            <h3>{p.title}</h3>
            {i === 0 && p.lede && <blockquote className="post-lede">{p.lede}</blockquote>}
            <p>{p.summary}</p>
            <div className="post-foot">
              <div className="post-tags">
                {p.tags.map((t) => (
                  <span key={t}>#{t}</span>
                ))}
              </div>
              <Shape blocks={p.blocks} />
            </div>
          </Reveal>
        ))}
      </div>

      {/* Portal: <main> is its own stacking context, so the reader must live on <body> to cover the nav. */}
      {open && createPortal(<Reader post={open} onClose={() => setOpen(null)} onOpen={setOpen} />, document.body)}
    </section>
  );
}
