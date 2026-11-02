import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Mail } from "lucide-react";
import { Honeypot, guestInputClass } from "@/components/GuestForm";
import { cn } from "@/lib/utils";

const subscribe = async (email: string, website: string, startedAt: number) => {
  const res = await fetch("/api/subscribe", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, website, startedAt }),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(json.error ?? "Something went wrong. Please try again.");
};

/** Email sign-up for new events and posts. Double opt-in: api/subscribe.js sends a confirmation link first. */
const SubscribeForm = ({ className }: { className?: string }) => {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [startedAt] = useState(() => Date.now());
  const send = useMutation({ mutationFn: () => subscribe(email, website, startedAt) });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    send.mutate();
  };

  return (
    <section aria-labelledby="subscribe-heading" className={cn("glass-card relative rounded-2xl p-5 sm:p-6", className)}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="subscribe-heading" className="font-semibold text-foreground">
            Get new updates by email
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">One email when I post a new event or update. No spam; unsubscribe any time.</p>

          {send.isSuccess ? (
            <p role="status" className="mt-4 text-sm font-medium text-foreground">
              Check your inbox for a confirmation link to finish subscribing.
            </p>
          ) : (
            <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Honeypot value={website} onChange={setWebsite} />
              <label className="min-w-0 flex-1">
                <span className="sr-only">Email address</span>
                <input
                  type="email"
                  required
                  maxLength={200}
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(guestInputClass, "rounded-full")}
                />
              </label>
              <button
                type="submit"
                disabled={send.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {send.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                Subscribe
              </button>
            </form>
          )}
          {send.isError && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {send.error.message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default SubscribeForm;
