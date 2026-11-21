import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Compass, X } from "@/components/icons";
import { zipperDone } from "@/lib/zipper";
import { getVisitorName, hasVisitedBefore } from "@/lib/visitor";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

/**
 * A guided tour of the whole site for first-time visitors. It starts after the zip intro opens and highlights one part
 * at a time (dimming the rest): every section of the home page, then every page in the About and Work menus, opening
 * each page in turn, and ends back at the contact form. Finished or skipped tours are remembered. Returning visitors
 * are asked instead (WelcomeBack), which starts it by navigating home with `{ state: { tour: true } }`; the compass
 * button (bottom left of the home page) also runs it again.
 */

const DONE_KEY = "site-tour-done";

/** `route` is the page the step is on (home when unset); `targets` are tried in order, first visible one wins. */
type Step = { route?: string; targets?: string[]; title: string; body: string };

const routeOf = (step: Step) => step.route ?? "/";
/** Longest wait for a step's part of the page to appear before the step is skipped (e.g. no updates posted yet). */
const WAIT_SAME_PAGE_MS = 1500;
const WAIT_NEW_PAGE_MS = 4000;
/** The page transition's exit; until it's over the old page is still on screen. */
const TRANSITION_MS = 450;

const STEPS: Step[] = [
  {
    title: "Welcome to my portfolio 👋",
    body: "Here’s a tour of everything on the site: the home page first, then every page in the menu. Use Next and Back (or the arrow keys), and skip whenever you like.",
  },
  {
    targets: ['nav[aria-label="Main"]', 'button[aria-label="Open menu"]'],
    title: "Getting around",
    body: "The menu reaches every section and page. Under About and Work you’ll find projects, services, articles, updates, moments, my approach, recommendations and the learning roadmap.",
  },
  {
    targets: ['button[aria-label="Search the site"]'],
    title: "Search everything",
    body: "Looking for something specific? Search projects, pages and sections here, or press Ctrl + K (⌘ + K on a Mac).",
  },
  {
    targets: ['button[aria-label="Toggle theme"]'],
    title: "Day or night",
    body: "Switch between light and dark mode. Watch the About section: sunshine in light mode, rain under the moon and stars in dark mode.",
  },
  {
    targets: ["#home"],
    title: "Introduction",
    body: "Who I am at a glance. Jump straight to my projects, get in touch, download my CV, or find me on my social profiles.",
  },
  {
    targets: ["#updates"],
    title: "What I’m up to",
    body: "The latest events I’m attending or speaking at, and posts about what I’m working on. Open any update to read more, like it or leave a comment.",
  },
  {
    targets: ["#about"],
    title: "About me",
    body: "My story and what I do. Open “See more” for the full version, and watch the animals play with my toolkit on the floor.",
  },
  {
    targets: ["#services"],
    title: "What I offer",
    body: "The services I provide, from full-stack builds to AI integration. The full list, with details, is on the Services page.",
  },
  {
    targets: ["#skills"],
    title: "Skills & expertise",
    body: "My full toolkit. Switch between technical and professional skills, then pick a category.",
  },
  {
    targets: ["#certifications"],
    title: "Licenses & certifications",
    body: "Click a certificate to view it full size, or open the issuer’s page to verify it.",
  },
  {
    targets: ["#google"],
    title: "Find me online",
    body: "What a Google search for my name shows. Click it to run the search yourself.",
  },
  {
    targets: ["#experience"],
    title: "Work experience",
    body: "Where I’ve worked and what I contributed, from freelance work to my current role.",
  },
  {
    targets: ["#projects"],
    title: "Featured projects",
    body: "Products I’ve built and worked on. Open any project for the full case study, video or live demo. Below them, see what I’ve pushed to GitHub recently, or view every project.",
  },
  {
    targets: ["#testimonials"],
    title: "Kind words",
    body: "What colleagues, managers and classmates say about working with me. Worked with me? You can leave a recommendation too.",
  },
  {
    targets: ["#articles"],
    title: "Writing",
    body: "Articles and research I’ve published, and topics I’m planning to write about.",
  },
  {
    targets: ["#roadmap-teaser"],
    title: "Starting out?",
    body: "If you want to become a software engineer, follow my 12-month roadmap: what to learn, what to build, and how to track your progress.",
  },
  // About menu pages
  {
    route: "/services",
    targets: ["main h1"],
    title: "Services",
    body: "Every service I offer, in detail. This page sits under the About menu.",
  },
  {
    route: "/services",
    targets: ['section[aria-label="All services"]'],
    title: "What each service covers",
    body: "Open any service to see everything it includes, from planning and building to testing and deployment.",
  },
  {
    route: "/moments",
    targets: ["main h1"],
    title: "Moments",
    body: "Beyond the code: photos and videos from events, talks, community meetups and the people I build with.",
  },
  {
    route: "/moments",
    targets: ["#moments"],
    title: "The gallery",
    body: "Filter by events, portraits, community or workshops, and open any photo or video to view it full size.",
  },
  {
    route: "/updates",
    targets: ["main h1"],
    title: "Updates",
    body: "Events I’m attending, speaking at or organising, and posts about what I’m working on.",
  },
  {
    route: "/updates",
    targets: ['[aria-labelledby="subscribe-heading"]', "#subscribe-heading"],
    title: "Never miss an update",
    body: "Subscribe to get one email when I post something new, or follow the RSS feed. You can also filter between events and posts.",
  },
  // Work menu pages
  {
    route: "/projects",
    targets: ["main h1"],
    title: "All projects",
    body: "Every project I’ve built, featured builds first. This page sits under the Work menu.",
  },
  {
    route: "/projects",
    targets: ['input[placeholder^="Search by name"]'],
    title: "Find a project",
    body: "Search by name, technology or keyword, show only projects with a live demo or with source code, or pick a technology to filter by.",
  },
  {
    route: "/articles",
    targets: ["main h1"],
    title: "Articles",
    body: "Technical writing and lessons from real projects, organised into tracks.",
  },
  {
    route: "/articles",
    targets: ["#article-search", '[aria-label="Filter by track"]'],
    title: "Browse by topic",
    body: "Search for a topic or filter by track. Published articles open in full; planned ones show what’s coming next.",
  },
  {
    route: "/approach",
    targets: ["main h1"],
    title: "How I work",
    body: "My process, how I debug, how I make technical decisions, how I collaborate and how I use AI responsibly.",
  },
  {
    route: "/approach",
    targets: ['nav[aria-label="On this page"]'],
    title: "Jump to a topic",
    body: "Use these links to go straight to any part of the page.",
  },
  {
    route: "/recommendations",
    targets: ["main h1"],
    title: "Recommendations",
    body: "Everything colleagues, managers, classmates and collaborators have said about working with me.",
  },
  {
    route: "/recommendations",
    targets: ["#write"],
    title: "Write a recommendation",
    body: "Worked with me? Leave a recommendation here. It appears on the site once I’ve reviewed it.",
  },
  {
    route: "/roadmap",
    targets: ["main h1"],
    title: "Learning roadmap",
    body: "A 12-month path to becoming a software engineer: what to learn, what to build and how to grow.",
  },
  {
    route: "/roadmap",
    targets: ["#months", 'nav[aria-label="On this page"]'],
    title: "Month by month",
    body: "Each month has its focus, topics and a project to build. Jump to any section from the links above.",
  },
  {
    route: "/roadmap",
    targets: ["#tracker"],
    title: "Track your progress",
    body: "Tick off each month as you finish it. Your progress is saved in your browser, so you can come back any time.",
  },
  {
    targets: ["#contact"],
    title: "Let’s talk",
    body: "That’s the whole site. Have a project, role or question? Send me a message here. You can run this tour again any time from the compass button at the bottom left of the home page. Enjoy exploring!",
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
  const location = useLocation();
  const navigate = useNavigate();
  // The card uses the opposite theme so it stands out: dark in light mode, light in dark mode.
  const { theme } = useTheme();
  const inverse = theme === "dark" ? "theme-light" : "dark";
  const onHome = location.pathname === "/";
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  // False while the step's page is opening or its part of the page hasn't appeared yet; the card waits for it.
  const [ready, setReady] = useState(false);
  // Which way the visitor is going, so a step whose section is missing is skipped in that direction.
  const direction = useRef<1 | -1>(1);
  const steps = STEPS;

  const go = useCallback((delta: 1 | -1) => {
    direction.current = delta;
    setIndex((i) => Math.min(STEPS.length - 1, Math.max(0, i + delta)));
  }, []);

  const start = useCallback(() => {
    direction.current = 1;
    setIndex(0);
    setActive(true);
  }, []);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });

  // Start automatically for first-time visitors, once the zip intro has opened.
  useEffect(() => {
    if (!onHome || hasVisitedBefore || tourDone()) return;
    const begin = () => window.setTimeout(start, 600);
    if (zipperDone()) {
      const t = begin();
      return () => clearTimeout(t);
    }
    window.addEventListener("zipper:opened", begin, { once: true });
    return () => window.removeEventListener("zipper:opened", begin);
  }, [onHome, start]);

  // Asked for from the welcome-back card. The state is cleared so a reload doesn't start it again.
  const requested = onHome && (location.state as { tour?: boolean } | null)?.tour === true;
  // No cleanup: clearing the state re-renders this effect, which must not cancel the pending start. The delay lets
  // the home page finish its page transition so every section is there to highlight.
  useEffect(() => {
    if (!requested) return;
    navigate("/", { replace: true, state: null });
    window.setTimeout(start, 900);
  }, [requested, navigate, start]);

  const close = useCallback(() => {
    setActive(false);
    setIndex(0);
    try {
      localStorage.setItem(DONE_KEY, "1");
    } catch {
      /* storage blocked: the tour may start again next visit */
    }
  }, []);

  const step = steps[index];

  // Open the step's page when it's on a different one.
  useEffect(() => {
    if (!active) return;
    const route = routeOf(step);
    if (location.pathname !== route) navigate(route);
  }, [active, step, location.pathname, navigate]);

  // Wait for the step's page and part of the page, bring it into view, then keep the highlight on it while the page
  // moves. A part that never appears (e.g. no updates posted yet) is skipped.
  useLayoutEffect(() => {
    if (!active) return;
    setRect(null);
    setReady(false);
    const route = routeOf(step);
    const startedOnPage = window.location.pathname === route;
    const settleMs = startedOnPage ? 0 : TRANSITION_MS;
    const waitMs = startedOnPage ? WAIT_SAME_PAGE_MS : WAIT_NEW_PAGE_MS;
    let arrivedAt = startedOnPage ? performance.now() : 0;
    let shown = false;
    let raf = 0;
    const track = () => {
      const now = performance.now();
      if (!arrivedAt && window.location.pathname === route) arrivedAt = now;
      const settled = arrivedAt > 0 && now - arrivedAt >= settleMs;
      const el = settled ? findTarget(step) : null;

      if (settled && !shown) {
        if (el || !step.targets) {
          shown = true;
          setReady(true);
          if (el && !el.closest('nav[aria-label="Main"]')) {
            const r = el.getBoundingClientRect();
            if (r.top < 72 || r.bottom > window.innerHeight - 24) {
              el.scrollIntoView({ behavior: "smooth", block: r.height > window.innerHeight * 0.6 ? "start" : "center" });
            }
          }
        } else if (now - arrivedAt > waitMs) {
          const next = index + direction.current;
          if (next >= 0 && next < steps.length) {
            go(direction.current);
            return;
          }
          shown = true;
          setReady(true);
        }
      }

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
  }, [active, step, index, steps.length, go]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, close, go]);

  if (!active) {
    // The compass button lives on the home page only.
    if (!onHome) return null;
    return (
      <button
        type="button"
        onClick={start}
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

  const last = index === steps.length - 1;
  const name = index === 0 ? getVisitorName() : "";

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

      <div className={cn(inverse, "absolute rounded-2xl border border-border bg-background p-5 text-foreground transition-[top,left] duration-300", !ready && "invisible")} style={cardStyle}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="font-mono text-xs text-primary">
            {index + 1} / {steps.length}
          </span>
          <button type="button" onClick={close} aria-label="Close the tour" className="rounded-full p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <h2 id="tour-title" className="text-lg font-bold text-foreground">
          {name ? step.title.replace("Welcome", `Welcome, ${name},`) : step.title}
        </h2>
        <p id="tour-body" className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {step.body}
        </p>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button type="button" onClick={close} className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            Skip tour
          </button>
          <div className="flex gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={() => go(-1)}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
              >
                Back
              </button>
            )}
            <button
              type="button"
              autoFocus
              onClick={() => (last ? close() : go(1))}
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
