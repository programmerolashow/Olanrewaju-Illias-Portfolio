/**
 * Design switch: the classic design (V1, the React app) and the new design (V2: static pages, public/v2.html at /v2
 * and public/v2/*.html at /v2/services, /v2/moments, /v2/updates, /v2/recommendations).
 * A port of Qorelly's switch (apps/mp/src/lib/uiVersion.ts, lib/designRollout.ts and the DesignSwitchBanner
 * strip). Loaded as a plain blocking script in the <head> of BOTH pages, so the home page redirects before its
 * first paint and both designs share one schedule, one saved choice and one banner. The React side reads it
 * through src/lib/uiVersion.ts.
 *
 * Which design a person sees on a paired page, first match wins:
 *   1. `?ui=v2` / `?ui=v1` on any URL. Saved as their choice, and it wins even after classic retires (support).
 *   2. Classic retired (CLASSIC_RETIRES has passed) → V2.
 *   3. Their own saved choice: the banner, the footer link or the search menu. Sticks per device.
 *   4. Everyone else → DEFAULT_VERSION. A default, never saved, so it cannot pin anyone.
 *
 * Paired pages exist in both designs (PAIRED below): / ↔ /v2, /services ↔ /v2/services, /moments ↔ /v2/moments,
 * /updates ↔ /v2/updates, /recommendations ↔ /v2/recommendations; each redirects to its twin before first paint. Other classic pages (/projects/…,
 * /articles, …) have no V2 version yet and stay classic for everyone. V2 pages never link into the classic design;
 * only the explicit "Back to classic design" switch leads there.
 *
 * Rollout, in phases (dates are local midnight on the visitor's device):
 *   before     until TRIAL_STARTS: no banner, nobody moved.
 *   trial      TRIAL_STARTS → +COUNTDOWN_AFTER_DAYS: classic shows "Try the new design", V2 shows
 *              "Switch back to classic". Nobody is moved. (Skipped: COUNTDOWN_AFTER_DAYS is 0.)
 *   countdown  → CLASSIC_RETIRES: classic's banner counts down to the retirement date.
 *   retired    from CLASSIC_RETIRES: everyone is moved to V2; V2's banner keeps only the feedback link.
 * With CLASSIC_RETIRES null the trial simply runs on. Preview a phase with `?rollout=trial|countdown|retired`.
 *
 * Edit the constants below; they are the whole schedule.
 */
