import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";
import { GuestField, Honeypot, SubmittedNote, guestInputClass } from "@/components/GuestForm";
import { relationshipLabels, submitGuest, type Relationship } from "@/lib/feedback";

const empty = { name: "", relationship: "" as Relationship | "", role: "", company: "", body: "", linkedinUrl: "", email: "" };

const RecommendationForm = () => {
  const [form, setForm] = useState(empty);
  const [website, setWebsite] = useState("");
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const set = <K extends keyof typeof empty>(key: K, value: (typeof empty)[K]) => setForm((f) => ({ ...f, [key]: value }));

  const send = useMutation({
    mutationFn: () => submitGuest("/api/recommendations", { ...form, website }, startedAt),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    send.mutate();
  };

  if (send.isSuccess) {
    return (
      <SubmittedNote
        title="Thank you, truly."
        againLabel="Write another"
        onAgain={() => {
          setForm(empty);
          setStartedAt(Date.now());
          send.reset();
        }}
      >
        Your recommendation has been received and will appear here once Illias has reviewed it.
      </SubmittedNote>
    );
  }

  return (
    <form onSubmit={submit} className="relative space-y-4">
      <Honeypot value={website} onChange={setWebsite} />

      <div className="grid gap-4 sm:grid-cols-2">
        <GuestField label="Your name">
          <input required minLength={2} maxLength={100} autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} className={guestInputClass} />
        </GuestField>
        <GuestField label="How do you know Illias?">
          <select
            required
            value={form.relationship}
            onChange={(e) => set("relationship", e.target.value as Relationship)}
            className={guestInputClass}
          >
            <option value="" disabled>
              Choose one
            </option>
            {Object.entries(relationshipLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </GuestField>
        <GuestField label="Your role" optional>
          <input maxLength={120} placeholder="e.g. Product Lead" autoComplete="organization-title" value={form.role} onChange={(e) => set("role", e.target.value)} className={guestInputClass} />
        </GuestField>
        <GuestField label="Company, school or community" optional>
          <input maxLength={120} placeholder="e.g. Qorelly, UNILORIN, GDG Ilorin" autoComplete="organization" value={form.company} onChange={(e) => set("company", e.target.value)} className={guestInputClass} />
        </GuestField>
      </div>

      <GuestField label="Your recommendation" hint="What did you work on together? What stood out: skills, attitude, impact? 40–2000 characters.">
        <textarea
          required
          minLength={40}
          maxLength={2000}
          rows={6}
          value={form.body}
          onChange={(e) => set("body", e.target.value)}
          className={guestInputClass}
        />
      </GuestField>
      <p className="-mt-2 text-right text-xs text-muted-foreground" aria-live="polite">
        {form.body.trim().length}/2000
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <GuestField label="LinkedIn profile" optional hint="Shown with your name so recruiters can verify it.">
          <input type="url" maxLength={300} placeholder="https://linkedin.com/in/…" value={form.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)} className={guestInputClass} />
        </GuestField>
        <GuestField label="Email" optional hint="Private. Only used if Illias needs to confirm it's you.">
          <input type="email" maxLength={200} autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={guestInputClass} />
        </GuestField>
      </div>

      {send.isError && (
        <p role="alert" className="text-sm text-destructive">
          {send.error.message}
        </p>
      )}

      <button
        type="submit"
        disabled={send.isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-60 sm:w-auto"
        style={{ background: "var(--gradient-primary)" }}
      >
        {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
        Submit recommendation
      </button>
      <p className="text-xs text-muted-foreground">Recommendations are reviewed before they're published. Your email is never shown.</p>
    </form>
  );
};

export default RecommendationForm;
