import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

/** Shared building blocks for the public recommendation and comment forms. */

export const guestInputClass =
  "w-full rounded-xl border border-border bg-background/70 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const GuestField = ({ label, hint, optional, children }: { label: string; hint?: string; optional?: boolean; children: ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 flex items-baseline gap-2 text-sm font-medium text-foreground">
      {label}
      {optional && <span className="text-xs font-normal text-muted-foreground">optional</span>}
    </span>
    {children}
    {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
  </label>
);

/** Hidden from people and assistive tech; bots that fill every field give themselves away. */
export const Honeypot = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
    <label>
      Website
      <input tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  </div>
);

export const SubmittedNote = ({ title, children, onAgain, againLabel }: { title: string; children: ReactNode; onAgain: () => void; againLabel: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96, y: 12 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 260, damping: 24 }}
    role="status"
    className="flex flex-col items-center px-2 py-8 text-center"
  >
    <motion.span
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.1 }}
      className="mb-4 flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground"
      style={{ background: "var(--gradient-primary)" }}
    >
      <CheckCircle2 className="h-7 w-7" aria-hidden />
    </motion.span>
    <p className="text-lg font-semibold text-foreground">{title}</p>
    <p className="mt-1 max-w-sm text-sm text-muted-foreground">{children}</p>
    <button
      type="button"
      onClick={onAgain}
      className="mt-6 rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
    >
      {againLabel}
    </button>
  </motion.div>
);
