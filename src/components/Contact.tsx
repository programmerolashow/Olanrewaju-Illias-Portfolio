import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { useRef, useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertCircle,
  AtSign,
  Check,
  Copy,
  FileDown,
  Github,
  Gitlab,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  RotateCcw,
  Send,
  Tag,
  User,
  type LucideIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { site } from "@/config/site";

// Served by api/contact.js on Vercel, or proxied to backend/server.js in development.
// Set VITE_CONTACT_ENDPOINT only if the backend lives on a different domain (e.g. https://api.example.com/api/contact).
const CONTACT_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || "/api/contact";

const EMAIL = "olanrewajuillias@gmail.com";
const PHONE_DISPLAY = "+234 906 521 9168";
const PHONE_LINK = "tel:+2349065219168";
const MESSAGE_MAX = 5000;

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100, "Name must be under 100 characters."),
  email: z.string().trim().email("Please enter a valid email address.").max(254),
  subject: z.string().trim().min(2, "Please add a subject.").max(150, "Subject must be under 150 characters."),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters.")
    .max(MESSAGE_MAX, `Message must be under ${MESSAGE_MAX} characters.`),
  website: z.string().optional(), // honeypot: hidden from humans
});

type FormValues = z.infer<typeof schema>;
type FieldName = Exclude<keyof FormValues, "website">;

const subjectPresets = ["Job opportunity", "Freelance project", "Collaboration", "Speaking / community", "Just saying hi"];

const openTo = ["Full-time roles", "Freelance projects", "Open-source collaboration", "Community & speaking"];

const socials = [
  { icon: Github, href: "https://github.com/programmerolashow", label: "GitHub" },
  { icon: Gitlab, href: "https://gitlab.com/olanrewajuillias", label: "GitLab" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/olanrewaju-illias-993a982bb", label: "LinkedIn" },
];

/* ------------------------------------------------------------------ */
/* Contact method card                                                 */
/* ------------------------------------------------------------------ */

interface MethodCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  /** Download the link target instead of navigating to it. */
  download?: boolean;
  copyValue?: string;
  delay: number;
  inView: boolean;
}

