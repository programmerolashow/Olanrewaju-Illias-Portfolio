import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Compass, X } from "@/components/icons";
import { zipperDone } from "@/lib/zipper";
import { getVisitorName, isReturningVisit, rememberVisitorName } from "@/lib/visitor";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

/**
 * Returning visitors (a new visit after closing the site) are greeted by name once the zip intro opens, and asked
 * whether they'd like the site tour again. "Show me around" goes to the home page and starts the tour there
 * (SiteTour reads the `tour` navigation state). The name is one they gave this site; if there isn't one yet, the
 * card offers an optional field for it.
 */
const WelcomeBack = () => {
  const navigate = useNavigate();
  // Same as the tour card: the opposite theme, so it stands out.
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [name] = useState(getVisitorName);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!isReturningVisit) return;
    const show = () => window.setTimeout(() => setOpen(true), 700);
    if (zipperDone()) {
      const t = show();
      return () => clearTimeout(t);
    }
    window.addEventListener("zipper:opened", show, { once: true });
    return () => window.removeEventListener("zipper:opened", show);
  }, []);

  const finish = (tour: boolean) => {
    if (!name) rememberVisitorName(draft);
    setOpen(false);
    if (tour) navigate("/", { state: { tour: true } });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-labelledby="welcome-back-title"
          aria-describedby="welcome-back-body"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={cn(theme === "dark" ? "theme-light" : "dark", "fixed inset-x-4 bottom-5 z-[140] mx-auto max-w-md rounded-2xl border border-border bg-background p-5 text-foreground sm:bottom-8")}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Compass className="h-5 w-5" aria-hidden />
              </span>
              <h2 id="welcome-back-title" className="text-lg font-bold text-foreground">
                Welcome back{name ? `, ${name}` : ""}! 👋
              </h2>
            </div>
            <button
              type="button"
              onClick={() => finish(false)}
              aria-label="Close"
              className="rounded-full p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p id="welcome-back-body" className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Good to see you again. Would you like the guided tour again? It walks you through every part of the site.
          </p>

          {!name && (
            <label className="mt-4 block">
              <span className="text-xs font-medium text-muted-foreground">What should I call you? (optional)</span>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={40}
                autoComplete="given-name"
                placeholder="Your first name"
                className="mt-1.5 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          )}

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => finish(false)}
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
            >
              No, thanks
            </button>
            <button
              type="button"
              autoFocus
              onClick={() => finish(true)}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Yes, show me around
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeBack;
