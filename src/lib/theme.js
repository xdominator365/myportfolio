/**
 * Light / dark theme.
 *
 * index.html sets data-theme on <html> before first paint (no flash). This
 * module owns everything after that: toggling, persistence, following the OS
 * while the visitor hasn't chosen, and the "sunrise" transition — a circle
 * that grows out of the toggle using the View Transitions API, with a plain
 * cross-fade fallback where that API doesn't exist.
 */
const KEY = "hy-theme";
const COLORS = { dark: "#07060f", light: "#f5f3fa" };

const root = () => document.documentElement;
export const currentTheme = () => (root().dataset.theme === "light" ? "light" : "dark");

const stored = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

function apply(theme) {
  root().dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", COLORS[theme]);
  document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", theme);
  window.dispatchEvent(new CustomEvent("hy:theme", { detail: theme }));
}

export function setTheme(theme, origin) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* private mode: the choice just won't persist */
  }
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!document.startViewTransition || reduced) {
    root().classList.add("theme-fading");
    apply(theme);
    setTimeout(() => root().classList.remove("theme-fading"), 450);
    return;
  }

  const x = origin?.x ?? innerWidth - 40;
  const y = origin?.y ?? 40;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const t = document.startViewTransition(() => apply(theme));
  t.ready.then(() => {
    root().animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" }
    );
  });
}

/** Follow the OS setting until the visitor makes an explicit choice. */
export function followSystem() {
  const mq = matchMedia("(prefers-color-scheme: light)");
  const onChange = (e) => {
    if (!stored()) apply(e.matches ? "light" : "dark");
  };
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
