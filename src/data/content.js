// Single source of truth for everything on the site.
// Mirrors src/data/Harshit_Resume.pdf + LinkedIn (linkedin.com/in/yd09) — update together.

import resumeUrl from "./Harshit_Resume.pdf?url";
import selfie from "./pic3.jpeg";
import gym1 from "./pic1.jpeg";
import gym2 from "./pic2.jpeg";

// Optional LinkedIn headshot: drop it at src/data/linkedin.jpg (or .png/.webp) and it's picked up automatically.
const linkedinPhoto = Object.values(
  import.meta.glob("./linkedin.{jpg,jpeg,png,webp}", { eager: true, import: "default" })
)[0];

const CAREER_START = new Date(2022, 6, 1); // Jul 2022 — first full engineering role
const yearsOfExperience = Math.floor(
  (Date.now() - CAREER_START.getTime()) / (365.25 * 24 * 3600 * 1000)
);

export const profile = {
  name: "Harshit Yadav",
  firstName: "Harshit",
  lastName: "Yadav",
  title: "Senior Software Engineer",
  company: "BDO India",
  location: "New Delhi, India",
  timezone: "Asia/Kolkata",
  email: "yharshit178@gmail.com",
  phone: "+91-8318749400",
  whatsapp: "918318749400",
  resumeUrl,
  photos: [linkedinPhoto, selfie].filter(Boolean),
  yearsOfExperience,
  roles: [
    "Senior Software Engineer @ BDO India",
    "Ex-Accenture",
    "AWS Certified Developer",
    "Python · FastAPI · Distributed Systems",
    "Exploring Agentic AI",
    "Future investor & founder",
  ],
  intro: [
    `Senior Software Engineer with ${yearsOfExperience}+ years across backend and full-stack development, cloud and automation.`,
    "Python first — with hands-on Java, ReactJS, AWS and Terraform. Strong in concurrency, API design and performance.",
    "Into Generative & Agentic AI — applying AI and automation to software and business workflows.",
    "Long game: build products people pay for, and compound the returns as an investor.",
  ],
};

export const socials = [
  { label: "GitHub", handle: "xdominator365", href: "https://github.com/xdominator365" },
  { label: "LinkedIn", handle: "in/yd09", href: "https://linkedin.com/in/yd09" },
  { label: "LeetCode", handle: "xdominator365", href: "https://leetcode.com/xdominator365" },
];

export const stats = [
  { value: yearsOfExperience, suffix: "+", label: "Years shipping software" },
  { value: 50, prefix: "~", suffix: "%", label: "Faster deploys via CI/CD automation" },
  { value: 40, prefix: "~", suffix: "%", label: "More peak-load scalability" },
  { value: 30, prefix: "~", suffix: "%", label: "Fewer failures from race-condition fixes" },
];

export const experience = [
  {
    id: "bdo",
    company: "BDO India",
    unit: "BDO RISE",
    logo: "B",
    logoBg: "linear-gradient(135deg, #e11d48, #9f1239)",
    role: "Senior Software Engineer",
    period: "Sep 2026 — Present",
    place: "Gurugram · Hybrid",
    current: true,
    summary:
      "Backend and full-stack engineering on cloud-native products — scalable APIs, automation, and applying Generative & Agentic AI to business workflows.",
    highlights: [],
    stack: ["Python", "FastAPI", "AWS", "Distributed Systems", "Agentic AI"],
  },
  {
    id: "accenture",
    company: "Accenture",
    logo: "A",
    logoBg: "linear-gradient(135deg, #a100ff, #6b21a8)",
    role: "Software Engineer",
    period: "Jan 2023 — Sep 2026",
    place: "Gurugram",
    highlights: [
      { text: "Engineered scalable backend services using Python, AWS and DynamoDB for high-throughput processing workloads.", tag: "Serverless", accent: "violet" },
      { text: "Identified and resolved race conditions — improving data consistency and cutting system failures by ~30%.", tag: "Concurrency", accent: "pink" },
      { text: "Performance-tested with Locust, increasing scalability under peak load by ~40%.", tag: "Performance", accent: "amber" },
      { text: "Built reusable ReactJS components that made internal tooling faster and reduced manual effort.", tag: "Frontend", accent: "cyan" },
      { text: "Automated CI/CD pipelines with Terraform — ~50% faster deployments and more reliable releases.", tag: "DevOps", accent: "lime" },
    ],
    stack: ["Python", "AWS Lambda", "DynamoDB", "Locust", "React", "Terraform", "CI/CD"],
  },
  {
    id: "basel",
    company: "Basel Practitioners",
    logo: "BP",
    logoBg: "linear-gradient(135deg, #0ea5e9, #1e40af)",
    role: "Software Engineer · Part-time",
    period: "Jul 2022 — Jan 2023",
    place: "Remote",
    highlights: [
      { text: "Built and maintained backend services for an enterprise Due Diligence platform in Python.", tag: "Backend", accent: "blue" },
      { text: "Optimized complex database queries, reducing response times by ~25%.", tag: "Performance", accent: "amber" },
      { text: "Resolved critical production bugs, improving stability and reducing incident frequency.", tag: "Reliability", accent: "pink" },
      { text: "Shipped features with QA, product and frontend in an agile team; active in code reviews.", tag: "Teamwork", accent: "lime" },
    ],
    stack: ["Python", "SQL", "Agile"],
  },
  {
    id: "internships",
    company: "Internships",
    logo: "★",
    logoBg: "linear-gradient(135deg, #f59e0b, #b45309)",
    role: "Early career",
    period: "2021 — 2022",
    place: "Gurugram",
    highlights: [
      { text: "GrowthJockey — Data Analyst intern (Jan – Mar 2022).", tag: "Data", accent: "cyan" },
      { text: "DeepSight AI Labs — Software Engineer intern (Mar – Aug 2021): debugging and GitHub workflows.", tag: "AI Labs", accent: "violet" },
      { text: "TIEDC, JUIT — member of the Technology Incubation & Entrepreneurship cell (2019 – 2020).", tag: "Founder DNA", accent: "amber" },
    ],
    stack: ["Python", "Data Analysis", "Git"],
  },
];

