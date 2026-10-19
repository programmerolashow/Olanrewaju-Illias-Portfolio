import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDown, ArrowRight, Briefcase, FileDown, Github, Gitlab, GraduationCap, Linkedin, Mail, MapPin, Sparkles } from "lucide-react";
import HeroPortrait from "./HeroPortrait";
import { site } from "@/config/site";

const socials = [
  { icon: Github, href: "https://github.com/programmerolashow", label: "GitHub" },
  { icon: Gitlab, href: "https://gitlab.com/olanrewajuillias", label: "GitLab" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/olanrewaju-illias-993a982bb", label: "LinkedIn" },
  { icon: Mail, href: "mailto:olanrewajuillias@gmail.com", label: "Email" },
];

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = Boolean(useReducedMotion());

  // Pointer position across the hero, normalised to -0.5 … 0.5 and smoothed (drives the depth parallax)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const pointerX = useSpring(rawX, { stiffness: 90, damping: 18, mass: 0.6 });
  const pointerY = useSpring(rawY, { stiffness: 90, damping: 18, mass: 0.6 });

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
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-14 pt-24 sm:pb-16 lg:pb-20 lg:pt-24"
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

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="grid items-center gap-8 md:gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8 xl:gap-12">
          {/* ---------------- Left: interactive 3D portrait ---------------- */}
          <motion.div style={reduce ? undefined : { y: figureScrollY, scale: figureScale, opacity: heroOpacity }}>
            <HeroPortrait pointerX={pointerX} pointerY={pointerY} reduce={reduce} />
          </motion.div>

          {/* ---------------- Right: introduction ---------------- */}
          <motion.div style={reduce ? undefined : { y: copyScrollY }} className="text-center lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-2 font-mono text-sm text-primary sm:mb-3 md:text-base"
            >
              Hello, I'm
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-3 text-[2.1rem] font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl xl:text-7xl"
            >
              Olanrewaju Illias
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/80 px-3 py-1.5 font-mono text-xs text-muted-foreground sm:mb-6 sm:px-4 md:text-sm"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <span>
                Also Known as <strong className="font-semibold text-foreground">Programmer Olashow</strong>
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mb-6 max-w-2xl sm:mb-8 lg:mx-0"
            >
              <p className="gradient-text mb-2 text-xl font-bold leading-snug sm:mb-3 sm:text-2xl md:text-3xl xl:text-4xl">
                Full-Stack Product Engineer
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
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
              className="mb-7 flex flex-wrap items-center justify-center gap-2 text-xs sm:mb-10 sm:gap-3 md:text-sm lg:justify-start"
            >
              <div className="glass-card flex items-center gap-2 rounded-xl border border-border/80 px-3 py-2 font-medium text-foreground/90 sm:px-3.5">
                <Briefcase className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  Software Engineer at <strong className="font-semibold text-primary">Qorelly</strong>
                </span>
              </div>
              <div className="glass-card flex items-center gap-2 rounded-xl border border-border/80 px-3 py-2 font-medium text-foreground/90 sm:px-3.5">
                <GraduationCap className="h-4 w-4 shrink-0 text-accent" />
                <span>University of Ilorin</span>
              </div>
              <div className="glass-card flex items-center gap-2 rounded-xl border border-border/80 px-3 py-2 font-medium text-foreground/90 sm:px-3.5">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Lagos State, Nigeria</span>
              </div>
              {site.availability && (
                <div className="glass-card flex items-center gap-2 rounded-xl border border-emerald-500/40 px-3 py-2 font-medium text-foreground/90 sm:px-3.5">
                  <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <span>{site.availability}</span>
                </div>
              )}
            </motion.div>

            {/* Calls to Action */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mx-auto mb-7 grid max-w-xs grid-cols-1 gap-3 sm:mb-10 sm:flex sm:max-w-none sm:items-center sm:justify-center lg:justify-start"
            >
              <motion.a
                href="#projects"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground sm:px-7 sm:text-base"
                style={{ background: "var(--gradient-primary)" }}
              >
                View My Work
                <ArrowRight className="h-4 w-4" />
              </motion.a>
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-secondary/60 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary sm:px-7 sm:text-base"
              >
                Let's Talk
              </motion.a>
              {__HAS_CV__ && (
                <motion.a
                  href={site.cvPath}
                  download
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-secondary/60 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary sm:px-7 sm:text-base"
                >
                  <FileDown className="h-4 w-4" aria-hidden />
                  Download CV
                </motion.a>
              )}
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5 lg:justify-start"
            >
              {socials.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full border border-border bg-secondary/60 p-3 text-muted-foreground transition-all duration-300 hover:border-primary hover:text-primary sm:p-3.5"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute inset-x-0 bottom-5 hidden justify-center lg:flex">
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
