/**
 * "The 12-Month Software Engineering Roadmap: Learn, Build, and Grow" — content for /roadmap.
 * Written by Olanrewaju Illias for anyone starting out; kept as data so the page only handles layout.
 */

export const roadmapIntro = {
  title: "The 12-Month Software Engineering Roadmap",
  subtitle: "Learn, Build, and Grow",
  paragraphs: [
    "Becoming a software engineer is not simply about learning a programming language or memorising syntax. It is about developing the ability to understand problems, design solutions, write reliable code, build useful products, and continuously improve how software works.",
    "Your first 12 months should be a combination of structured learning, practical projects, problem-solving, collaboration, and gradually developing the mindset of an engineer.",
    "This roadmap follows a beginner-friendly path toward becoming a Full-Stack Software Engineer, using JavaScript and TypeScript as the main programming languages. The same engineering foundations can later help you move into mobile development, AI engineering, backend engineering, or other specialisations.",
  ],
  advice:
    "Don't spend your first year learning endlessly without building anything. Learn something, apply it, build something with it, break it, debug it, and improve it.",
};

/** 1. The learning philosophy */
export const learningCycle = [
  { title: "Learn", detail: "Understand concepts and study how things work." },
  { title: "Build", detail: "Turn concepts into working applications." },
  { title: "Break and debug", detail: "Understand errors, investigate causes, and fix them." },
  { title: "Improve", detail: "Refactor, test, document, and make the solution better." },
];

export const weeklyAllocation = [
  { label: "Learning and reading", percent: 25 },
  { label: "Hands-on building", percent: 50 },
  { label: "Problem-solving and debugging", percent: 15 },
  { label: "Documentation and reflection", percent: 10 },
];

export const allocationNote =
  "These percentages are a suggested starting point, not strict rules. The important thing is to make building a regular part of learning.";

/** 2. Your first 12 months */
export interface RoadmapMonth {
  month: number;
  title: string;
  learn: string[];
  /** Shown as "Build:". For month 11 the list of product ideas follows in `buildOptions`. */
  build: string;
  buildOptions?: string[];
  buildNote?: string;
  milestone: string;
  /** Month 12 is "Learn and practise" rather than "Learn". */
  learnLabel?: string;
}

export interface RoadmapQuarter {
  range: string;
  title: string;
  months: RoadmapMonth[];
}

