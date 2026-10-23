import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

interface MotionImageProps {
  src: string;
  alt: string;
  /** Classes for the frame. It fills its parent by default; add rounding, borders or an aspect ratio here. */
  className?: string;
  /** Classes for the <img> itself, e.g. object-contain. Defaults to object-cover. */
  imgClassName?: string;
  imgStyle?: CSSProperties;
  /** Drift the photo inside its frame while it scrolls past. Off for small images like avatars. */
  parallax?: boolean;
  /** Slow zoom and a light sheen when the pointer is over the frame (or a `group` ancestor). */
  hover?: boolean;
  /** Stagger for grids, in seconds. */
  delay?: number;
  loading?: "lazy" | "eager";
}

/**
 * Site-wide image treatment: once the photo has loaded and scrolled into view, it wipes up from the bottom,
 * de-blurs and settles from a slight zoom; afterwards it drifts with the scroll and responds to hover.
 * Everything collapses to a plain image for visitors who ask for reduced motion.
 */
const MotionImage = ({
  src,
  alt,
  className,
  imgClassName,
  imgStyle,
  parallax = true,
  hover = true,
  delay = 0,
  loading = "lazy",
}: MotionImageProps) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(frameRef, { once: true, margin: "0px 0px -12% 0px" });
  const [loaded, setLoaded] = useState(false);

  // Cached images can finish before React attaches onLoad.
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, [src]);

  const { scrollYProgress } = useScroll({ target: frameRef, offset: ["start end", "end start"] });
  const drift = useSpring(useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]), { stiffness: 120, damping: 30, mass: 0.4 });

  const shown = reduce || (inView && loaded);
  const moving = !reduce && parallax;

  return (
    <motion.div
      ref={frameRef}
      initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
      animate={shown ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
      transition={{ duration: 1.1, delay, ease }}
      className={cn("group/img relative h-full w-full overflow-hidden", className)}
    >
      <motion.div
        initial={reduce ? false : { scale: 1.25, filter: "blur(14px)" }}
        animate={shown ? { scale: 1, filter: "blur(0px)" } : undefined}
        transition={{ duration: 1.4, delay, ease }}
        style={moving ? { y: drift } : undefined}
        className={cn("h-full w-full", moving && "absolute inset-x-0 -inset-y-[7%] h-auto")}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          style={imgStyle}
          className={cn(
            "h-full w-full object-cover",
            hover && "transition-transform duration-1000 ease-out group-hover:scale-[1.06] group-hover/img:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-hover/img:scale-100",
            imgClassName,
          )}
        />
      </motion.div>

      {hover && !reduce && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-[left,opacity] duration-1000 ease-out group-hover:left-[150%] group-hover:opacity-100 group-hover/img:left-[150%] group-hover/img:opacity-100"
        />
      )}
    </motion.div>
  );
};

export default MotionImage;
