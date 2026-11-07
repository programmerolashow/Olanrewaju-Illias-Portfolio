// POST /api/admin/video-upload — JSON { type, size }. Returns { uploadUrl, headers, url }: the browser PUTs the
// video to uploadUrl with those headers, then saves url on the post. Admin only.
// Videos skip our API because Vercel caps request bodies at 4.5 MB; the bucket takes them directly.
import { readBody, requireAdmin } from "../_lib/auth.js";
import { MAX_VIDEO_BYTES, VIDEO_TYPES, presignVideoUpload } from "../_lib/storage.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }
  if (!requireAdmin(req, res)) return;

  const { type, size } = readBody(req) ?? {};
  if (!VIDEO_TYPES[type]) return res.status(415).json({ error: "Only MP4, WebM or MOV videos can be uploaded." });
  if (!Number.isInteger(size) || size <= 0) return res.status(400).json({ error: "The video's size is missing." });
  if (size > MAX_VIDEO_BYTES) return res.status(413).json({ error: "That video is over 200 MB. Trim or compress it and try again." });

  try {
    return res.status(201).json(await presignVideoUpload(type, size));
  } catch (error) {
    console.error("POST /api/admin/video-upload failed", error);
    if (error.code === "STORAGE_NOT_CONFIGURED") return res.status(500).json({ error: error.message });
    return res.status(500).json({ error: "Could not start the video upload." });
  }
}
