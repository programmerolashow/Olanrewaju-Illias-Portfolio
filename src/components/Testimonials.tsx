import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";
import { testimonials } from "@/data/testimonials";

const Testimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="section-padding relative" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <p className="text-primary font-mono text-sm mb-4">Kind Words</p>
          <h2 className="section-heading">
            What People <span className="gradient-text">Say</span>
          </h2>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {testimonials.map((t, index) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              className="glass-card flex flex-col rounded-2xl p-5 sm:p-6"
            >
              <Quote className="mb-4 h-7 w-7 text-primary" aria-hidden />
              <blockquote className="flex-1 text-sm text-foreground/90 sm:text-base">“{t.quote}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                {t.photo && (
                  <img src={t.photo} alt="" loading="lazy" decoding="async" className="h-10 w-10 rounded-full object-cover" />
                )}
                <div>
                  {t.link ? (
                    <a
                      href={t.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-foreground transition-colors hover:text-primary"
                    >
                      {t.name}
                    </a>
                  ) : (
                    <p className="font-semibold text-foreground">{t.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground sm:text-sm">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
