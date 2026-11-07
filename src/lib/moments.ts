import { useQuery } from "@tanstack/react-query";
import { gallery, type GalleryItem } from "@/data/gallery";

/** A gallery item as stored in the database and edited in /admin. */
export interface Moment extends GalleryItem {
  id: string;
  position: number;
  published: boolean;
}

export type MomentInput = Omit<Moment, "id" | "position">;

/**
 * Published moments, in display order. If the API can't be reached, falls back to the list bundled with the site
 * (src/data/gallery.ts) so the page is never empty.
 */
export const useMoments = () =>
  useQuery({
    queryKey: ["moments"],
    queryFn: async (): Promise<GalleryItem[]> => {
      try {
        const res = await fetch("/api/moments");
        if (!res.ok) throw new Error(`Moments request failed (${res.status})`);
        return ((await res.json()) as { moments: Moment[] }).moments;
      } catch {
        return gallery;
      }
    },
    staleTime: 60_000,
  });
