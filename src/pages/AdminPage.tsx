import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Eye, ImagePlus, Loader2, LogOut, Pencil, Pin, Plus, Trash2, X } from "lucide-react";
import { StatusBadge } from "@/components/UpdateCard";
import { cn } from "@/lib/utils";
import { displayDate, type Update, type UpdateImage, type UpdateInput } from "@/lib/updates";

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */

const api = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string }).error ?? `Request failed (${res.status})`);
  return json as T;
};

/** Shrinks a photo to at most 1600px and re-encodes it as WebP before upload, to save mobile data and storage. */
const prepareImage = async (file: File): Promise<Blob> => {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not process image."))), "image/webp", 0.82),
  );
};

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const Field = ({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
  </label>
);

const Toggle = ({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="flex w-full items-center justify-between gap-4 rounded-xl border border-border p-3.5 text-left"
  >
    <span>
      <span className="block text-sm font-medium text-foreground">{label}</span>
      <span className="block text-xs text-muted-foreground">{hint}</span>
    </span>
    <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-primary" : "bg-secondary")}>
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all", checked ? "left-[1.375rem]" : "left-0.5")} />
    </span>
  </button>
);

/* ------------------------------------------------------------------ */
/* Sign in                                                             */
/* ------------------------------------------------------------------ */

const SignIn = ({ onSignedIn }: { onSignedIn: () => void }) => {
  const [password, setPassword] = useState("");
  const login = useMutation({
    mutationFn: () => api("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) }),
    onSuccess: onSignedIn,
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate();
  };

  return (
    <form onSubmit={submit} className="glass-card mx-auto max-w-sm space-y-4 rounded-2xl p-6">
      <h1 className="text-xl font-bold">Admin sign-in</h1>
      <Field label="Password">
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </Field>
      {login.isError && (
        <p role="alert" className="text-sm text-destructive">
          {login.error.message}
        </p>
      )}
      <button
        type="submit"
        disabled={login.isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {login.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        Sign in
      </button>
    </form>
  );
};

/* ------------------------------------------------------------------ */
/* Editor                                                              */
/* ------------------------------------------------------------------ */

const blank: UpdateInput = {
  kind: "event",
  title: "",
  body: "",
  location: null,
  startsOn: null,
  endsOn: null,
  linkUrl: null,
  images: [],
  published: false,
  pinned: false,
};

const Editor = ({ initial, onDone }: { initial: Update | null; onDone: () => void }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<UpdateInput>(initial ? { ...initial } : blank);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const set = <K extends keyof UpdateInput>(key: K, value: UpdateInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  const save = useMutation({
    mutationFn: () =>
      api(initial ? `/api/admin/updates?id=${initial.id}` : "/api/admin/updates", {
        method: initial ? "PUT" : "POST",
        body: JSON.stringify(form.kind === "post" ? { ...form, startsOn: null, endsOn: null } : form),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-updates"] });
      queryClient.invalidateQueries({ queryKey: ["updates"] });
      onDone();
    },
  });

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadError(null);
    const list = Array.from(files).slice(0, 12 - form.images.length);
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const blob = await prepareImage(file);
        const { url } = await api<{ url: string }>("/api/admin/upload", {
          method: "POST",
          body: blob,
          headers: { "Content-Type": "image/webp" },
        });
        setForm((f) => ({ ...f, images: [...f.images, { url, alt: "" }] }));
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Upload failed.");
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (fileInput.current) fileInput.current.value = "";
  };

  const updateImage = (index: number, patch: Partial<UpdateImage>) =>
    set("images", form.images.map((img, i) => (i === index ? { ...img, ...patch } : img)));
  const moveImage = (index: number, by: -1 | 1) => {
    const next = [...form.images];
    const target = index + by;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    set("images", next);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">{initial ? "Edit post" : "New post"}</h1>
        <button type="button" onClick={onDone} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back
        </button>
      </div>

      <div className="inline-flex gap-1 rounded-full border border-border bg-secondary/60 p-1" role="group" aria-label="Type">
        {(["event", "post"] as const).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={form.kind === k}
            onClick={() => set("kind", k)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium",
              form.kind === k ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            {k === "event" ? "Event" : "Post"}
          </button>
        ))}
      </div>

      <Field label="Title">
        <input required maxLength={160} value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
      </Field>

      <Field label="Description" hint="Line breaks are kept. Plain text only.">
        <textarea rows={6} maxLength={10000} value={form.body} onChange={(e) => set("body", e.target.value)} className={inputClass} />
      </Field>

      {form.kind === "event" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date" hint="Shows as Upcoming, Happening now or Past automatically.">
            <input type="date" value={form.startsOn ?? ""} onChange={(e) => set("startsOn", e.target.value || null)} className={inputClass} />
          </Field>
          <Field label="End date" hint="Leave empty for a one-day event.">
            <input
              type="date"
              value={form.endsOn ?? ""}
              min={form.startsOn ?? undefined}
              onChange={(e) => set("endsOn", e.target.value || null)}
              className={inputClass}
            />
          </Field>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Location" hint="Optional, e.g. Landmark Centre, Lagos">
          <input maxLength={160} value={form.location ?? ""} onChange={(e) => set("location", e.target.value || null)} className={inputClass} />
        </Field>
        <Field label="Link" hint="Optional: event page, slides, LinkedIn post…">
          <input
            type="url"
            maxLength={500}
            placeholder="https://"
            value={form.linkUrl ?? ""}
            onChange={(e) => set("linkUrl", e.target.value || null)}
            className={inputClass}
          />
        </Field>
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-foreground">Photos</span>
        <p className="mb-3 text-xs text-muted-foreground">The first photo is the cover. Up to 12. Add a short description of each for screen readers.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {form.images.map((img, i) => (
            <div key={img.url} className="overflow-hidden rounded-xl border border-border">
              <div className="relative">
                <img src={img.url} alt="" className="aspect-video w-full object-cover" />
                {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">Cover</span>}
                <div className="absolute right-2 top-2 flex gap-1">
                  <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="Move earlier" className="rounded-full bg-black/60 p-1.5 text-white disabled:opacity-40">
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} aria-label="Move later" className="rounded-full bg-black/60 p-1.5 text-white disabled:opacity-40">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => set("images", form.images.filter((_, j) => j !== i))} aria-label="Remove photo" className="rounded-full bg-black/60 p-1.5 text-white">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <input
                aria-label={`Description of photo ${i + 1}`}
                placeholder="Describe the photo"
                maxLength={300}
                value={img.alt}
                onChange={(e) => updateImage(i, { alt: e.target.value })}
                className="w-full border-0 border-t border-border bg-background px-3 py-2 text-sm focus-visible:outline-none"
              />
            </div>
          ))}
          {form.images.length < 12 && (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading > 0}
              className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
            >
              {uploading > 0 ? <Loader2 className="h-6 w-6 animate-spin" aria-hidden /> : <ImagePlus className="h-6 w-6" aria-hidden />}
              {uploading > 0 ? `Uploading ${uploading}…` : "Add photos"}
            </button>
          )}
        </div>
        <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
        {uploadError && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {uploadError}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Toggle checked={form.published} onChange={(v) => set("published", v)} label="Published" hint="Off keeps it as a private draft only you can see here." />
        <Toggle checked={form.pinned} onChange={(v) => set("pinned", v)} label="Pin to top" hint="Shows first on the home page and Updates page." />
      </div>

      {save.isError && (
        <p role="alert" className="text-sm text-destructive">
          {save.error.message}
        </p>
      )}

      <button
        type="submit"
        disabled={save.isPending || uploading > 0}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60 sm:w-auto"
      >
        {save.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {form.published ? "Save and publish" : "Save draft"}
      </button>
    </form>
  );
};

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

const Dashboard = ({ onSignedOut }: { onSignedOut: () => void }) => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Update | "new" | null>(null);
  const list = useQuery({
    queryKey: ["admin-updates"],
    queryFn: () => api<{ updates: Update[] }>("/api/admin/updates").then((r) => r.updates),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/admin/updates?id=${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-updates"] });
      queryClient.invalidateQueries({ queryKey: ["updates"] });
    },
  });
  const logout = useMutation({
    mutationFn: () => api("/api/admin/logout", { method: "POST" }),
    onSuccess: onSignedOut,
  });

  if (editing) return <Editor initial={editing === "new" ? null : editing} onDone={() => setEditing(null)} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Updates</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" aria-hidden /> New post
          </button>
          <button
            type="button"
            onClick={() => logout.mutate()}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" aria-hidden /> Sign out
          </button>
        </div>
      </div>

      {list.isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-label="Loading" />}
      {list.isError && <p className="text-sm text-destructive">{list.error.message}</p>}
      {list.data?.length === 0 && <p className="text-muted-foreground">No posts yet. Tap “New post” to share your first event.</p>}

      <ul className="space-y-3">
        {list.data?.map((u) => (
          <li key={u.id} className="flex items-center gap-3 rounded-2xl border border-border p-3">
            <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
              {u.images[0] && <img src={u.images[0].url} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{u.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className={cn("rounded-full px-2 py-0.5 font-medium", u.published ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-secondary")}>
                  {u.published ? "Published" : "Draft"}
                </span>
                {u.pinned && <Pin className="h-3.5 w-3.5" aria-label="Pinned" />}
                <StatusBadge update={u} className="px-2 py-0.5" />
                <span>{displayDate(u)}</span>
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              {u.published && (
                <Link to={`/updates/${u.id}`} aria-label="View on site" className="rounded-full p-2 text-muted-foreground hover:text-primary">
                  <Eye className="h-4 w-4" />
                </Link>
              )}
              <button type="button" onClick={() => setEditing(u)} aria-label="Edit" className="rounded-full p-2 text-muted-foreground hover:text-primary">
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Delete"
                disabled={remove.isPending}
                onClick={() => {
                  if (window.confirm(`Delete “${u.title}” and its photos? This can't be undone.`)) remove.mutate(u.id);
                }}
                className="rounded-full p-2 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const AdminPage = () => {
  const queryClient = useQueryClient();
  const session = useQuery({
    queryKey: ["admin-session"],
    queryFn: () => api<{ authenticated: boolean }>("/api/admin/session"),
    retry: false,
  });

  // Keep this page out of search engines.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    document.title = "Admin | Olanrewaju Illias";
    return () => meta.remove();
  }, []);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-session"] });

  return (
    <div className="container mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      {session.isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading" />}
      {session.isError && <p className="text-center text-destructive">The admin API isn't reachable: {session.error.message}</p>}
      {session.data && (session.data.authenticated ? <Dashboard onSignedOut={refresh} /> : <SignIn onSignedIn={refresh} />)}
    </div>
  );
};

export default AdminPage;
