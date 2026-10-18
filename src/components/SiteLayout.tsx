import { Suspense, useEffect, useRef } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion, useScroll, useSpring } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Scrolls to the element named by a URL hash, retrying for a few frames while the page mounts. */
const scrollToHash = (hash: string, behavior: ScrollBehavior) => {
  const id = decodeURIComponent(hash.slice(1));
  const attempt = (remaining: number) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior, block: "start" });
    else if (remaining > 0) requestAnimationFrame(() => attempt(remaining - 1));
  };
  attempt(120);
};

const SiteLayout = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });

  const isFirstRender = useRef(true);
  const previousPath = useRef(location.pathname);
  const latestLocation = useRef(location);
  latestLocation.current = location;

  // Same-page navigation (e.g. "/#skills" while on "/") scrolls smoothly. Page changes wait for the
  // exit transition and are handled in onExitComplete so the old page never jumps while fading out.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (location.hash) scrollToHash(location.hash, "instant");
      return;
    }
    if (location.pathname === previousPath.current) {
      const behavior: ScrollBehavior = prefersReducedMotion() ? "instant" : "smooth";
      if (location.hash) scrollToHash(location.hash, behavior);
      else window.scrollTo({ top: 0, behavior });
    }
    previousPath.current = location.pathname;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  const handleExitComplete = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const { hash } = latestLocation.current;
    if (hash) scrollToHash(hash, "instant");
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-background [overflow-x:clip]">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <motion.div
          aria-hidden
          style={{ scaleX: progress, background: "var(--gradient-primary)" }}
          className="fixed left-0 right-0 top-0 z-[60] h-[3px] origin-left"
        />
        <Navbar />
        <AnimatePresence mode="wait" initial={false} onExitComplete={handleExitComplete}>
          <motion.main
            id="content"
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Suspense fallback={<div className="min-h-screen" />}>{outlet}</Suspense>
          </motion.main>
        </AnimatePresence>
        <Footer />
      </div>
    </MotionConfig>
  );
};

export default SiteLayout;