export const quarters: RoadmapQuarter[] = [
  {
    range: "Months 1–3",
    title: "Build your programming foundations",
    months: [
      {
        month: 1,
        title: "Understand how the web works",
        learn: [
          "How computers, operating systems, browsers, and the internet work.",
          "HTML: headings, forms, links, images, semantic elements.",
          "CSS: selectors, layouts, Flexbox, Grid, responsive design.",
          "Basic browser developer tools.",
        ],
        build: "A personal profile website with an About section, skills, projects, and contact form.",
        milestone: "You can create and style a responsive webpage without copying an entire tutorial.",
      },
      {
        month: 2,
        title: "Learn JavaScript fundamentals",
        learn: [
          "Variables: let, const.",
          "Data types, operators, and expressions.",
          "Conditional statements and loops.",
          "Functions and scope.",
          "Arrays and objects.",
          "Basic error handling.",
          "Problem-solving and computational thinking.",
        ],
        build: "A calculator, number guessing game, and simple expense tracker.",
        milestone: "You can write small programs independently and explain your code.",
      },
      {
        month: 3,
        title: "Learn practical JavaScript",
        learn: [
          "DOM manipulation.",
          "Events and event listeners.",
          "Form validation.",
          "ES6+ features.",
          "Array methods: map, filter, reduce, find.",
          "JSON and local storage.",
          "Git and GitHub fundamentals.",
        ],
        build: "A task management application with add, edit, delete, search, and local persistence.",
        milestone: "You can build interactive applications and use Git to track your work.",
      },
    ],
  },
  {
    range: "Months 4–6",
    title: "Become comfortable building frontend applications",
    months: [
      {
        month: 4,
        title: "Learn React",
        learn: [
          "What React solves.",
          "Components and JSX.",
          "Props and state.",
          "useState and useEffect.",
          "Event handling.",
          "Conditional rendering.",
          "Lists and component composition.",
          "Basic routing.",
        ],
        build: "A movie discovery interface or product catalogue using sample data.",
        milestone: "You can break an interface into reusable components and manage application state.",
      },
      {
        month: 5,
        title: "Build complete frontend experiences",
        learn: [
          "React Router.",
          "API consumption with fetch.",
          "Loading, error, and empty states.",
          "Forms and validation.",
          "Reusable components.",
          "Responsive design.",
          "Accessibility fundamentals.",
          "TypeScript fundamentals: types, interfaces, unions, and generics.",
        ],
        build: "A job listing application with search, filters, job details, and saved jobs.",
        milestone: "You can build a multi-page frontend that consumes an external API.",
      },
      {
        month: 6,
        title: "Understand backend development",
        learn: [
          "What happens when a browser calls a server.",
          "Node.js fundamentals.",
          "Express.js.",
          "HTTP methods and status codes.",
          "REST API design.",
          "Request and response handling.",
          "Middleware.",
          "Environment variables.",
          "API testing with Postman.",
        ],
        build: "A REST API for your task management application with CRUD operations.",
        milestone: "You understand how frontend applications communicate with backend services.",
      },
    ],
  },
  {
    range: "Months 7–9",
    title: "Learn databases, security, and full-stack engineering",
    months: [
      {
        month: 7,
        title: "Learn databases",
        learn: [
          "What databases are and why applications need them.",
          "SQL fundamentals.",
          "PostgreSQL.",
          "Tables, rows, and columns.",
          "Primary and foreign keys.",
          "Relationships and joins.",
          "CRUD operations.",
          "Database normalization.",
          "Basic indexing.",
          "ORM concepts and Prisma introduction.",
        ],
        build: "A student records or inventory management backend connected to PostgreSQL.",
        milestone: "You can design a basic relational database and retrieve and manipulate its data.",
      },
      {
        month: 8,
        title: "Authentication and full-stack integration",
        learn: [
          "Frontend and backend integration.",
          "User registration and login.",
          "Password hashing.",
          "Sessions and JWT.",
          "Authentication versus authorization.",
          "Protected routes.",
          "Role-based access control.",
          "Input validation.",
          "Basic web security and common vulnerabilities.",
        ],
        build: "A full-stack application with user accounts, login, protected dashboard, and database persistence.",
        milestone: "You can build an application where different users have secure, separate accounts and permissions.",
      },
      {
        month: 9,
        title: "Testing, debugging, and engineering practices",
        learn: [
          "Unit testing.",
          "Integration testing.",
          "API testing.",
          "React component testing.",
          "Debugging with browser and server tools.",
          "Logging and error handling.",
          "Code reviews.",
          "ESLint and formatting.",
          "Git branching and pull requests.",
          "Introduction to CI/CD.",
        ],
        build: "Add tests, improve error handling, refactor, and document your previous full-stack application.",
        milestone: "You understand that working software is not enough; it should also be maintainable and testable.",
      },
    ],
  },
  {
    range: "Months 10–12",
    title: "Develop real-world engineering skills",
    months: [
      {
        month: 10,
        title: "Deployment and production fundamentals",
        learn: [
          "Frontend and backend deployment.",
          "Hosting and cloud fundamentals.",
          "Domain names and DNS.",
          "HTTPS and SSL.",
          "Production environment variables.",
          "Build and deployment processes.",
          "Database hosting and backups.",
          "Basic monitoring and application logs.",
        ],
        build: "Deploy your full-stack application so other people can access and test it.",
        milestone: "You can take an application from your computer to a publicly accessible environment.",
      },
      {
        month: 11,
        title: "Build a substantial portfolio project",
        learn: [
          "Requirements gathering.",
          "Breaking features into smaller tasks.",
          "Application architecture.",
          "Database and API planning.",
          "User experience considerations.",
          "Agile development fundamentals.",
          "Technical documentation.",
        ],
        build: "Choose one substantial product, such as:",
        buildOptions: [
          "A student management platform.",
          "An e-commerce application.",
          "A booking and reservation platform.",
          "An expense and financial tracking application.",
          "A community platform.",
        ],
        buildNote: "Include authentication, database integration, CRUD, search, validation, responsive UI, and testing.",
        milestone: "You can take a problem from idea to a functional product.",
      },
      {
        month: 12,
        title: "Professional readiness and specialisation",
        learnLabel: "Learn and practise",
        learn: [
          "Data structures and algorithms.",
          "Common software engineering interview questions.",
          "Basic system design.",
          "Open-source contribution.",
          "Technical writing.",
          "Collaboration through GitHub or GitLab.",
          "CV, portfolio, and interview preparation.",
        ],
        build:
          "Polish your strongest project, publish its source code, write a detailed README, record a demonstration, and create a portfolio case study.",
        milestone:
          "You have evidence of your skills, a public body of work, and a foundation for applying to internships, junior roles, or freelance opportunities.",
      },
    ],
  },
];

