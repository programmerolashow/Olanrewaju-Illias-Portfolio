import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef, useState } from "react";
import { ArrowUpFromDot, Atom, Bot, Braces, Hand, Server, User, type LucideIcon } from "lucide-react";
import { heroViews } from "@/data/heroViews";
import { cn } from "@/lib/utils";

type ViewName = "left" | "front" | "top" | "right";

// How far a locked angle can still be tilted towards (degrees)
const LOCKED_YAW = 24;
const LOCKED_PITCH = 16;
// Degrees of rotation per pixel dragged
const DRAG_RATIO = 0.45;

const hasLeft = Boolean(heroViews.left);
const hasRight = Boolean(heroViews.right);
const hasTop = Boolean(heroViews.top);
const hasAnyAngle = hasLeft || hasRight || hasTop;

const minYaw = hasLeft ? -90 : -LOCKED_YAW;
const maxYaw = hasRight ? 90 : LOCKED_YAW;
const maxPitch = hasTop ? 90 : LOCKED_PITCH;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

/** 0 → front photo, 1 → side/top photo. Cross-fades between 30° and 60° of rotation. */
const sideWeight = (yaw: number) => smoothstep(30, 60, Math.abs(yaw));
const topWeight = (pitch: number) => smoothstep(30, 60, pitch);

/** Rotation left over after swapping to the nearest photo, so the image keeps turning while it cross-fades. */
const residualYaw = (yaw: number) => {
  const snapped = Math.abs(yaw) > 45 && ((yaw < 0 && hasLeft) || (yaw > 0 && hasRight)) ? Math.sign(yaw) * 90 : 0;
  return (yaw - snapped) * (hasLeft || hasRight ? 0.5 : 1);
};
const residualPitch = (pitch: number) => {
  const snapped = pitch > 45 && hasTop ? 90 : 0;
  return (pitch - snapped) * (hasTop ? 0.5 : 1);
};

const viewTargets: Record<ViewName, { yaw: number; pitch: number }> = {
  left: { yaw: -90, pitch: 0 },
  front: { yaw: 0, pitch: 0 },
  top: { yaw: 0, pitch: 90 },
  right: { yaw: 90, pitch: 0 },
};

const viewButtons: { name: ViewName; label: string; enabled: boolean }[] = [
  { name: "left", label: "Left", enabled: hasLeft },
  { name: "front", label: "Front", enabled: true },
  { name: "top", label: "Top", enabled: hasTop },
  { name: "right", label: "Right", enabled: hasRight },
];

interface FloatingChip {
  icon: LucideIcon;
  label: string;
  className: string;
  depth: number;
  float: number;
  delay: number;
  iconClass: string;
}

// Glass chips that hover around the portrait at different depths (two are hidden on phones to keep the face clear)
const chips: FloatingChip[] = [
  { icon: Atom, label: "React", className: "left-0 top-[20%]", depth: 110, float: 5, delay: 0.9, iconClass: "text-cyan-400" },
  { icon: Braces, label: "TypeScript", className: "right-0 top-[34%] hidden sm:block", depth: 140, float: 6, delay: 1.0, iconClass: "text-sky-500" },
  { icon: Server, label: "Node.js", className: "left-1 bottom-[30%] hidden sm:block", depth: 90, float: 5.5, delay: 1.1, iconClass: "text-emerald-500" },
  { icon: Bot, label: "AI Engineering", className: "right-0 bottom-[18%]", depth: 160, float: 6.5, delay: 1.2, iconClass: "text-accent" },
];

/** Shifts a layer with the pointer: deeper layers (higher depth) move further, creating parallax. */
const useDepth = (pointerX: MotionValue<number>, pointerY: MotionValue<number>, depth: number) => {
  const x = useTransform(pointerX, [-0.5, 0.5], [-depth * 0.18, depth * 0.18]);
  const y = useTransform(pointerY, [-0.5, 0.5], [-depth * 0.12, depth * 0.12]);
  return { x, y };
};

