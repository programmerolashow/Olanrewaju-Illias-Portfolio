import {
  AnimatePresence,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Expand, MapPin, Play, X } from "lucide-react";
import { gallery, type GalleryItem, type GalleryItemSize } from "@/data/gallery";
import { cn } from "@/lib/utils";

const sizeClasses: Record<GalleryItemSize, string> = {
  square: "",
  tall: "row-span-2",
  wide: "sm:col-span-2",
  large: "sm:col-span-2 row-span-2",
};

const tiltSpring = { stiffness: 220, damping: 20, mass: 0.5 };

/* ------------------------------------------------------------------ */
/* Media                                                               */
/* ------------------------------------------------------------------ */

const CardVideo = ({ item, hovered }: { item: GalleryItem; hovered: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(videoRef, { amount: 0.5 });
  const reduce = useReducedMotion();
  const shouldPlay = reduce ? hovered : inView || hovered;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (shouldPlay) video.play().catch(() => {});
    else video.pause();
  }, [shouldPlay]);

  return (
    <video
      ref={videoRef}
      src={item.src}
      poster={item.poster}
      muted
      loop
      playsInline
      preload="metadata"
      style={{ objectPosition: item.focus }}
      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
    />
  );
};

/* ------------------------------------------------------------------ */
/* Card: scroll-driven entrance + pointer-driven 3D tilt               */
/* ------------------------------------------------------------------ */

interface GalleryCardProps {
  item: GalleryItem;
  index: number;
  onOpen: () => void;
}

