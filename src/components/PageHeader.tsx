import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  highlight: string;
  description?: string;
  /** Extra breadcrumb level between Home and this page, e.g. Projects on a project page. */
  parent?: { label: string; to: string };
  children?: ReactNode;
}

/** Hero band for dedicated pages: breadcrumb, h1 and intro, left-aligned to read as a document. */
const PageHeader = ({ eyebrow, title, highlight, description, parent, children }: PageHeaderProps) => (
  <header className="relative overflow-hidden pb-8 pt-28 sm:pt-32 md:pb-12 md:pt-40">
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -right-32 -top-32 h-[26rem] w-[26rem] max-w-full rounded-full bg-primary/10 blur-[7rem]" />
      <div className="absolute -left-40 top-10 h-[20rem] w-[20rem] max-w-full rounded-full bg-accent/10 blur-[7rem]" />
    </div>

    <div className="container relative mx-auto px-4 sm:px-6">
      <motion.nav
        aria-label="Breadcrumb"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ol className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground sm:text-sm">
          <li>
            <Link to="/" className="rounded transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Home
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          {parent && (
            <>
              <li>
                <Link to={parent.to} className="rounded transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {parent.label}
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
            </>
          )}
          <li aria-current="page" className="text-primary">
            {eyebrow}
          </li>
        </ol>
      </motion.nav>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.05 }}
        className="section-heading mt-5 max-w-4xl"
      >
        {title} <span className="gradient-text">{highlight}</span>
      </motion.h1>

      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg"
        >
          {description}
        </motion.p>
      )}

      {children && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 md:mt-8"
        >
          {children}
        </motion.div>
      )}
    </div>
  </header>
);

export default PageHeader;
