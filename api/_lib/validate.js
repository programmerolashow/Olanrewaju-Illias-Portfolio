import { z } from "zod";
import { publicBase } from "./storage.js";

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

export const updateInput = z
  .object({
    kind: z.enum(["event", "post"]),
    title: z.string().trim().min(1, "Add a title.").max(160),
    body: z.string().trim().max(10000).default(""),
    location: optionalText(160),
    startsOn: date,
    endsOn: date,
    linkUrl: optionalText(500).refine((v) => !v || /^https?:\/\//i.test(v), "Links must start with http:// or https://."),
    images: z.array(z.object({ url: photoUrl, alt: z.string().trim().max(300).default("") })).max(12).default([]),
    published: z.boolean().default(false),
    pinned: z.boolean().default(false),
  })
  .refine((v) => !v.endsOn || v.startsOn, { message: "Add a start date before an end date.", path: ["startsOn"] })
  .refine((v) => !v.endsOn || !v.startsOn || v.endsOn >= v.startsOn, { message: "The end date is before the start date.", path: ["endsOn"] });

export const firstError = (error) => error.issues[0]?.message ?? "Invalid input.";
