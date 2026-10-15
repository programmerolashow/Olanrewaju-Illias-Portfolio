import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Github, Gitlab, Linkedin, Mail, Briefcase, GraduationCap, MapPin, Sparkles } from "lucide-react";
const gdg = "/image.jpeg";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-20"
    >
      {/* Background Radial Glow Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -right-1/2 w-full h-full opacity-20"
          style={{
            background: "radial-gradient(circle, hsl(187 94% 48% / 0.3) 0%, transparent 60%)",
          }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full opacity-20"
          style={{
            background: "radial-gradient(circle, hsl(280 85% 65% / 0.3) 0%, transparent 60%)",
          }}
        />
      </div>

      <div className="container mx-auto px-5 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Avatar Profile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative inline-block mt-16 mb-8"
          >
            <img
              src={gdg}
              alt="Olanrewaju Illias"
              className="w-48 h-48 md:w-56 md:h-56 rounded-full object-cover border-4 border-primary/30 shadow-[0_0_40px_rgba(56,189,248,0.3)] mx-auto block"
            />
            <div className="absolute -bottom-2 right-4 bg-background border border-primary/40 rounded-full px-3 py-1 text-xs font-mono font-medium text-primary flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Available for Opportunities
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-primary font-mono text-sm md:text-base mb-3"
          >
            Hello, I'm
          </motion.p>

          {/* Full Name & AKA Alias */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-3 text-foreground"
          >
            Olanrewaju Illias
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/80 border border-border text-xs md:text-sm font-mono text-muted-foreground mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Also Known as <strong className="text-foreground font-semibold">Programmer Olashow</strong></span>
          </motion.div>

          {/* Multi-Role Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 max-w-3xl mx-auto"
          >
            <p className="text-xl md:text-3xl lg:text-4xl font-bold gradient-text leading-snug mb-3">
              Full-Stack Product Engineer
            </p>
            <p className="text-sm md:text-lg text-muted-foreground leading-relaxed">
              I build full-stack products end to end and bring AI into them where it actually helps.
              <span className="block mt-1 font-mono text-xs md:text-sm text-foreground/70">
                AI Application Engineering · Open Source · Developer Community
              </span>
            </p>
          </motion.div>

          {/* Key Meta Badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-10 text-xs md:text-sm"
          >
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card border border-border/80 text-foreground/90 font-medium">
              <Briefcase className="w-4 h-4 text-primary shrink-0" />
              <span>Software Engineer at <strong className="text-primary font-semibold">Qorelly</strong></span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card border border-border/80 text-foreground/90 font-medium">
              <GraduationCap className="w-4 h-4 text-accent shrink-0" />
              <span>University of Ilorin</span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card border border-border/80 text-foreground/90 font-medium">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Lagos State, Nigeria</span>
            </div>
          </motion.div>

          {/* Calls to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
          >
            <motion.a
              href="#projects"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              View My Work
              <ArrowRight className="w-4 h-4" />
            </motion.a>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-7 py-3 font-semibold text-foreground hover:border-primary hover:text-primary transition-colors"
            >
              Let's Talk
            </motion.a>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex items-center justify-center gap-4 md:gap-6 mb-16"
          >
            {[
              { icon: Github, href: "https://github.com/programmerolashow", label: "GitHub" },
              { icon: Gitlab, href: "https://gitlab.com/olanrewajuillias", label: "GitLab" },
              { icon: Linkedin, href: "https://www.linkedin.com/in/olanrewaju-illias-993a982bb", label: "LinkedIn" },
              { icon: Mail, href: "mailto:olanrewajuillias@gmail.com", label: "Email" },
            ].map(({ icon: Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="p-3.5 rounded-full border border-border bg-secondary/60 text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300 shadow-md"
                aria-label={label}
              >
                <Icon size={22} />
              </motion.a>
            ))}
          </motion.div>

          {/* Scroll Down Indicator */}
          <motion.a
            href="#about"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{
              opacity: { delay: 0.5 },
              y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
            }}
            className="inline-flex flex-col items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="text-xs font-mono mb-2">Scroll Down</span>
            <ArrowDown size={18} />
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default Hero;

