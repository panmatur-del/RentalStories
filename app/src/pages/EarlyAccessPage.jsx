import ShieldCheck from "icon:shield-check";
import { Container, Eyebrow, ContactLink } from "../components/ui.jsx";
import EarlyAccess from "../components/EarlyAccess.jsx";

const WHO = [
  ["Renters", "Build a private, evidence-backed record and understand your lease."],
  ["Landlords", "Receive renter-authorized evidence with sources and dates."],
  ["Property managers", "Streamline how rental evidence reaches your team."],
  ["Housing professionals", "Help the people you support carry their record forward."],
  ["Financial counsellors", "Give clients a clearer picture of their rental story."],
  ["Partners", "Work with us on verification, data and community."],
];

export default function EarlyAccessPage() {
  return (
    <section>
      <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <Eyebrow className="text-moss">Join Early Access</Eyebrow>
          <h1 className="rise mt-4 text-[3rem] sm:text-6xl lg:text-[4rem]">Be among the first to build your rental story.</h1>
          <p className="rise mt-5 max-w-xl text-lg text-ink-soft" style={{ animationDelay: "0.1s" }}>
            RentalStories is opening gradually. Tell us who you are and we’ll write when your place is ready.
          </p>
          <ul className="mt-10 divide-y divide-line border-y border-line">
            {WHO.map(([t, d]) => (
              <li key={t} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <span className="font-display text-2xl text-forest">{t}</span>
                <span className="text-ink-soft">{d}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="self-start rounded-3xl border border-line bg-card p-6 shadow-[0_30px_70px_-40px_rgba(23,58,43,0.4)] sm:p-9">
          <h2 className="text-3xl">Reserve your place</h2>
          <p className="mt-2 flex items-start gap-2 text-sm text-ink-soft">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-moss" aria-hidden="true" />
            Basic contact details only. We’re not collecting leases, IDs or other documents yet.
          </p>
          <div className="mt-6">
            <EarlyAccess />
          </div>
          <p className="mt-6 text-sm text-ink-soft">
            Questions before you sign up? Use our <ContactLink />.
          </p>
        </div>
      </Container>
    </section>
  );
}
