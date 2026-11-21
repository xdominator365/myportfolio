import { useEffect, useState } from "react";
import { currentTheme, followSystem, setTheme } from "../lib/theme";
import "../styles/theme-light.css";

/**
 * Sun ⇄ moon as an eclipse: a mask circle slides across the sun to carve the
 * crescent, and the rays retract as night falls.
 */
export default function ThemeToggle() {
  const [theme, setLocal] = useState(currentTheme);

  useEffect(() => {
    const onTheme = (e) => setLocal(e.detail);
    window.addEventListener("hy:theme", onTheme);
    const stop = followSystem();
    return () => {
      window.removeEventListener("hy:theme", onTheme);
      stop();
    };
  }, []);

  const next = theme === "light" ? "dark" : "light";
  const toggle = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTheme(next, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  return (
    <button
      className={`theme-toggle is-${theme}`}
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={theme === "light" ? "Lights off" : "Lights on"}
      data-cursor={theme === "light" ? "Night" : "Day"}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <mask id="eclipse">
          <rect width="24" height="24" fill="#fff" />
          <circle className="tt-mask" cx="24" cy="2" r="7" fill="#000" />
        </mask>
        <circle className="tt-core" cx="12" cy="12" r="5" mask="url(#eclipse)" />
        <g className="tt-rays">
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1="12" y1="1.8" x2="12" y2="4" transform={`rotate(${i * 45} 12 12)`} />
          ))}
        </g>
      </svg>
    </button>
  );
}
