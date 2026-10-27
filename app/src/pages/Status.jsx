import { Link } from "react-router";
import { Container, Eyebrow, FeaturePill, FEATURE, SiteDisclaimer, BtnLink } from "../components/ui.jsx";

const GROUPS = [
  {
    title: "The platform",
    items: [
      ["Rental Passport", "available", "Create an account and build your own private Passport: tenancies, evidence, context, all shown with their source and date."],
      ["Evidence Vault", "available", "Upload leases, receipts and other records, and classify each one yourself. Files are private to you until you share them."],
      ["Secure Share", "available", "Packages, expiring links, selective sharing, access history and instant revoke."],
      ["Lease Check", "available", "Read your own lease on your device and see plain-language notes. Nothing is uploaded or saved."],
      ["Rental Stories", "available", "Submit a story for review. Only approved stories appear."],
    ],
  },
  {
    title: "Evidence and confirmation",
    items: [
      ["Renter Provided, Document Supported and Payment Supported labels", "available", "You set these when you add a record. Document and Payment Supported need a file attached. We don’t claim to have authenticated the file."],
      ["Landlord confirmation requests", "available", "Send a private link. The housing provider confirms the facts, or says what differs. They don’t need an account."],
      ["Corrections and disputes", "available", "When details differ, both versions show side by side. You can accept theirs, agree, or keep yours with a note."],
      ["Linking bank or payment records automatically", "planned", "For now, payment evidence is a receipt or ledger you upload. Nothing is connected to your bank."],
      ["Independently Verified", "planned", "Confirmation by a named outside source. No providers are connected, so nothing can show this level yet."],
    ],
  },
  {
    title: "Accounts and control",
    items: [
      ["Accounts and sign-in", "available", "Email and password. Password resets and second-step sign-in by email or text are Planned and not available yet."],
      ["Download your records", "available", "A complete copy of what you’ve entered. Documents download one by one."],
      ["Delete records and account", "available", "Delete everything, or just your account, from your Account page."],
      ["Multi-factor sign-in", "planned", "Needs a second step such as a code sent to your email or phone, which isn’t available here yet."],
      ["Encryption of stored records, reviewed by a security professional", "planned", "Hosting handles protection of stored data. An independent review hasn’t happened yet. We don’t claim any certification."],
    ],
  },
  {
    title: "Early access and contact",
    items: [
      ["Join Early Access", "available", "Leave your name and email to hear what comes next."],
      ["Contact form", "available", "Messages are saved and read by our team."],
    ],
  },
];

export default function Status() {
  return (
    <>
      <section>
        <Container className="py-14 sm:py-20">
          <Eyebrow className="text-moss">Feature status</Eyebrow>
          <h1 className="rise mt-4 max-w-4xl text-[2.75rem] sm:text-6xl lg:text-[3.6rem]">
            What works today, and what doesn’t yet.
          </h1>
          <p className="rise mt-6 max-w-2xl text-lg text-ink-soft sm:text-xl" style={{ animationDelay: "0.1s" }}>
            RentalStories is an early version. We would rather tell you plainly what works and what doesn’t than let a
            preview pass for a finished product.
          </p>
          <dl className="rise mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" style={{ animationDelay: "0.2s" }}>
            {Object.entries(FEATURE).map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-line bg-card p-4">
                <dt><FeaturePill status={k} /></dt>
                <dd className="mt-2 text-sm text-ink">{v.desc}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <Container className="space-y-12 pb-16">
        {GROUPS.map((g) => (
          <section key={g.title}>
            <h2 className="text-3xl sm:text-4xl">{g.title}</h2>
            <ul className="mt-5 divide-y divide-line rounded-3xl border border-line bg-card">
              {g.items.map(([name, st, note]) => (
                <li key={name} className="grid gap-2 p-5 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-6">
                  <div>
                    <h3 className="font-sans text-lg font-semibold leading-snug">{name}</h3>
                    <p className="mt-1 text-ink-soft">{note}</p>
                  </div>
                  <div><FeaturePill status={st} /></div>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <div className="flex flex-wrap items-center gap-4">
          <BtnLink to="/early-access" arrow>Join Early Access</BtnLink>
          <p className="text-ink-soft">
            Questions about any of this? Use our{" "}
            <Link to="/contact" className="font-semibold text-forest underline underline-offset-4">contact form</Link>.
          </p>
        </div>
        <SiteDisclaimer />
      </Container>
    </>
  );
}
