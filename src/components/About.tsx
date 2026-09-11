import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Code2, Palette, Zap, Globe, Server, Database, GitPullRequest, HeartHandshake, ExternalLink } from "lucide-react";

const skills = [
  // Frontend
  "HTML5", "CSS3", "JavaScript", "TypeScript", "React", "Next.js", "Angular", "Vite", "Tailwind CSS", "Shadcn/UI", "Material UI", "Redux", "Framer Motion",
  // Backend
  "Node.js", "Express.js", "Python", "Django", "PHP",
  // Databases
  "PostgreSQL", "MySQL", "MongoDB", "Prisma", "Neon",
  // Mobile
  "React Native", "Expo",
  // Tools / APIs
  "Git", "GitHub", "Postman", "Stripe", "Nodemailer", "Supabase", "OpenAI",
  // Other
  "Visual Basic", "REST APIs", "Authentication", "OAuth", "Webhooks", "AI integrations"
];

// Unique vibrant color themes for each skill card to ensure high visual distinction and crisp text legibility
const skillColorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  "HTML5": { bg: "rgba(228, 77, 38, 0.22)", border: "rgba(228, 77, 38, 0.7)", text: "#FF7A59", glow: "0 6px 22px rgba(228, 77, 38, 0.4)" },
  "CSS3": { bg: "rgba(38, 77, 228, 0.22)", border: "rgba(38, 77, 228, 0.7)", text: "#60A5FA", glow: "0 6px 22px rgba(38, 77, 228, 0.4)" },
  "JavaScript": { bg: "rgba(247, 223, 30, 0.22)", border: "rgba(247, 223, 30, 0.7)", text: "#FACC15", glow: "0 6px 22px rgba(247, 223, 30, 0.4)" },
  "TypeScript": { bg: "rgba(49, 120, 198, 0.22)", border: "rgba(49, 120, 198, 0.7)", text: "#38BDF8", glow: "0 6px 22px rgba(49, 120, 198, 0.4)" },
  "React": { bg: "rgba(97, 218, 251, 0.22)", border: "rgba(97, 218, 251, 0.7)", text: "#22D3EE", glow: "0 6px 22px rgba(97, 218, 251, 0.4)" },
  "Next.js": { bg: "rgba(255, 255, 255, 0.22)", border: "rgba(255, 255, 255, 0.7)", text: "#FFFFFF", glow: "0 6px 22px rgba(255, 255, 255, 0.35)" },
  "Angular": { bg: "rgba(221, 0, 49, 0.22)", border: "rgba(221, 0, 49, 0.7)", text: "#F87171", glow: "0 6px 22px rgba(221, 0, 49, 0.4)" },
  "Vite": { bg: "rgba(100, 108, 255, 0.22)", border: "rgba(100, 108, 255, 0.7)", text: "#818CF8", glow: "0 6px 22px rgba(100, 108, 255, 0.4)" },
  "Tailwind CSS": { bg: "rgba(6, 182, 212, 0.22)", border: "rgba(6, 182, 212, 0.7)", text: "#2DD4BF", glow: "0 6px 22px rgba(6, 182, 212, 0.4)" },
  "Shadcn/UI": { bg: "rgba(14, 165, 233, 0.22)", border: "rgba(14, 165, 233, 0.7)", text: "#7DD3FC", glow: "0 6px 22px rgba(14, 165, 233, 0.4)" },
  "Material UI": { bg: "rgba(0, 127, 255, 0.22)", border: "rgba(0, 127, 255, 0.7)", text: "#60A5FA", glow: "0 6px 22px rgba(0, 127, 255, 0.4)" },
  "Redux": { bg: "rgba(118, 74, 188, 0.22)", border: "rgba(118, 74, 188, 0.7)", text: "#C084FC", glow: "0 6px 22px rgba(118, 74, 188, 0.4)" },
  "Framer Motion": { bg: "rgba(255, 0, 128, 0.22)", border: "rgba(255, 0, 128, 0.7)", text: "#F472B6", glow: "0 6px 22px rgba(255, 0, 128, 0.4)" },

  "Node.js": { bg: "rgba(95, 160, 78, 0.22)", border: "rgba(95, 160, 78, 0.7)", text: "#4ADE80", glow: "0 6px 22px rgba(95, 160, 78, 0.4)" },
  "Express.js": { bg: "rgba(234, 179, 8, 0.22)", border: "rgba(234, 179, 8, 0.7)", text: "#FDE047", glow: "0 6px 22px rgba(234, 179, 8, 0.4)" },
  "Python": { bg: "rgba(55, 118, 171, 0.22)", border: "rgba(55, 118, 171, 0.7)", text: "#FCD34D", glow: "0 6px 22px rgba(55, 118, 171, 0.4)" },
  "Django": { bg: "rgba(9, 76, 50, 0.25)", border: "rgba(43, 138, 89, 0.7)", text: "#4ADE80", glow: "0 6px 22px rgba(43, 138, 89, 0.4)" },
  "PHP": { bg: "rgba(119, 123, 179, 0.22)", border: "rgba(119, 123, 179, 0.7)", text: "#A5B4FC", glow: "0 6px 22px rgba(119, 123, 179, 0.4)" },

  "PostgreSQL": { bg: "rgba(65, 105, 225, 0.22)", border: "rgba(65, 105, 225, 0.7)", text: "#93C5FD", glow: "0 6px 22px rgba(65, 105, 225, 0.4)" },
  "MySQL": { bg: "rgba(0, 117, 143, 0.22)", border: "rgba(0, 117, 143, 0.7)", text: "#38BDF8", glow: "0 6px 22px rgba(0, 117, 143, 0.4)" },
  "MongoDB": { bg: "rgba(71, 162, 72, 0.22)", border: "rgba(71, 162, 72, 0.7)", text: "#34D399", glow: "0 6px 22px rgba(71, 162, 72, 0.4)" },
  "Prisma": { bg: "rgba(90, 103, 216, 0.22)", border: "rgba(90, 103, 216, 0.7)", text: "#818CF8", glow: "0 6px 22px rgba(90, 103, 216, 0.4)" },
  "Neon": { bg: "rgba(0, 229, 153, 0.22)", border: "rgba(0, 229, 153, 0.7)", text: "#34D399", glow: "0 6px 22px rgba(0, 229, 153, 0.4)" },

  "React Native": { bg: "rgba(0, 129, 200, 0.22)", border: "rgba(0, 129, 200, 0.7)", text: "#38BDF8", glow: "0 6px 22px rgba(0, 129, 200, 0.4)" },
  "Expo": { bg: "rgba(168, 85, 247, 0.22)", border: "rgba(168, 85, 247, 0.7)", text: "#C084FC", glow: "0 6px 22px rgba(168, 85, 247, 0.4)" },

  "Git": { bg: "rgba(240, 80, 50, 0.22)", border: "rgba(240, 80, 50, 0.7)", text: "#FB923C", glow: "0 6px 22px rgba(240, 80, 50, 0.4)" },
  "GitHub": { bg: "rgba(168, 85, 247, 0.22)", border: "rgba(168, 85, 247, 0.7)", text: "#E9D5FF", glow: "0 6px 22px rgba(168, 85, 247, 0.4)" },
  "Postman": { bg: "rgba(255, 108, 55, 0.22)", border: "rgba(255, 108, 55, 0.7)", text: "#F97316", glow: "0 6px 22px rgba(255, 108, 55, 0.4)" },
  "Stripe": { bg: "rgba(99, 91, 255, 0.22)", border: "rgba(99, 91, 255, 0.7)", text: "#A5B4FC", glow: "0 6px 22px rgba(99, 91, 255, 0.4)" },
  "Nodemailer": { bg: "rgba(34, 197, 94, 0.22)", border: "rgba(34, 197, 94, 0.7)", text: "#86EFAC", glow: "0 6px 22px rgba(34, 197, 94, 0.4)" },
  "Supabase": { bg: "rgba(62, 207, 142, 0.22)", border: "rgba(62, 207, 142, 0.7)", text: "#4ADE80", glow: "0 6px 22px rgba(62, 207, 142, 0.4)" },
  "OpenAI": { bg: "rgba(16, 163, 127, 0.22)", border: "rgba(16, 163, 127, 0.7)", text: "#2DD4BF", glow: "0 6px 22px rgba(16, 163, 127, 0.4)" },

  "Visual Basic": { bg: "rgba(147, 51, 234, 0.22)", border: "rgba(147, 51, 234, 0.7)", text: "#D8B4FE", glow: "0 6px 22px rgba(147, 51, 234, 0.4)" },
  "REST APIs": { bg: "rgba(14, 165, 233, 0.22)", border: "rgba(14, 165, 233, 0.7)", text: "#38BDF8", glow: "0 6px 22px rgba(14, 165, 233, 0.4)" },
  "Authentication": { bg: "rgba(236, 72, 153, 0.22)", border: "rgba(236, 72, 153, 0.7)", text: "#F472B6", glow: "0 6px 22px rgba(236, 72, 153, 0.4)" },
  "OAuth": { bg: "rgba(168, 85, 247, 0.22)", border: "rgba(168, 85, 247, 0.7)", text: "#E9D5FF", glow: "0 6px 22px rgba(168, 85, 247, 0.4)" },
  "Webhooks": { bg: "rgba(245, 158, 11, 0.22)", border: "rgba(245, 158, 11, 0.7)", text: "#FCD34D", glow: "0 6px 22px rgba(245, 158, 11, 0.4)" },
  "AI integrations": { bg: "rgba(187, 94, 48, 0.22)", border: "rgba(187, 94, 48, 0.7)", text: "#38BDF8", glow: "0 6px 22px rgba(187, 94, 48, 0.4)" },
};

