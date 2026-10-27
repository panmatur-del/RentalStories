import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Container, Eyebrow, Btn, Field, inputCls, SiteDisclaimer } from "../components/ui.jsx";
import { pb } from "../lib/pb.js";
import { fmtDay, dateOnly } from "../lib/share.js";
import { Notice } from "./my/bits.jsx";

export default function Confirm() {
  const { id } = useParams();
  const [st, setSt] = useState({ loading: true, rec: null });
  const [f, setF] = useState({ name: "", role: "", answer: "yes", start: "", end: "", rent: "", note: "", trap: "" });
  const [phase, setPhase] = useState("form");
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  useEffect(() => {
    const c = new AbortController();
    pb.collection("confirmations")
      .getOne(id, { signal: c.signal })
      .then((rec) => {
        setSt({ loading: false, rec });
        setF((s) => ({ ...s, start: rec.their_start || rec.claim_start || "", end: rec.their_end || rec.claim_end || "", rent: rec.their_rent || rec.claim_rent || "" }));
      })
      .catch((e) => { if (!e?.isAbort) setSt({ loading: false, rec: null }); });
    return () => c.abort();
  }, [id]);

  if (st.loading) return <p className="py-24 text-center text-ink-soft" role="status">Opening…</p>;
  const rec = st.rec;
  if (!rec)
    return (
      <Container className="py-20">
        <div className="mx-auto max-w-xl rounded-3xl border border-line bg-card p-8 text-center sm:p-12">
          <h1 className="text-4xl">This link isn’t available.</h1>
          <p className="mt-4 text-lg text-ink-soft">The request may have been withdrawn, or the link may be mistyped. Please ask the renter to send a new one.</p>
        </div>
      </Container>
    );

  const locked = rec.status === "confirmed" || phase === "done";

  async function submit(e) {
    e.preventDefault();
    if (phase === "sending" || f.trap) return;
    setErr("");
    setPhase("sending");
    const same = f.answer === "yes";
    try {
      await pb.collection("confirmations").update(id, {
        status: f.answer === "no-confirm" ? "declined" : same ? "confirmed" : "corrected",
        responder_name: f.name.trim(),
        responder_role: f.role.trim(),
        response_note: f.note.trim(),
        their_start: same || f.answer === "no-confirm" ? "" : f.start,
        their_end: same || f.answer === "no-confirm" ? "" : f.end,
        their_rent: same || f.answer === "no-confirm" ? "" : f.rent,
        responded_at: new Date().toISOString(),
      });
      setPhase("done");
    } catch {
      setErr("We couldn’t save your answer. The request may have just been withdrawn.");
      setPhase("form");
    }
  }

  return (
    <Container className="py-12 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <Eyebrow className="text-moss">Tenancy confirmation</Eyebrow>
        <h1 className="mt-3 text-4xl sm:text-5xl">{rec.claim_renter || "A renter"} asked you to confirm a tenancy.</h1>
        <p className="mt-4 text-lg text-ink-soft">
          You’re confirming facts only: where, when and the rent. You’re not rating anyone, and no score is created. Your name, role and the date will appear beside the confirmation.
        </p>

        <dl className="mt-8 grid gap-4 rounded-3xl border border-line bg-card p-5 sm:grid-cols-2 sm:p-7">
          <div className="sm:col-span-2"><dt className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">Address</dt><dd className="text-ink">{rec.claim_address}</dd></div>
          <div><dt className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">Move-in</dt><dd>{rec.claim_start ? fmtDay(rec.claim_start) : "Not stated"}</dd></div>
          <div><dt className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">Move-out</dt><dd>{rec.claim_end ? fmtDay(rec.claim_end) : "Still living there"}</dd></div>
          {rec.claim_rent && <div><dt className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">Monthly rent</dt><dd>${rec.claim_rent}</dd></div>}
        </dl>

        {locked ? (
          <div className="mt-8 space-y-4">
            <Notice>
              {phase === "done"
                ? f.answer === "yes"
                  ? "Thank you. Your confirmation was saved and the renter can now see it."
                  : f.answer === "no-confirm"
                  ? "Thank you. Your answer was saved. The renter will see that you couldn’t confirm."
                  : "Thank you. The renter will see the details you gave. You can come back to this link to change your answer."
                : `This tenancy was already confirmed on ${fmtDay(rec.responded_at)}.`}
            </Notice>
            <p className="text-ink-soft">If something needs to change after confirming, ask the renter to send a new request.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-6">
            {rec.status === "corrected" && <Notice>You responded on {fmtDay(rec.responded_at)}. You can update your answer until it is confirmed.</Notice>}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Your name" htmlFor="cf-name"><input id="cf-name" required maxLength={120} value={f.name} onChange={set("name")} className={inputCls} autoComplete="name" /></Field>
              <Field label="Your role" htmlFor="cf-role" hint="For example owner, property manager."><input id="cf-role" required maxLength={120} value={f.role} onChange={set("role")} className={inputCls} /></Field>
            </div>
            <fieldset>
              <legend className="text-sm font-semibold text-ink">Are these details right?</legend>
              <div className="mt-2 space-y-2">
                {[["yes", "Yes, these details are correct."], ["no", "Some details are different."], ["no-confirm", "I can’t confirm this tenancy."]].map(([k, l]) => (
                  <label key={k} className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3.5 ${f.answer === k ? "border-forest bg-moss-tint" : "border-line bg-card"}`}>
                    <input type="radio" name="ans" checked={f.answer === k} onChange={() => setF((s) => ({ ...s, answer: k }))} className="mt-1 h-5 w-5 accent-forest" />
                    <span className="text-ink">{l}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {f.answer === "no" && (
              <div className="grid gap-5 rounded-2xl border border-line bg-card p-5 sm:grid-cols-3">
                <Field label="Move-in" htmlFor="cf-s"><input id="cf-s" type="date" value={dateOnly(f.start)} onChange={set("start")} className={inputCls} /></Field>
                <Field label="Move-out" htmlFor="cf-e"><input id="cf-e" type="date" value={dateOnly(f.end)} onChange={set("end")} className={inputCls} /></Field>
                <Field label="Monthly rent ($)" htmlFor="cf-r"><input id="cf-r" inputMode="numeric" maxLength={20} value={f.rent} onChange={set("rent")} className={inputCls} /></Field>
                <p className="text-sm text-ink-soft sm:col-span-3">Both versions will be shown side by side. The renter can accept yours or explain theirs. Nothing is a verdict.</p>
              </div>
            )}
            <Field label="A short note" htmlFor="cf-note" hint="Optional. Facts only, please. No opinions about the renter.">
              <textarea id="cf-note" rows={3} maxLength={1000} value={f.note} onChange={set("note")} className={`${inputCls} resize-y`} />
            </Field>
            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true"><label>Leave empty<input tabIndex={-1} autoComplete="off" value={f.trap} onChange={set("trap")} /></label></div>
            {err && <Notice kind="error">{err}</Notice>}
            <Btn type="submit" disabled={phase === "sending"}>{phase === "sending" ? "Saving…" : "Send my answer"}</Btn>
          </form>
        )}
        <div className="mt-10"><SiteDisclaimer /></div>
        <p className="mt-6"><Link to="/" className="font-semibold text-forest underline underline-offset-4">About RentalStories</Link></p>
      </div>
    </Container>
  );
}
