/**
 * V2 pages generated at build time from the same data the classic (React) pages use, so the two designs can't
 * drift: /v2/projects and every /v2/projects/<slug> (src/data/projects.ts), /v2/approach (src/data/approach.ts), /v2/roadmap (src/data/roadmap.ts). vite.config.ts turns each into a file
 * in dist/ (and serves it in dev) through fillV2, which adds the shared partials and the link-preview tags.
 * Hand-written V2 pages (public/v2.html, public/v2/*.html) use the same shell markers.
 */
import { projects, type CaseStudy, type CodeSample, type Project, type SubProduct } from "../src/data/projects";
import { aiPractices, clients, collaboration, debugging, decisions, intro, principles, workflow, type PillarIcon } from "../src/data/approach";
import * as R from "../src/data/roadmap";

export const esc = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const SPRITE = "/v2-assets/icons.svg";
/** An icon from the external sprite (Solar). */
const ic = (id: string, cls = "i") => `<svg class="${cls}" aria-hidden="true"><use href="${SPRITE}#i-${id}"/></svg>`;
/** An icon from the inline sprite every page carries (v2/partials/sprite.html). */
const il = (id: string, cls = "i") => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;

/** A whole V2 document: shared head, header, contact card and footer around `main`. */
export const shell = (main: string, extra = "") => `<!doctype html>
<html lang="en">
<head>
<!--v2:head-->
</head>
<body>

<!--v2:sprite-->
<!--v2:header-->

<main id="top">
${main}
<!--v2:contact-->
</main>

<!--v2:footer-->
${extra}
</body>
</html>
`;

export interface Stat {
  value: string | number;
  label: string;
  /** data-stat key, for numbers filled in by the page script. */
  key?: string;
}

/** The dark page header every inner page opens with (styles: .p-stage in v2.css). */
export const pageHero = (o: { eyebrow: string; title: string; lead: string; stats?: Stat[]; actions?: string; crumb?: string }) => `  <section class="p-hero">
    <div class="wrap">
      <div class="p-stage">
        <div class="p-stage-in">
          <div>
            ${o.crumb ?? ""}<p class="eyebrow rise">${o.eyebrow}</p>
            <h1 class="p-title rise d1">${o.title}</h1>
            <p class="p-lead rise d2">${o.lead}</p>
            ${o.actions ? `<div class="hero-cta rise d2">${o.actions}</div>` : ""}
          </div>
          ${
            o.stats?.length
              ? `<div class="p-stats rise d3">${o.stats
                  .map((s) => `<div class="p-stat"><div class="n"${s.key ? ` data-stat="${s.key}"` : ""}>${esc(s.value)}</div><div class="l">${esc(s.label)}</div></div>`)
                  .join("")}</div>`
              : ""
          }
        </div>
      </div>
    </div>
  </section>
`;

/* ── Projects ────────────────────────────────────────────────────────────────────────────────────────────── */

/** Projects with a typographic cover in v2.css (.art-<slug>); the rest show their screenshot. */
const ART: Record<string, { sub: string; word: string }> = {
  maiukha: { sub: "AI career coach", word: "Maiukha" },
  chekueit: { sub: "Security verification", word: "Chekue<br>IT" },
  bankspace: { sub: "Digital banking", word: "Bank<br>Space" },
  betalife: { sub: "Your campus. Your world.", word: "BetaLife" },
  zoomtrans: { sub: "Move smarter. Pay easier.", word: "ZoomTrans" },
};

/** "Fintech / Full-Stack Web Application" → "Fintech": the filter group. */
const group = (p: Project) => (p.category ?? "Other").split("/")[0].trim();

const cover = (p: Project | SubProduct, eager = false) => {
  const art = ART[p.slug];
  if (art) return `<span class="art art-${p.slug}"><span class="art-sub">${esc(art.sub)}</span><span class="art-word">${art.word}</span></span>`;
  if (p.image)
    return `<img src="${esc(p.image)}" alt="${esc(p.title)} screenshot"${p.imageFocus ? ` style="object-position:${esc(p.imageFocus)}"` : ""}${eager ? "" : ' loading="lazy"'}>`;
  return `<span class="art art-generic"><span class="art-word">${esc(p.title)}</span></span>`;
};