const Chip = ({ chip, pointerX, pointerY }: { chip: FloatingChip; pointerX: MotionValue<number>; pointerY: MotionValue<number> }) => {
  const { x, y } = useDepth(pointerX, pointerY, chip.depth);
  return (
    <motion.div style={{ x, y, z: chip.depth }} className={cn("pointer-events-none absolute z-30", chip.className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
        transition={{
          opacity: { delay: chip.delay, duration: 0.5 },
          scale: { delay: chip.delay, type: "spring", stiffness: 260, damping: 18 },
          y: { duration: chip.float, repeat: Infinity, ease: "easeInOut", delay: chip.delay },
        }}
        className="glass-card flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.7rem] font-semibold text-foreground sm:gap-2 sm:px-3.5 sm:py-2 sm:text-xs md:text-sm"
      >
        <chip.icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", chip.iconClass)} />
        {chip.label}
      </motion.div>
    </motion.div>
  );
};

interface HeroPortraitProps {
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  reduce: boolean;
}

const HeroPortrait = ({ pointerX, pointerY, reduce }: HeroPortraitProps) => {
  // Target rotation (set by drag / keys / buttons) and its springy display value
  const yaw = useMotionValue(0);
  const pitch = useMotionValue(0);
  const yawS = useSpring(yaw, { stiffness: 170, damping: 22, mass: 0.6 });
  const pitchS = useSpring(pitch, { stiffness: 170, damping: 22, mass: 0.6 });

  const drag = useRef<{ x: number; y: number; yaw0: number; pitch0: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [active, setActive] = useState<ViewName>("front");

  const ringLayer = useDepth(pointerX, pointerY, -90);
  const archLayer = useDepth(pointerX, pointerY, -30);
  const figureLayer = useDepth(pointerX, pointerY, 50);

  // Rotation applied to the photo itself
  const figureRotateY = useTransform(yawS, residualYaw);
  const figureRotateX = useTransform(pitchS, (p) => -residualPitch(p));
  // Shadow and glow follow the rotation so the turn reads as depth, not a flat skew
  const glowX = useTransform(figureRotateY, (r) => `${-r * 0.8}px`);
  const figureFilter = useMotionTemplate`drop-shadow(${glowX} 0 28px hsl(var(--primary) / 0.38))`;
  const groundScale = useTransform(figureRotateY, (r) => 1 - Math.abs(r) / 120);

  // Cross-fade weights for each photo
  const frontOpacity = useTransform([yawS, pitchS], ([y, p]: number[]) => (1 - sideWeight(y)) * (1 - topWeight(p)));
  const leftOpacity = useTransform([yawS, pitchS], ([y, p]: number[]) => (y < 0 && hasLeft ? sideWeight(y) * (1 - topWeight(p)) : 0));
  const rightOpacity = useTransform([yawS, pitchS], ([y, p]: number[]) => (y > 0 && hasRight ? sideWeight(y) * (1 - topWeight(p)) : 0));
  const topOpacity = useTransform(pitchS, (p) => (hasTop ? topWeight(p) : 0));

  const updateActive = () => {
    const y = yaw.get();
    const p = pitch.get();
    if (hasTop && p > 45) setActive("top");
    else if (hasLeft && y < -45) setActive("left");
    else if (hasRight && y > 45) setActive("right");
    else setActive("front");
  };
  useMotionValueEvent(yaw, "change", updateActive);
  useMotionValueEvent(pitch, "change", updateActive);

  const goTo = (view: ViewName) => {
    yaw.set(viewTargets[view].yaw);
    pitch.set(viewTargets[view].pitch);
  };

  /** On release, settle on the nearest available photo (or back to front when the angle is locked). */
  const snap = () => {
    const y = yaw.get();
    const p = pitch.get();
    if (hasTop && p > 45) return goTo("top");
    pitch.set(0);
    if (hasLeft && y < -45) yaw.set(-90);
    else if (hasRight && y > 45) yaw.set(90);
    else yaw.set(0);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, yaw0: yaw.get(), pitch0: pitch.get() };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    // Dragging right turns the portrait to its right (positive yaw), revealing the right-side photo
    yaw.set(clamp(drag.current.yaw0 + dx * DRAG_RATIO, minYaw, maxYaw));
    // Vertical drags scroll the page on touch screens, so "look from the top" is mouse/pen (or the Top button)
    if (e.pointerType !== "touch") pitch.set(clamp(drag.current.pitch0 + dy * DRAG_RATIO, 0, maxPitch));
  };

  const endDrag = () => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    snap();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = (current: number, delta: number, min: number, max: number) => clamp(current + delta, min, max);
    if (e.key === "ArrowLeft") yaw.set(hasLeft ? (active === "right" ? 0 : -90) : step(yaw.get(), -LOCKED_YAW, minYaw, maxYaw));
    else if (e.key === "ArrowRight") yaw.set(hasRight ? (active === "left" ? 0 : 90) : step(yaw.get(), LOCKED_YAW, minYaw, maxYaw));
    else if (e.key === "ArrowUp") pitch.set(hasTop ? 90 : LOCKED_PITCH);
    else if (e.key === "ArrowDown" || e.key === "Escape" || e.key === "Home") goTo("front");
    else return;
    e.preventDefault();
    if (!hasAnyAngle) window.setTimeout(snap, 450);
  };

  const viewImages: { src?: string; opacity: MotionValue<number>; alt: string }[] = [
    { src: heroViews.front, opacity: frontOpacity, alt: "Olanrewaju Illias, front view" },
    { src: heroViews.left, opacity: leftOpacity, alt: "Olanrewaju Illias, left side" },
    { src: heroViews.right, opacity: rightOpacity, alt: "Olanrewaju Illias, right side" },
    { src: heroViews.top, opacity: topOpacity, alt: "Olanrewaju Illias, from above" },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[19rem] sm:max-w-[24rem] lg:max-w-[28rem] [perspective:1400px]">
      <div
        role="group"
        aria-roledescription="3D portrait viewer"
        aria-label="Portrait of Olanrewaju Illias. Drag, swipe or use the arrow keys to rotate."
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        style={{ transformStyle: "preserve-3d" }}
        className={cn(
          "relative h-[min(56vh,24rem)] touch-pan-y select-none rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:h-[min(62vh,30rem)] lg:h-[min(76vh,38rem)] 2xl:h-[min(78vh,42rem)]",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
      >
        {/* Spinning gradient ring (deepest layer) */}
        <motion.div
          style={reduce ? undefined : { ...ringLayer, z: -90 }}
          className="pointer-events-none absolute inset-x-0 top-[6%] mx-auto aspect-square w-[92%]"
        >
          <motion.div
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="ring-mask h-full w-full rounded-full opacity-70"
            style={{
              background:
                "conic-gradient(from 0deg, hsl(var(--primary)), transparent 30%, hsl(var(--accent)), transparent 70%, hsl(var(--primary)))",
            }}
          />
          <div className="absolute inset-[12%] rounded-full bg-primary/20 blur-[4rem]" />
        </motion.div>

        {/* Arch panel the portrait stands in */}
        <motion.div
          style={reduce ? undefined : { ...archLayer, z: -30 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-[70%] w-[82%] overflow-hidden rounded-t-full border border-white/10"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, hsl(var(--primary) / 0.45), hsl(var(--accent) / 0.4) 55%, hsl(var(--background) / 0.2))",
            }}
          />
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(hsl(var(--foreground)/0.35)_1px,transparent_1px)] [background-size:1.1rem_1.1rem]" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
        </motion.div>

        {/* Portrait: breaks out above the arch; rotates with drag and cross-fades between angle photos */}
        <motion.div
          style={reduce ? { z: 50, transformStyle: "preserve-3d" } : { ...figureLayer, z: 50, transformStyle: "preserve-3d" }}
          className="pointer-events-none absolute inset-0 z-20"
        >
          <motion.div
            style={{
              rotateY: figureRotateY,
              rotateX: figureRotateX,
              filter: figureFilter,
              transformOrigin: "50% 60%",
            }}
            className="relative h-full w-full"
          >
            {viewImages.map(
              (view, i) =>
                view.src && (
                  <motion.div key={view.alt} style={{ opacity: view.opacity }} className="absolute inset-0 flex justify-center">
                    <motion.img
                      src={view.src}
                      alt={view.alt}
                      draggable={false}
                      initial={i === 0 ? { opacity: 0, y: 80, filter: "blur(12px)" } : false}
                      animate={i === 0 ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
                      transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="portrait-fade h-full w-auto max-w-none object-contain object-bottom"
                    />
                  </motion.div>
                ),
            )}
          </motion.div>
        </motion.div>

        {/* Availability badge */}
        <motion.div
          style={{ z: 120 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          className="pointer-events-none absolute inset-x-0 bottom-4 z-30 mx-auto flex w-max items-center gap-2 rounded-full border border-primary/40 bg-background/80 px-3 py-1.5 font-mono text-[0.7rem] font-medium text-primary backdrop-blur-md sm:bottom-6 sm:px-4 sm:py-2 sm:text-xs"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Available for Opportunities
        </motion.div>

        {/* Floating tech chips (closest layers) */}
        {!reduce && chips.map((chip) => <Chip key={chip.label} chip={chip} pointerX={pointerX} pointerY={pointerY} />)}
      </div>

      {/* Ground shadow */}
      <motion.div
        style={{ scaleX: groundScale }}
        className="pointer-events-none absolute -bottom-1 left-[17%] h-5 w-2/3 rounded-[100%] bg-black/40 blur-xl dark:bg-black/70"
      />

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="relative z-30 mt-5 flex flex-col items-center gap-2.5"
      >
        {hasAnyAngle && (
          <div className="glass-card flex items-center gap-1 rounded-full p-1" role="toolbar" aria-label="Portrait angle">
            {viewButtons
              .filter((b) => b.enabled)
              .map((b) => (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => goTo(b.name)}
                  aria-pressed={active === b.name}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
                    active === b.name ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active === b.name && (
                    <motion.span
                      layoutId="portrait-view-pill"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    {b.name === "front" ? <User className="h-3.5 w-3.5" /> : b.name === "top" ? <ArrowUpFromDot className="h-3.5 w-3.5" /> : null}
                    {b.label}
                  </span>
                </button>
              ))}
          </div>
        )}
        <p className="flex items-center gap-1.5 font-mono text-[0.7rem] text-muted-foreground sm:text-xs">
          <Hand className="h-3.5 w-3.5" />
          {hasAnyAngle ? "Drag or swipe to rotate" : "Drag to tilt in 3D"}
        </p>
      </motion.div>
    </div>
  );
};

export default HeroPortrait;
