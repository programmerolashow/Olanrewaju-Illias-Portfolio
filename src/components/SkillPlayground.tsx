import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import SkillIcon from "@/components/SkillIcon";
import { cn } from "@/lib/utils";
import type { AnimalKind, AnimalStage } from "@/components/AnimalStage";

/**
 * The About section's "Core Toolkit" scene:
 * - SkillSky (rendered twice, `back` behind the content and `front` over it): clouds, birds, and colourful skill
 *   balloons falling to the floor, some carrying monkeys.
 * - SkillFloor: a full-width grass floor where 3D animals (a husky, a shiba inu and a fox; see AnimalStage) chase and
 *   pounce on colourful skill balls. The floor runs on a small rAF physics loop that writes transforms straight to
 *   the DOM (no React re-renders) and drives the 3D stage.
 * With reduced motion everything stays still.
 */

const SCENE_COLOURS = [
  "#EF4444", "#F97316", "#F59E0B", "#84CC16", "#22C55E", "#14B8A6",
  "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#D946EF", "#EC4899",
];

const BALL_R = 18;
const GRASS_H = 26;
const GRAVITY = 900;

/* ---------------------------------------------------------------- sky ---------------------------------------------------------------- */

/** Darkens a #rrggbb colour by `amount` (0–1), for the shaded side of a balloon. */
const shade = (hex: string, amount: number) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.round(v * (1 - amount)).toString(16).padStart(2, "0");
  return `#${ch((n >> 16) & 255)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
};

/** The weather follows the theme: sunshine in light mode; rain under the moon and stars in dark mode. */
const isDarkNow = () => document.documentElement.classList.contains("dark");
const useIsDark = () => {
  const [dark, setDark] = useState(isDarkNow);
  useEffect(() => {
    const mo = new MutationObserver(() => setDark(isDarkNow()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return dark;
};

/** Fixed star positions (% of the sky), so they don't jump around between renders. */
const STARS = Array.from({ length: 34 }, (_, i) => ({
  left: (i * 53) % 100,
  top: (i * 29) % 58,
  size: i % 5 === 0 ? 2.5 : i % 2 ? 1.5 : 1,
  delay: -((i * 0.37) % 3),
}));

const Cloud = ({ className, style, rain }: { className: string; style?: CSSProperties; rain: boolean }) => (
  <svg viewBox="0 0 120 50" aria-hidden className={className} style={style}>
    <path
      d="M20 44h80a16 16 0 0 0 0-32 22 22 0 0 0-41-6 18 18 0 0 0-31 12A14 14 0 0 0 20 44z"
      className={cn(
        "transition-[fill] duration-[2500ms]",
        rain ? "fill-slate-400 dark:fill-slate-500/60" : "fill-white dark:fill-slate-300/25",
      )}
    />
  </svg>
);

/** A latex balloon: shaded body, specular highlight, tied knot and a slightly curling string, with the skill printed on it. */
const Balloon = ({ skill, colour, monkey }: { skill: string; colour: string; monkey: boolean }) => {
  const id = useId().replace(/:/g, "");
  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 40 52" aria-hidden className="h-[3.25rem] w-10 overflow-visible">
        <defs>
          <radialGradient id={`b${id}`} cx="36%" cy="30%" r="78%">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="0.16" stopColor={colour} />
            <stop offset="0.75" stopColor={shade(colour, 0.25)} />
            <stop offset="1" stopColor={shade(colour, 0.45)} />
          </radialGradient>
        </defs>
        <path d="M20 1C9.5 1 2 9.6 2 20.6 2 32.4 11 41.7 18 45h4c7-3.3 16-12.6 16-24.4C38 9.6 30.5 1 20 1z" fill={`url(#b${id})`} />
        <ellipse cx="12.5" cy="12" rx="3.2" ry="6.5" transform="rotate(-28 12.5 12)" fill="#fff" opacity="0.5" />
        <path d="M17.5 45h5l-1 3.5h-3z" fill={shade(colour, 0.4)} />
      </svg>
      <div className="absolute left-1/2 top-[1.15rem] -translate-x-1/2 text-white/90">
        <SkillIcon name={skill} brandColor={false} className="h-4 w-4" />
      </div>
      <svg viewBox="0 0 10 34" aria-hidden className={cn("-mt-px w-2.5 overflow-visible", monkey ? "h-3" : "h-8")}>
        <path className="balloon-string" d="M5 0c-3 6 3 11 0 17s3 11 0 17" fill="none" stroke="#94a3b8" strokeWidth="0.8" />
      </svg>
      {monkey && <Monkey />}
    </div>
  );
};

