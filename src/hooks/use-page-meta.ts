import { useEffect } from "react";

const DEFAULT_TITLE = document.title;
const DEFAULT_DESCRIPTION = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";

/** Sets the tab title and meta description for a page; with no arguments it restores the defaults from index.html. */
export const usePageMeta = (title?: string, description?: string) => {
  useEffect(() => {
    document.title = title ? `${title} | Olanrewaju Illias` : DEFAULT_TITLE;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description ?? DEFAULT_DESCRIPTION);
  }, [title, description]);
};
