import { Link } from "react-router";
import User from "icon:user-round";
import FileCheck from "icon:file-check";
import UserCheck from "icon:user-check";
import Banknote from "icon:banknote";
import BadgeCheck from "icon:badge-check";
import CircleCheck from "icon:circle-check";
import CircleDot from "icon:circle-dot";
import CircleHelp from "icon:circle-help";
import TriangleAlert from "icon:triangle-alert";
import ArrowRight from "icon:arrow-right";
import Lock from "icon:lock";
import Users from "icon:users";
import Globe from "icon:globe";
import Info from "icon:info";

export function Container({ className = "", children }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function Eyebrow({ children, className = "" }) {
  return (
    <p className={`font-mono text-xs font-semibold uppercase tracking-[0.16em] ${className}`}>
      {children}
    </p>
  );
}

const btnBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-[0.95rem] font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";
const variants = {
  primary: "bg-forest text-paper hover:bg-moss",
  accent: "bg-sun text-ink hover:bg-white",
  ghost: "border border-forest/45 bg-transparent text-ink hover:border-forest hover:bg-forest hover:text-paper",
  light: "border border-paper/60 bg-transparent text-paper hover:bg-paper hover:text-ink",
  danger: "bg-clay text-white hover:bg-forest",
};

export function Btn({ variant = "primary", className = "", ...props }) {
  return <button className={`${btnBase} ${variants[variant]} ${className}`} {...props} />;
}

export function BtnLink({ to, variant = "primary", className = "", arrow = false, children, ...props }) {
  return (
    <Link to={to} className={`${btnBase} ${variants[variant]} ${className}`} {...props}>
      {children}
      {arrow && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
    </Link>
  );
}

/* ---------- Evidence labels ---------- */
export const EVIDENCE = {
  self: {
    label: "Renter Provided",
    icon: User,
    cls: "bg-sand text-ink border-line",
    desc: "Entered by the renter in their own words. Nobody else has checked it yet.",
    means: "This is the renter’s account. It is still useful, and it is clearly labelled as their own.",
    needs: "Nothing more is needed to add it. Stronger evidence can be attached later.",
  },
  document: {
    label: "Document Supported",
    icon: FileCheck,
    cls: "bg-lake-tint text-lake border-lake/30",
    desc: "A document the renter attached backs this up, such as a lease or a notice.",
    means: "A record exists that matches the claim. The document itself can be shared if the renter chooses.",
    needs: "The document is the evidence. We do not claim to have authenticated it.",
  },
  payment: {
    label: "Payment Supported",
    icon: Banknote,
    cls: "bg-sun-tint text-ink border-sage",
    desc: "Matched to a payment record, such as a receipt, ledger or bank record.",
    means: "A payment record shows rent was paid on the date and for the amount listed.",
    needs: "Only the rent lines are shown. Other transactions stay hidden.",
  },
  landlord: {
    label: "Landlord Confirmed",
    icon: UserCheck,
    cls: "bg-moss-tint text-moss border-moss/30",
    desc: "The housing provider confirmed this, and we show who and when.",
    means: "The person who held the tenancy has confirmed these facts, with their name, role and the date.",
    needs: "A landlord can confirm facts. They cannot rate or score the renter.",
  },
  provider: {
    label: "Independently Verified",
    icon: BadgeCheck,
    cls: "bg-forest text-paper border-forest",
    desc: "Confirmed by a third party that is not the renter or the landlord.",
    means: "An outside source, named on the record, confirmed this fact.",
    needs: "Planned. No outside verification providers are connected yet.",
  },
  disputed: {
    label: "Disputed / Correction Requested",
    icon: TriangleAlert,
    cls: "bg-rose-tint text-clay border-clay/40",
    desc: "Someone says this is wrong. Both versions stay visible until it is settled.",
    means: "A renter or landlord has asked for a correction. Both versions are shown side by side.",
    needs: "A dispute label is not a verdict. It is never turned into a mark against anyone.",
  },
};

export function EvidenceBadge({ type }) {
  const e = EVIDENCE[type];
  const Icon = e.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${e.cls}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {e.label}
    </span>
  );
}

/* ---------- Verification status ---------- */
export const STATUS = {
  confirmed: { label: "Confirmed", icon: CircleCheck, cls: "bg-moss-tint text-moss border-moss/30" },
  partial: { label: "Partially Confirmed", icon: CircleDot, cls: "bg-sun-tint text-ink border-sun" },
  unable: { label: "Unable to Verify", icon: CircleHelp, cls: "bg-sand text-ink border-line" },
  disputed: { label: "Disputed / Correction Requested", icon: TriangleAlert, cls: "bg-rose-tint text-clay border-clay/40" },
};

export function StatusBadge({ status }) {
  const s = STATUS[status];
  const Icon = s.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${s.cls}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {s.label}
    </span>
  );
}

/* ---------- PRIVATE → SHARED → PUBLIC ---------- */
const STATES = [
  {
    key: "PRIVATE",
    icon: Lock,
    cls: "bg-forest text-paper",
    text: "Only you. This is where everything starts, and where it stays unless you act.",
  },
  {
    key: "SHARED",
    icon: Users,
    cls: "bg-sun text-ink",
    text: "Chosen items, chosen people, a set time. Revoke whenever you like.",
  },
  {
    key: "PUBLIC",
    icon: Globe,
    cls: "bg-clay text-white",
    text: "Visible to anyone. Only for stories you write and choose to submit. Passports, leases and verification records have no public setting.",
  },
];