export const allMonths = quarters.flatMap((q) => q.months);

/** 3. How to organise your time every week */
export const weeklyTime = {
  intro: "Consistency matters more than occasionally spending 12 hours coding in one day.",
  routine: "Here is a realistic weekly routine for someone who can dedicate approximately 3 hours daily.",
  hoursPerWeek: 21,
  /** The 21 hours split by the suggested allocation in section 1. */
  split: [
    { label: "Learning and reading", hours: "5¼ h" },
    { label: "Hands-on building", hours: "10½ h" },
    { label: "Problem-solving and debugging", hours: "3 h" },
    { label: "Documentation and reflection", hours: "2 h" },
  ],
  splitNote: "Based on the suggested allocation above, rounded.",
  lessTime: "If you have less time, even 1–2 focused hours daily can work. Extend the timeline rather than rushing through the concepts.",
};

/** 4. Projects to build throughout the year */
export const projectsIntro =
  "Do not wait until month 11 before building something substantial. Every project should introduce you to a new engineering challenge.";

export const projectPlan = [
  { period: "Month 1", project: "Personal website", teaches: "HTML and CSS" },
  { period: "Month 2", project: "Calculator", teaches: "JavaScript logic" },
  { period: "Month 3", project: "Task manager", teaches: "DOM and local storage" },
  { period: "Month 4", project: "Movie application", teaches: "React components" },
  { period: "Month 5", project: "Job board", teaches: "API integration" },
  { period: "Month 6", project: "Task management API", teaches: "Node and Express" },
  { period: "Month 7", project: "Inventory system", teaches: "PostgreSQL and SQL" },
  { period: "Month 8", project: "Authentication app", teaches: "Full-stack development" },
  { period: "Month 9", project: "Tested application", teaches: "Software quality" },
  { period: "Month 10", project: "Deployed application", teaches: "Production deployment" },
  { period: "Months 11–12", project: "Complete product", teaches: "Engineering and product thinking" },
];

export const growingPortfolio = [
  { project: "Personal portfolio", level: "Beginner", when: "Month 1" },
  { project: "Task management app", level: "Beginner", when: "Month 3" },
  { project: "Job discovery platform", level: "Intermediate", when: "Month 5" },
  { project: "Inventory management system", level: "Intermediate", when: "Month 7" },
];

/** 5. Learning resources worth using */
export const resourcesIntro = "You do not need to purchase expensive courses to begin. There are excellent resources available for free.";

export const resources = [
  { name: "freeCodeCamp", detail: "Beginner-friendly programming courses and practical exercises.", cta: "Visit freeCodeCamp", url: "https://www.freecodecamp.org/" },
  { name: "The Odin Project", detail: "Structured web development curriculum with practical projects.", cta: "Visit The Odin Project", url: "https://www.theodinproject.com/" },
  { name: "MDN Web Docs", detail: "Reliable reference for HTML, CSS, JavaScript, and web technologies.", cta: "Visit MDN", url: "https://developer.mozilla.org/" },
  { name: "JavaScript.info", detail: "Detailed JavaScript explanations, from fundamentals to advanced concepts.", cta: "Visit JavaScript.info", url: "https://javascript.info/" },
  { name: "React documentation", detail: "Learn React through its official guides and tutorials.", cta: "Learn React", url: "https://react.dev/learn" },
  { name: "GitHub", detail: "Learn Git, manage projects, collaborate, and contribute to open source.", cta: "GitHub documentation", url: "https://docs.github.com/" },
  { name: "PostgreSQL documentation", detail: "Learn relational databases and SQL.", cta: "PostgreSQL documentation", url: "https://www.postgresql.org/docs/" },
  { name: "Node.js documentation", detail: "Learn server-side JavaScript and backend development.", cta: "Node.js learning resources", url: "https://nodejs.org/en/learn" },
];

/** 6. Skills beyond programming */
export const softSkillsIntro = "A good software engineer is not defined by coding ability alone. Throughout the 12 months, deliberately develop:";

