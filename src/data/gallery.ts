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
 *   focus     optional CSS object-position for cropping, e.g. "top", "center 30%"
 *             (use it when a card crops off someone's head)
 *
 * Tips:
 *   - Compress images to ~300–500 KB (JPG/WebP, ~1600px on the long edge).
 *   - Keep videos short (5–30s), MP4 (H.264), under ~8 MB. They autoplay muted
 *     when scrolled into view; visitors can open them full-size with sound.
 *   - Mix sizes: 1 "large", a couple of "tall"/"wide", the rest "square" looks best.
 *
 * Example video entry:
 *   {
 *     type: "video",
 *     src: "/gallery/project-pitch.mp4",
 *     poster: "/gallery/project-pitch-poster.webp",
 *     title: "Project Pitch",
 *     caption: "Presenting a product concept to a panel",
 *     category: "Speaking",
 *     size: "wide",
 *   },
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
  focus?: string;
}

export const gallery: GalleryItem[] = [
  {
    type: "image",
    src: "/gallery/build-with-ai-group.webp",
    title: "Build with AI 2026",
    caption: "The Google Developer Groups community at Build with AI",
    category: "Community",
    date: "2026",
    size: "large",
  },
  {
    type: "image",
    src: "/gallery/gemini-lagos.webp",
    title: "Gemini Lagos",
    caption: "Connecting with the Google Gemini community",
    category: "Events",
    location: "Lagos, Nigeria",
    size: "tall",
    focus: "center 25%",
  },
  {
    type: "image",
    src: "/gallery/ilorin-innovation-hub-building.webp",
    title: "Heads Down, Building",
    caption: "Hands-on build session at Ilorin Innovation Hub",
    category: "Workshops",
    location: "Ilorin, Nigeria",
    size: "square",
  },
  {
    type: "image",
    src: "/gallery/devfest-ilorin-duo.webp",
    title: "DevFest Ilorin 2025",
    caption: "Google Developer Groups' flagship developer festival",
    category: "Events",
    date: "2025",
    location: "Ilorin, Nigeria",
    size: "square",
    focus: "center 30%",
  },
  {
    type: "image",
    src: "/gallery/build-with-ai-stage.webp",
    title: "On Stage at Build with AI",
    caption: "A panel moment at Build with AI 2026",
    category: "Events",
    date: "2026",
    size: "wide",
  },
  {
    type: "image",
    src: "/gallery/portrait-yellow-wall.webp",
    title: "Olanrewaju Illias",
    caption: "Full-Stack Product Engineer",
    category: "Portraits",
    size: "tall",
    focus: "center 20%",
  },
  {
    type: "image",
    src: "/gallery/ilorin-innovation-hub-session.webp",
    title: "Ilorin Innovation Hub",
    caption: "Learning sessions with the local tech community",
    category: "Workshops",
    location: "Ilorin, Nigeria",
    size: "wide",
  },
  {
    type: "image",
    src: "/gallery/malhub-career-event.webp",
    title: "MALhub Tech Career Event",
    caption: "Empowering Africa's next tech talent",
    category: "Events",
    size: "square",
    focus: "center 30%",
  },
  {
    type: "image",
    src: "/gallery/careerfest-stage.webp",
    title: "CareerFest",
    caption: "On stage with fellow participants at a GDG CareerFest",
    category: "Events",
    size: "wide",
  },
  {
    type: "image",
    src: "/gallery/careerfest-portrait.webp",
    title: "Between Sessions",
    caption: "CareerFest",
    category: "Portraits",
    size: "tall",
    focus: "center 35%",
  },
  {
    type: "image",
    src: "/gallery/ilorin-innovation-hub-audience.webp",
    title: "In the Room",
    caption: "Learning alongside the developer community",
    category: "Community",
    location: "Ilorin, Nigeria",
    size: "square",
  },
  {
    type: "image",
    src: "/gallery/with-colleagues.webp",
    title: "With the Team",
    caption: "Good people, good work",
    category: "Community",
    size: "square",
    focus: "center 35%",
  },
  {
    type: "image",
    src: "/gallery/devfest-ilorin-portrait.webp",
    title: "DevFest Ilorin",
    caption: "Showing up for the developer community",
    category: "Portraits",
    date: "2025",
    location: "Ilorin, Nigeria",
    size: "square",
    focus: "center 40%",
  },
  {
    type: "image",
    src: "/gallery/build-with-ai-audience.webp",
    title: "Build with AI, Front Row",
    caption: "Taking it all in at Build with AI 2026",
    category: "Community",
    date: "2026",
    size: "square",
  },
];
