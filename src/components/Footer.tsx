import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Github, Linkedin, Instagram, Gitlab} from "lucide-react";
import { navGroups } from "@/data/navigation";

const socialLinks = [
  { icon: Github, href: "https://github.com/programmerolashow", label: "GitHub" },
  { icon: Gitlab, href: "https://gitlab.com/olanrewajuillias", label: "GitLab" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/olanrewaju-illias-993a982bb", label: "LinkedIn" },
  { icon: Instagram, href: "https://www.instagram.com/programmer_olashow", label: "Instagram" },
];

const footerLinks = [...navGroups.flatMap((group) => group.items), { label: "Contact", to: "/#contact" }];

const Footer = () => {
  return (
    <footer className="py-8 md:py-12 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <nav aria-label="Footer" className="mb-6 md:mb-8">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-muted-foreground transition-colors hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 text-center">
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link to="/" className="text-lg sm:text-xl font-bold gradient-text">
              {"<Fullstack Developer />"}
            </Link>
          </motion.div>

          <div className="flex items-center gap-5 sm:gap-6">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
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