const chips = (tags: string[]) => `<div class="chips">${tags.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>`;

const projectLinks = (p: Project) =>
  [
    `<a class="btn btn-quiet btn-sm" href="/v2/projects/${p.slug}">Project details</a>`,
    p.live ? `<a class="btn btn-line btn-sm" href="${esc(p.live)}" target="_blank" rel="noopener">Live ${ic("arrow-right-up", "i nudge")}</a>` : "",
    p.github ? `<a class="btn btn-line btn-sm" href="${esc(p.github)}" target="_blank" rel="noopener">${il("github")}Code</a>` : "",
  ].join("");

const featuredCard = (p: Project, big: boolean) => `        <article class="case${big ? " big" : ""}" data-group="${esc(group(p))}">
          <a class="media" href="/v2/projects/${p.slug}" aria-label="${esc(p.title)}: project details">
            ${cover(p)}
            <span class="tag">${esc(p.category ?? "Project")}</span><span class="go">${il("arrow-up", "i nudge")}</span>
          </a>
          <div class="cap-row"><h3>${esc(p.title)}</h3>${p.status ? `<span class="yr">${esc(p.status)}</span>` : ""}</div>
          <p>${esc(p.description)}</p>
          ${chips(p.tags)}
          <div class="case-links">${projectLinks(p)}</div>
        </article>`;

const moreRow = (p: Project) => `        <a class="post" href="/v2/projects/${p.slug}" data-group="${esc(group(p))}"><span class="tr">${esc(p.category ?? "Project")}</span><span class="ti">${esc(p.title)}</span><span class="dt">${esc(p.tags.slice(0, 2).join(" · "))}</span><span class="circle">${il("arrow-up", "i nudge")}</span></a>`;

export const projectsPage = () => {
  const featured = projects.filter((p) => p.featured);
  const more = projects.filter((p) => !p.featured);
  const groups = [...new Set(projects.map(group))];
  const count = (g: string) => projects.filter((p) => group(p) === g).length;
  const filters = [`<button class="seg-btn on" type="button" data-value="all" aria-pressed="true">All<span class="ct">${projects.length}</span></button>`]
    .concat(groups.map((g) => `<button class="seg-btn" type="button" data-value="${esc(g)}" aria-pressed="false">${esc(g)}<span class="ct">${count(g)}</span></button>`))
    .join("");
  const main =
    pageHero({
      eyebrow: "Projects",
      title: "Things I’ve <em>built.</em>",
      lead: "Featured builds first, then smaller projects worth a look. Each one links to its write-up, and to its source code and live demo where they’re public.",
      stats: [
        { value: projects.length, label: "Projects" },
        { value: featured.length, label: "Featured" },
        { value: projects.filter((p) => p.live).length, label: "Live demos" },
        { value: projects.filter((p) => p.github).length, label: "Open source" },
      ],
    }) +
    `
  <section class="block near" id="work">
    <div class="wrap">
      <div class="filter-bar">
        <div class="seg" role="group" aria-label="Filter projects" data-filter="projects">${filters}</div>
        <p class="small">Open a project for its write-up, decisions and stack.</p>
      </div>
      <h2 class="sub-head" style="margin-top:8px" data-heading="featured">Featured</h2>
      <div class="work" data-list="featured">
${featured.map((p, i) => featuredCard(p, i === 0 || (i === featured.length - 1 && featured.length % 2 === 0))).join("\n")}
      </div>
      <h2 class="sub-head" data-heading="more">More projects</h2>
      <div class="posts" data-list="more">
${more.map(moreRow).join("\n")}
      </div>
      <p class="state" data-empty hidden>No projects in this group.</p>
    </div>
  </section>
`;
  return shell(main);
};

/* Project page: the classic ProjectDetailPage's sections, in V2's material. */

const section = (heading: string, body: string, level: "h2" | "h4" = "h2") =>
  `<section class="cs-sec"><${level} class="${level === "h2" ? "cs-h" : "cs-h sm"}">${esc(heading)}</${level}>${body}</section>`;

