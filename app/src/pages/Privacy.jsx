import { useState } from "react";
import { Link } from "react-router";
import Lock from "icon:lock";
import Download from "icon:download";
import Trash2 from "icon:trash-2";
import PencilLine from "icon:pencil-line";
import { Container, Eyebrow, Btn, BtnLink, SectionTitle, PrivacyLadder, Field, inputCls, fmtDate } from "../components/ui.jsx";
import { usePassport } from "../lib/PassportContext.jsx";
import { ShareCard } from "./Share.jsx";
import { TENANCIES, PAYMENTS, REFERENCES } from "../data/passport.js";

const fmtDT = (t) => fmtDate(t, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default function Privacy() {
  const { shares, isActive, docs, deleteAllDocs, notes } = usePassport();
  const [docConfirm, setDocConfirm] = useState(false);
  const [docsGone, setDocsGone] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [acctDone, setAcctDone] = useState(false);
  const [dl, setDl] = useState(false);

  const active = shares.filter(isActive);
  const history = shares
    .flatMap((s) => s.log.map((l) => ({ ...l, who: s.recipient })))
    .sort((a, b) => b.at - a.at);

  function download() {
    const data = {
      about: "Sample export from the RentalStories prototype. All names and figures are fictional.",
      tenancies: TENANCIES,
      rentPayments: PAYMENTS,
      references: REFERENCES,
      documents: docs.map(({ id, name, cat, added, evidence }) => ({ id, name, category: cat, added, evidenceLevel: evidence })),
      yourNotes: notes,
      shares: shares.map((s) => ({ recipient: s.recipient, expires: new Date(s.expires).toISOString(), revoked: s.revoked, accessHistory: s.log })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-rentalstories-data.json";
    a.click();
    URL.revokeObjectURL(url);
    setDl(true);
  }

  return (
    <>
      <section className="on-dark bg-forest text-paper">
        <Container className="py-14 sm:py-20">
          <Eyebrow className="text-sage-soft">Privacy Center</Eyebrow>
          <h1 className="rise mt-4 max-w-4xl text-[3rem] sm:text-6xl lg:text-[4.4rem]">Your rental record belongs to you.</h1>
          <div className="rise mt-8 grid gap-3 sm:grid-cols-3" style={{ animationDelay: "0.12s" }}>
            {["Private by default.", "We do not sell your private rental history.", "You decide who sees what — and for how long."].map((t) => (
              <p key={t} className="rounded-2xl border border-paper/40 p-4 text-lg font-semibold text-paper">{t}</p>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-14">
        <SectionTitle eyebrow="Right now" title="What’s private, what’s shared." />
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Passport", "Your tenancies, payment evidence, confirmations, references and your own context."],
            ["Evidence Vault", "Leases, receipts, notices and messages you keep for your tenancies."],
            ["Confirmations and disputes", "Who confirmed what, when, and any correction requests."],
          ].map(([t, d]) => (
            <li key={t} className="rounded-3xl border border-line bg-card p-6">
              <p className="inline-flex items-center gap-2 rounded-full bg-forest px-3 py-1 font-mono text-xs font-semibold tracking-[0.16em] text-paper">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" /> PRIVATE
              </p>
              <h3 className="mt-4 text-3xl">{t}</h3>
              <p className="mt-2 text-ink-soft">{d}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink-soft">
          Items only move to Shared when you create a share, and nothing in your Passport can be made Public.
        </p>
      </Container>

      <section className="border-y border-line bg-sand/50 py-14">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle eyebrow="Active shares" title={active.length ? `${active.length} active ${active.length === 1 ? "share" : "shares"}.` : "No active shares."} />
            <BtnLink to="/share" variant="ghost">Create a share</BtnLink>
          </div>
          {active.length === 0 && <p className="mt-4 text-lg">Nobody can see anything in your Passport.</p>}
          <ul className="mt-8 grid gap-5 lg:grid-cols-2">
            {active.map((s) => <ShareCard key={s.id} s={s} compact />)}
          </ul>
        </Container>
      </section>

      <Container className="py-14">
        <SectionTitle eyebrow="Access history" title="Every view, on the record." lead="Across all shares, newest first. Revoking a share stops access immediately." />
        <ol className="mt-8 divide-y divide-line rounded-3xl border border-line bg-card">
          {history.map((h, i) => (
            <li key={i} className="grid gap-1 p-4 sm:grid-cols-[11rem_1fr_1fr] sm:gap-4">
              <span className="font-mono text-sm font-semibold text-ink-soft">{fmtDT(h.at)}</span>
              <span className="font-semibold">{h.who}</span>
              <span>{h.what}</span>
            </li>
          ))}
        </ol>
      </Container>

      <section className="bg-sand/50 py-14">
        <Container>
          <SectionTitle eyebrow="Your controls" title="Take charge of your data." />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-line bg-card p-6">
              <PencilLine className="h-7 w-7 text-lake" aria-hidden="true" />
              <h3 className="mt-3 text-3xl">Correct information</h3>
              <p className="mt-2 text-ink-soft">If something in your Passport is wrong, add a correction. If someone else’s record disagrees, both versions stay visible.</p>
              <BtnLink to="/my/account" variant="ghost" className="mt-4">Go to my account</BtnLink>
            </div>

            <div className="rounded-3xl border border-line bg-card p-6">
              <Download className="h-7 w-7 text-lake" aria-hidden="true" />
              <h3 className="mt-3 text-3xl">Download my data</h3>
              <p className="mt-2 text-ink-soft">Get a complete copy of what’s in your Passport in a file you can keep.</p>
              <Btn variant="ghost" className="mt-4" onClick={download}>Download my data</Btn>
              {dl && <p role="status" className="mt-3 text-sm font-semibold text-moss">Your sample data file has been downloaded.</p>}
            </div>

            <div className="rounded-3xl border border-line bg-card p-6">
              <Trash2 className="h-7 w-7 text-clay" aria-hidden="true" />
              <h3 className="mt-3 text-3xl">Delete documents</h3>
              <p className="mt-2 text-ink-soft">Remove your uploaded documents. Active shares that included them stop showing them.</p>
              {docsGone || docs.length === 0 ? (
                <p role="status" className="mt-4 font-semibold text-moss">All documents deleted. {docsGone && "This can’t be undone."}</p>
              ) : docConfirm ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  <Btn variant="danger" onClick={() => { deleteAllDocs(); setDocsGone(true); setDocConfirm(false); }}>Yes, delete {docs.length} documents</Btn>
                  <Btn variant="ghost" onClick={() => setDocConfirm(false)}>Keep them</Btn>
                </div>
              ) : (
                <Btn variant="ghost" className="mt-4" onClick={() => setDocConfirm(true)}>Delete documents</Btn>
              )}
            </div>

            <div className="rounded-3xl border-2 border-clay bg-card p-6">
              <Trash2 className="h-7 w-7 text-clay" aria-hidden="true" />
              <h3 className="mt-3 text-3xl">Delete account</h3>
              <p className="mt-2 text-ink-soft">Permanently remove your account, Passport, documents and shares.</p>
              {acctDone ? (
                <p role="status" className="mt-4 font-semibold text-moss">This is a sample, so nothing was removed. To delete your real account, use the Account page in your Passport.</p>
              ) : acctOpen ? (
                <div className="mt-4 grid gap-3">
                  <Field label="Type DELETE to confirm" htmlFor="del">
                    <input id="del" className={inputCls} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
                  </Field>
                  <div className="flex flex-wrap gap-3">
                    <Btn variant="danger" disabled={typed !== "DELETE"} onClick={() => setAcctDone(true)}>Delete my account</Btn>
                    <Btn variant="ghost" onClick={() => { setAcctOpen(false); setTyped(""); }}>Cancel</Btn>
                  </div>
                </div>
              ) : (
                <Btn variant="danger" className="mt-4" onClick={() => setAcctOpen(true)}>Delete account</Btn>
              )}
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-16">
        <SectionTitle eyebrow="The rule" title="Private → Shared → Public." />
        <PrivacyLadder className="mt-8" />
        <p className="mt-6">
          More on how we protect your information: <Link to="/trust" className="font-semibold underline underline-offset-4">Trust &amp; Security</Link>.
        </p>
      </Container>
    </>
  );
}
