/**
 * Classic (V1) ↔ new design (V2) switch, React side. The logic lives in public/design-switch.js, a plain script
 * both designs load in <head> (V2 is the static public/v2.html, served at /v2), so they share one schedule and
 * one saved choice and the home page redirects before its first paint. This file only types it and adds hooks.
 * See the comment at the top of public/design-switch.js for the rules and the rollout schedule.
 */
import { useEffect, useSyncExternalStore } from "react";

export type UiVersion = "v1" | "v2";
export type RolloutPhase = "before" | "trial" | "countdown" | "retired";

interface OiDesign {
  /** The design this document is showing (this React app is always "v1"). */
  current: () => UiVersion;
  /** The home page this person should get: ?ui=, retirement, their saved choice, then the default. */
  wanted: () => UiVersion;
  /** Save the person's choice and take them to this page in that design (or its home page). */
  set: (version: UiVersion) => void;
  /** The same page in `version`, or null when the page exists in only one design. */
  pathFor: (version: UiVersion, pathname: string) => string | null;
  phase: () => RolloutPhase;
  /** Render the switch strip into `container`; false when it shouldn't show. */
  mountBanner: (container: HTMLElement, onHide?: () => void) => boolean;
  CHANGE_EVENT: string;
}

declare global {
  interface Window {
    oiDesign?: OiDesign;
  }
}

const design = () => window.oiDesign;

export function setUiVersion(version: UiVersion) {
  design()?.set(version);
}

export function rolloutPhase(): RolloutPhase {
  return design()?.phase() ?? "before";
}

function subscribe(onChange: () => void) {
  const event = design()?.CHANGE_EVENT;
  if (!event) return () => {};
  window.addEventListener(event, onChange);
  return () => window.removeEventListener(event, onChange);
}

/** The home page design this person gets, re-rendering when they switch. */
export function useWantedUiVersion(): UiVersion {
  return useSyncExternalStore(subscribe, () => design()?.wanted() ?? "v1");
}

/**
 * In-app navigation (React Router, no page load) skips the <head> redirect, so classic pages that also exist in V2
 * (/, /services, /moments, /updates) check again: someone who chose the new design goes to that page in V2.
 */
export function useHomeDesignRedirect(pathname: string, hash: string) {
  useEffect(() => {
    const d = design();
    if (d?.wanted() !== "v2") return;
    const target = d.pathFor("v2", pathname);
    if (target) window.location.replace(`${target}${window.location.search}${hash}`);
  }, [pathname, hash]);
}

export { design as getDesignSwitch };
