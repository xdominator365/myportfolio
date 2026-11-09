import { notify } from "../data/content";

const publish = (body) =>
  fetch(notify.server, {
    method: "POST",
    body: JSON.stringify(body),
    keepalive: true,
  });

const isLocal = () => /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

const safeStorage = (store) => ({
  get: (k) => {
    try {
      return window[store].getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      window[store].setItem(k, v);
    } catch {
      /* private mode etc. */
    }
  },
});
const local = safeStorage("localStorage");
const session = safeStorage("sessionStorage");

/* ---------- contact form ---------- */

export async function sendMessage({ name, email, message }) {
  const res = await publish({
    topic: notify.messagesTopic,
    title: `💬 New message from ${name}`,
    message: `${message}\n\n— ${name}${email ? ` <${email}>` : ""}`,
    tags: ["envelope"],
    priority: 4,
    ...(email && {
      click: `mailto:${email}?subject=${encodeURIComponent("Re: your message on my portfolio")}`,
      actions: [{ action: "view", label: "Reply by email", url: `mailto:${email}` }],
    }),
  });
  if (!res.ok) throw new Error(`ntfy responded ${res.status}`);
}

/* ---------- visit alerts ---------- */

function describeDevice(ua) {
  const os =
    /iPhone|iPad|iPod/.test(ua) ? "iOS" :
    /Android/.test(ua) ? "Android" :
    /Mac OS X/.test(ua) ? "macOS" :
    /Windows/.test(ua) ? "Windows" :
    /Linux/.test(ua) ? "Linux" : "Unknown OS";
  const browser =
    /Edg\//.test(ua) ? "Edge" :
    /OPR\//.test(ua) ? "Opera" :
    /Chrome\//.test(ua) ? "Chrome" :
    /Firefox\//.test(ua) ? "Firefox" :
    /Safari\//.test(ua) ? "Safari" : "Browser";
  const type = /Mobi|iPhone|Android.*Mobile/.test(ua) ? "📱 Mobile" : /iPad|Tablet/.test(ua) ? "📱 Tablet" : "💻 Desktop";
  return `${type} · ${browser} on ${os}`;
}

async function approxLocation() {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const r = await fetch("https://ipapi.co/json/", { signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) return null;
    const j = await r.json();
    return {
      place: [j.city, j.region, j.country_name].filter(Boolean).join(", "),
      org: j.org,
    };
  } catch {
    return null;
  }
}

/**
 * Sends one push per browser session when someone opens the site.
 * Visit with ?me once to mute your own devices permanently (?me=off to undo).
 */
export async function trackVisit() {
  const params = new URLSearchParams(location.search);
  if (params.has("me")) local.set("hy-me", params.get("me") === "off" ? "" : "1");
  if (isLocal() || local.get("hy-me") === "1" || session.get("hy-visit")) return;
  session.set("hy-visit", "1");

  const ref = document.referrer && !document.referrer.includes(location.host) ? document.referrer : "Direct / unknown";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const loc = await approxLocation();
  const returning = local.get("hy-seen");
  local.set("hy-seen", "1");

  const lines = [
    loc?.place ? `📍 ${loc.place}` : `🕒 Timezone: ${tz}`,
    describeDevice(navigator.userAgent),
    `🔗 From: ${ref}`,
    `🌐 ${navigator.language} · ${screen.width}×${screen.height}`,
    loc?.org ? `🏢 Network: ${loc.org}` : null,
    params.get("utm_source") ? `🎯 Campaign: ${params.get("utm_source")}` : null,
  ].filter(Boolean);

  publish({
    topic: notify.visitsTopic,
    title: returning ? "👀 Returning visitor on your portfolio" : "✨ New visitor on your portfolio",
    message: lines.join("\n"),
    tags: ["eyes"],
    priority: 2,
    click: location.href.split("?")[0],
  }).catch(() => {});
}

/** Fire-and-forget event pings (e.g. résumé downloads). Same session/mute rules as visits. */
export function trackEvent(title, message = "") {
  if (isLocal() || local.get("hy-me") === "1") return;
  publish({ topic: notify.visitsTopic, title, message: message || location.href, tags: ["star"], priority: 3 }).catch(() => {});
}
