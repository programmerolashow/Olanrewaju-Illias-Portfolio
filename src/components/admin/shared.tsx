// Helpers shared by the /admin editors: API calls, photo and video uploads, and form controls.
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */

export const api = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string }).error ?? `Request failed (${res.status})`);
  return json as T;
};

export const encode = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not process image."))), type, quality),
  );

/**
 * From one photo, makes:
 *  - display: at most 1600px, WebP (JPEG on Safari, which can't encode WebP and would silently return a PNG)
 *  - share:   1200×630 centre crop as JPEG, the size and format LinkedIn, X, Facebook and WhatsApp all accept
 *             for link previews (used when this photo is a post's cover)
 */
export const prepareImage = async (file: File) => {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const display = document.createElement("canvas");
  display.width = Math.round(bitmap.width * scale);
  display.height = Math.round(bitmap.height * scale);
  display.getContext("2d")!.drawImage(bitmap, 0, 0, display.width, display.height);
  let displayBlob = await encode(display, "image/webp", 0.82);
  if (displayBlob.type !== "image/webp") displayBlob = await encode(display, "image/jpeg", 0.85);

  const share = document.createElement("canvas");
  share.width = 1200;
  share.height = 630;
  const cover = Math.max(1200 / bitmap.width, 630 / bitmap.height);
  const w = bitmap.width * cover;
  const h = bitmap.height * cover;
  share.getContext("2d")!.drawImage(bitmap, (1200 - w) / 2, (630 - h) / 2, w, h);
  const shareBlob = await encode(share, "image/jpeg", 0.82);

  bitmap.close();
  return { displayBlob, shareBlob };
};

export const uploadBlob = (blob: Blob) =>
  api<{ url: string }>("/api/admin/upload", { method: "POST", body: blob, headers: { "Content-Type": blob.type } }).then(
    (r) => r.url,
  );

export const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
export const MAX_VIDEOS = 4;

/**
 * A still from about one second in (or the middle of a shorter clip), at most 1600px, as WebP (JPEG on Safari).
 * Returns null when this browser can't decode the file, e.g. an HEVC .mov in Chrome; the video still uploads.
 */
export const grabPoster = (file: File) =>
  new Promise<Blob | null>((resolve) => {
    const video = document.createElement("video");
    const src = URL.createObjectURL(file);
    const done = (blob: Blob | null) => {
      URL.revokeObjectURL(src);
      resolve(blob);
    };
    const timeout = window.setTimeout(() => done(null), 15_000);
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onerror = () => {
      window.clearTimeout(timeout);
      done(null);
    };
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, (video.duration || 0) / 2);
    };
    video.onseeked = async () => {
      window.clearTimeout(timeout);
      if (!video.videoWidth) return done(null);
      const scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
      try {
        let blob = await encode(canvas, "image/webp", 0.82);
        if (blob.type !== "image/webp") blob = await encode(canvas, "image/jpeg", 0.85);
        done(blob);
      } catch {
        done(null);
      }
    };
    video.src = src;
  });

/** Asks the API for a signed URL, then sends the file straight to storage, reporting progress from 0 to 1. */
export const uploadVideo = async (file: File, type: string, onProgress: (fraction: number) => void) => {
  const { uploadUrl, headers, url } = await api<{ uploadUrl: string; headers: Record<string, string>; url: string }>(
    "/api/admin/video-upload",
    { method: "POST", body: JSON.stringify({ type, size: file.size }) },
  );
  // XHR rather than fetch: fetch can't report upload progress.
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    for (const [name, value] of Object.entries(headers)) xhr.setRequestHeader(name, value);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Video upload failed: storage returned HTTP ${xhr.status}.`));
    // A blocked CORS preflight lands here with no status: the bucket's CORS rules don't list this site.
    xhr.onerror = () => reject(new Error("Video upload failed. If this keeps happening, run `npm run storage:cors` to allow this site."));
    xhr.send(file);
  });
  return url;
};

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

export const inputClass =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const Field = ({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
  </label>
);

export const Toggle = ({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint: string }) => (
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


export const pillButton =
  "inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-60";
