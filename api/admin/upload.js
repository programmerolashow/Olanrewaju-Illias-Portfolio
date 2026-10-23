// POST /api/admin/upload — raw image bytes in the body (Content-Type: image/webp, image/jpeg or image/png).
// Stores the photo in Neon Object Storage and returns { url }. Admin only.
// The admin page shrinks photos to ~1600px WebP first, so they stay well under Vercel's 4.5 MB request limit.
import { requireAdmin } from "../_lib/auth.js";
import { isAllowedImage, putImage } from "../_lib/storage.js";

const MAX_BYTES = 4 * 1024 * 1024;

/** Vercel may have buffered the body already; use that if so, otherwise read the stream. */
const bufferedBody = (req) => {
  try {
    return Buffer.isBuffer(req.body) ? req.body : null;
  } catch {
    // Vercel's lazy body parser throws for content types it doesn't know; the stream is still readable then.
    return null;
  }
};

const readRaw = (req) =>
  new Promise((resolve, reject) => {
    const buffered = bufferedBody(req);
    if (buffered) {
      if (buffered.length > MAX_BYTES) reject(Object.assign(new Error("Photo is too large (max 4 MB)."), { status: 413 }));
      else resolve(buffered);
      return;
    }
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BYTES) {
        reject(Object.assign(new Error("Photo is too large (max 4 MB)."), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }
  if (!requireAdmin(req, res)) return;

  const type = (req.headers["content-type"] ?? "").split(";")[0].trim();
  try {
    const bytes = await readRaw(req);
    if (!isAllowedImage(type, bytes)) return res.status(415).json({ error: "Only WebP, JPEG or PNG photos can be uploaded." });
    const url = await putImage(bytes, type);
    return res.status(201).json({ url });
  } catch (error) {
    if (error.status === 413) return res.status(413).json({ error: error.message });
    console.error("POST /api/admin/upload failed", error);
    // Only the signed-in admin sees this, so name the cause instead of a bare "Upload failed."
    if (error.code === "STORAGE_NOT_CONFIGURED") return res.status(500).json({ error: error.message });
    const status = error.$metadata?.httpStatusCode;
    return res.status(500).json({
      error: `Upload failed: photo storage rejected the file${error.name ? ` (${error.name}${status ? `, HTTP ${status}` : ""})` : ""}.`,
    });
  }
}
