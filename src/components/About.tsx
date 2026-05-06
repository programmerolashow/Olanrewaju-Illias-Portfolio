import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Code2, Palette, Zap, Globe, Server, Database } from "lucide-react";

const skills = [
  "HTML5", "CSS3", "JavaScript", "TypeScript", "React", "Vite", "Python", "Streamlite", "Shadcn/UI", "PostgreSQL", "Framer Motion", "Material UI",
  "Tailwind CSS", "Git", "Github", "VisualBasic", "Node.js", "MongoDB", "Postman", "Next.js", "Nodemailer", "Stripe", "React Native (Expo)"
];

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

            {/* Skills */}
            <div className="flex flex-wrap gap-3">
              {skills.map((skill, index) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                  className="skill-badge"
                >
                  {skill}
                </motion.span>
              ))}
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
      </div>
    </section>
  );
};

export default About;
