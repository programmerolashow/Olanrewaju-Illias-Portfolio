import { useEffect } from "react";
import { site } from "@/config/site";

// Defaults come from config, not from the loaded HTML: each page now ships its own <title>, so the first page
// a visitor lands on would otherwise become the "default" for every page they navigate to afterwards.

/** Sets the tab title and meta description for a page; with no arguments it restores the site defaults. */
export const usePageMeta = (title?: string, description?: string) => {
  useEffect(() => {
    document.title = title ? `${title} | ${site.name}` : site.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description ?? site.description);
  }, [title, description]);
};
