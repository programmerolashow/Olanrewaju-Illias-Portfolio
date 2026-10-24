import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { BadgeCheck, ExternalLink, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { certifications, type Certification } from "@/data/certifications";

/** Licenses & certifications: click a certificate to view it full size, or open the issuer's verification page. */
const Certifications = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [open, setOpen] = useState<Certification | null>(null);

  return (
    <section id="certifications" className="section-padding relative" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center md:mb-14"
        >
          <p className="mb-4 font-mono text-sm text-primary">Licenses & Certifications</p>
          <h2 className="section-heading">
            Verified <span className="gradient-text">Credentials</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Every certificate links to the issuer's page so you can check it for yourself.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
          {certifications.map((cert, index) => (
            <motion.article
              key={cert.credentialId}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="glass-card flex h-full flex-col overflow-hidden rounded-2xl"
            >
              <button
                type="button"
                onClick={() => setOpen(cert)}
                className="group relative block aspect-[1754/1238] w-full overflow-hidden bg-white"
                aria-label={`View ${cert.title} certificate`}
              >
                <img
                  src={cert.image}
                  alt={`${cert.title} certificate from ${cert.issuer}`}
                  loading="lazy"
                  className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100 group-focus-visible:bg-black/30 group-focus-visible:opacity-100">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground">
                    <Maximize2 className="h-3.5 w-3.5" aria-hidden /> View
                  </span>
                </span>
              </button>

              <div className="flex flex-1 flex-col p-5">
                <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <BadgeCheck className="h-4 w-4" aria-hidden /> {cert.issuer}
                </p>
                <h3 className="font-bold leading-snug text-foreground">{cert.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">Issued {cert.issued}</p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">ID {cert.credentialId}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {cert.skills.map((skill) => (
                    <span key={skill} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-5">
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    Show credential <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <Dialog open={open !== null} onOpenChange={(next) => !next && setOpen(null)}>
        <DialogContent className="max-w-4xl rounded-2xl p-4 shadow-none sm:p-6">
          {open && (
            <>
              <div className="pr-8">
                <DialogTitle>{open.title}</DialogTitle>
                <DialogDescription>
                  {open.issuer} · Issued {open.issued} · ID {open.credentialId}
                </DialogDescription>
              </div>
              <img src={open.image} alt={`${open.title} certificate from ${open.issuer}`} className="w-full rounded-xl bg-white" />
              <a
                href={open.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 justify-self-center rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                Verify on {open.issuer} <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Certifications;
