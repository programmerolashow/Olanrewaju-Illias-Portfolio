import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const VISITOR_KEY = "portfolio-visitor-id";

/**
 * A random id this browser keeps, so a visitor's like can be shown and undone. Not tied to anything personal.
 * Falls back to an id for this page view when storage is blocked (private windows), so liking still works.
 */
let sessionVisitor: string | null = null;
export const visitorId = () => {
  const fresh = () => crypto.randomUUID().replace(/-/g, "");
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id || !/^[A-Za-z0-9_-]{16,64}$/.test(id)) {
      id = fresh();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    sessionVisitor ??= fresh();
    return sessionVisitor;
  }
};

export interface LikeState {
  count: number;
  liked: boolean;
}

/** Like count for one post and whether this visitor has liked it, with an instant (optimistic) toggle. */
export const useLikes = (updateId: string) => {
  const queryClient = useQueryClient();
  const key = ["likes", updateId];

  const query = useQuery({
    queryKey: key,
    queryFn: async (): Promise<LikeState> => {
      const res = await fetch(`/api/likes?updateId=${updateId}&visitorId=${visitorId()}`);
      if (!res.ok) throw new Error(`Likes request failed (${res.status})`);
      return res.json();
    },
    staleTime: 30_000,
    retry: 1,
  });

  const toggle = useMutation({
    mutationFn: async (liked: boolean): Promise<LikeState> => {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updateId, visitorId: visitorId(), liked }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? "Could not save your like.");
      return json as LikeState;
    },
    onMutate: async (liked) => {
      await queryClient.cancelQueries({ queryKey: key });
      const before = queryClient.getQueryData<LikeState>(key);
      const count = before?.count ?? 0;
      queryClient.setQueryData<LikeState>(key, { liked, count: Math.max(0, count + (liked ? 1 : -1)) });
      return { before };
    },
    onError: (_error, _liked, context) => queryClient.setQueryData(key, context?.before),
    onSuccess: (state) => queryClient.setQueryData(key, state),
  });

  return { ...query, toggle };
};
