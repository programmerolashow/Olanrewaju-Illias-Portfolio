import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, Github, Folder } from "lucide-react";

const projects = [
  {
    title: "HomeKit Admin Dashboard",
    description:
      "An admin dashboard that enables admins to manage users, products, and analytics efficiently. Features include user/product search, dynamic data handling, and responsive design. This project strengthened my skills in scalable React apps, reusable components, TypeScript, and building real-world interactive web applications.",
    tags: ["React.js", "TypeScript", "Tailwind CSS", "Vite"],
    github: "https://github.com/programmerolashow/HomeKit-Admin-Dashboard",
    live: "https://homekit-admin-dashboard.netlify.app",
    featured: true,
  },
  {
    title: "Stream-Central",
    description:
      "A modern web application inspired by Netflix. It allows users to explore movies and TV shows through a clean, responsive, and interactive interface. This project improved my skills in UI design, component structuring, responsiveness, and building smooth user experiences.",
    tags: ["React.js", "Tailwind CSS", "TypeScript", "Vite"],
    github: "https://github.com/programmerolashow/stream-central",
    live: "https://stream-central-three.vercel.app/",
    featured: true,
  },
  {
    title: "VidMage - Personality Generator",
    description: "an intelligent personality analysis and generation platform that leverages advanced AI to interpret facial expressions, body language, and visual style cues from user-provided images. The platform transforms visual data into meaningful personality insights, offering users a unique, interactive, and engaging experienc",
    tags: ["React.js", "Tailwind CSS", "TypeScript", "Lovable"],
    github: "https://github.com/programmerolashow/VidMage",
    live: "https://vid-mage.vercel.app",
    featured: true,
  },
  {
    title: "Xiamine Cargo",
    description:
      "Xiamine Cargo is a frontend web project focused on building a modern, responsive logistics website with a strong emphasis on clean UI structure and reusable design patterns. The project showcases a well-structured Home Page and an in-progress Service Page, designed to clearly communicate logistics services while maintaining visual clarity and performance.",
    tags: ["HTML5", "CSS3", "JavaScript"],
    github: "https://github.com/programmerolashow/Xiamine-Cargo",
    live: "https://xiamine-cargo-w.netlify.app",
    featured: true,
  },
  {
    title: "Simple Portfolio Template",
    description:
      "This project is a fully responsive personal portfolio website built to showcase my skills, projects, and professional profile as a frontend developer. The goal was to create a clean, modern interface that feels engaging while remaining simple, accessible, and performance-focused.",
    tags: ["HTML5","CSS3"],
    github: "https://github.com/programmerolashow/My-Portfolio",
    live: "https://illias-portfolio.netlify.app",
    featured: false,
  },
  {
    title: "BuyIT",
    description:
      "e-commerce site is fully responsive, sleek, and optimized for a smooth user experience. From clean UI to seamless functionality, I focused on turning design ideas into a real, interactive platform.",
    tags: ["React.js", "Tailwind CSS", "TypeScript"],
    github: "https://github.com/programmerolashow/shop-insights-hub",
    live: "https://shop-insights-hub.vercel.app",
    featured: false,
  },
  {
    title: "Simple Calculator",
    description:
      "This project is a responsive, modern calculator built using HTML, CSS, and JavaScript, designed to combine clean functionality with a visually engaging glassmorphism UI. The goal was to move beyond a basic calculator and focus on user experience, responsiveness, and interactive feedback.",
    tags: ["JavaScript", "REST API", "CSS Grid"],
    github: "https://github.com/programmerolashow/Simple-Calculator",
    live: "https://calculator-web-ap.netlify.app",
    featured: false,
  },
];

const Projects = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="projects" className="py-32 relative" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-mono text-sm mb-4">My Work</p>
          <h2 className="section-heading">
            Featured <span className="gradient-text">Projects</span>
          </h2>
        </motion.div>

        {/* Featured Projects */}
        <div className="grid gap-8 mb-16">
          {projects
            .filter((p) => p.featured)
            .map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="project-card group"
              >
                <div className="p-8 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                    <div>
                      <p className="text-primary font-mono text-sm mb-2">
                        Featured Project
                      </p>
                      <h3 className="text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                    </div>
                    <div className="flex gap-4">
                      <motion.a
                        href={project.github}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="View on GitHub"
                      >
                        <Github size={22} />
                      </motion.a>
                      <motion.a
                        href={project.live}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="View live site"
                      >
                        <ExternalLink size={22} />
                      </motion.a>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-lg mb-6 max-w-2xl">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-sm font-mono text-primary bg-primary/10 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
        </div>

        {/* Other Projects Grid */}
        <motion.h3
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-2xl font-bold text-center mb-8"
        >
          Other Noteworthy Projects
        </motion.h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects
            .filter((p) => !p.featured)
            .map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -8 }}
                className="glass-card rounded-xl p-6 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <Folder className="w-10 h-10 text-primary" />
                  <div className="flex gap-3">
                    <a
                      href={project.github}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="View on GitHub"
                    >
                      <Github size={20} />
                    </a>
                    <a
                      href={project.live}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="View live site"
                    >
                      <ExternalLink size={20} />
                    </a>
                  </div>
                </div>

                <h4 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {project.title}
                </h4>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-mono text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
