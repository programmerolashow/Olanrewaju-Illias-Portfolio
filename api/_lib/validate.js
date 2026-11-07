import { z } from "zod";
import { publicBase, videoBase } from "./storage.js";

const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.")
  .nullable()
  .optional()
  .transform((v) => v || null);

const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((v) => v || null);

// Only photos uploaded through /admin (our Neon bucket) may be attached, so posts can't hotlink arbitrary URLs.
const photoUrl = z
  .string()
  .url()
  .refine((u) => u.startsWith(publicBase()), "Images must be uploaded through the admin page.");

// Videos are uploaded from /admin straight to our bucket's videos/ folder.
const videoUrl = z
  .string()
  .url()
  .refine((u) => u.startsWith(videoBase()), "Videos must be uploaded through the admin page.");

export const updateInput = z
  .object({
    kind: z.enum(["event", "post"]),
    title: z.string().trim().min(1, "Add a title.").max(160),
    body: z.string().trim().max(10000).default(""),
    location: optionalText(160),
    startsOn: date,
    endsOn: date,
    linkUrl: optionalText(500).refine((v) => !v || /^https?:\/\//i.test(v), "Links must start with http:// or https://."),
    images: z
      .array(z.object({ url: photoUrl, shareUrl: photoUrl.optional(), alt: z.string().trim().max(300).default("") }))
      .max(12)
      .default([]),
    videos: z
      .array(z.object({
          url: videoUrl,
          posterUrl: photoUrl.optional(),
          caption: z.string().trim().max(300).default(""),
          featured: z.boolean().default(false),
        }),)
      .max(4)
      .default([])
      .refine((videos) => videos.filter((v) => v.featured).length <= 1, "Choose only one video for the banner."),
    published: z.boolean().default(false),
    pinned: z.boolean().default(false),
  })
  .refine((v) => !v.endsOn || v.startsOn, { message: "Add a start date before an end date.", path: ["startsOn"] })
  .refine((v) => !v.endsOn || !v.startsOn || v.endsOn >= v.startsOn, { message: "The end date is before the start date.", path: ["endsOn"] });

// Moments: anything added in /admin lives in our bucket; the photos that shipped with the site are /gallery/ files.
const shippedFile = /^\/gallery\/[a-z0-9][a-z0-9._-]*\.(webp|jpe?g|png|mp4|webm)$/i;
const momentFile = z
  .string()
  .trim()
  .max(500)
  .refine((u) => u.startsWith(publicBase()) || shippedFile.test(u), "Files must be uploaded through the admin page.");

// CSS object-position, kept to plain keywords and percentages, e.g. "center 30%".
const place = "(top|bottom|left|right|center|\\d{1,3}%)";
const focusValue = new RegExp(`^${place}( ${place})?$`);

export const momentInput = z.object({
  type: z.enum(["image", "video"]),
  src: momentFile,
  poster: momentFile
    .nullable()
    .optional()
    .transform((v) => v || null),
  title: z.string().trim().min(1, "Add a title.").max(120),
  caption: z.string().trim().max(300).default(""),
  category: z.string().trim().min(1, "Add a category, e.g. Events.").max(40),
  date: optionalText(40),
  location: optionalText(120),
  size: z.enum(["square", "tall", "wide", "large"]).default("square"),
  focus: optionalText(40).refine((v) => !v || focusValue.test(v), "Use a position like “center 30%” or “top”."),
  published: z.boolean().default(true),
});

export const momentOrderInput = z.object({ ids: z.array(z.string().uuid()).min(1).max(500) });

export const articleInput = z
  .object({
    title: z.string().trim().min(1, "Add a title.").max(200),
    summary: z.string().trim().max(600).default(""),
    track: z.string().trim().min(1, "Choose a track.").max(40),
    topic: optionalText(200),
    fileUrl: optionalText(500).refine((v) => !v || v.startsWith(publicBase()), "Files must be uploaded through the admin page."),
    fileName: optionalText(200),
    scholarUrl: optionalText(500).refine((v) => !v || /^https:\/\//i.test(v), "The Google Scholar link must start with https://."),
    zenodoUrl: optionalText(500).refine(
      (v) => !v || /^https:\/\/(www\.|sandbox\.)?zenodo\.org\//i.test(v) || /^https:\/\/doi\.org\/10\.5281\/zenodo\./i.test(v),
      "Use a zenodo.org record link or its Zenodo DOI link (https://doi.org/10.5281/zenodo.…).",
    ),
    publishedOn: date,
    published: z.boolean().default(false),
  })
  .refine((v) => v.fileUrl || v.scholarUrl || v.zenodoUrl, {
    message: "Upload a file or add a Google Scholar or Zenodo link.",
    path: ["fileUrl"],
  });

export const relationships = [
  "colleague",
  "manager",
  "teammate",
  "classmate",
  "course_mate",
  "collaborator",
  "client",
  "mentor",
  "mentee",
  "other",
];

const optionalEmail = z
  .string()
  .trim()
  .max(200)
  .optional()
  .nullable()
  .transform((v) => v || null)
  .refine((v) => !v || z.string().email().safeParse(v).success, "Enter a valid email address, or leave it empty.");

export const recommendationInput = z.object({
  name: z.string().trim().min(2, "Add your name.").max(100),
  relationship: z.enum(relationships, { errorMap: () => ({ message: "Choose how you know Illias." }) }),
  role: optionalText(120),
  company: optionalText(120),
  body: z.string().trim().min(40, "Write at least a couple of sentences (40+ characters).").max(2000),
  linkedinUrl: optionalText(300).refine(
    (v) => !v || /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\//i.test(v),
    "Use your LinkedIn profile link (https://linkedin.com/in/…), or leave it empty.",
  ),
  email: optionalEmail,
});

export const commentInput = z.object({
  updateId: z.string().uuid("Unknown post."),
  name: z.string().trim().min(2, "Add your name.").max(80),
  body: z.string().trim().min(2, "Write a comment.").max(2000),
  email: optionalEmail,
});

export const firstError =(error) => error.issues[0]?.message ?? "Invalid input.";
