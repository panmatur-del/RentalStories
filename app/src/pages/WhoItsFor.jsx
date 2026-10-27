import { Link } from "react-router";
import Globe from "icon:globe";
import HandCoins from "icon:hand-coins";
import Briefcase from "icon:briefcase";
import GraduationCap from "icon:graduation-cap";
import Key from "icon:key-round";
import Users from "icon:users";
import { Container, Eyebrow, BtnLink, SiteDisclaimer, SectionTitle } from "../components/ui.jsx";

const GROUPS = [
  {
    icon: Globe,
    t: "Newcomers without Canadian credit history",
    d: "A new country can mean a blank credit file, even after years of paying rent on time. A Passport can hold lease copies, receipts and references from where you have lived, each labelled with its source.",
  },
  {
    icon: HandCoins,
    t: "Renters affected by a consumer proposal or hardship",
    d: "Your credit file may show a hard stretch. Your Passport shows the rent you actually paid through it, with your own explanation set beside the evidence.",
  },
  {
    icon: Briefcase,
    t: "Self-employed and contract workers",
    d: "Income that moves around does not fit a payslip. Months of documented rent, and a short note from you, say more about how you rent.",
  },
  {
    icon: GraduationCap,
    t: "Students",
    d: "A first lease often comes with no references. Start the record early, keep your leases and receipts together and take them with you.",
  },
  {
    icon: Key,
    t: "First-time renters",
    d: "Every long rental record starts with one tenancy. Begin on day one and build something you can use at the next move.",
  },
  {
    icon: Users,
    t: "People leaving shared or family housing",
    d: "If the lease was never in your name, there is still a history. Ask the lease holder to confirm that you lived there and paid your share.",
  },
];

export default function WhoItsFor() {
  return (
    <>
      <section>
        <Container className="py-14 sm:py-20">
          <Eyebrow className="text-moss">Who it’s for</Eyebrow>
          <h1 className="rise mt-4 max-w-4xl text-[2.75rem] sm:text-6xl lg:text-[3.6rem]">
            Your credit history may explain your finances. <em className="text-moss">Your Rental Passport shows how you actually rent.</em>
          </h1>
          <p className="rise mt-6 max-w-2xl text-lg text-ink-soft sm:text-xl" style={{ animationDelay: "0.1s" }}>
            Some renters are well served by a credit file. Many are not. A Passport lets them show the record they have
            earned, in their own order, with evidence.
          </p>
        </Container>
      </section>

      <Container className="pb-12">
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((g) => {
            const Icon = g.icon;
            return (
              <li key={g.t} className="flex flex-col rounded-3xl border border-line bg-card p-6">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-moss-tint text-forest">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-sans text-xl font-semibold leading-snug">{g.t}</h2>
                <p className="mt-2 text-ink-soft">{g.d}</p>
              </li>
            );
          })}
        </ul>
      </Container>

      <section className="on-dark bg-forest py-16 text-paper sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl text-paper sm:text-5xl">Evidence and context. Never concealment.</h2>
            <p className="mt-4 text-lg text-paper">
              RentalStories helps you provide evidence and add context. It is not a way to hide legitimate information
              or get around a landlord’s screening. Credit information stays with the people and services that hold it,
              and a landlord remains free to ask for it.
            </p>
          </div>
          <ul className="space-y-3 text-paper">
            {[
              "Your explanation is labelled as yours and sits apart from the verified facts.",
              "Nothing is hidden from a reader who has been given access, and nothing is added without your say.",
              "You choose what to share for each application, and you can stop sharing at any time.",
              "Your Passport is a supplement to a landlord’s own process, not a replacement for it.",
            ].map((t) => (
              <li key={t} className="rounded-2xl border border-paper/35 p-4">{t}</li>
            ))}
          </ul>
        </Container>
      </section>

      <Container className="py-16">
        <SectionTitle eyebrow="Next step" title="See what a Passport looks like." />
        <div className="mt-6 flex flex-wrap gap-3">
          <BtnLink to="/passport" arrow>Explore a sample Passport</BtnLink>
          <BtnLink to="/early-access" variant="ghost">Join Early Access</BtnLink>
        </div>
        <p className="mt-8 text-ink-soft">
          Want to know how we handle your information? Read our{" "}
          <Link to="/privacy" className="font-semibold text-forest underline underline-offset-4">privacy page</Link>.
        </p>
        <SiteDisclaimer className="mt-8" />
      </Container>
    </>
  );
}
