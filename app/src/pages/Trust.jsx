import { Link } from "react-router";
import Eye from "icon:eye-off";
import Scissors from "icon:scissors";
import KeyRound from "icon:key-round";
import Smartphone from "icon:smartphone";
import UserLock from "icon:user-lock";
import ScrollText from "icon:scroll-text";
import Timer from "icon:timer";
import Siren from "icon:siren";
import Bot from "icon:bot";
import Handshake from "icon:handshake";
import { Container, Eyebrow, BtnLink, PrivacyLadder, SectionTitle, Disclaimer, ContactLink, FeaturePill } from "../components/ui.jsx";

const PILLARS = [
  { icon: Eye, t: "Privacy by default", d: "Everything you add starts Private. Nothing becomes visible to anyone until you take an explicit action.", you: "No setting to find and switch off." },
  { icon: Scissors, t: "Data minimization", d: "We collect what each feature needs. Shares reveal only the items you tick, and nothing else.", you: "Prove more. Expose less." },
  { icon: KeyRound, t: "Encryption", st: "planned", d: "Your information is designed to be encrypted in transit and when stored, with documents protected separately from the rest of your record.", you: "Intercepted data should be unreadable." },
  { icon: Smartphone, t: "MFA & authentication", st: "planned", d: "Accounts are designed with multi-factor sign-in, and sensitive actions — like creating a share or deleting data — ask you to confirm it’s you.", you: "A password alone shouldn’t be enough." },
  { icon: UserLock, t: "Access control", st: "available", d: "Only you can open your Passport. Each share link is made for one recipient, one choice of items and one time window. Anyone holding a link can open it, so send it only to the person you chose.", you: "No public renter search. No secret profiles." },
  { icon: ScrollText, t: "Audit logs", st: "available", d: "Every time a share link is opened, or a document is opened from it, it is recorded. You can see your own access history at any time.", you: "You can always see who looked, and when." },
  { icon: Timer, t: "Retention & deletion", st: "available", d: "Shares stop working when they expire or when you revoke them. You can delete records or your whole account, and download a copy of your data first.", you: "Your record doesn’t outlive your wishes." },
  { icon: Siren, t: "Incident response", d: "We maintain a plan for investigating and containing problems, and commit to telling affected people clearly and promptly if their information is ever exposed.", you: "Plain-language notice, not silence." },
  { icon: Bot, t: "Responsible AI", d: "AI helps organize leases and explain language. It never scores renters, decides who deserves housing, or publishes anything on its own.", you: "Always shows you the original clause." },
  { icon: Handshake, t: "Vendor governance", d: "Any service provider that touches your information is reviewed first, limited to what it needs, and bound by contract. We do not sell your private rental history.", you: "No quiet data hand-offs." },
];

export default function Trust() {
  return (
    <>
      <section className="on-dark bg-forest text-paper">
        <Container className="py-14 sm:py-20">
          <Eyebrow className="text-sage-soft">Trust &amp; Security</Eyebrow>
          <h1 className="rise mt-4 max-w-5xl text-[3rem] sm:text-6xl lg:text-[4.4rem]">Built so you never have to just trust us.</h1>
          <p className="rise mt-6 max-w-2xl text-xl text-paper" style={{ animationDelay: "0.1s" }}>
            Rental records are personal. Here is how RentalStories is designed to protect them — and, just as important,
            what we do not claim.
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "0.2s" }}>
            <BtnLink to="/privacy" variant="accent">Visit the Privacy Center</BtnLink>
            <BtnLink to="/responsible-ai" variant="light">Responsible AI</BtnLink>
          </div>
        </Container>
      </section>

      <Container className="py-16">
        <SectionTitle eyebrow="Three clear states" title="Private → Shared → Public." lead="Every piece of information is in exactly one of these states, and you can always see which." />
        <PrivacyLadder className="mt-8" />
        <p className="mt-6 rounded-2xl bg-sun px-5 py-4 text-lg font-semibold">
          Nothing moves from Private to Public without explicit user action.
        </p>
      </Container>

      <section className="border-y border-line bg-sand/50 py-16">
        <Container>
          <SectionTitle eyebrow="How we protect your information" title="Ten commitments." lead="Each is labelled with where it stands today. Where nothing is shown, it describes how we work." />
          <ul className="mt-10 grid gap-5 md:grid-cols-2">
            {PILLARS.map((p, i) => {
              const Icon = p.icon;
              return (
                <li key={p.t} className="flex gap-4 rounded-3xl border border-line bg-card p-6">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sun"><Icon className="h-6 w-6" aria-hidden="true" /></span>
                  <div>
                    <p className="font-mono text-xs font-semibold text-moss">{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="text-3xl">{p.t}</h3>
                    {p.st && <p className="mt-2"><FeaturePill status={p.st} /></p>}
                    <p className="mt-2">{p.d}</p>
                    <p className="mt-3 text-sm font-semibold">For you: <span className="font-normal text-ink-soft">{p.you}</span></p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <Container className="grid gap-6 py-16 lg:grid-cols-2">
        <div className="rounded-3xl border border-dashed border-sage p-6 sm:p-8">
          <h2 className="text-4xl">What we don’t claim</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-lg">
            <li>We don’t claim any security certification or independent audit unless and until we have actually achieved it — and when we do, we’ll say exactly which one and link to the evidence.</li>
            <li>We don’t say “100% secure”. No service can honestly promise that.</li>
            <li>This is an early version. The commitments above describe how the product is designed to work, and the labels show what is in place today.</li>
          </ul>
        </div>
        <div className="rounded-3xl bg-moss p-6 text-white on-dark sm:p-8">
          <h2 className="text-4xl text-white">Our promises</h2>
          <ul className="mt-4 space-y-3 text-xl font-semibold">
            <li>Your rental record belongs to you.</li>
            <li>Private by default.</li>
            <li>We do not sell your private rental history.</li>
          </ul>
          <p className="mt-6 text-white">
            See the controls in action: <Link to="/privacy" className="font-semibold underline underline-offset-4">active shares, access history, download and delete</Link>.
          </p>
        </div>
      </Container>

      <Container className="pb-16">
        <Disclaimer>
          Have a security concern or found something that looks wrong? We take every report seriously. Send us a note through the{" "}
          <ContactLink /> and our team will take it from there.
        </Disclaimer>
      </Container>
    </>
  );
}
