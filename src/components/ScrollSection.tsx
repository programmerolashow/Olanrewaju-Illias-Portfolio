import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

const spring = { stiffness: 140, damping: 30, mass: 0.4 };

/**
 * Ties a section's motion to the scroll position: it rises and fades in while its top travels up the
 * lower half of the screen, and drifts up slightly while its bottom leaves the top. Because it follows
 * the scrollbar (not a one-off trigger), scrolling back reverses it.
 *
 * Do not wrap content that uses `position: fixed` (e.g. a lightbox); a transformed ancestor would trap it.
 */
const ScrollSection = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start 0.55"] });
  const { scrollYProgress: leave } = useScroll({ target: ref, offset: ["end 0.35", "end start"] });
  const enterSmooth = useSpring(enter, spring);
  const leaveSmooth = useSpring(leave, spring);

  const enterY = useTransform(enterSmooth, [0, 1], [70, 0]);
  const leaveY = useTransform(leaveSmooth, [0, 1], [0, -36]);
  const y = useTransform(() => enterY.get() + leaveY.get());
  const opacity = useTransform(() => {
    const fadeIn = 0.25 + enterSmooth.get() * 0.75;
    const fadeOut = 1 - leaveSmooth.get() * 0.45;
    return Math.min(fadeIn, fadeOut);
  });

  if (reduce) return <div ref={ref}>{children}</div>;

  return (
    <motion.div ref={ref} style={{ y, opacity }}>
      {children}
    </motion.div>
  );
};

export default ScrollSection;
