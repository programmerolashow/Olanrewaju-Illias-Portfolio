/**
 * GALLERY / "MOMENTS" CONTENT
 * ---------------------------------------------------------------
 * How to add your photos and videos:
 *
 * 1. Drop the files into  public/gallery/
 *    e.g. public/gallery/devfest-lagos.jpg
 *         public/gallery/gsoc-talk.mp4
 *         public/gallery/gsoc-talk-poster.jpg   (optional thumbnail for a video)
 *
 * 2. Add an entry to the `gallery` array below. Paths start with "/gallery/...".
 *
 * Fields:
 *   type      "image" | "video"
 *   src       path to the file inside /public
 *   poster    (videos only, optional) image shown before the video loads
 *   title     short headline shown on the card
 *   caption   one-line description shown on hover / in the lightbox
 *   category  used for the filter chips (e.g. "Events", "Speaking", "Team", "Community")
 *   date      optional, free text e.g. "Nov 2025"
 *   location  optional, free text e.g. "Lagos, Nigeria"
 *   size      card shape in the grid:
 *               "square" (default) 1x1, "tall" 1x2, "wide" 2x1, "large" 2x2
 *
 * Tips:
 *   - Compress images to ~300–500 KB (JPG/WebP, ~1600px on the long edge).
 *   - Keep videos short (5–30s), MP4 (H.264), under ~8 MB. They autoplay muted
 *     when scrolled into view; visitors can open them full-size with sound.
 *   - Mix sizes: 1 "large", a couple of "tall"/"wide", the rest "square" looks best.
 */

export type GalleryItemType = "image" | "video";
export type GalleryItemSize = "square" | "tall" | "wide" | "large";

export interface GalleryItem {
  type: GalleryItemType;
  src: string;
  poster?: string;
  title: string;
  caption?: string;
  category: string;
  date?: string;
  location?: string;
  size?: GalleryItemSize;
}

export const gallery: GalleryItem[] = [
  {
    type: "image",
    src: "/image.jpeg",
    title: "Olanrewaju Illias",
    caption: "Full-Stack Product Engineer",
    category: "Portrait",
    size: "large",
  },

  // --- Examples: copy, uncomment and edit ---------------------------------
  // {
  //   type: "image",
  //   src: "/gallery/devfest-lagos.jpg",
  //   title: "DevFest Lagos",
  //   caption: "Talking developer community and open source",
  //   category: "Events",
  //   date: "Nov 2025",
  //   location: "Lagos, Nigeria",
  //   size: "tall",
  // },
  // {
  //   type: "video",
  //   src: "/gallery/project-pitch.mp4",
  //   poster: "/gallery/project-pitch-poster.jpg",
  //   title: "Project Pitch",
  //   caption: "Presenting a product concept to a panel",
  //   category: "Speaking",
  //   size: "wide",
  // },
];
