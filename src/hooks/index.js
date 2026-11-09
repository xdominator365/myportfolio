import { useEffect, useRef, useState, useCallback } from "react";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isTouch = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

/** Adds `is-visible` to the element once it scrolls into view. */
export function useReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: options.threshold ?? 0.06, rootMargin: options.rootMargin ?? "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [options.threshold, options.rootMargin]);
  return [ref, visible];
}

/** Animated number that counts up once `start` becomes true. */
export function useCountUp(target, start, { duration = 1800, decimals = 0 } = {}) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (prefersReducedMotion()) return setValue(target);
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setValue(Number((target * eased).toFixed(decimals)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration, decimals]);
  return value;
}

/** 3D tilt + spotlight position on pointer move. Writes CSS vars on the element. */
export function useTilt(max = 10) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || isTouch() || prefersReducedMotion()) return;
    let raf;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--rx", `${(0.5 - y) * max}deg`);
        el.style.setProperty("--ry", `${(x - 0.5) * max}deg`);
        el.style.setProperty("--mx", `${x * 100}%`);
        el.style.setProperty("--my", `${y * 100}%`);
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [max]);
  return ref;
}

/** Spotlight only (no tilt) — for grids of cards. */
export function useSpotlight() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || isTouch()) return;
    const onMove = (e) => {
      for (const card of el.querySelectorAll("[data-spot]")) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);
  return ref;
}

/** Element drifts toward the cursor while hovered. */
export function useMagnetic(strength = 0.35) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || isTouch() || prefersReducedMotion()) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    };
    const onLeave = () => (el.style.transform = "");
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);
  return ref;
}

const GLYPHS = "!<>-_\\/[]{}—=+*^?#01ABCDEFXYZλ$%&";

/** Text that decodes from random glyphs into the final string. */
export function useScramble(text, { start = true, speed = 28, delay = 0 } = {}) {
  const [out, setOut] = useState(prefersReducedMotion() ? text : "");
  useEffect(() => {
    if (!start) return;
    if (prefersReducedMotion()) return setOut(text);
    let frame = 0;
    let raf;
    let timeout;
    const queue = [...text].map((ch, i) => ({
      ch,
      startAt: Math.floor(i * 1.6),
      endAt: Math.floor(i * 1.6) + 8 + Math.floor(Math.random() * 10),
    }));
    let last = 0;
    const tick = (now) => {
      if (now - last >= speed) {
        last = now;
        let done = 0;
        const s = queue
          .map(({ ch, startAt, endAt }) => {
            if (ch === " ") return " ";
            if (frame >= endAt) {
              done++;
              return ch;
            }
            if (frame >= startAt) return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            return " ";
          })
          .join("");
        setOut(s);
        frame++;
        if (done >= queue.filter((q) => q.ch !== " ").length) return setOut(text);
      }
      raf = requestAnimationFrame(tick);
    };
    timeout = setTimeout(() => (raf = requestAnimationFrame(tick)), delay);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [text, start, speed, delay]);
  return out;
}

/** Cycles through phrases with a typewriter effect. */
export function useTypewriter(words, { typeSpeed = 55, deleteSpeed = 28, hold = 1700 } = {}) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (prefersReducedMotion()) return setText(words[0]);
    let t;
    let i = 0;
    let cur = "";
    let deleting = false;
    const step = () => {
      const word = words[i % words.length];
      let wait;
      if (!deleting) {
        cur = word.slice(0, cur.length + 1);
        if (cur === word) {
          deleting = true;
          wait = hold;
        } else wait = typeSpeed;
      } else {
        cur = word.slice(0, cur.length - 1);
        if (cur === "") {
          deleting = false;
          i++;
          wait = 350;
        } else wait = deleteSpeed;
      }
      setText(cur);
      t = setTimeout(step, wait);
    };
    t = setTimeout(step, 600);
    return () => clearTimeout(t);
  }, [words, typeSpeed, deleteSpeed, hold]);
  return text;
}

/** Which section id is currently in view. */
export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);
  return active;
}

export function useClock(timeZone) {
  const fmt = useCallback(
    () =>
      new Date().toLocaleTimeString("en-GB", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    [timeZone]
  );
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, [fmt]);
  return time;
}

export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
};
