// Packages, evidence-level logic and the shared-snapshot builder.
export const CATS = [
  { id: "lease", label: "Lease" },
  { id: "payment", label: "Payment evidence" },
  { id: "landlord", label: "Landlord confirmation" },
  { id: "deposit", label: "Deposit" },
  { id: "movein", label: "Move-in / move-out" },
  { id: "maintenance", label: "Maintenance" },
  { id: "notice", label: "Notice" },
  { id: "comms", label: "Key communication" },
  { id: "completed", label: "Completed-tenancy confirmation" },
];
export const catLabel = (id) => CATS.find((c) => c.id === id)?.label || id;

export const SHARE_PACKAGES = [
  {
    id: "tenancy",
    label: "Tenancy History",
    desc: "Where and when you have rented, with the evidence level for each tenancy.",
    cats: ["lease", "completed", "movein"],
    rent: false,
    context: false,
  },
  {
    id: "payment",
    label: "Payment History",
    desc: "Rent paid, with the source of every record.",
    cats: ["payment"],
    rent: true,
    context: false,
  },
  {
    id: "reference",
    label: "Landlord Reference",
    desc: "Confirmations and references from housing providers.",
    cats: ["landlord", "completed"],
    rent: false,
    context: false,
  },
  {
    id: "application",
    label: "Rental Application",
    desc: "A fuller picture for one application, with your own context beside the facts.",
    cats: ["lease", "payment", "landlord", "completed"],
    rent: true,
    context: true,
  },
  {
    id: "dispute",
    label: "Dispute Evidence",
    desc: "The records that bear on a correction or dispute, and nothing else.",
    cats: ["comms", "notice", "movein", "deposit", "maintenance", "lease"],
    rent: true,
    context: false,
    onlyDisputed: true,
  },
];

export const DURATIONS = [
  { id: "1", label: "24 hours", hours: 24 },
  { id: "3", label: "3 days", hours: 72 },
  { id: "7", label: "7 days", hours: 24 * 7 },
  { id: "30", label: "30 days", hours: 24 * 30 },
];

/* ---------- dates ---------- */
export const toDate = (s) => (s ? new Date(String(s).replace(" ", "T")) : null);
export const dateOnly = (s) => (s ? String(s).slice(0, 10) : "");
export function fmtDay(s) {
  const d = toDate(s);
  if (!d || isNaN(d)) return "";
  return new Intl.DateTimeFormat("en-CA", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(d);
}
export function fmtMonth(s) {
  const d = toDate(s);
  if (!d || isNaN(d)) return "";
  return new Intl.DateTimeFormat("en-CA", { month: "short", year: "numeric", timeZone: "UTC" }).format(d);
}
export function fmtWhen(s) {
  const d = toDate(s);
  if (!d || isNaN(d)) return "";
  return new Intl.DateTimeFormat("en-CA", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(d);
}
export const money = (n) => (n || n === 0 ? `$${Number(n).toLocaleString("en-CA")} / month` : "");
export const period = (t) => `${fmtMonth(t.start_date) || "Start not set"} – ${t.end_date ? fmtMonth(t.end_date) : "Present"}`;

/* ---------- evidence levels ---------- */
export function isDisputed(conf) {
  return !!conf && conf.status === "corrected" && !["accepted_theirs", "agreed"].includes(conf.resolution);
}

export function tenancyLevels(t, evidence, conf) {
  const mine = evidence.filter((e) => e.tenancy === t.id);
  const out = ["self"];
  if (mine.some((e) => e.level === "document")) out.push("document");
  if (mine.some((e) => e.level === "payment")) out.push("payment");
  if (conf?.status === "confirmed" || (conf?.status === "corrected" && ["accepted_theirs", "agreed"].includes(conf.resolution)))
    out.push("landlord");
  if (isDisputed(conf)) out.push("disputed");
  return out;
}

/* ---------- link helpers ---------- */
export function publicLink(path) {
  return new URL(path.replace(/^\//, ""), document.baseURI).href;
}

export function isExpired(share) {
  const d = toDate(share.expires_at);
  return !d || d.getTime() <= Date.now();
}
export const shareState = (s) => (s.revoked ? "revoked" : isExpired(s) ? "expired" : "active");

export function timeLeft(s) {
  const ms = toDate(s.expires_at).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const h = Math.floor(ms / 3600000);
  if (h < 1) return "Less than an hour left";
  if (h < 48) return `${h} hour${h === 1 ? "" : "s"} left`;
  return `${Math.floor(h / 24)} days left`;
}

/* ---------- snapshot ---------- */
export function buildSnapshot({ renterName, packageId, title, tenancies, evidence, confirmations, notes, opts }) {
  const confByTen = new Map(confirmations.map((c) => [c.tenancy, c]));
  const snap = {
    v: 1,
    renter: renterName,
    created: new Date().toISOString(),
    package: packageId,
    recipient: title,
    showRent: !!opts.showRent,
    tenancies: tenancies.map((t) => {
      const c = confByTen.get(t.id);
      return {
        id: t.id,
        address: t.address,
        city: t.city || "",
        region: t.region || "",
        start: dateOnly(t.start_date),
        end: dateOnly(t.end_date),
        rent: opts.showRent && t.rent ? t.rent : null,
        landlord: t.landlord_name || "",
        levels: tenancyLevels(t, evidence, c),
        confirmation: c && c.status !== "requested"
          ? {
              status: c.status,
              by: c.responder_name || "",
              role: c.responder_role || "",
              at: c.responded_at || "",
              note: c.response_note || "",
              theirStart: c.their_start || "",
              theirEnd: c.their_end || "",
              theirRent: opts.showRent ? c.their_rent || "" : "",
              renterNote: c.renter_note || "",
              resolution: c.resolution || "",
            }
          : null,
      };
    }),
    evidence: evidence.map((e) => ({
      id: e.id,
      tenancy: e.tenancy || "",
      category: e.category,
      title: e.title,
      level: e.level,
      date: dateOnly(e.evidence_date),
      source: e.source || "",
      redacted: !!e.redacted,
      note: e.note || "",
      fileId: e.__shareFileId || "",
    })),
    context: notes.map((n) => ({ id: n.id, topic: n.topic, body: n.body, tenancy: n.tenancy || "" })),
  };
  return snap;
}
