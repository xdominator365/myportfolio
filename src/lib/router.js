/**
 * Hash routing for a single-scroll page.
 *
 * - The URL follows the reader: as sections scroll into view the hash is
 *   *replaced* (no history spam), and the tab title names the section — so a
 *   copied URL or a shared tab always points at what you were looking at.
 * - Deliberate jumps (nav, ⌘K, CTAs) *push* an entry, so Back/Forward walk
 *   through the sections you actually visited.
 * - While a programmatic smooth-scroll is in flight, scroll-spy is muted;
 *   otherwise it would rewrite the URL with every section it flies past.
 * - On arrival the section head plays a short "you are here" sweep.
 */
import { useEffect } from "react";
import "../styles/routing.css";

const HOME = "home";
const BASE_TITLE = typeof document !== "undefined" ? document.title : "";
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let navigating = false;
let syncEnabled = false;
let idleTimer = 0;
const labels = new Map();

const urlFor = (id) => (id === HOME ? location.pathname + location.search : `#${id}`);
const currentId = () => decodeURIComponent(location.hash.slice(1)) || HOME;
const titleFor = (id) => (id === HOME || !labels.has(id) ? BASE_TITLE : `${labels.get(id)} — Harshit Yadav`);

function arrive(el) {
  const head = el.querySelector(".section-head");
  if (!head || reduced()) return;
  head.classList.remove("is-arrived");
  void head.offsetWidth; // restart the animation if it's already running
  head.classList.add("is-arrived");
  setTimeout(() => head.classList.remove("is-arrived"), 1600);
}

/** Resolve once scrolling has been idle for a beat (smooth-scroll finished). */
function whenScrollSettles(cb) {
  const settle = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      window.removeEventListener("scroll", settle);
      cb();
    }, 140);
  };
  window.addEventListener("scroll", settle, { passive: true });
  settle();
}

export function navigateTo(id, { push = true } = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  if (push && currentId() !== id) history.pushState({ section: id }, "", urlFor(id));
  document.title = titleFor(id);
  navigating = true;
  el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth" });
  whenScrollSettles(() => {
    navigating = false;
    arrive(el);
  });
}

/**
 * Wire the page to the URL. `sections` is [{ id, label }], `active` comes from
 * the scroll-spy, `ready` flips once the preloader has released the page.
 */
export function useHashRouting(sections, active, ready) {
  useEffect(() => {
    sections.forEach((s) => labels.set(s.id, s.label));
  }, [sections]);

  // Deep link on first load: wait until the page can actually scroll.
  useEffect(() => {
    if (!ready) return;
    const id = currentId();
    if (id !== HOME && document.getElementById(id)) {
      history.scrollRestoration = "manual";
      navigateTo(id, { push: false });
      whenScrollSettles(() => (syncEnabled = true));
    } else syncEnabled = true;

    const onPop = () => navigateTo(currentId(), { push: false });
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [ready]);

  // Scroll-spy → URL (replace, never push).
  useEffect(() => {
    if (!syncEnabled || navigating || !active || currentId() === active) return;
    history.replaceState({ section: active }, "", urlFor(active));
    document.title = titleFor(active);
  }, [active]);
}

/** Absolute, shareable URL for a section. */
export const sectionUrl = (id) => `${location.origin}${location.pathname}${id === HOME ? "" : `#${id}`}`;
