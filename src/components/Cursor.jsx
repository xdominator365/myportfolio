import { useEffect, useRef } from "react";
import { isTouch, prefersReducedMotion } from "../hooks";

/** Dot + lagging ring cursor. Ring morphs over interactive elements and shows a label via data-cursor. */
export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    if (isTouch() || prefersReducedMotion()) return;
    document.documentElement.classList.add("has-cursor");
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { ...pos };
    let raf;

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      dot.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      const target = e.target.closest?.("a, button, [data-cursor], input, textarea");
      const text = target?.getAttribute?.("data-cursor") || "";
      ring.current.classList.toggle("is-hover", !!target);
      ring.current.classList.toggle("has-label", !!text);
      label.current.textContent = text;
    };
    const onDown = () => ring.current.classList.add("is-down");
    const onUp = () => ring.current.classList.remove("is-down");
    const onLeave = () => ring.current.classList.add("is-hidden");
    const onEnter = () => ring.current.classList.remove("is-hidden");

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      ring.current.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
      <div ref={ring} className="cursor-ring" aria-hidden="true">
        <span ref={label} className="cursor-label" />
      </div>
    </>
  );
}
