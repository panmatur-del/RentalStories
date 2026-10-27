import { Link } from "react-router";
import ShieldCheck from "icon:shield-check";
import ArrowRight from "icon:arrow-right";
import Check from "icon:check";
import X from "icon:x";
import Lock from "icon:lock";
import Minus from "icon:minus";
import IdCard from "icon:id-card";
import Archive from "icon:archive";
import Share2 from "icon:share-2";
import FileSearch from "icon:file-search";
import MessageSquareQuote from "icon:message-square-quote";
import History from "icon:history";
import CreditCard from "icon:credit-card";
import {
  Container,
  Eyebrow,
  BtnLink,
  EvidenceBadge,
  FeaturePill,
  EvidenceLegend,
  SectionTitle,
  SiteDisclaimer,
} from "../components/ui.jsx";
import EarlyAccess from "../components/EarlyAccess.jsx";
import { PACKAGES } from "../data/passport.js";

/* ---------- Hero ---------- */
function PassportCard() {
  return (
    <div className="rise relative mx-auto w-full max-w-md" style={{ animationDelay: "0.25s" }}>
      <div className="absolute -inset-4 rounded-[2.25rem] bg-sage-soft/60" aria-hidden="true" />
      <div className="relative rounded-[1.75rem] border border-line bg-card p-6 shadow-[0_30px_70px_-34px_rgba(23,58,43,0.45)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              Rental Passport · sample
            </p>
            <p className="mt-1 font-display text-3xl text-forest">Alex Rivera</p>
            <p className="text-sm text-ink-soft">Fictional renter</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3 py-1.5 font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-paper">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Private
          </span>
        </div>

        <div className="perf my-5 h-[2px]" />

        <ol className="relative ml-1.5 space-y-5 border-l border-sage pl-6">
          {[
            ["2023 to now", "412 Alder Street", ["landlord", "payment"], "Confirmed by Harbor Row Properties, Sep 12, 2026"],
            ["2020 to 2023", "88 Mill Lane", ["document", "disputed"], "Move-out date disputed. Both versions are shown."],
            ["2019 to 2020", "19 Ferry Road", ["self"], "Waiting for a reply. Not counted against anything."],
          ].map(([yrs, addr, ev, note]) => (
            <li key={addr} className="relative">
              <span className="absolute -left-[1.95rem] top-1.5 h-3 w-3 rounded-full border-2 border-forest bg-card" aria-hidden="true" />
              <span className="font-mono text-xs font-semibold text-moss">{yrs}</span>
              <span className="mt-0.5 block font-semibold leading-tight">{addr}</span>
              <span className="mt-1.5 flex flex-wrap items-center gap-2">
                {ev.map((e) => <EvidenceBadge key={e} type={e} />)}
              </span>
              <span className="mt-1 block text-xs text-ink-soft">{note}</span>
            </li>
          ))}
        </ol>

        <div className="perf my-5 h-[2px]" />
        <p className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-5 w-5 shrink-0 text-moss" aria-hidden="true" />
          Shared with no one. You choose the evidence, the recipient and the duration.
        </p>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="overflow-hidden">
      <Container className="grid items-center gap-16 py-16 sm:py-24 lg:grid-cols-[1.12fr_1fr] lg:gap-14">
        <div>
          <Eyebrow className="rise text-moss">Rental Passport · Private by default</Eyebrow>
          <h1 className="rise mt-5 text-[3.1rem] sm:text-6xl lg:text-[4.6rem]" style={{ animationDelay: "0.08s" }}>
            Your rental history should <em className="text-moss">move with you.</em>
          </h1>
          <p className="rise mt-6 max-w-xl text-xl text-ink" style={{ animationDelay: "0.16s" }}>
            Build a private, evidence-backed record of how you rent. Share only what matters, with whom you choose, for as
            long as you choose.
          </p>
          <p className="rise mt-5 max-w-xl border-l-4 border-sage pl-4 font-display text-2xl leading-snug text-forest" style={{ animationDelay: "0.22s" }}>
            Not a credit score. Not a renter score. Your documented rental history.
          </p>
          <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "0.3s" }}>
            <BtnLink to="/passport" arrow>Explore a sample Passport</BtnLink>
            <BtnLink to="/early-access" variant="ghost">Join Early Access</BtnLink>
          </div>
          <p className="rise mt-5 text-sm text-ink-soft" style={{ animationDelay: "0.36s" }}>
            Early version. Some pages show sample information. <Link to="/status" className="font-semibold text-forest underline underline-offset-4">See what works today.</Link>
          </p>
        </div>
        <PassportCard />
      </Container>
    </section>
  );
}

