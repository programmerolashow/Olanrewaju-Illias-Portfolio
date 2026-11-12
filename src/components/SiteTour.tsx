import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Compass, X } from "lucide-react";
import { zipperDone } from "@/lib/zipper";

/**
 * A guided tour of the home page for first-time visitors. It starts after the zip intro opens, highlights one part of
 * the page at a time (dimming the rest) and explains it. Finished or skipped tours are remembered; the compass
 * button (bottom left of the home page) runs it again.
 */

const DONE_KEY = "site-tour-done";

type Step = { targets?: string[]; title: string; body: string };

const STEPS: Step[] = [
  {
    title: "Welcome to my portfolio 👋",
    body: "Here’s a quick tour so you can find your way around. Use Next and Back, or skip whenever you like.",
  },
  {
    targets: ['nav[aria-label="Main"]', 'button[aria-label="Open menu"]'],
    title: "Getting around",
    body: "The menu takes you to every section and page: Home, About, and the Work menu with projects, services, articles, updates, moments and the learning roadmap.",
  },
  {
    targets: ['button[aria-label="Search the site"]'],
    title: "Search everything",
    body: "Looking for something specific? Search the whole site here, or press Ctrl + K (⌘ + K on a Mac).",
  },
  {
    targets: ['button[aria-label="Toggle theme"]'],
    title: "Day or night",
    body: "Switch between light and dark mode. Watch the About section: sunshine in light mode, rain under the moon and stars in dark mode.",
  },
  {
    targets: ["#about"],
    title: "About me",
    body: "Who I am and what I do. Open “See more” for my full story, and watch the animals play with my toolkit on the floor.",
  },
  {
    targets: ["#skills"],
    title: "Skills & expertise",
    body: "My full toolkit. Switch between technical and professional skills, then pick a category.",
  },
  {
    targets: ["#experience"],
    title: "Work experience",
    body: "Where I’ve worked and what I contributed, from freelance work to my current role.",
  },
  {
    targets: ["#projects"],
    title: "Featured projects",
    body: "Products I’ve built and worked on. Open any project for the full case study and live demo.",
  },
  {
    targets: ["#roadmap-teaser"],
    title: "Starting out?",
    body: "If you want to become a software engineer, follow my 12-month roadmap: what to learn, what to build, and how to track your progress.",
  },
  {
    targets: ["#contact"],
    title: "Let’s talk",
    body: "Have a project, role or question? Send me a message here. Enjoy exploring!",
  },
];

const tourDone = () => {
  try {
    return localStorage.getItem(DONE_KEY) === "1";
  } catch {
    return false;
  }
};

const findTarget = (step: Step) => {
  for (const sel of step.targets ?? []) {
    const el = document.querySelector<HTMLElement>(sel);
    if (el && el.getClientRects().length && el.offsetWidth > 0) return el;
  }
  return null;
};

const PAD = 8;

const SiteTour = () => {
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });

  // Start automatically for first-time visitors, once the zip intro has opened.
  useEffect(() => {
    if (!onHome || tourDone()) return;
    const begin = () => window.setTimeout(() => setActive(true), 600);
    if (zipperDone()) {
      const t = begin();
      return () => clearTimeout(t);
    }
    window.addEventListener("zipper:opened", begin, { once: true });
    return () => window.removeEventListener("zipper:opened", begin);
  }, [onHome]);

  const close = useCallback(() => {
    setActive(false);
    setIndex(0);
    try {
      localStorage.setItem(DONE_KEY, "1");
    } catch {
      /* storage blocked: the tour may start again next visit */
    }
  }, []);

  const step = STEPS[index];

  // Bring the highlighted part into view, then keep the highlight on it while the page moves.
  useLayoutEffect(() => {
    if (!active) return;
    const target = findTarget(step);
    if (target && step.targets?.[0]?.startsWith("#")) target.scrollIntoView({ behavior: "smooth", block: "start" });
    else if (!target) setRect(null);
    let raf = 0;
    const track = () => {
      const el = findTarget(step);
      const r = el ? el.getBoundingClientRect() : null;
      // Only re-render when something actually moved.
      setRect((prev) =>
        prev && r && prev.top === r.top && prev.left === r.left && prev.width === r.width && prev.height === r.height ? prev : r,
      );
      setViewport((v) => (v.w === window.innerWidth && v.h === window.innerHeight ? v : { w: window.innerWidth, h: window.innerHeight }));
      raf = requestAnimationFrame(track);
    };
    raf = requestAnimationFrame(track);
    return () => cancelAnimationFrame(raf);
  }, [active, step]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(STEPS.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, close]);

  if (!onHome) return null;

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => {
          setIndex(0);
          setActive(true);
        }}
        aria-label="Take the site tour"
        title="Take the site tour"
        className="fixed bottom-5 left-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/80 text-primary backdrop-blur-md transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        <Compass className="h-5 w-5" />
      </button>
    );
  }

  const { w, h } = viewport;
  // Highlight box, clamped to the screen (big sections are taller than the window).
  const hole = rect && {
    x: Math.max(4, rect.left - PAD),
    y: Math.max(4, rect.top - PAD),
    w: Math.min(w - 8, rect.width + PAD * 2),
    h: Math.min(h - 8 - Math.max(4, rect.top - PAD), rect.height + PAD * 2),
  };

  // Card position: below the highlight if there's room, else above, else centred.
  const cardW = Math.min(360, w - 32);
  let cardStyle: React.CSSProperties = { left: (w - cardW) / 2, top: h / 2 - 110, width: cardW };
  if (hole) {
    const left = Math.min(Math.max(16, hole.x + hole.w / 2 - cardW / 2), w - cardW - 16);
    if (hole.y + hole.h + 230 < h) cardStyle = { left, top: hole.y + hole.h + 14, width: cardW };
    else if (hole.y > 240) cardStyle = { left, top: hole.y - 14, width: cardW, transform: "translateY(-100%)" };
    else cardStyle = { left, bottom: 24, width: cardW };
  }

  const last = index === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[150]" role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-body">
      {/* Dim everything except the highlighted part */}
      <svg className="absolute inset-0 h-full w-full" aria-hidden onClick={close}>
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {hole && <rect x={hole.x} y={hole.y} width={hole.w} height={hole.h} rx="16" fill="black" />}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(2,6,23,0.6)" mask="url(#tour-mask)" />
        {hole && (
          <rect
            x={hole.x}
            y={hole.y}
            width={hole.w}
            height={hole.h}
            rx="16"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"

          />
        )}
      </svg>

      <div className="absolute rounded-2xl border border-border bg-background p-5 transition-[top,left] duration-300" style={cardStyle}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="font-mono text-xs text-primary">
            {index + 1} / {STEPS.length}
          </span>
          <button type="button" onClick={close} aria-label="Close the tour" className="rounded-full p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <h2 id="tour-title" className="text-lg font-bold text-foreground">
          {step.title}
        </h2>
        <p id="tour-body" className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {step.body}
        </p>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${((index + 1) / STEPS.length) * 100}%` }} />
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button type="button" onClick={close} className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            Skip tour
          </button>
          <div className="flex gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={() => setIndex(index - 1)}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
              >
                Back
              </button>
            )}
            <button
              type="button"
              autoFocus
              onClick={() => (last ? close() : setIndex(index + 1))}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              {last ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteTour;
