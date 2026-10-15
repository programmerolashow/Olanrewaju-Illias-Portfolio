import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";
import {
  ArrowDown,
  ArrowRight,
  Atom,
  Bot,
  Braces,
  Briefcase,
  Github,
  Gitlab,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Server,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const portrait = "/illias-hero.webp";

const socials = [
  { icon: Github, href: "https://github.com/programmerolashow", label: "GitHub" },
  { icon: Gitlab, href: "https://gitlab.com/olanrewajuillias", label: "GitLab" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/olanrewaju-illias-993a982bb", label: "LinkedIn" },
  { icon: Mail, href: "mailto:olanrewajuillias@gmail.com", label: "Email" },
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

// Glass chips that hover around the portrait at different depths
const chips: FloatingChip[] = [
  { icon: Atom, label: "React", className: "left-0 top-[22%]", depth: 110, float: 5, delay: 0.9, iconClass: "text-cyan-400" },
  { icon: Braces, label: "TypeScript", className: "right-0 top-[34%]", depth: 140, float: 6, delay: 1.0, iconClass: "text-sky-500" },
  { icon: Server, label: "Node.js", className: "left-2 bottom-[30%]", depth: 90, float: 5.5, delay: 1.1, iconClass: "text-emerald-500" },
  { icon: Bot, label: "AI Engineering", className: "right-2 bottom-[16%]", depth: 160, float: 6.5, delay: 1.2, iconClass: "text-accent" },
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
    <motion.div style={{ x, y, z: chip.depth }} className={`absolute z-30 ${chip.className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
        transition={{
          opacity: { delay: chip.delay, duration: 0.5 },
          scale: { delay: chip.delay, type: "spring", stiffness: 260, damping: 18 },
          y: { duration: chip.float, repeat: Infinity, ease: "easeInOut", delay: chip.delay },
        }}
        whileHover={{ scale: 1.08 }}
        className="glass-card flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold text-foreground md:text-sm"
      >
        <chip.icon className={`h-4 w-4 ${chip.iconClass}`} />
        {chip.label}
      </motion.div>
    </motion.div>
  );
};

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Pointer position across the hero, normalised to -0.5 … 0.5 and smoothed
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const pointerX = useSpring(rawX, { stiffness: 90, damping: 18, mass: 0.6 });
  const pointerY = useSpring(rawY, { stiffness: 90, damping: 18, mass: 0.6 });

  const stageRotateY = useTransform(pointerX, [-0.5, 0.5], [-14, 14]);
  const stageRotateX = useTransform(pointerY, [-0.5, 0.5], [10, -10]);
  const ringLayer = useDepth(pointerX, pointerY, -90);
  const archLayer = useDepth(pointerX, pointerY, -30);
  const figureLayer = useDepth(pointerX, pointerY, 50);

  // Scroll: the portrait sinks back and the copy drifts up as the hero leaves the screen
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const figureScrollY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const figureScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const copyScrollY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <section
      id="home"
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative flex min-h-screen items-center overflow-hidden pb-20 pt-28 lg:pt-24"
    >
      {/* Background Radial Glow Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -right-1/2 -top-1/2 h-full w-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(187 94% 48% / 0.3) 0%, transparent 60%)" }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -left-1/2 h-full w-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(280 85% 65% / 0.3) 0%, transparent 60%)" }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-5">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-6">
          {/* ---------------- Left: 3D portrait stage ---------------- */}
          <motion.div
            style={reduce ? undefined : { y: figureScrollY, scale: figureScale, opacity: heroOpacity }}
            className="relative mx-auto w-full max-w-[460px] [perspective:1400px]"
          >
            <motion.div
              style={
                reduce
                  ? undefined
                  : { rotateX: stageRotateX, rotateY: stageRotateY, transformStyle: "preserve-3d" }
              }
              className="relative h-[440px] sm:h-[520px] lg:h-[640px]"
            >
              {/* Spinning gradient ring (deepest layer) */}
              <motion.div
                style={reduce ? undefined : { ...ringLayer, z: -90 }}
                className="absolute inset-x-0 top-[6%] mx-auto aspect-square w-[92%]"
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
                <div className="absolute inset-[12%] rounded-full bg-primary/20 blur-[70px]" />
              </motion.div>

              {/* Arch panel the portrait stands in */}
              <motion.div
                style={reduce ? undefined : { ...archLayer, z: -30 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 bottom-0 mx-auto h-[70%] w-[82%] overflow-hidden rounded-t-[999px] border border-white/10"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(160deg, hsl(var(--primary) / 0.45), hsl(var(--accent) / 0.4) 55%, hsl(var(--background) / 0.2))",
                  }}
                />
                <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(hsl(var(--foreground)/0.35)_1px,transparent_1px)] [background-size:18px_18px]" />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
              </motion.div>

              {/* Portrait: breaks out above the arch for the pop-out effect */}
              <motion.div
                style={reduce ? undefined : { ...figureLayer, z: 50 }}
                className="absolute inset-x-0 bottom-0 z-20 mx-auto flex h-full justify-center [filter:drop-shadow(0_0_28px_hsl(var(--primary)/0.35))]"
              >
                <motion.img
                  src={portrait}
                  alt="Olanrewaju Illias"
                  draggable={false}
                  initial={{ opacity: 0, y: 80, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="portrait-fade h-full w-auto select-none object-contain object-bottom"
                />
              </motion.div>

              {/* Availability badge */}
              <motion.div
                style={reduce ? undefined : { z: 120 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.5 }}
                className="absolute inset-x-0 bottom-6 z-30 mx-auto flex w-max items-center gap-2 rounded-full border border-primary/40 bg-background/80 px-4 py-2 font-mono text-xs font-medium text-primary backdrop-blur-md"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Available for Opportunities
              </motion.div>

              {/* Floating tech chips (closest layers) */}
              {chips.map((chip) => (
                <Chip key={chip.label} chip={chip} pointerX={pointerX} pointerY={pointerY} />
              ))}
            </motion.div>

            {/* Ground shadow */}
            <div className="absolute -bottom-2 left-1/2 h-6 w-2/3 -translate-x-1/2 rounded-[100%] bg-black/40 blur-xl dark:bg-black/70" />
          </motion.div>

          {/* ---------------- Right: introduction ---------------- */}
          <motion.div
            style={reduce ? undefined : { y: copyScrollY }}
            className="text-center lg:text-left"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-3 font-mono text-sm text-primary md:text-base"
            >
              Hello, I'm
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-3 text-4xl font-bold tracking-tight text-foreground md:text-6xl xl:text-7xl"
            >
              Olanrewaju Illias
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/80 px-4 py-1.5 font-mono text-xs text-muted-foreground md:text-sm"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span>
                Also Known as <strong className="font-semibold text-foreground">Programmer Olashow</strong>
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mb-8 max-w-2xl lg:mx-0"
            >
              <p className="gradient-text mb-3 text-xl font-bold leading-snug md:text-3xl lg:text-4xl">
                Full-Stack Product Engineer
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-lg">
                I build full-stack products end to end and bring AI into them where it actually helps.
                <span className="mt-1 block font-mono text-xs text-foreground/70 md:text-sm">
                  AI Application Engineering · Open Source · Developer Community
                </span>
              </p>
            </motion.div>

            {/* Key Meta Badges */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mb-10 flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm lg:justify-start"
            >
              <div className="glass-card flex items-center gap-2 rounded-xl border border-border/80 px-3.5 py-2 font-medium text-foreground/90">
                <Briefcase className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  Software Engineer at <strong className="font-semibold text-primary">Qorelly</strong>
                </span>
              </div>
              <div className="glass-card flex items-center gap-2 rounded-xl border border-border/80 px-3.5 py-2 font-medium text-foreground/90">
                <GraduationCap className="h-4 w-4 shrink-0 text-accent" />
                <span>University of Ilorin</span>
              </div>
              <div className="glass-card flex items-center gap-2 rounded-xl border border-border/80 px-3.5 py-2 font-medium text-foreground/90">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Lagos State, Nigeria</span>
              </div>
            </motion.div>

            {/* Calls to Action */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
            >
              <motion.a
                href="#projects"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-full px-7 py-3 font-semibold text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                View My Work
                <ArrowRight className="h-4 w-4" />
              </motion.a>
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-7 py-3 font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Let's Talk
              </motion.a>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex items-center justify-center gap-4 md:gap-5 lg:justify-start"
            >
              {socials.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full border border-border bg-secondary/60 p-3.5 text-muted-foreground transition-all duration-300 hover:border-primary hover:text-primary"
                  aria-label={label}
                >
                  <Icon size={22} />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute inset-x-0 bottom-6 hidden justify-center lg:flex">
        <motion.a
          href="#about"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ opacity: { delay: 0.5 }, y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } }}
          className="flex flex-col items-center text-muted-foreground transition-colors hover:text-primary"
        >
          <span className="mb-2 font-mono text-xs">Scroll Down</span>
          <ArrowDown size={18} />
        </motion.a>
      </div>
    </section>
  );
};

export default Hero;
