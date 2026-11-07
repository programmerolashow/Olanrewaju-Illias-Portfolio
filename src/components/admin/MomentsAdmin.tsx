// /admin → Moments: add, edit, reorder, hide and delete the photos and videos on the Moments page.
import { useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowLeft, ArrowUp, EyeOff, ImagePlus, Loader2, Pencil, Play, Plus, Trash2, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryItemSize } from "@/data/gallery";
import type { Moment, MomentInput } from "@/lib/moments";
import { Field, MAX_VIDEO_BYTES, Toggle, VIDEO_TYPES, api, grabPoster, inputClass, pillButton, prepareImage, uploadBlob, uploadVideo } from "@/components/admin/shared";

const sizes: { value: GalleryItemSize; label: string; hint: string; preview: string }[] = [
  { value: "square", label: "Square", hint: "1 × 1", preview: "aspect-square w-40" },
  { value: "tall", label: "Tall", hint: "1 × 2", preview: "aspect-[1/2] w-32" },
  { value: "wide", label: "Wide", hint: "2 × 1", preview: "aspect-[2/1] w-64" },
  { value: "large", label: "Large", hint: "2 × 2", preview: "aspect-square w-64" },
];

const focusPresets = ["center", "top", "center 20%", "center 30%", "center 40%", "center 60%", "bottom"];

const blank: MomentInput = {
  type: "image",
  src: "",
  poster: undefined,
  title: "",
  caption: "",
  category: "",
  date: undefined,
  location: undefined,
  size: "square",
  focus: undefined,
  published: true,
};

const useAdminMoments = () =>
  useQuery({
    queryKey: ["admin-moments"],
    queryFn: () => api<{ moments: Moment[] }>("/api/admin/moments").then((r) => r.moments),
  });

/* ------------------------------------------------------------------ */
/* Editor                                                              */
/* ------------------------------------------------------------------ */

