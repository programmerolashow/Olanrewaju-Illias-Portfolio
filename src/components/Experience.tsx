import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Briefcase, Calendar, MapPin, Building2, CheckCircle2 } from "lucide-react";

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  type: string;
  period: string;
  location: string;
  description: string;
  responsibilities: string[];
  skills: string[];
}

const experiences: ExperienceItem[] = [
  {
    id: "qorelly",
    role: "Software Engineer",
    company: "Qorelly",
    type: "Full-time",
    period: "Aug 2026 - Present",
    location: "Remote",
    description:
      "Working as a Software Engineer within the Engineering Department at Qorelly, contributing to the development and improvement of fintech products and internal software systems.",
    responsibilities: [
      "Develop and maintain software features using modern web development technologies and engineering best practices.",
      "Collaborate with other engineers and team members to design, implement, test, and improve application features.",
      "Contribute to frontend and backend development, API integration, database operations, and application workflows.",
      "Participate in debugging, code reviews, Git-based version control, testing, and continuous improvement of existing systems.",
      "Apply software engineering principles to build reliable, scalable, and maintainable solutions within a fintech environment.",
      "Gain hands-on experience working with production-oriented software development processes, team collaboration, and agile engineering practices.",
    ],
    skills: [
      "Software Design",
      "Software Industry",
      "Fintech",
      "React",
      "Node.js",
      "API Integration",
      "Git",
      "Database Operations",
      "Agile Engineering",
      "Code Reviews",
    ],
  },
  {
    id: "aidenai",
    role: "Full Stack Development Intern",
    company: "AIDENAI TECHNOLOGIES LLP",
    type: "Full-time",
    period: "Jul 2026 - Present",
    location: "Remote",
    description:
      "As a Full-Stack Web Development Intern, I collaborated with the engineering team on the development and continuous improvement of a confidential AI-powered web product. I contributed across frontend and backend workflows, using modern technologies to build responsive, maintainable, user-focused experiences in an Agile/Scrum environment.",
    responsibilities: [
      "Developed responsive, accessible interfaces using React, Next.js, TypeScript/JavaScript, and Tailwind CSS.",
      "Contributed to full-stack development by implementing features, integrating APIs, fixing bugs, and improving existing functionality.",
      "Worked on AI-powered workflows and third-party service integrations, connecting intelligent services with web applications.",
      "Translated UI/UX designs into functional interfaces aligned with product requirements and design systems.",
      "Collaborated with frontend and backend developers, UI/UX designers, and stakeholders throughout the development lifecycle.",
      "Improved application performance, responsiveness, usability, and cross-browser compatibility.",
      "Used Git and GitLab for version control, branching, code reviews, and collaborative development.",
      "Participated in Agile/Scrum ceremonies, including sprint planning, stand-ups, reviews, and technical discussions.",
      "Wrote clean, reusable, scalable, and maintainable code following engineering best practices.",
      "Debugged, tested, and optimized components to improve reliability and user experience.",
      "Worked with REST APIs, authentication flows, data handling, and backend integrations.",
      "Contributed to iterative product improvements while maintaining confidentiality around proprietary project details.",
      "Continuously explored modern development practices and technologies to improve implementation quality and team workflows.",
    ],
    skills: [
      "Back-End Web Development",
      "Database Testing",
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "AI Workflows",
      "REST APIs",
      "Git & GitLab",
      "Agile/Scrum",
    ],
  },
  {
    id: "neominds",
    role: "Fullstack Developer",
    company: "Neominds EduTech Ltd",
    type: "Full-time",
    period: "Apr 2026 - Aug 2026 · 5 mos",
    location: "Nigeria · Remote",
    description:
      "In this role, I contribute to building scalable, user-focused applications across both web and mobile platforms. My work involves designing and developing end-to-end solutions—transforming ideas into functional products while ensuring performance, usability, and maintainability.",
    responsibilities: [
      "Develop and optimize full-stack applications using modern technologies.",
      "Build responsive and intuitive user interfaces for web and mobile.",
      "Collaborate with cross-functional teams to deliver impactful solutions.",
      "Continuously improve system design, problem-solving, and development workflow.",
      "Deliver high-performance solutions that create real value for users across web and mobile platforms.",
    ],
    skills: [
      "React Native",
      "Next.js",
      "Full-Stack Development",
      "Web & Mobile Apps",
      "System Design",
      "UI/UX Optimization",
      "Cross-Functional Collaboration",
    ],
  },
  {
    id: "freelance",
    role: "Freelance | Self-Employed",
    company: "Self-Employed",
    type: "Freelance",
    period: "3 yrs 10 mos",
    location: "Lagos, Lagos State, Nigeria · Remote",
    description:
      "I am a Full-Stack Developer with experience in building responsive, scalable, and user-focused web applications. I work across both front-end and back-end technologies, turning ideas into functional digital products with clean and efficient code. My skill set includes modern JavaScript frameworks, API development, database management, and integrating third-party services to deliver seamless user experiences.",
    responsibilities: [
      "Built custom web applications and full-stack solutions for clients using modern JavaScript frameworks and clean code principles.",
      "Handled end-to-end architecture, API development, database design, and deployment pipelines.",
      "Integrated third-party payment gateways, authentication providers, and cloud services for seamless user experiences.",
      "Focused on performance optimization, mobile responsiveness, accessible design, and maintainable system architecture.",
      "Continuously engaged with clients to translate complex business requirements into high-quality technical implementations.",
    ],
    skills: [
      "Website Building",
      "Full-Stack Development",
      "JavaScript Frameworks",
      "API Development",
      "Database Management",
      "Payment Gateways",
      "System Architecture",
      "Client Collaboration",
    ],
  },
];

