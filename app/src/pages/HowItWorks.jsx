import { Link } from "react-router";
import { Container, Eyebrow, BtnLink, FeaturePill, SiteDisclaimer } from "../components/ui.jsx";

const STEPS = [
  ["Create a tenancy", "Add where you lived, the dates and the rent. It starts as Renter Provided and private.", "available", "/my/tenancies"],
  ["Add leases and evidence", "Put leases, receipts, move-in records, notices and messages in your Evidence Vault.", "available", "/my/vault"],
  ["Classify the evidence", "Mark each record as Renter Provided, Document Supported or Payment Supported.", "available", "/my/vault"],
  ["Ask for landlord confirmation", "Send a housing provider a private request to confirm dates, address and rent.", "available", "/my/tenancies"],
  ["Generate your Rental Passport", "Your tenancies, evidence, sources and dates, gathered in one private record.", "available", "/my"],
  ["Choose what to share", "Pick a package, such as Tenancy History or Rental Application, or tick exactly what you want.", "available", "/my/share"],
  ["Create an expiring link", "Name the recipient and set how long they can look. Links end on their own.", "available", "/my/share"],
  ["See who looked", "Every view is written to your access history, so you always know who saw what.", "available", "/my/share"],
  ["Revoke access", "Stop sharing with one click. The link stops working straight away.", "available", "/my/share"],
  ["Download your records", "Take a copy of what you have stored. It is yours.", "available", "/my/account"],
  ["Ask for corrections", "If something is wrong, ask for a correction. Both versions stay visible until it is settled.", "available", "/my/tenancies"],
  ["Delete when you want", "Remove a record, or your account, whenever you like.", "available", "/my/account"],
];

export default function HowItWorks() {
  return (
    <>
      <section>
        <Container className="py-14 sm:py-20">
          <Eyebrow className="text-moss">How it works</Eyebrow>
          <h1 className="rise mt-4 max-w-4xl text-[2.75rem] sm:text-6xl lg:text-[3.6rem]">
            Build the record. <em className="text-moss">Share only what matters.</em>
          </h1>
          <p className="rise mt-6 max-w-2xl text-lg text-ink-soft sm:text-xl" style={{ animationDelay: "0.1s" }}>
            Build a private, evidence-backed record of how you rent. Share only what matters, with whom you choose, for as
            long as you choose.
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "0.2s" }}>
            <BtnLink to="/my" arrow>Start your Rental Passport</BtnLink>
            <BtnLink to="/status" variant="ghost">See what works today</BtnLink>
          </div>
        </Container>
      </section>

      <Container className="pb-12">
        <ol className="relative grid gap-4 md:grid-cols-2">
          {STEPS.map(([t, d, st, to], i) => (
            <li key={t} className="flex gap-4 rounded-3xl border border-line bg-card p-5 sm:p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest font-mono text-sm font-semibold text-paper">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-sans text-xl font-semibold leading-snug">{t}</h2>
                </div>
                <p className="mt-1 text-ink-soft">{d}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <FeaturePill status={st} />
                  <Link to={to} className="inline-flex min-h-9 items-center text-sm font-semibold text-forest underline underline-offset-4">
                    See it
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Container>

      <section className="on-dark bg-forest py-16 text-paper">
        <Container className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="text-4xl text-paper sm:text-5xl">Choose the evidence. Choose the recipient. Choose the duration.</h2>
          </div>
          <div className="space-y-3 text-lg text-paper">
            <p>Your rental history belongs to you. We do not sell your private rental information.</p>
            <p>There is no public renter search, no secret profile and no score.</p>
          </div>
        </Container>
      </section>

      <Container className="py-14">
        <SiteDisclaimer />
      </Container>
    </>
  );
}