const MomentEditor = ({ initial, categories, onDone }: { initial: Moment | null; categories: string[]; onDone: () => void }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<MomentInput>(initial ? { ...initial } : blank);
  const [uploading, setUploading] = useState<{ label: string; progress?: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const set = <K extends keyof MomentInput>(key: K, value: MomentInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  const save = useMutation({
    mutationFn: () =>
      api(initial ? `/api/admin/moments?id=${initial.id}` : "/api/admin/moments", {
        method: initial ? "PUT" : "POST",
        body: JSON.stringify(form),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-moments"] });
      queryClient.invalidateQueries({ queryKey: ["moments"] });
      onDone();
    },
  });

  /** One file: a photo is shrunk to ~1600px WebP; a video goes straight to storage with a poster frame. */
  const pickFile = async (file: File | undefined) => {
    if (fileInput.current) fileInput.current.value = "";
    if (!file) return;
    setUploadError(null);
    const videoType = file.type || (file.name.toLowerCase().endsWith(".mov") ? "video/quicktime" : "");
    try {
      if (file.type.startsWith("image/")) {
        setUploading({ label: "Uploading photo…" });
        const { displayBlob } = await prepareImage(file);
        const src = await uploadBlob(displayBlob);
        setForm((f) => ({ ...f, type: "image", src, poster: undefined }));
      } else if (VIDEO_TYPES.includes(videoType)) {
        if (file.size > MAX_VIDEO_BYTES) throw new Error("That video is over 200 MB. Trim or compress it and try again.");
        setUploading({ label: `Uploading ${file.name}`, progress: 0 });
        const posterBlob = await grabPoster(file);
        const [src, poster] = await Promise.all([
          uploadVideo(file, videoType, (progress) => setUploading({ label: `Uploading ${file.name}`, progress })),
          posterBlob ? uploadBlob(posterBlob).catch(() => undefined) : undefined,
        ]);
        setForm((f) => ({ ...f, type: "video", src, poster }));
      } else {
        throw new Error("Choose a photo, or an MP4, WebM or MOV video.");
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate();
  };

  const shape = sizes.find((s) => s.value === form.size) ?? sizes[0];

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">{initial ? "Edit moment" : "New moment"}</h1>
        <button type="button" onClick={onDone} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back
        </button>
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-foreground">Photo or video</span>
        <p className="mb-3 text-xs text-muted-foreground">
          Videos play muted on the card and with sound when opened, so short clips (5–30 seconds, MP4) work best.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          {/* Preview at the card's shape, with the crop position applied, so you can see what visitors will see. */}
          {form.src && (
            <div className={cn("max-w-full overflow-hidden rounded-xl border border-border bg-secondary", shape.preview)}>
              {form.type === "video" ? (
                <video src={form.src} poster={form.poster} muted loop autoPlay playsInline style={{ objectPosition: form.focus }} className="h-full w-full object-cover" />
              ) : (
                <img src={form.src} alt="" style={{ objectPosition: form.focus }} className="h-full w-full object-cover" />
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading !== null}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-6 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60",
              form.src ? "h-24" : "aspect-video w-full max-w-sm",
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
                <span className="max-w-[14rem] truncate">{uploading.label}</span>
                {uploading.progress !== undefined && <span className="text-xs">{Math.round(uploading.progress * 100)}%</span>}
              </>
            ) : (
              <>
                <span className="flex gap-2">
                  <ImagePlus className="h-6 w-6" aria-hidden />
                  <Video className="h-6 w-6" aria-hidden />
                </span>
                {form.src ? "Replace file" : "Choose a photo or video"}
              </>
            )}
          </button>
        </div>
        <input ref={fileInput} type="file" accept="image/*,video/mp4,video/webm,video/quicktime,.mov" hidden onChange={(e) => pickFile(e.target.files?.[0])} />
        {uploadError && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {uploadError}
          </p>
        )}
      </div>

      <Field label="Title" hint="Short headline on the card.">
        <input required maxLength={120} value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
      </Field>

      <Field label="Caption" hint="One line, shown on hover and when the photo is opened.">
        <input maxLength={300} value={form.caption ?? ""} onChange={(e) => set("caption", e.target.value)} className={inputClass} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Category" hint="The filter chip, e.g. Events.">
          <input required maxLength={40} list="moment-categories" value={form.category} onChange={(e) => set("category", e.target.value)} className={inputClass} />
          <datalist id="moment-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Date" hint="Optional, e.g. Nov 2026.">
          <input maxLength={40} value={form.date ?? ""} onChange={(e) => set("date", e.target.value || undefined)} className={inputClass} />
        </Field>
        <Field label="Location" hint="Optional, e.g. Lagos, Nigeria.">
          <input maxLength={120} value={form.location ?? ""} onChange={(e) => set("location", e.target.value || undefined)} className={inputClass} />
        </Field>
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-foreground">Card shape</span>
        <div className="inline-flex flex-wrap gap-1 rounded-full border border-border bg-secondary/60 p-1" role="group" aria-label="Card shape">
          {sizes.map((s) => (
            <button
              key={s.value}
              type="button"
              aria-pressed={form.size === s.value}
              onClick={() => set("size", s.value)}
              className={cn("rounded-full px-4 py-1.5 text-sm font-medium", form.size === s.value ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
            >
              {s.label} <span className="opacity-70">{s.hint}</span>
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Mix them: one Large, a few Tall or Wide, the rest Square looks best.</p>
      </div>

      <Field label="Crop position" hint="Moves the crop when a card cuts off someone's head. The preview above updates as you type.">
        <input
          maxLength={40}
          list="moment-focus"
          placeholder="center"
          value={form.focus ?? ""}
          onChange={(e) => set("focus", e.target.value || undefined)}
          className={inputClass}
        />
        <datalist id="moment-focus">
          {focusPresets.map((f) => (
            <option key={f} value={f} />
          ))}
        </datalist>
      </Field>

      <Toggle checked={form.published} onChange={(v) => set("published", v)} label="Show on the Moments page" hint="Off hides it from visitors without deleting it." />

      {save.isError && (
        <p role="alert" className="text-sm text-destructive">
          {save.error.message}
        </p>
      )}

      <button
        type="submit"
        disabled={save.isPending || uploading !== null || !form.src}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60 sm:w-auto"
      >
        {save.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {initial ? "Save changes" : "Add to Moments"}
      </button>
    </form>
  );
};

/* ------------------------------------------------------------------ */
/* List                                                                */
/* ------------------------------------------------------------------ */

const MomentsAdmin = () => {
  const queryClient = useQueryClient();
  const list = useAdminMoments();
  const [editing, setEditing] = useState<Moment | "new" | null>(null);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-moments"] });
    queryClient.invalidateQueries({ queryKey: ["moments"] });
  };
  const reorder = useMutation({
    mutationFn: (ids: string[]) => api("/api/admin/moments", { method: "PATCH", body: JSON.stringify({ ids }) }),
    // Show the new order straight away; the refetch afterwards confirms it.
    onMutate: (ids) => {
      const byId = new Map((list.data ?? []).map((m) => [m.id, m]));
      queryClient.setQueryData(["admin-moments"], ids.map((id) => byId.get(id)).filter(Boolean));
    },
    onSettled: refresh,
    onError: (error) => window.alert(error.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/admin/moments?id=${id}`, { method: "DELETE" }),
    onSuccess: refresh,
    onError: (error) => window.alert(error.message),
  });

  const items = list.data ?? [];
  const categories = Array.from(new Set(items.map((m) => m.category)));

  if (editing) {
    return <MomentEditor initial={editing === "new" ? null : editing} categories={categories} onDone={() => setEditing(null)} />;
  }

  const move = (index: number, by: -1 | 1) => {
    const ids = items.map((m) => m.id);
    const target = index + by;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorder.mutate(ids);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {items.length} moment{items.length === 1 ? "" : "s"}, shown on the Moments page in this order. New ones go to the top.
        </p>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" aria-hidden /> New moment
        </button>
      </div>

      {list.isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-label="Loading" />}
      {list.isError && <p className="text-sm text-destructive">{list.error.message}</p>}
      {list.data?.length === 0 && <p className="text-muted-foreground">No moments yet. Tap “New moment” to add a photo or video.</p>}

      <ul className="space-y-3">
        {items.map((m, i) => (
          <li key={m.id} className="flex items-center gap-3 rounded-2xl border border-border p-3">
            <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
              {(m.type === "image" ? m.src : m.poster) && (
                <img src={m.type === "image" ? m.src : m.poster} alt="" style={{ objectPosition: m.focus }} className="h-full w-full object-cover" />
              )}
              {m.type === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-white">
                  <Play className="h-5 w-5 fill-current" aria-label="Video" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{m.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {!m.published && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 font-medium">
                    <EyeOff className="h-3 w-3" aria-hidden /> Hidden
                  </span>
                )}
                <span>{m.category}</span>
                <span>· {sizes.find((s) => s.value === m.size)?.label ?? "Square"}</span>
                {m.date && <span>· {m.date}</span>}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0 || reorder.isPending} aria-label={`Move “${m.title}” up`} className={pillButton}>
                <ArrowUp className="h-4 w-4" aria-hidden />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1 || reorder.isPending} aria-label={`Move “${m.title}” down`} className={pillButton}>
                <ArrowDown className="h-4 w-4" aria-hidden />
              </button>
              <button type="button" onClick={() => setEditing(m)} aria-label={`Edit “${m.title}”`} className={pillButton}>
                <Pencil className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => window.confirm(`Delete “${m.title}”? This can't be undone.`) && remove.mutate(m.id)}
                aria-label={`Delete “${m.title}”`}
                className={cn(pillButton, "hover:text-destructive")}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MomentsAdmin;
