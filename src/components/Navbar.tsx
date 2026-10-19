import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, ChevronDown, ArrowRight, Send } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";
import { homeSections, navGroups, type NavGroup, type NavItem } from "@/data/navigation";
import { useActiveSection } from "@/hooks/use-active-section";

const isItemActive = (item: NavItem, pathname: string, section: string | null) => {
  if (!item.to.includes("#")) return pathname === item.to || pathname.startsWith(`${item.to}/`) || (pathname === "/" && !!item.section && item.section === section);
  return pathname === "/" && item.section === section;
};

/* ------------------------------------------------------------------ */
/* Desktop dropdown                                                    */
/* ------------------------------------------------------------------ */

interface DropdownProps {
  group: NavGroup;
  open: boolean;
  active: boolean;
  pathname: string;
  section: string | null;
  onOpen: () => void;
  onClose: (returnFocus?: boolean) => void;
  onHoverStart: () => void;
  triggerRef: (el: HTMLButtonElement | null) => void;
  align: "center" | "end";
}

const Dropdown = ({ group, open, active, pathname, section, onOpen, onClose, onHoverStart, triggerRef, align }: DropdownProps) => {
  const panelId = `nav-panel-${group.label.toLowerCase()}`;
  const panelRef = useRef<HTMLDivElement>(null);

  const focusItem = (index: number) => {
    const links = panelRef.current?.querySelectorAll<HTMLAnchorElement>("a");
    if (!links?.length) return;
    links[(index + links.length) % links.length].focus();
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      onOpen();
      requestAnimationFrame(() => focusItem(0));
    }
  };

  const onPanelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const links = Array.from(panelRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusItem(index + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusItem(index - 1);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        onClick={() => (open ? onClose() : onOpen())}
        onKeyDown={onTriggerKeyDown}
        onPointerEnter={(e: PointerEvent) => {
          if (e.pointerType === "mouse") onHoverStart();
        }}
        className={cn(
          "relative z-10 flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring xl:text-base",
          open || active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {group.label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")} aria-hidden />
        {active && <ActiveDot />}
      </button>

      <AnimatePresence>
        {open && (
          <div
            className={cn(
              "absolute top-full z-20 pt-3",
              align === "center" ? "left-1/2 -translate-x-1/2" : "right-0",
            )}
          >
            <motion.div
              ref={panelRef}
              id={panelId}
              onKeyDown={onPanelKeyDown}
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={cn("w-[22rem] rounded-2xl border border-border bg-background/95 p-2 backdrop-blur-xl", align === "center" ? "origin-top" : "origin-top-right")}
            >
              <p className="px-3 pb-1 pt-2 font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground">
                {group.label}
              </p>
              <ul>
                {group.items.map((item) => {
                  const current = isItemActive(item, pathname, section);
                  return (
                    <li key={item.label}>
                      <Link
                        to={item.to}
                        onClick={() => onClose()}
                        aria-current={current ? "page" : undefined}
                        className="group/item flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-secondary/70 focus-visible:bg-secondary/70 focus-visible:outline-none"
                      >
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                            current
                              ? "bg-primary text-primary-foreground"
                              : "bg-primary/10 text-primary group-hover/item:bg-primary group-hover/item:text-primary-foreground",
                          )}
                        >
                          <item.icon className="h-[1.1rem] w-[1.1rem]" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                            {item.label}
                            {!item.to.includes("#") && (
                              <span className="rounded-full border border-border px-1.5 font-mono text-[0.6rem] font-normal text-muted-foreground">
                                page
                              </span>
                            )}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
                        </span>
                        <ArrowRight
                          className="h-4 w-4 shrink-0 -translate-x-1 text-primary opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Navbar                                                              */
/* ------------------------------------------------------------------ */

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const section = useActiveSection(homeSections, location.pathname === "/");
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<number>();
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Any navigation closes every menu.
  useEffect(() => {
    setOpenGroup(null);
    setIsMobileMenuOpen(false);
  }, [location.key]);

  const openGroupRef = useRef(openGroup);
  openGroupRef.current = openGroup;

  const closeGroup = useCallback((returnFocus = false) => {
    if (returnFocus && openGroupRef.current) triggers.current[openGroupRef.current]?.focus();
    setOpenGroup(null);
  }, []);

  // Escape and outside clicks close open menus.
  useEffect(() => {
    if (!openGroup && !isMobileMenuOpen) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      closeGroup(true);
      setIsMobileMenuOpen(false);
    };
    const onPointer = (e: globalThis.PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) {
        setOpenGroup(null);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [openGroup, isMobileMenuOpen, closeGroup]);

  const cancelClose = () => window.clearTimeout(closeTimer.current);
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpenGroup(null), 140);
  };

  const homeActive = location.pathname === "/" && (section === "home" || section === null);
  const contactActive = location.pathname === "/" && section === "contact";

  return (
    <motion.nav
      ref={navRef}
      aria-label="Main"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || isMobileMenuOpen ? "glass-card py-3 md:py-4" : "bg-transparent py-4 md:py-6"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between gap-3 px-4 sm:px-6">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/" className="text-base font-bold gradient-text sm:text-xl xl:text-2xl whitespace-nowrap">
            {"<Programmer Olashow />"}
          </Link>
        </motion.div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Menu */}
          <ul
            className="hidden lg:flex items-center gap-1 rounded-full border border-transparent p-1"
            onPointerLeave={(e) => {
              if (e.pointerType !== "mouse") return;
              setHovered(null);
              scheduleClose();
            }}
            onPointerEnter={cancelClose}
          >
            <li
              className="relative"
              onPointerEnter={(e) => {
                if (e.pointerType !== "mouse") return;
                setHovered("Home");
                setOpenGroup(null);
              }}
            >
              {hovered === "Home" && <HoverPill />}
              <Link
                to="/"
                aria-current={homeActive ? "page" : undefined}
                className={cn(
                  "relative z-10 block rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring xl:text-base",
                  homeActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                Home
                {homeActive && <ActiveDot />}
              </Link>
            </li>

            {navGroups.map((group, index) => (
              <li
                key={group.label}
                className="relative"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setOpenGroup((g) => (g === group.label ? null : g));
                  }
                }}
              >
                {(hovered === group.label || openGroup === group.label) && <HoverPill />}
                <Dropdown
                  group={group}
                  open={openGroup === group.label}
                  active={group.items.some((item) => isItemActive(item, location.pathname, section))}
                  pathname={location.pathname}
                  section={section}
                  onOpen={() => setOpenGroup(group.label)}
                  onClose={closeGroup}
                  onHoverStart={() => {
                    cancelClose();
                    setHovered(group.label);
                    setOpenGroup(group.label);
                  }}
                  triggerRef={(el) => (triggers.current[group.label] = el)}
                  align={index === navGroups.length - 1 ? "end" : "center"}
                />
              </li>
            ))}
          </ul>

          <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }} className="hidden lg:block">
            <Link
              to="/#contact"
              aria-current={contactActive ? "page" : undefined}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              style={{ background: "var(--gradient-primary)" }}
            >
              Contact
              <Send className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </motion.div>

          {/* Theme Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2.5 rounded-full border border-border bg-secondary/80 text-foreground hover:text-primary hover:border-primary transition-all duration-300 flex items-center justify-center cursor-pointer"
            aria-label="Toggle theme"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-sky-600" />
            )}
          </motion.button>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden rounded-full p-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isMobileMenuOpen ? "close" : "open"}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="lg:hidden overflow-hidden"
          >
            <div className="container mx-auto max-h-[calc(100dvh-5rem)] overflow-y-auto px-4 pb-4 pt-3 sm:px-6">
              <Link
                to="/"
                className={cn(
                  "mb-3 flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-semibold transition-colors",
                  homeActive ? "border-primary/40 bg-primary/10 text-primary" : "text-foreground hover:bg-secondary/60",
                )}
              >
                Home
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>

              {navGroups.map((group, gi) => (
                <motion.div
                  key={group.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + gi * 0.05 }}
                  className="mb-3"
                >
                  <p className="mb-1.5 px-1 font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground">
                    {group.label}
                  </p>
                  <ul className="grid grid-cols-1 gap-1.5 xs:grid-cols-2">
                    {group.items.map((item) => {
                      const current = isItemActive(item, location.pathname, section);
                      return (
                        <li key={item.label}>
                          <Link
                            to={item.to}
                            aria-current={current ? "page" : undefined}
                            className={cn(
                              "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                              current
                                ? "border-primary/40 bg-primary/10"
                                : "border-border hover:border-primary/40 hover:bg-secondary/60",
                            )}
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <item.icon className="h-4 w-4" aria-hidden />
                            </span>
                            <span className="min-w-0">
                              <span className={cn("block text-sm font-semibold", current ? "text-primary" : "text-foreground")}>
                                {item.label}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              ))}

              <Link
                to="/#contact"
                className="mt-1 flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                Get in touch
                <Send className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const HoverPill = () => (
  <motion.span
    layoutId="nav-hover-pill"
    aria-hidden
    className="absolute inset-0 rounded-full bg-secondary/80"
    transition={{ type: "spring", stiffness: 420, damping: 36 }}
  />
);

const ActiveDot = () => (
  <motion.span
    layoutId="nav-active-dot"
    className="absolute inset-x-0 -bottom-0.5 mx-auto h-1 w-1 rounded-full bg-primary"
    transition={{ type: "spring", stiffness: 420, damping: 34 }}
  />
);

export default Navbar;