/** A monkey hanging from a balloon string, arms up. */
const Monkey = () => (
  <svg viewBox="0 0 40 46" aria-hidden className="h-11 w-10 overflow-visible">
    <path d="M20 4v8" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
    <path d="M12 22 8 6M28 22l4-16" stroke="#92400e" strokeWidth="4" strokeLinecap="round" />
    <path d="M26 36c8 2 10 8 6 10" fill="none" stroke="#92400e" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="20" cy="31" rx="9" ry="10" fill="#92400e" />
    <ellipse cx="20" cy="33" rx="5" ry="6" fill="#fcd9a8" />
    <circle cx="11" cy="17" r="4" fill="#92400e" />
    <circle cx="29" cy="17" r="4" fill="#92400e" />
    <circle cx="20" cy="17" r="8" fill="#92400e" />
    <ellipse cx="20" cy="19" rx="6" ry="5" fill="#fcd9a8" />
    <circle cx="17.5" cy="17" r="1.2" fill="#1c1917" />
    <circle cx="22.5" cy="17" r="1.2" fill="#1c1917" />
    <path d="M17.5 21q2.5 2 5 0" fill="none" stroke="#1c1917" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

/**
 * A swallow seen from the side: streamlined body, forked tail and two wings hinged at the shoulder. The wings beat a
 * few times, then the bird glides (bird-beat keyframes), the way small birds actually fly.
 */
const Bird = () => (
  <svg viewBox="0 0 64 32" aria-hidden className="h-full w-full overflow-visible">
    <path className="bird-wing bird-wing-far" d="M33 15C29 7 22 2 11 0c6 5 10 10 13 16z" fill="currentColor" opacity="0.7" />
    <path d="M10 13 2 9l5 5-6 3 10-1z" fill="currentColor" />
    <path
      d="M9 15c7-4 18-6 28-4 4 .7 7-1 10-1 4 0 7 2 9 4-3 .5-5 1-8 2-10 4-24 5-39-1z"
      fill="currentColor"
    />
    <path d="M54 13.5 60 14l-5.5 1.5z" fill="#d97706" />
    <circle cx="51" cy="12.6" r="0.9" fill="#f8fafc" />
    <path d="M30 17c7 2 15 1 21-2-6 3-13 4-21 2z" fill="#e7e5e4" opacity="0.6" />
    <path className="bird-wing" d="M36 14c3-8 9-13 20-14-5 5-9 10-12 16z" fill="currentColor" />
  </svg>
);

/** Birds per layer: top (% of the sky), size (px), seconds to cross, start offset, direction. */
const BIRDS: Record<"back" | "front", { top: string; size: number; dur: number; delay: number; rtl?: boolean }[]> = {
  back: [
    { top: "6%", size: 30, dur: 24, delay: -4 },
    { top: "11%", size: 24, dur: 30, delay: -16, rtl: true },
    { top: "38%", size: 26, dur: 27, delay: -9 },
  ],
  front: [
    { top: "18%", size: 40, dur: 19, delay: -2, rtl: true },
    { top: "55%", size: 34, dur: 22, delay: -13 },
    { top: "30%", size: 30, dur: 26, delay: -20 },
  ],
};

/** Rain streaks on a canvas. Fades in for a shower and out again; the loop stops while it's dry or off-screen. */
const Rain = ({ active }: { active: boolean }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !active) return;
    const fit = () => {
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    const drops = Array.from({ length: 160 }, () => ({
      x: Math.random(),
      y: Math.random(),
      len: 10 + Math.random() * 14,
      speed: 0.7 + Math.random() * 0.6,
    }));
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = document.documentElement.classList.contains("dark") ? "rgba(186,200,222,0.45)" : "rgba(71,85,105,0.35)";
      ctx.lineWidth = devicePixelRatio;
      ctx.beginPath();
      for (const d of drops) {
        d.y += d.speed * dt;
        d.x += d.speed * dt * 0.12;
        if (d.y > 1) {
          d.y = -0.05;
          d.x = Math.random();
        }
        const x = d.x * width;
        const y = d.y * height;
        const l = d.len * devicePixelRatio;
        ctx.moveTo(x, y);
        ctx.lineTo(x - l * 0.12, y - l);
      }
      ctx.stroke();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [active]);
  return (
    <canvas
      ref={ref}
      className={cn("absolute inset-0 h-full w-full transition-opacity duration-[2500ms]", active ? "opacity-100" : "opacity-0")}
    />
  );
};

