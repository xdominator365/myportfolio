import { useCallback, useEffect, useState } from "react";
import Background from "./components/Background";
import Cursor from "./components/Cursor";
import Preloader from "./components/Preloader";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import CommandPalette from "./components/CommandPalette";
import { About, Contact, Credentials, Experience, Footer, Marquee, Projects, Skills } from "./components/Sections";
import { Life, Vision } from "./components/Persona";
import { trackVisit } from "./lib/notify";

export default function App() {
  const [ready, setReady] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const onLoaded = useCallback(() => setReady(true), []);
  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toast.t);
    toast.t = setTimeout(() => setToastMsg(null), 2400);
  }, []);

  useEffect(() => {
    trackVisit();
  }, []);

  useEffect(() => {
    // A little something for the devs who open DevTools.
    console.log(
      "%c HY %c Hey, fellow developer 👋  Built by hand with React + Canvas. Press ⌘K / Ctrl+K on the page.",
      "background:linear-gradient(90deg,#8b5cf6,#ec4899,#22d3ee);color:#fff;font-weight:800;padding:4px 8px;border-radius:6px",
      "color:#a78bfa;font-weight:600"
    );
    console.log("%cSource → https://github.com/xdominator365/myportfolio", "color:#22d3ee");
  }, []);

  return (
    <>
      <Preloader onDone={onLoaded} />
      <Background />
      <Cursor />
      <Nav onOpenPalette={() => setPaletteOpen(true)} />
      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} toast={toast} />

      <main>
        <Hero ready={ready} />
        <Marquee />
        <About />
        <Experience />
        <Projects />
        <Vision />
        <Skills />
        <Credentials />
        <Life />
        <Contact toast={toast} />
      </main>
      <Footer />

      <div className={`toast ${toastMsg ? "is-shown" : ""}`} role="status" aria-live="polite">
        <span className="pulse-dot" /> {toastMsg}
      </div>
    </>
  );
}
