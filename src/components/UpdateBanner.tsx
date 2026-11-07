import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MotionImage from "@/components/MotionImage";
import { cn } from "@/lib/utils";
import type { UpdateImage } from "@/lib/updates";

/** Shared with the video beside the banner on the update page, so the two cards line up exactly. */
export const mediaFrame =
  "relative flex aspect-[4/3] max-h-[75vh] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted sm:aspect-[16/10]";

/** Blurred fill of the photo behind it, so portraits show whole instead of being cropped. */
const Backdrop = ({ url }: { url: string }) => (
  <img src={url} alt="" aria-hidden decoding="async" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" />
);

/**
 * The banner at the top of an update. Photos only: videos play further down the page.
 *  - one photo: shown as it is
 *  - two or more: they cross-fade every 6 seconds with a slow zoom, under story-style progress segments.
 *    Press and hold to pause, release to resume (like stories); keyboard focus and a hidden tab pause it too.
 *    Arrows, the segments and swiping move by hand.
 *    Visitors who ask for reduced motion get no autoplay or zoom, only the manual controls.
 */
const frame = mediaFrame;

const UpdateBanner = ({ images }: { images: UpdateImage[] }) => {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(() => typeof document !== "undefined" && document.hidden);
  const swipeStart = useRef<number | null>(null);

  useEffect(() => {
    const onChange = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  const count = images.length;
  // Warm the cache for the next photo so the cross-fade never shows a half-loaded image.
  useEffect(() => {
    if (count < 2) return;
    const next = new Image();
    next.src = images[(index + 1) % count].url;
  }, [images, index, count]);

  if (count === 0) return null;

  if (count === 1) {
    const [image] = images;
    return (
      <figure className={frame}>
        <Backdrop url={image.url} />
        <MotionImage src={image.url} alt={image.alt} loading="eager" hover={false} imgClassName="object-contain" />
      </figure>
    );
  }

  const go = (to: number) => setIndex(((to % count) + count) % count);
  const paused = held || focused || hidden;
  const current = images[index];

  return (
    <figure
      // No long-press "Save image" menu on phones, since holding is how you pause.
      className={cn(frame, "group touch-pan-y select-none [-webkit-touch-callout:none]")}
      role="region"
      aria-roledescription="carousel"
      aria-label={`Photos, ${count} in total`}
      // Keyboard focus only: a tap on an arrow focuses it too, and shouldn't stop autoplay for good.
      onFocus={(e) => setFocused(e.target.matches(":focus-visible"))}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(index - 1);
        if (e.key === "ArrowRight") go(index + 1);
      }}
      onPointerDown={(e) => {
        // The arrows and segments are buttons with their own job; holding them isn't a pause.
        if (e.button !== 0 || (e.target as HTMLElement).closest("button")) return;
        // Keep receiving the release even if the pointer drifts off the banner before letting go.
        e.currentTarget.setPointerCapture(e.pointerId);
        swipeStart.current = e.clientX;
        setHeld(true);
      }}
      onPointerUp={(e) => {
        setHeld(false);
        if (swipeStart.current === null) return;
        const dx = e.clientX - swipeStart.current;
        swipeStart.current = null;
        if (Math.abs(dx) > 40) go(dx < 0 ? index + 1 : index - 1);
      }}
      // A vertical scroll on touch takes over the gesture: treat it as a release.
      onPointerCancel={() => {
        swipeStart.current = null;
        setHeld(false);
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={current.url}
          className="absolute inset-0 flex items-center justify-center"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <Backdrop url={current.url} />
          <img
            src={current.url}
            alt={current.alt}
            decoding="async"
            draggable={false}
            // Slow push-in across the slide's life; it holds where it is while paused.
            style={{ animationPlayState: paused ? "paused" : "running" }}
            className={cn("relative h-full w-full object-contain", !reduce && "animate-banner-zoom")}
          />
        </motion.div>
      </AnimatePresence>

      {/* Story-style segments: done, filling (drives the timer), and to come. Each is also a jump button. */}
      <div className="absolute inset-x-3 top-3 z-10 flex gap-1.5">
        {images.map((image, i) => (
          <button
            key={image.url}
            type="button"
            onClick={() => go(i)}
            aria-label={`Show photo ${i + 1} of ${count}`}
            aria-current={i === index}
            className="group/seg flex-1 py-1.5 focus-visible:outline-none"
          >
            <span className="block h-1 overflow-hidden rounded-full bg-white/35 ring-offset-2 group-focus-visible/seg:ring-2 group-focus-visible/seg:ring-white">
              <span
                key={i === index ? `active-${index}` : i}
                onAnimationEnd={i === index ? () => go(index + 1) : undefined}
                style={i === index ? { animationPlayState: paused ? "paused" : "running" } : undefined}
                className={cn(
                  "block h-full origin-left rounded-full bg-white",
                  i < index && "scale-x-100",
                  i > index && "scale-x-0",
                  // Reduced motion: no timer, the current segment is simply full.
                  i === index && (reduce ? "scale-x-100" : "animate-banner-progress"),
                )}
              />
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => go(index - 1)}
        aria-label="Previous photo"
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        aria-label="Next photo"
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>

      <span className="absolute bottom-3 right-3 z-10 rounded-full bg-black/55 px-2.5 py-0.5 font-mono text-xs text-white" aria-live={paused ? "polite" : "off"}>
        {index + 1} / {count}
      </span>
    </figure>
  );
};

export default UpdateBanner;
