// GET /api/admin/session — tells the admin page whether the visitor is signed in.
import { isAuthenticated } from "../_lib/auth.js";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ authenticated: isAuthenticated(req) });
}
