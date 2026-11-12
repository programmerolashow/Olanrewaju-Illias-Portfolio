/**
 * Text that stays still while a band of colour travels through it letter by letter, from the first letter to the
 * last, then starts again without a pause. Keyframes: `color-wave` in index.css (the coloured part is the first 8%
 * of each cycle, so a cycle of 12.5s gives every letter about 1s of colour).
 */
const CYCLE_SECONDS = 12.5;

const ColorWaveText = ({ text, className }: { text: string; className?: string }) => {
  const total = text.replace(/\s/g, "").length;
  const step = CYCLE_SECONDS / total;
  let index = 0;

  return (
    <p className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.split(" ").map((word, w) => (
          <span key={w}>
            {/* Letters of one word stay together, so a line never breaks mid-word. */}
            <span className="whitespace-nowrap">
              {Array.from(word).map((letter, l) => {
                const delay = index++ * step;
                return (
                  <span
                    key={l}
                    className="color-wave-letter"
                    style={{ animationDuration: `${CYCLE_SECONDS}s`, animationDelay: `${delay.toFixed(3)}s` }}
                  >
                    {letter}
                  </span>
                );
              })}
            </span>{" "}
          </span>
        ))}
      </span>
    </p>
  );
};

export default ColorWaveText;