/* ---------- Why renters need it ---------- */
function WhyPassport() {
  return (
    <section className="border-y border-line bg-sand/70 py-20 sm:py-24">
      <Container>
        <SectionTitle
          eyebrow="Why a Passport"
          title="Your credit history may explain your finances. Your Rental Passport shows how you actually rent."
          lead="Credit files often leave out rent altogether. Years of paying on time can go unseen, and a hard stretch can speak louder than a good record."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-line bg-card p-7 sm:p-9">
            <div className="flex items-center gap-3 text-ink-soft">
              <CreditCard className="h-6 w-6" aria-hidden="true" />
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em]">Credit history</p>
            </div>
            <h3 className="mt-4 text-3xl">How you have handled borrowing.</h3>
            <ul className="mt-5 space-y-3 text-ink-soft">
              {["Cards, loans and lines of credit", "Often leaves out your monthly rent", "Can lag behind where your life is today", "Little room to explain what happened"].map((t) => (
                <li key={t} className="flex gap-3"><Minus className="mt-1.5 h-4 w-4 shrink-0" aria-hidden="true" />{t}</li>
              ))}
            </ul>
          </article>
          <article className="on-dark rounded-3xl bg-forest p-7 text-paper sm:p-9">
            <div className="flex items-center gap-3 text-sage-soft">
              <History className="h-6 w-6" aria-hidden="true" />
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em]">Rental Passport</p>
            </div>
            <h3 className="mt-4 text-3xl text-paper">How you actually rent.</h3>
            <ul className="mt-5 space-y-3 text-paper">
              {["Where you have lived, and for how long", "Rent paid, backed by receipts and records", "Confirmations from the people who know", "Your own context, beside the facts"].map((t) => (
                <li key={t} className="flex gap-3"><Check className="mt-1.5 h-4 w-4 shrink-0 text-sage-soft" aria-hidden="true" />{t}</li>
              ))}
            </ul>
          </article>
        </div>
        <p className="mt-8 max-w-3xl text-lg text-ink-soft">
          RentalStories does not replace a credit report and does not hide one. It makes sure the rest of your story can be
          told, by you, with evidence.
        </p>
      </Container>
    </section>
  );
}

/* ---------- The five parts ---------- */
const PARTS = [
  { to: "/evidence-vault", icon: Archive, t: "Evidence Vault", st: "available", d: "Private storage for leases, receipts, move-in records, notices and messages, each classified by evidence level." },
  { to: "/share", icon: Share2, t: "Secure Share", st: "available", d: "Choose the evidence, the recipient and the duration. Expiring links, access history and instant revoke." },
  { to: "/lease-check", icon: FileSearch, t: "Lease Check", st: "available", d: "Plain-language help reading your own lease, on your device. Educational, not legal advice." },
  { to: "/stories", icon: MessageSquareQuote, t: "Rental Stories", st: "available", d: "Optional, moderated, consent-based community experiences. Secondary to your Passport." },
];

