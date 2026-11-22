import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getDesignSwitch } from "@/lib/uiVersion";

/**
 * The classic → new design strip (Qorelly's "Try the new design" banner), at the top of the fixed navbar.
 * public/design-switch.js renders it, so the classic and new designs show the same banner.
 *
 * It folds away while the page is scrolled (`collapsed`) so the fixed bar stays slim. Its height is published as
 * --design-strip-h for SiteLayout, which pads the page by that much so the strip never covers the page header.
 */
const DesignSwitchBanner = ({ collapsed }: { collapsed: boolean }) => {
  const slot = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = slot.current;
    const design = getDesignSwitch();
    if (!el || !design) return;
    setShown(design.mountBanner(el, () => setShown(false)));
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const el = slot.current;
    if (!shown || !el) {
      root.style.removeProperty("--design-strip-h");
      return;
    }
    const publish = () => root.style.setProperty("--design-strip-h", `${el.offsetHeight}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--design-strip-h");
    };
  }, [shown]);

  const open = shown && !collapsed;
  return (
    // visibility (not just height) so the folded strip's buttons leave the tab order.
    <div
      className="grid transition-[grid-template-rows,opacity,visibility] duration-300 ease-out motion-reduce:transition-none"
      style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0, visibility: open ? "visible" : "hidden" }}
    >
      <div className="min-h-0 overflow-hidden">
        <div ref={slot} className="container mx-auto px-4 pb-3 empty:hidden sm:px-6" />
      </div>
    </div>
  );
};

export default DesignSwitchBanner;
