import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import Upload from "icon:upload";
import Lock from "icon:lock";
import ExternalLink from "icon:external-link";
import Scale from "icon:scale";
import HelpCircle from "icon:circle-help";
import Wallet from "icon:wallet";
import FileText from "icon:file-text";
import { Container, Eyebrow, Btn, Disclaimer, Field, inputCls, SectionTitle } from "../components/ui.jsx";
import { RESOURCES, SAMPLE_TEXT } from "../data/lease.js";
import { analyzeLease } from "../lib/leaseAnalyzer.js";
import { readLeaseFile, looksLikeText } from "../lib/leaseReader.js";

const usd = (n) => `$${Number(n).toLocaleString("en-CA", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

const ord = (n) => `${n}${[, "st", "nd", "rd"][(n % 100 >> 3) ^ 1 && n % 10] || "th"}`;

const READ_ERRORS = {
  noText:
    "We couldn’t make out enough readable words. Try a sharper, well-lit, straight-on photo of each page (or a clearer scan), or paste the lease text below.",
  locked: "That PDF is password-protected, so we can’t open it. Save an unlocked copy, or paste the lease text below.",
  unsupported:
    "That kind of file isn’t supported. Please use a photo, a PDF, a Word (.docx) file, a text file or a short video, or paste the lease text below.",
  oldWord: "That’s an older Word file (.doc). Please save it as .docx or PDF and add it again, or paste the lease text below.",
  tooBig: "That file is very large. Try a smaller copy (for videos, a shorter clip of each page), or paste the lease text below.",
  imageFormat:
    "We couldn’t open that picture. iPhone HEIC photos sometimes don’t open on every device. Try a JPG or PNG, or take a screenshot of the photo.",
  videoFormat:
    "We couldn’t play that video here. Try an MP4 or MOV, or record a new one slowly panning across each page.",
  ocrUnavailable:
    "The tool that reads photos and scanned pages couldn’t start. Check your internet connection and try again, or paste the lease text below.",
  unreadable: "We had trouble opening that file. Try saving it again as a PDF or Word file, or paste the lease text below.",
};

function MoneyAtRisk({ items, late, summary }) {
  const hasPet = [...items.recurring, ...items.oneTime].some((i) => i.opt === "pet");
  const hasCar = items.recurring.some((i) => i.opt === "car");
  const [pet, setPet] = useState(true);
  const [car, setCar] = useState(true);
  const [day, setDay] = useState(15);

  const on = (i) => !i.opt || (i.opt === "pet" ? pet : car);
  const recurring = items.recurring.filter(on);
  const oneTime = items.oneTime.filter(on);
  const monthly = recurring.reduce((a, i) => a + i.amount, 0);
  const oneTimeTotal = oneTime.reduce((a, i) => a + i.amount, 0);
  const d = Math.min(31, Math.max(1, Number(day) || 1));
  const lateFee = late ? (d <= late.cutoff ? 0 : late.base + late.perDay * (d - late.cutoff - 1)) : 0;
  const empty = !items.recurring.length && !items.oneTime.length && !items.variable.length && !items.penalties.length;

  const Rows = ({ list, money }) =>
    list.length ? (
      <ul className="mt-4 divide-y divide-line">
        {list.map((i, k) => (
          <li key={i.label + k} className={money ? "flex items-baseline justify-between gap-4 py-2" : "py-2"}>
            {money ? (
              <>
                <span>
                  {i.label} <span className="text-xs text-ink-soft">({i.ref})</span>
                </span>
                <span className="font-mono font-semibold">{usd(i.amount)}</span>
              </>
            ) : (
              <>
                <span className="block font-semibold">
                  {i.label} <span className="text-xs font-normal text-ink-soft">({i.ref})</span>
                </span>
                <span className="block text-sm text-ink-soft">{i.text}</span>
              </>
            )}
          </li>
        ))}
      </ul>
    ) : (
      <p className="mt-4 text-ink-soft">Nothing of this kind was found in the text we read.</p>
    );

  return (
    <section aria-labelledby="mar" className="rounded-[2rem] bg-forest p-6 text-paper on-dark sm:p-10">
      <div className="flex items-center gap-3">
        <Wallet className="h-7 w-7 text-sage-soft" aria-hidden="true" />
        <Eyebrow className="text-sage-soft">Money at Risk</Eyebrow>
      </div>
      <h2 id="mar" className="mt-3 text-4xl text-paper sm:text-5xl">
        What this lease could cost you.
      </h2>
      <p className="mt-3 max-w-2xl text-paper">
        Every figure comes straight from the clauses above. Where the lease doesn’t give a number, we say so instead of
        guessing.
      </p>

      {(hasPet || hasCar) && (
        <div className="mt-6 flex flex-wrap gap-5">
          {hasPet && (
            <label className="inline-flex min-h-11 items-center gap-3 font-semibold">
              <input type="checkbox" checked={pet} onChange={(e) => setPet(e.target.checked)} className="h-5 w-5 accent-[#163a2c]" />
              I’ll have one pet
            </label>
          )}
          {hasCar && (
            <label className="inline-flex min-h-11 items-center gap-3 font-semibold">
              <input type="checkbox" checked={car} onChange={(e) => setCar(e.target.checked)} className="h-5 w-5 accent-[#163a2c]" />
              I’ll have a vehicle
            </label>
          )}
        </div>
      )}

      {empty && <p className="mt-6 rounded-2xl bg-paper p-4 text-ink">We didn’t find any dollar amounts in the clauses we read.</p>}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl bg-paper p-6 text-ink">
          <h3 className="text-2xl">Recurring costs</h3>
          <p className="text-sm text-ink-soft">Every month</p>
          <Rows list={recurring} money />
          {recurring.length > 0 && (
            <>
              <p className="mt-3 flex items-baseline justify-between border-t border-sage pt-3 font-bold">
                <span>Monthly total</span>
                <span className="font-mono text-xl">{usd(monthly)}</span>
              </p>
              <p className="text-sm text-ink-soft">{usd(monthly * 12)} over twelve months, before variable costs.</p>
            </>
          )}
        </div>

        <div className="rounded-3xl bg-paper p-6 text-ink">
          <h3 className="text-2xl">One-time charges</h3>
          <p className="text-sm text-ink-soft">Due at signing or move-in</p>
          <Rows list={oneTime} money />
          {oneTime.length > 0 && (
            <>
              <p className="mt-3 flex items-baseline justify-between border-t border-sage pt-3 font-bold">
                <span>One-time total</span>
                <span className="font-mono text-xl">{usd(oneTimeTotal)}</span>
              </p>
              {monthly > 0 && (
                <p className="text-sm text-ink-soft">
                  Plus the first month’s recurring costs ({usd(monthly)}) = {usd(oneTimeTotal + monthly)} to get the keys.
                </p>
              )}
            </>
          )}
        </div>

        <div className="rounded-3xl bg-paper p-6 text-ink">
          <h3 className="text-2xl">Variable expenses</h3>
          <p className="text-sm text-ink-soft">The lease doesn’t put a number on these</p>
          <Rows list={items.variable} />
        </div>

        <div className="rounded-3xl bg-paper p-6 text-ink">
          <h3 className="text-2xl">Possible penalties</h3>
          <p className="text-sm text-ink-soft">Only if these situations arise</p>
          <Rows list={items.penalties} />
          {late && (
            <div className="mt-4 rounded-2xl bg-sun-tint p-4">
              <Field label="Late-fee check: day of the month rent arrives" htmlFor="lateday">
                <input id="lateday" type="number" min="1" max="31" value={day} onChange={(e) => setDay(e.target.value)} className={inputCls} />
              </Field>
              <p role="status" className="mt-3 font-semibold">
                {lateFee === 0 ? `Arriving by the ${ord(late.cutoff)}: no late charge under ${late.ref}.` : `Late charges under ${late.ref}: ${usd(lateFee)}.`}
              </p>
              <p className="mt-1 text-sm text-ink-soft">Based on the wording we read. Check the original clause.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Finding({ f }) {
  return (
    <article id={f.id} className="rounded-3xl border border-line bg-card p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-sun px-3 py-1 text-xs font-bold uppercase tracking-wider">{f.cat}</span>
        <span className="font-mono text-xs font-semibold text-ink-soft">{f.ref}</span>
      </div>
      <h3 className="mt-3 text-3xl sm:text-4xl">{f.title}</h3>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">Original clause</h4>
          <blockquote className="mt-2 rounded-2xl border-l-4 border-sage bg-white p-4 font-mono text-[0.85rem] leading-relaxed">
            {f.clause}
          </blockquote>
        </div>
        <div>
          <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">In plain language</h4>
          <p className="mt-2 text-lg leading-relaxed">{f.plain}</p>
          <h4 className="mt-5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Possible financial consequence
          </h4>
          <p className="mt-2 rounded-2xl bg-sun-tint p-3 font-semibold">{f.money}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div>
          <h4 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
            <HelpCircle className="h-4 w-4" aria-hidden="true" /> Questions to ask
          </h4>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            {f.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">Official resources</h4>
          <ul className="mt-2 space-y-1">
            {f.resources.map((r) => (
              <li key={r}>
                <a
                  href={RESOURCES[r].href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex min-h-9 items-center gap-1.5 font-semibold text-lake underline underline-offset-4"
                >
                  {RESOURCES[r].label}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {f.review && (
        <div className="mt-6 flex gap-3 rounded-2xl border-2 border-lake bg-lake-tint p-4">
          <Scale className="mt-0.5 h-6 w-6 shrink-0 text-lake" aria-hidden="true" />
          <div>
            <p className="font-semibold">We recommend having a professional review this clause.</p>
            <p className="text-sm">
              {f.reviewWhy} A local tenant organization or a licensed lawyer or paralegal can advise on your situation.
            </p>
          </div>
        </div>
      )}
    </article>
  );
}

export default function LeaseCheck() {
  const [state, setState] = useState({ status: "idle" }); // idle | reading | done | error
  const [cat, setCat] = useState("All");
  const [paste, setPaste] = useState("");
  const [pasteMsg, setPasteMsg] = useState("");
  const [progress, setProgress] = useState("");
  const fileRef = useRef(null);
  const resultsRef = useRef(null);

  const result = state.status === "done" ? state.result : null;
  const list = useMemo(() => (!result ? [] : cat === "All" ? result.findings : result.findings.filter((f) => f.cat === cat)), [result, cat]);
  const cats = useMemo(() => (result ? [...new Set(result.findings.map((f) => f.cat))] : []), [result]);

  useEffect(() => {
    if (state.status === "done" || state.status === "error") resultsRef.current?.focus({ preventScroll: false });
  }, [state]);

  function finish(text, label, isSample, note = "") {
    setCat("All");
    setState({ status: "done", label, isSample, note, result: analyzeLease(text) });
  }

  async function onFile(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setProgress("");
    setState({ status: "reading", label: f.name });
    try {
      const { text, note } = await readLeaseFile(f, setProgress);
      finish(text, f.name, false, note);
    } catch (err) {
      setState({ status: "error", label: f.name, message: READ_ERRORS[err.code] || READ_ERRORS.unreadable });
    }
  }

  function onPaste(e) {
    e.preventDefault();
    if (!looksLikeText(paste)) {
      setPasteMsg("That looks too short to be a lease. Paste the full text of the lease, or at least the clauses you want checked.");
      return;
    }
    setPasteMsg("");
    finish(paste, "Pasted lease text", false);
  }

  const sum = result?.summary || {};
  const facts = [
    sum.place && ["Rental", sum.place],
    sum.landlord && ["Landlord named", sum.landlord],
    sum.rent && ["Rent", `${usd(sum.rent)} a month`],
    sum.term && ["Term", sum.term],
    sum.start && ["Starts", sum.start],
  ].filter(Boolean);

  return (
    <>
      <section>
        <Container className="py-14 sm:py-20">
          <Eyebrow className="text-moss">Lease Check</Eyebrow>
          <h1 className="rise mt-4 text-[3rem] sm:text-6xl lg:text-[4.4rem]">Know what you’re agreeing to.</h1>
          <p className="rise mt-6 max-w-2xl text-xl text-ink-soft" style={{ animationDelay: "0.1s" }}>
            Add your lease privately. Lease Check reads it, finds the clauses that affect your money and explains each one in
            plain language, beside the original wording.
          </p>
        </Container>
      </section>

      <Container>
        <Disclaimer>
          <strong>Lease Check provides educational information, not legal advice.</strong> It doesn’t decide whether a
          clause is valid or enforceable. Where a clause could matter a lot, we suggest professional review.
        </Disclaimer>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-dashed border-sage bg-card p-6 sm:p-8">
            <p className="flex items-center gap-2 font-mono text-sm font-semibold tracking-[0.16em] text-moss">
              <Lock className="h-4 w-4" aria-hidden="true" /> PRIVATE · READ ON YOUR DEVICE
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Add your lease</h2>
            <p className="mt-2 text-ink-soft">
              Your lease is read right here on your device. Your file isn’t uploaded, saved or shared, and it’s never
              added to community data. Photos and scans may take a minute.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <input ref={fileRef} id="lease-file" type="file" accept="image/*,video/*,.pdf,.docx,.txt,.heic,.heif,application/pdf,text/plain" className="sr-only" onChange={onFile} />
              <label
                htmlFor="lease-file"
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest px-6 py-2.5 font-semibold text-paper hover:bg-moss has-[:focus-visible]:outline"
              >
                <Upload className="h-4 w-4" aria-hidden="true" /> Choose a lease file
              </label>
              <Btn variant="ghost" onClick={() => finish(SAMPLE_TEXT, "Sample lease — Willow Court, Unit 5C", true)}>
                Try a sample lease
              </Btn>
            </div>
            <p className="mt-3 text-sm text-ink-soft">
              Photos, scans, PDFs, Word (.docx), text files and short videos all work. For a video, slowly pan across each
              page and hold still on every one.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
              <li>Typed and printed text reads best. Neat handwriting is picked up less reliably, so check those parts.</li>
              <li>Signatures, stamps and drawings are noted as marks on the page but not interpreted.</li>
            </ul>

            <details className="mt-5 rounded-2xl border border-line bg-white p-4">
              <summary className="flex min-h-9 cursor-pointer items-center gap-2 font-semibold">
                <FileText className="h-4 w-4" aria-hidden="true" /> Or paste your lease text
              </summary>
              <form onSubmit={onPaste} className="mt-3">
                <Field label="Lease text" htmlFor="lease-paste">
                  <textarea id="lease-paste" rows={7} value={paste} onChange={(e) => setPaste(e.target.value)} className={inputCls} />
                </Field>
                {pasteMsg && (
                  <p role="alert" className="mt-2 text-sm font-semibold text-clay">
                    {pasteMsg}
                  </p>
                )}
                <Btn type="submit" className="mt-3">
                  Check this text
                </Btn>
              </form>
            </details>
          </div>

          <div className="rounded-3xl bg-moss p-6 text-white on-dark sm:p-8">
            <h2 className="text-3xl text-white">What Lease Check looks for</h2>
            <p className="mt-3 text-white">
              Rent, deposits, utilities, late fees, cleaning, payment requirements, insurance, maintenance and repairs,
              pets, guests, landlord entry, subletting, lease breaking, fees, parking, liability, renewal and addenda.
            </p>
            <p className="mt-4 text-white">
              Lease Check organizes the lease. You can always read the original clause. See{" "}
              <Link to="/responsible-ai" className="font-semibold underline underline-offset-4">
                how we use AI responsibly
              </Link>
              .
            </p>
          </div>
        </div>
      </Container>

      <div ref={resultsRef} tabIndex={-1} className="outline-hidden" aria-live="polite">
        {state.status === "reading" && (
          <Container className="py-16">
            <p role="status" className="rounded-3xl border border-line bg-card p-8 text-center text-xl">
              Reading <strong>{state.label}</strong> on your device…
              {progress && <span className="mt-2 block text-base text-ink-soft">{progress}</span>}
            </p>
          </Container>
        )}

        {state.status === "error" && (
          <Container className="py-16">
            <div role="alert" className="rounded-3xl border-2 border-clay bg-rose-tint p-6 sm:p-8">
              <h2 className="text-2xl">We couldn’t read {state.label}</h2>
              <p className="mt-2 text-lg">{state.message}</p>
            </div>
          </Container>
        )}

        {state.status === "idle" && (
          <Container className="py-16">
            <p className="rounded-3xl border border-line bg-card p-8 text-center text-xl">
              Choose a photo, scan, PDF, Word file or video of your lease, paste its text, or try the sample to see findings, questions to ask, and a Money at Risk
              summary.
            </p>
          </Container>
        )}

        {result && (
          <Container className="py-16">
            <p role="status" className="rounded-2xl bg-sun-tint p-4 text-sm">
              {state.isSample ? (
                <>
                  Showing results for a <strong>fictional sample lease</strong>: {state.label}.
                </>
              ) : (
                <>
                  Results for <strong>{state.label}</strong>. It was read on your device and not uploaded or saved. Reading is
                  automatic and can miss or misread terms, so check each finding against the original clause.
                  {state.note ? (
                    <>
                      {" "}
                      <strong>
                        This file was read from a picture of the pages{state.note === "ocr-partial" ? " (only the first pages were read)" : ""}.
                      </strong>{" "}
                      Numbers and handwriting are the easiest to misread, so double-check amounts and dates against your pages.
                    </>
                  ) : null}
                </>
              )}
            </p>

            {facts.length > 0 && (
              <dl className="mt-6 grid gap-4 rounded-3xl border border-line bg-card p-6 sm:grid-cols-2 lg:grid-cols-3">
                {facts.map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">{k}</dt>
                    <dd className="mt-1 text-lg font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            {result.findings.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-line bg-card p-8">
                <h2 className="text-3xl">We didn’t recognize any money-related clauses.</h2>
                <p className="mt-3 text-lg text-ink-soft">
                  The file may not contain the full lease, or it may be laid out in a way we can’t follow yet. Try pasting the
                  lease text above, or check that every page was included.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-10">
                  <SectionTitle
                    eyebrow={`${result.findings.length} term${result.findings.length > 1 ? "s" : ""} found in your lease`}
                    title="The terms that touch your money."
                    lead="Each finding shows the original clause first. If our explanation and the clause ever seem to differ, the clause wins."
                  />
                </div>

                <div className="mt-8" role="group" aria-label="Filter terms by topic">
                  <div className="flex flex-wrap gap-2">
                    {["All", ...cats].map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={cat === c}
                        onClick={() => setCat(c)}
                        className={`min-h-10 rounded-full border border-line px-4 text-sm font-semibold ${cat === c ? "bg-forest text-paper" : "hover:bg-sand"}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8 grid gap-6">
                  {list.map((f) => (
                    <Finding key={f.id} f={f} />
                  ))}
                </div>
              </>
            )}

            {result.missing.length > 0 && result.findings.length > 0 && (
              <p className="mt-8 rounded-2xl border border-line bg-card p-5">
                <strong>Not found in the text we read:</strong> {result.missing.join(", ").toLowerCase()}. That may mean the
                lease doesn’t cover them, or that our reading missed them. If something matters to you, search the lease for it
                yourself.
              </p>
            )}

            {result.findings.length > 0 && (
              <div className="mt-16">
                <MoneyAtRisk key={state.label} items={result.items} late={result.late} summary={sum} />
              </div>
            )}

            <div className="mt-10">
              <Disclaimer>
                This summary is educational information, not legal advice, and may miss or misread terms. Please read the
                full lease before signing, and consider asking a local tenant organization, legal aid office or lawyer
                about anything marked for professional review. Wondering how a term compares with others?{" "}
                <Link to="/common" className="font-semibold underline underline-offset-4">
                  Try “Is this common?”
                </Link>
              </Disclaimer>
            </div>
          </Container>
        )}
      </div>
    </>
  );
}