export const timeline = [
  { year: "2018", title: "Started B.Tech, Information Technology", place: "Jaypee University of Information Technology" },
  { year: "2019", title: "Joined the incubation & entrepreneurship cell", place: "TIEDC, JUIT" },
  { year: "2021", title: "First engineering internship", place: "DeepSight AI Labs" },
  { year: "2022", title: "Graduated · first engineering role", place: "JUIT · Basel Practitioners" },
  { year: "Jan 2023", title: "Joined Accenture as Software Engineer", place: "Accenture" },
  { year: "Dec 2025", title: "Built MyDhira — AI paper-trading platform", place: "Side project" },
  { year: "2026", title: "AWS Certified Developer — Associate", place: "Amazon Web Services" },
  { year: "Sep 2026", title: "Senior Software Engineer", place: "BDO India · BDO RISE" },
];

export const projects = [
  {
    id: "mydhira",
    name: "MyDhira",
    tagline: "AI-based Paper Trading Platform",
    date: "Dec 2025",
    visual: "chart",
    description:
      "An AI-powered paper-trading platform for simulating strategies with portfolio tracking and analytics — trade without risking a rupee.",
    highlights: [
      "Built FastAPI REST APIs for trading and portfolio tracking.",
      "Designed a scalable backend architecture around immutable trade records.",
      "Developed React + TypeScript dashboards for analytics.",
    ],
    stack: ["React", "TypeScript", "FastAPI", "PostgreSQL", "Python"],
    link: "https://github.com/xdominator365/smart-investor-platform",
  },
  {
    id: "claim-getter",
    name: "Claim Getter",
    tagline: "Serverless Claims Microservice · Accenture",
    date: "Sep 2023",
    visual: "architecture",
    description:
      "A serverless microservice that processes and prioritizes claims — built to stay correct when many requests hit the same records at once.",
    highlights: [
      "Developed a serverless microservice using Python and AWS Lambda.",
      "Integrated DynamoDB and handled concurrency safely.",
      "Improved claim processing efficiency and prioritization.",
    ],
    stack: ["Python", "AWS Lambda", "DynamoDB", "AWS"],
    link: null,
  },
];

export const skills = [
  { group: "Languages", accent: "violet", items: ["Python", "Java", "TypeScript", "SQL"] },
  { group: "Frameworks", accent: "cyan", items: ["FastAPI", "React"] },
  { group: "Cloud & Platforms", accent: "amber", items: ["AWS", "Lambda", "DynamoDB", "Linux"] },
  { group: "AI & Data", accent: "pink", items: ["Generative AI", "Agentic AI", "PostgreSQL"] },
  { group: "DevOps & Tooling", accent: "lime", items: ["Terraform", "CI/CD", "Git", "GitLab"] },
  { group: "Observability & Perf", accent: "blue", items: ["Datadog", "Dynatrace", "Locust"] },
];