const codeBlock = (s: CodeSample) => `<figure class="code sheet"><figcaption><span>${esc(s.title)} <span class="lang">· ${esc(s.language)}</span></span><button class="btn btn-line btn-sm" type="button" data-copy-code>${il("copy")}Copy</button></figcaption><pre><code>${esc(s.code)}</code></pre>${
  s.note || s.source
    ? `<p class="code-note">${esc(s.note ?? "")}${s.note && s.source ? " · " : ""}${s.source ? `<a href="${esc(s.source)}" target="_blank" rel="noopener">View source</a>` : ""}</p>`
    : ""
}</figure>`;

const caseStudy = (cs: CaseStudy, nested = false) => {
  const lvl = nested ? "h4" : "h2";
  const item = nested ? "h5" : "h3";
  const out: string[] = [];
  if (cs.metrics?.length)
    out.push(`<dl class="metrics">${cs.metrics.map((m) => `<div class="metric"><dt>${esc(m.label)}</dt><dd class="n">${esc(m.value)}</dd>${m.asOf || m.source ? `<dd class="s">${esc([m.asOf, m.source].filter(Boolean).join(" · "))}</dd>` : ""}</div>`).join("")}</dl>`);
  if (cs.problem) out.push(section("The problem", `<p>${esc(cs.problem)}</p>`, lvl));
  if (cs.role) out.push(section("My role", `<p>${esc(cs.role)}</p>`, lvl));
  if (cs.challenges?.length)
    out.push(section("Engineering challenges and lessons", `<div class="cs-items">${cs.challenges.map((c) => `<div><${item}>${esc(c.title)}</${item}><p>${esc(c.detail)}</p></div>`).join("")}</div>`, lvl));
  if (cs.features?.length)
    out.push(section("Feature areas", `<ul class="feats">${cs.features.map((f) => `<li><span>${esc(f.name)}</span><span class="chip${f.status === "Implemented" ? " ok" : ""}">${esc(f.status)}</span></li>`).join("")}</ul>`, lvl));
  if (cs.architecture?.length)
    out.push(section("How it fits together", `<ol class="arch">${cs.architecture.map((n) => `<li><span>${esc(n)}</span></li>`).join("")}</ol>`, lvl));
  if (cs.decisions?.length)
    out.push(
      section(
        "Key technical decisions",
        `<div class="cs-items">${cs.decisions
          .map(
            (d) =>
              `<div class="decision sheet"><${item}>${esc(d.decision)}</${item}><dl>${d.alternatives ? `<div><dt>Considered</dt><dd>${esc(d.alternatives)}</dd></div>` : ""}<div><dt>Why</dt><dd>${esc(d.why)}</dd></div>${d.tradeOff ? `<div><dt>Trade-off</dt><dd>${esc(d.tradeOff)}</dd></div>` : ""}</dl></div>`,
          )
          .join("")}</div>`,
        lvl,
      ),
    );
  if (cs.code?.length) out.push(section("Code highlights", `<div class="cs-items">${cs.code.map(codeBlock).join("")}</div>`, lvl));
  if (cs.timeline?.length)
    out.push(section("Timeline", `<ol class="tl">${cs.timeline.map((m) => `<li><span>${esc(m.label)}</span>${m.date ? `<span class="d">${esc(m.date)}</span>` : ""}</li>`).join("")}</ol>`, lvl));
  if (cs.outcome) out.push(section("Outcome", `<p>${esc(cs.outcome)}</p>`, lvl));
  if (cs.improvements?.length) out.push(section("Potential improvements", `<ul class="ticks">${cs.improvements.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`, lvl));
  return out.join("\n");
};

const productSection = (p: SubProduct) => `<article class="product panel" id="${esc(p.slug)}"><div class="sheet pad cs-body">
  <h3 class="cs-h">${esc(p.title)}</h3>
  ${p.category || p.status ? `<div class="chips">${p.category ? `<span class="chip">${esc(p.category)}</span>` : ""}${p.status ? `<span class="chip ok">Status: ${esc(p.status)}</span>` : ""}</div>` : ""}
  <p>${esc(p.description)}</p>
  ${p.tags.length ? chips(p.tags) : ""}
  ${p.live ? `<a class="btn btn-line btn-sm" style="justify-self:start" href="${esc(p.live)}" target="_blank" rel="noopener">Visit ${esc(p.title)} ${ic("arrow-right-up", "i nudge")}</a>` : ""}
  ${p.image ? `<div class="media">${cover(p)}</div>` : ""}
  ${p.caseStudy ? caseStudy(p.caseStudy, true) : ""}
</div></article>`;

