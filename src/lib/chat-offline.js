/**
 * Offline mode: a tiny BM25-style search over the knowledge facts.
 * Honest about what it is — it quotes the portfolio instead of generating.
 */
const STOP = new Set("a an the is are was were be to of in on for and or with what whats which who how does do did his he him harshit tell me about can you your i it as at by from this that has have any".split(" "));
const SYNONYMS = {
  aws: ["lambda", "dynamodb", "cloud", "serverless"],
  cloud: ["aws", "lambda", "serverless"],
  job: ["work", "role"],
  experience: ["work", "role", "years"],
  hire: ["contact", "available"],
  email: ["contact"],
  ai: ["agentic", "generative"],
  trading: ["mydhira", "investor", "markets"],
  stock: ["mydhira", "trading"],
  certified: ["certification", "aws"],
  stack: ["skills"],
  study: ["education"],
  college: ["education"],
  hobby: ["hobbies", "gym", "travel"],
};

const tokens = (s) => s.toLowerCase().match(/[a-z0-9+#.]+/g)?.map((t) => t.replace(/\.$/, "")) || [];

export function createIndex(facts) {
  const docs = facts.map((f) => ({ ...f, terms: tokens(`${f.topic} ${f.topic} ${f.keywords} ${f.text}`) }));
  const df = new Map();
  for (const d of docs) for (const t of new Set(d.terms)) df.set(t, (df.get(t) || 0) + 1);
  const avg = docs.reduce((s, d) => s + d.terms.length, 0) / docs.length;
  const idf = (t) => Math.log(1 + (docs.length - (df.get(t) || 0) + 0.5) / ((df.get(t) || 0) + 0.5));

  return function search(question) {
    let q = tokens(question).filter((t) => !STOP.has(t));
    q = [...q, ...q.flatMap((t) => SYNONYMS[t] || [])];
    if (!q.length) return [];
    return docs
      .map((d) => {
        let score = 0;
        for (const t of q) {
          const tf = d.terms.filter((x) => x === t || (t.length > 4 && x.startsWith(t))).length;
          if (tf) score += idf(t) * ((tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * (d.terms.length / avg))));
        }
        return { fact: d, score };
      })
      .filter((r) => r.score > 1.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
  };
}

export function answerOffline(search, question, email) {
  if (/^\s*(hi|hey|hello|yo|namaste)\b/i.test(question)) {
    return { text: "Hey! 👋 Ask me anything about Harshit — his work at BDO and Accenture, MyDhira, his AWS stack, or how to reach him.", sources: [] };
  }
  const hits = search(question);
  if (!hits.length) {
    return { text: `I don't have that in my notes. Harshit can answer it directly — ${email}.`, sources: [] };
  }
  return { text: hits.map((h) => h.fact.text).join("\n\n"), sources: hits.map((h) => h.fact.topic) };
}
