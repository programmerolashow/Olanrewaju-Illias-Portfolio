/**
 * The new design's admin (/v2/admin), a port of the classic one (src/pages/AdminPage.tsx,
 * src/components/admin/MomentsAdmin.tsx and shared.tsx) onto the same /api/admin/* endpoints:
 *   sign in / out, Updates (photos, videos, publish, pin, email subscribers), Articles (planned topics, file
 *   upload), Moments (photo or video, shape, crop, order), and review of Recommendations and Comments.
 * The open section lives in the URL hash (#updates, #articles, …) so a refresh keeps your place.
 * Same limits as the classic admin: 12 photos and 4 videos per post, 200 MB per video, 4 MB per article file.
 */
(function () {
  "use strict";
  var root = document.getElementById("adm");
  if (!root) return;

  /* ── Helpers ─────────────────────────────────────────────────────────────────────────────────────────── */
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  };
  var ic = function (id, cls) { return '<svg class="' + (cls || "i") + '" aria-hidden="true"><use href="/v2-assets/icons.svg#i-' + id + '"/></svg>'; };
  var il = function (id, cls) { return '<svg class="' + (cls || "i") + '" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; };
  var plural = function (n, word) { return n + " " + word + (n === 1 ? "" : "s"); };
  var setStat = function (key, v) { var el = $('[data-stat="' + key + '"]'); if (el) el.textContent = v; };
  var toastTimer;
  var toast = function (msg) {
    var t = $("#toast"); if (!t) return;
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  };

  function api(path, init) {
    init = init || {};
    var headers = { "Content-Type": "application/json" };
    for (var k in init.headers || {}) headers[k] = init.headers[k];
    return fetch(path, { method: init.method || "GET", body: init.body, credentials: "same-origin", headers: headers }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (json) {
        if (!res.ok) throw new Error(json.error || "Request failed (" + res.status + ")");
        return json;
      });
    });
  }

  /* Uploads (shared.tsx): photos are resized in the browser; videos go straight to storage with a poster frame. */
  var encode = function (canvas, type, quality) {
    return new Promise(function (resolve, reject) { canvas.toBlob(function (b) { b ? resolve(b) : reject(new Error("Could not process image.")); }, type, quality); });
  };
  /** display: at most 1600px WebP (JPEG on Safari); share: 1200×630 centre crop JPEG for link previews. */
  function prepareImage(file) {
    return createImageBitmap(file).then(function (bitmap) {
      var scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
      var display = document.createElement("canvas");
      display.width = Math.round(bitmap.width * scale); display.height = Math.round(bitmap.height * scale);
      display.getContext("2d").drawImage(bitmap, 0, 0, display.width, display.height);
      var share = document.createElement("canvas");
      share.width = 1200; share.height = 630;
      var cover = Math.max(1200 / bitmap.width, 630 / bitmap.height), w = bitmap.width * cover, h = bitmap.height * cover;
      share.getContext("2d").drawImage(bitmap, (1200 - w) / 2, (630 - h) / 2, w, h);
      return encode(display, "image/webp", 0.82)
        .then(function (b) { return b.type === "image/webp" ? b : encode(display, "image/jpeg", 0.85); })
        .then(function (displayBlob) {
          return encode(share, "image/jpeg", 0.82).then(function (shareBlob) { bitmap.close(); return { displayBlob: displayBlob, shareBlob: shareBlob }; });
        });
    });
  }
  var uploadBlob = function (blob) {
    return api("/api/admin/upload", { method: "POST", body: blob, headers: { "Content-Type": blob.type } }).then(function (r) { return r.url; });
  };
  var VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
  var MAX_VIDEO_BYTES = 200 * 1024 * 1024, MAX_VIDEOS = 4, MAX_PHOTOS = 12;
  var videoType = function (file) { return file.type || (file.name.toLowerCase().slice(-4) === ".mov" ? "video/quicktime" : ""); };
  /** A still from about one second in; null when this browser can't decode the file (the video still uploads). */
  function grabPoster(file) {
    return new Promise(function (resolve) {
      var video = document.createElement("video"), src = URL.createObjectURL(file);
      var done = function (b) { URL.revokeObjectURL(src); resolve(b); };
      var timeout = setTimeout(function () { done(null); }, 15000);
      video.muted = true; video.playsInline = true; video.preload = "auto";
      video.onerror = function () { clearTimeout(timeout); done(null); };
      video.onloadedmetadata = function () { video.currentTime = Math.min(1, (video.duration || 0) / 2); };
      video.onseeked = function () {
        clearTimeout(timeout);
        if (!video.videoWidth) return done(null);
        var scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight));
        var c = document.createElement("canvas");
        c.width = Math.round(video.videoWidth * scale); c.height = Math.round(video.videoHeight * scale);
        c.getContext("2d").drawImage(video, 0, 0, c.width, c.height);
        encode(c, "image/webp", 0.82).then(function (b) { return b.type === "image/webp" ? b : encode(c, "image/jpeg", 0.85); }).then(done, function () { done(null); });
      };
      video.src = src;
    });
  }
  /** Signed URL from the API, then a PUT straight to storage (XHR, for progress from 0 to 1). */
  function uploadVideo(file, type, onProgress) {
    return api("/api/admin/video-upload", { method: "POST", body: JSON.stringify({ type: type, size: file.size }) }).then(function (r) {
      return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("PUT", r.uploadUrl);
        for (var name in r.headers) xhr.setRequestHeader(name, r.headers[name]);
        xhr.upload.onprogress = function (e) { if (e.lengthComputable) onProgress(e.loaded / e.total); };
        xhr.onload = function () { xhr.status >= 200 && xhr.status < 300 ? resolve(r.url) : reject(new Error("Video upload failed: storage returned HTTP " + xhr.status + ".")); };
        xhr.onerror = function () { reject(new Error("Video upload failed. If this keeps happening, run `npm run storage:cors` to allow this site.")); };
        xhr.send(file);
      });
    });
  }

  /* Form pieces */
  var field = function (label, control, hint) {
    return '<label class="af"><span class="af-l">' + esc(label) + "</span>" + control + (hint ? '<span class="af-h">' + esc(hint) + "</span>" : "") + "</label>";
  };
  var toggle = function (name, on, label, hint) {
    return '<button class="tg" type="button" role="switch" data-toggle="' + name + '" aria-checked="' + !!on + '"><span><span class="af-l">' + esc(label) + '</span><span class="af-h">' + esc(hint) + '</span></span><span class="tg-k" aria-hidden="true"></span></button>';
  };
  var seg = function (name, options, value, label) {
    return '<div class="seg" role="group" aria-label="' + esc(label) + '">' + options.map(function (o) {
      var on = o.value === value;
      return '<button class="seg-btn' + (on ? " on" : "") + '" type="button" data-seg="' + name + '" data-value="' + esc(o.value) + '" aria-pressed="' + on + '">' + o.label + "</button>";
    }).join("") + "</div>";
  };
  var err = function (msg) { return msg ? '<p class="af-err" role="alert">' + esc(msg) + "</p>" : ""; };
  var spinner = '<span class="spin" aria-hidden="true"></span>';
  var editorHead = function (title) {
    return '<div class="adm-head"><h2 class="cs-h">' + esc(title) + '</h2><button class="btn btn-line btn-sm" type="button" data-back>' + il("arrow-right", "i back") + "Back</button></div>";
  };
  var confirmDelete = function (what) { return window.confirm("Delete " + what + "? This can't be undone."); };

  /* Dates and labels (src/lib/updates.ts, src/lib/articles.ts, src/lib/feedback.ts) */
  var todayInLagos = function () { return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date()); };
  var formatDay = function (iso, withYear) {
    var o = { day: "numeric", month: "short", timeZone: "UTC" }; if (withYear !== false) o.year = "numeric";
    return new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", o);
  };
  var displayDate = function (u) {
    if (!u.startsOn) return formatDay(u.createdAt.slice(0, 10));
    if (!u.endsOn || u.endsOn === u.startsOn) return formatDay(u.startsOn);
    return formatDay(u.startsOn, u.startsOn.slice(0, 4) !== u.endsOn.slice(0, 4)) + " – " + formatDay(u.endsOn);
  };
  var eventStatus = function (u) {
    if (u.kind !== "event" || !u.startsOn) return null;
    var t = todayInLagos(), end = u.endsOn || u.startsOn;
    return t < u.startsOn ? "Upcoming" : t <= end ? "Happening now" : "Past event";
  };
  var coverUrl = function (u) {
    if (u.images && u.images[0]) return u.images[0].url;
    var v = (u.videos || []).filter(function (x) { return x.posterUrl; })[0];
    return v ? v.posterUrl : null;
  };
  var bannerVideo = function (videos) { return (videos || []).filter(function (v) { return v.featured; })[0] || (videos || [])[0]; };
  var shortDate = function (iso) { return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" }); };
  var relationshipLabels = { colleague: "Colleague", manager: "Manager", teammate: "Teammate", classmate: "Schoolmate", course_mate: "Course-mate", collaborator: "Collaborator", client: "Client", mentor: "Mentor", mentee: "Mentee", other: "Other" };
  var recommenderLine = function (r) { return [r.role, r.company].filter(Boolean).join(" · ") || relationshipLabels[r.relationship] || ""; };
  var siteData = {};
  try { siteData = JSON.parse($("#v2-data").textContent); } catch (e) { /* no planned topics */ }
  var tracks = siteData.tracks || [], planned = siteData.plannedTopics || {};
  var trackLabel = function (id) { var t = tracks.filter(function (x) { return x.id === id; })[0]; return t ? t.label : id; };
  var normalise = function (t) { return String(t).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); };
  var matchPlannedTopic = function (title) {
    var t = normalise(title);
    if (!t) return null;
    for (var i = 0; i < tracks.length; i++) {
      var list = planned[tracks[i].id] || [];
      for (var j = 0; j < list.length; j++) if (t.indexOf(normalise(list[j])) === 0) return { track: tracks[i].id, topic: list[j] };
    }
    return null;
  };
  var fileKind = function (a) {
    var name = String(a.fileName || a.fileUrl || "").toLowerCase();
    if (/\.pdf$/.test(name)) return "PDF";
    if (/\.docx$/.test(name)) return "Word";
    return a.fileUrl ? "File" : null;
  };
  var articleDate = function (a) { return formatDay(a.publishedOn || a.createdAt.slice(0, 10)); };

  /* ── State ───────────────────────────────────────────────────────────────────────────────────────────── */
  var TABS = [
    { value: "updates", label: "Updates" }, { value: "articles", label: "Articles" }, { value: "moments", label: "Moments" },
    { value: "recommendations", label: "Recommendations" }, { value: "comments", label: "Comments" },
  ];
  var state = { tab: "updates", data: {}, subscribers: null, modFilter: { recommendations: "pending", comments: "pending" } };
  var tabFromHash = function () { var h = location.hash.slice(1); return TABS.some(function (t) { return t.value === h; }) ? h : "updates"; };

  /* ── Sign in ─────────────────────────────────────────────────────────────────────────────────────────── */
  function signIn(message) {
    $("#adm-stats").hidden = true;
    root.innerHTML = '<form class="adm-card sheet signin" id="signin"><h2 class="cs-h">Admin sign-in</h2>' +
      field("Password", '<input type="password" name="password" autocomplete="current-password" required>') +
      err(message) + '<button class="btn btn-dark" type="submit">Sign in</button></form>';
    var form = $("#signin");
    form.password.focus();
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = $("button", form); btn.disabled = true; btn.innerHTML = spinner + "Signing in…";
      api("/api/admin/login", { method: "POST", body: JSON.stringify({ password: form.password.value }) })
        .then(function () { start(); }, function (x) { signIn(x.message); });
    });
  }

  function start() {
    root.innerHTML = '<p class="state">Checking your session…</p>';
    api("/api/admin/session").then(function (s) {
      if (!s.authenticated) return signIn();
      state.tab = tabFromHash();
      loadCounts();
      dashboard();
    }, function (x) { root.innerHTML = '<p class="state">The admin API isn’t reachable: ' + esc(x.message) + "</p>"; });
  }

  /* ── Dashboard ───────────────────────────────────────────────────────────────────────────────────────── */
  /** Header numbers and the pending badges on the Recommendations / Comments tabs. */
  function loadCounts() {
    $("#adm-stats").hidden = false;
    api("/api/admin/subscribers").then(function (r) { state.subscribers = r.counts; setStat("subscribers", r.counts.confirmed); if (state.tab === "updates" && !state.editing) dashboard(); }, function () { setStat("subscribers", "–"); });
    ["recommendations", "comments"].forEach(function (kind) {
      api("/api/admin/moderation?kind=" + kind).then(function (r) {
        state.data[kind] = r.items || [];
        paintBadges();
      }, function () { /* the tab shows the error */ });
    });
  }
  function pendingCount(kind) { return (state.data[kind] || []).filter(function (i) { return i.status === "pending"; }).length; }
  function paintBadges() {
    setStat("pending-recs", state.data.recommendations ? pendingCount("recommendations") : "–");
    setStat("pending-comments", state.data.comments ? pendingCount("comments") : "–");
    ["recommendations", "comments"].forEach(function (k) {
      var b = $('[data-badge="' + k + '"]'); if (!b) return;
      var n = state.data[k] ? pendingCount(k) : 0;
      b.textContent = n; b.hidden = !n;
    });
  }

  function dashboard() {
    state.editing = null;
    var tabs = '<div class="seg adm-tabs" role="tablist" aria-label="Admin sections">' + TABS.map(function (t) {
      var on = t.value === state.tab;
      return '<button class="seg-btn' + (on ? " on" : "") + '" type="button" role="tab" aria-selected="' + on + '" data-tab="' + t.value + '">' + t.label +
        (t.value === "recommendations" || t.value === "comments" ? '<span class="badge" data-badge="' + t.value + '" hidden></span>' : "") + "</button>";
    }).join("") + "</div>";
    var newLabel = { updates: "New post", articles: "New article", moments: "New moment" }[state.tab];
    root.innerHTML = '<div class="adm-bar">' + tabs + '<div class="adm-acts">' +
      (newLabel ? '<button class="btn btn-dark btn-sm" type="button" data-new>' + ic("pen") + newLabel + "</button>" : "") +
      '<button class="btn btn-line btn-sm" type="button" data-logout>Sign out</button></div></div><div id="adm-body"><p class="state">Loading…</p></div>';
    paintBadges();
    $$("[data-tab]", root).forEach(function (b) {
      b.addEventListener("click", function () { state.tab = b.getAttribute("data-tab"); history.replaceState(null, "", "#" + state.tab); dashboard(); });
    });
    var nb = $("[data-new]", root);
    if (nb) nb.addEventListener("click", function () { ({ updates: updateEditor, articles: articleEditor, moments: momentEditor })[state.tab](null); });
    $("[data-logout]", root).addEventListener("click", function () {
      api("/api/admin/logout", { method: "POST" }).then(function () { location.hash = ""; signIn(); }, function (x) { toast(x.message); });
    });
    ({ updates: updatesTab, articles: articlesTab, moments: momentsTab, recommendations: moderationTab, comments: moderationTab })[state.tab]();
  }
  var body = function () { return $("#adm-body"); };
  var fail = function (x) { var b = body(); if (b) b.innerHTML = '<p class="af-err">' + esc(x.message) + "</p>"; };

  /* ── Updates ─────────────────────────────────────────────────────────────────────────────────────────── */
  function updatesTab() {
    api("/api/admin/updates").then(function (r) {
      var list = state.data.updates = r.updates || [];
      setStat("updates", list.length);
      if (state.tab !== "updates" || state.editing) return;
      var s = state.subscribers;
      var subs = s ? '<p class="small adm-note">' + ic("plane") + plural(s.confirmed, "confirmed email subscriber") +
        (s.pending ? " · " + s.pending + " awaiting confirmation" : "") + (s.unsubscribed ? " · " + s.unsubscribed + " unsubscribed" : "") + "</p>" : "";
      if (!list.length) { body().innerHTML = subs + '<p class="state">No posts yet. Tap “New post” to share your first event.</p>'; return; }
      body().innerHTML = subs + '<ul class="adm-list">' + list.map(function (u, i) {
        var cover = coverUrl(u), st = eventStatus(u);
        return '<li class="adm-row sheet"><span class="thumb">' + (cover ? '<img src="' + esc(cover) + '" alt="">' : "") + '</span><div class="adm-main"><p class="adm-t">' + esc(u.title) + '</p><div class="adm-meta">' +
          '<span class="chip ' + (u.published ? "ok" : "") + '">' + (u.published ? "Published" : "Draft") + "</span>" +
          (u.pinned ? '<span class="chip">Pinned</span>' : "") + (st ? '<span class="chip">' + st + "</span>" : '<span class="chip">' + (u.kind === "event" ? "Event" : "Post") + "</span>") +
          "<span>" + esc(displayDate(u)) + "</span>" + (u.emailedAt ? '<span title="' + esc(new Date(u.emailedAt).toLocaleString()) + '">Emailed</span>' : "") +
          '</div></div><div class="adm-btns">' +
          (u.published ? '<a class="btn btn-line btn-sm" href="/v2/updates/' + encodeURIComponent(u.id) + '" target="_blank" rel="noopener">View</a>' +
            '<button class="btn btn-line btn-sm" type="button" data-email="' + i + '"' + (s && s.confirmed ? "" : ' disabled title="No confirmed subscribers yet"') + ">" + ic("plane") + "Email</button>" : "") +
          '<button class="btn btn-line btn-sm" type="button" data-edit="' + i + '">' + ic("pen") + 'Edit</button><button class="btn btn-line btn-sm danger" type="button" data-del="' + i + '" aria-label="Delete ' + esc(u.title) + '">' + ic("close") + "</button></div></li>";
      }).join("") + "</ul>";
      $$("[data-edit]", body()).forEach(function (b) { b.addEventListener("click", function () { updateEditor(list[+b.getAttribute("data-edit")]); }); });
      $$("[data-del]", body()).forEach(function (b) {
        b.addEventListener("click", function () {
          var u = list[+b.getAttribute("data-del")];
          if (!confirmDelete("“" + u.title + "” and its photos and videos")) return;
          b.disabled = true;
          api("/api/admin/updates?id=" + encodeURIComponent(u.id), { method: "DELETE" }).then(updatesTab, function (x) { b.disabled = false; toast(x.message); });
        });
      });
      $$("[data-email]", body()).forEach(function (b) {
        b.addEventListener("click", function () {
          var u = list[+b.getAttribute("data-email")], count = (state.subscribers || {}).confirmed || 0, again = !!u.emailedAt;
          var q = again ? "“" + u.title + "” was already emailed on " + new Date(u.emailedAt).toLocaleString() + ". Send it again to " + plural(count, "subscriber") + "?"
            : "Email “" + u.title + "” to " + plural(count, "confirmed subscriber") + "?";
          if (!window.confirm(q)) return;
          b.disabled = true; b.innerHTML = spinner + "Sending…";
          api("/api/admin/subscribers?updateId=" + encodeURIComponent(u.id) + (again ? "&again=1" : ""), { method: "POST" }).then(function (r) {
            window.alert("Sent to " + plural(r.sent, "subscriber") + (r.failed ? "; " + r.failed + " failed (see the logs)" : "") + ".");
            updatesTab();
          }, function (x) { window.alert(x.message); updatesTab(); });
        });
      });
    }, fail);
  }

  function updateEditor(initial) {
    state.editing = "update";
    var f = initial ? JSON.parse(JSON.stringify(initial)) : { kind: "event", title: "", body: "", location: null, startsOn: null, endsOn: null, linkUrl: null, images: [], videos: [], published: false, pinned: false };
    f.videos = f.videos || []; f.images = f.images || [];
    var uploading = 0, videoUpload = null, photoErr = "", videoErr = "";
    root.innerHTML = '<form class="adm-form" id="uf" novalidate>' + editorHead(initial ? "Edit post" : "New post") +
      seg("kind", [{ value: "event", label: "Event" }, { value: "post", label: "Post" }], f.kind, "Type") +
      field("Title", '<input name="title" required maxlength="160">') +
      field("Description", '<textarea name="body" rows="6" maxlength="10000"></textarea>', "Line breaks are kept. Plain text only.") +
      '<div class="f2" data-dates>' + field("Start date", '<input name="startsOn" type="date">', "Shows as Upcoming, Happening now or Past automatically.") +
      field("End date", '<input name="endsOn" type="date">', "Leave empty for a one-day event.") + "</div>" +
      '<div class="f2">' + field("Location", '<input name="location" maxlength="160">', "Optional, e.g. Landmark Centre, Lagos") +
      field("Link", '<input name="linkUrl" type="url" maxlength="500" placeholder="https://">', "Optional: event page, slides, LinkedIn post…") + "</div>" +
      '<div class="af"><span class="af-l">Photos</span><span class="af-h">The first photo is the cover. Up to 12. Add a short description of each for screen readers.</span><div class="tiles" id="photos"></div><input type="file" accept="image/*" multiple hidden id="photo-in"></div>' +
      '<div class="af"><span class="af-l">Videos</span><span class="af-h" id="video-hint"></span><div class="tiles" id="videos"></div><input type="file" accept="video/mp4,video/webm,video/quicktime,.mov" hidden id="video-in"></div>' +
      toggle("published", f.published, "Published", "Off keeps it as a private draft only you can see here.") +
      toggle("pinned", f.pinned, "Pin to top", "Shows first on the home page and Updates page.") +
      '<div id="save-err"></div><button class="btn btn-dark" type="submit" id="save"></button></form>';
    var form = $("#uf");
    ["title", "body", "location", "startsOn", "endsOn", "linkUrl"].forEach(function (n) {
      form.elements[n].value = f[n] || "";
      form.elements[n].addEventListener("input", function () { f[n] = n === "title" || n === "body" ? form.elements[n].value : form.elements[n].value || null; if (n === "startsOn") form.elements.endsOn.min = f.startsOn || ""; });
    });
    form.elements.endsOn.min = f.startsOn || "";
    var paintKind = function () { $("[data-dates]", form).hidden = f.kind !== "event"; };
    var paintSave = function () { var b = $("#save"); b.textContent = f.published ? "Save and publish" : "Save draft"; b.disabled = uploading > 0 || videoUpload !== null; };
    wireCommon(form, f, function () { paintKind(); paintSave(); });
    paintKind(); paintSave();

    function paintPhotos() {
      var el = $("#photos");
      el.innerHTML = f.images.map(function (img, i) {
        return '<div class="tile"><div class="tile-m"><img src="' + esc(img.url) + '" alt="">' + (i === 0 ? '<span class="tag-c">Cover</span>' : "") +
          moveBtns(i, f.images.length, "img") + '</div><input class="tile-in" data-alt="' + i + '" maxlength="300" placeholder="Describe the photo" aria-label="Description of photo ' + (i + 1) + '" value="' + esc(img.alt) + '"></div>';
      }).join("") + (f.images.length < MAX_PHOTOS ? '<button class="tile add" type="button" id="add-photos"' + (uploading ? " disabled" : "") + ">" + (uploading ? spinner + "Uploading " + uploading + "…" : ic("camera") + "Add photos") + "</button>" : "") + err(photoErr);
      $$("[data-alt]", el).forEach(function (inp) { inp.addEventListener("input", function () { f.images[+inp.getAttribute("data-alt")].alt = inp.value; }); });
      wireMoves(el, "img", f.images, paintPhotos);
      var add = $("#add-photos"); if (add) add.addEventListener("click", function () { $("#photo-in").click(); });
    }
    $("#photo-in").addEventListener("change", function () {
      var files = Array.prototype.slice.call(this.files || []).slice(0, MAX_PHOTOS - f.images.length);
      this.value = "";
      if (!files.length) return;
      photoErr = ""; uploading += files.length; paintPhotos(); paintSave();
      files.reduce(function (p, file) {
        return p.then(function () {
          return prepareImage(file).then(function (b) { return Promise.all([uploadBlob(b.displayBlob), uploadBlob(b.shareBlob)]); })
            .then(function (urls) { f.images.push({ url: urls[0], shareUrl: urls[1], alt: "" }); }, function (x) { photoErr = x.message || "Upload failed."; })
            .then(function () { uploading--; paintPhotos(); paintSave(); });
        });
      }, Promise.resolve());
    });

    function paintVideos() {
      $("#video-hint").textContent = "MP4, WebM or MOV, up to 200 MB each and " + MAX_VIDEOS + " per post. MP4 plays in every browser. Add a short caption for each." +
        (f.videos.length > 1 ? " One video sits beside the photo banner; choose it with “Use in banner”. The rest play below." : "");
      var el = $("#videos"), banner = bannerVideo(f.videos);
      el.innerHTML = f.videos.map(function (v, i) {
        return '<div class="tile"><div class="tile-m"><video src="' + esc(v.url) + '"' + (v.posterUrl ? ' poster="' + esc(v.posterUrl) + '"' : "") + ' controls preload="metadata" playsinline></video>' +
          (v === banner ? '<span class="tag-c">In banner</span>' : "") + moveBtns(i, f.videos.length, "vid") +
          '</div><input class="tile-in" data-cap="' + i + '" maxlength="300" placeholder="What’s in this video?" aria-label="Caption for video ' + (i + 1) + '" value="' + esc(v.caption) + '">' +
          (f.videos.length > 1 && v !== banner ? '<button class="tile-act" type="button" data-banner="' + i + '">Use in banner</button>' : "") + "</div>";
      }).join("") + (f.videos.length < MAX_VIDEOS ? '<button class="tile add" type="button" id="add-video"' + (videoUpload ? " disabled" : "") + ">" +
        (videoUpload ? spinner + '<span class="trunc">Uploading ' + esc(videoUpload.name) + '</span><span class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(videoUpload.progress * 100) + '"><span style="width:' + videoUpload.progress * 100 + '%"></span></span><span class="af-h">' + Math.round(videoUpload.progress * 100) + "%</span>"
          : ic("play") + "Add a video") + "</button>" : "") + err(videoErr);
      $$("[data-cap]", el).forEach(function (inp) { inp.addEventListener("input", function () { f.videos[+inp.getAttribute("data-cap")].caption = inp.value; }); });
      $$("[data-banner]", el).forEach(function (b) { b.addEventListener("click", function () { var k = +b.getAttribute("data-banner"); f.videos.forEach(function (v, j) { v.featured = j === k; }); paintVideos(); }); });
      wireMoves(el, "vid", f.videos, paintVideos);
      var add = $("#add-video"); if (add) add.addEventListener("click", function () { $("#video-in").click(); });
    }
    $("#video-in").addEventListener("change", function () {
      var file = this.files && this.files[0]; this.value = "";
      if (!file) return;
      videoErr = "";
      var type = videoType(file);
      if (VIDEO_TYPES.indexOf(type) < 0) { videoErr = "Upload an MP4, WebM or MOV video."; return paintVideos(); }
      if (file.size > MAX_VIDEO_BYTES) { videoErr = "That video is over 200 MB. Trim or compress it and try again."; return paintVideos(); }
      videoUpload = { name: file.name, progress: 0 }; paintVideos(); paintSave();
      grabPoster(file).then(function (posterBlob) {
        return Promise.all([
          uploadVideo(file, type, function (p) { videoUpload.progress = p; var bar = $("#add-video .prog span"); if (bar) bar.style.width = p * 100 + "%"; var pc = $("#add-video .af-h"); if (pc) pc.textContent = Math.round(p * 100) + "%"; }),
          posterBlob ? uploadBlob(posterBlob).catch(function () { return undefined; }) : undefined,
        ]);
      }).then(function (r) { f.videos.push({ url: r[0], posterUrl: r[1], caption: "" }); }, function (x) { videoErr = x.message || "Video upload failed."; })
        .then(function () { videoUpload = null; paintVideos(); paintSave(); });
    });
    paintPhotos(); paintVideos();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!f.title.trim()) { $("#save-err").innerHTML = err("Add a title."); form.elements.title.focus(); return; }
      var payload = f.kind === "post" ? Object.assign({}, f, { startsOn: null, endsOn: null }) : f;
      save($("#save"), $("#save-err"), initial ? "/api/admin/updates?id=" + encodeURIComponent(initial.id) : "/api/admin/updates", initial ? "PUT" : "POST", payload);
    });
  }

  /* Shared editor wiring: Back, segmented controls, toggles. `changed` repaints after a seg/toggle change. */
  function wireCommon(form, f, changed) {
    $("[data-back]", form).addEventListener("click", function () { dashboard(); });
    $$("[data-seg]", form).forEach(function (b) {
      b.addEventListener("click", function () {
        var name = b.getAttribute("data-seg");
        f[name] = b.getAttribute("data-value");
        $$('[data-seg="' + name + '"]', form).forEach(function (o) { var on = o === b; o.classList.toggle("on", on); o.setAttribute("aria-pressed", String(on)); });
        changed();
      });
    });
    $$("[data-toggle]", form).forEach(function (b) {
      b.addEventListener("click", function () {
        var name = b.getAttribute("data-toggle");
        f[name] = !f[name]; b.setAttribute("aria-checked", String(f[name])); changed();
      });
    });
  }
  function moveBtns(i, n, kind) {
    return '<span class="tile-b"><button type="button" data-move="' + kind + ':' + i + ':-1" aria-label="Move earlier"' + (i === 0 ? " disabled" : "") + ">" + il("arrow-right", "i back") + '</button>' +
      '<button type="button" data-move="' + kind + ':' + i + ':1" aria-label="Move later"' + (i === n - 1 ? " disabled" : "") + ">" + il("arrow-right") + '</button>' +
      '<button type="button" data-remove="' + kind + ':' + i + '" aria-label="Remove">' + ic("close") + "</button></span>";
  }
  function wireMoves(el, kind, list, repaint) {
    $$('[data-move^="' + kind + ':"]', el).forEach(function (b) {
      b.addEventListener("click", function () {
        var p = b.getAttribute("data-move").split(":"), i = +p[1], j = i + +p[2];
        if (j < 0 || j >= list.length) return;
        var t = list[i]; list[i] = list[j]; list[j] = t; repaint();
      });
    });
    $$('[data-remove^="' + kind + ':"]', el).forEach(function (b) {
      b.addEventListener("click", function () { list.splice(+b.getAttribute("data-remove").split(":")[1], 1); repaint(); });
    });
  }
  function save(btn, errEl, path, method, payload) {
    var label = btn.textContent;
    btn.disabled = true; btn.innerHTML = spinner + "Saving…"; errEl.innerHTML = "";
    api(path, { method: method, body: JSON.stringify(payload) }).then(function () { toast("Saved"); dashboard(); }, function (x) {
      errEl.innerHTML = err(x.message); btn.disabled = false; btn.textContent = label;
    });
  }

  /* ── Articles ────────────────────────────────────────────────────────────────────────────────────────── */
  var MAX_FILE_BYTES = 4 * 1024 * 1024; // sent as-is, so it has to fit Vercel's 4.5 MB request limit
  var DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  function articlesTab() {
    api("/api/admin/articles").then(function (r) {
      var list = state.data.articles = r.articles || [];
      if (state.tab !== "articles" || state.editing) return;
      if (!list.length) { body().innerHTML = '<p class="state">No articles yet. Tap “New article” to upload your first one.</p>'; return; }
      body().innerHTML = '<ul class="adm-list">' + list.map(function (a, i) {
        var kind = fileKind(a);
        return '<li class="adm-row sheet"><div class="adm-main"><p class="adm-t">' + esc(a.title) + '</p><div class="adm-meta"><span class="chip ' + (a.published ? "ok" : "") + '">' + (a.published ? "Published" : "Draft") + "</span>" +
          "<span>" + (a.topic ? "Planned topic" : "New topic") + "</span>" + (kind ? "<span>" + kind + "</span>" : "") + (a.scholarUrl ? "<span>Scholar</span>" : "") + (a.zenodoUrl ? "<span>Zenodo</span>" : "") +
          "<span>" + esc(trackLabel(a.track)) + "</span><span>" + esc(articleDate(a)) + '</span></div></div><div class="adm-btns">' +
          (a.published ? '<a class="btn btn-line btn-sm" href="/v2/articles?track=' + encodeURIComponent(a.track) + '" target="_blank" rel="noopener">View</a>' : "") +
          '<button class="btn btn-line btn-sm" type="button" data-edit="' + i + '">' + ic("pen") + 'Edit</button><button class="btn btn-line btn-sm danger" type="button" data-del="' + i + '" aria-label="Delete ' + esc(a.title) + '">' + ic("close") + "</button></div></li>";
      }).join("") + "</ul>";
      $$("[data-edit]", body()).forEach(function (b) { b.addEventListener("click", function () { articleEditor(list[+b.getAttribute("data-edit")]); }); });
      $$("[data-del]", body()).forEach(function (b) {
        b.addEventListener("click", function () {
          var a = list[+b.getAttribute("data-del")];
          if (!confirmDelete("“" + a.title + "” and its file")) return;
          b.disabled = true;
          api("/api/admin/articles?id=" + encodeURIComponent(a.id), { method: "DELETE" }).then(articlesTab, function (x) { b.disabled = false; toast(x.message); });
        });
      });
    }, fail);
  }

  function articleEditor(initial) {
    state.editing = "article";
    // Planned topics already covered by a published article (useTakenTopics).
    var taken = {};
    (state.data.articles || []).forEach(function (a) { if (a.published && a.topic) taken[a.topic] = true; });
    var f = initial ? JSON.parse(JSON.stringify(initial)) : { title: "", summary: "", track: tracks[0] ? tracks[0].id : "full-stack", topic: null, fileUrl: null, fileName: null, scholarUrl: null, zenodoUrl: null, publishedOn: null, published: false };
    var topicTouched = !!initial, uploading = false, fileErr = "";
    var topicOptions = '<option value="">New topic (not in the planned list)</option>' + tracks.map(function (t) {
      return '<optgroup label="' + esc(t.label) + '">' + (planned[t.id] || []).map(function (topic) {
        var used = taken[topic] && topic !== (initial && initial.topic);
        return '<option value="' + esc(topic) + '"' + (used ? " disabled" : "") + ">" + esc(topic) + (used ? " (already published)" : "") + "</option>";
      }).join("") + "</optgroup>";
    }).join("");
    root.innerHTML = '<form class="adm-form" id="af" novalidate>' + editorHead(initial ? "Edit article" : "New article") +
      field("Planned topic", '<select name="topic">' + topicOptions + "</select>", "Pick the topic from /articles this article covers: it switches from Planned to Published instead of being listed twice. Choose “New topic” if it isn’t listed.") +
      field("Title", '<input name="title" required maxlength="200">', "Can be longer than the topic, e.g. with a subtitle.") +
      field("Summary", '<textarea name="summary" rows="4" maxlength="600"></textarea>', "Two or three sentences shown on the article card.") +
      '<div class="f2">' + field("Track", '<select name="track">' + tracks.map(function (t) { return '<option value="' + esc(t.id) + '">' + esc(t.label) + "</option>"; }).join("") + "</select>") +
      field("Publication date", '<input name="publishedOn" type="date">', "Leave empty to use today’s date.") + "</div>" +
      '<div class="af"><span class="af-l">File</span><span class="af-h">PDF or Word (.docx), up to 4 MB. PDFs open in the browser; Word files download.</span><div id="file"></div><input type="file" hidden id="file-in" accept=".pdf,.docx,application/pdf,' + DOCX + '"></div>' +
      field("Google Scholar link", '<input name="scholarUrl" type="url" maxlength="500" placeholder="https://scholar.google.com/…">', "Optional: the article’s page on Google Scholar.") +
      field("Zenodo link", '<input name="zenodoUrl" type="url" maxlength="500" placeholder="https://zenodo.org/records/…">', "Optional: the zenodo.org record or its DOI link. An article needs a file, a Google Scholar link or a Zenodo link.") +
      toggle("published", f.published, "Published", "Off keeps it as a private draft only you can see here.") +
      '<div id="save-err"></div><button class="btn btn-dark" type="submit" id="save"></button></form>';
    var form = $("#af"), el = form.elements;
    var fill = function () { el.topic.value = f.topic || ""; el.title.value = f.title; el.summary.value = f.summary || ""; el.track.value = f.track; el.publishedOn.value = f.publishedOn || ""; el.scholarUrl.value = f.scholarUrl || ""; el.zenodoUrl.value = f.zenodoUrl || ""; };
    fill();
    var paintSave = function () { var b = $("#save"); b.textContent = f.published ? "Save and publish" : "Save draft"; b.disabled = uploading; };
    wireCommon(form, f, paintSave); paintSave();
    el.topic.addEventListener("change", function () {
      var topic = el.topic.value || null;
      var track = tracks.filter(function (t) { return topic && (planned[t.id] || []).indexOf(topic) >= 0; })[0];
      topicTouched = true; f.topic = topic; if (track) f.track = track.id; if (!f.title) f.title = topic || "";
      fill();
    });
    el.title.addEventListener("input", function () {
      f.title = el.title.value;
      if (topicTouched) return;
      var match = matchPlannedTopic(f.title);
      f.topic = match && !taken[match.topic] ? match.topic : null;
      if (match && !taken[match.topic]) f.track = match.track;
      el.topic.value = f.topic || ""; el.track.value = f.track;
    });
    el.summary.addEventListener("input", function () { f.summary = el.summary.value; });
    el.track.addEventListener("change", function () { f.track = el.track.value; });
    ["publishedOn", "scholarUrl", "zenodoUrl"].forEach(function (n) { el[n].addEventListener("input", function () { f[n] = el[n].value || null; }); });

    function paintFile() {
      var box = $("#file");
      box.innerHTML = (f.fileUrl
        ? '<div class="file-row sheet"><span class="chip ok">' + esc(fileKind(f)) + '</span><a class="trunc" href="' + esc(f.fileUrl) + '" target="_blank" rel="noopener">' + esc(f.fileName || "Uploaded file") + '</a><button class="btn btn-line btn-sm" type="button" data-pick' + (uploading ? " disabled" : "") + '>Replace</button><button class="btn btn-line btn-sm danger" type="button" data-clear aria-label="Remove file">' + ic("close") + "</button></div>"
        : '<button class="tile add wide" type="button" data-pick' + (uploading ? " disabled" : "") + ">" + (uploading ? spinner + "Uploading…" : ic("file-download") + "Upload PDF or Word file") + "</button>") + err(fileErr);
      $$("[data-pick]", box).forEach(function (b) { b.addEventListener("click", function () { $("#file-in").click(); }); });
      var c = $("[data-clear]", box); if (c) c.addEventListener("click", function () { f.fileUrl = null; f.fileName = null; paintFile(); });
    }
    $("#file-in").addEventListener("change", function () {
      var file = this.files && this.files[0]; this.value = "";
      if (!file) return;
      fileErr = "";
      var type = file.type || (file.name.toLowerCase().slice(-5) === ".docx" ? DOCX : "");
      if (type !== "application/pdf" && type !== DOCX) { fileErr = "Upload a PDF or a Word (.docx) file."; return paintFile(); }
      if (file.size > MAX_FILE_BYTES) { fileErr = "That file is over 4 MB. Export a smaller PDF (e.g. without high-resolution images) and try again."; return paintFile(); }
      uploading = true; paintFile(); paintSave();
      uploadBlob(new Blob([file], { type: type })).then(function (url) { f.fileUrl = url; f.fileName = file.name; }, function (x) { fileErr = x.message || "Upload failed."; })
        .then(function () { uploading = false; paintFile(); paintSave(); });
    });
    paintFile();
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!f.title.trim()) { $("#save-err").innerHTML = err("Add a title."); el.title.focus(); return; }
      save($("#save"), $("#save-err"), initial ? "/api/admin/articles?id=" + encodeURIComponent(initial.id) : "/api/admin/articles", initial ? "PUT" : "POST", f);
    });
  }

  /* ── Moments ─────────────────────────────────────────────────────────────────────────────────────────── */
  var SIZES = [{ value: "square", label: "Square <span class=\"ct\">1 × 1</span>", name: "Square" }, { value: "tall", label: "Tall <span class=\"ct\">1 × 2</span>", name: "Tall" },
    { value: "wide", label: "Wide <span class=\"ct\">2 × 1</span>", name: "Wide" }, { value: "large", label: "Large <span class=\"ct\">2 × 2</span>", name: "Large" }];
  var FOCUS = ["center", "top", "center 20%", "center 30%", "center 40%", "center 60%", "bottom"];
  function momentsTab() {
    api("/api/admin/moments").then(function (r) {
      var list = state.data.moments = r.moments || [];
      if (state.tab !== "moments" || state.editing) return;
      var head = '<p class="small adm-note">' + plural(list.length, "moment") + ", shown on the Moments page in this order. New ones go to the top.</p>";
      if (!list.length) { body().innerHTML = head + '<p class="state">No moments yet. Tap “New moment” to add a photo or video.</p>'; return; }
      body().innerHTML = head + '<ul class="adm-list">' + list.map(function (m, i) {
        var thumb = m.type === "image" ? m.src : m.poster;
        var size = SIZES.filter(function (s) { return s.value === m.size; })[0];
        return '<li class="adm-row sheet"><span class="thumb">' + (thumb ? '<img src="' + esc(thumb) + '" alt=""' + (m.focus ? ' style="object-position:' + esc(m.focus) + '"' : "") + ">" : "") + (m.type === "video" ? '<span class="thumb-v">' + ic("play") + "</span>" : "") +
          '</span><div class="adm-main"><p class="adm-t">' + esc(m.title) + '</p><div class="adm-meta">' + (m.published ? "" : '<span class="chip">Hidden</span>') +
          "<span>" + esc(m.category) + "</span><span>· " + (size ? size.name : "Square") + "</span>" + (m.date ? "<span>· " + esc(m.date) + "</span>" : "") +
          '</div></div><div class="adm-btns"><button class="btn btn-line btn-sm icon" type="button" data-up="' + i + '"' + (i === 0 ? " disabled" : "") + ' aria-label="Move ' + esc(m.title) + ' up">' + il("arrow-right", "i up") + '</button>' +
          '<button class="btn btn-line btn-sm icon" type="button" data-down="' + i + '"' + (i === list.length - 1 ? " disabled" : "") + ' aria-label="Move ' + esc(m.title) + ' down">' + il("arrow-right", "i down") + "</button>" +
          '<button class="btn btn-line btn-sm" type="button" data-edit="' + i + '">' + ic("pen") + 'Edit</button><button class="btn btn-line btn-sm danger" type="button" data-del="' + i + '" aria-label="Delete ' + esc(m.title) + '">' + ic("close") + "</button></div></li>";
      }).join("") + "</ul>";
      var reorder = function (i, by) {
        var ids = list.map(function (m) { return m.id; }), j = i + by;
        if (j < 0 || j >= ids.length) return;
        var t = ids[i]; ids[i] = ids[j]; ids[j] = t;
        $$("[data-up],[data-down]", body()).forEach(function (b) { b.disabled = true; });
        api("/api/admin/moments", { method: "PATCH", body: JSON.stringify({ ids: ids }) }).then(momentsTab, function (x) { window.alert(x.message); momentsTab(); });
      };
      $$("[data-up]", body()).forEach(function (b) { b.addEventListener("click", function () { reorder(+b.getAttribute("data-up"), -1); }); });
      $$("[data-down]", body()).forEach(function (b) { b.addEventListener("click", function () { reorder(+b.getAttribute("data-down"), 1); }); });
      $$("[data-edit]", body()).forEach(function (b) { b.addEventListener("click", function () { momentEditor(list[+b.getAttribute("data-edit")]); }); });
      $$("[data-del]", body()).forEach(function (b) {
        b.addEventListener("click", function () {
          var m = list[+b.getAttribute("data-del")];
          if (!confirmDelete("“" + m.title + "”")) return;
          api("/api/admin/moments?id=" + encodeURIComponent(m.id), { method: "DELETE" }).then(momentsTab, function (x) { window.alert(x.message); });
        });
      });
    }, fail);
  }

  function momentEditor(initial) {
    state.editing = "moment";
    var categories = [];
    (state.data.moments || []).forEach(function (m) { if (categories.indexOf(m.category) < 0) categories.push(m.category); });
    var f = initial ? JSON.parse(JSON.stringify(initial)) : { type: "image", src: "", poster: undefined, title: "", caption: "", category: "", date: undefined, location: undefined, size: "square", focus: undefined, published: true };
    var uploading = null, upErr = "";
    root.innerHTML = '<form class="adm-form" id="mf" novalidate>' + editorHead(initial ? "Edit moment" : "New moment") +
      '<div class="af"><span class="af-l">Photo or video</span><span class="af-h">Videos play muted on the card and with sound when opened, so short clips (5–30 seconds, MP4) work best.</span><div class="m-pick" id="m-pick"></div><input type="file" hidden id="m-in" accept="image/*,video/mp4,video/webm,video/quicktime,.mov"></div>' +
      field("Title", '<input name="title" required maxlength="120">', "Short headline on the card.") +
      field("Caption", '<input name="caption" maxlength="300">', "One line, shown on hover and when the photo is opened.") +
      '<div class="f3">' + field("Category", '<input name="category" required maxlength="40" list="m-cats"><datalist id="m-cats">' + categories.map(function (c) { return '<option value="' + esc(c) + '">'; }).join("") + "</datalist>", "The filter chip, e.g. Events.") +
      field("Date", '<input name="date" maxlength="40">', "Optional, e.g. Nov 2026.") + field("Location", '<input name="location" maxlength="120">', "Optional, e.g. Lagos, Nigeria.") + "</div>" +
      '<div class="af"><span class="af-l">Card shape</span>' + seg("size", SIZES, f.size, "Card shape") + '<span class="af-h">Mix them: one Large, a few Tall or Wide, the rest Square looks best.</span></div>' +
      field("Crop position", '<input name="focus" maxlength="40" list="m-focus" placeholder="center"><datalist id="m-focus">' + FOCUS.map(function (x) { return '<option value="' + x + '">'; }).join("") + "</datalist>", "Moves the crop when a card cuts off someone’s head. The preview above updates as you type.") +
      toggle("published", f.published, "Show on the Moments page", "Off hides it from visitors without deleting it.") +
      '<div id="save-err"></div><button class="btn btn-dark" type="submit" id="save">' + (initial ? "Save changes" : "Add to Moments") + "</button></form>";
    var form = $("#mf"), el = form.elements;
    ["title", "caption", "category", "date", "location", "focus"].forEach(function (n) {
      el[n].value = f[n] || "";
      el[n].addEventListener("input", function () { f[n] = n === "title" || n === "caption" || n === "category" ? el[n].value : el[n].value || undefined; if (n === "focus") paintPick(); });
    });
    var paintSave = function () { $("#save").disabled = !!uploading || !f.src; };
    wireCommon(form, f, function () { paintPick(); paintSave(); });
    function paintPick() {
      var box = $("#m-pick"), pos = f.focus ? ' style="object-position:' + esc(f.focus) + '"' : "";
      box.innerHTML = (f.src ? '<div class="m-prev ' + esc(f.size) + '">' + (f.type === "video" ? '<video src="' + esc(f.src) + '"' + (f.poster ? ' poster="' + esc(f.poster) + '"' : "") + " muted loop autoplay playsinline" + pos + "></video>" : '<img src="' + esc(f.src) + '" alt=""' + pos + ">") + "</div>" : "") +
        '<button class="tile add' + (f.src ? " small" : " wide") + '" type="button" data-pick' + (uploading ? " disabled" : "") + ">" +
        (uploading ? spinner + '<span class="trunc">' + esc(uploading.label) + "</span>" + (uploading.progress !== undefined ? '<span class="af-h" data-pc>' + Math.round(uploading.progress * 100) + "%</span>" : "")
          : ic("camera") + (f.src ? "Replace file" : "Choose a photo or video")) + "</button>" + err(upErr);
      $("[data-pick]", box).addEventListener("click", function () { $("#m-in").click(); });
    }
    $("#m-in").addEventListener("change", function () {
      var file = this.files && this.files[0]; this.value = "";
      if (!file) return;
      upErr = "";
      var vt = videoType(file), job;
      if (file.type.indexOf("image/") === 0) {
        uploading = { label: "Uploading photo…" };
        job = prepareImage(file).then(function (b) { return uploadBlob(b.displayBlob); }).then(function (src) { f.type = "image"; f.src = src; f.poster = undefined; });
      } else if (VIDEO_TYPES.indexOf(vt) >= 0) {
        if (file.size > MAX_VIDEO_BYTES) { upErr = "That video is over 200 MB. Trim or compress it and try again."; return paintPick(); }
        uploading = { label: "Uploading " + file.name, progress: 0 };
        job = grabPoster(file).then(function (pb) {
          return Promise.all([
            uploadVideo(file, vt, function (p) { uploading.progress = p; var pc = $("[data-pc]"); if (pc) pc.textContent = Math.round(p * 100) + "%"; }),
            pb ? uploadBlob(pb).catch(function () { return undefined; }) : undefined,
          ]);
        }).then(function (r) { f.type = "video"; f.src = r[0]; f.poster = r[1]; });
      } else { upErr = "Choose a photo, or an MP4, WebM or MOV video."; return paintPick(); }
      paintPick(); paintSave();
      job.catch(function (x) { upErr = x.message || "Upload failed."; }).then(function () { uploading = null; paintPick(); paintSave(); });
    });
    paintPick(); paintSave();
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!f.title.trim() || !f.category.trim()) { $("#save-err").innerHTML = err("Add a title and a category."); return; }
      save($("#save"), $("#save-err"), initial ? "/api/admin/moments?id=" + encodeURIComponent(initial.id) : "/api/admin/moments", initial ? "PUT" : "POST", f);
    });
  }

  /* ── Recommendations and comments ────────────────────────────────────────────────────────────────────── */
  function moderationTab() {
    var kind = state.tab, noun = kind === "recommendations" ? "recommendation" : "comment";
    api("/api/admin/moderation?kind=" + kind).then(function (r) {
      var all = state.data[kind] = r.items || [];
      paintBadges();
      if (state.tab !== kind || state.editing) return;
      var filter = state.modFilter[kind];
      var count = function (s) { return all.filter(function (i) { return i.status === s; }).length; };
      var items = all.filter(function (i) { return filter === "all" || i.status === filter; });
      body().innerHTML = '<div class="filter-bar">' + seg("mod", ["pending", "approved", "rejected", "all"].map(function (s) {
        return { value: s, label: s.charAt(0).toUpperCase() + s.slice(1) + (s !== "all" ? '<span class="ct">' + count(s) + "</span>" : "") };
      }), filter, "Filter by status") + "</div>" +
        (items.length ? '<ul class="adm-list">' + items.map(function (it) {
          var rec = kind === "recommendations" ? it : null;
          return '<li class="mod sheet"><div class="adm-meta"><span class="chip st-' + it.status + '">' + it.status + "</span>" + (rec && rec.featured ? '<span class="chip ok">Featured</span>' : "") +
            "<span>" + esc(shortDate(it.createdAt)) + "</span>" + (kind === "comments" ? '<a class="trunc" href="/v2/updates/' + encodeURIComponent(it.updateId) + '" target="_blank" rel="noopener">on “' + esc(it.updateTitle) + "”</a>" : "") + "</div>" +
            '<p class="adm-t">' + esc(it.name) + (rec ? ' <span class="adm-sub">· ' + esc(relationshipLabels[rec.relationship] || "") + (rec.role || rec.company ? " · " + esc(recommenderLine(rec)) : "") + "</span>" : "") + "</p>" +
            '<p class="mod-body">' + esc(it.body) + "</p>" +
            (it.email || (rec && rec.linkedinUrl) ? '<div class="adm-meta">' + (it.email ? '<a href="mailto:' + esc(it.email) + '">' + esc(it.email) + "</a>" : "") + (rec && rec.linkedinUrl ? '<a href="' + esc(rec.linkedinUrl) + '" target="_blank" rel="noopener noreferrer">' + il("linkedin") + "LinkedIn</a>" : "") + "</div>" : "") +
            '<div class="adm-btns left">' +
            (it.status !== "approved" ? '<button class="btn btn-dark btn-sm" type="button" data-act="approve" data-id="' + esc(it.id) + '">' + ic("check-circle") + "Approve</button>" : "") +
            (it.status === "pending" ? '<button class="btn btn-line btn-sm" type="button" data-act="reject" data-id="' + esc(it.id) + '">' + ic("close") + "Reject</button>" : "") +
            (it.status === "approved" ? '<button class="btn btn-line btn-sm" type="button" data-act="unpublish" data-id="' + esc(it.id) + '">Unpublish</button>' : "") +
            (rec && rec.status === "approved" ? '<button class="btn btn-line btn-sm" type="button" data-act="feature" data-id="' + esc(it.id) + '" aria-pressed="' + !!rec.featured + '">' + ic("star") + (rec.featured ? "Unfeature" : "Feature") + "</button>" : "") +
            '<button class="btn btn-line btn-sm danger push" type="button" data-act="delete" data-id="' + esc(it.id) + '" aria-label="Delete ' + noun + '">' + ic("close") + "Delete</button></div></li>";
        }).join("") + "</ul>" : '<p class="state">Nothing ' + (filter === "all" ? "here" : filter) + " yet.</p>");
      $$("[data-seg]", body()).forEach(function (b) { b.addEventListener("click", function () { state.modFilter[kind] = b.getAttribute("data-value"); moderationTab(); }); });
      $$("[data-act]", body()).forEach(function (b) {
        b.addEventListener("click", function () {
          var id = b.getAttribute("data-id"), act = b.getAttribute("data-act"), it = all.filter(function (x) { return x.id === id; })[0];
          var path = "/api/admin/moderation?kind=" + kind + "&id=" + encodeURIComponent(id), req;
          if (act === "delete") {
            if (!confirmDelete("this " + noun + " from " + it.name)) return;
            req = api(path, { method: "DELETE" });
          } else {
            var patch = act === "approve" ? { status: "approved" } : act === "reject" ? { status: "rejected" } : act === "unpublish" ? { status: "pending" } : { featured: !it.featured };
            req = api(path, { method: "PATCH", body: JSON.stringify(patch) });
          }
          $$("[data-act]", body()).forEach(function (x) { x.disabled = true; });
          req.then(moderationTab, function (x) { toast(x.message); moderationTab(); });
        });
      });
    }, fail);
  }

  addEventListener("hashchange", function () {
    var t = tabFromHash();
    if (t !== state.tab && $(".adm-tabs")) { state.tab = t; dashboard(); }
  });
  start();
})();