export const projectPage = (p: Project) => {
  const i = projects.indexOf(p);
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  const cs = p.caseStudy ?? {};
  const body = caseStudy(cs);
  const products = p.products ?? [];
  const stats: Stat[] = [];
  if (p.status) stats.push({ value: p.status, label: "Status" });
  if (cs.features?.length) stats.push({ value: cs.features.length, label: "Feature areas" });
  if (cs.decisions?.length) stats.push({ value: cs.decisions.length, label: "Key decisions" });
  if (products.length) stats.push({ value: products.length, label: "Products inside" });
  stats.push({ value: p.tags.length, label: "Technologies" });
  if (cs.challenges?.length) stats.push({ value: cs.challenges.length, label: "Lessons written up" });
  const actions = [
    p.live ? `<a class="btn btn-accent" href="${esc(p.live)}" target="_blank" rel="noopener">Live demo ${il("arrow-up", "i nudge")}</a>` : "",
    p.github ? `<a class="btn btn-line" href="${esc(p.github)}" target="_blank" rel="noopener">${il("github")}Source code</a>` : "",
    !p.live && !p.github ? `<a class="btn btn-line" href="#contact">Ask me about it</a>` : "",
  ].join("");
  const media = p.video
    ? `<div class="media cs-media video"><video src="${esc(p.video)}"${p.image ? ` poster="${esc(p.image)}"` : ""} controls playsinline preload="metadata" aria-label="${esc(p.title)} video"></video></div>`
    : `<div class="media cs-media">${cover(p, true)}</div>`;
  const main =
    pageHero({
      crumb: `<a class="crumb rise" href="/v2/projects">${il("arrow-right", "i back")}All projects</a>`,
      eyebrow: esc(p.category ?? "Project"),
      title: esc(p.title),
      lead: esc(p.description),
      stats: stats.slice(0, 4),
      actions,
    }) +
    `
  <section class="block near">
    <div class="wrap">
      ${media}
      <div class="cs-grid">
        <div class="cs-body">
${body}
${products.length ? section(`Products in ${p.title}`, `<div class="cs-items">${products.map(productSection).join("")}</div>`) : ""}
${!body && !products.length ? `<p>Try the live demo or browse the source code to see how it’s built.</p>` : ""}
        </div>
        <aside class="cs-side panel">
          <div class="panel-head"><h3>Tech stack</h3><span class="small">${p.tags.length}</span></div>
          <div class="sheet pad">${chips(p.tags)}</div>
          ${
            products.length
              ? `<div class="panel-head"><h3>Products</h3></div><div class="sheet pad"><ul class="side-links">${products.map((s) => `<li><a href="#${esc(s.slug)}">${il("arrow-right")}${esc(s.title)}</a></li>`).join("")}</ul></div>`
              : ""
          }
        </aside>
      </div>
      <nav class="pn" aria-label="More projects">
        <a class="pn-l sheet" href="/v2/projects/${prev.slug}"><span class="k">Previous</span><span class="t">${esc(prev.title)}</span></a>
        <a class="pn-r sheet" href="/v2/projects/${next.slug}"><span class="k">Next</span><span class="t">${esc(next.title)}</span></a>
      </nav>
    </div>
  </section>
`;
  return shell(main);
};

/* ── How I Work (/v2/approach): src/data/approach.ts, the classic ApproachPage's sections ────────────────── */

const PILLAR_ICONS: Record<PillarIcon, string> = { bot: "bot", scale: "target", shield: "shield-check", gauge: "rocket2" };