const Experience = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="experience" className="py-32 relative" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-primary font-mono text-sm mb-4">Career Journey</p>
          <h2 className="section-heading">
            Work <span className="gradient-text">Experience</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-4">
            Proven track record of delivering production-grade software across fintech, AI technology, and freelance solutions.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Timeline Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-transparent -translate-x-1/2 hidden sm:block opacity-40" />

          <div className="space-y-12">
            {experiences.map((exp, index) => {
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
                  className="relative flex flex-col md:flex-row items-center"
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-background border-2 border-primary shadow-[0_0_15px_rgba(56,189,248,0.5)] flex items-center justify-center z-10 hidden sm:flex">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  </div>

                  {/* Card Container */}
                  <div
                    className={`w-full md:w-[calc(50%-2.5rem)] ${
                      isEven ? "md:mr-auto" : "md:ml-auto"
                    }`}
                  >
                    <div className="glass-card rounded-2xl p-6 md:p-8 hover:border-primary/50 transition-all duration-300 shadow-xl group">
                      {/* Header Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-primary/10 text-primary border border-primary/20">
                          <Briefcase className="w-3.5 h-3.5" />
                          {exp.type}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5 text-primary/70" />
                          {exp.period}
                        </span>
                      </div>

                      {/* Job Title & Company */}
                      <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {exp.role}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1 mb-4">
                        <span className="flex items-center gap-1.5 font-medium text-foreground/90">
                          <Building2 className="w-4 h-4 text-primary" />
                          {exp.company}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-accent" />
                          {exp.location}
                        </span>
                      </div>

                      {/* Overview */}
                      <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                        {exp.description}
                      </p>

                      {/* Responsibilities List */}
                      <div className="space-y-2.5 mb-6">
                        <p className="text-xs font-mono text-foreground font-semibold uppercase tracking-wider">
                          Key Contributions:
                        </p>
                        <ul className="space-y-2">
                          {exp.responsibilities.map((resp, rIdx) => (
                            <li key={rIdx} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <span>{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Skills Tags */}
                      <div className="pt-4 border-t border-border/50">
                        <div className="flex flex-wrap gap-1.5">
                          {exp.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-secondary/60 text-foreground/90 border border-border/80"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
