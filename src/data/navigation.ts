import {
  Building2,
  Briefcase,
  Camera,
  Code2,
  FolderGit2,
  NotebookPen,
  UserRound,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  /** "/#id" scrolls to a section on the home page; "/path" opens a dedicated page. */
  to: string;
  description: string;
  icon: LucideIcon;
  /** Home-page section that should light this item up while it is on screen. */
  section?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "About",
    items: [
      { label: "About Me", to: "/#about", description: "Background, values and how I work", icon: UserRound, section: "about" },
      { label: "Services", to: "/services", description: "How I help teams build and ship software", icon: Briefcase, section: "services" },
      { label: "Skills", to: "/#skills", description: "Languages, frameworks and tooling", icon: Code2, section: "skills" },
      { label: "How I Work", to: "/approach", description: "Process, debugging, AI practice and principles", icon: Workflow },
      { label: "Moments", to: "/moments", description: "Events, talks and community", icon: Camera },
    ],
  },
  {
    label: "Work",
    items: [
      { label: "Experience", to: "/#experience", description: "Roles, teams and what I delivered", icon: Building2, section: "experience" },
      { label: "Projects", to: "/projects", description: "Featured builds, demos and source code", icon: FolderGit2, section: "projects" },
      { label: "Articles", to: "/articles", description: "Technical writing and project lessons", icon: NotebookPen, section: "articles" },
    ],
  },
];

/** Dedicated pages (not home-page sections), used for "keep exploring" links. */
export const pageLinks = navGroups.flatMap((group) => group.items).filter((item) => !item.to.includes("#"));

/** Section ids on the home page, in scroll order, used for scroll-spy. */
export const homeSections = ["home", "about", "services", "skills", "experience", "projects", "articles", "contact"];