// Floor resting scatter positions (partially resting at the bottom/floor area)
const seedPositions = [
  { x: -28, y: 35, rotate: -14, scale: 0.96 },
  { x: 36, y: 42, rotate: 12, scale: 1.02 },
  { x: -48, y: 28, rotate: -8, scale: 0.98 },
  { x: 18, y: 52, rotate: 18, scale: 1.05 },
  { x: 55, y: 38, rotate: -15, scale: 0.93 },
  { x: -16, y: 48, rotate: 6, scale: 1.01 },
  { x: 42, y: 32, rotate: -20, scale: 0.97 },
  { x: -52, y: 45, rotate: 15, scale: 1.04 },
  { x: 8, y: 30, rotate: -5, scale: 0.97 },
  { x: 58, y: 50, rotate: 10, scale: 0.94 },
  { x: -36, y: 25, rotate: -16, scale: 1.03 },
  { x: 24, y: 40, rotate: 14, scale: 0.95 },
  { x: -62, y: 36, rotate: -10, scale: 1.01 },
  { x: 48, y: 48, rotate: 8, scale: 0.99 },
  { x: -8, y: 22, rotate: -12, scale: 1.02 },
  { x: 32, y: 34, rotate: 19, scale: 0.96 },
  { x: -42, y: 55, rotate: -7, scale: 1.04 },
  { x: 62, y: 28, rotate: 11, scale: 0.92 },
  { x: -22, y: 42, rotate: -18, scale: 1.03 },
  { x: 12, y: 26, rotate: 5, scale: 0.98 },
  { x: 45, y: 46, rotate: -14, scale: 0.96 },
  { x: -58, y: 32, rotate: 13, scale: 1.02 },
  { x: 20, y: 38, rotate: -9, scale: 0.97 },
  { x: -32, y: 50, rotate: 17, scale: 1.04 },
  { x: 52, y: 24, rotate: -11, scale: 0.94 },
  { x: -12, y: 44, rotate: 7, scale: 1.01 },
];

