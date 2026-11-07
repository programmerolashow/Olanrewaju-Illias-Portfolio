// Netlify: runs the same api/ handlers Vercel runs, as one function, so the Netlify copy of the site has a working
// contact form, updates, articles, recommendations, comments and admin. Handlers are written for Vercel's
// (req, res) style; toReq and createRes below provide the small part of it they use (see scripts/vite-api-dev.ts
// for the same idea in dev). Keep ROUTES in step with the files in api/.
import articles from "../../api/articles.js";
import comments from "../../api/comments.js";
import contact from "../../api/contact.js";
import feed from "../../api/feed.js";
import recommendations from "../../api/recommendations.js";
import subscribe from "../../api/subscribe.js";
import likes from "../../api/likes.js";
import moments from "../../api/moments.js";
import updates from "../../api/updates.js";
import adminArticles from "../../api/admin/articles.js";
import adminAuth from "../../api/admin/auth.js";
import moderation from "../../api/admin/moderation.js";
import adminSubscribers from "../../api/admin/subscribers.js";
import adminMoments from "../../api/admin/moments.js";
import adminUpdates from "../../api/admin/updates.js";
import upload from "../../api/admin/upload.js";
import videoUpload from "../../api/admin/video-upload.js";
import shareUpdate from "../../api/share/update.js";

const ROUTES = {
  "/api/articles": articles,
  "/api/comments": comments,
  "/api/contact": contact,
  "/api/feed": feed,
  "/api/recommendations": recommendations,
  "/api/subscribe": subscribe,
  "/api/likes": likes,
  "/api/moments": moments,
  "/api/updates": updates,
  "/api/admin/articles": adminArticles,
  "/api/admin/login": adminAuth,
  "/api/admin/logout": adminAuth,
  "/api/admin/session": adminAuth,
  "/api/admin/moderation": moderation,
  "/api/admin/subscribers": adminSubscribers,
  "/api/admin/moments": adminMoments,
  "/api/admin/updates": adminUpdates,
  "/api/admin/upload": upload,
  "/api/admin/video-upload": videoUpload,
};

const toReq = async (request, context, url, extraQuery = {}) => {
  const headers = Object.fromEntries(request.headers);
  headers.host = url.host;
  // Netlify's own record of the caller, so rate limits can't be dodged with a forged X-Forwarded-For.
  const ip = context.ip ?? headers["x-nf-client-connection-ip"];
  if (ip) headers["x-forwarded-for"] = ip;

  let body;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const bytes = Buffer.from(await request.arrayBuffer());
    if ((headers["content-type"] ?? "").startsWith("application/json")) {
      try {
        body = bytes.length ? JSON.parse(bytes.toString("utf8")) : null;
      } catch {
        body = null;
      }
    } else {
      // Raw uploads: api/admin/upload.js uses an already-buffered body as-is.
      body = bytes;
    }
  }

  return {
    method: request.method,
    url: url.pathname + url.search,
    headers,
    query: { ...Object.fromEntries(url.searchParams), ...extraQuery },
    body,
  };
};

const createRes = () => {
  const headers = new Headers();
  let status = 200;
  let body = null;
  const res = {
    headersSent: false,
    setHeader(name, value) {
      headers.delete(name);
      for (const v of Array.isArray(value) ? value : [value]) headers.append(name, String(v));
      return res;
    },
    getHeader: (name) => headers.get(name) ?? undefined,
    status(code) {
      status = code;
      return res;
    },
    json(payload) {
      if (!headers.has("content-type")) headers.set("content-type", "application/json; charset=utf-8");
      return res.send(JSON.stringify(payload));
    },
    send(payload) {
      body = payload ?? null;
      res.headersSent = true;
      return res;
    },
    end: (payload) => res.send(payload),
  };
  const toResponse = () => new Response([204, 304].includes(status) ? null : body, { status, headers });
  return { res, toResponse };
};

export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "");

  // /updates/:id gets that post's own link-preview tags, like vercel.json's rewrite to api/share/update.
  const share = path.match(/^\/updates\/([^/]+)$/);
  const handler = share ? shareUpdate : ROUTES[path];
  if (!handler) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  const req = await toReq(request, context, url, share ? { id: decodeURIComponent(share[1]) } : {});
  const { res, toResponse } = createRes();
  try {
    await handler(req, res);
  } catch (error) {
    console.error(`${request.method} ${path} failed`, error);
    if (!res.headersSent) res.status(500).json({ error: "Something went wrong." });
  }
  return toResponse();
};

export const config = {
  path: ["/api/*", "/updates/*"],
};