function Platform() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <SectionTitle eyebrow="One platform, one purpose" title="The Passport comes first. Everything else supports it." />
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <Link to="/my" className="on-dark group flex flex-col justify-between rounded-3xl bg-forest p-8 text-paper transition-transform hover:-translate-y-0.5 sm:p-10">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <IdCard className="h-9 w-9 text-sage-soft" aria-hidden="true" />
                <FeaturePill status="available" className="!border-paper !bg-paper !text-forest" />
              </div>
              <h3 className="mt-6 text-5xl text-paper">Rental Passport</h3>
              <p className="mt-4 text-lg text-paper">
                The main product. A private, portable record of your tenancies, with the evidence behind each one, the
                source, the date and any dispute. It is yours to build, carry and share.
              </p>
            </div>
            <span className="mt-8 inline-flex items-center gap-2 font-semibold text-paper">
              Start your Rental Passport <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
          <ul className="grid gap-4">
            {PARTS.map((p) => {
              const Icon = p.icon;
              return (
                <li key={p.to}>
                  <Link to={p.to} className="flex h-full gap-4 rounded-3xl border border-line bg-card p-5 transition-colors hover:border-forest sm:p-6">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-moss-tint text-forest">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-2xl leading-tight">{p.t}</span>
                        <FeaturePill status={p.st} />
                      </span>
                      <span className="mt-1 block text-ink-soft">{p.d}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}

/* ---------- What goes in ---------- */
const INSIDE = [
  "Tenancy dates and addresses",
  "Leases",
  "Payment evidence",
  "Landlord confirmations",
  "References",
  "Deposits",
  "Move-in and move-out records",
  "Maintenance",
  "Notices",
  "Key communications",
  "Completed-tenancy confirmations",
];

function Inside() {
  return (
    <section className="border-y border-line bg-sand/70 py-20 sm:py-24">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <SectionTitle
            eyebrow="Inside your Passport"
            title="Everything that shows how you rent, in one place."
            lead="Add what you have. Strengthen it over time as people confirm it."
          />
          <ul className="mt-8 flex flex-wrap gap-2">
            {INSIDE.map((t) => (
              <li key={t} className="rounded-full border border-line bg-card px-4 py-2 text-[0.95rem] font-semibold">{t}</li>
            ))}
          </ul>
        </div>
        <article className="self-start rounded-3xl border border-line bg-card p-7 sm:p-9">
          <Eyebrow className="text-moss">Context, kept apart</Eyebrow>
          <h3 className="mt-3 text-3xl">Your explanation, beside the facts.</h3>
          <p className="mt-3 text-ink-soft">
            A credit issue, a consumer proposal, a gap in work, self-employment, immigration or a dispute may not show how
            you rent. Add your own context. It is always labelled as yours, and shown apart from the evidence.
          </p>
          <p className="mt-4 flex items-start gap-2 text-sm font-semibold">
            <EvidenceBadge type="self" />
            <span className="pt-1">Your words never change an evidence level.</span>
          </p>
        </article>
      </Container>
    </section>
  );
}

/* ---------- Evidence levels ---------- */
function Levels() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <SectionTitle
          eyebrow="Evidence levels"
          title="Trust built on evidence, not on scores."
          lead="Every item says what backs it, who it came from and when. There are no unexplained badges."
        />
        <div className="mt-10"><EvidenceLegend compact /></div>
        <p className="mt-8">
          <Link to="/evidence-levels" className="inline-flex items-center gap-2 font-semibold text-forest underline underline-offset-4">
            What the levels mean, and what they never do <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </p>
      </Container>
    </section>
  );
}

/* ---------- Sharing ---------- */
function Sharing() {
  return (
    <section className="on-dark bg-forest py-20 text-paper sm:py-24">
      <Container>
        <Eyebrow className="text-sage-soft">Controlled sharing</Eyebrow>
        <h2 className="mt-3 max-w-4xl text-4xl text-paper sm:text-6xl">Choose the evidence. Choose the recipient. Choose the duration.</h2>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            ["1", "Choose the evidence", "Tick exactly what to include. Nothing is shared by default."],
            ["2", "Choose the recipient", "Name who it is for. Only people with the link can open it."],
            ["3", "Choose the duration", "Links expire on their own. Revoke any time, and see every view."],
          ].map(([n, t, d]) => (
            <li key={n} className="rounded-3xl border border-paper/35 p-6">
              <span className="font-mono text-sm font-semibold text-sage-soft">{n}</span>
              <h3 className="mt-2 text-3xl text-paper">{t}</h3>
              <p className="mt-2 text-paper">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-sage-soft">Ready-made packages</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {PACKAGES.map((p) => (
            <li key={p.id} className="rounded-full border border-paper/50 px-4 py-2 font-semibold text-paper">{p.label}</li>
          ))}
        </ul>
        <p className="mt-10 max-w-2xl font-display text-3xl leading-snug text-paper">
          Your rental history belongs to you. We do not sell your private rental information.
        </p>
        <div className="mt-8"><BtnLink to="/share" variant="light" arrow>Try Secure Share</BtnLink></div>
      </Container>
    </section>
  );
}

