import { useEffect, useRef, useState } from "react";
import { scrollToId, useActiveSection } from "../hooks";

export const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "credentials", label: "Credentials" },
  { id: "contact", label: "Contact" },
];
const IDS = SECTIONS.map((s) => s.id);

export default function Nav({ onOpenPalette }) {
  const active = useActiveSection(IDS);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const linksRef = useRef(null);
  const [pill, setPill] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      setScrolled(scrollY > 30);
      setProgress(max > 0 ? scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = linksRef.current?.querySelector(`[data-id="${active}"]`);
    if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active]);

  const go = (id) => {
    setOpen(false);
    scrollToId(id);
  };

  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <>
      <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />
      <header className={`nav ${scrolled ? "is-scrolled" : ""}`}>
        <button className="nav-logo" onClick={() => go("home")} aria-label="Back to top">
          <span className="logo-mark">
            <span>H</span>
            <span>Y</span>
          </span>
          <span className="logo-text">
            harshit<span className="grad-text">.dev</span>
          </span>
        </button>

        <nav className="nav-links" ref={linksRef} aria-label="Primary">
          <span className="nav-pill" style={{ transform: `translateX(${pill.left}px)`, width: pill.width }} />
          {SECTIONS.slice(1).map((s) => (
            <button
              key={s.id}
              data-id={s.id}
              className={active === s.id ? "is-active" : ""}
              onClick={() => go(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="kbd-btn" onClick={onOpenPalette} data-cursor="Search" aria-label="Open command palette">
            <kbd>{isMac ? "⌘" : "Ctrl"}</kbd>
            <kbd>K</kbd>
          </button>
          <button
            className={`burger ${open ? "is-open" : ""}`}
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={`mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open}>
        {SECTIONS.map((s, i) => (
          <button key={s.id} style={{ "--i": i }} onClick={() => go(s.id)} tabIndex={open ? 0 : -1}>
            <small>0{i + 1}</small>
            {s.label}
          </button>
        ))}
      </div>
    </>
  );
}