/**
 * Clouds, sun and weather (back layer), rain (front layer), birds and falling balloons. Fills its (relative) parent.
 * Balloons alternate between the layers so some pass behind the text and cards and some in front of them.
 */
export const SkillSky = ({ balloons, layer }: { balloons: string[]; layer: "back" | "front" }) => {
  const reduce = useReducedMotion();
  const rain = useIsDark();
  // One balloon leaves every SPACING seconds. Each balloon's cycle is `period` long; the `balloon-fall`
  // keyframes (index.css) spend the first ~35% of it coming down to the floor, then wait off-screen.
  const SPACING = 1.2;
  const period = balloons.length * SPACING;
  const inLayer = (i: number) => (i % 3 === 0 ? "front" : "back") === layer;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {layer === "back" && (
        <>
          {/* Overcast while it rains */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-b from-slate-500/25 to-transparent transition-opacity duration-[2500ms] dark:from-slate-950/50",
              rain ? "opacity-100" : "opacity-0",
            )}
          />
          {/* Sun with slowly turning rays */}
          <div
            className={cn(
              "absolute right-[6%] top-1 h-24 w-24 transition-all duration-[2500ms] sm:h-28 sm:w-28",
              rain ? "translate-y-6 opacity-0" : "opacity-100",
            )}
          >
            <div className="sun-rays absolute -inset-6 rounded-full" />
            <div className="absolute inset-4 rounded-full bg-[radial-gradient(circle_at_40%_40%,#fffbeb,#fde68a_35%,#f59e0b_80%)]" />
          </div>
          {/* Night: twinkling stars and a crescent-lit moon with a soft halo */}
          <div className={cn("absolute inset-0 transition-opacity duration-[2500ms]", rain ? "opacity-100" : "opacity-0")}>
            {STARS.map((s, i) => (
              <span
                key={i}
                className="star-twinkle absolute rounded-full bg-white"
                style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
              />
            ))}
            <div className="absolute right-[7%] top-2 h-20 w-20 sm:h-24 sm:w-24">
              <div className="absolute -inset-5 rounded-full bg-[radial-gradient(circle,rgba(226,232,240,0.28),transparent_65%)]" />
              <div className="absolute inset-2 overflow-hidden rounded-full bg-[radial-gradient(circle_at_38%_35%,#f8fafc,#e2e8f0_45%,#94a3b8_100%)]">
                <span className="absolute left-[22%] top-[30%] h-[18%] w-[18%] rounded-full bg-slate-400/35" />
                <span className="absolute left-[55%] top-[52%] h-[24%] w-[24%] rounded-full bg-slate-400/30" />
                <span className="absolute left-[40%] top-[15%] h-[10%] w-[10%] rounded-full bg-slate-400/35" />
                <span className="absolute left-[30%] top-[64%] h-[12%] w-[12%] rounded-full bg-slate-400/25" />
              </div>
            </div>
          </div>
        </>
      )}

      {balloons.map((skill, i) => {
        if (!inLayer(i)) return null;
        const colour = SCENE_COLOURS[(i * 5) % SCENE_COLOURS.length];
        const left = 2 + ((i * 37) % 94);
        return (
          <div
            key={skill}
            className={reduce ? "absolute" : "balloon-fall absolute"}
            style={
              reduce
                ? { left: `${left}%`, top: `${10 + ((i * 23) % 50)}%`, display: i % 3 === 0 ? undefined : "none" }
                : {
                    left: `${left}%`,
                    animationDuration: `${period}s`,
                    // Negative delays: the sky is already full of balloons when the section appears.
                    animationDelay: `${i * SPACING - period}s`,
                  }
            }
          >
            <div className="balloon-sway" style={{ animationDelay: `${-(i % 5) * 0.7}s` }}>
              <Balloon skill={skill} colour={colour} monkey={i % 4 === 1} />
            </div>
          </div>
        );
      })}

      {BIRDS[layer].map((b, i) => (
        <div
          key={i}
          className={cn("text-stone-700 dark:text-stone-300", reduce ? "absolute" : "bird-fly absolute")}
          style={{
            top: b.top,
            left: reduce ? `${20 + i * 30}%` : undefined,
            width: b.size,
            height: b.size / 2,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
            animationDirection: b.rtl ? "reverse" : "normal",
          }}
        >
          <div className="h-full w-full" style={{ transform: b.rtl ? "scaleX(-1)" : undefined, ["--beat-delay" as string]: `${-i * 0.5}s` }}>
            <Bird />
          </div>
        </div>
      ))}

      {layer === "back" && (
        <>
          <Cloud rain={rain} className="cloud-move absolute top-0 w-28 sm:w-36" style={{ animationDuration: "70s", animationDelay: "-5s" }} />
          <Cloud rain={rain} className="cloud-move absolute top-6 w-20 sm:w-28" style={{ animationDuration: "90s", animationDelay: "-40s" }} />
          <Cloud rain={rain} className="cloud-move absolute -top-2 w-24 sm:w-32" style={{ animationDuration: "80s", animationDelay: "-62s" }} />
          <Cloud rain={rain} className="cloud-move absolute top-3 w-16 sm:w-24" style={{ animationDuration: "100s", animationDelay: "-22s" }} />
        </>
      )}

      {layer === "front" && !reduce && <Rain active={rain} />}
    </div>
  );
};

