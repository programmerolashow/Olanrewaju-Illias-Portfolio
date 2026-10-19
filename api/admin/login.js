// POST /api/admin/login — { password } → sets the admin session cookie.
import { sql } from "../_lib/db.js";
import { clientIp, passwordMatches, readBody, sameOrigin, setSessionCookie } from "../_lib/auth.js";

const MAX_FAILURES = 5;
const WINDOW_MINUTES = 15;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }
  if (!sameOrigin(req)) return res.status(403).json({ error: "Cross-site request blocked." });

  const ip = clientIp(req);
  try {
    const [{ count }] = await sql`
      select count(*)::int as count from admin_login_attempts
      where ip = ${ip} and attempted_at > now() - make_interval(mins => ${WINDOW_MINUTES})`;
    if (count >= MAX_FAILURES) {
      return res.status(429).json({ error: `Too many attempts. Try again in ${WINDOW_MINUTES} minutes.` });
    }

    const body = readBody(req);
    if (!passwordMatches(body?.password)) {
      await sql`insert into admin_login_attempts (ip) values (${ip})`;
      return res.status(401).json({ error: "Wrong password." });
    }

    await sql`delete from admin_login_attempts where ip = ${ip} or attempted_at < now() - interval '1 day'`;
    setSessionCookie(res);
    return res.status(200).json({ authenticated: true });
  } catch (error) {
    console.error("POST /api/admin/login failed", error);
    return res.status(500).json({ error: "Sign-in is not configured correctly." });
  }
}