export const certifications = {
  featured: {
    name: "AWS Certified Developer — Associate",
    issuer: "Amazon Web Services",
    validity: "2026 — 2029",
    href: "https://storage.googleapis.com/bosscoderplatformindia.appspot.com/resume_upload_certificate/USER_ID/1774983180325_AWS%20Certified%20Developer%20-%20Associate%20certificate.pdf",
  },
  others: [
    { name: "Accenture Primer Assessment", detail: "₹10,000 Award" },
    { name: "DSA Workshop", detail: "GeeksforGeeks" },
    { name: "HackerRank", detail: "5-Star" },
    { name: "Kaggle", detail: "Contributor" },
    { name: "Google Kickstart", detail: "Participant" },
  ],
};

export const education = {
  school: "Jaypee University of Information Technology",
  degree: "B.Tech in Information Technology",
  period: "2018 — 2022",
  cgpa: "8.30",
};

export const interests = [
  { title: "Distributed Systems", body: "Scalable architecture patterns, consistency models and the failure modes in between." },
  { title: "Agentic AI", body: "AI agents and automation that improve how software gets built and how businesses run." },
  { title: "Cloud Architecture", body: "AWS-native, serverless-first designs with infrastructure as code." },
  { title: "AI × Finance", body: "Applying ML to markets — the thread that led to MyDhira." },
];

/* ---------- persona: the long game ---------- */

export const persona = {
  manifesto: ["Build products.", "Compound capital.", "Stay strong."],
  pillars: [
    {
      icon: "📈",
      title: "Investor in the making",
      accent: "green",
      body:
        "I think in compounding — in code, in capital and in habits. Markets fascinate me; I study them, simulate them (hello, MyDhira) and play the long game.",
      tags: ["Markets", "Compounding", "Long-term"],
    },
    {
      icon: "🚀",
      title: "Product builder",
      accent: "violet",
      body:
        "Engineering is leverage. My goal is to turn ideas into products real people pay for — and build wealth by creating value, not just collecting a salary.",
      tags: ["0 → 1", "Ownership", "Leverage"],
    },
    {
      icon: "🧠",
      title: "AI-native thinker",
      accent: "cyan",
      body:
        "Agentic AI changes what one engineer can ship. I'm building with it daily — automating workflows and prototyping faster than ever.",
      tags: ["Agents", "Automation", "Speed"],
    },
  ],
  // Edit freely — this is the public idea board.
  ideas: [
    { name: "MyDhira", note: "AI paper trading for retail investors", stage: "Building", progress: 70 },
    { name: "Agentic workflow copilot", note: "AI agents that run repetitive business ops", stage: "Prototyping", progress: 35 },
    { name: "Smart money tracker", note: "Personal finance with investor-grade analytics", stage: "Ideating", progress: 15 },
    { name: "Something stealth", note: "Ask me over coffee ☕", stage: "Stealth", progress: 5 },
  ],
};

export const hobbies = [
  {
    id: "gym",
    title: "Gym freak",
    kicker: "Discipline compounds",
    body: "Iron every week, no excuses. The same consistency I bring to code — progressive overload, tracked and relentless.",
    photos: [gym2, gym1],
  },
  {
    id: "travel",
    title: "Traveller",
    kicker: "New places, new perspectives",
    body: "I travel whenever I can — mountains, cities, coastlines. Nothing resets the mind faster.",
  },
  {
    id: "movies",
    title: "Movie buff",
    kicker: "Stories that stick",
    body: "From mind-bending sci-fi to slow-burn thrillers — I love a great story told well.",
  },
];

export const testimonial = {
  quote: "Harshit is an excellent engineer with strong backend skills and attention to detail.",
  author: "Team Lead, Accenture",
  href: "https://www.linkedin.com/in/kumapred",
};

export const marquee = [
  "Python", "FastAPI", "AWS Lambda", "DynamoDB", "Agentic AI", "React", "TypeScript", "PostgreSQL",
  "Terraform", "Locust", "Datadog", "Java", "Distributed Systems", "GitLab CI", "Serverless",
];

/* ---------- notifications (ntfy.sh) ---------- */
// Subscribe to these topics in the ntfy app (iOS/Android/web) to get pushes.
// Note: ntfy.sh topics are public by name — anyone who knows a topic can read it,
// so these are long and random. Rename them if they ever leak.
export const notify = {
  server: "https://ntfy.sh",
  messagesTopic: "hy-portfolio-mzlihqldno1p-msg",
  visitsTopic: "hy-portfolio-mzlihqldno1p-visits",
};
