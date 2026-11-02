import { Fragment, useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface TypewriterTextProps {
  /** Plain part of the heading, e.g. "Work ". */
  text: string;
  /** Part shown in the brand gradient, e.g. "Experience". */
  highlight?: string;
}

/** Slowest per-letter speed, and the longest a whole heading may take, in ms. */
const LETTER_MS = 55;
const MAX_TOTAL_MS = 1500;

/**
 * Heading text that types itself out one letter at a time, with a cursor, the first time it scrolls into view
 * (and again whenever its page is opened, since pages remount). Put it inside the existing <h1>/<h2>.
 *
 * Every letter is rendered from the start and only hidden, so the heading keeps its final size and line breaks
 * and nothing below it jumps. Screen readers get the whole text at once; people who prefer reduced motion see
 * it straight away.
 */
const TypewriterText = ({ text, highlight = "" }: TypewriterTextProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const total = text.length + highlight.length;
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const [caretDone, setCaretDone] = useState(false);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const step = Math.min(LETTER_MS, MAX_TOTAL_MS / Math.max(total, 1));
    setTyping(true);
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      setShown(count);
      if (count >= total) {
        window.clearInterval(timer);
        setTyping(false);
      }
    }, step);
    return () => window.clearInterval(timer);
  }, [inView, reduceMotion, total]);

  // Let the cursor blink a little after the last letter, then remove it.
  useEffect(() => {
    if (!inView || typing || shown < total) return;
    const timer = window.setTimeout(() => setCaretDone(true), 1200);
    return () => window.clearTimeout(timer);
  }, [inView, typing, shown, total]);

  if (reduceMotion) {
    return (
      <>
        {text}
        {highlight && <span className="gradient-text">{highlight}</span>}
      </>
    );
  }

  const caretAt = caretDone ? -1 : shown;

  /** Letters of one part, words kept unbreakable so a line never wraps mid-word. */
  const renderPart = (part: string, offset: number) =>
    part.split(/(\s+)/).reduce<{ nodes: JSX.Element[]; index: number }>(
      (acc, chunk, i) => {
        const start = acc.index;
        const letters = Array.from(chunk).map((ch, j) => {
          const at = start + j;
          return (
            <Fragment key={j}>
              {at === caretAt && <Caret />}
              <span style={{ visibility: at < shown ? "visible" : "hidden" }}>{ch}</span>
            </Fragment>
          );
        });
        acc.nodes.push(
          /^\s+$/.test(chunk) ? (
            <Fragment key={i}>{letters}</Fragment>
          ) : (
            <span key={i} className="whitespace-nowrap">
              {letters}
            </span>
          ),
        );
        acc.index += chunk.length;
        return acc;
      },
      { nodes: [], index: offset },
    ).nodes;

  return (
    <span ref={ref}>
      <span className="sr-only">
        {text}
        {highlight}
      </span>
      <span aria-hidden>
        {renderPart(text, 0)}
        {highlight && <span className="gradient-text">{renderPart(highlight, text.length)}</span>}
        {caretAt === total && <Caret />}
      </span>
    </span>
  );
};

/** Zero-width, so moving it never shifts the letters around it. */
const Caret = () => (
  <span className="relative inline-block w-0 align-baseline">
    <span className="typewriter-caret absolute bottom-[-0.08em] left-[0.04em] h-[0.95em] w-[0.08em] min-w-[2px] rounded-full bg-primary" />
  </span>
);

export default TypewriterText;
