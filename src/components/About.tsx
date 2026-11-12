import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Bot, Code2, Palette, Server, Database, ShieldCheck, GitPullRequest, HeartHandshake, ExternalLink, ArrowRight, type LucideIcon } from "lucide-react";
import FeatureArt, { type FeatureArtName } from "./FeatureArt";
import TypewriterText from "@/components/TypewriterText";
import SkillIcon from "@/components/SkillIcon";
import { SkillFloor, SkillSky } from "@/components/SkillPlayground";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

/** 24 balls the panda kicks around the floor (icons only; narrow screens show as many as fit). */
const floorBalls = [
  "React", "TypeScript", "Node.js", "Next.js", "PostgreSQL", "Python", "JavaScript", "Tailwind CSS",
  "HTML5", "CSS3", "Express.js", "Django", "MongoDB", "MySQL", "Prisma", "React Native",
  "Expo", "Git", "GitHub", "Docker", "Redis", "Supabase", "Stripe", "Vercel",
];

/** The rest of the toolkit falls from the sky on balloons. */
const balloonSkills = [
  "Angular", "Vite", "Shadcn/UI", "Material UI", "Redux", "Framer Motion", "PHP", "FastAPI",
  "Neon", "Postman", "Nodemailer", "OpenAI", "Claude", "Gemini", "GitLab", "Render",
  "Visual Basic", "REST APIs", "Authentication", "OAuth", "Webhooks", "AI integrations",
];

/** Shown on the page (kept under 1,000 characters so the section fits one screen). */
const bioPreview = [
  <>
    I bridge the gap between complex technical architecture and intuitive user experiences. As a{" "}
    <strong className="font-semibold text-foreground">Software Product Engineer</strong>, I turn ideas into AI-powered digital
    products, combining full-stack rigor with a product-first mindset so every line of code serves a business goal or user need.
  </>,
  <>
    I work across the stack, from responsive React and Next.js interfaces to scalable APIs in Python, Django and FastAPI, and I
    integrate LLMs into practical applications. I don’t just write code, I solve problems: third-party integrations, database
    design and cloud deployments included.
  </>,
];

