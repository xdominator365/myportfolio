import { useEffect, useMemo, useRef, useState } from "react";
import { scrollToId } from "../hooks";
import { SECTIONS } from "./Nav";
import { profile, socials } from "../data/content";

/** ⌘K / Ctrl+K command palette — fuzzy-ish filter, arrow-key navigation. */
export default function CommandPalette({ open, setOpen, toast }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);

  const commands = useMemo(
    () => [
      ...SECTIONS.map((s) => ({ group: "Navigate", label: `Go to ${s.label}`, icon: "↳", run: () => scrollToId(s.id) })),
      {
        group: "Actions",
        label: "Copy email address",
        icon: "⧉",
        run: () => navigator.clipboard?.writeText(profile.email).then(() => toast("Email copied to clipboard")),
      },
      { group: "Actions", label: "Download résumé (PDF)", icon: "⇩", run: () => window.open(profile.resumeUrl, "_blank") },
      { group: "Actions", label: "Send an email", icon: "✉", run: () => (location.href = `mailto:${profile.email}`) },
      ...socials.map((s) => ({ group: "Links", label: `Open ${s.label}`, icon: "↗", run: () => window.open(s.href, "_blank") })),
      {
        group: "Links",
        label: "View this site's source",
        icon: "</>",
        run: () => window.open("https://github.com/xdominator365/myportfolio", "_blank"),
      },
    ],
    [toast]
  );

  const filtered = commands.filter((c) => {
    const needle = q.toLowerCase().trim();
    if (!needle) return true;
    const hay = c.label.toLowerCase();
    let i = 0;
    for (const ch of hay) if (ch === needle[i]) i++;
    return hay.includes(needle) || i === needle.length;
  });

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen((o) => !o);
      } else if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      inputRef.current?.focus();
    } else inputRef.current?.blur();
  }, [open]);

  useEffect(() => setIdx(0), [q]);

  const run = (c) => {
    setOpen(false);
    setTimeout(c.run, 120);
  };

  const onInputKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && filtered[idx]) run(filtered[idx]);
  };

  let lastGroup = null;
  return (
    <div className={`palette-backdrop ${open ? "is-open" : ""}`} onClick={() => setOpen(false)} aria-hidden={!open}>
      <div className="palette" role="dialog" aria-label="Command palette" onClick={(e) => e.stopPropagation()}>
        <div className="palette-input">
          <span className="grad-text">❯</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Type a command or search…"
            aria-label="Search commands"
            tabIndex={open ? 0 : -1}
          />
          <kbd>esc</kbd>
        </div>
        <ul className="palette-list">
          {filtered.length === 0 && <li className="palette-empty">No results for “{q}”</li>}
          {filtered.map((c, i) => {
            const header = c.group !== lastGroup ? (lastGroup = c.group) : null;
            return (
              <li key={c.label}>
                {header && <div className="palette-group">{header}</div>}
                <button
                  className={i === idx ? "is-active" : ""}
                  onMouseEnter={() => setIdx(i)}
                  onClick={() => run(c)}
                  tabIndex={open ? 0 : -1}
                >
                  <span className="palette-icon">{c.icon}</span>
                  {c.label}
                  {i === idx && <kbd>↵</kbd>}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="palette-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> select</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
