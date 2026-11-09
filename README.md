# harshit.dev — Portfolio

Personal portfolio of **Harshit Yadav**, Software Engineer @ Accenture · AWS Certified Developer.

**Live:** https://xdominator365.github.io/myportfolio/

## Highlights

- Hand-rolled motion system — no UI or animation libraries (React + Canvas + CSS only, ~60 KB gzipped JS)
- Interactive particle constellation over drifting aurora gradients
- Terminal boot-sequence preloader with split-curtain reveal
- Glyph-scramble name reveal, typewriter roles, live-typing code editor
- Custom cursor with contextual labels, magnetic buttons, 3D tilt cards, cursor spotlights
- Live simulated candlestick chart (MyDhira) and animated serverless architecture diagram (Claim Getter)
- `⌘K` / `Ctrl+K` command palette with keyboard navigation
- Scroll-drawn career timeline, animated counters, holographic AWS certification card
- Respects `prefers-reduced-motion`; responsive down to 320px

## Develop

```bash
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
npm run deploy    # manual build + publish to gh-pages (optional)
```

Pushing to `main` deploys automatically via `.github/workflows/deploy.yml`,
which builds the site and publishes `dist/` to the `gh-pages` branch.

## Structure

```
src/
  data/content.js      # all site content (mirrors Harshit_Resume.pdf)
  hooks/index.js       # reveal, tilt, magnetic, scramble, typewriter, count-up…
  components/          # Background, Cursor, Preloader, Nav, Hero, Sections, …
  styles.css           # design tokens + every animation
```

To update content, edit `src/data/content.js` and replace `src/data/Harshit_Resume.pdf`.
