import { useCallback, useEffect, useRef, useState } from "react";
import { person } from "@/config/site";
import { ZIPPER_SESSION_KEY, zipperDone } from "@/lib/zipper";

/**
 * First-visit intro: the whole site is zipped shut inside a fabric cover. Visitors drag the zip pull down (or tap
 * it, or press Enter); the two halves part in a V above the slider like a real zip, then fall away to reveal the
 * site. Shown once per browser session. Fires "zipper:opened" on window when done (the site tour waits for it).
 */

const SESSION_KEY = ZIPPER_SESSION_KEY;
const alreadyOpened = zipperDone;

const TEETH =
  "repeating-linear-gradient(to bottom, #d4d4d8 0 5px, #71717a 5px 6px, transparent 6px 10px)";

const ZipperIntro = () => {
  const [show, setShow] = useState(() => !alreadyOpened());
  const [progress, setProgressState] = useState(0); // 0 = closed, 1 = fully unzipped
  const progressRef = useRef(0);
  const setProgress = useCallback((p: number) => {
    progressRef.current = p;
    setProgressState(p);
  }, []);
  const [leaving, setLeaving] = useState(false);
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const dragging = useRef(false);
  const startY = useRef(0);
  const startP = useRef(0);
  const auto = useRef(0);

  const finish = useCallback(() => {
    setLeaving(true);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* storage blocked: the intro just shows again next visit */
    }
    window.setTimeout(() => {
      setShow(false);
      window.dispatchEvent(new Event("zipper:opened"));
    }, 900);
  }, []);

  // Glide the zip the rest of the way down (tap, keyboard, or a release past the halfway mark).
  const unzip = useCallback(() => {
    cancelAnimationFrame(auto.current);
    const from = performance.now();
    const p0 = progressRef.current;
    const tick = (now: number) => {
      const t = Math.min(1, (now - from) / 900);
      const eased = 1 - Math.pow(1 - t, 3);
      const p = p0 + (1 - p0) * eased;
      setProgress(p);
      if (t < 1) auto.current = requestAnimationFrame(tick);
      else finish();
    };
    auto.current = requestAnimationFrame(tick);
  }, [finish, setProgress]);

  useEffect(() => {
    if (!show) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "Escape") {
        e.preventDefault();
        unzip();
      }
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(auto.current);
    };
  }, [show, unzip]);

  if (!show) return null;

  const { w, h } = size;
  const pullTop = 70; // where the slider starts (px from the top)
  const sliderY = pullTop + progress * (h - pullTop + 60);
  const gap = progress * (w / 2) * 0.9; // how far apart the halves are at the very top
  const seamTop = Math.min(sliderY, h);

  // The open edge of each half runs from the top (pulled apart by `gap`) down to the slider (still joined).
  const leftClip = `polygon(0 0, ${w / 2 - gap}px 0, ${w / 2}px ${seamTop}px, ${w / 2}px ${h}px, 0 ${h}px)`;
  const rightClip = `polygon(${w / 2 + gap}px 0, ${w}px 0, ${w}px ${h}px, ${w / 2}px ${h}px, ${w / 2}px ${seamTop}px)`;
  const edgeLen = Math.hypot(gap, seamTop);
  const edgeAngle = (Math.atan2(gap, seamTop) * 180) / Math.PI;

  const fabric: React.CSSProperties = {
    backgroundColor: "#1e2a44",
    backgroundImage:
      "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 5px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 4px), radial-gradient(ellipse at 50% 40%, #2c3d63, #121a2c 75%)",
  };

  const onPointerDown = (e: React.PointerEvent) => {
    cancelAnimationFrame(auto.current);
    dragging.current = true;
    startY.current = e.clientY;
    startP.current = progress;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const p = Math.max(0, Math.min(1, startP.current + (e.clientY - startY.current) / (h - pullTop)));
    setProgress(p);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    const moved = Math.abs(e.clientY - startY.current);
    // A tap, or a pull past a third of the way, unzips the rest; a short tug springs back.
    if (moved < 6 || progress > 0.33) unzip();
    else setProgress(0);
  };

  const halfStyle = (side: "left" | "right"): React.CSSProperties => ({
    ...fabric,
    clipPath: side === "left" ? leftClip : rightClip,
    transform: leaving ? `translateX(${side === "left" ? "-105%" : "105%"}) rotate(${side === "left" ? -4 : 4}deg)` : undefined,
    transition: leaving ? "transform 0.85s cubic-bezier(.6,0,.3,1)" : undefined,
  });

  return (
    <div
      className="fixed inset-0 z-[200] select-none"
      role="dialog"
      aria-modal="true"
      aria-label={`Welcome to ${person.name}. Pull the zip down, or press Enter, to open the site.`}
    >
      {/* The two fabric halves */}
      <div className="absolute inset-0" style={halfStyle("left")} />
      <div className="absolute inset-0" style={halfStyle("right")} />

      {!leaving && (
        <>
          {/* Teeth still joined below the slider */}
          <div
            className="absolute w-3 -translate-x-1/2"
            style={{ left: w / 2, top: seamTop, height: Math.max(0, h - seamTop), backgroundImage: TEETH }}
          />
          {/* Teeth along each opened edge */}
          {progress > 0.001 &&
            (["left", "right"] as const).map((side) => (
              <div
                key={side}
                className="absolute w-1.5"
                style={{
                  left: side === "left" ? w / 2 - gap - 3 : w / 2 + gap - 3,
                  top: 0,
                  height: edgeLen,
                  backgroundImage: TEETH,
                  transformOrigin: "top center",
                  transform: `rotate(${side === "left" ? -edgeAngle : edgeAngle}deg)`,
                }}
              />
            ))}

          {/* Title and hint, on the fabric */}
          <div
            className="pointer-events-none absolute inset-x-0 top-[28%] px-6 text-center text-white transition-opacity duration-300"
            style={{ opacity: Math.max(0, 1 - progress * 2.5) }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-sky-300/90">Welcome</p>
            <p className="mt-3 text-3xl font-bold sm:text-5xl">{person.name}</p>
            <p className="mt-4 text-sm text-white/70 sm:text-base">Pull the zip down to open the portfolio</p>
          </div>

          {/* Slider and pull tab */}
          <button
            type="button"
            aria-label="Pull the zip down to open the site"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="absolute flex -translate-x-1/2 touch-none cursor-grab flex-col items-center outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-sky-300 rounded-full"
            style={{ left: w / 2, top: Math.min(sliderY, h - 10) - 26 }}
          >
            <span className="h-7 w-6 rounded-t-md rounded-b-sm bg-gradient-to-b from-zinc-200 via-zinc-400 to-zinc-500" />
            <span className="-mt-1 h-3 w-2 rounded-sm bg-zinc-500" />
            <span className="-mt-0.5 flex h-14 w-7 items-end justify-center rounded-b-full rounded-t-md bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-600 pb-2">
              <span className="h-3 w-2.5 rounded-full bg-[#1e2a44]" />
            </span>
            {progress < 0.02 && (
              <span className="zipper-hint mt-3 whitespace-nowrap rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                Drag down ↓
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={unzip}
            className="absolute bottom-6 right-6 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
          >
            Skip
          </button>
        </>
      )}
    </div>
  );
};

export default ZipperIntro;