const scatterPositions = Array.from({ length: skills.length }, (_, i) => {
  const s = seedPositions[i % seedPositions.length];
  return {
    x: s.x,
    y: s.y,
    rotate: s.rotate,
    scale: s.scale,
    zIndex: i + 1,
  };
});

const features = [
  {
    icon: Code2,
    title: "Clean Code",
    description: "Writing maintainable, scalable, and well-documented code.",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description: "Creating intuitive and visually appealing interfaces.",
  },
  {
    icon: Zap,
    title: "Performance",
    description: "Optimizing for speed and best user experience.",
  },
  {
    icon: Globe,
    title: "Responsive",
    description: "Building websites that work seamlessly across all devices.",
  },
  {
    icon: Server,
    title: "Backend Development",
    description: "Building secure, scalable APIs and server-side systems.",
  },
  {
    icon: Database,
    title: "Database Management",
    description: "Designing and managing efficient, structured data systems.",
  },
];

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isThrown, setIsThrown] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerThrowAnimation = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsThrown(true);
    // 1.5s total cascade delay window + 6.0s animation duration = 7.5s loop window
    timerRef.current = setTimeout(() => {
      setIsThrown(false);
    }, 7500);
  };

  return (
    <section id="about" className="py-32 relative" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-mono text-sm mb-4">About Me</p>
          <h2 className="section-heading">
            Passionate About{" "}
            <span className="gradient-text">Software Development</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              I specialize in building scalable web and mobile applications with clean, efficient, and maintainable code. I focus on crafting responsive, high-performance user experiences using modern technologies across the entire stack, from intuitive frontends to robust backend systems. I enjoy turning complex ideas into practical, scalable, and user-focused digital solutions.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              I’m driven by curiosity and a commitment to excellence. I constantly explore new technologies, embrace challenges, and stay updated with industry best practices to deliver cutting-edge solutions that make a difference.
              cutting-edge solutions.
            </p>

            {/* Skills Floor Area with Depth-Sequenced 1.5s Staggered Throw Physics */}
            <div className="space-y-3">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest block">
                Technical Expertise
              </span>

              <div 
                className="relative min-h-[320px] py-6 px-4 bg-transparent border-none flex flex-wrap gap-4 items-end justify-center select-none overflow-visible z-20"
                onMouseEnter={triggerThrowAnimation}
              >
                {skills.map((skill, index) => {
                  const style = skillColorMap[skill] || {
                    bg: "rgba(187, 94, 48, 0.22)",
                    border: "rgba(187, 94, 48, 0.7)",
                    text: "#38BDF8",
                    glow: "0 6px 22px rgba(187, 94, 48, 0.4)"
                  };
                  const scatter = scatterPositions[index % scatterPositions.length];
                  
                  // Calculate launch delay based on card depth (zIndex):
                  // Cards at the back (lower zIndex) launch first, front cards follow over a 1.5s delay window
                  const maxZ = skills.length;
                  const zDelay = ((scatter.zIndex - 1) / (maxZ - 1)) * 1.5;

                  return (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, y: 100, scale: 0.7 }}
                      animate={
                        isInView
                          ? isThrown
                            ? {
                                opacity: 1,
                                y: [scatter.y, scatter.y - 160, scatter.y - 180, scatter.y - 90, scatter.y],
                                x: [scatter.x, scatter.x + 25, scatter.x - 20, scatter.x + 10, scatter.x],
                                rotate: [scatter.rotate, scatter.rotate - 35, scatter.rotate + 45, scatter.rotate - 15, scatter.rotate],
                                scale: [scatter.scale, 1.15, 1.25, 1.08, scatter.scale],
                                zIndex: [scatter.zIndex, 40, 50, 30, scatter.zIndex],
                              }
                            : { 
                                opacity: 1, 
                                x: scatter.x, 
                                y: scatter.y, 
                                rotate: scatter.rotate, 
                                scale: scatter.scale, 
                                zIndex: scatter.zIndex 
                              }
                          : {}
                      }
                      transition={
                        isThrown
                          ? {
                              duration: 6,
                              ease: "easeInOut",
                              delay: zDelay,
                            }
                          : {
                              type: "spring",
                              stiffness: 180,
                              damping: 18,
                              mass: 0.9,
                              delay: isInView ? 0.2 + index * 0.025 : 0,
                            }
                      }
                      onMouseEnter={triggerThrowAnimation}
                      style={{
                        backgroundColor: style.bg,
                        borderColor: style.border,
                        color: style.text,
                        boxShadow: style.glow,
                      }}
                      className="inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-semibold shadow-xl backdrop-blur-md cursor-pointer select-none whitespace-nowrap tracking-wide leading-none transition-shadow duration-300"
                    >
                      {skill}
                    </motion.span>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Right Side - Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 gap-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card rounded-xl p-6 group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Open Source & Community Advocacy Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 pt-16 border-t border-border/50"
        >
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-primary uppercase tracking-widest block mb-2">
              Impact & Ecosystems
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              Open Source & <span className="gradient-text">Community Advocacy</span>
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1: GSoC 2026 & Joplin */}
            <motion.div
              whileHover={{ y: -6 }}
              className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden border border-border/80 hover:border-primary/50 transition-all duration-300 shadow-xl group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                      <GitPullRequest className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                        Google Summer of Code (GSoC) 2026
                      </h4>
                      <p className="text-xs font-mono text-primary/90 font-medium">
                        Contributor @ Joplin & Open-Source Ecosystems
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://discourse.joplinapp.org/t/welcome-to-gsoc-2026-with-joplin/48974/64"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-secondary/80 text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                    aria-label="View Joplin Discourse GSoC Announcement"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Participated as an open-source contributor with the note-taking application{" "}
                  <a
                    href="https://discourse.joplinapp.org/t/welcome-to-gsoc-2026-with-joplin/48974/64"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                  >
                    Joplin <ExternalLink className="w-3 h-3 inline" />
                  </a>
                  . Actively engaged with open-source ecosystems like <strong>Moose</strong>, driving exploration in AST meta-modelling, static site generation, and fault localization.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-border/40 mt-4">
                {["GSoC 2026", "Joplin Open-Source", "Moose Ecosystem", "AST Meta-Modelling", "Static Site Generation", "Fault Localization"].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-primary/10 text-primary border border-primary/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Card 2: Tech Community Builder & Advocate */}
            <motion.div
              whileHover={{ y: -6 }}
              className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden border border-border/80 hover:border-accent/50 transition-all duration-300 shadow-xl group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors">
                    <HeartHandshake className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-lg group-hover:text-accent transition-colors">
                      Tech Community Builder & Advocate
                    </h4>
                    <p className="text-xs font-mono text-accent/90 font-medium">
                      Engineering Principles over Tutorial Reliance
                    </p>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Frequently advocates for robust software engineering fundamentals over tutorial-reliant learning. Regularly publishes insights regarding deep debugging, code execution flow, structural fintech logic, and developer community empowerment.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-border/40 mt-4">
                {["Engineering Principles", "Deep Debugging", "Code Execution Flow", "Fintech Logic", "Developer Community"].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-accent/10 text-accent border border-accent/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;


