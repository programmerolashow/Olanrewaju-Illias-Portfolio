import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Bot, Code2, Palette, Server, Database, ShieldCheck, GitPullRequest, HeartHandshake, ExternalLink, type LucideIcon } from "lucide-react";
import FeatureArt, { type FeatureArtName } from "./FeatureArt";

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

// Brand colour per skill chip. `rgb` drives the tint, border and glow; `text` is the dark-mode label colour.
// In light mode the label is a deeper shade of `rgb` (see .skill-chip in index.css), or `lightText` when set.
const skillColorMap: Record<string, { rgb: string; text: string; lightText?: string }> = {
  "HTML5": { rgb: "228, 77, 38", text: "#FF7A59" },
  "CSS3": { rgb: "38, 77, 228", text: "#60A5FA" },
  "JavaScript": { rgb: "234, 179, 8", text: "#FACC15", lightText: "#A16207" },
  "TypeScript": { rgb: "49, 120, 198", text: "#38BDF8" },
  "React": { rgb: "97, 218, 251", text: "#22D3EE", lightText: "#0E7490" },
  "Next.js": { rgb: "148, 163, 184", text: "#F8FAFC" },
  "Angular": { rgb: "221, 0, 49", text: "#F87171" },
  "Vite": { rgb: "100, 108, 255", text: "#818CF8" },
  "Tailwind CSS": { rgb: "6, 182, 212", text: "#2DD4BF" },
  "Shadcn/UI": { rgb: "14, 165, 233", text: "#7DD3FC" },
  "Material UI": { rgb: "0, 127, 255", text: "#60A5FA" },
  "Redux": { rgb: "118, 74, 188", text: "#C084FC" },
  "Framer Motion": { rgb: "255, 0, 128", text: "#F472B6" },

  "Node.js": { rgb: "95, 160, 78", text: "#4ADE80" },
  "Express.js": { rgb: "202, 138, 4", text: "#FDE047", lightText: "#854D0E" },
  "Python": { rgb: "55, 118, 171", text: "#FCD34D", lightText: "#2B5B84" },
  "Django": { rgb: "43, 138, 89", text: "#4ADE80" },
  "PHP": { rgb: "119, 123, 179", text: "#A5B4FC" },

  "PostgreSQL": { rgb: "65, 105, 225", text: "#93C5FD" },
  "MySQL": { rgb: "0, 117, 143", text: "#38BDF8" },
  "MongoDB": { rgb: "71, 162, 72", text: "#34D399" },
  "Prisma": { rgb: "90, 103, 216", text: "#818CF8" },
  "Neon": { rgb: "0, 229, 153", text: "#34D399", lightText: "#047857" },

  "React Native": { rgb: "0, 129, 200", text: "#38BDF8" },
  "Expo": { rgb: "168, 85, 247", text: "#C084FC" },

  "Git": { rgb: "240, 80, 50", text: "#FB923C" },
  "GitHub": { rgb: "148, 163, 184", text: "#F8FAFC" },
  "Postman": { rgb: "255, 108, 55", text: "#F97316" },
  "Stripe": { rgb: "99, 91, 255", text: "#A5B4FC" },
  "Nodemailer": { rgb: "34, 197, 94", text: "#86EFAC" },
  "Supabase": { rgb: "62, 207, 142", text: "#4ADE80", lightText: "#15803D" },
  "OpenAI": { rgb: "16, 163, 127", text: "#2DD4BF" },

  "Visual Basic": { rgb: "147, 51, 234", text: "#D8B4FE" },
  "REST APIs": { rgb: "14, 165, 233", text: "#38BDF8" },
  "Authentication": { rgb: "236, 72, 153", text: "#F472B6" },
  "OAuth": { rgb: "168, 85, 247", text: "#E9D5FF" },
  "Webhooks": { rgb: "245, 158, 11", text: "#FCD34D", lightText: "#B45309" },
  "AI integrations": { rgb: "139, 92, 246", text: "#C4B5FD" },
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

const features: { icon: LucideIcon; title: string; art: FeatureArtName; description: string }[] = [
  {
    icon: Code2,
    title: "Full-Stack Delivery",
    art: "fullstack",
    description: "Owning features end to end, from UI to API to database.",
  },
  {
    icon: Bot,
    title: "AI Integration",
    art: "ai",
    description: "LLM features with solid prompts, context and validation.",
  },
  {
    icon: Palette,
    title: "UI/UX Implementation",
    art: "uiux",
    description: "Responsive, accessible interfaces with purposeful motion.",
  },
  {
    icon: Server,
    title: "APIs & Auth",
    art: "api",
    description: "Secure REST APIs, JWT/Clerk auth and integrations.",
  },
  {
    icon: Database,
    title: "Data & Modernization",
    art: "data",
    description: "Schema design, migrations and upgrading legacy code.",
  },
  {
    icon: ShieldCheck,
    title: "Quality & CI/CD",
    art: "quality",
    description: "Testing, type checks, reviews and GitLab pipelines.",
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
    <section id="about" className="section-padding relative" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <p className="text-primary font-mono text-sm mb-4">About Me</p>
          <h2 className="section-heading">
            Passionate About{" "}
            <span className="gradient-text">Software Development</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 xl:gap-16 items-center lg:items-stretch">
          {/* Left Side - Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-5 md:mb-6">
              I bridge the gap between complex technical architecture and intuitive user experiences. As a <strong className="text-foreground font-semibold">Software Product Engineer</strong>, I turn ideas into AI-powered digital products, combining full-stack rigor with a product-first mindset so every line of code serves a business goal or user need.
            </p>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-5 md:mb-6">
              I work across the stack, from responsive React and Next.js interfaces to scalable APIs in Python, Django and FastAPI, and I integrate LLMs into practical applications. I don’t just write code, I solve problems: third-party integrations, database design and cloud deployments included.
            </p>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6 md:mb-8">
              Beyond the IDE, I’m active in Google Developer Groups and hackathons, and I advocate for open source and continuous learning. I value clean architecture, collaborative teams and technology with real-world impact. If you’re building something ambitious, I’d love to connect.
            </p>

            {/* Skills Floor Area with Depth-Sequenced 1.5s Staggered Throw Physics */}
            <div className="space-y-3">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest block">
                Core Toolkit <span className="normal-case tracking-normal text-muted-foreground/70">(hover to toss)</span>
              </span>

              <div 
                className="relative min-h-[17rem] sm:min-h-[20rem] py-6 px-2 sm:px-4 bg-transparent border-none flex flex-wrap gap-2.5 sm:gap-4 items-end justify-center select-none overflow-visible z-20"
                onMouseEnter={triggerThrowAnimation}
              >
                {skills.map((skill, index) => {
                  const style = skillColorMap[skill] || {
                    rgb: "14, 165, 233",
                    text: "#38BDF8",
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
                      style={
                        {
                          "--chip-rgb": style.rgb,
                          "--chip-text-dark": style.text,
                          ...(style.lightText ? { "--chip-text-light": style.lightText } : {}),
                        } as React.CSSProperties
                      }
                      className="skill-chip inline-flex items-center justify-center rounded-full border px-3.5 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm xl:px-6 xl:py-3 font-semibold cursor-pointer select-none whitespace-nowrap tracking-wide leading-none transition-shadow duration-300"
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
            className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 lg:h-full lg:auto-rows-fr"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card relative overflow-hidden rounded-xl p-5 sm:p-6 group flex flex-col lg:p-7 transition-colors duration-300 hover:border-primary/40 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.07] dark:bg-none"
              >
                <FeatureArt name={feature.art} />
                <div className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-lg bg-primary/10 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-6 h-6 lg:w-7 lg:h-7 text-primary" />
                </div>
                <h3 className="relative mt-auto font-semibold text-foreground mb-2 lg:text-lg">
                  {feature.title}
                </h3>
                <p className="relative text-muted-foreground text-sm lg:text-base leading-relaxed">
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
          className="mt-14 pt-12 md:mt-20 md:pt-16 border-t border-border/50"
        >
          <div className="text-center mb-8 md:mb-12">
            <span className="text-xs font-mono text-primary uppercase tracking-widest block mb-2">
              Impact & Ecosystems
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              Open Source & <span className="gradient-text">Community Advocacy</span>
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-5 md:gap-6 xl:gap-8">
            {/* Card 1: GSoC 2026 & Joplin */}
            <motion.div
              whileHover={{ y: -6 }}
              className="glass-card rounded-2xl p-5 sm:p-6 md:p-8 relative overflow-hidden border border-border/80 hover:border-primary/50 transition-all duration-300 shadow-xl group flex flex-col justify-between"
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
                    className="px-2.5 py-1 rounded-md text-[0.7rem] font-mono bg-primary/10 text-primary border border-primary/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Card 2: Tech Community Builder & Advocate */}
            <motion.div
              whileHover={{ y: -6 }}
              className="glass-card rounded-2xl p-5 sm:p-6 md:p-8 relative overflow-hidden border border-border/80 hover:border-accent/50 transition-all duration-300 shadow-xl group flex flex-col justify-between"
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
                    className="px-2.5 py-1 rounded-md text-[0.7rem] font-mono bg-accent/10 text-accent border border-accent/20"
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


