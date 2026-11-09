// Single source of truth for everything on the site.
// Mirrors src/data/Harshit_Resume.pdf — update both together.

import resumeUrl from "./Harshit_Resume.pdf?url";
import portrait from "./pic3.jpeg";

const CAREER_START = new Date(2023, 0, 1);
const yearsOfExperience = Math.floor(
  (Date.now() - CAREER_START.getTime()) / (365.25 * 24 * 3600 * 1000)
);

export const profile = {
  name: "Harshit Yadav",
  firstName: "Harshit",
  lastName: "Yadav",
  title: "Software Engineer",
  company: "Accenture",
  location: "India",
  timezone: "Asia/Kolkata",
  email: "yharshit178@gmail.com",
  phone: "+91-8318749400",
  resumeUrl,
  portrait,
  yearsOfExperience,
  roles: [
    "Software Engineer @ Accenture",
    "AWS Certified Developer",
    "Python · FastAPI · Serverless",
    "Race-condition hunter",
    "Backend systems that scale",
  ],
  intro: [
    `Software Engineer with ${yearsOfExperience}+ years of experience building scalable backend systems using Python and AWS.`,
    "Strong expertise in concurrency handling, API design, and performance optimization.",
    "Solid foundation in DSA, system design basics, and cloud development — with hands-on React and modern DevOps practices.",
  ],
};

export const socials = [
  { label: "GitHub", handle: "xdominator365", href: "https://github.com/xdominator365" },
  { label: "LinkedIn", handle: "in/yd09", href: "https://linkedin.com/in/yd09" },
  { label: "LeetCode", handle: "xdominator365", href: "https://leetcode.com/xdominator365" },
];

export const stats = [
  { value: yearsOfExperience, suffix: "+", label: "Years shipping backend systems" },
  { value: 8.3, decimals: 2, label: "B.Tech CGPA / 10" },
  { value: 5, suffix: "★", label: "HackerRank rating" },
  { value: 10000, prefix: "₹", label: "Accenture Primer award" },
];

export const experience = [
  {
    company: "Accenture",
    role: "Software Engineer",
    period: "Jan 2023 — Present",
    current: true,
    highlights: [
      { text: "Engineered backend service using Python, AWS Lambda, and DynamoDB.", tag: "Serverless", accent: "violet" },
      { text: "Resolved race conditions, improving system reliability and data consistency.", tag: "Concurrency", accent: "pink" },
      { text: "Conducted performance testing using Locust to improve scalability.", tag: "Performance", accent: "amber" },
      { text: "Built ReactJS components for better internal tooling experience.", tag: "Frontend", accent: "cyan" },
      { text: "Automated deployments via Terraform and CI/CD pipelines.", tag: "DevOps", accent: "lime" },
    ],
    stack: ["Python", "AWS Lambda", "DynamoDB", "Locust", "React", "Terraform", "CI/CD"],
  },
];

export const timeline = [
  { year: "2018", title: "Started B.Tech, Information Technology", place: "Jaypee University of Information Technology" },
  { year: "2022", title: "Graduated with 8.30 CGPA", place: "JUIT" },
  { year: "Jan 2023", title: "Joined Accenture as Software Engineer", place: "Accenture" },
  { year: "Sep 2023", title: "Shipped Claim Getter serverless microservice", place: "Accenture" },
  { year: "Dec 2025", title: "Built MyDhira — AI paper-trading platform", place: "Side project" },
  { year: "2026", title: "AWS Certified Developer — Associate", place: "Amazon Web Services" },
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
  { group: "Languages", accent: "violet", items: ["Python", "Java", "TypeScript"] },
  { group: "Frameworks", accent: "cyan", items: ["FastAPI", "React"] },
  { group: "Cloud & Platforms", accent: "amber", items: ["AWS", "Lambda", "DynamoDB", "Linux"] },
  { group: "Data", accent: "pink", items: ["PostgreSQL", "DynamoDB"] },
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
  { title: "Performance Engineering", body: "Profiling, load testing and squeezing latency out of hot paths." },
  { title: "Cloud Architecture", body: "AWS-native, serverless-first designs with infrastructure as code." },
  { title: "AI × Finance", body: "Applying ML to markets — the thread that led to MyDhira." },
];

export const testimonial = {
  quote: "Harshit is an excellent engineer with strong backend skills and attention to detail.",
  author: "Team Lead, Accenture",
  href: "https://www.linkedin.com/in/kumapred",
};

export const marquee = [
  "Python", "AWS Lambda", "DynamoDB", "FastAPI", "React", "TypeScript", "PostgreSQL",
  "Terraform", "Locust", "Datadog", "Dynatrace", "Java", "Linux", "GitLab CI", "Serverless",
];