export function PrivacyLadder({ className = "" }) {
  return (
    <ol className={`grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch ${className}`}>
      {STATES.flatMap((s, i) => {
        const Icon = s.icon;
        const card = (
          <li key={s.key} className={`rounded-2xl p-6 ${s.cls}`}>
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="font-mono text-sm font-semibold tracking-[0.18em]">{s.key}</span>
            </div>
            <p className="mt-3 text-[0.95rem] leading-relaxed">{s.text}</p>
          </li>
        );
        if (i === STATES.length - 1) return [card];
        return [
          card,
          <li
            key={`a${i}`}
            aria-hidden="true"
            className="flex items-center justify-center text-ink md:px-1"
          >
            <ArrowRight className="h-6 w-6 rotate-90 md:rotate-0" />
          </li>,
        ];
      })}
    </ol>
  );
}

export function Disclaimer({ children, className = "" }) {
  return (
    <p
      className={`flex gap-3 rounded-2xl border border-line bg-card p-4 text-sm leading-relaxed text-ink ${className}`}
    >
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-lake" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function PageHero({ eyebrow, title, lead, children }) {
  return (
    <section>
      <Container className="py-14 sm:py-20">
        <Eyebrow className="text-moss">{eyebrow}</Eyebrow>
        <h1 className="rise mt-4 max-w-4xl text-[2.75rem] sm:text-6xl lg:text-[3.6rem]">{title}</h1>
        {lead && (
          <p className="rise mt-6 max-w-2xl text-lg text-ink-soft sm:text-xl" style={{ animationDelay: "0.1s" }}>
            {lead}
          </p>
        )}
        {children && (
          <div className="rise mt-8" style={{ animationDelay: "0.2s" }}>
            {children}
          </div>
        )}
      </Container>
    </section>
  );
}

export function SectionTitle({ eyebrow, title, lead, dark = false, className = "" }) {
  return (
    <div className={`max-w-3xl ${className}`}>
      {eyebrow && <Eyebrow className={dark ? "text-sage-soft" : "text-moss"}>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 text-4xl sm:text-5xl">{title}</h2>
      {lead && <p className={`mt-4 text-lg ${dark ? "text-paper" : "text-ink-soft"}`}>{lead}</p>}
    </div>
  );
}

export function Field({ label, hint, children, htmlFor }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      {hint && <p className="mt-0.5 text-sm text-ink-soft">{hint}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export const inputCls =
  "block min-h-11 w-full rounded-xl border-2 border-line bg-white px-3.5 py-2 text-base text-ink placeholder:text-ink-soft/70 focus:border-forest";

export function fmtDate(d, opts = { day: "numeric", month: "short", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-CA", opts).format(d instanceof Date ? d : new Date(d));
}

export function jumpTo(id, focus = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  if (focus) {
    el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }
}

export function JumpButton({ to, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={() => jumpTo(to, true)}
      className={`${btnBase} ${variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}

export function ContactLink({ className = "", children = "contact form" }) {
  return (
    <Link to="/contact" className={`font-semibold underline underline-offset-4 ${className}`}>
      {children}
    </Link>
  );
}

/* ---------- Feature status ---------- */
export const FEATURE = {
  available: { label: "Available Now", cls: "bg-forest text-paper border-forest", desc: "Works today for real visitors." },
  demo: { label: "Demo", cls: "bg-lake-tint text-lake border-lake/40", desc: "A working preview with sample information. Nothing you try is stored." },
  development: { label: "In Development", cls: "bg-sun-tint text-ink border-sage", desc: "Being built now. Not yet available." },
  planned: { label: "Planned", cls: "border-dashed bg-transparent text-ink border-ink-soft", desc: "On the roadmap. No date promised." },
};

export function FeaturePill({ status, className = "" }) {
  const f = FEATURE[status];
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em] ${f.cls} ${className}`}
    >
      {f.label}
    </span>
  );
}

export const DISCLAIMER_TEXT =
  "RentalStories helps renters document and share their rental history. It does not provide legal advice, make rental decisions, or assign renter scores. Sample information is fictional and for demonstration only.";

export function SiteDisclaimer({ className = "" }) {
  return <Disclaimer className={className}>{DISCLAIMER_TEXT}</Disclaimer>;
}

export function EvidenceLegend({ compact = false }) {
  return (
    <dl className={`grid gap-4 ${compact ? "sm:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}>
      {Object.entries(EVIDENCE).map(([k, v]) => (
        <div key={k} className="flex flex-col gap-2 rounded-2xl border border-line bg-card p-4">
          <dt>
            <EvidenceBadge type={k} />
          </dt>
          <dd className="text-sm leading-relaxed text-ink">{compact ? v.desc : v.means}</dd>
        </div>
      ))}
    </dl>
  );
}

export function BuildYourOwn({ className = "" }) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-moss/30 bg-moss-tint p-4 sm:p-5 ${className}`}>
      <p className="max-w-2xl text-[0.95rem] text-ink">
        <span className="font-semibold">This page uses sample information.</span> Your own Passport, Evidence Vault and share links work for real once you create an account.
      </p>
      <BtnLink to="/my" arrow>Start your Rental Passport</BtnLink>
    </div>
  );
}
