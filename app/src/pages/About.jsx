import { Link } from "react-router";
import Check from "icon:check";
import { Container, Eyebrow, BtnLink, SectionTitle, SiteDisclaimer } from "../components/ui.jsx";

const MISSION = [
  "Your rental history should move with you.",
  "A rental record should be backed by evidence.",
  "Private information stays under renter control.",
  "Trust comes from transparency, not from scores.",
];

const COMMITMENTS = [
  "Private by default.",
  "Not a credit score. Not a renter score.",
  "No public renter directory.",
  "No secret profiles.",
  "We do not sell your private rental information.",
  "No automatic lease publication.",
  "No fake testimonials or statistics.",
  "No automated housing decisions.",
  "Every evidence label shows its source and date.",
  "You can ask for corrections and dispute incorrect information.",
  "Renter explanations stay separate from verified facts.",
  "Features are labelled Available Now, Demo, In Development or Planned.",
  "Sharing is controlled and revocable.",
  "We collect only what’s necessary.",
  "Public community stories stay separate from private renter data.",
];

export default function About() {
  return (
    <>
      <section>
        <Container className="py-16 sm:py-24">
          <Eyebrow className="text-moss">About RentalStories</Eyebrow>
          <h1 className="rise mt-5 max-w-4xl text-[3rem] sm:text-6xl lg:text-[4.2rem]">
            Where it started: a question worth asking.
          </h1>
          <figure className="rise mt-10 max-w-4xl border-l-4 border-sage pl-6 sm:pl-10" style={{ animationDelay: "0.1s" }}>
            <blockquote className="font-display text-3xl leading-snug text-forest sm:text-4xl">
              “RentalStories began with a simple question: What happens when someone’s credit history tells one story,
              but years of responsible renting tell another?”
            </blockquote>
          </figure>
          <p className="rise mt-8 max-w-2xl text-lg text-ink-soft" style={{ animationDelay: "0.2s" }}>
            RentalStories is a private, portable, evidence-backed rental history platform, built for every renter and not
            only those with something to prove. It is not a credit bureau, a screening service, a blacklist, a
            marketplace or a renter-scoring system.
          </p>
        </Container>
      </section>

      <section className="on-dark bg-forest py-20 text-paper sm:py-24">
        <Container>
          <Eyebrow className="text-sage-soft">Our mission</Eyebrow>
          <ul className="mt-6 grid gap-x-12 gap-y-6 md:grid-cols-2">
            {MISSION.map((m) => (
              <li key={m} className="border-t border-paper/30 pt-5 font-display text-4xl leading-tight text-paper sm:text-[2.6rem]">
                {m}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <SectionTitle
              eyebrow="What we hold ourselves to"
              title="Trust is earned through privacy, evidence, transparency and renter control."
            />
            <p className="mt-6 text-lg text-ink-soft">
              These aren’t aspirations for later. They’re the rules the product is built around from the very first
              screen.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {COMMITMENTS.map((c) => (
              <li key={c} className="flex gap-3 rounded-2xl border border-line bg-card p-4">
                <Check className="mt-1 h-4 w-4 shrink-0 text-moss" aria-hidden="true" />
                <span className="font-semibold">{c}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Container className="pb-12">
        <SiteDisclaimer />
      </Container>

      <section className="border-y border-line bg-sand/70 py-16">
        <Container className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-4xl sm:text-5xl">Help shape it from the start.</h2>
            <p className="mt-3 max-w-xl text-lg text-ink-soft">
              We’re opening to early members first — renters, landlords, property managers, housing professionals,
              financial counsellors and partners.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <BtnLink to="/early-access" arrow>
              Join Early Access
            </BtnLink>
            <BtnLink to="/trust" variant="ghost">
              Trust &amp; Security
            </BtnLink>
          </div>
        </Container>
      </section>
    </>
  );
}
