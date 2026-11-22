/**
 * The new design's (public/v2.html) live and interactive parts, ported from the classic design (V1) so both show the
 * same information:
 *   nav         About / Work dropdowns (src/data/navigation.ts), mobile menu, scroll-spy
 *   search      Ctrl/⌘+K palette (CommandMenu.tsx)
 *   skills      Technical / professional switch and category explorer (Skills.tsx)
 *   github      "Recently on GitHub" live stats (GitHubStrip.tsx)
 *   writing     published articles, topic counts per track (Articles.tsx, src/lib/articles.ts)
 *   updates     the three most relevant updates (LatestUpdates.tsx, src/lib/updates.ts)
 *   words       approved recommendations rotating every 3s (Testimonials.tsx, src/lib/feedback.ts)
 *   contact     the message form, posting to /api/contact with the same checks (Contact.tsx, backend/contact.mjs)
 *   dialogs     full bio, certificate viewer
 * Everything degrades to the static content already in the page if an API is unavailable.
 */
(function () {
  "use strict";
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var SPRITE = "/v2-assets/icons.svg";
  var SCHOLAR = "https://scholar.google.com/citations?user=4lVtohYAAAAJ&hl=en";
  /** An update's own V2 page (served through api/share/update.js for its link preview). */
  var updateHref = function (u) { return "/v2/updates/" + encodeURIComponent(u.id); };
  var ic = function (id, cls) { return '<svg class="' + (cls || "i") + '" aria-hidden="true"><use href="' + SPRITE + "#i-" + id + '"/></svg>'; };
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var data = {};
  try { data = JSON.parse($("#v2-data").textContent); } catch (e) { /* static page still works */ }

  var toastEl = $("#toast"), toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }
  function getJSON(url) {
    return fetch(url, { headers: { Accept: "application/json" } }).then(function (r) {
      if (!r.ok) throw new Error(url + " " + r.status);
      return r.json();
    });
  }

  /* ── Theme, design switch, copy email: on every V2 page ──────────────────────────────────────────────── */
  var root = document.documentElement;
  function isDarkTheme() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  }
  var themeBtn = $("#theme-toggle");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var next = isDarkTheme() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("portfolio-theme", next); } catch (e) { /* storage blocked */ }
  });
  // The strip at the top, and the footer link back to classic (gone once classic retires).
  var classicBtn = $("#classic-design");
  if (window.oiDesign) {
    var strip = $("#design-strip");
    if (strip) oiDesign.mountBanner(strip);
    if (classicBtn && oiDesign.phase() === "retired") classicBtn.parentNode.removeChild(classicBtn);
    else if (classicBtn) classicBtn.addEventListener("click", function () { oiDesign.set("v1"); });
  }
  function copyText(el, done) {
    var p = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(el.textContent) : Promise.reject();
    p.then(function () { toast(done); }).catch(function () {
      var r = document.createRange(); r.selectNodeContents(el);
      var s = getSelection(); s.removeAllRanges(); s.addRange(r); toast("Selected");
    });
  }
  var copyEmail = $("#copy-email");
  if (copyEmail) copyEmail.addEventListener("click", function () { copyText($("#email"), "Email copied"); });

  /* Services accordion (home and /v2/services): one open at a time; /v2/services#ai opens that one. */
  var svcs = $$(".svc");
  svcs.forEach(function (d) {
    d.addEventListener("toggle", function () { if (d.open) svcs.forEach(function (o) { if (o !== d) o.open = false; }); });
  });
  function openSvcFromHash() {
    var target = location.hash && document.getElementById(location.hash.slice(1));
    if (target && target.classList.contains("svc")) { target.open = true; target.scrollIntoView({ block: "start" }); }
  }
  openSvcFromHash();
  addEventListener("hashchange", openSvcFromHash);

  /* ── Nav: the page you're on (Services, Moments, Updates) is marked in the menus and the footer ──────── */
  var here = location.pathname.replace(/\.html$/, "").replace(/\/+$/, "") || "/";
  $$(".dd-item, .foot-row nav a").forEach(function (a) {
    var href = a.getAttribute("href") || "";
    if (href.indexOf("#") >= 0 || href.replace(/\/+$/, "") !== here) return;
    a.classList.add("on");
    a.setAttribute("aria-current", "page");
    var dd = a.closest(".dd");
    if (dd) $(".dd-btn", dd).classList.add("on");
  });

  /* ── Nav: dropdowns ─────────────────────────────────────────────────────────────────────────────────── */
  var dds = $$(".nav .dd");
  var closeTimer;
  function setOpen(dd, open, focusFirst) {
    var btn = $(".dd-btn", dd), panel = $(".dd-panel", dd);
    btn.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
    if (open) {
      dds.forEach(function (o) { if (o !== dd) setOpen(o, false); });
      if (focusFirst) { var first = $("a", panel); if (first) first.focus(); }
    }
  }
  dds.forEach(function (dd) {
    var btn = $(".dd-btn", dd), panel = $(".dd-panel", dd);
    btn.addEventListener("click", function () { setOpen(dd, btn.getAttribute("aria-expanded") !== "true"); });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); setOpen(dd, true, true); }
    });
    panel.addEventListener("keydown", function (e) {
      var links = $$("a", panel), i = links.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); links[(i + 1) % links.length].focus(); }
      if (e.key === "ArrowUp") { e.preventDefault(); links[(i - 1 + links.length) % links.length].focus(); }
    });
    // Mouse: open on hover, close shortly after leaving (as V1's navbar).
    dd.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { clearTimeout(closeTimer); setOpen(dd, true); } });
    dd.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { closeTimer = setTimeout(function () { setOpen(dd, false); }, 140); } });
    dd.addEventListener("focusout", function (e) { if (!dd.contains(e.relatedTarget)) setOpen(dd, false); });
    $$("a", panel).forEach(function (a) { a.addEventListener("click", function () { setOpen(dd, false); }); });
  });

  /* ── Nav: mobile menu ───────────────────────────────────────────────────────────────────────────────── */
  var menuBtn = $("#menu-btn"), menu = $("#m-menu");
  function setMenu(open) {
    if (!menuBtn || !menu) return;
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = !open;
  }
  if (menuBtn) menuBtn.addEventListener("click", function () { setMenu(menu.hidden); });
  if (menu) $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var open = dds.filter(function (dd) { return $(".dd-btn", dd).getAttribute("aria-expanded") === "true"; })[0];
    if (open) { setOpen(open, false); $(".dd-btn", open).focus(); }
    if (menu && !menu.hidden) { setMenu(false); menuBtn.focus(); }
  });
  document.addEventListener("pointerdown", function (e) {
    var head = $(".site-head");
    if (head && !head.contains(e.target)) { dds.forEach(function (dd) { setOpen(dd, false); }); setMenu(false); }
  });

  /* ── Nav: scroll-spy (top-level links, dropdown items, and the dropdown that holds the active item) ───── */
  var spyIds = [];
  $$('.nav > a[href^="#"]').forEach(function (a) { spyIds.push(a.getAttribute("href").slice(1)); });
  $$(".dd-item[data-section]").forEach(function (a) { spyIds.push(a.getAttribute("data-section")); });
  spyIds = spyIds.filter(function (id, i) { return spyIds.indexOf(id) === i && document.getElementById(id); });
  function markActive(id) {
    $$(".nav > a").forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + id); });
    $$(".dd-item[data-section]").forEach(function (a) {
      var on = a.getAttribute("data-section") === id;
      a.classList.toggle("on", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
    dds.forEach(function (dd) { $(".dd-btn", dd).classList.toggle("on", !!$(".dd-item.on", dd)); });
  }
  // Only the home page has these sections; elsewhere spyIds is empty and nothing is observed.
  if ("IntersectionObserver" in window) {
    var visible = {};
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      var current = spyIds.filter(function (id) { return visible[id]; })[0];
      markActive(current || "");
    }, { rootMargin: "-45% 0px -50% 0px" });
    spyIds.forEach(function (id) { spy.observe(document.getElementById(id)); });
  }

  /* ── Dialogs ────────────────────────────────────────────────────────────────────────────────────────── */
  function openDialog(dlg) { if (dlg && dlg.showModal && !dlg.open) dlg.showModal(); }
  $$("[data-dialog]").forEach(function (b) { b.addEventListener("click", function () { openDialog(document.getElementById(b.getAttribute("data-dialog"))); }); });
  $$("dialog.v2-dialog").forEach(function (dlg) {
    $$("[data-close]", dlg).forEach(function (b) { b.addEventListener("click", function () { dlg.close(); }); });
    // A click on the backdrop (outside the box) closes it.
    dlg.addEventListener("click", function (e) {
      if (e.target !== dlg) return;
      var r = dlg.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg.close();
    });
  });
  $$("[data-cert]").forEach(function (b) {
    b.addEventListener("click", function () {
      var dlg = $("#cert-dialog");
      $("#cert-title").textContent = b.getAttribute("data-title");
      $("#cert-img").src = b.getAttribute("data-cert");
      $("#cert-img").alt = b.getAttribute("data-title");
      openDialog(dlg);
    });
  });

  /* ── Skills: technical / professional switch and the category explorer ─────────────────────────────── */
  var segBtns = $$(".seg-btn"), catBtns = $$(".cat");
  function selectCat(btn) {
    catBtns.forEach(function (c) {
      var on = c === btn;
      c.classList.toggle("on", on); c.setAttribute("aria-selected", String(on)); c.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(c.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
  }
  function selectGroup(group) {
    segBtns.forEach(function (b) { var on = b.getAttribute("data-group") === group; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
    var first = null;
    catBtns.forEach(function (c) { var show = c.getAttribute("data-group") === group; c.hidden = !show; if (show && !first) first = c; });
    if (first) selectCat(first);
  }
  segBtns.forEach(function (b) { b.addEventListener("click", function () { selectGroup(b.getAttribute("data-group")); }); });
  catBtns.forEach(function (c) {
    c.addEventListener("click", function () { selectCat(c); });
    c.addEventListener("keydown", function (e) {
      if (["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].indexOf(e.key) < 0) return;
      e.preventDefault();
      var shown = catBtns.filter(function (x) { return !x.hidden; }), i = shown.indexOf(c);
      var next = shown[(i + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1) + shown.length) % shown.length];
      selectCat(next); next.focus();
    });
  });
  if (catBtns.length) selectCat(catBtns.filter(function (c) { return c.classList.contains("on"); })[0] || catBtns[0]);

  /* ── GitHub: live stats for the pinned repos (public API; a 404 means private or renamed) ───────────── */
  var rel = window.Intl && Intl.RelativeTimeFormat ? new Intl.RelativeTimeFormat("en", { numeric: "auto" }) : null;
  function updatedAgo(iso) {
    var days = Math.round((Date.parse(iso) - Date.now()) / 864e5);
    if (!rel) return iso.slice(0, 10);
    if (days > -1) return "today";
    if (days > -30) return rel.format(days, "day");
    if (days > -365) return rel.format(Math.round(days / 30), "month");
    return rel.format(Math.round(days / 365), "year");
  }
  function loadRepos() {
    $$(".repo[data-repo]").forEach(function (card) {
      var repo = card.getAttribute("data-repo");
      fetch("https://api.github.com/repos/programmerolashow/" + encodeURIComponent(repo))
        .then(function (r) {
          if (r.status === 404) { $(".repo-private", card).hidden = false; return null; }
          if (!r.ok) throw new Error("GitHub " + r.status);
          return r.json();
        })
        .then(function (s) {
          if (!s) return;
          if (s.description) $(".repo-desc", card).textContent = s.description;
          var stats = $(".repo-stats", card);
          stats.innerHTML = (s.language ? '<span class="lang">' + esc(s.language) + "</span>" : "") +
            "<span>" + ic("star") + esc(s.stargazers_count) + "</span><span>" + ic("git-fork") + esc(s.forks_count) + "</span>" +
            "<span>Updated " + esc(updatedAgo(s.pushed_at)) + "</span>";
          stats.hidden = false;
          var link = $(".repo-link", card);
          if (s.html_url) link.href = s.html_url;
          link.hidden = false;
        })
        .catch(function () { /* keep the fallback description */ });
    });
  }
  var gh = $(".gh");
  if (gh && "IntersectionObserver" in window) {
    var ghObs = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { ghObs.disconnect(); loadRepos(); } }, { rootMargin: "200px" });
    ghObs.observe(gh);
  } else if (gh) loadRepos();

  /* ── Writing: published articles + planned topics (src/lib/articles.ts) ─────────────────────────────── */
  var tracks = data.tracks || [], planned = data.plannedTopics || {};
  var trackLabel = function (id) { var t = tracks.filter(function (x) { return x.id === id; })[0] || tracks[0]; return t ? t.label : ""; };
  var normalise = function (t) { return String(t).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); };
  function matchPlannedTopic(title) {
    var t = normalise(title);
    if (!t) return null;
    for (var i = 0; i < tracks.length; i++) {
      var list = planned[tracks[i].id] || [];
      for (var j = 0; j < list.length; j++) if (t.indexOf(normalise(list[j])) === 0) return list[j];
    }
    return null;
  }
  function articleDate(a) {
    var iso = (a.publishedOn || a.createdAt.slice(0, 10)) + "T12:00:00Z";
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  }
  /** Where an article is published (V2 has no on-site articles page): Zenodo, then Scholar, then the file. */
  function articleUrl(a) { return a.zenodoUrl || a.scholarUrl || a.fileUrl || SCHOLAR; }
  function setLive(key, value) { $$('[data-live="' + key + '"]').forEach(function (el) { el.textContent = value; }); }
  var articlesPromise = null;
  function loadArticles() {
    if (!articlesPromise) articlesPromise = getJSON("/api/articles").then(function (j) { return j.articles || []; });
    return articlesPromise;
  }
  loadArticles().then(function (articles) {
    // Every topic once: published articles, then planned topics nobody has written yet (V1's useArticleList).
    var filled = {}, counts = {};
    tracks.forEach(function (t) { counts[t.id] = 0; });
    articles.forEach(function (a) {
      var topic = a.topic || matchPlannedTopic(a.title);
      if (topic) filled[topic] = true;
      var track = counts.hasOwnProperty(a.track) ? a.track : tracks[0] && tracks[0].id;
      if (track) counts[track]++;
    });
    tracks.forEach(function (t) { (planned[t.id] || []).forEach(function (topic) { if (!filled[topic]) counts[t.id]++; }); });
    var total = 0;
    tracks.forEach(function (t) { total += counts[t.id]; var el = $('[data-track-count="' + t.id + '"]'); if (el) el.textContent = counts[t.id]; });
    setLive("topics", total);
    setLive("published", articles.length);
    if (!articles.length) return;
    var posts = $("#posts");
    if (posts) {
      posts.innerHTML = articles.slice(0, 6).map(function (a) {
        return '<a class="post" href="' + esc(articleUrl(a)) + '" target="_blank" rel="noopener"><span class="tr">' + esc(trackLabel(a.track)) +
          '</span><span class="ti">' + esc(a.title) + '</span><span class="dt">' + esc(articleDate(a)) +
          '</span><span class="circle"><svg class="i nudge"><use href="#i-arrow-up"/></svg></span></a>';
      }).join("");
    }
  }).catch(function () { /* keep the static list and numbers */ });

  /* ── Latest updates (src/lib/updates.ts: sortForVisitors, eventStatus, displayDate) ─────────────────── */
  var todayInLagos = function () { return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date()); };
  function eventStatus(u, today) {
    if (u.kind !== "event" || !u.startsOn) return null;
    var end = u.endsOn || u.startsOn;
    if (today < u.startsOn) return "upcoming";
    if (today <= end) return "happening";
    return "past";
  }
  var statusLabel = { happening: "Happening now", upcoming: "Upcoming", past: "Past event" };
  var rank = { happening: 0, upcoming: 1, past: 2, none: 2 };
  var sortDate = function (u) { return u.startsOn || u.createdAt.slice(0, 10); };
  function sortForVisitors(list) {
    var today = todayInLagos();
    return list.slice().sort(function (a, b) {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      var ra = rank[eventStatus(a, today) || "none"], rb = rank[eventStatus(b, today) || "none"];
      if (ra !== rb) return ra - rb;
      if (ra === rank.upcoming) return sortDate(a).localeCompare(sortDate(b));
      return sortDate(b).localeCompare(sortDate(a)) || b.createdAt.localeCompare(a.createdAt);
    });
  }
  function formatDay(iso, withYear) {
    var o = { day: "numeric", month: "short", timeZone: "UTC" };
    if (withYear !== false) o.year = "numeric";
    return new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", o);
  }
  function displayDate(u) {
    if (!u.startsOn) return formatDay(u.createdAt.slice(0, 10));
    if (!u.endsOn || u.endsOn === u.startsOn) return formatDay(u.startsOn);
    var sameYear = u.startsOn.slice(0, 4) === u.endsOn.slice(0, 4);
    return formatDay(u.startsOn, !sameYear) + " – " + formatDay(u.endsOn);
  }
  function coverUrl(u) {
    if (u.images && u.images[0]) return u.images[0].url;
    var v = (u.videos || []).filter(function (x) { return x.posterUrl; })[0];
    return v ? v.posterUrl : null;
  }
  var updatesPromise = null;
  function loadUpdates() {
    if (!updatesPromise) updatesPromise = getJSON("/api/updates").then(function (j) { return sortForVisitors(j.updates || []); });
    return updatesPromise;
  }
  loadUpdates().then(function (list) {
    var section = $("#updates");
    if (!section || !list.length) return;
    var today = todayInLagos();
    $("#ups").innerHTML = list.slice(0, 3).map(function (u) {
      var cover = coverUrl(u), status = eventStatus(u, today);
      var videos = (u.videos || []).length, media = [];
      if ((u.images || []).length > 1) media.push(u.images.length + " photos");
      if (videos > 0) media.push(videos === 1 ? "Video" : videos + " videos");
      return '<article class="up"><div class="media">' +
        (cover ? '<img src="' + esc(cover) + '" alt="' + esc((u.images[0] && u.images[0].alt) || "") + '" loading="lazy">' : '<span class="ph">' + ic("megaphone") + "</span>") +
        (status ? '<span class="up-status ' + status + '">' + statusLabel[status] + "</span>" : "") +
        (media.length ? '<span class="up-media">' + (videos ? ic("play") : "") + esc(media.join(" · ")) + "</span>" : "") +
        '</div><p class="kind-l">' + (u.kind === "event" ? "Event" : "Post") + '</p><h3><a href="' + updateHref(u) + '">' + esc(u.title) + "</a></h3>" +
        (u.body ? "<p>" + esc(u.body) + "</p>" : "") +
        '<div class="up-meta"><span>' + ic("calendar-date") + esc(displayDate(u)) + "</span>" +
        (u.location ? "<span>" + ic("map-point") + esc(u.location) + "</span>" : "") + "</div></article>";
    }).join("");
    if ($("#updates-all")) $("#updates-all").hidden = list.length <= 3;
    section.hidden = false;
  }).catch(function () { /* section stays hidden, as in V1 */ });

  /* ── Kind words: approved recommendations, featured first, one card swapped every 3s (Testimonials.tsx) ── */
  var relationshipLabels = { colleague: "Colleague", manager: "Manager", teammate: "Teammate", classmate: "Schoolmate", course_mate: "Course-mate", collaborator: "Collaborator", client: "Client", mentor: "Mentor", mentee: "Mentee", other: "Other" };
  var recommenderLine = function (r) { return [r.role, r.company].filter(Boolean).join(" · ") || relationshipLabels[r.relationship] || ""; };
  var FACES = ["face-a", "face-e"]; // V2's two card colours, kept per slot
  var ROTATE_MS = 3000;
  function quoteHTML(r, slot) {
    var letter = (String(r.name).trim()[0] || "").toUpperCase();
    var name = r.linkedinUrl
      ? '<a href="' + esc(r.linkedinUrl) + '" target="_blank" rel="noopener noreferrer nofollow">' + esc(r.name) + "</a>"
      : esc(r.name);
    return '<div class="face ' + FACES[slot % FACES.length] + '" aria-hidden="true">' + esc(letter) + '</div><div class="quote-body"><blockquote>' +
      esc(r.body) + '</blockquote><figcaption><div class="n">' + name + '</div><div class="r">' + esc(recommenderLine(r)) + "</div></figcaption></div>";
  }
  var recsPromise = getJSON("/api/recommendations").then(function (j) { return j.recommendations || []; });
  recsPromise.then(function (all) {
    var quotes = $("#quotes");
    if (!quotes) return;
    var slots = $$(".quote", quotes).length || 2;
    if (!all.length) {
      quotes.hidden = true;
      $("#words-empty").hidden = false;
      return;
    }
    var shown = all.slice(0, slots);
    quotes.innerHTML = shown.map(function (r, i) { return '<figure class="quote">' + quoteHTML(r, i) + "</figure>"; }).join("");
    if ($("#words-count")) $("#words-count").textContent = all.length;
    if ($("#words-all")) $("#words-all").hidden = false;
    if (reduceMotion || all.length <= slots) return;
    var paused = false;
    quotes.addEventListener("mouseenter", function () { paused = true; });
    quotes.addEventListener("mouseleave", function () { paused = false; });
    quotes.addEventListener("focusin", function () { paused = true; });
    quotes.addEventListener("focusout", function () { paused = false; });
    setInterval(function () {
      if (paused || document.hidden) return;
      var hidden = all.filter(function (r) { return shown.indexOf(r) < 0; });
      if (!hidden.length) return;
      var slot = Math.floor(Math.random() * shown.length);
      var next = hidden[Math.floor(Math.random() * hidden.length)];
      var card = $$(".quote", quotes)[slot];
      shown[slot] = next;
      card.classList.add("swap");
      setTimeout(function () { card.innerHTML = quoteHTML(next, slot); card.classList.remove("swap"); }, 350);
    }, ROTATE_MS);
  }).catch(function () { /* keep the static quotes */ });

  /* ── Contact form (same limits and spam traps as backend/contact.mjs) ──────────────────────────────── */
  var form = $("#contact-form");
  if (form) {
    var startedAt = Date.now();
    var LIMITS = { name: 100, email: 254, subject: 150, message: 5000, minMessage: 10 };
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var field = function (n) { return form.elements[n]; };
    function setErr(n, msg) {
      var label = field(n).closest(".field"), el = $(".err", label);
      label.classList.toggle("bad", !!msg);
      if (msg && !el) { el = document.createElement("span"); el.className = "err"; label.appendChild(el); }
      if (el) { el.textContent = msg || ""; el.hidden = !msg; }
      field(n).setAttribute("aria-invalid", msg ? "true" : "false");
    }
    function validate() {
      var v = { name: field("name").value.replace(/[\r\n]+/g, " ").trim(), email: field("email").value.trim().toLowerCase(), subject: field("subject").value.replace(/[\r\n]+/g, " ").trim(), message: field("message").value.trim() };
      var errors = {};
      if (v.name.length < 2) errors.name = "Please enter your name.";
      else if (v.name.length > LIMITS.name) errors.name = "Name must be under " + LIMITS.name + " characters.";
      if (!EMAIL_RE.test(v.email) || v.email.length > LIMITS.email) errors.email = "Please enter a valid email address.";
      if (v.subject.length < 2) errors.subject = "Please add a subject.";
      else if (v.subject.length > LIMITS.subject) errors.subject = "Subject must be under " + LIMITS.subject + " characters.";
      if (v.message.length < LIMITS.minMessage) errors.message = "Message must be at least " + LIMITS.minMessage + " characters.";
      else if (v.message.length > LIMITS.message) errors.message = "Message must be under " + LIMITS.message + " characters.";
      return { values: v, errors: errors };
    }
    var msg = field("message"), count = $("#msg-count");
    msg.addEventListener("input", function () { count.textContent = msg.value.length; });
    $$("[data-subject]", form).forEach(function (b) {
      b.addEventListener("click", function () {
        field("subject").value = b.getAttribute("data-subject");
        $$("[data-subject]", form).forEach(function (o) { o.classList.toggle("on", o === b); });
        setErr("subject", "");
      });
    });
    ["name", "email", "subject", "message"].forEach(function (n) { field(n).addEventListener("input", function () { if (field(n).getAttribute("aria-invalid") === "true") setErr(n, validate().errors[n]); }); });
    var send = $("#form-send"), formErr = $("#form-error");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var res = validate(), names = Object.keys(res.errors);
      ["name", "email", "subject", "message"].forEach(function (n) { setErr(n, res.errors[n]); });
      formErr.hidden = true;
      if (names.length) { field(names[0]).focus(); return; }
      send.disabled = true; send.firstChild.textContent = "Sending… ";
      var body = { name: res.values.name, email: res.values.email, subject: res.values.subject, message: res.values.message, website: field("website").value, startedAt: startedAt };
      fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (out) {
          if (!out.ok) {
            if (out.j && out.j.fields) Object.keys(out.j.fields).forEach(function (n) { if (field(n)) setErr(n, out.j.fields[n]); });
            throw new Error((out.j && out.j.error) || "Something went wrong. Please try again.");
          }
          // Remembered for the classic design's welcome-back greeting (src/lib/visitor.ts).
          try { var first = res.values.name.split(/\s+/)[0].slice(0, 40); if (first.length >= 2) localStorage.setItem("visitor-name", first); } catch (err) { /* storage blocked */ }
          $("#done-email").textContent = res.values.email;
          form.hidden = true; $("#contact-done").hidden = false;
          form.reset(); count.textContent = "0";
          $$("[data-subject]", form).forEach(function (o) { o.classList.remove("on"); });
        })
        .catch(function (err) { formErr.textContent = "Message not sent: " + err.message; formErr.hidden = false; toast("Message not sent"); })
        .then(function () { send.disabled = false; send.firstChild.textContent = "Send Message "; });
    });
    $("#send-another").addEventListener("click", function () { startedAt = Date.now(); $("#contact-done").hidden = true; form.hidden = false; field("name").focus(); });
  }
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var el = document.getElementById(b.getAttribute("data-copy"));
      var p = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(el.textContent) : Promise.reject();
      p.then(function () { toast("Copied"); }).catch(function () { var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); toast("Selected"); });
    });
  });

  /* ── Search (Ctrl/⌘+K): pages, projects, articles, updates and actions, as V1's CommandMenu ───────────── */
  var dlg = $("#search-dialog"), input = $("#search-input"), list = $("#search-list");
  if (dlg && input && list) {
    var live = { articles: [], updates: [] };
    var isDark = function () { var t = document.documentElement.getAttribute("data-theme"); if (t) return t === "dark"; return matchMedia("(prefers-color-scheme: dark)").matches; };
    function entries() {
      var out = [];
      var add = function (group, icon, label, value, run, desc) { out.push({ group: group, icon: icon, label: label, value: (value + " " + label).toLowerCase(), run: run, desc: desc }); };
      var go = function (to) { return function () { location.href = to; }; };
      var ext = function (to) { return function () { window.open(to, "_blank", "noopener,noreferrer"); }; };
      // Every destination is a V2 page or section; nothing here leads to the classic design.
      add("Pages", "home", "Home", "page home", go("/v2#top"));
      (data.nav || []).forEach(function (n) { add("Pages", n.icon, n.label, "page " + n.description, go(n.to), n.description); });
      add("Pages", "plane", "Contact", "page contact email message", go("#contact"));
      (data.projects || []).forEach(function (p) { add("Projects", "folder-git", p.title, "project " + p.tags.join(" "), go("/v2/projects/" + p.slug)); });
      live.articles.slice(0, 30).forEach(function (a) { add("Articles", "file-text", a.title, "article", ext(articleUrl(a))); });
      live.updates.slice(0, 30).forEach(function (u) { add("Updates", "megaphone", u.title, "update " + u.kind, go(updateHref(u))); });
      add("Actions", "file-download", "Download CV", "action download cv resume", ext("/ILLIAS_OLANREWAJU_CV.pdf"));
      add("Actions", "calendar-mark", "Book a call", "action book a call meeting calendly", ext("https://calendly.com/olanrewajuillias/30min"));
      add("Actions", "academic", "Google Scholar profile", "action google scholar publications", ext("https://scholar.google.com/citations?user=4lVtohYAAAAJ&hl=en"));
      add("Actions", "rss", "Updates RSS feed", "action rss feed subscribe updates", ext("/api/feed"));
      add("Actions", "palette", "Switch to " + (isDark() ? "light" : "dark") + " mode", "action toggle theme dark light mode", function () { var b = $("#theme-toggle"); if (b) b.click(); });
      if (window.oiDesign && oiDesign.phase() !== "retired") add("Actions", "palette", "Back to classic design", "action classic design switch v1 old look", function () { oiDesign.set("v1"); });
      return out;
    }
    var shownItems = [], sel = 0;
    function render() {
      var q = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      shownItems = entries().filter(function (e) { return q.every(function (w) { return e.value.indexOf(w) >= 0; }); });
      sel = Math.min(sel, Math.max(0, shownItems.length - 1));
      if (!shownItems.length) { list.innerHTML = '<p class="cmdk-empty">No results.</p>'; return; }
      var html = "", group = "";
      shownItems.forEach(function (e, i) {
        if (e.group !== group) { group = e.group; html += '<p class="cmdk-group">' + esc(group) + "</p>"; }
        html += '<div class="cmdk-item" role="option" id="cmdk-' + i + '" data-i="' + i + '" aria-selected="' + (i === sel) + '">' + ic(e.icon) + "<span>" + esc(e.label) + "</span>" + (e.desc ? '<span class="d">' + esc(e.desc) + "</span>" : "") + "</div>";
      });
      list.innerHTML = html;
      input.setAttribute("aria-activedescendant", "cmdk-" + sel);
    }
    function highlight() {
      $$(".cmdk-item", list).forEach(function (el) { el.setAttribute("aria-selected", String(Number(el.getAttribute("data-i")) === sel)); });
      var cur = $("#cmdk-" + sel); if (cur) cur.scrollIntoView({ block: "nearest" });
      input.setAttribute("aria-activedescendant", "cmdk-" + sel);
    }
    function runItem(i) { var e = shownItems[i]; if (!e) return; dlg.close(); e.run(); }
    var loadedLive = false;
    function openSearch() {
      if (!dlg.showModal) return;
      if (!loadedLive) {
        loadedLive = true; // fetched once the menu is first opened, as in V1
        loadArticles().then(function (a) { live.articles = a; if (dlg.open) render(); }).catch(function () {});
        loadUpdates().then(function (u) { live.updates = u; if (dlg.open) render(); }).catch(function () {});
      }
      input.value = ""; sel = 0; render();
      if (!dlg.open) dlg.showModal();
      input.focus();
    }
    input.addEventListener("input", function () { sel = 0; render(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, shownItems.length - 1); highlight(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); highlight(); }
      else if (e.key === "Enter") { e.preventDefault(); runItem(sel); }
    });
    list.addEventListener("click", function (e) { var el = e.target.closest(".cmdk-item"); if (el) runItem(Number(el.getAttribute("data-i"))); });
    list.addEventListener("mousemove", function (e) { var el = e.target.closest(".cmdk-item"); if (el && Number(el.getAttribute("data-i")) !== sel) { sel = Number(el.getAttribute("data-i")); highlight(); } });
    var openBtn = $("#search-open");
    if (openBtn) openBtn.addEventListener("click", openSearch);
    document.addEventListener("keydown", function (e) {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); if (dlg.open) dlg.close(); else openSearch(); }
    });
  }

  /* ── Page hero stats (inner pages) ───────────────────────────────────────────────────────────────────── */
  function setStat(key, value) { var el = $('[data-stat="' + key + '"]'); if (el) el.textContent = value; }
  /** Pill filters: [{ value, label, count }] into `group`; onPick(value) when one is chosen. */
  function renderFilters(group, options, onPick) {
    group.innerHTML = options.map(function (o, i) {
      return '<button class="seg-btn' + (i === 0 ? " on" : "") + '" type="button" data-value="' + esc(o.value) + '" aria-pressed="' + (i === 0) + '">' +
        esc(o.label) + '<span class="ct">' + o.count + "</span></button>";
    }).join("");
    $$(".seg-btn", group).forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".seg-btn", group).forEach(function (o) { var on = o === b; o.classList.toggle("on", on); o.setAttribute("aria-pressed", String(on)); });
        onPick(b.getAttribute("data-value"));
      });
    });
  }

  /* ── Moments page (/v2/moments): the classic Gallery's data (api/moments.js, src/data/gallery.ts) ──────── */
  var momentsEl = $("#moments");
  if (momentsEl) {
    var allMoments = [], shownMoments = [], momentIdx = 0;
    var fallbackMoments = function () { try { return JSON.parse($("#moments-fallback").textContent); } catch (e) { return []; } };
    var momentMedia = function (m, inDialog) {
      var pos = m.focus ? ' style="object-position:' + esc(m.focus) + '"' : "";
      if (m.type === "video") {
        if (inDialog) return '<video src="' + esc(m.src) + '"' + (m.poster ? ' poster="' + esc(m.poster) + '"' : "") + " controls autoplay playsinline></video>";
        return (m.poster ? '<img src="' + esc(m.poster) + '" alt=""' + pos + ' loading="lazy">' : '<video src="' + esc(m.src) + '#t=0.5" muted playsinline preload="metadata"' + pos + "></video>") +
          '<span class="m-play">' + ic("play") + "</span>";
      }
      return '<img src="' + esc(m.src) + '" alt="' + esc(m.caption || m.title) + '"' + pos + (inDialog ? "" : ' loading="lazy"') + ">";
    };
    var renderMoments = function (category) {
      shownMoments = allMoments.filter(function (m) { return category === "all" || m.category === category; });
      if (!shownMoments.length) { momentsEl.innerHTML = '<p class="state">Nothing here yet.</p>'; return; }
      momentsEl.innerHTML = shownMoments.map(function (m, i) {
        return '<button class="moment" type="button" data-i="' + i + '" aria-label="Open ' + esc(m.title) + '"><span class="media">' + momentMedia(m, false) +
          '<span class="m-cat">' + esc(m.category) + "</span>" + (m.date ? '<span class="m-date">' + esc(m.date) + "</span>" : "") +
          '</span><span class="moment-body"><span class="m-title">' + esc(m.title) + "</span>" +
          (m.location ? '<span class="m-loc">' + ic("map-point") + esc(m.location) + "</span>" : "") +
          (m.caption ? '<span class="m-cap">' + esc(m.caption) + "</span>" : "") + "</span></button>";
      }).join("");
    };
    var momentDlg = $("#moment-dialog");
    var showMoment = function (i) {
      momentIdx = (i + shownMoments.length) % shownMoments.length;
      var m = shownMoments[momentIdx];
      $("#moment-title").textContent = m.title;
      $("#moment-media").innerHTML = momentMedia(m, true);
      $("#moment-meta").innerHTML = "<span>" + ic("tag") + esc(m.category) + "</span>" +
        (m.date ? "<span>" + ic("calendar-date") + esc(m.date) + "</span>" : "") +
        (m.location ? "<span>" + ic("map-point") + esc(m.location) + "</span>" : "");
      $("#moment-caption").textContent = m.caption || "";
      var many = shownMoments.length > 1;
      $("#moment-prev").hidden = !many; $("#moment-next").hidden = !many;
    };
    momentsEl.addEventListener("click", function (e) {
      var card = e.target.closest(".moment");
      if (!card || !momentDlg) return;
      showMoment(Number(card.getAttribute("data-i")));
      openDialog(momentDlg);
    });
    if (momentDlg) {
      $("#moment-prev").addEventListener("click", function () { showMoment(momentIdx - 1); });
      $("#moment-next").addEventListener("click", function () { showMoment(momentIdx + 1); });
      momentDlg.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") showMoment(momentIdx - 1);
        if (e.key === "ArrowRight") showMoment(momentIdx + 1);
      });
      // Stop a playing video when the dialog closes.
      momentDlg.addEventListener("close", function () { $("#moment-media").innerHTML = ""; });
    }
    getJSON("/api/moments")
      .then(function (j) { return j.moments || []; })
      .catch(function () { return fallbackMoments(); })
      .then(function (list) {
        allMoments = list;
        var cats = [], places = {};
        list.forEach(function (m) {
          if (cats.indexOf(m.category) < 0) cats.push(m.category);
          if (m.location) places[m.location.toLowerCase()] = true;
        });
        setStat("count", list.length);
        setStat("categories", cats.length);
        setStat("places", Object.keys(places).length);
        setStat("photos", list.filter(function (m) { return m.type !== "video"; }).length);
        var count = function (c) { return list.filter(function (m) { return m.category === c; }).length; };
        renderFilters($("#moment-filters"), [{ value: "all", label: "All moments", count: list.length }].concat(
          cats.map(function (c) { return { value: c, label: c, count: count(c) }; })), renderMoments);
        renderMoments("all");
      });
  }

  /* ── Updates page (/v2/updates): every update, filters, email sign-up (UpdatesPage.tsx, SubscribeForm.tsx) ── */
  var updatesList = $("#updates-list");
  if (updatesList) {
    var allUpdates = [];
    var monthYear = function (iso) { return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "Africa/Lagos" }); };
    var rowHTML = function (u, today) {
      var status = eventStatus(u, today);
      var kind = u.kind === "event"
        ? '<span class="chip u-kind ' + (status === "happening" ? "happening" : "event") + '">' + (status ? statusLabel[status] : "Event") + "</span>"
        : '<span class="chip u-kind">Post</span>';
      var gallery = (u.images || []).map(function (im) { return '<img src="' + esc(im.url) + '" alt="' + esc(im.alt || "") + '" loading="lazy">'; })
        .concat((u.videos || []).map(function (v) { return '<video src="' + esc(v.url) + '"' + (v.posterUrl ? ' poster="' + esc(v.posterUrl) + '"' : "") + ' controls playsinline preload="metadata"></video>'; }));
      return '<details class="u-row sheet" id="u-' + esc(u.id) + '"><summary><span class="u-head"><span class="u-date">' + esc(displayDate(u)) + "</span>" + kind +
        '</span><span class="u-main"><h3>' + esc(u.title) + "</h3>" + (u.body ? '<span class="u-ex">' + esc(u.body) + "</span>" : "") +
        '</span><span class="circle"><svg class="i"><use href="#i-arrow-right"/></svg></span></summary><div class="u-body">' +
        (u.body ? '<p class="u-text">' + esc(u.body) + "</p>" : "") +
        (gallery.length ? '<div class="u-gallery">' + gallery.join("") + "</div>" : "") +
        (u.location ? '<div class="up-meta"><span>' + ic("map-point") + esc(u.location) + "</span></div>" : "") +
        '<div class="u-acts">' + (u.linkUrl ? '<a class="btn btn-dark btn-sm" href="' + esc(u.linkUrl) + '" target="_blank" rel="noopener">Open link ' + ic("arrow-right-up", "i nudge") + "</a>" : "") +
        '<a class="btn btn-dark btn-sm" href="' + updateHref(u) + '">Open ' + ic("arrow-right-up", "i nudge") + '</a><button class="btn btn-line btn-sm" type="button" data-share="' + esc(u.id) + '"><svg class="i" aria-hidden="true"><use href="#i-copy"/></svg>Copy link</button></div></div></details>';
    };
    var renderUpdates = function (kind) {
      var shown = allUpdates.filter(function (u) { return kind === "all" || u.kind === kind; });
      var today = todayInLagos();
      updatesList.innerHTML = shown.length ? shown.map(function (u) { return rowHTML(u, today); }).join("") : '<p class="state">Nothing here yet. Check back soon.</p>';
    };
    var openFromHash = function () {
      if (location.hash.indexOf("#u-") !== 0) return;
      var row = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (!row) return;
      row.open = true;
      row.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
    };
    updatesList.addEventListener("click", function (e) {
      var b = e.target.closest("[data-share]");
      if (!b) return;
      var url = location.origin + "/v2/updates/" + encodeURIComponent(b.getAttribute("data-share"));
      (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(url) : Promise.reject())
        .then(function () { toast("Link copied"); }, function () { toast(url); });
    });
    var filterBtns = $$("#update-filters .seg-btn");
    filterBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        filterBtns.forEach(function (o) { var on = o === b; o.classList.toggle("on", on); o.setAttribute("aria-pressed", String(on)); });
        renderUpdates(b.getAttribute("data-kind"));
      });
    });
    loadUpdates().then(function (list) {
      allUpdates = list;
      var events = list.filter(function (u) { return u.kind === "event"; }).length;
      var newest = list.map(function (u) { return u.createdAt; }).sort().pop();
      setStat("latest", newest ? monthYear(newest) : "–");
      setStat("count", list.length);
      setStat("events", events);
      setStat("posts", list.length - events);
      [["all", list.length], ["event", events], ["post", list.length - events]].forEach(function (c) {
        var el = $('[data-ct="' + c[0] + '"]'); if (el) el.textContent = c[1];
      });
      renderUpdates("all");
      openFromHash();
    }).catch(function () {
      updatesList.innerHTML = '<p class="state">Updates couldn’t be loaded right now. Please try again later.</p>';
    });
    addEventListener("hashchange", openFromHash);

    // Where the confirm / unsubscribe links in emails land (api/subscribe.js sends ?subscription=…).
    var notes = {
      confirmed: ["You’re subscribed. You’ll get an email when I post something new.", false],
      unsubscribed: ["You’ve been unsubscribed and won’t get any more emails.", false],
      invalid: ["That link is no longer valid. Sign up again below if you’d like updates.", true],
      error: ["Something went wrong with that link. Please try again later.", true],
    };
    var note = notes[new URLSearchParams(location.search).get("subscription") || ""];
    if (note) { var noteEl = $("#sub-note"); noteEl.textContent = note[0]; noteEl.classList.toggle("bad", note[1]); noteEl.hidden = false; }

    var subForm = $("#sub-form");
    if (subForm) {
      var subStarted = Date.now(), subMsg = $("#sub-msg"), subSend = $("#sub-send");
      var say = function (text, bad) { subMsg.textContent = text; subMsg.classList.toggle("bad", !!bad); subMsg.hidden = false; };
      subForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = $("#sub-email").value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { say("Enter a valid email address.", true); $("#sub-email").focus(); return; }
        subSend.disabled = true;
        fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email, website: $("#sub-website").value, startedAt: subStarted }) })
          .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || "Something went wrong. Please try again."); }); })
          .then(function () { subForm.hidden = true; say("Check your inbox for a confirmation link to finish subscribing."); })
          .catch(function (err) { say(err.message, true); })
          .then(function () { subSend.disabled = false; });
      });
    }
  }

  /* ── Recommendations page (/v2/recommendations): all approved ones and the form (RecommendationsPage.tsx,
        RecommendationForm.tsx; same limits as recommendationInput in api/_lib/validate.js) ─────────────────── */
  var recsEl = $("#recs");
  if (recsEl) {
    var allRecs = [];
    var initials = function (name) {
      return String(name).trim().split(/\s+/).slice(0, 2).map(function (p) { return (p[0] || "").toUpperCase(); }).join("");
    };
    var recHTML = function (r) {
      var name = r.linkedinUrl
        ? '<a class="n" href="' + esc(r.linkedinUrl) + '" target="_blank" rel="noopener noreferrer nofollow">' + esc(r.name) +
          '<svg class="i" aria-label="LinkedIn profile"><use href="#i-linkedin"/></svg></a>'
        : '<span class="n">' + esc(r.name) + "</span>";
      return '<figure class="rec"><div class="rec-top"><span class="rec-mark" aria-hidden="true">“</span><span class="chips">' +
        (r.featured ? '<span class="chip feat">Featured</span>' : "") +
        '<span class="chip">' + esc(relationshipLabels[r.relationship] || "") + "</span></span></div><blockquote>" + esc(r.body) +
        '</blockquote><figcaption><span class="av" aria-hidden="true">' + esc(initials(r.name)) + '</span><span style="min-width:0;display:grid">' +
        name + '<span class="r">' + esc(recommenderLine(r)) + "</span></span></figcaption></figure>";
    };
    var renderRecs = function (rel) {
      var shown = allRecs.filter(function (r) { return rel === "all" || r.relationship === rel; });
      recsEl.innerHTML = shown.length ? shown.map(recHTML).join("")
        : '<p class="state">No recommendations yet. <a href="#write" style="text-decoration:underline">Be the first.</a></p>';
    };
    recsPromise.then(function (list) {
      allRecs = list;
      var rels = Object.keys(relationshipLabels).filter(function (k) { return list.some(function (r) { return r.relationship === k; }); });
      setStat("count", list.length);
      setStat("featured", list.filter(function (r) { return r.featured; }).length);
      setStat("relationships", rels.length);
      setStat("linkedin", list.filter(function (r) { return r.linkedinUrl; }).length);
      var group = $("#rec-filters");
      if (list.length) {
        renderFilters(group, [{ value: "all", label: "All", count: list.length }].concat(rels.map(function (k) {
          return { value: k, label: relationshipLabels[k], count: list.filter(function (r) { return r.relationship === k; }).length };
        })), renderRecs);
      } else {
        group.hidden = true;
        $("#write-lead").textContent = "Be the first. A few honest sentences about a project, a class or a team we shared helps recruiters see how I work.";
      }
      renderRecs("all");
    }).catch(function () {
      recsEl.innerHTML = '<p class="state">Recommendations couldn’t be loaded right now. You can still leave one below.</p>';
      $("#rec-filters").hidden = true;
    });

    var recForm = $("#rec-form");
    var recStarted = Date.now();
    var rf = function (n) { return recForm.elements[n]; };
    rf("relationship").insertAdjacentHTML("beforeend", Object.keys(relationshipLabels).map(function (k) {
      return '<option value="' + k + '">' + esc(relationshipLabels[k]) + "</option>";
    }).join(""));
    var recErr = function (n, msg) {
      var label = rf(n).closest(".field"), el = $(".err", label);
      label.classList.toggle("bad", !!msg);
      if (msg && !el) { el = document.createElement("span"); el.className = "err"; label.appendChild(el); }
      if (el) { el.textContent = msg || ""; el.hidden = !msg; }
      rf(n).setAttribute("aria-invalid", msg ? "true" : "false");
    };
    var FIELDS = ["name", "relationship", "role", "company", "body", "linkedinUrl", "email"];
    var recValidate = function () {
      var v = {};
      FIELDS.forEach(function (n) { v[n] = rf(n).value.trim(); });
      var e = {};
      if (v.name.length < 2) e.name = "Add your name.";
      if (!relationshipLabels[v.relationship]) e.relationship = "Choose how you know Illias.";
      if (v.body.length < 40) e.body = "Write at least a couple of sentences (40+ characters).";
      else if (v.body.length > 2000) e.body = "Keep it under 2,000 characters.";
      if (v.linkedinUrl && !/^https:\/\/([a-z]{2,3}\.)?linkedin\.com\//i.test(v.linkedinUrl)) e.linkedinUrl = "Use your LinkedIn profile link (https://linkedin.com/in/…), or leave it empty.";
      if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) e.email = "Enter a valid email, or leave it empty.";
      return { values: v, errors: e };
    };
    var recCount = $("#rec-count");
    rf("body").addEventListener("input", function () { recCount.textContent = rf("body").value.trim().length; });
    FIELDS.forEach(function (n) {
      rf(n).addEventListener(n === "relationship" ? "change" : "input", function () {
        if (rf(n).getAttribute("aria-invalid") === "true") recErr(n, recValidate().errors[n]);
      });
    });
    var recSend = $("#rec-send"), recFormErr = $("#rec-error");
    recForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var res = recValidate(), bad = FIELDS.filter(function (n) { return res.errors[n]; });
      FIELDS.forEach(function (n) { recErr(n, res.errors[n]); });
      recFormErr.hidden = true;
      if (bad.length) { rf(bad[0]).focus(); return; }
      recSend.disabled = true;
      var body = {};
      FIELDS.forEach(function (n) { body[n] = res.values[n]; });
      body.website = $("#rec-website").value;
      body.startedAt = recStarted;
      fetch("/api/recommendations", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || "Something went wrong. Please try again."); }); })
        .then(function () {
          // Remembered for the welcome-back greeting (src/lib/visitor.ts), as the classic form does.
          try { var first = res.values.name.split(/\s+/)[0].slice(0, 40); if (first.length >= 2) localStorage.setItem("visitor-name", first); } catch (err) { /* storage blocked */ }
          recForm.hidden = true; $("#rec-done").hidden = false;
          recForm.reset(); recCount.textContent = "0";
        })
        .catch(function (err) { recFormErr.textContent = "Not sent: " + err.message; recFormErr.hidden = false; toast("Not sent"); })
        .then(function () { recSend.disabled = false; });
    });
    $("#rec-again").addEventListener("click", function () {
      recStarted = Date.now(); $("#rec-done").hidden = true; recForm.hidden = false; rf("name").focus();
    });
  }

  /* ── Projects page (/v2/projects): filter the featured cards and the list by category group ───────────── */
  var projFilter = $('[data-filter="projects"]');
  if (projFilter) {
    $$(".seg-btn", projFilter).forEach(function (b) {
      b.addEventListener("click", function () {
        var g = b.getAttribute("data-value");
        $$(".seg-btn", projFilter).forEach(function (o) { var on = o === b; o.classList.toggle("on", on); o.setAttribute("aria-pressed", String(on)); });
        var any = false;
        ["featured", "more"].forEach(function (list) {
          var shown = 0;
          $$('[data-list="' + list + '"] [data-group]').forEach(function (el) {
            var show = g === "all" || el.getAttribute("data-group") === g;
            el.hidden = !show; if (show) shown++;
          });
          $('[data-list="' + list + '"]').hidden = !shown;
          $('[data-heading="' + list + '"]').hidden = !shown;
          if (shown) any = true;
        });
        $("[data-empty]").hidden = any;
      });
    });
  }

  /* ── Articles page (/v2/articles): every topic once, published first (Articles.tsx useArticleList) ─────────
        Search, track filter in the URL (?track=ai, so a filtered view can be shared), first 9 then "Show all". */
  var artsEl = $("#articles");
  if (artsEl) {
    var TRACK_ICONS = { "full-stack": "layers", ai: "bot", database: "database", quality: "shield-check", product: "lightbulb", fintech: "bank", devops: "git-branch", "case-studies": "notebook" };
    var INITIAL = 9, items = [], showAllArts = false;
    var trackParam = new URLSearchParams(location.search).get("track");
    var activeTrack = tracks.some(function (t) { return t.id === trackParam; }) ? trackParam : "all";
    var search = $("#article-search"), moreBtn = $("#articles-more");
    var fileKind = function (a) {
      var name = String(a.fileName || a.fileUrl || "").toLowerCase();
      if (/\.pdf$/.test(name)) return "PDF";
      if (/\.docx$/.test(name)) return "Word";
      return a.fileUrl ? "File" : null;
    };
    var cardHTML = function (it) {
      var a = it.article, kind = a && fileKind(a);
      var links = a ? [
        a.fileUrl ? '<a class="btn btn-dark btn-sm" href="' + esc(a.fileUrl) + '" target="_blank" rel="noopener"' + (kind === "PDF" ? "" : " download") + ">" + ic(kind === "PDF" ? "file-text" : "file-download") + (kind === "PDF" ? "Read PDF" : "Download " + kind) + "</a>" : "",
        a.scholarUrl ? '<a class="btn btn-line btn-sm" href="' + esc(a.scholarUrl) + '" target="_blank" rel="noopener">' + ic("academic") + "Google Scholar</a>" : "",
        a.zenodoUrl ? '<a class="btn btn-line btn-sm" href="' + esc(a.zenodoUrl) + '" target="_blank" rel="noopener">' + ic("notebook") + "Zenodo</a>" : "",
      ].join("") : "";
      return '<article class="art-card' + (a ? "" : " planned") + '"><div class="art-top"><span class="art-tr">' + ic(TRACK_ICONS[it.track] || "file-text") + esc(trackLabel(it.track)) +
        '</span><span class="chip' + (a ? " pub" : "") + '">' + (a ? "Published" : "Planned") + "</span></div><h3>" + esc(it.title) + "</h3>" +
        (a && a.summary ? "<p>" + esc(a.summary) + "</p>" : "") + (a ? '<span class="art-date">' + esc(articleDate(a)) + "</span>" : "") +
        (links ? '<div class="case-links">' + links + "</div>" : "") + "</article>";
    };
    var renderArts = function () {
      var q = search.value.trim().toLowerCase();
      var list = items.filter(function (it) {
        return (activeTrack === "all" || it.track === activeTrack) &&
          (!q || it.title.toLowerCase().indexOf(q) >= 0 || (it.article && String(it.article.summary || "").toLowerCase().indexOf(q) >= 0));
      });
      var visible = showAllArts ? list : list.slice(0, INITIAL);
      artsEl.innerHTML = visible.length ? visible.map(cardHTML).join("")
        : '<p class="state">No topics match “' + esc(search.value) + '”. Try another keyword or track.</p>';
      $("#article-live").textContent = list.length + (list.length === 1 ? " topic" : " topics") + " shown";
      moreBtn.hidden = list.length <= INITIAL;
      moreBtn.textContent = showAllArts ? "Show fewer" : "Show all " + list.length + " topics";
    };
    var buildArts = function (articles) {
      var filled = {};
      var published = articles.map(function (a) {
        var topic = a.topic || matchPlannedTopic(a.title);
        if (topic) filled[topic] = true;
        var track = tracks.some(function (t) { return t.id === a.track; }) ? a.track : tracks[0].id;
        return { title: a.title, track: track, article: a };
      });
      var plannedItems = [];
      tracks.forEach(function (t) {
        (planned[t.id] || []).forEach(function (topic) { if (!filled[topic]) plannedItems.push({ title: topic, track: t.id, article: null }); });
      });
      items = published.concat(plannedItems);
      setStat("topics", items.length); setStat("tracks", tracks.length);
      setStat("published", published.length); setStat("planned", plannedItems.length);
      var count = function (id) { return items.filter(function (it) { return it.track === id; }).length; };
      var group = $("#article-filters");
      renderFilters(group, [{ value: "all", label: "All topics", count: items.length }].concat(tracks.map(function (t) {
        return { value: t.id, label: t.label, count: count(t.id) };
      })), function (v) {
        activeTrack = v; showAllArts = false;
        var u = new URL(location.href);
        if (v === "all") u.searchParams.delete("track"); else u.searchParams.set("track", v);
        history.replaceState(null, "", u.pathname + u.search + u.hash);
        renderArts();
      });
      // Select the track from the URL.
      $$(".seg-btn", group).forEach(function (b) {
        var on = b.getAttribute("data-value") === activeTrack;
        b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on));
      });
      renderArts();
    };
    search.addEventListener("input", function () { showAllArts = false; renderArts(); });
    moreBtn.addEventListener("click", function () { showAllArts = !showAllArts; renderArts(); });
    // Planned topics still show when the articles API can't be reached.
    loadArticles().then(buildArts, function () { buildArts([]); });
  }

  /* ── Roadmap (/v2/roadmap): the progress tracker. Same storage key as the classic page (RoadmapPage.tsx), so
        ticked months carry across both designs. ──────────────────────────────────────────────────────────── */
  var tracker = $("[data-tracker]");
  if (tracker) {
    var TR_KEY = "roadmap-progress-v1";
    var boxes = $$('input[type="checkbox"]', tracker);
    var readDone = function () {
      try { var v = JSON.parse(localStorage.getItem(TR_KEY) || "[]"); return Array.isArray(v) ? v.filter(function (x) { return typeof x === "number"; }) : []; }
      catch (e) { return []; }
    };
    var paint = function (done) {
      boxes.forEach(function (b) { b.checked = done.indexOf(Number(b.value)) >= 0; b.closest("li").classList.toggle("done", b.checked); });
      var count = boxes.filter(function (b) { return b.checked; }).length, pc = Math.round((count / boxes.length) * 100);
      $("[data-tr-pc]", tracker).textContent = pc;
      $("[data-tr-count]", tracker).textContent = count;
      $(".tr-bar span", tracker).style.width = pc + "%";
      $(".tr-bar", tracker).setAttribute("aria-valuenow", String(pc));
      $("[data-tr-reset]", tracker).disabled = count === 0;
    };
    var save = function (done) { try { localStorage.setItem(TR_KEY, JSON.stringify(done)); } catch (e) { /* not remembered */ } paint(done); };
    boxes.forEach(function (b) {
      b.addEventListener("change", function () {
        save(boxes.filter(function (x) { return x.checked; }).map(function (x) { return Number(x.value); }));
      });
    });
    $("[data-tr-reset]", tracker).addEventListener("click", function () { save([]); });
    paint(readDone());
  }

  /* ── One update (/v2/updates/<id>): the post, likes and comments (UpdateDetailPage.tsx, src/lib/likes.ts,
        UpdateComments.tsx; same APIs and limits) ─────────────────────────────────────────────────────────── */
  var uArticle = $("#u-article");
  if (uArticle) {
    var uid = decodeURIComponent(location.pathname.replace(/\/+$/, "").split("/").pop() || "");
    var visitor = function () {
      var key = "portfolio-visitor-id", id = null;
      try {
        id = localStorage.getItem(key);
        if (!id || !/^[A-Za-z0-9_-]{16,64}$/.test(id)) { id = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()).replace(/-/g, ""); localStorage.setItem(key, id); }
      } catch (e) { id = id || "anon" + Date.now() + "xxxxxxxx"; }
      return id;
    };
    var missing = function () {
      $("#u-title").textContent = "This update isn’t available";
      uArticle.innerHTML = '<p class="state">It may have been removed or unpublished. <a href="/v2/updates" style="text-decoration:underline">See all updates</a>.</p>';
    };
    loadUpdates().then(function (list) {
      var idx = -1;
      list.forEach(function (x, i) { if (x.id === uid) idx = i; });
      if (idx < 0) return missing();
      var u = list[idx], today = todayInLagos(), status = eventStatus(u, today);
      document.title = u.title + " | " + document.title.split(" | ").pop();
      $("#u-kind").textContent = u.kind === "event" ? (status ? statusLabel[status] : "Event") : "Post";
      $("#u-title").textContent = u.title;
      $("#u-meta").innerHTML = "<span>" + ic("calendar-date") + esc(displayDate(u)) + "</span>" + (u.location ? "<span>" + ic("map-point") + esc(u.location) + "</span>" : "");
      $("#u-actions").innerHTML =
        '<button class="btn btn-accent" type="button" id="u-like" aria-pressed="false">' + ic("hand-heart") + '<span>Like</span></button>' +
        (u.linkUrl ? '<a class="btn btn-line" href="' + esc(u.linkUrl) + '" target="_blank" rel="noopener">Open link ' + ic("arrow-right-up", "i nudge") + "</a>" : "") +
        '<button class="btn btn-line" type="button" id="u-share"><svg class="i" aria-hidden="true"><use href="#i-copy"/></svg>Copy link</button>';
      var media = (u.images || []).map(function (im) { return '<img src="' + esc(im.url) + '" alt="' + esc(im.alt || "") + '" loading="lazy">'; })
        .concat((u.videos || []).map(function (v) { return '<video src="' + esc(v.url) + '"' + (v.posterUrl ? ' poster="' + esc(v.posterUrl) + '"' : "") + ' controls playsinline preload="metadata"></video>'; }));
      uArticle.innerHTML = (media.length ? '<div class="u-media' + (media.length === 1 ? " one" : "") + '">' + media.join("") + "</div>" : "") +
        (u.body ? '<p class="u-text">' + esc(u.body) + "</p>" : "");
      $("#u-share").addEventListener("click", function () {
        var url = location.origin + "/v2/updates/" + encodeURIComponent(u.id);
        (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { toast("Link copied"); }, function () { toast(url); });
      });
      // Previous / next in the same order as the Updates page.
      var prev = list[idx - 1], next = list[idx + 1], pn = $("#u-pn");
      if (prev || next) {
        pn.innerHTML = (prev ? '<a class="pn-l sheet" href="' + updateHref(prev) + '"><span class="k">Newer</span><span class="t">' + esc(prev.title) + "</span></a>" : "<span></span>") +
          (next ? '<a class="pn-r sheet" href="' + updateHref(next) + '"><span class="k">Older</span><span class="t">' + esc(next.title) + "</span></a>" : "");
        pn.hidden = false;
      }
      $("#u-stats").hidden = false;

      // Likes
      var likeBtn = $("#u-like"), liked = false, busy = false;
      var showLikes = function (s) {
        liked = !!s.liked; setStat("likes", s.count);
        likeBtn.setAttribute("aria-pressed", String(liked));
        $("span", likeBtn).textContent = liked ? "Liked" : "Like";
      };
      getJSON("/api/likes?updateId=" + encodeURIComponent(u.id) + "&visitorId=" + encodeURIComponent(visitor())).then(showLikes).catch(function () { setStat("likes", "–"); });
      likeBtn.addEventListener("click", function () {
        if (busy) return; busy = true;
        fetch("/api/likes", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ updateId: u.id, visitorId: visitor(), liked: !liked }) })
          .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || "Couldn’t save that."); return j; }); })
          .then(showLikes).catch(function (err) { toast(err.message); }).then(function () { busy = false; });
      });

      // Comments
      var cWrap = $("#u-comments"), cList = $("#c-list");
      cWrap.hidden = false;
      var shortDate = function (iso) { return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" }); };
      getJSON("/api/comments?updateId=" + encodeURIComponent(u.id)).then(function (j) {
        var cs = j.comments || [];
        setStat("comments", cs.length);
        $("#c-count").textContent = cs.length || "";
        if (cs.length) cList.innerHTML = '<ul class="c-list">' + cs.map(function (c) {
          return '<li><span class="av" aria-hidden="true">' + esc((String(c.name).trim()[0] || "").toUpperCase()) + '</span><div><p class="c-by"><b>' + esc(c.name) + "</b> · " + esc(shortDate(c.createdAt)) + '</p><p class="c-body">' + esc(c.body) + "</p></div></li>";
        }).join("") + "</ul>";
      }).catch(function () { setStat("comments", "–"); cList.innerHTML = '<p class="small">Comments couldn’t be loaded right now.</p>'; });
      var cForm = $("#c-form"), cStarted = Date.now();
      cForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = cForm.elements.name.value.trim(), body = cForm.elements.body.value.trim(), email = cForm.elements.email.value.trim();
        var err = $("#c-error");
        err.hidden = true; $("#c-done").hidden = true;
        var problem = name.length < 2 ? "Add your name." : body.length < 2 ? "Write a comment." : email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? "Enter a valid email, or leave it empty." : "";
        if (problem) { err.textContent = problem; err.hidden = false; return; }
        $("#c-send").disabled = true;
        fetch("/api/comments", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ updateId: u.id, name: name, body: body, email: email, website: $("#c-website").value, startedAt: cStarted }) })
          .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || "Something went wrong. Please try again."); }); })
          .then(function () { cForm.elements.body.value = ""; $("#c-done").hidden = false; cStarted = Date.now(); })
          .catch(function (x) { err.textContent = x.message; err.hidden = false; })
          .then(function () { $("#c-send").disabled = false; });
      });
    }).catch(function () {
      $("#u-title").textContent = "Update";
      uArticle.innerHTML = '<p class="state">This update couldn’t be loaded right now. Please try again later.</p>';
    });
  }

  /* ── Project pages: copy a code sample ─────────────────────────────────────────────────────────────────── */
  $$("[data-copy-code]").forEach(function (b) {
    b.addEventListener("click", function () { copyText($("code", b.closest("figure")), "Code copied"); });
  });
})();