/* --------------------------------------------------------------- floor --------------------------------------------------------------- */

/**
 * The animals' floor behaviour. The 3D models (AnimalStage) are drawn from these positions every frame.
 * `w` is the body length used for reaching a ball; speeds are px/s.
 */
const CRITTERS: { kind: AnimalKind; w: number; walk: number; run: number; start: number }[] = [
  { kind: "husky", w: 78, walk: 60, run: 175, start: 0.2 },
  { kind: "shiba-inu", w: 64, walk: 55, run: 160, start: 0.55 },
  { kind: "fox", w: 62, walk: 58, run: 185, start: 0.85 },
];

type Ball = { x: number; y: number; vx: number; vy: number; rot: number };

/** Full-width floor with the animals and the skill balls (as many as fit, up to all of them). */
export const SkillFloor = ({ balls, className }: { balls: string[]; className?: string }) => {
  const reduce = useReducedMotion();
  const floorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [count, setCount] = useState(balls.length);

  // Fewer balls on narrow screens so they don't pile up.
  useEffect(() => {
    const floor = floorRef.current;
    if (!floor) return;
    const ro = new ResizeObserver(() => {
      setCount(Math.max(4, Math.min(balls.length, Math.floor(floor.clientWidth / (BALL_R * 2 * 1.35)))));
    });
    ro.observe(floor);
    return () => ro.disconnect();
  }, [balls.length]);

  useEffect(() => {
    const floor = floorRef.current;
    const canvas = canvasRef.current;
    if (!floor || !canvas) return;

    let width = floor.clientWidth;
    let disposed = false;
    let stage: AnimalStage | null = null;
    const state: Ball[] = Array.from({ length: count }, (_, i) => ({
      x: ((i + 0.5) / count) * width,
      y: 0,
      vx: 0,
      vy: 0,
      rot: 0,
    }));
    const critters = CRITTERS.map((c, i) => ({
      ...c,
      x: c.start * width,
      dir: (i % 2 ? -1 : 1) as 1 | -1,
      speed: 0,
      moving: false,
      target: Math.floor(c.start * count),
      pause: 0.6 + i * 0.5,
    }));

    const draw = () => {
      state.forEach((b, i) => {
        const el = ballRefs.current[i];
        if (el) el.style.transform = `translate(${b.x - BALL_R}px, ${-b.y}px) rotate(${b.rot}rad)`;
      });
    };
    const poses = () => critters.map((c) => ({ x: c.x, dir: c.dir, speed: c.speed, moving: c.moving }));

    const ro = new ResizeObserver(() => {
      const next = floor.clientWidth;
      state.forEach((b) => (b.x = (b.x / (width || 1)) * next));
      critters.forEach((c) => (c.x = (c.x / (width || 1)) * next));
      width = next;
      stage?.resize(width, canvas.clientHeight);
      draw();
    });
    ro.observe(floor);

    let raf = 0;
    let last = performance.now();
    let visible = false;

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Each animal trots or runs to its target ball, nudges it with a pounce, then picks another.
      critters.forEach((c, ci) => {
        if (c.pause > 0) {
          c.pause -= dt;
          c.moving = false;
          c.speed = 0;
          return;
        }
        const ball = state[Math.min(c.target, state.length - 1)];
        const dx = ball.x - c.x;
        c.dir = dx >= 0 ? 1 : -1;
        if (Math.abs(dx) < BALL_R + c.w * 0.5 && ball.y < 10) {
          ball.vx = c.dir * (240 + Math.random() * 260);
          ball.vy = 420 + Math.random() * 320; // high kicks: up to ~300px
          stage?.kick(ci);
          c.pause = 0.7 + Math.random() * 0.9;
          c.moving = false;
          c.speed = 0;
          // Next target: usually a nearby ball, sometimes one across the floor.
          let next = c.target;
          while (next === c.target && state.length > 1) {
            next = Math.random() < 0.7
              ? Math.max(0, Math.min(state.length - 1, c.target + Math.round((Math.random() - 0.5) * 8)))
              : Math.floor(Math.random() * state.length);
          }
          c.target = next;
        } else {
          // Run when the ball is far, slow to a trot when close, easing between the two like a real animal.
          const want = Math.abs(dx) > 160 ? c.run : c.walk;
          c.speed += (want - c.speed) * Math.min(1, dt * 3);
          c.x += c.dir * c.speed * dt;
          c.moving = true;
        }
        c.x = Math.max(c.w / 2, Math.min(width - c.w / 2, c.x));
      });

      // Balls: gravity, bounce, rolling friction, walls.
      for (const b of state) {
        b.vy -= GRAVITY * dt;
        b.y += b.vy * dt;
        if (b.y <= 0) {
          b.y = 0;
          b.vy = Math.abs(b.vy) > 60 ? -b.vy * 0.45 : 0;
          b.vx *= 1 - Math.min(1, 1.4 * dt);
        }
        b.x += b.vx * dt;
        if (b.x < BALL_R) {
          b.x = BALL_R;
          b.vx = Math.abs(b.vx) * 0.7;
        } else if (b.x > width - BALL_R) {
          b.x = width - BALL_R;
          b.vx = -Math.abs(b.vx) * 0.7;
        }
        b.rot += (b.vx * dt) / BALL_R;
      }
      // Balls knock into each other.
      for (let i = 0; i < state.length; i++) {
        for (let j = i + 1; j < state.length; j++) {
          const a = state[i];
          const c = state[j];
          const gap = Math.abs(a.x - c.x);
          if (gap < BALL_R * 2 && Math.abs(a.y - c.y) < BALL_R * 2) {
            const push = (BALL_R * 2 - gap) / 2;
            if (a.x < c.x) {
              a.x -= push;
              c.x += push;
            } else {
              a.x += push;
              c.x -= push;
            }
            const t = a.vx;
            a.vx = c.vx * 0.9;
            c.vx = t * 0.9;
          }
        }
      }

      draw();
      stage?.update(poses(), dt);
      if (visible) raf = requestAnimationFrame(step);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(step);
    };

    // three.js and the models load only when the floor first comes into view.
    let loading = false;
    const loadStage = () => {
      if (loading) return;
      loading = true;
      import("@/components/AnimalStage")
        .then(({ createAnimalStage }) => createAnimalStage(canvas, CRITTERS.map((c) => c.kind)))
        .then((s) => {
          if (disposed) return s.dispose();
          stage = s;
          stage.resize(width, canvas.clientHeight);
          stage.update(poses(), 0);
        })
        .catch(() => {
          // No WebGL or the models failed to load: the balls still play on their own.
        });
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) loadStage();
      if (reduce) return;
      cancelAnimationFrame(raf);
      if (visible) start();
    }, { rootMargin: "200px" });
    io.observe(floor);
    draw();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      stage?.dispose();
    };
  }, [count, reduce]);

  const shown = balls.slice(0, count);

  return (
    <div ref={floorRef} className={`relative w-full ${className ?? ""}`}>
      <ul className="sr-only">
        {balls.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>

      {/* Grass */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-emerald-400/50 to-emerald-600/40"
        style={{ height: GRASS_H }}
      />

      {/* 3D animals (behind the balls, so a kicked ball flies in front of them). Taller than the floor so a
          pouncing animal isn't clipped. */}
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[150%] w-full" />

      {/* Balls */}
      <div aria-hidden className="absolute inset-x-0" style={{ bottom: GRASS_H - 3 }}>
        {shown.map((skill, i) => {
          const colour = SCENE_COLOURS[i % SCENE_COLOURS.length];
          return (
            <div
              key={skill}
              ref={(el) => {
                ballRefs.current[i] = el;
              }}
              className="absolute bottom-0 left-0 flex items-center justify-center rounded-full text-white"
              style={{
                width: BALL_R * 2,
                height: BALL_R * 2,
                backgroundColor: colour,
                backgroundImage: "radial-gradient(circle at 32% 28%, rgba(255,255,255,.6), transparent 45%)",
              }}
            >
              <SkillIcon name={skill} brandColor={false} className="h-5 w-5" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
