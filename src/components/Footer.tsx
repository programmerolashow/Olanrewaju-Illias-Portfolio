import { motion } from "framer-motion";
import { Github, Linkedin, Instagram} from "lucide-react";

const socialLinks = [
  { icon: Github, href: "https://github.com/programmerolashow", label: "GitHub" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/olanrewaju-illias-993a982bb", label: "LinkedIn" },
  { icon: Instagram, href: "https://www.instagram.com/programmer_olashow", label: "Instagram" },
];

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.a
            href="#home"
            className="text-xl font-bold gradient-text"
            whileHover={{ scale: 1.05 }}
          >
            {"<Frontend Dev />"}
          </motion.a>

          <div className="flex items-center gap-6">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={label}
              >
                <Icon size={20} />
              </motion.a>
            ))}
          </div>

          <p className="text-muted-foreground text-sm flex items-center gap-1">
            Olanrewaju Illias
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
