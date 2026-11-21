/**
 * The portfolio as a list of short, self-contained facts — generated from
 * src/data/content.js so it can never drift from what the site says.
 *
 * Used twice: the chat widget's offline mode searches it in the browser, and
 * the build writes it to dist/chat-context.json for the Claude proxy's
 * system prompt (see vite.config.js and serverless/chat-worker).
 */
import { certifications, education, experience, hobbies, interests, persona, profile, projects, skills, socials, timeline } from "../data/content";

const list = (xs) => xs.filter(Boolean).join(", ");

export function buildKnowledge() {
  const facts = [];
  const add = (id, topic, text, keywords = "") => facts.push({ id, topic, text, keywords });

  add(
    "profile",
    "About",
    `${profile.name} is a ${profile.title} at ${profile.company}, based in ${profile.location}, with ${profile.yearsOfExperience}+ years of experience. ${profile.intro.join(" ")}`,
    "who is harshit about summary introduction background bio"
  );

  for (const j of experience) {
    const hl = j.highlights.map((h) => h.text).join(" ");
    add(
      `exp-${j.id}`,
      `Experience · ${j.company}`,
      `${j.company}${j.unit ? ` (${j.unit})` : ""} — ${j.role}, ${j.period}, ${j.place}. ${j.summary || ""} ${hl} Stack: ${list(j.stack)}.`.replace(/\s+/g, " "),
      `work job role career employer ${j.current ? "current now today" : "previous past"} ${j.company}`
    );
  }

  add("timeline", "Career timeline", timeline.map((t) => `${t.year}: ${t.title} (${t.place})`).join(". ") + ".", "timeline history journey when year");

  for (const p of projects) {
    add(
      `proj-${p.id}`,
      `Project · ${p.name}`,
      `${p.name} (${p.date}) — ${p.tagline}. ${p.description} ${p.highlights.join(" ")} Stack: ${list(p.stack)}.${p.link ? ` Live: ${p.link}` : " Source is private (enterprise)."}`,
      "project built side portfolio app"
    );
  }

  add("skills", "Skills", skills.map((g) => `${g.group}: ${list(g.items)}`).join(". ") + ".", "skills stack tech technologies languages tools frameworks know");

  const { featured, others } = certifications;
  add(
    "certs",
    "Certifications & achievements",
    `${featured.name} from ${featured.issuer}, valid ${featured.validity}. Achievements: ${others.map((o) => `${o.name} (${o.detail})`).join(", ")}.`,
    "certification certified aws certificate award achievement"
  );
  add("education", "Education", `${education.degree} at ${education.school}, ${education.period}, CGPA ${education.cgpa}.`, "education degree college university study graduated");
  add("interests", "Interests", interests.map((i) => `${i.title}: ${i.body}`).join(" "), "interests passionate curious focus");
  add(
    "vision",
    "Vision",
    `${persona.manifesto.join(" ")} ${persona.pillars.map((p) => `${p.title}: ${p.body}`).join(" ")}`,
    "vision goals future founder investor ambition long term"
  );
  if (persona.ideas?.length) {
    add("ideas", "Idea lab", persona.ideas.map((i) => `${i.name} — ${i.note} (${i.stage}, ~${i.progress}%)`).join("; ") + ".", "ideas startup building next working on");
  }
  add("life", "Off the clock", hobbies.map((h) => `${h.title}: ${h.body}`).join(" "), "hobbies gym travel movies free time fun personal");
  add(
    "contact",
    "Contact",
    `Email ${profile.email} · WhatsApp +${profile.whatsapp} · ${socials.map((s) => `${s.label}: ${s.href}`).join(" · ")}. Open to roles, product ideas, investment conversations and hard backend problems.`,
    "contact email reach hire hiring available phone linkedin github whatsapp"
  );
  return facts;
}
