import { useState } from "react";
import Check from "icon:check";
import { Container, Eyebrow, Btn, Field, inputCls, Disclaimer, SectionTitle } from "../components/ui.jsx";
import { CATEGORIES } from "../data/lease.js";

export default function Common() {
  const [place, setPlace] = useState("");
  const [clause, setClause] = useState("Late fees");
  const [asked, setAsked] = useState(null);

  function submit(e) {
    e.preventDefault();
    setAsked({ place: place.trim(), clause });
  }

  return (
    <>
      <section>
        <Container className="py-14 sm:py-20">
          <Eyebrow className="text-moss">Lease Intelligence</Eyebrow>
          <h1 className="rise mt-4 text-[3rem] sm:text-6xl lg:text-[4.4rem]">Is this common?</h1>
          <p className="rise mt-6 max-w-2xl text-xl text-ink-soft" style={{ animationDelay: "0.1s" }}>
            One day, you’ll be able to see how a clause compares with responsibly de-identified lease patterns in your
            area. We only show a comparison when there’s enough real data behind it.
          </p>
        </Container>
      </section>

      <Container className="grid gap-8 pb-16 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={submit} className="self-start rounded-3xl border border-line bg-card p-6 sm:p-8">
          <h2 className="text-3xl sm:text-4xl">Ask about a clause</h2>
          <div className="mt-5 grid gap-5">
            <Field label="City, county or state" htmlFor="place">
              <input id="place" className={inputCls} value={place} onChange={(e) => setPlace(e.target.value)} placeholder="e.g. Portland, OR" />
            </Field>
            <Field label="Clause type" htmlFor="clause">
              <select id="clause" className={inputCls} value={clause} onChange={(e) => setClause(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <div>
              <Btn type="submit">Check</Btn>
            </div>
          </div>

          {asked && (
            <div role="status" className="mt-6 rounded-2xl border border-line bg-sun-tint p-5">
              <p className="text-2xl font-display">More community data is needed.</p>
              <p className="mt-2">
                There isn’t enough responsibly de-identified data about <strong>{asked.clause.toLowerCase()}</strong>
                {asked.place ? <> in <strong>{asked.place}</strong></> : null} to show a comparison yet. We never estimate
                or fill gaps with made-up numbers.
              </p>
              <p className="mt-2 text-sm">In the meantime, Lease Check can still explain the clause in your own lease.</p>
            </div>
          )}
        </form>

        <div className="rounded-3xl border border-dashed border-sage p-6 sm:p-8" aria-labelledby="layout">
          <h2 id="layout" className="text-3xl sm:text-4xl">How an answer will look</h2>
          <p className="mt-2 text-sm text-ink-soft">Layout illustration only — it contains no real data.</p>
          <div className="mt-5 space-y-3" aria-hidden="true">
            {[70, 45, 25, 12].map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-24 rounded bg-sand" />
                <div className="h-6 flex-1 rounded border-2 border-dashed border-line">
                  <div className="h-full rounded-sm bg-line/60" style={{ width: `${w}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm">
            Each comparison will show how many leases it’s based on, how recent they are, and the area they cover.
          </p>
        </div>
      </Container>

      <section className="border-y border-line bg-sand/50 py-16">
        <Container>
          <SectionTitle eyebrow="Ground rules" title="Comparisons built on care, not guesses." />
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              ["Only de-identified patterns", "Names, addresses, unit numbers and other identifying details are removed before anything is counted."],
              ["A minimum amount of data", "If too few leases exist for a place and clause type, nothing is shown — so no one can be singled out."],
              ["Opt-in contributions", "Your lease is never added to community data unless you choose to contribute it."],
              ["No landlord rankings", "Patterns describe clauses in an area. They never name, rate or rank a landlord or property."],
              ["Never invented", "No statistics are estimated, borrowed or made up. When we don’t know, we say so."],
              ["Context included", "Every answer shows its sample size, time range and location, so you can judge it yourself."],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-3 rounded-2xl border border-line bg-card p-5">
                <Check className="mt-1 h-5 w-5 shrink-0 text-moss" aria-hidden="true" />
                <div>
                  <h3 className="font-sans text-lg font-bold leading-snug">{t}</h3>
                  <p className="mt-1 text-ink-soft">{d}</p>
                </div>
              </li>
            ))}
          </ul>
          <Disclaimer className="mt-8">
            A clause being common doesn’t mean it’s fair, allowed or right for you. Comparisons are educational
            information, not legal advice.
          </Disclaimer>
        </Container>
      </section>
    </>
  );
}
