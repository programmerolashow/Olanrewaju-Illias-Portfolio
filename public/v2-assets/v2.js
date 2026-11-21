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
    $$(".dd-item").forEach(function (a) {
      var on = a.getAttribute("data-section") === id;
      a.classList.toggle("on", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
    dds.forEach(function (dd) { $(".dd-btn", dd).classList.toggle("on", !!$(".dd-item.on", dd)); });
  }
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
        return '<a class="post" href="/articles?track=' + encodeURIComponent(a.track) + '"><span class="tr">' + esc(trackLabel(a.track)) +
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
        '</div><p class="kind-l">' + (u.kind === "event" ? "Event" : "Post") + '</p><h3><a href="/updates/' + encodeURIComponent(u.id) + '">' + esc(u.title) + "</a></h3>" +
        (u.body ? "<p>" + esc(u.body) + "</p>" : "") +
        '<div class="up-meta"><span>' + ic("calendar-date") + esc(displayDate(u)) + "</span>" +
        (u.location ? "<span>" + ic("map-point") + esc(u.location) + "</span>" : "") + "</div></article>";
    }).join("");
    $("#updates-all").hidden = list.length <= 3;
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
  getJSON("/api/recommendations").then(function (j) {
    var all = j.recommendations || [];
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
    $("#words-count").textContent = all.length;
    $("#words-all").hidden = false;
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
      add("Pages", "home", "Home", "page home", go("#top"));
      (data.nav || []).forEach(function (n) { add("Pages", n.icon, n.label, "page " + n.description, go(n.to), n.description); });
      add("Pages", "plane", "Contact", "page contact email message", go("#contact"));
      (data.projects || []).forEach(function (p) { add("Projects", "folder-git", p.title, "project " + p.tags.join(" "), go("/projects/" + p.slug)); });
      live.articles.slice(0, 30).forEach(function (a) { add("Articles", "file-text", a.title, "article", go("/articles")); });
      live.updates.slice(0, 30).forEach(function (u) { add("Updates", "megaphone", u.title, "update " + u.kind, go("/updates/" + u.id)); });
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
})();
