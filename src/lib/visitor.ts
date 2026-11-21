/**
 * What this browser remembers about its visitor, kept only on their device (localStorage / sessionStorage).
 *
 * Browsers never let a website read the name of the Google, Apple or other account someone is signed into, so the
 * name comes from the visitor: whatever they typed into a form here (contact, recommendation, comment) or into the
 * welcome-back card.
 */

const NAME_KEY = "visitor-name";
const SEEN_KEY = "visitor-seen";
const SESSION_KEY = "visitor-session";
/** Set by SiteTour when a tour is finished or skipped; older visitors only have this one. */
const TOUR_DONE_KEY = "site-tour-done";

const read = (store: () => Storage, key: string) => {
  try {
    return store().getItem(key);
  } catch {
    return null;
  }
};
const write = (store: () => Storage, key: string, value: string) => {
  try {
    store().setItem(key, value);
  } catch {
    /* storage blocked: nothing is remembered */
  }
};
const local = () => window.localStorage;
const session = () => window.sessionStorage;

// Worked out once per page load, before this visit marks the browser as seen.
const newSession = read(session, SESSION_KEY) !== "1";
const seenBefore = read(local, SEEN_KEY) === "1" || read(local, TOUR_DONE_KEY) === "1";
write(session, SESSION_KEY, "1");
write(local, SEEN_KEY, "1");

/** Been here before, and this is the first page of a new visit (the browser or tab was closed in between). */
export const isReturningVisit = seenBefore && newSession;

/** Been here before at all (first-time visitors get the tour automatically; returning ones are asked). */
export const hasVisitedBefore = seenBefore;

export const getVisitorName = () => read(local, NAME_KEY)?.trim() || "";

/** Remembers the first name from what the visitor typed (e.g. "Ada Lovelace" → "Ada"). */
export const rememberVisitorName = (name: unknown) => {
  if (typeof name !== "string") return;
  const first = name.trim().split(/\s+/)[0]?.slice(0, 40);
  if (first && first.length >= 2) write(local, NAME_KEY, first);
};
