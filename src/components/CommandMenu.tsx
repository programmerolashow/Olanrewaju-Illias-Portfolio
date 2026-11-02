import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, Download, FileText, FolderGit2, GraduationCap, Home, Megaphone, Moon, Rss, Send, Sun } from "lucide-react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { navGroups } from "@/data/navigation";
import { projects } from "@/data/projects";
import { site } from "@/config/site";
import { useUpdates } from "@/lib/updates";
import { useArticles } from "@/lib/articles";
import { useTheme } from "./ThemeProvider";
import { OPEN_COMMAND_MENU } from "@/lib/command-menu";


/** Articles and updates come from the API, so they're only fetched once the menu is first opened. */
const LiveResults = ({ go }: { go: (to: string) => void }) => {
  const updates = useUpdates();
  const articles = useArticles();
  return (
    <>
      {articles.data && articles.data.length > 0 && (
        <CommandGroup heading="Articles">
          {articles.data.slice(0, 30).map((a) => (
            <CommandItem key={a.id} value={`article ${a.title}`} onSelect={() => go("/articles")}>
              <FileText aria-hidden />
              <span className="truncate">{a.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
      {updates.data && updates.data.length > 0 && (
        <CommandGroup heading="Updates">
          {updates.data.slice(0, 30).map((u) => (
            <CommandItem key={u.id} value={`update ${u.kind} ${u.title}`} onSelect={() => go(`/updates/${u.id}`)}>
              <Megaphone aria-hidden />
              <span className="truncate">{u.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </>
  );
};

const CommandMenu = () => {
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_COMMAND_MENU, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_COMMAND_MENU, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) setOpened(true);
  }, [open]);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };
  const go = (to: string) => run(() => navigate(to));
  const external = (href: string) => run(() => window.open(href, "_blank", "noopener,noreferrer"));

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <DialogTitle className="sr-only">Search the site</DialogTitle>
      <DialogDescription className="sr-only">Jump to a page, project, article or update.</DialogDescription>
      <CommandInput placeholder="Search pages, projects, articles…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Pages">
          <CommandItem value="page home" onSelect={() => go("/")}>
            <Home aria-hidden />
            Home
          </CommandItem>
          {navGroups.flatMap((g) => g.items).map((item) => (
            <CommandItem key={item.to} value={`page ${item.label} ${item.description}`} onSelect={() => go(item.to)}>
              <item.icon aria-hidden />
              <span>{item.label}</span>
              <span className="ml-2 truncate text-xs text-muted-foreground">{item.description}</span>
            </CommandItem>
          ))}
          <CommandItem value="page contact email message" onSelect={() => go("/#contact")}>
            <Send aria-hidden />
            Contact
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Projects">
          {projects.map((p) => (
            <CommandItem key={p.slug} value={`project ${p.title} ${p.tags.join(" ")}`} onSelect={() => go(`/projects/${p.slug}`)}>
              <FolderGit2 aria-hidden />
              <span className="truncate">{p.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        {opened && <LiveResults go={go} />}
        <CommandSeparator />
        <CommandGroup heading="Actions">
          {__HAS_CV__ && (
            <CommandItem value="action download cv resume" onSelect={() => external(site.cvPath)}>
              <Download aria-hidden />
              Download CV
            </CommandItem>
          )}
          {site.bookingUrl && (
            <CommandItem value="action book a call meeting calendly" onSelect={() => external(site.bookingUrl)}>
              <CalendarClock aria-hidden />
              Book a call
            </CommandItem>
          )}
          {site.scholarUrl && (
            <CommandItem value="action google scholar publications" onSelect={() => external(site.scholarUrl)}>
              <GraduationCap aria-hidden />
              Google Scholar profile
            </CommandItem>
          )}
          <CommandItem value="action rss feed subscribe updates" onSelect={() => external("/api/feed")}>
            <Rss aria-hidden />
            Updates RSS feed
          </CommandItem>
          <CommandItem value="action toggle theme dark light mode" onSelect={() => run(toggleTheme)}>
            {theme === "dark" ? <Sun aria-hidden /> : <Moon aria-hidden />}
            Switch to {theme === "dark" ? "light" : "dark"} mode
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandMenu;
