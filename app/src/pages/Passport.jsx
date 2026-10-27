import { useState } from "react";
import { Link } from "react-router";
import Lock from "icon:lock";
import Share2 from "icon:share-2";
import MapPin from "icon:map-pin";
import Archive from "icon:archive";
import Pencil from "icon:pencil";
import {
  Container,
  Eyebrow,
  BtnLink,
  Btn,
  EvidenceBadge,
  StatusBadge,
  EvidenceLegend,
  FeaturePill,
  SiteDisclaimer,
  Field,
  inputCls,
  fmtDate,
  BuildYourOwn,
} from "../components/ui.jsx";
import { RENTER, TENANCIES, PAYMENTS, REFERENCES, TIMELINE, CONTEXT_NOTES, CONTEXT_PROMPTS } from "../data/passport.js";
import { usePassport } from "../lib/PassportContext.jsx";

const TABS = [
  ["timeline", "Timeline"],
  ["tenancies", "Tenancies"],
  ["payments", "Payment evidence"],
  ["references", "Landlord confirmations"],
  ["context", "My context"],
];

function Source({ source, date }) {
  return (
    <p className="text-sm text-ink-soft">
      <span className="font-semibold text-ink">Source:</span> {source}
      <span aria-hidden="true"> · </span>
      <br className="sm:hidden" />
      <span className="font-semibold text-ink">Checked:</span> {fmtDate(date)}
    </p>
  );
}

function CorrectionBox({ itemId, label }) {
  const { notes, addNote } = usePassport();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("correction");
  const [text, setText] = useState("");
  const mine = notes.filter((n) => n.itemId === itemId);

  function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    addNote({ itemId, kind, text: text.trim() });
    setText("");
    setOpen(false);
  }

  return (
    <div className="mt-4">
      {mine.map((n) => (
        <p key={n.id} role="status" className="mb-2 rounded-xl bg-lake-tint p-3 text-sm text-ink">
          <span className="font-semibold">
            {n.kind === "dispute" ? "Your dispute note" : "Your correction"} (added just now, shown beside this item):
          </span>{" "}
          {n.text}
        </p>
      ))}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline decoration-2 underline-offset-4 hover:text-moss"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" /> Correct or dispute this
        </button>
      ) : (
        <form onSubmit={submit} className="grid gap-3 rounded-2xl border-2 border-line bg-white p-4">
          <fieldset>
            <legend className="text-sm font-semibold">What would you like to do about “{label}”?</legend>
            <div className="mt-2 flex flex-wrap gap-4">
              {[
                ["correction", "Correct information"],
                ["dispute", "Dispute what’s recorded"],
              ].map(([v, l]) => (
                <label key={v} className="inline-flex min-h-11 items-center gap-2 font-medium">
                  <input type="radio" name={`k-${itemId}`} className="h-5 w-5 accent-ink" checked={kind === v} onChange={() => setKind(v)} />
                  {l}
                </label>
              ))}
            </div>
          </fieldset>
          <Field label="Your note" htmlFor={`n-${itemId}`} hint="Add your version. If the other side disagrees, both versions stay visible.">
            <textarea id={`n-${itemId}`} rows={3} className={inputCls} value={text} onChange={(e) => setText(e.target.value)} />
          </Field>
          <div className="flex flex-wrap gap-3">
            <Btn type="submit">Attach my note</Btn>
            <Btn type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Btn>
          </div>
        </form>
      )}
    </div>
  );
}

