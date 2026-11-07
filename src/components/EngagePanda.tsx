// Like and share for an event or post, with a panda pointing at the heart to invite the like.
// Wide screens: the panda sits beside the text and follows the page, leaning and bobbing as you scroll.
// Smaller screens: a compact like/share pill fixed to the corner, so it never covers what you're reading.
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import { Heart, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLikes } from "@/lib/likes";
import { cn } from "@/lib/utils";

const HOODIE = "#151b2b";
const TRIM = "#14b8a6";

/** Original panda in a hoodie, drawn for this site. The pointing arm is its own group so it can jab at the heart. */
type Phase = "like" | "share";

/** Arm angles (degrees, about the shoulder) that aim the finger at each button. */
const AIM = { like: -30, share: 18 };

const Panda = ({ cheering, phase, reduce }: { cheering: boolean; phase: Phase; reduce: boolean | null }) => (
  <svg viewBox="0 0 210 250" className="h-full w-full overflow-visible" aria-hidden>
    {/* Legs */}
    <ellipse cx="68" cy="230" rx="17" ry="12" fill="#0b0b0f" />
    <ellipse cx="124" cy="232" rx="17" ry="12" fill="#0b0b0f" />

    {/* Hoodie body */}
    <path d="M50 140 Q96 126 142 140 L152 212 Q96 228 40 212 Z" fill={HOODIE} />
    <path d="M66 140 Q96 158 126 140" fill="none" stroke="#2b3550" strokeWidth="5" strokeLinecap="round" />
    <path d="M96 152 L96 216" stroke="#3b4663" strokeWidth="2" strokeDasharray="3 3" />
    <path d="M86 150 L84 170 M106 150 L108 170" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
    <path d="M44 198 Q96 212 148 198" fill="none" stroke={TRIM} strokeWidth="3" opacity="0.8" />

    {/* Resting arm */}
    <rect x="34" y="148" width="22" height="52" rx="11" fill={HOODIE} />
    <circle cx="45" cy="201" r="11" fill="#0b0b0f" />

    {/*
      Pointing arm, pivoting at the shoulder: jabs at the heart, now and then swings down to the Share button,
      and waves up once when the post is liked.
    */}
    <motion.g
      key={cheering ? "cheer" : phase}
      style={{ originX: "138px", originY: "148px" }}
      initial={false}
      animate={
        reduce
          ? { rotate: AIM.like }
          : cheering
            ? { rotate: [AIM.like, -65, -40, -65, AIM[phase]] }
            : { rotate: [AIM[phase], AIM[phase] + 6, AIM[phase]] }
      }
      transition={cheering ? { duration: 1.1, ease: "easeInOut" } : { duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
    >
      <rect x="130" y="137" width="54" height="23" rx="11.5" fill={HOODIE} />
      <path d="M170 139 L170 158" stroke={TRIM} strokeWidth="3" strokeLinecap="round" />
      <circle cx="188" cy="148" r="12" fill="#0b0b0f" />
      <ellipse cx="203" cy="144" rx="9" ry="4.5" fill="#0b0b0f" transform="rotate(-12 203 144)" />
    </motion.g>

    {/* Ears */}
    <circle cx="48" cy="42" r="21" fill="#0b0b0f" />
    <circle cx="142" cy="38" r="21" fill="#0b0b0f" />

    {/* Head */}
    <ellipse cx="95" cy="86" rx="60" ry="54" fill="#fafafa" />
    <ellipse cx="74" cy="90" rx="15" ry="21" fill="#0b0b0f" transform="rotate(-28 74 90)" />
    <ellipse cx="118" cy="88" rx="15" ry="21" fill="#0b0b0f" transform="rotate(28 118 88)" />

    {/* Eyes: blink every few seconds, glancing toward the heart */}
    <motion.g
      style={{ originY: "88px" }}
      animate={reduce ? undefined : { scaleY: [1, 1, 0.1, 1, 1] }}
      transition={{ duration: 4, times: [0, 0.9, 0.93, 0.96, 1], repeat: Infinity }}
    >
      <circle cx="76" cy="88" r="8.5" fill="#fff" />
      <circle cx="116" cy="86" r="8.5" fill="#fff" />
      <circle cx="79" cy="89" r="5.2" fill="#0b0b0f" />
      <circle cx="119" cy="87" r="5.2" fill="#0b0b0f" />
      <circle cx="81" cy="86.5" r="1.8" fill="#fff" />
      <circle cx="121" cy="84.5" r="1.8" fill="#fff" />
    </motion.g>

    {/* Nose, mouth, cheeks */}
    <ellipse cx="98" cy="108" rx="7" ry="4.5" fill="#0b0b0f" />
    <path d={cheering ? "M84 115 Q98 138 112 115 Z" : "M86 116 Q98 132 110 116 Q98 121 86 116 Z"} fill="#4a1018" />
    <ellipse cx="98" cy={cheering ? 127 : 123} rx="4.5" ry="2.6" fill="#fb7185" />
    <circle cx="62" cy="110" r="6" fill="#fda4af" opacity="0.45" />
    <circle cx="132" cy="106" r="6" fill="#fda4af" opacity="0.45" />
  </svg>
);

/** Little hearts that fly out of the button when it's liked. */
const Burst = () => (
  <span className="pointer-events-none absolute inset-0" aria-hidden>
    {Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      return (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 text-rose-400"
          initial={{ x: "-50%", y: "-50%", scale: 0.4, opacity: 1 }}
          animate={{ x: `calc(-50% + ${Math.cos(angle) * 46}px)`, y: `calc(-50% + ${Math.sin(angle) * 46}px)`, scale: 1, opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Heart className="h-3 w-3 fill-current" />
        </motion.span>
      );
    })}
  </span>
);

const useEngage = (updateId: string, title: string) => {
  const { toast } = useToast();
  const likes = useLikes(updateId);
  const [bursts, setBursts] = useState(0);
  const liked = likes.data?.liked ?? false;
  const count = likes.data?.count ?? 0;

  const toggleLike = () => {
    if (!liked) setBursts((n) => n + 1);
    likes.toggle.mutate(!liked, {
      onError: (error) => toast({ title: "Like not saved", description: error.message, variant: "destructive" }),
    });
  };

  /** The /updates/<id> link, which carries this post's own preview card on LinkedIn, X, WhatsApp and the rest. */
  const share = async () => {
    const url = `${window.location.origin}/updates/${updateId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Closing the share sheet isn't an error worth showing.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: "Paste it anywhere to share this post." });
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  return { liked, count, bursts, toggleLike, share };
};

const countLabel = (count: number) => (count === 1 ? "1 like" : `${count} likes`);

/** Beside the text on wide screens. Put it in a column that is `sticky` so it travels with the page. */
export const EngagePanda = ({ updateId, title }: { updateId: string; title: string }) => {
  const reduce = useReducedMotion();
  const { liked, count, bursts, toggleLike, share } = useEngage(updateId, title);

  // The routine: point at the heart for a while, then turn to the Share button, then back.
  const [phase, setPhase] = useState<Phase>("like");
  useEffect(() => {
    if (reduce) return;
    const timer = window.setTimeout(() => setPhase((p) => (p === "like" ? "share" : "like")), phase === "like" ? 6000 : 2500);
    return () => window.clearTimeout(timer);
  }, [phase, reduce]);
  // A new like gets a short cheer (arm waves up, panda hops), then the routine carries on.
  const [cheering, setCheering] = useState(false);
  useEffect(() => {
    if (bursts === 0) return;
    setCheering(true);
    const timer = window.setTimeout(() => setCheering(false), 1300);
    return () => window.clearTimeout(timer);
  }, [bursts]);
  const bubble =
    phase === "share" && !reduce ? "Know someone who'd like this? Share it!" : liked ? "Thanks for the love!" : "Enjoyed this? Tap the heart!";

  // Scroll speed drives the motion: scrolling down leans the panda forward and lets the buttons trail behind,
  // scrolling up does the opposite, and everything springs back when the page stops.
  const { scrollY } = useScroll();
  const speed = useSpring(useVelocity(scrollY), { stiffness: 260, damping: 38 });
  const lean = useTransform(speed, [-2500, 0, 2500], [7, 0, -7]);
  const pandaY = useTransform(speed, [-2500, 0, 2500], [-16, 0, 16]);
  const heartY = useTransform(speed, [-2500, 0, 2500], [-28, 0, 28]);
  const shareY = useTransform(speed, [-2500, 0, 2500], [-40, 0, 40]);

  return (
    <div className="relative h-[290px] w-[300px] select-none">
      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        <motion.p
          key={bubble}
          initial={reduce ? false : { opacity: 0, y: 6, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? undefined : { opacity: 0, y: -6, scale: 0.9 }}
          className="absolute left-4 top-0 z-10 rounded-2xl rounded-bl-sm border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground"
        >
          {bubble}
        </motion.p>
      </AnimatePresence>

      <motion.div
        className="absolute left-0 top-10 h-[250px] w-[210px]"
        style={reduce ? undefined : { rotate: lean, y: pandaY, originX: 0.5, originY: 1 }}
      >
        <motion.div
          className="h-full w-full"
          // Gentle bounce while idle; two quick hops when the post is liked.
          animate={reduce ? undefined : cheering ? { y: [0, -14, 0] } : { y: [0, -5, 0] }}
          transition={cheering ? { duration: 0.5, repeat: 1 } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          key={cheering ? `cheer-${bursts}` : "idle"}
        >
          <Panda cheering={cheering} phase={phase} reduce={reduce} />
        </motion.div>
      </motion.div>

      {/* Like */}
      <motion.div className="absolute left-[210px] top-[88px] flex flex-col items-center" style={reduce ? undefined : { y: heartY }}>
        {!reduce && !liked && phase === "like" && (
          <span aria-hidden className="absolute -right-3 -top-4 flex gap-1.5">
            <motion.span
              className="block h-3.5 w-1.5 rotate-[20deg] rounded-full bg-amber-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.1, repeat: Infinity }}
            />
            <motion.span
              className="block h-3.5 w-1.5 rotate-[50deg] rounded-full bg-amber-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: 0.2 }}
            />
          </span>
        )}
        <motion.button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          aria-label={liked ? `Unlike (${countLabel(count)})` : `Like this post (${countLabel(count)})`}
          whileTap={{ scale: 0.85 }}
          // Pulses while the panda is asking for a like.
          animate={reduce || liked || phase !== "like" ? { scale: 1 } : { scale: [1, 1.1, 1] }}
          transition={reduce || liked || phase !== "like" ? { duration: 0.2 } : { duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "relative flex h-16 w-16 items-center justify-center rounded-full text-white ring-4 transition-colors focus-visible:outline-none focus-visible:ring-white",
            liked ? "bg-rose-500 ring-rose-500/30" : "bg-gradient-to-br from-rose-400 to-rose-600 ring-rose-500/40",
          )}
        >
          <Heart className={cn("h-7 w-7", liked && "fill-current")} aria-hidden />
          <AnimatePresence>{bursts > 0 && liked && <Burst key={bursts} />}</AnimatePresence>
        </motion.button>
        <span className="mt-1.5 text-xs font-semibold text-muted-foreground" aria-live="polite">
          {countLabel(count)}
        </span>
      </motion.div>

      {/* Share */}
      <motion.div className="absolute left-[226px] top-[196px] flex flex-col items-center" style={reduce ? undefined : { y: shareY }}>
        <motion.button
          type="button"
          onClick={share}
          aria-label="Share this post"
          whileTap={{ scale: 0.85 }}
          // Pulses while the panda is pointing at it.
          animate={!reduce && phase === "share" ? { scale: [1, 1.14, 1] } : { scale: 1 }}
          transition={!reduce && phase === "share" ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
          whileHover={reduce ? undefined : { rotate: -8, scale: 1.06 }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white ring-4 ring-blue-500/30 focus-visible:outline-none focus-visible:ring-white"
        >
          <Share2 className="h-5 w-5" aria-hidden />
        </motion.button>
        <span className="mt-1.5 text-xs font-semibold text-muted-foreground">Share</span>
      </motion.div>
    </div>
  );
};

/** Corner pill for screens too narrow for the panda. */
export const EngageBar = ({ updateId, title, className }: { updateId: string; title: string; className?: string }) => {
  const reduce = useReducedMotion();
  const { liked, count, bursts, toggleLike, share } = useEngage(updateId, title);
  return (
    <div className={cn("flex items-center gap-1 rounded-full border border-border bg-background/90 p-1 backdrop-blur", className)}>
      <motion.button
        type="button"
        onClick={toggleLike}
        aria-pressed={liked}
        aria-label={liked ? `Unlike (${countLabel(count)})` : `Like this post (${countLabel(count)})`}
        whileTap={reduce ? undefined : { scale: 0.85 }}
        className={cn(
          "relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold",
          liked ? "bg-rose-500 text-white" : "text-rose-500 hover:bg-rose-500/10",
        )}
      >
        <Heart className={cn("h-4 w-4", liked && "fill-current")} aria-hidden />
        {count}
        <AnimatePresence>{!reduce && bursts > 0 && liked && <Burst key={bursts} />}</AnimatePresence>
      </motion.button>
      <button
        type="button"
        onClick={share}
        aria-label="Share this post"
        className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold text-blue-500 hover:bg-blue-500/10"
      >
        <Share2 className="h-4 w-4" aria-hidden /> Share
      </button>
    </div>
  );
};