export const softSkills = [
  { skill: "Communication", practice: "Explain your projects to people who aren't developers." },
  { skill: "Problem-solving", practice: "Break complex problems into smaller tasks." },
  { skill: "Critical thinking", practice: "Understand why a solution works before implementing it." },
  { skill: "Teamwork", practice: "Work with another beginner on a small project." },
  { skill: "Leadership", practice: "Take responsibility for a feature or small project." },
  { skill: "Technical writing", practice: "Document your projects and engineering decisions." },
  { skill: "Time management", practice: "Plan weekly goals and meet realistic deadlines." },
  { skill: "Adaptability", practice: "Learn to understand unfamiliar tools and documentation." },
  { skill: "Collaboration", practice: "Use Git branches, pull requests, and code reviews." },
  { skill: "Continuous learning", practice: "Review what you learned and identify knowledge gaps." },
];

/** 7. What you should avoid during your first year */
export const mistakesIntro = "These mistakes can slow down your progress considerably:";

export const mistakes = [
  { title: "Learning too many programming languages at once.", detail: "Start with JavaScript and develop a strong foundation before adding another language." },
  { title: "Tutorial dependency.", detail: "Following tutorials is useful, but you must eventually build without someone showing you every step." },
  { title: "Copying code you don't understand.", detail: "If you cannot explain what a piece of code does, take time to understand it." },
  { title: "Ignoring fundamentals.", detail: "Don't rush into React before understanding JavaScript." },
  { title: "Avoiding errors.", detail: "Debugging is an essential engineering skill, not a sign of failure." },
  { title: "Chasing frameworks.", detail: "You don't need to learn every popular framework to become a software engineer." },
  { title: "Ignoring GitHub.", detail: "Start documenting and publishing your work early." },
  { title: "Building only for certificates.", detail: "A working project is stronger evidence of practical ability than a collection of course-completion certificates." },
  { title: "Using AI as a replacement for thinking.", detail: "Use AI to explain concepts, review code, and help investigate problems, but make sure you understand the solutions." },
];

/** 8. Your first-year progress tracker */
export const trackerIntro = "Here is a checklist you can use to measure progress. Tick each milestone as you complete it.";

/** 9. Where should you be after 12 months? */
export const afterTwelveIntro = "If you consistently follow this roadmap, you should aim to have:";

export const afterTwelve = [
  "A solid understanding of programming fundamentals.",
  "The ability to build frontend applications.",
  "The ability to develop backend APIs.",
  "Practical experience with relational databases.",
  "An understanding of authentication and application security.",
  "Experience testing, debugging, and deploying software.",
  "At least 5–7 progressively challenging projects.",
  "A public GitHub portfolio with clear documentation.",
  "Experience collaborating with other developers.",
  "The confidence to apply for internships, junior developer opportunities, or entry-level freelance work.",
];

export const afterTwelveOutro =
  "You will not know everything after 12 months. That is completely normal. Software engineering is a continuous learning profession. The objective is to become capable of learning unfamiliar technologies and solving unfamiliar problems independently.";

/** 10. What comes after the first year? */
export const directionsIntro = "Once you understand full-stack fundamentals, choose a direction based on what interests you.";

export const directions = [
  { title: "Frontend Engineering", detail: "React, Next.js, TypeScript, accessibility, performance, design systems, and advanced UI engineering." },
  { title: "Backend Engineering", detail: "Advanced databases, distributed systems, caching, queues, security, scalability, and cloud infrastructure." },
  { title: "Mobile Engineering", detail: "React Native, Expo, native development, mobile performance, offline-first architecture, and app distribution." },
  { title: "AI Engineering", detail: "Python, machine learning foundations, LLMs, RAG, embeddings, AI APIs, evaluation, and AI application architecture." },
  { title: "DevOps and Cloud Engineering", detail: "Linux, Docker, CI/CD, cloud platforms, infrastructure as code, monitoring, and deployment automation." },
];

/** Final advice */
export const finalAdvice = {
  title: "My final advice to anyone starting out",
  paragraphs: [
    "Don't measure your progress by how many programming languages you know, how many tutorials you've completed, or how many certificates you've collected.",
    "Measure your progress by the problems you can solve independently, the applications you can build, the technical decisions you can explain, and the value your work creates for other people.",
    "Learn with curiosity. Build with intention. Debug with patience. Collaborate with humility. Grow with consistency.",
    "Your first year is not about becoming an expert in everything. It is about developing the foundation, discipline, and confidence to become a great engineer.",
  ],
  closing: "Learn. Build. Break. Fix. Improve. Repeat.",
};