function Timeline() {
  return (
    <ol className="relative ml-3 border-l border-sage pl-8">
      {TIMELINE.map((t) => (
        <li key={t.year + t.title} className="relative pb-9 last:pb-0">
          <span className="absolute -left-[2.62rem] top-1 h-4 w-4 rounded-full border-[3px] border-forest bg-sun" aria-hidden="true" />
          <p className="font-mono text-sm font-semibold text-moss">{t.year}</p>
          <h3 className="mt-1 text-3xl">{t.title}</h3>
          <p className="text-ink-soft">{t.sub}</p>
          <div className="mt-2">
            <EvidenceBadge type={t.evidence} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function Tenancies() {
  return (
    <ul className="grid gap-5">
      {TENANCIES.map((t) => (
        <li key={t.id} className="rounded-3xl border border-line bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-3xl">{t.address}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-ink-soft">
                <MapPin className="h-4 w-4" aria-hidden="true" /> {t.place} · {t.from} – {t.to} · {t.rent}
              </p>
            </div>
            <StatusBadge status={t.status} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {t.evidence.map((e) => (
              <EvidenceBadge key={e} type={e} />
            ))}
          </div>
          <p className="mt-4">{t.note}</p>

          {t.versions && (
            <div className="mt-4 rounded-2xl border-2 border-clay/50 bg-rose-tint p-4">
              <p className="font-semibold text-clay">Two versions are on record. Neither is treated as settled.</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {t.versions.map((v) => (
                  <div key={v.who} className="rounded-xl bg-white p-3">
                    <p className="font-mono text-xs font-semibold uppercase tracking-wider text-ink-soft">{v.who}</p>
                    <p className="mt-1 font-semibold">{v.says}</p>
                    <p className="text-sm text-ink-soft">{v.backing}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm">
                Anyone you share this with sees both versions and the “Disputed” label.{" "}
                <Link to="/corrections" className="font-semibold underline underline-offset-2">
                  How corrections and disputes work
                </Link>
              </p>
            </div>
          )}
          <div className="mt-4">
            <Source source={t.source} date={t.verifiedOn} />
          </div>
          <CorrectionBox itemId={t.id} label={t.address} />
        </li>
      ))}
      <li>
        <Link
          to="/evidence-vault"
          className="flex min-h-14 items-center justify-center rounded-3xl border border-dashed border-sage px-6 py-4 text-center font-semibold hover:bg-sand"
        >
          + Add a tenancy, then ask a housing provider to confirm it
        </Link>
      </li>
    </ul>
  );
}

function Payments() {
  return (
    <div>
      <p className="max-w-2xl text-ink-soft">
        A plain record of what was paid and where each record comes from. It is a ledger, not a grade. Nothing here is turned into a score.
      </p>
      <div className="mt-6 overflow-x-auto rounded-3xl border border-line bg-card">
        <table className="w-full min-w-[40rem] text-left">
          <caption className="sr-only">Rent payments for 412 Alder Street</caption>
          <thead>
            <tr className="border-b border-sage bg-sand text-sm">
              <th scope="col" className="px-4 py-3">Month</th>
              <th scope="col" className="px-4 py-3">Rent</th>
              <th scope="col" className="px-4 py-3">Paid on</th>
              <th scope="col" className="px-4 py-3">Evidence</th>
              <th scope="col" className="px-4 py-3">Source · checked</th>
              <th scope="col" className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {PAYMENTS.map((p) => (
              <tr key={p.month} className="border-b border-line last:border-0">
                <th scope="row" className="px-4 py-3 font-semibold">{p.month}</th>
                <td className="px-4 py-3">{p.amount}</td>
                <td className="px-4 py-3">{p.paid}</td>
                <td className="px-4 py-3"><EvidenceBadge type={p.evidence} /></td>
                <td className="px-4 py-3 text-sm">
                  {p.source}
                  <br />
                  <span className="text-ink-soft">{fmtDate(p.date)}</span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-ink-soft">Showing the six most recent months. Older months are included when you choose to share them.</p>
      <CorrectionBox itemId="pay" label="Rent payments" />
    </div>
  );
}

function References() {
  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {REFERENCES.map((r) => (
        <li key={r.id} className="flex flex-col rounded-3xl border border-line bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <EvidenceBadge type={r.evidence} />
            <StatusBadge status={r.status} />
          </div>
          <blockquote className="mt-4 flex-1 font-display text-2xl leading-snug">“{r.statement}”</blockquote>
          <p className="mt-4 font-semibold">{r.name}</p>
          <p className="text-sm text-ink-soft">{r.role}</p>
          <p className="text-sm text-ink-soft">{r.relation}</p>
          <div className="mt-3">
            <Source source={`Statement from ${r.name}`} date={r.date} />
          </div>
          <CorrectionBox itemId={r.id} label={`Reference from ${r.name}`} />
        </li>
      ))}
    </ul>
  );
}

function Context() {
  const [mine, setMine] = useState([]);
  const [topic, setTopic] = useState(CONTEXT_PROMPTS[0]);
  const [text, setText] = useState("");
  function add(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setMine((m) => [{ id: `m${m.length}`, topic, written: "just now", text: text.trim().slice(0, 1200) }, ...m]);
    setText("");
  }
  return (
    <div>
      <div className="max-w-3xl">
        <p className="text-lg text-ink-soft">
          Credit issues, a consumer proposal, a gap in work, self-employment, a dispute: some things don’t show how you
          rent. Say what you want a reader to know, in your own words.
        </p>
        <p className="mt-3 rounded-2xl bg-sand p-4 text-sm font-semibold">
          Your context is kept apart from the verified facts and is always labelled as written by you. It never changes
          an evidence level, and it doesn’t hide anything.
        </p>
      </div>

      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {[...mine, ...CONTEXT_NOTES].map((n) => (
          <li key={n.id} className="flex flex-col rounded-3xl border border-line bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-moss">{n.topic}</span>
              <EvidenceBadge type="self" />
            </div>
            <p className="mt-4 flex-1 font-display text-xl leading-snug">“{n.text}”</p>
            <p className="mt-4 text-sm text-ink-soft">
              Written by Alex · {n.written === "just now" ? "just now" : fmtDate(n.written)} · not independently checked
            </p>
          </li>
        ))}
      </ul>

      <form onSubmit={add} className="mt-8 grid max-w-2xl gap-4 rounded-3xl border-2 border-line bg-white p-6">
        <h3 className="text-2xl">Add context</h3>
        <Field label="What is it about?" htmlFor="ctx-topic">
          <select id="ctx-topic" className={inputCls} value={topic} onChange={(e) => setTopic(e.target.value)}>
            {CONTEXT_PROMPTS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="In your words" htmlFor="ctx-text" hint="Keep it factual and brief. Don’t include other people’s private details.">
          <textarea id="ctx-text" rows={4} maxLength={1200} className={inputCls} value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
        <div>
          <Btn type="submit">Add to my context</Btn>
        </div>
        <p className="text-sm text-ink-soft">Demo only. This note stays on your screen and isn’t saved.</p>
      </form>
    </div>
  );
}

export default function Passport() {
  const [tab, setTab] = useState("timeline");
  return (
    <>
      <section className="border-b border-line">
        <Container className="py-12 sm:py-16">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Eyebrow className="text-moss">Rental Passport · sample</Eyebrow>
                <FeaturePill status="demo" />
              </div>
              <h1 className="rise mt-3 text-5xl sm:text-6xl">{RENTER.name}’s Passport</h1>
              <p className="mt-3 max-w-xl text-lg text-ink-soft">
                Your documented rental history in one private place. Every item shows what backs it, who confirmed it and
                when. Not a credit score. Not a renter score.
              </p>
            </div>
            <div className="w-full rounded-3xl bg-forest p-6 text-paper sm:w-auto sm:min-w-72 on-dark">
              <p className="flex items-center gap-2 font-mono text-sm font-semibold tracking-[0.18em] text-sage-soft">
                <Lock className="h-4 w-4" aria-hidden="true" /> PRIVATE
              </p>
              <p className="mt-2 text-paper">Visible only to you. Not searchable. Not listed anywhere.</p>
              <BtnLink to="/my" variant="accent" className="mt-5 w-full" arrow>
                <Share2 className="h-4 w-4" aria-hidden="true" /> Start your own Passport
              </BtnLink>
              <BtnLink to="/evidence-vault" variant="light" className="mt-3 w-full">
                <Archive className="h-4 w-4" aria-hidden="true" /> Open the Evidence Vault
              </BtnLink>
            </div>
          </div>
        </Container>
      </section>

      <Container className="pt-8">
        <BuildYourOwn />
      </Container>
      <Container className="py-10">
        <details className="rounded-2xl border border-line bg-card p-4">
          <summary className="cursor-pointer text-sm font-semibold">What do the evidence levels mean?</summary>
          <div className="mt-4"><EvidenceLegend compact /></div>
          <p className="mt-4 text-sm font-semibold">
            RentalStories never turns your evidence into a score, rating or recommendation.{" "}
            <Link to="/evidence-levels" className="underline underline-offset-4">Read more</Link>
          </p>
        </details>

        <div role="group" aria-label="Passport sections" className="mt-8 flex flex-wrap gap-2">
          {TABS.map(([k, l]) => (
            <button
              key={k}
              type="button"
              aria-pressed={tab === k}
              onClick={() => setTab(k)}
              className={`min-h-11 rounded-full border border-line px-5 text-[0.95rem] font-semibold transition-colors ${
                tab === k ? "bg-forest text-paper" : "bg-transparent text-ink hover:bg-sand"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "timeline" && <Timeline />}
          {tab === "tenancies" && <Tenancies />}
          {tab === "payments" && <Payments />}
          {tab === "references" && <References />}
          {tab === "context" && <Context />}
        </div>
        <SiteDisclaimer className="mt-12" />
      </Container>
    </>
  );
}
