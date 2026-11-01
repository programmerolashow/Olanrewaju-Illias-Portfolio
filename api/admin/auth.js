// Admin sign-in, sign-out and session check as one function, so the deployment stays under Vercel Hobby's
// 12-function limit. The public URLs are unchanged: vercel.json rewrites /api/admin/login, /logout and /session
// here with ?action=…; in dev and on Netlify the action is read from the path instead.
import login from "../_lib/admin-auth/login.js";
import logout from "../_lib/admin-auth/logout.js";
import session from "../_lib/admin-auth/session.js";

const actions = { login, logout, session };

export default function handler(req, res) {
  const fromPath = new URL(req.url ?? "/", "http://localhost").pathname.split("/").pop();
  const action = typeof req.query.action === "string" ? req.query.action : fromPath;
  const run = actions[action];
  if (!run) return res.status(404).json({ error: "Not found." });
  return run(req, res);
}