(function () {
  var TRIAL_STARTS = "2026-11-21";
  /** 0: no trial, the countdown starts on TRIAL_STARTS. */
  var COUNTDOWN_AFTER_DAYS = 0;
  /** "YYYY-MM-DD" to schedule the retirement of the classic home page (one year of countdown); null keeps both. */
  var CLASSIC_RETIRES = "2027-11-21";
  /** What someone who hasn't chosen sees (as Qorelly: the new design). */
  var DEFAULT_VERSION = "v2";
  /** WhatsApp number for design feedback (international, no +), as Qorelly; email is offered beside it. */
  var FEEDBACK_WHATSAPP = "2349065219168";
  var FEEDBACK_EMAIL = "olanrewajuillias@gmail.com";

  var STORAGE_KEY = "oi_ui_version";
  var SNOOZE_KEY = "oi_design_banner_snooze";
  var CHANGE_EVENT = "oi:ui-version";
  var V2_PATH = "/v2";
  /** Classic paths that also exist in V2, at V2_PATH + path ("/" is the home page, at V2_PATH itself). */
  var PAIRED = ["/", "/services", "/moments", "/updates", "/recommendations", "/projects", "/articles", "/approach", "/roadmap", "/admin"];
  /** Classic paths under which every page also exists in V2 (one per project, one per update). */
  var PAIRED_PREFIXES = ["/projects/", "/updates/"];
  var DAY = 864e5;

  var at = function (iso) {
    return new Date(iso + "T00:00:00").getTime();
  };
  var params = new URLSearchParams(window.location.search);

  function phase(now) {
    now = now || Date.now();
    var forced = params.get("rollout");
    if (forced === "before" || forced === "trial" || forced === "countdown" || forced === "retired") return forced;
    if (now < at(TRIAL_STARTS)) return "before";
    if (CLASSIC_RETIRES && now >= at(CLASSIC_RETIRES)) return "retired";
    if (!CLASSIC_RETIRES || now < at(TRIAL_STARTS) + COUNTDOWN_AFTER_DAYS * DAY) return "trial";
    return "countdown";
  }

  function daysUntilRetirement(now) {
    if (!CLASSIC_RETIRES) return 0;
    return Math.max(1, Math.ceil((at(CLASSIC_RETIRES) - (now || Date.now())) / DAY));
  }

  function retirementLabel() {
    if (!CLASSIC_RETIRES) return "";
    // Year included: the date is up to a year away.
    return new Date(at(CLASSIC_RETIRES)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function feedbackUrl() {
    var text = "Hi Olanrewaju, some feedback on the new design of your portfolio: ";
    return "https://wa.me/" + FEEDBACK_WHATSAPP + "?text=" + encodeURIComponent(text);
  }

  function feedbackEmailUrl() {
    return "mailto:" + FEEDBACK_EMAIL + "?subject=" + encodeURIComponent("Feedback on the new design");
  }

  function read() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      return value === "v1" || value === "v2" ? value : null;
    } catch (e) {
      // Private mode / blocked storage: fall through to the default.
      return null;
    }
  }

  function write(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      // Not saved; the switch still happens for this visit.
    }
  }

  var clean = function (pathname) {
    var p = pathname.replace(/\.html$/, "").replace(/\/+$/, "");
    return p === "/index" ? "/" : p || "/";
  };
  var isV2Path = function (pathname) {
    var p = clean(pathname);
    return p === V2_PATH || p.indexOf(V2_PATH + "/") === 0;
  };
  var isV2Page = function () {
    return isV2Path(window.location.pathname);
  };

  /** The design this document is showing. */
  function current() {
    return isV2Page() ? "v2" : "v1";
  }

  /** The home page this person should get (rules 1–4 above). */
  function wanted() {
    var param = params.get("ui");
    if (param === "v1" || param === "v2") return param;
    if (phase() === "retired") return "v2";
    return read() || DEFAULT_VERSION;
  }

  /**
   * The same page in `version`, or null when `pathname` isn't a paired page (a classic-only page such as /projects,
   * or a V2 path with no classic twin).
   */
  function pathFor(version, pathname) {
    var p = clean(pathname);
    var classic = isV2Path(p) ? p.slice(V2_PATH.length) || "/" : p;
    var paired = PAIRED.indexOf(classic) >= 0 || PAIRED_PREFIXES.some(function (pre) { return classic.indexOf(pre) === 0 && classic.length > pre.length; });
    if (!paired) return null;
    if (version === "v1") return classic;
    return classic === "/" ? V2_PATH : V2_PATH + classic;
  }

  function targetFor(version) {
    // Query kept so ?rollout= previews (and ?ui=, ?subscription=) survive the hop.
    var path = pathFor(version, window.location.pathname) || (version === "v2" ? V2_PATH : "/");
    return path + window.location.search + window.location.hash;
  }

  /** The person chose a design: saved, and they're taken to this page in that design (or to its home page). */
  function set(version) {
    write(version);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    if (version !== current()) window.location.assign(targetFor(version));
  }

  // ── Boot: before the first paint ────────────────────────────────────────────────────────────────────────
  var param = params.get("ui");
  if (param === "v1" || param === "v2") write(param);
  var want = wanted();
  if (want !== current() && pathFor(want, window.location.pathname)) window.location.replace(targetFor(want));

  // ── Banner (Qorelly's PromoBanner "strip" layout on a GradientBackdrop) ─────────────────────────────────
  var PALETTES = {
    dusk: ["#1d2550", "#7c5cff", "#3fa2f7", "#f3a3c2", "#0f1638"],
    amber: ["#3b2508", "#f59e0b", "#fcd34d", "#f472b6", "#1f1303"],
  };
  var SPOTS = [
    "left:-12%;top:-25%;height:110%;width:60%",
    "right:-10%;top:-15%;height:95%;width:55%",
    "left:30%;bottom:-35%;height:85%;width:45%",
    "right:15%;bottom:-30%;height:60%;width:30%",
  ];
  var GRAIN =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
  // Solar Outline: Arrow-Right, Close-Circle.
  var ICON_ARROW =
    '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M13.4697 5.46967C13.7626 5.17678 14.2374 5.17678 14.5303 5.46967L20.5303 11.4697C20.8232 11.7626 20.8232 12.2374 20.5303 12.5303L14.5303 18.5303C14.2374 18.8232 13.7626 18.8232 13.4697 18.5303C13.1768 18.2374 13.1768 17.7626 13.4697 17.4697L18.1893 12.75H4C3.58579 12.75 3.25 12.4142 3.25 12C3.25 11.5858 3.58579 11.25 4 11.25H18.1893L13.4697 6.53033C13.1768 6.23744 13.1768 5.76256 13.4697 5.46967Z"/></svg>';
  var ICON_CLOSE =
    '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M10.0303 8.96965C9.73741 8.67676 9.26253 8.67676 8.96964 8.96965C8.67675 9.26255 8.67675 9.73742 8.96964 10.0303L10.9393 12L8.96966 13.9697C8.67677 14.2625 8.67677 14.7374 8.96966 15.0303C9.26255 15.3232 9.73743 15.3232 10.0303 15.0303L12 13.0607L13.9696 15.0303C14.2625 15.3232 14.7374 15.3232 15.0303 15.0303C15.3232 14.7374 15.3232 14.2625 15.0303 13.9696L13.0606 12L15.0303 10.0303C15.3232 9.73744 15.3232 9.26257 15.0303 8.96968C14.7374 8.67678 14.2625 8.67678 13.9696 8.96968L12 10.9393L10.0303 8.96965Z"/><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C6.06294 1.25 1.25 6.06294 1.25 12C1.25 17.9371 6.06294 22.75 12 22.75C17.9371 22.75 22.75 17.9371 22.75 12C22.75 6.06294 17.9371 1.25 12 1.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12Z"/></svg>';

  var CSS =
    ".oi-strip{position:relative;isolation:isolate;overflow:hidden;border-radius:16px;font-family:inherit;animation:oi-strip-in .5s ease both}" +
    ".oi-strip-bg{position:absolute;inset:0;z-index:-1}" +
    ".oi-strip-blob{position:absolute;border-radius:999px;opacity:.9;filter:blur(10px)}" +
    ".oi-strip-grain{position:absolute;inset:0;opacity:.28;mix-blend-mode:overlay;background-image:" + GRAIN + "}" +
    ".oi-strip-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px 12px;padding:10px 48px;text-align:center}" +
    ".oi-strip-eyebrow{border-radius:999px;background:rgb(255 255 255/.15);border:1px solid rgb(255 255 255/.25);padding:1px 8px;font-size:11px;font-weight:600;letter-spacing:.025em;text-transform:uppercase;color:#fff}" +
    ".oi-strip p{margin:0;font-size:13px;line-height:1.5;color:#fff}" +
    ".oi-strip p b{font-weight:500}.oi-strip p span{color:rgb(255 255 255/.75)}" +
    ".oi-strip button,.oi-strip a{all:unset;cursor:pointer;font-size:13px;line-height:1.5;text-underline-offset:4px}" +
    ".oi-strip .oi-strip-cta{display:inline-flex;align-items:center;gap:4px;font-weight:500;color:#fff}" +
    ".oi-strip .oi-strip-link{color:rgb(255 255 255/.75);transition:color .15s}" +
    ".oi-strip .oi-strip-cta:hover,.oi-strip .oi-strip-link:hover{color:#fff;text-decoration:underline}" +
    ".oi-strip .oi-strip-x{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:28px;height:28px;border-radius:999px;display:grid;place-items:center;color:rgb(255 255 255/.7);transition:background-color .15s,color .15s}" +
    ".oi-strip .oi-strip-x:hover{background:rgb(255 255 255/.15);color:#fff}" +
    ".oi-strip :focus-visible{outline:2px solid #fff;outline-offset:2px;border-radius:999px}" +
    // Phones: a compact two-line strip (title + actions), left-aligned; the explanation and the minor link are
    // dropped so the banner doesn't push the page down.
    "@media (max-width:639px){.oi-strip{border-radius:12px}" +
    ".oi-strip-row{justify-content:flex-start;gap:2px 10px;padding:7px 40px 7px 12px;text-align:left}" +
    ".oi-strip-eyebrow{font-size:10px;padding:0 6px}" +
    ".oi-strip p,.oi-strip button,.oi-strip a{font-size:13px;line-height:1.45}" +
    ".oi-strip p span,.oi-strip .oi-strip-minor{display:none}" +
    ".oi-strip .oi-strip-x{right:6px;width:26px;height:26px}}" +
    "@keyframes oi-strip-in{from{opacity:0}to{opacity:1}}" +
    "@media (prefers-reduced-motion:reduce){.oi-strip{animation:none}}";

  function snoozedUntil(key) {
    try {
      return Number(window.localStorage.getItem(SNOOZE_KEY + ":" + key)) || 0;
    } catch (e) {
      return 0;
    }
  }
  function snooze(key, days) {
    try {
      window.localStorage.setItem(SNOOZE_KEY + ":" + key, String(Date.now() + days * DAY));
    } catch (e) {
      // Not saved; it is still hidden for this page load.
    }
  }

  /** What the banner says right now, or null when it shouldn't show. Mirrors Qorelly's DesignSwitchBanner. */
  function bannerContent() {
    var version = current();
    var ph = phase();
    var key = version + ":" + ph;
    if (ph === "before" || snoozedUntil(key) > Date.now()) return null;
    if (version === "v1") {
      // Classic pages: only for people who haven't chosen V2 (other pages are classic for everyone).
      if (ph === "retired" || wanted() === "v2") return null;
      var days = daysUntilRetirement();
      return ph === "trial"
        ? {
            key: key, palette: "dusk", snoozeDays: 3, eyebrow: "New",
            title: "This site has a new look",
            body: "Same work, cleaner and quicker to read. You can switch back any time.",
            cta: { label: "Try the new design", run: function () { set("v2"); } },
            links: [],
          }
        : {
            key: key, palette: "amber", snoozeDays: 1, eyebrow: days + (days === 1 ? " day" : " days") + " left",
            title: "The classic design retires on " + retirementLabel(),
            body: "Switch now and get comfortable before it changes for everyone.",
            cta: { label: "Switch to the new design", run: function () { set("v2"); } },
            links: [],
          };
    }
    return {
      key: key, palette: "dusk", snoozeDays: 7, eyebrow: "New design",
      title: "You’re on the new design",
      body:
        ph === "retired"
          ? "Missing something from the classic look? Tell me."
          : ph === "countdown"
            ? "Classic goes away on " + retirementLabel() + ". Missing something? Tell me."
            : "Missing something, or found a problem? Tell me.",
      // WhatsApp first (as Qorelly), email beside it.
      cta: { label: "Share feedback", href: feedbackUrl() },
      links: (ph === "retired" ? [] : [{ label: "Switch back to classic", run: function () { set("v1"); } }]).concat([
        { label: "Email instead", href: feedbackEmailUrl(), minor: true },
      ]),
    };
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  /**
   * Renders the strip into `container` (emptied first). Returns true when it rendered. `onHide` runs when the
   * person dismisses it, so the host can collapse its space.
   */
  function mountBanner(container, onHide) {
    container.textContent = "";
    var c = bannerContent();
    if (!c) return false;
    if (!document.getElementById("oi-strip-css")) {
      var style = el("style");
      style.id = "oi-strip-css";
      style.textContent = CSS;
      document.head.appendChild(style);
    }
    var strip = el("div", "oi-strip");
    strip.setAttribute("role", "region");
    strip.setAttribute("aria-label", c.title);
    var palette = PALETTES[c.palette];
    strip.style.backgroundColor = palette[0];
    var bg = el("div", "oi-strip-bg");
    bg.setAttribute("aria-hidden", "true");
    palette.slice(1).forEach(function (colour, i) {
      var blob = el("div", "oi-strip-blob");
      blob.style.cssText = SPOTS[i % SPOTS.length] + ";background-color:" + colour;
      bg.appendChild(blob);
    });
    bg.appendChild(el("div", "oi-strip-grain"));
    strip.appendChild(bg);

    var row = el("div", "oi-strip-row");
    if (c.eyebrow) row.appendChild(el("span", "oi-strip-eyebrow", c.eyebrow));
    var p = el("p");
    p.appendChild(el("b", null, c.title));
    p.appendChild(el("span", null, ": " + c.body));
    row.appendChild(p);

    var cta;
    if (c.cta.href) {
      cta = el("a", "oi-strip-cta", c.cta.label);
      cta.href = c.cta.href;
      cta.target = "_blank";
      cta.rel = "noopener noreferrer";
    } else {
      cta = el("button", "oi-strip-cta", c.cta.label);
      cta.type = "button";
      cta.addEventListener("click", c.cta.run);
    }
    cta.insertAdjacentHTML("beforeend", ICON_ARROW);
    row.appendChild(cta);
    c.links.forEach(function (link) {
      var b;
      if (link.href) {
        b = el("a", "oi-strip-link" + (link.minor ? " oi-strip-minor" : ""), link.label);
        b.href = link.href;
      } else {
        b = el("button", "oi-strip-link", link.label);
        b.type = "button";
        b.addEventListener("click", link.run);
      }
      row.appendChild(b);
    });
    var x = el("button", "oi-strip-x");
    x.type = "button";
    x.setAttribute("aria-label", "Dismiss");
    x.innerHTML = ICON_CLOSE;
    x.addEventListener("click", function () {
      snooze(c.key, c.snoozeDays);
      container.textContent = "";
      if (onHide) onHide();
    });
    row.appendChild(x);
    strip.appendChild(row);
    container.appendChild(strip);
    return true;
  }

  window.oiDesign = {
    current: current,
    wanted: wanted,
    set: set,
    pathFor: pathFor,
    phase: phase,
    mountBanner: mountBanner,
    CHANGE_EVENT: CHANGE_EVENT,
  };
})();
