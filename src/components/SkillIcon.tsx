import type { SimpleIcon } from "simple-icons";
import {
  siAndroid,
  siAngular,
  siClaude,
  siClerk,
  siCloudflarepages,
  siCss,
  siDjango,
  siDocker,
  siEslint,
  siExpo,
  siExpress,
  siFastapi,
  siFramer,
  siGit,
  siGithub,
  siGitlab,
  siGoogle,
  siGooglegemini,
  siGreensock,
  siHtml5,
  siJavascript,
  siJsonwebtokens,
  siLucide,
  siMongodb,
  siMongoose,
  siMui,
  siMysql,
  siNeon,
  siNextdotjs,
  siNodedotjs,
  siNpm,
  siPhp,
  siPnpm,
  siPostgresql,
  siPostman,
  siPrisma,
  siPython,
  siRadixui,
  siReact,
  siRedis,
  siRedux,
  siRender,
  siShadcnui,
  siSqlalchemy,
  siStripe,
  siSupabase,
  siTailwindcss,
  siTrello,
  siTrpc,
  siTypescript,
  siVercel,
  siVite,
} from "simple-icons";
import {
  Bot,
  Box,
  Bug,
  Bus,
  Cloud,
  Code2,
  Database,
  FileCode,
  FileText,
  FlaskConical,
  Globe,
  ShoppingCart,
  Flag,
  Gauge,
  GitBranch,
  KeyRound,
  Layers,
  LayoutDashboard,
  Lightbulb,
  Mail,
  Map,
  MessagesSquare,
  Package,
  Palette,
  QrCode,
  Rocket,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Terminal,
  TrendingUp,
  Users,
  Wallet,
  Webhook,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Brand logos by normalised name prefix. A skill matches the longest key its normalised name starts with, so
 * "React 19", "React.js" and "React Native & Expo" all get the React logo, and "Supabase Auth" gets Supabase.
 */
const brands: Record<string, SimpleIcon> = {
  html: siHtml5,
  css: siCss,
  javascript: siJavascript,
  typescript: siTypescript,
  python: siPython,
  php: siPhp,
  plpgsql: siPostgresql,
  react: siReact,
  next: siNextdotjs,
  angular: siAngular,
  expo: siExpo,
  eas: siExpo,
  vite: siVite,
  tailwind: siTailwindcss,
  radix: siRadixui,
  shadcn: siShadcnui,
  framer: siFramer,
  gsap: siGreensock,
  lucide: siLucide,
  materialui: siMui,
  redux: siRedux,
  node: siNodedotjs,
  express: siExpress,
  django: siDjango,
  fastapi: siFastapi,
  jwt: siJsonwebtokens,
  postgres: siPostgresql,
  mysql: siMysql,
  mongodb: siMongodb,
  mongoose: siMongoose,
  prisma: siPrisma,
  sqlalchemy: siSqlalchemy,
  neon: siNeon,
  redis: siRedis,
  gemini: siGooglegemini,
  googlegemini: siGooglegemini,
  googlesignin: siGoogle,
  claude: siClaude,
  git: siGit,
  github: siGithub,
  gitlab: siGitlab,
  cloudflare: siCloudflarepages,
  vercel: siVercel,
  render: siRender,
  docker: siDocker,
  postman: siPostman,
  npm: siNpm,
  pnpm: siPnpm,
  trello: siTrello,
  eslint: siEslint,
  clerk: siClerk,
  supabase: siSupabase,
  stripe: siStripe,
  trpc: siTrpc,
  android: siAndroid,
};
const brandKeys = Object.keys(brands).sort((a, b) => b.length - a.length);

/** Tools without a usable brand logo, and general skills: a fitting symbol, matched in order. */
const symbols: [RegExp, LucideIcon][] = [
  [/openai|chatgpt/, Bot],
  [/vscode|visualstudio/, Code2],
  [/powershell/, Terminal],
  [/visualbasic/, FileCode],
  [/nylas|aurinko|nodemailer|email/, Mail],
  [/svix|webhook/, Webhook],
  [/qr/, QrCode],
  [/alembic/, Database],
  [/zustand/, Box],
  [/lovable/, Sparkles],
  [/test|uat|qa$/, FlaskConical],
  [/debug|troubleshoot|rootcause/, Bug],
  [/auth|oauth|jwt/, KeyRound],
  [/secur|sast|secret|dependencyscan|staticcode|fraud|validation|accountab/, ShieldCheck],
  [/documentation/, FileText],
  [/ecommerce|shop/, ShoppingCart],
  [/website/, Globe],
  [/systemdesign|softwaredesign|systemarchitecture/, Layers],
  [/^timemanagement|^selfmanagement/, TrendingUp],
  [/\bai\b|^ai|llm|prompt|context|generative|conversation/, Sparkles],
  [/mobile|android|crossplatform/, Smartphone],
  [/database|schema|query|datamodel|dataaccess|sql|relational|nosql|migration|dataset/, Database],
  [/api|integration|rest|providers/, Webhook],
  [/deploy|cloud|cicd|pipeline|buildautomation|buildvalidation|environment|preview|staging/, Cloud],
  [/payment|wallet|fintech|pointofsale/, Wallet],
  [/^git|versioncontrol|mergerequest|codereview/, GitBranch],
  [/inventory/, Package],
  [/mobility|transport/, Bus],
  [/maps|navigation/, Map],
  [/automation|workflow/, Workflow],
  [/perform|optimi/, Gauge],
  [/dashboard|adminpanel/, LayoutDashboard],
  [/\bui\b|\bux\b|design|interface|theming|responsive|accessib|frontend|forms|icons/, Palette],
  [/lead|mentor|delegat|ownership|decision|initiative|conflict/, Flag],
  [/communicat|speaking|presentation|listening|feedback|written|verbal/, MessagesSquare],
  [/team|collaborat|network|relationship|community|peer|event|advocacy|opensource|knowledge/, Users],
  [/think|analy|reason|problem|research|strateg|innovation|creativ|solution/, Lightbulb],
  [/product|feature|mvp|requirement|business|saas|planning|project|sprint|agile|scrum|kanban|process|prioriti|management/, Target],
  [/learning|growth|resilien|discipline|reliab|flexib|independent|pressure|quality|adapt|detail|resourceful|time|self/, TrendingUp],
  [/architect|systemdesign|modular|component|scal|fullstack|software|refactor|maintenance|errorhandling|typesafe|typescript/, Layers],
  [/backend|server|request/, Server],
  [/npm|package/, Box],
  [/launch|ship/, Rocket],
];

// Near-black or near-white brand colours would vanish on one of the two themes, so those follow the text colour.
const visibleHex = (hex: string) => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return l > 0.12 && l < 0.85 ? `#${hex}` : "currentColor";
};

/** The logo (or a fitting symbol) for a skill, tool or tag name, sized to sit beside its label. */
const SkillIcon = ({ name, className, brandColor = true }: { name: string; className?: string; brandColor?: boolean }) => {
  const n = norm(name);
  const lower = name.toLowerCase();
  const brandKey = brandKeys.find((k) => n.startsWith(k));
  if (brandKey) {
    const icon = brands[brandKey];
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        aria-hidden
        className={cn("h-3.5 w-3.5 shrink-0", className)}
        fill={brandColor ? visibleHex(icon.hex) : "currentColor"}
      >
        <path d={icon.path} />
      </svg>
    );
  }
  const Icon = symbols.find(([re]) => re.test(n) || re.test(lower))?.[1] ?? Code2;
  return <Icon aria-hidden className={cn("h-3.5 w-3.5 shrink-0", className)} />;
};

export default SkillIcon;
