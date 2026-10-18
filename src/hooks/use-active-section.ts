import { useEffect, useState } from "react";

/** Scroll-spy: returns the id of the section currently crossing the middle band of the viewport. */
export const useActiveSection = (ids: string[], enabled: boolean) => {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setActive(null);
      return;
    }

    let observer: IntersectionObserver | null = null;
    let frame = 0;

    // When arriving from another page the sections mount only after the page transition finishes,
    // so keep looking for them for a couple of seconds before attaching the observer.
    const attach = (remaining: number) => {
      const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
      if (elements.length < ids.length && remaining > 0) {
        frame = requestAnimationFrame(() => attach(remaining - 1));
        return;
      }
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActive(entry.target.id);
          });
        },
        { rootMargin: "-45% 0px -50% 0px" },
      );
      elements.forEach((el) => observer?.observe(el));
    };
    attach(120);

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [ids, enabled]);

  return active;
};
