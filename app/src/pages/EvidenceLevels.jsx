import { Link } from "react-router";
import Check from "icon:check";
import X from "icon:x";
import {
  Container,
  Eyebrow,
  BtnLink,
  EvidenceBadge,
  StatusBadge,
  SectionTitle,
  EVIDENCE,
  FeaturePill,
  SiteDisclaimer,
  fmtDate,
} from "../components/ui.jsx";

const ORDER = ["self", "document", "payment", "landlord", "provider", "disputed"];
const STATE = { self: "available", document: "demo", payment: "demo", landlord: "development", provider: "planned", disputed: "demo" };

function Anatomy() {
  const rows = [
    ["Fact", "Lived at 412 Alder Street, March 2023 to present"],
    ["Evidence level", null],
    ["Source", "Harbor Row Properties, property manager"],
    ["Confirmed on", fmtDate("2026-09-12")],
    ["Dispute status", null],
  ];
  return (
    <div className="rounded-3xl border border-line bg-card p-6 shadow-[0_30px_70px_-40px_rgba(23,58,43,0.4)] sm:p-8">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">One record, sample</p>
      <dl className="mt-4 divide-y divide-line">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
            <dt className="text-sm font-semibold text-ink-soft">{k}</dt>
            <dd>
              {k === "Evidence level" ? (
                <span className="flex flex-wrap gap-2">
                  <EvidenceBadge type="landlord" />
                  <EvidenceBadge type="payment" />
                </span>
              ) : k === "Dispute status" ? (
                <StatusBadge status="confirmed" />
              ) : (
                v
              )}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-sm text-ink-soft">
        If either side disputes a fact, the label changes to “Disputed / Correction Requested” and both versions appear.
      </p>
    </div>
  );
}

export default function EvidenceLevels() {
  return (
    <>
      <section>
        <Container className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Eyebrow className="text-moss">Evidence levels</Eyebrow>
            <h1 className="rise mt-4 text-[2.75rem] sm:text-6xl lg:text-[3.8rem]">
              Trust built on evidence, <em className="text-moss">not on a score.</em>
            </h1>
            <p className="rise mt-6 max-w-xl text-lg text-ink-soft sm:text-xl" style={{ animationDelay: "0.1s" }}>
              Every item in a Rental Passport carries a label that says what backs it, who it came from and when. There
              is no “verified” badge without a reason, and no number to add up.
            </p>
            <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "0.2s" }}>
              <BtnLink to="/passport" arrow>See a sample Passport</BtnLink>
              <BtnLink to="/corrections" variant="ghost">How corrections work</BtnLink>
            </div>
          </div>
          <Anatomy />
        </Container>
      </section>

      <section className="border-y border-line bg-sand/70 py-16 sm:py-20">
        <Container>
          <SectionTitle
            eyebrow="Six labels"
            title="What each label means."
            lead="Labels describe the source of a fact. They are not ranked, and a Renter Provided fact is not a bad fact."
          />
          <ul className="mt-10 grid gap-5 md:grid-cols-2">
            {ORDER.map((k) => (
              <li key={k} className="flex flex-col gap-3 rounded-3xl border border-line bg-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <EvidenceBadge type={k} />
                  <FeaturePill status={STATE[k]} />
                </div>
                <p className="text-lg">{EVIDENCE[k].desc}</p>
                <p className="text-ink-soft">{EVIDENCE[k].means}</p>
                <p className="text-sm font-semibold text-ink">{EVIDENCE[k].needs}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Container className="py-16 sm:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="on-dark rounded-3xl bg-forest p-7 text-paper sm:p-9">
            <h2 className="text-3xl text-paper">What a label does</h2>
            <ul className="mt-5 space-y-3 text-paper">
              {[
                "Tells a reader where a fact came from",
                "Shows the name or document behind it, and the date",
                "Stays attached when you share",
                "Changes if someone asks for a correction",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <Check className="mt-1.5 h-4 w-4 shrink-0 text-sage-soft" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-3xl border border-line bg-card p-7 sm:p-9">
            <h2 className="text-3xl">What a label never does</h2>
            <ul className="mt-5 space-y-3">
              {[
                "Add up to a renter score or a rating",
                "Say that someone is a good or a bad tenant",
                "Recommend that anyone be approved or declined",
                "Hide a disagreement between a renter and a landlord",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <X className="mt-1.5 h-4 w-4 shrink-0 text-clay" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <SectionTitle
            eyebrow="Renter words and verified facts"
            title="Your explanation sits beside the facts, never inside them."
          />
          <div className="space-y-4 text-lg text-ink-soft">
            <p>
              A renter can add context when credit issues, a consumer proposal, a gap in work, self-employment or a
              dispute do not tell the whole story of how they rent. That context is always labelled as the renter’s own
              words.
            </p>
            <p>
              It is shown in its own section, apart from the facts that carry an evidence level, so a reader can see both
              and judge for themselves. Context never changes a label, and a label never edits what you wrote.
            </p>
            <p>
              <Link to="/who-its-for" className="font-semibold text-forest underline underline-offset-4">
                See who benefits most
              </Link>
            </p>
          </div>
        </div>
      </Container>

      <Container className="pb-16">
        <SiteDisclaimer />
      </Container>
    </>
  );
}
