import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * Fixed, behind-everything colour field that drifts with page scroll, so the whole site moves together
 * as the visitor scrolls. Radial gradients (not CSS blur filters) keep it cheap to composite.
 */
const AmbientBackground = () => {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 60, damping: 24, mass: 0.6 });

  const aY = useTransform(progress, [0, 1], ["-10vh", "60vh"]);
  const aX = useTransform(progress, [0, 0.5, 1], ["-8vw", "10vw", "-4vw"]);
  const bY = useTransform(progress, [0, 1], ["50vh", "-20vh"]);
  const bX = useTransform(progress, [0, 0.5, 1], ["6vw", "-12vw", "8vw"]);
  const cScale = useTransform(progress, [0, 0.5, 1], [0.8, 1.15, 0.9]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        style={reduce ? undefined : { x: aX, y: aY }}
        className="absolute -left-[20vw] top-0 h-[70vh] w-[70vw] rounded-full"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.09),transparent_65%)]" />
      </motion.div>
      <motion.div
        style={reduce ? undefined : { x: bX, y: bY }}
        className="absolute -right-[20vw] top-0 h-[70vh] w-[70vw] rounded-full"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.08),transparent_65%)]" />
      </motion.div>
      <motion.div
        style={reduce ? undefined : { scale: cScale }}
        className="absolute left-1/4 top-1/3 h-[50vh] w-[50vw] rounded-full"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.05),transparent_60%)]" />
      </motion.div>
    </div>
  );
};

export default AmbientBackground;