/** The full story, opened with "See more". */
const bioMore = [
  "My journey started in October 2022 as a self-employed frontend developer, building responsive interfaces with HTML, CSS, JavaScript, React and Next.js through projects like my personal portfolio, an interactive calculator and a logistics website. That grew into freelance web and full-stack development: custom web applications, APIs, databases, payment integrations and deployments for clients.",
  "In 2026 I joined Neominds EduTech as a Fullstack Developer, building web and mobile applications with React Native and Next.js. I then joined AidenAI Technologies LLP as a Full-Stack Development Intern, working on Maiukha, an AI career coach platform, where I contribute to its TypeScript migration, its move from MySQL to PostgreSQL with Prisma, and authentication security in a team of three engineers. Since August 2026 I’ve been a Software Engineer at Qorelly, the multi-vertical SaaS platform for Nigerian small and medium-sized businesses built by Core Technologies LTD.",
  "Alongside that, I lead ZoomTrans with a team of five: a smart transportation platform for the University of Ilorin, with a React Native and Expo mobile app, a web admin interface, a Node.js backend and PostgreSQL.",
  "Beyond the IDE, I’m active in Google Developer Groups and hackathons, I took part in Google Summer of Code 2026 as an open-source contributor with Joplin, and I advocate for open source and continuous learning. I value clean architecture, collaborative teams and technology with real-world impact. If you’re building something ambitious, I’d love to connect.",
];

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

  return (
    <section id="about" className="section-padding relative lg:!pt-20" ref={ref}>
      {/* On large screens the intro (heading, sky, text, cards and floor) fills exactly one screen. Measured in the
          browser, an About link leaves the section top ~1rem below the window top (content above settles after the
          jump), so 5rem of padding clears the fixed navbar and the intro takes the rest of the screen. */}
      <div className="relative lg:flex lg:h-[calc(100svh-6.5rem)] lg:min-h-[35rem] lg:flex-col">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="container relative z-10 mx-auto shrink-0 px-4 text-center sm:px-6"
        >
          <p className="text-primary font-mono text-sm mb-4 lg:mb-2">About Me</p>
          <h2 className="section-heading">
            <TypewriterText text="Passionate About " highlight="Software Development" />
          </h2>
        </motion.div>

        {/* Sky (clouds + falling balloons) behind the text and cards, down to the panda's floor */}
        <div className="relative flex flex-col lg:min-h-0 lg:flex-1">
          <SkillSky balloons={balloonSkills} layer="back" />

          <div className="container relative z-10 mx-auto grid gap-8 px-4 pb-6 pt-16 sm:px-6 lg:min-h-0 lg:flex-1 lg:grid-cols-12 lg:gap-6 lg:pb-3 lg:pt-12 xl:gap-10 xl:pt-14">
            {/* Left - Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col lg:col-span-5 lg:min-h-0"
            >
              <div className="space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg lg:space-y-3 lg:text-sm xl:text-[0.95rem] 2xl:text-base">
                {bioPreview.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full text-sm font-semibold text-primary hover:underline md:text-base lg:mt-2 lg:text-sm"
                  >
                    See more <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-h-[85svh] max-w-2xl overflow-y-auto rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">About Me</DialogTitle>
                    <DialogDescription>Full-Stack Product &amp; AI Engineer · Lagos, Nigeria</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
                    {bioPreview.map((paragraph, i) => (
                      <p key={`p${i}`}>{paragraph}</p>
                    ))}
                    {bioMore.map((paragraph, i) => (
                      <p key={`m${i}`}>{paragraph}</p>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>

            {/* Right - Feature Cards */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:gap-4 lg:col-span-7 lg:min-h-0 lg:grid-cols-3 lg:grid-rows-2 lg:gap-3 xl:gap-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  // No backdrop blur here: balloons, birds and rain move behind these cards, and re-blurring that
                  // every frame is the most expensive thing on the page. A near-opaque background reads the same.
                  className="glass-card relative overflow-hidden rounded-xl p-5 sm:p-6 group flex flex-col lg:min-h-0 lg:p-4 xl:p-5 transition-colors duration-300 hover:border-primary/40 [backdrop-filter:none] [-webkit-backdrop-filter:none] !bg-background/90 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.07]"
                >
                  <FeatureArt name={feature.art} />
                  <div className="relative w-12 h-12 lg:w-10 lg:h-10 xl:w-11 xl:h-11 rounded-lg bg-primary/10 backdrop-blur-sm flex items-center justify-center mb-4 lg:mb-2 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-6 h-6 lg:w-5 lg:h-5 text-primary" />
                  </div>
                  <h3 className="relative mt-auto font-semibold text-foreground mb-1.5 lg:mb-1 lg:text-sm xl:text-base">
                    {feature.title}
                  </h3>
                  <p className="relative text-muted-foreground text-sm leading-relaxed lg:text-xs xl:text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Panda floor: full section width */}
          <div className="relative z-10 shrink-0">
            <span className="absolute left-4 top-0 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground sm:left-6">
              Core Toolkit
            </span>
            <SkillFloor balls={floorBalls} className="h-24 lg:h-20 xl:h-24" />
          </div>

          {/* Balloons and birds that pass in front of the text and cards (clicks go through to the content) */}
          <div className="pointer-events-none absolute inset-0 z-20">
            <SkillSky balloons={balloonSkills} layer="front" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6">

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
              <TypewriterText text="Open Source & " highlight="Community Advocacy" />
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[0.7rem] font-mono bg-primary/10 text-primary border border-primary/20"
                  >
                    <SkillIcon name={tag} className="h-3 w-3" brandColor={false} />
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[0.7rem] font-mono bg-accent/10 text-accent border border-accent/20"
                  >
                    <SkillIcon name={tag} className="h-3 w-3" brandColor={false} />
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