/* ---------- Landlords ---------- */
function Landlords() {
  return (
    <section className="py-20 sm:py-24">
      <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionTitle
            eyebrow="For landlords"
            title="A simple, credible review. The renter stays in control."
            lead="When a renter chooses to share, you see a tenancy timeline, where each fact comes from, any confirmations, payment evidence and the documents they have authorised."
          />
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <BtnLink to="/landlords" arrow>See the landlord view</BtnLink>
            <FeaturePill status="available" />
          </div>
        </div>
        <ul className="grid gap-3 self-start">
          {["Hidden renter profiles", "Secret searches", "Blacklists", "Scores or ratings", "Automated rental decisions"].map((t) => (
            <li key={t} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-4">
              <X className="h-5 w-5 shrink-0 text-clay" aria-hidden="true" />
              <span className="font-semibold">Never: {t.toLowerCase()}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ---------- Not ---------- */
function NotThis() {
  return (
    <section className="border-y border-line bg-sand/70 py-16">
      <Container>
        <h2 className="text-4xl sm:text-5xl">What RentalStories is not.</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {["A credit bureau", "A screening service", "A blacklist", "A marketplace", "A renter-scoring system"].map((t) => (
            <li key={t} className="rounded-2xl border border-line bg-card p-4 font-semibold">{t}</li>
          ))}
        </ul>
        <p className="mt-6 max-w-3xl text-lg text-ink-soft">
          It is a private, portable, evidence-backed rental history that you own. It helps people who rent, including
          newcomers, students, first-time renters and self-employed renters, show the record they have earned.{" "}
          <Link to="/who-its-for" className="font-semibold text-forest underline underline-offset-4">Who it is for</Link>
        </p>
      </Container>
    </section>
  );
}

/* ---------- Honest status + early access ---------- */
function Join() {
  return (
    <section className="py-20 sm:py-24">
      <Container className="grid gap-12 lg:grid-cols-2">
        <div>
          <Eyebrow className="text-moss">Early access</Eyebrow>
          <h2 className="mt-3 text-4xl sm:text-5xl">Help shape it from the start.</h2>
          <p className="mt-4 text-lg text-ink-soft">
            RentalStories is an early version. You can create an account, build your Passport, store evidence and share it with
            an expiring link today. Independently Verified evidence and multi-factor sign-in are still Planned.
          </p>
          <p className="mt-4">
            <Link to="/status" className="font-semibold text-forest underline underline-offset-4">See every feature and its status</Link>
          </p>
        </div>
        <div className="rounded-3xl border border-line bg-card p-6 sm:p-8"><EarlyAccess /></div>
      </Container>
      <Container className="mt-4">
        <SiteDisclaimer />
      </Container>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <WhyPassport />
      <Platform />
      <Inside />
      <Levels />
      <Sharing />
      <Landlords />
      <NotThis />
      <Join />
    </>
  );
}