const GalleryCard = ({ item, index, onOpen }: GalleryCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  // Scroll-linked entrance: the card rises, un-tilts and scales in as it enters the viewport.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const enter = useSpring(useTransform(scrollYProgress, [0, 0.35], [0, 1], { clamp: true }), {
    stiffness: 120,
    damping: 24,
    mass: 0.4,
  });
  const direction = index % 2 === 0 ? -1 : 1;
  const y = useTransform(enter, [0, 1], [140, 0]);
  const rotateX = useTransform(enter, [0, 1], [32, 0]);
  const rotateZ = useTransform(enter, [0, 1], [7 * direction, 0]);
  const scale = useTransform(enter, [0, 1], [0.82, 1]);
  const opacity = useTransform(enter, [0, 0.55], [0, 1]);
  // Parallax drift of the media inside the frame for the whole time it is on screen.
  const mediaY = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);

  // Hover tilt + glare that follows the cursor.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const tiltX = useSpring(useTransform(py, [0, 1], [9, -9]), tiltSpring);
  const tiltY = useSpring(useTransform(px, [0, 1], [-11, 11]), tiltSpring);
  const glareX = useTransform(px, (v) => `${v * 100}%`);
  const glareY = useTransform(py, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(520px circle at ${glareX} ${glareY}, rgba(255,255,255,0.22), transparent 45%)`;
  const spotlight = useMotionTemplate`radial-gradient(360px circle at ${glareX} ${glareY}, hsl(var(--primary) / 0.55), transparent 60%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== "mouse" || reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };

  const handlePointerLeave = () => {
    px.set(0.5);
    py.set(0.5);
    setHovered(false);
  };

  const isVideo = item.type === "video";

  return (
    <motion.div
      ref={ref}
      style={reduce ? undefined : { y, rotateX, rotateZ, scale, opacity, transformPerspective: 1200 }}
      className="h-full w-full"
    >
      <motion.button
        type="button"
        onClick={onOpen}
        onPointerEnter={() => setHovered(true)}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={reduce ? undefined : { rotateX: tiltX, rotateY: tiltY, transformPerspective: 900 }}
        whileHover={reduce ? undefined : { scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="group relative block h-full w-full overflow-hidden rounded-3xl border border-border/70 bg-card text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Open ${item.type}: ${item.title}`}
      >
        {/* Animated gradient border that tracks the cursor */}
        <motion.div
          aria-hidden
          style={{ background: spotlight }}
          className="pointer-events-none absolute inset-0 z-30 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 spotlight-border"
        />

        {/* Media with parallax */}
        <motion.div style={reduce ? undefined : { y: mediaY }} className="absolute inset-[-8%]">
          {isVideo ? (
            <CardVideo item={item} hovered={hovered} />
          ) : (
            <img
              src={item.src}
              alt={item.title}
              loading="lazy"
              decoding="async"
              style={{ objectPosition: item.focus }}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          )}
        </motion.div>

        {/* Legibility gradient */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/15 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Cursor glare */}
        <motion.div
          aria-hidden
          style={{ background: glare }}
          className="pointer-events-none absolute inset-0 z-20 opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100"
        />

        {/* Top row: category + type */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4">
          <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[11px] font-mono font-medium uppercase tracking-wider text-white/90 backdrop-blur-md">
            {item.category}
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
            {isVideo ? <Play className="h-4 w-4 fill-current" /> : <Expand className="h-4 w-4" />}
          </span>
        </div>

        {/* Bottom: title, caption, meta */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-5 md:p-6">
          <h3 className="text-lg font-bold leading-tight text-white transition-transform duration-500 group-hover:-translate-y-1 md:text-xl">
            {item.title}
          </h3>
          {(item.caption || item.date || item.location) && (
            <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-500 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-visible:grid-rows-[1fr] group-focus-visible:opacity-100 [@media(hover:none)]:grid-rows-[1fr] [@media(hover:none)]:opacity-100">
              <div className="overflow-hidden">
                {item.caption && <p className="mt-1.5 text-sm leading-snug text-white/80">{item.caption}</p>}
                {(item.date || item.location) && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] font-mono text-white/65">
                    {item.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {item.date}
                      </span>
                    )}
                    {item.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.button>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* Lightbox                                                            */
/* ------------------------------------------------------------------ */

interface LightboxProps {
  items: GalleryItem[];
  index: number;
  direction: number;
  onClose: () => void;
  onNavigate: (step: number) => void;
}

const Lightbox = ({ items, index, direction, onClose, onNavigate }: LightboxProps) => {
  const item = items[index];
  const hasMany = items.length > 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && hasMany) onNavigate(1);
      if (e.key === "ArrowLeft" && hasMany) onNavigate(-1);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onNavigate, hasMany]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (!hasMany) return;
    if (info.offset.x < -80) onNavigate(1);
    else if (info.offset.x > 80) onNavigate(-1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl md:p-10"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 md:right-8 md:top-8"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {hasMany && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(-1);
            }}
            className="absolute left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 sm:flex md:left-8"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(1);
            }}
            className="absolute right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 sm:flex md:right-8"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.figure
          key={index}
          custom={direction}
          initial={{ opacity: 0, x: direction * 80, scale: 0.94 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: direction * -80, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          drag={hasMany ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={handleDragEnd}
          onClick={(e) => e.stopPropagation()}
          className="flex w-full max-w-6xl flex-col items-center"
        >
          {item.type === "video" ? (
            <video
              src={item.src}
              poster={item.poster}
              controls
              autoPlay
              playsInline
              className="max-h-[75vh] w-auto max-w-full rounded-2xl border border-white/10 bg-black"
            />
          ) : (
            <img
              src={item.src}
              alt={item.title}
              draggable={false}
              className="max-h-[75vh] w-auto max-w-full select-none rounded-2xl border border-white/10 object-contain"
            />
          )}
          <figcaption className="mt-5 w-full max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3">
              <span className="rounded-full bg-primary/15 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-primary">
                {item.category}
              </span>
              {hasMany && (
                <span className="text-xs font-mono text-white/50">
                  {index + 1} / {items.length}
                </span>
              )}
            </div>
            <h3 className="mt-3 text-xl font-bold text-white md:text-2xl">{item.title}</h3>
            {item.caption && <p className="mt-1.5 text-sm text-white/70 md:text-base">{item.caption}</p>}
            {(item.date || item.location) && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-white/50">
                {item.date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {item.date}
                  </span>
                )}
                {item.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.location}
                  </span>
                )}
              </div>
            )}
          </figcaption>
        </motion.figure>
      </AnimatePresence>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

const Gallery = () => {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-100px" });
  const [activeCategory, setActiveCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);

  const categories = useMemo(() => ["All", ...Array.from(new Set(gallery.map((g) => g.category)))], []);
  const items = useMemo(
    () => gallery.filter((g) => activeCategory === "All" || g.category === activeCategory),
    [activeCategory],
  );

  const navigate = useCallback(
    (step: number) => {
      setDirection(step);
      setOpenIndex((current) => (current === null ? current : (current + step + items.length) % items.length));
    },
    [items.length],
  );
  const close = useCallback(() => setOpenIndex(null), []);

  if (gallery.length === 0) return null;

  return (
    <section id="moments" className="relative overflow-hidden py-32">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-40 bottom-1/4 h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="container relative mx-auto px-6">
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 50 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="mb-4 font-mono text-sm text-primary">Moments</p>
          <h2 className="section-heading">
            Beyond the <span className="gradient-text">Code</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Snapshots from events, talks, community meetups and the people I build with.
          </p>
        </motion.div>

        {categories.length > 2 && (
          <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => {
              const active = category === activeCategory;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="gallery-filter-pill"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">{category}</span>
                </button>
              );
            })}
          </div>
        )}

        <motion.div
          layout
          className="grid auto-rows-[260px] grid-cols-1 gap-5 [grid-auto-flow:dense] sm:grid-cols-2 lg:grid-cols-4 md:auto-rows-[280px]"
        >
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <motion.div
                key={`${item.src}-${item.title}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                className={sizeClasses[item.size ?? "square"]}
              >
                <GalleryCard
                  item={item}
                  index={index}
                  onOpen={() => {
                    setDirection(0);
                    setOpenIndex(index);
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {openIndex !== null && items[openIndex] && (
          <Lightbox items={items} index={openIndex} direction={direction} onClose={close} onNavigate={navigate} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