const MethodCard = ({ icon: Icon, label, value, href, download, copyValue, delay, inView }: MethodCardProps) => {
  const [copied, setCopied] = useState(false);
  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);
  const spotlight = useMotionTemplate`radial-gradient(260px circle at ${mx}px ${my}px, hsl(var(--primary) / 0.16), transparent 70%)`;

  const copy = async () => {
    if (!copyValue) return;
    try {
      await navigator.clipboard.writeText(copyValue);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the link still works */
    }
  };

  const Value = href ? "a" : "p";

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - rect.left);
        my.set(e.clientY - rect.top);
      }}
      className="glass-card group relative overflow-hidden rounded-2xl p-4 transition-colors duration-300 hover:border-primary/50 sm:p-5"
    >
      <motion.div
        aria-hidden
        style={{ background: spotlight }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative flex min-w-0 items-center gap-3 sm:gap-4">
        <motion.div
          whileHover={{ rotate: [0, -12, 12, -6, 0], scale: 1.08 }}
          transition={{ duration: 0.5 }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground sm:h-12 sm:w-12"
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </motion.div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
          <Value
            {...(href ? { href, download: download || undefined } : {})}
            className="block font-medium text-foreground transition-colors [overflow-wrap:anywhere] hover:text-primary text-sm sm:text-base"
          >
            {value}
          </Value>
        </div>
        {copyValue && (
          <button
            type="button"
            onClick={copy}
            aria-label={`Copy ${label.toLowerCase()}`}
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/60 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span key="ok" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                  <Check className="h-4 w-4 text-emerald-500" />
                </motion.span>
              ) : (
                <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Copy className="h-4 w-4" />
                </motion.span>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {copied && (
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute -top-8 right-0 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[0.7rem] font-medium text-background"
                >
                  Copied!
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}
      </div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* Floating-label field                                                */
/* ------------------------------------------------------------------ */

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: FieldName;
  label: string;
  icon: LucideIcon;
  error?: string;
  registration: UseFormRegisterReturn;
}

const fieldBase =
  "peer w-full rounded-xl border bg-secondary/40 pl-11 pr-4 pt-6 pb-2 text-sm text-foreground outline-none transition-all duration-300 placeholder:text-transparent focus:bg-background/60 sm:text-base";

const FieldShell = ({
  label,
  icon: Icon,
  error,
  htmlFor,
  children,
  textarea = false,
}: {
  label: string;
  icon: LucideIcon;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
  textarea?: boolean;
}) => (
  <div>
    <div className="group relative">
      {children}
      <Icon
        className={cn(
          "pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground transition-colors duration-300 peer-focus:text-primary",
          textarea ? "top-5" : "top-1/2 -translate-y-1/2",
          error && "text-destructive peer-focus:text-destructive",
        )}
      />
      <label
        htmlFor={htmlFor}
        className={cn(
          "pointer-events-none absolute left-11 origin-left text-muted-foreground transition-all duration-200",
          // floated (has value or focused)
          "top-2 text-[0.7rem] font-medium",
          // resting (empty and unfocused)
          textarea
            ? "peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm"
            : "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm",
          "peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[0.7rem] peer-focus:text-primary",
          error && "text-destructive peer-focus:text-destructive",
        )}
      >
        {label}
      </label>
    </div>
    <AnimatePresence initial={false}>
      {error && (
        <motion.p
          id={`${htmlFor}-error`}
          initial={{ opacity: 0, height: 0, y: -4 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -4 }}
          className="flex items-center gap-1.5 overflow-hidden pt-1.5 text-xs text-destructive"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const Field = ({ name, label, icon, error, registration, ...props }: FieldProps) => (
  <FieldShell label={label} icon={icon} error={error} htmlFor={name}>
    <input
      id={name}
      placeholder={label}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${name}-error` : undefined}
      className={cn(
        fieldBase,
        error
          ? "border-destructive/70 focus:ring-2 focus:ring-destructive/20"
          : "border-border hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/15",
      )}
      {...registration}
      {...props}
    />
  </FieldShell>
);

/* ------------------------------------------------------------------ */
/* Success panel                                                       */
/* ------------------------------------------------------------------ */

const SuccessPanel = ({ email, onReset }: { email: string; onReset: () => void }) => (
  <motion.div
    key="success"
    initial={{ opacity: 0, scale: 0.92 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ type: "spring", stiffness: 220, damping: 22 }}
    className="flex min-h-[26rem] flex-col items-center justify-center px-2 py-10 text-center"
  >
    <div className="relative mb-6">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full border border-primary/50"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
        />
      ))}
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
        className="relative flex h-20 w-20 items-center justify-center rounded-full text-primary-foreground"
        style={{ background: "var(--gradient-primary)" }}
      >
        <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
          />
        </svg>
      </motion.div>
    </div>
    <motion.h3
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="mb-2 text-2xl font-bold text-foreground sm:text-3xl"
    >
      Message sent!
    </motion.h3>
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
      className="mb-8 max-w-sm text-sm text-muted-foreground sm:text-base"
    >
      Thanks for reaching out. I'll reply to <span className="font-medium text-foreground [overflow-wrap:anywhere]">{email}</span> as soon as I can.
    </motion.p>
    <motion.button
      type="button"
      onClick={onReset}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
    >
      <RotateCcw className="h-4 w-4" />
      Send another message
    </motion.button>
  </motion.div>
);

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

type Status = "idle" | "sending" | "success";

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const shake = useAnimationControls();
  const startedAt = useRef(Date.now());
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState("");

  const formMx = useMotionValue(-400);
  const formMy = useMotionValue(-400);
  const formSpotlight = useMotionTemplate`radial-gradient(420px circle at ${formMx}px ${formMy}px, hsl(var(--accent) / 0.12), transparent 70%)`;

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", subject: "", message: "", website: "" },
  });

  const messageLength = watch("message")?.length ?? 0;
  const currentSubject = watch("subject");

  const triggerShake = () => {
    if (!reduce) shake.start({ x: [0, -10, 10, -6, 6, -2, 0], transition: { duration: 0.45 } });
  };

  const onSubmit = async (values: FormValues) => {
    setStatus("sending");
    setServerError(null);
    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, startedAt: startedAt.current }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data?.fields) {
          for (const [field, message] of Object.entries(data.fields as Record<string, string>)) {
            setError(field as FieldName, { message });
          }
        }
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      setSentTo(values.email);
      setStatus("success");
      reset();
    } catch (error) {
      const message = error instanceof Error && error.message !== "Failed to fetch" ? error.message : "Couldn't reach the server. Please check your connection and try again.";
      setServerError(message);
      setStatus("idle");
      triggerShake();
      toast({ title: "Message not sent", description: message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    startedAt.current = Date.now();
    setStatus("idle");
  };

  return (
    <section id="contact" className="section-padding relative overflow-hidden" ref={ref}>
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div
          animate={reduce ? undefined : { x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-32 top-10 h-[24rem] w-[24rem] max-w-full rounded-full bg-primary/10 blur-[6rem]"
        />
        <motion.div
          animate={reduce ? undefined : { x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-32 bottom-10 h-[24rem] w-[24rem] max-w-full rounded-full bg-accent/10 blur-[6rem]"
        />
        <div className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] [background-size:3rem_3rem] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center md:mb-16"
        >
          <p className="mb-4 font-mono text-sm text-primary">Get In Touch</p>
          <h2 className="section-heading mb-4 md:mb-6">
            Let's Work <span className="gradient-text">Together</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
            Have a role, a project or an idea in mind? Send me a message. It lands straight in my inbox.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl gap-6 md:gap-8 lg:grid-cols-[0.9fr_1.1fr] xl:gap-12">
          {/* ---------- Left: ways to reach me ---------- */}
          <div className="space-y-4 md:space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card rounded-2xl p-5 sm:p-6"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                <p className="text-sm font-semibold text-foreground sm:text-base">Currently open to</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {openTo.map((item, i) => (
                  <motion.span
                    key={item}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 300, damping: 20 }}
                    whileHover={{ y: -2 }}
                    className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:text-sm"
                  >
                    {item}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            <MethodCard icon={Mail} label="Email" value={EMAIL} href={`mailto:${EMAIL}`} copyValue={EMAIL} delay={0.2} inView={isInView} />
            <MethodCard icon={Phone} label="Phone" value={PHONE_DISPLAY} href={PHONE_LINK} copyValue={PHONE_DISPLAY} delay={0.3} inView={isInView} />
            <MethodCard icon={MapPin} label="Location" value="Lagos State, Nigeria · Open to remote" delay={0.4} inView={isInView} />
            {__HAS_CV__ && (
              <MethodCard icon={FileDown} label="CV" value="Download my CV (PDF)" href={site.cvPath} download delay={0.45} inView={isInView} />
            )}

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center gap-3 pt-1"
            >
              <span className="font-mono text-xs text-muted-foreground">Find me on</span>
              <span className="h-px flex-1 bg-border" />
              {socials.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.12, y: -3, rotate: -6 }}
                  whileTap={{ scale: 0.92 }}
                  aria-label={label}
                  className="rounded-full border border-border bg-secondary/60 p-2.5 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* ---------- Right: form ---------- */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="relative rounded-[1.4rem] p-px"
          >
            {/* Rotating gradient border */}
            <div aria-hidden className="absolute inset-0 overflow-hidden rounded-[1.4rem]">
              {/* Square big enough to cover the card's diagonal on both wide and tall (phone) layouts */}
              <div className="absolute left-1/2 top-1/2 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  animate={reduce ? undefined : { rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="h-full w-full"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0deg, hsl(var(--primary)) 60deg, transparent 120deg, transparent 180deg, hsl(var(--accent)) 240deg, transparent 300deg)",
                  }}
                />
              </div>
            </div>

            <motion.div
              animate={shake}
              onPointerMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                formMx.set(e.clientX - rect.left);
                formMy.set(e.clientY - rect.top);
              }}
              className="group relative overflow-hidden rounded-[calc(1.4rem-1px)] bg-card p-5 sm:p-7 lg:p-8"
            >
              <motion.div
                aria-hidden
                style={{ background: formSpotlight }}
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <SuccessPanel email={sentTo} onReset={resetForm} />
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit(onSubmit, triggerShake)}
                    noValidate
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="relative space-y-4 sm:space-y-5"
                  >
                    <div className="mb-1">
                      <h3 className="text-lg font-bold text-foreground sm:text-xl">Send a message</h3>
                      <p className="text-xs text-muted-foreground sm:text-sm">All fields are required.</p>
                    </div>

                    {/* Honeypot: invisible to people, irresistible to bots */}
                    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                      <label htmlFor="website">Website</label>
                      <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                      <Field name="name" label="Your name" icon={User} autoComplete="name" error={errors.name?.message} registration={register("name")} />
                      <Field
                        name="email"
                        label="Your email"
                        icon={AtSign}
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        error={errors.email?.message}
                        registration={register("email")}
                      />
                    </div>

                    <div className="space-y-2.5">
                      <Field name="subject" label="Subject" icon={Tag} error={errors.subject?.message} registration={register("subject")} />
                      <div className="flex flex-wrap gap-1.5">
                        {subjectPresets.map((preset) => {
                          const selected = currentSubject === preset;
                          return (
                            <motion.button
                              key={preset}
                              type="button"
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.94 }}
                              onClick={() => setValue("subject", preset, { shouldValidate: true, shouldDirty: true })}
                              className={cn(
                                "rounded-full border px-2.5 py-1 text-[0.7rem] font-medium transition-colors sm:px-3 sm:text-xs",
                                selected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50 hover:text-foreground",
                              )}
                            >
                              {preset}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    <FieldShell label="Your message" icon={MessageSquareText} error={errors.message?.message} htmlFor="message" textarea>
                      <textarea
                        id="message"
                        rows={6}
                        placeholder="Your message"
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={errors.message ? "message-error" : undefined}
                        maxLength={MESSAGE_MAX}
                        className={cn(
                          fieldBase,
                          "resize-none pt-7",
                          errors.message
                            ? "border-destructive/70 focus:ring-2 focus:ring-destructive/20"
                            : "border-border hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/15",
                        )}
                        {...register("message")}
                      />
                    </FieldShell>
                    <div className="-mt-2 flex justify-end">
                      <span
                        className={cn(
                          "font-mono text-[0.7rem] tabular-nums transition-colors",
                          messageLength > MESSAGE_MAX * 0.9 ? "text-amber-500" : "text-muted-foreground",
                        )}
                      >
                        {messageLength} / {MESSAGE_MAX}
                      </span>
                    </div>

                    <AnimatePresence>
                      {serverError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive sm:text-sm">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <p>
                              {serverError} You can also email me directly at{" "}
                              <a href={`mailto:${EMAIL}`} className="font-semibold underline underline-offset-2">
                                {EMAIL}
                              </a>
                              .
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="submit"
                      disabled={status === "sending"}
                      whileHover={status === "sending" ? undefined : { scale: 1.02 }}
                      whileTap={status === "sending" ? undefined : { scale: 0.98 }}
                      className="group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full py-3.5 text-sm font-semibold text-primary-foreground disabled:cursor-wait sm:py-4 sm:text-base"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      {/* sheen sweep on hover */}
                      <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25 transition-all duration-700 group-hover/btn:left-[120%]" />
                      <AnimatePresence mode="wait" initial={false}>
                        {status === "sending" ? (
                          <motion.span
                            key="sending"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="relative flex items-center gap-2"
                          >
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Sending…
                          </motion.span>
                        ) : (
                          <motion.span
                            key="idle"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 40 }}
                            className="relative flex items-center gap-2"
                          >
                            Send Message
                            <Send className="h-4 w-4 transition-transform duration-300 group-hover/btn:-rotate-12 group-hover/btn:translate-x-1 sm:h-5 sm:w-5" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
