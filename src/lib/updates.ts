import { useQuery } from "@tanstack/react-query";

export interface UpdateImage {
  url: string;
  alt: string;
  /** 1200×630 JPEG used for link previews when this photo is the cover. Missing on photos uploaded before it existed. */
  shareUrl?: string;
}

export interface Update {
  id: string;
  kind: "event" | "post";
  title: string;
  body: string;
  location: string | null;
  /** YYYY-MM-DD */
  startsOn: string | null;
  endsOn: string | null;
  linkUrl: string | null;
  images: UpdateImage[];
  published: boolean;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UpdateInput = Omit<Update, "id" | "createdAt" | "updatedAt">;

export type EventStatus = "happening" | "upcoming" | "past";

/** Today's date in Lagos as YYYY-MM-DD, so "Happening now" flips at local midnight, not UTC. */
export const todayInLagos = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date());

/** Worked out from the dates every time, so a label can never be left stale. Posts have no status. */
export const eventStatus = (u: Pick<Update, "kind" | "startsOn" | "endsOn">, today = todayInLagos()): EventStatus | null => {
  if (u.kind !== "event" || !u.startsOn) return null;
  const end = u.endsOn ?? u.startsOn;
  if (today < u.startsOn) return "upcoming";
  if (today <= end) return "happening";
  return "past";
};

export const statusLabel: Record<EventStatus, string> = {
  happening: "Happening now",
  upcoming: "Upcoming",
  past: "Past event",
};

const formatDay = (iso: string, withYear = true) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });

/** "19 Oct 2026", "19 – 21 Oct 2026" style; falls back to the post date. */
export const displayDate = (u: Pick<Update, "startsOn" | "endsOn" | "createdAt">) => {
  if (!u.startsOn) return formatDay(u.createdAt.slice(0, 10));
  if (!u.endsOn || u.endsOn === u.startsOn) return formatDay(u.startsOn);
  const sameYear = u.startsOn.slice(0, 4) === u.endsOn.slice(0, 4);
  return `${formatDay(u.startsOn, !sameYear)} – ${formatDay(u.endsOn)}`;
};

const rank: Record<EventStatus | "none", number> = { happening: 0, upcoming: 1, past: 2, none: 2 };
const sortDate = (u: Update) => u.startsOn ?? u.createdAt.slice(0, 10);

/** Pinned first, then what's happening now, then upcoming (soonest first), then everything else newest first. */
export const sortForVisitors = (updates: Update[]) => {
  const today = todayInLagos();
  return [...updates].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const ra = rank[eventStatus(a, today) ?? "none"];
    const rb = rank[eventStatus(b, today) ?? "none"];
    if (ra !== rb) return ra - rb;
    if (ra === rank.upcoming) return sortDate(a).localeCompare(sortDate(b));
    return sortDate(b).localeCompare(sortDate(a)) || b.createdAt.localeCompare(a.createdAt);
  });
};

/** Published updates for visitors. Fails quietly: the sections hide themselves if the API is unavailable. */
export const useUpdates = () =>
  useQuery({
    queryKey: ["updates"],
    queryFn: async (): Promise<Update[]> => {
      const res = await fetch("/api/updates");
      if (!res.ok) throw new Error(`Updates request failed (${res.status})`);
      const json = (await res.json()) as { updates: Update[] };
      return sortForVisitors(json.updates);
    },
    staleTime: 60_000,
    retry: 1,
  });