const block = (id: string, eyebrow: string, title: string, body: string, side = "") => `  <section class="block near" id="${id}">
    <div class="wrap">
      <div class="sec-head"><div><p class="eyebrow">${eyebrow}</p><h2 class="poster ap-h">${title}</h2></div>${side ? `<div class="sec-side"><p class="small">${side}</p></div>` : ""}</div>
${body}
    </div>
  </section>
`;
const numbered = (items: string[]) => `      <ol class="numlist">${items.map((s, i) => `<li class="sheet"><span class="no">${String(i + 1).padStart(2, "0")}</span><span>${esc(s)}</span></li>`).join("")}</ol>`;
const outro = (text: string) => `      <p class="ap-outro">${esc(text)}</p>`;

export const approachPage = () => {
  const main =
    pageHero({
      eyebrow: "How I Work",
      title: "How I <em>work.</em>",
      lead: esc(intro.subtitle),
      stats: [
        { value: workflow.length, label: "Workflow phases" },
        { value: debugging.steps.length, label: "Debugging steps" },
        { value: decisions.factors.length, label: "Decision factors" },
        { value: principles.length, label: "Principles" },
      ],
      actions: `<a class="btn btn-accent" href="#workflow">Read the workflow ${il("arrow-up", "i nudge")}</a><a class="btn btn-line" href="#contact">Work with me</a>`,
    }) +
    `  <section class="block near" id="intro"><div class="wrap ap-intro">${intro.paragraphs.map((p, i) => `<p class="${i === 0 ? "statement" : "lead"}">${esc(p)}</p>`).join("")}</div></section>
` +
    block(
      "workflow",
      "01 · Workflow",
      "My development workflow",
      `      <div class="process"><div class="steps">${workflow
        .map(
          (ph, i) =>
            `<div class="step"><div class="step-top"><span class="ico">${ic(["magnifier", "layers", "code2", "rocket2"][i] ?? "flag")}</span><span class="no">${String(i + 1).padStart(2, "0")}</span></div><h3>${esc(ph.title)}</h3><ul>${ph.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>`,
        )
        .join("")}</div></div>`,
    ) +
    block("debugging", "02 · Debugging", "How I debug", numbered(debugging.steps), esc(debugging.intro)) +
    block(
      "decisions",
      "03 · Decisions",
      "How I make technical decisions",
      `      <div class="factors">${decisions.factors.map((f) => `<div class="factor sheet"><h3>${esc(f.label)}</h3><p>${esc(f.question)}</p></div>`).join("")}</div>\n${outro(decisions.outro)}`,
      esc(decisions.intro),
    ) +
    block(
      "collaboration",
      "04 · Teamwork",
      "How I work in a team",
      `      <div class="panel"><div class="sheet pad"><ul class="ticks cols">${collaboration.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div></div>\n${outro(collaboration.outro)}`,
      esc(collaboration.intro),
    ) +
    block(
      "ai",
      "05 · AI engineering",
      "My approach to AI engineering",
      `      <div class="duo pillars">${aiPractices
        .map(
          (p) =>
            `<div class="panel"><div class="panel-head"><h3><span class="dd-ico">${ic(PILLAR_ICONS[p.icon])}</span>${esc(p.title)}</h3></div><div class="sheet pad"><ul class="ticks">${p.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></div>`,
        )
        .join("")}</div>`,
    ) +
    block("clients", "06 · Clients", "How I work with clients", `${numbered(clients.steps)}\n${outro(clients.outro)}`, esc(clients.intro)) +
    block("principles", "07 · Principles", "My engineering principles", `      <ol class="principles">${principles.map((p, i) => `<li><span class="no">${String(i + 1).padStart(2, "0")}</span>${esc(p)}</li>`).join("")}</ol>`);
  return shell(main);
};

/* ── Roadmap (/v2/roadmap): src/data/roadmap.ts, the classic RoadmapPage's ten sections and tracker ──────── */

const two = (i: number) => String(i).padStart(2, "0");

export const roadmapPage = () => {
  const n = (i: number) => `${two(i)} · `;
  const monthsHTML = R.quarters
    .map((q) => {
      const months = q.months
        .map((m) => {
          const learn = m.learn.map((l) => `<li>${esc(l)}</li>`).join("");
          const options = m.buildOptions ? `<ul>${m.buildOptions.map((o) => `<li>${esc(o)}</li>`).join("")}</ul>` : "";
          const note = m.buildNote ? `<p>${esc(m.buildNote)}</p>` : "";
          return (
            `<details class="svc" id="month-${m.month}"><summary><span class="no">M${two(m.month)}</span><span class="nm">${esc(m.title)}</span><span class="circle">${il("arrow-right")}</span></summary>` +
            `<div class="svc-body"><div><p class="k-label">${esc(m.learnLabel ?? "Learn")}</p><ul>${learn}</ul></div>` +
            `<div class="rm-boxes"><div class="rm-box"><p class="k-label">Build</p><p>${esc(m.build)}</p>${options}${note}</div>` +
            `<div class="rm-box ms"><p class="k-label">Milestone</p><p>${esc(m.milestone)}</p></div></div></div></details>`
          );
        })
        .join("");
      return `      <div class="quarter"><div class="q-head"><span class="chip">${esc(q.range)}</span><h3>${esc(q.title)}</h3></div><div class="svc-list">${months}</div></div>`;
    })
    .join("\n");

  const cycle = R.learningCycle
    .map((c, i) => `<div class="step"><div class="step-top"><span class="ico">${ic(["notebook", "code2", "magnifier", "rocket2"][i] ?? "flag")}</span><span class="no">${two(i + 1)}</span></div><h3>${esc(c.title)}</h3><p>${esc(c.detail)}</p></div>`)
    .join("");
  const alloc = R.weeklyAllocation
    .map((a) => `<div class="alloc-row"><span>${esc(a.label)}</span><span class="bar"><span style="width:${a.percent}%"></span></span><span class="pc">${a.percent}%</span></div>`)
    .join("");
  const split = R.weeklyTime.split.map((s) => `<div class="alloc-row two"><span>${esc(s.label)}</span><span class="pc">${esc(s.hours)}</span></div>`).join("");
  const plan = R.projectPlan.map((p) => `<div class="post rm-row"><span class="tr">${esc(p.period)}</span><span class="ti">${esc(p.project)}</span><span class="dt">${esc(p.teaches)}</span></div>`).join("");
  const growing = R.growingPortfolio.map((g) => `<div class="factor sheet"><span class="chip" style="justify-self:start">${esc(g.level)} · ${esc(g.when)}</span><h3>${esc(g.project)}</h3></div>`).join("");
  const resources = R.resources
    .map((r) => `<div class="factor sheet"><h3>${esc(r.name)}</h3><p>${esc(r.detail)}</p><a class="btn btn-line btn-sm" style="justify-self:start;margin-top:6px" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.cta)} ${ic("arrow-right-up", "i nudge")}</a></div>`)
    .join("");
  const soft = R.softSkills.map((s) => `<div class="factor sheet"><h3>${esc(s.skill)}</h3><p>${esc(s.practice)}</p></div>`).join("");
  const mistakes = R.mistakes.map((m, i) => `<li class="sheet"><span class="no">${two(i + 1)}</span><span><b>${esc(m.title)}</b> ${esc(m.detail)}</span></li>`).join("");
  const trackerItems = R.allMonths
    .map((m) => `<li><label><input type="checkbox" value="${m.month}"><span><b>Month ${m.month}:</b> <span class="ms-t">${esc(m.milestone)}</span></span></label></li>`)
    .join("");
  const after = R.afterTwelve.map((a) => `<li>${esc(a)}</li>`).join("");
  const directions = R.directions.map((d) => `<div class="factor sheet"><h3>${esc(d.title)}</h3><p>${esc(d.detail)}</p></div>`).join("");
  const advice = R.finalAdvice.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("");

  const main =
    pageHero({
      eyebrow: "Learning roadmap",
      title: "The 12-month <em>roadmap.</em>",
      lead: `${esc(R.roadmapIntro.subtitle)}: a beginner-friendly, month-by-month path to becoming a full-stack software engineer. What to learn, what to build, and how to grow.`,
      stats: [
        { value: R.allMonths.length, label: "Months" },
        { value: R.projectPlan.length, label: "Projects to build" },
        { value: `${R.weeklyTime.hoursPerWeek} h`, label: "A week, suggested" },
        { value: R.resources.length, label: "Free resources" },
      ],
      actions: `<a class="btn btn-accent" href="#months">Start with month 1 ${il("arrow-up", "i nudge")}</a><a class="btn btn-line" href="#tracker">Track your progress</a>`,
    }) +
    `  <section class="block near"><div class="wrap ap-intro">${R.roadmapIntro.paragraphs.map((p, i) => `<p class="${i === 0 ? "statement" : "lead"}">${esc(p)}</p>`).join("")}<p class="ap-outro">${esc(R.roadmapIntro.advice)}</p></div></section>\n` +
    block(
      "philosophy",
      `${n(1)}Philosophy`,
      "The learning philosophy",
      `      <div class="process"><div class="steps">${cycle}</div></div>\n      <div class="panel" style="margin-top:16px"><div class="panel-head"><h3>A suggested week</h3></div><div class="sheet pad alloc">${alloc}<p class="small">${esc(R.allocationNote)}</p></div></div>`,
    ) +
    block("months", `${n(2)}Months`, "Your first 12 months", monthsHTML, "The roadmap is divided into 12 stages. Each month introduces a new set of concepts while giving you something practical to build.") +
    block(
      "weekly",
      `${n(3)}Time`,
      "How to organise your week",
      `      <div class="duo"><div class="panel"><div class="sheet pad wk"><div class="num"><div class="n">${R.weeklyTime.hoursPerWeek}<sup>h</sup></div><div class="k">A week</div><p class="d">${esc(R.weeklyTime.routine)}</p></div></div></div><div class="panel"><div class="sheet pad alloc">${split}<p class="small">${esc(R.weeklyTime.splitNote)}</p></div></div></div>\n${outro(R.weeklyTime.lessTime)}`,
      esc(R.weeklyTime.intro),
    ) +
    block("projects", `${n(4)}Projects`, "Projects to build through the year", `      <div class="posts">${plan}</div>\n      <h3 class="sub-head">A growing portfolio</h3>\n      <div class="factors">${growing}</div>`, esc(R.projectsIntro)) +
    block("resources", `${n(5)}Resources`, "Learning resources worth using", `      <div class="factors">${resources}</div>`, esc(R.resourcesIntro)) +
    block("soft-skills", `${n(6)}Beyond code`, "Skills beyond programming", `      <div class="factors">${soft}</div>`, esc(R.softSkillsIntro)) +
    block("avoid", `${n(7)}Avoid`, "What to avoid in your first year", `      <ol class="numlist">${mistakes}</ol>`, esc(R.mistakesIntro)) +
    block(
      "tracker",
      `${n(8)}Tracker`,
      "Your first-year progress tracker",
      `      <div class="panel tracker" data-tracker><div class="sheet pad">
        <div class="tr-head"><div><p class="k-label">12-month learning progress</p><p class="tr-pc"><span data-tr-pc>0</span><sup>%</sup></p><p class="small" aria-live="polite"><span data-tr-count>0</span> of ${R.allMonths.length} milestones completed. Saved in this browser only.</p></div><button class="btn btn-line btn-sm" type="button" data-tr-reset disabled>Reset progress</button></div>
        <div class="tr-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Roadmap progress"><span></span></div>
        <ul class="tr-list">${trackerItems}</ul>
      </div></div>`,
      esc(R.trackerIntro),
    ) +
    block("after", `${n(9)}After 12 months`, "Where you should be after 12 months", `      <div class="panel"><div class="sheet pad"><ul class="ticks cols">${after}</ul></div></div>\n${outro(R.afterTwelveOutro)}`, esc(R.afterTwelveIntro)) +
    block("next", `${n(10)}Next`, "What comes after the first year?", `      <div class="factors">${directions}</div>`, esc(R.directionsIntro)) +
    `  <section class="block near" id="advice"><div class="wrap"><div class="cta" style="margin-top:0"><div class="cta-in rm-advice"><div><p class="eyebrow">Final advice</p><h2>${esc(R.finalAdvice.title)}</h2>${advice}<p class="rm-closing">${esc(R.finalAdvice.closing)}</p></div></div></div></div></section>\n`;
  return shell(main);
};
