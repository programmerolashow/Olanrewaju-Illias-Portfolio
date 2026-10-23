import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { GuestField, Honeypot, SubmittedNote, guestInputClass } from "@/components/GuestForm";
import { initials, shortDate, submitGuest, useComments } from "@/lib/feedback";

const CommentForm = ({ updateId }: { updateId: string }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [startedAt, setStartedAt] = useState(() => Date.now());

  const send = useMutation({
    mutationFn: () => submitGuest("/api/comments", { updateId, name, email, body, website }, startedAt),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    send.mutate();
  };

  if (send.isSuccess) {
    return (
      <SubmittedNote
        title="Thanks for your comment!"
        againLabel="Leave another"
        onAgain={() => {
          setBody("");
          setStartedAt(Date.now());
          send.reset();
        }}
      >
        It will show up here once it has been approved.
      </SubmittedNote>
    );
  }

  return (
    <form onSubmit={submit} className="relative space-y-4">
      <Honeypot value={website} onChange={setWebsite} />
      <div className="grid gap-4 sm:grid-cols-2">
        <GuestField label="Name">
          <input required minLength={2} maxLength={80} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={guestInputClass} />
        </GuestField>
        <GuestField label="Email" optional hint="Private, never shown.">
          <input type="email" maxLength={200} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={guestInputClass} />
        </GuestField>
      </div>
      <GuestField label="Comment">
        <textarea required minLength={2} maxLength={2000} rows={4} value={body} onChange={(e) => setBody(e.target.value)} className={guestInputClass} />
      </GuestField>
      {send.isError && (
        <p role="alert" className="text-sm text-destructive">
          {send.error.message}
        </p>
      )}
      <button
        type="submit"
        disabled={send.isPending}
        className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        style={{ background: "var(--gradient-primary)" }}
      >
        {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
        Post comment
      </button>
    </form>
  );
};

/** Approved comments and a form to add one, under an event or post. */
const UpdateComments = ({ updateId }: { updateId: string }) => {
  const { data, isLoading } = useComments(updateId);
  const comments = data ?? [];

  return (
    <section aria-labelledby="comments-heading" className="mt-14 max-w-3xl border-t border-border pt-10">
      <h2 id="comments-heading" className="flex items-center gap-2 text-xl font-bold text-foreground md:text-2xl">
        <MessageCircle className="h-5 w-5 text-primary" aria-hidden />
        Comments
        {comments.length > 0 && <span className="text-base font-medium text-muted-foreground">({comments.length})</span>}
      </h2>

      {isLoading ? (
        <Loader2 className="mt-6 h-5 w-5 animate-spin text-muted-foreground" aria-label="Loading comments" />
      ) : comments.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No comments yet. Be the first to share your thoughts.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          <AnimatePresence initial={false}>
            {comments.map((c, i) => (
              <motion.li
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: Math.min(i, 5) * 0.05 }}
                className="flex gap-3"
              >
                <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {initials(c.name)}
                </span>
                <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-border bg-secondary/40 px-4 py-3">
                  <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="font-semibold text-foreground">{c.name}</span>
                    <time dateTime={c.createdAt} className="text-xs text-muted-foreground">
                      {shortDate(c.createdAt)}
                    </time>
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm text-foreground/90 [overflow-wrap:anywhere]">{c.body}</p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <div className="glass-card mt-8 rounded-2xl p-5 sm:p-6">
        <h3 className="mb-4 font-semibold text-foreground">Leave a comment</h3>
        <CommentForm updateId={updateId} />
      </div>
    </section>
  );
};

export default UpdateComments;
