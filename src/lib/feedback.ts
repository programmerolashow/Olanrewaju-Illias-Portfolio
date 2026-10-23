import { useQuery } from "@tanstack/react-query";

/** Mirrors the check constraint on recommendations.relationship (db/migrations/002). */
export const relationshipLabels = {
  colleague: "Colleague",
  manager: "Manager",
  teammate: "Teammate",
  classmate: "Schoolmate",
  course_mate: "Course-mate",
  collaborator: "Collaborator",
  client: "Client",
  mentor: "Mentor",
  mentee: "Mentee",
  other: "Other",
} as const;

export type Relationship = keyof typeof relationshipLabels;

export interface Recommendation {
  id: string;
  name: string;
  relationship: Relationship;
  role: string | null;
  company: string | null;
  body: string;
  linkedinUrl: string | null;
  featured: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  updateId: string;
  name: string;
  body: string;
  createdAt: string;
}

export type ReviewStatus = "pending" | "approved" | "rejected";

/** Admin views carry the private fields too. */
export type AdminRecommendation = Recommendation & { email: string | null; status: ReviewStatus; reviewedAt: string | null };
export type AdminComment = Comment & { email: string | null; status: ReviewStatus; reviewedAt: string | null; updateTitle: string };

/** "Product Lead · Qorelly", "Qorelly", or the relationship when neither is given. */
export const recommenderLine = (r: Pick<Recommendation, "role" | "company" | "relationship">) =>
  [r.role, r.company].filter(Boolean).join(" · ") || relationshipLabels[r.relationship];

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });

/** Approved recommendations, featured first. Fails quietly: sections fall back to just the call to action. */
export const useRecommendations = () =>
  useQuery({
    queryKey: ["recommendations"],
    queryFn: async (): Promise<Recommendation[]> => {
      const res = await fetch("/api/recommendations");
      if (!res.ok) throw new Error(`Recommendations request failed (${res.status})`);
      return ((await res.json()) as { recommendations: Recommendation[] }).recommendations;
    },
    staleTime: 60_000,
    retry: 1,
  });

export const useComments = (updateId: string) =>
  useQuery({
    queryKey: ["comments", updateId],
    queryFn: async (): Promise<Comment[]> => {
      const res = await fetch(`/api/comments?updateId=${encodeURIComponent(updateId)}`);
      if (!res.ok) throw new Error(`Comments request failed (${res.status})`);
      return ((await res.json()) as { comments: Comment[] }).comments;
    },
    staleTime: 30_000,
    retry: 1,
  });

/** POSTs a guest form. `startedAt` and the empty honeypot `website` let the server turn away bots. */
export const submitGuest = async (path: "/api/recommendations" | "/api/comments", body: Record<string, unknown>, startedAt: number) => {
  const res = await fetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, startedAt }),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(json.error ?? "Something went wrong. Please try again.");
};
