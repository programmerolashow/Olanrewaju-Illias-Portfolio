// Link-preview (SEO / Open Graph / X card) tags, shared by the build (vite.config.ts writes one HTML file per
// static page and project) and by api/share/update.js (events and posts, rendered per request).
// The tags live between the seo:start / seo:end markers in index.html so they can be swapped as one block.
//
// What each network reads:
//   Facebook, Instagram DMs, WhatsApp, LinkedIn: og:title, og:description, og:image (+ size/type/alt), og:url
//   X: twitter:card=summary_large_image, twitter:title, twitter:description, twitter:image (falls back to og:*)
// Images should be absolute https URLs, JPEG, 1200×630, under ~300 KB (WhatsApp's practical limit).

const esc = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Collapses whitespace and cuts at a word boundary, for descriptions. */
export const excerpt = (text, max = 200) => {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : cut.length)}…`;
};

/**
 * @param {{ siteName: string, twitter?: string, title: string, description: string, url: string,
 *   image: string, imageWidth?: number, imageHeight?: number, imageAlt?: string, type?: string,
 *   publishedTime?: string }} m
 */
export const renderSeo = (m) => {
  const imageType = /\.png(\?|$)/i.test(m.image) ? "image/png" : /\.webp(\?|$)/i.test(m.image) ? "image/webp" : "image/jpeg";
  const tags = [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    `<link rel="canonical" href="${esc(m.url)}" />`,
    `<meta property="og:type" content="${esc(m.type ?? "website")}" />`,
    `<meta property="og:site_name" content="${esc(m.siteName)}" />`,
    `<meta property="og:url" content="${esc(m.url)}" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:locale" content="en_NG" />`,
    `<meta property="og:image" content="${esc(m.image)}" />`,
    `<meta property="og:image:secure_url" content="${esc(m.image)}" />`,
    `<meta property="og:image:type" content="${imageType}" />`,
    ...(m.imageWidth && m.imageHeight
      ? [`<meta property="og:image:width" content="${m.imageWidth}" />`, `<meta property="og:image:height" content="${m.imageHeight}" />`]
      : []),
    `<meta property="og:image:alt" content="${esc(m.imageAlt ?? m.title)}" />`,
    ...(m.publishedTime ? [`<meta property="article:published_time" content="${esc(m.publishedTime)}" />`] : []),
    `<meta name="twitter:card" content="summary_large_image" />`,
    ...(m.twitter ? [`<meta name="twitter:site" content="${esc(m.twitter)}" />`] : []),
    `<meta name="twitter:title" content="${esc(m.title)}" />`,
    `<meta name="twitter:description" content="${esc(m.description)}" />`,
    `<meta name="twitter:image" content="${esc(m.image)}" />`,
    `<meta name="twitter:image:alt" content="${esc(m.imageAlt ?? m.title)}" />`,
  ];
  return `<!--seo:start-->\n    ${tags.join("\n    ")}\n    <!--seo:end-->`;
};

const BLOCK = /<!--seo:start-->[\s\S]*?<!--seo:end-->/;

/** Replaces the tag block in a built index.html. Throws if the markers are missing, so a broken template fails loudly. */
export const replaceSeo = (html, meta) => {
  if (!BLOCK.test(html)) throw new Error("index.html is missing the <!--seo:start--> … <!--seo:end--> block.");
  return html.replace(BLOCK, () => renderSeo(meta));
};
