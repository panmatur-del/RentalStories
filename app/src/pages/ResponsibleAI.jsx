import Check from "icon:check";
import X from "icon:x";
import { Container, Eyebrow, BtnLink, SectionTitle, Disclaimer } from "../components/ui.jsx";

const CAN = [
  ["Organize leases", "Turn a long document into sections you can scan."],
  ["Identify clauses and fees", "Point out the terms that touch your money."],
  ["Explain language", "Say what a clause means in plain words."],
  ["Assist redaction", "Suggest sensitive details to cover. You check and approve every one."],
];
const CANNOT = [
  ["Decide who deserves housing", "Housing decisions belong to people."],
  ["Create hidden renter scores", "No score exists — visible or hidden."],
  ["Infer protected characteristics", "It never guesses things like race, religion, family status or disability."],
  ["Make final legal decisions", "It can’t say a clause is valid, illegal or enforceable."],
  ["Automatically publish accusations", "Nothing goes public without your explicit action."],
];

export default function ResponsibleAI() {
  return (
    <>
      <section>
        <Container className="py-14 sm:py-20">
          <Eyebrow className="text-moss">Responsible AI</Eyebrow>
          <h1 className="rise mt-4 max-w-5xl text-[3rem] sm:text-6xl lg:text-[4.4rem]">AI that helps you read. Never one that judges you.</h1>
          <p className="rise mt-6 max-w-2xl text-xl text-ink-soft" style={{ animationDelay: "0.1s" }}>
            AI is a tool for understanding documents. It’s not a decision-maker about people.
          </p>
        </Container>
      </section>

      <Container className="grid gap-6 pb-16 lg:grid-cols-2">
        <div className="rounded-3xl bg-moss p-6 text-white on-dark sm:p-8">
          <h2 className="text-4xl text-white">AI may</h2>
          <ul className="mt-5 space-y-4">
            {CAN.map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <Check className="mt-1 h-5 w-5 shrink-0 text-sage-soft" aria-hidden="true" />
                <div><p className="text-xl font-semibold">{t}</p><p className="text-white">{d}</p></div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-line bg-card p-6 sm:p-8">
          <h2 className="text-4xl">AI must not</h2>
          <ul className="mt-5 space-y-4">
            {CANNOT.map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <X className="mt-1 h-5 w-5 shrink-0 text-clay" aria-hidden="true" />
                <div><p className="text-xl font-semibold">{t}</p><p className="text-ink-soft">{d}</p></div>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <section className="border-y border-line bg-sand/50 py-16">
        <Container>
          <SectionTitle eyebrow="Always checkable" title="You can always see the original." />
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-line bg-card p-6">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">Original clause</p>
              <blockquote className="mt-2 rounded-2xl border-l-4 border-sage bg-white p-4 font-mono text-[0.85rem]">Rent received after the 3rd day of the month incurs a late charge of $75.00, plus $10.00 for each additional day until paid in full.</blockquote>
            </div>
            <div className="rounded-3xl border border-line bg-card p-6">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">AI-assisted explanation</p>
              <p className="mt-2 text-lg">You have until the 3rd. After that there’s a $75 fee that grows by $10 for each extra day.</p>
              <p className="mt-3 text-sm text-ink-soft">Every explanation sits beside its source. If the two ever seem to differ, the original wording wins.</p>
            </div>
          </div>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["A person stays in charge", "You decide what to do with any finding. For significant terms we recommend professional review."],
              ["Honest about limits", "AI can misread or miss things. We say so on every result."],
              ["Fairness over speed", "We review how our features affect different groups of renters and fix what we find."],
            ].map(([t, d]) => (
              <li key={t} className="rounded-3xl border border-line bg-card p-5">
                <h3 className="text-3xl">{t}</h3><p className="mt-2 text-ink-soft">{d}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Container className="py-16">
        <Disclaimer>AI-assisted results are educational information, not legal advice.</Disclaimer>
        <div className="mt-6 flex flex-wrap gap-3">
          <BtnLink to="/lease-check" arrow>Try Lease Check</BtnLink>
          <BtnLink to="/trust" variant="ghost">Trust &amp; Security</BtnLink>
        </div>
      </Container>
    </>
  );
}
