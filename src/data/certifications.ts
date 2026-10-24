export interface Certification {
  title: string;
  issuer: string;
  /** Display date, as printed on the certificate. */
  issued: string;
  credentialId: string;
  /** Public verification page. */
  url: string;
  /** Image inside /public. */
  image: string;
  skills: string[];
}

/** Newest first. */
export const certifications: Certification[] = [
  {
    title: "Top 30% Python Coder",
    issuer: "Credmark",
    issued: "Mar 2026",
    credentialId: "CM-2603-ACNR9HQ",
    url: "https://credmark.ai/badge/CM-2603-ACNR9HQ",
    image: "/certifications/credmark-top-30-python.webp",
    skills: ["Python"],
  },
  {
    title: "Certified Web Professional: Web Developer",
    issuer: "Sololearn",
    issued: "Jul 2025",
    credentialId: "CC-B8PWGVJV",
    url: "https://www.sololearn.com/certificates/CC-B8PWGVJV",
    image: "/certifications/sololearn-web-development.webp",
    skills: ["HTML5", "CSS", "JavaScript", "React.js"],
  },
  {
    title: "Introduction to HTML",
    issuer: "Sololearn",
    issued: "Jul 2024",
    credentialId: "CC-AMBHSLZE",
    url: "https://www.sololearn.com/certificates/CC-AMBHSLZE",
    image: "/certifications/sololearn-intro-html.webp",
    skills: ["HTML5"],
  },
  {
    title: "Introduction to Python Programming",
    issuer: "Sololearn",
    issued: "Apr 2024",
    credentialId: "CC-4DI4W4YM",
    url: "https://www.sololearn.com/certificates/CC-4DI4W4YM",
    image: "/certifications/sololearn-intro-python.webp",
    skills: ["Python", "Object-Oriented Programming"],
  },
];
