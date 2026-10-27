import { useEffect, useState } from "react";
import { Link } from "react-router";
import Lock from "icon:lock";
import { Container, Eyebrow, Btn, Field, inputCls, EvidenceBadge, SiteDisclaimer } from "../components/ui.jsx";
import { pb } from "../lib/pb.js";
import { catLabel, fmtDay, fmtMonth, fmtWhen, money } from "../lib/share.js";
import { Notice } from "./my/bits.jsx";

const opened = new Set();

function useShare(id) {
  const [s, setS] = useState({ loading: true, share: null });
  useEffect(() => {
    const c = new AbortController();
    pb.collection("shares")
      .getOne(id, { signal: c.signal })
      .then((share) => {
        setS({ loading: false, share });
        if (!opened.has(id)) {
          opened.add(id);
          pb.collection("access_log").create({ share: id, event: "opened" }).catch(() => {});
        }
      })
      .catch((e) => { if (!e?.isAbort) setS({ loading: false, share: null }); });
    return () => c.abort();
  }, [id]);
  return s;
}

function Unavailable() {
  return (
    <Container className="py-20">
      <div className="mx-auto max-w-xl rounded-3xl border border-line bg-card p-8 text-center sm:p-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-moss-tint text-forest"><Lock className="h-7 w-7" aria-hidden="true" /></span>
        <h1 className="mt-6 text-4xl">This link isn’t available.</h1>
        <p className="mt-4 text-lg text-ink-soft">It may have expired, been withdrawn by the person who shared it, or been mistyped. If you were expecting a Rental Passport, please ask them for a new link.</p>
        <p className="mt-6"><Link to="/" className="font-semibold text-forest underline underline-offset-4">About RentalStories</Link></p>
      </div>
    </Container>
  );
}

function RequestForm({ shareId }) {
  const [f, setF] = useState({ name: "", org: "", message: "", trap: "" });
  const [state, setState] = useState("idle");
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  async function send(e) {
    e.preventDefault();
    if (state === "sending" || f.trap) return;
    setState("sending");
    try {
      await pb.collection("info_requests").create({ share: shareId, requester_name: f.name.trim(), requester_org: f.org.trim(), message: f.message.trim() });
      pb.collection("access_log").create({ share: shareId, event: "info_requested" }).catch(() => {});
      setState("sent");
    } catch { setState("error"); }
  }
  if (state === "sent") return <Notice>Your request was saved for the renter. They’ll see it in their Passport and can reply to you.</Notice>;
  return (
    <form onSubmit={send} className="grid gap-5 sm:grid-cols-2">
      <Field label="Your name" htmlFor="rq-name"><input id="rq-name" required maxLength={120} value={f.name} onChange={set("name")} className={inputCls} /></Field>
      <Field label="Your organisation" htmlFor="rq-org" hint="Optional."><input id="rq-org" maxLength={120} value={f.org} onChange={set("org")} className={inputCls} /></Field>
      <div className="sm:col-span-2">
        <Field label="What would help you?" htmlFor="rq-msg" hint="For example, a missing month or a document. Please don’t include private details about anyone.">
          <textarea id="rq-msg" required rows={3} maxLength={800} value={f.message} onChange={set("message")} className={`${inputCls} resize-y`} />
        </Field>
      </div>
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true"><label>Leave empty<input tabIndex={-1} autoComplete="off" value={f.trap} onChange={set("trap")} /></label></div>
      {state === "error" && <div className="sm:col-span-2"><Notice kind="error">We couldn’t send that. The link may have just expired.</Notice></div>}
      <div className="sm:col-span-2"><Btn type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Ask the renter"}</Btn></div>
    </form>
  );
}

export default function Shared({ id }) {
  const { loading, share } = useShare(id);
  const [fileErr, setFileErr] = useState("");
  if (loading) return <p className="py-24 text-center text-ink-soft" role="status">Opening…</p>;
  if (!share || share.revoked || !share.snapshot) return <Unavailable />;
  const snap = share.snapshot;
  const expires = new Date(String(share.expires_at).replace(" ", "T"));
  if (expires.getTime() <= Date.now()) return <Unavailable />;

  async function openFile(ev) {
    setFileErr("");
    try {
      const rec = await pb.collection("share_files").getOne(ev.fileId);
      pb.collection("access_log").create({ share: id, event: "file_viewed", detail: String(ev.title).slice(0, 150) }).catch(() => {});
      const url = pb.files.getURL(rec, rec.file, { download: true });
      const a = document.createElement("a");
      a.href = url; a.rel = "noopener"; a.download = ev.title;
      document.body.appendChild(a); a.click(); a.remove();
    } catch { setFileErr("That document is no longer available."); }
  }

  const evFor = (tid) => snap.evidence.filter((e) => e.tenancy === tid);
  const general = snap.evidence.filter((e) => !e.tenancy);

  return (
    <>
      <section className="border-b border-line bg-sand">
        <Container className="py-12 sm:py-16">
          <Eyebrow className="text-moss">Shared Rental Passport</Eyebrow>
          <h1 className="mt-3 max-w-4xl text-4xl sm:text-5xl">{snap.renter}’s rental history, shared with you.</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">
            Prepared for {snap.recipient}. This link works until {fmtWhen(share.expires_at)} and can be withdrawn by the renter at any time. Please don’t forward it.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-forest/30 bg-card px-4 py-2 text-sm font-semibold text-ink">
            <Lock className="h-4 w-4" aria-hidden="true" /> Not a credit score. Not a renter score. Documented rental history.
          </p>
        </Container>
      </section>
      <Container className="space-y-10 py-10 sm:py-14">
        <section>
          <h2 className="text-3xl sm:text-4xl">Tenancies</h2>
          <ol className="mt-5 space-y-5">
            {snap.tenancies.map((t) => {
              const disputed = t.levels.includes("disputed");
              const c = t.confirmation;
              return (
                <li key={t.id} className="rounded-3xl border border-line bg-card p-5 sm:p-7">
                  <h3 className="font-sans text-xl font-semibold">{t.address}</h3>
                  <p className="text-ink-soft">{[t.city, t.region].filter(Boolean).join(", ")}</p>
                  <div className="mt-3 flex flex-wrap gap-2">{t.levels.map((l) => <EvidenceBadge key={l} type={l} />)}</div>
                  <dl className="mt-4 grid gap-x-8 gap-y-2 text-[0.95rem] sm:grid-cols-2">
                    <div><dt className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">Period</dt><dd>{fmtMonth(t.start) || "Not stated"} – {t.end ? fmtMonth(t.end) : "Present"}</dd></div>
                    {t.rent ? <div><dt className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">Rent</dt><dd>{money(t.rent)}</dd></div> : null}
                  </dl>
                  <p className="mt-4 text-sm text-ink">
                    <span className="font-semibold">Source:</span>{" "}
                    {!c && "entered by the renter. Not confirmed by a housing provider."}
                    {c?.status === "confirmed" && `confirmed by ${c.by || "the housing provider"}${c.role ? `, ${c.role}` : ""} on ${fmtDay(c.at)}.${c.note ? ` “${c.note}”` : ""}`}
                    {c?.status === "corrected" && `${c.by || "the housing provider"}${c.role ? `, ${c.role}` : ""} responded on ${fmtDay(c.at)} with different details.${c.resolution === "accepted_theirs" ? " The renter accepted their version." : ""}${c.resolution === "agreed" ? " Both sides now agree." : ""}`}
                    {c?.status === "declined" && "the housing provider declined to confirm. This stays renter provided."}
                  </p>
                  {c?.status === "corrected" && (
                    <table className="mt-4 w-full border-collapse text-left text-[0.95rem]">
                      <caption className="sr-only">The renter’s details compared with the housing provider’s</caption>
                      <thead><tr className="border-b border-line"><th scope="col" className="py-2 pr-3">Detail</th><th scope="col" className="py-2 pr-3">Renter says</th><th scope="col" className="py-2">Housing provider says</th></tr></thead>
                      <tbody>
                        <tr className="border-b border-line/70"><th scope="row" className="py-2 pr-3 font-medium">Move-in</th><td className="py-2 pr-3">{fmtDay(t.start)}</td><td className="py-2">{c.theirStart ? fmtDay(c.theirStart) : "—"}</td></tr>
                        <tr className="border-b border-line/70"><th scope="row" className="py-2 pr-3 font-medium">Move-out</th><td className="py-2 pr-3">{t.end ? fmtDay(t.end) : "Present"}</td><td className="py-2">{c.theirEnd ? fmtDay(c.theirEnd) : "—"}</td></tr>
                      </tbody>
                    </table>
                  )}
                  {c?.status === "corrected" && c.renterNote && <p className="mt-3 rounded-xl bg-sand p-3 text-[0.95rem]">Renter’s note: “{c.renterNote}”</p>}
                  {disputed && <p className="mt-3 text-sm text-ink">Both versions are shown. A dispute is not a verdict, and it isn’t a mark against anyone.</p>}
                  {evFor(t.id).length > 0 && (
                    <div className="mt-5">
                      <h4 className="font-sans text-base font-semibold">Records</h4>
                      <ul className="mt-2 space-y-2">
                        {evFor(t.id).map((e) => <EvidenceRow key={e.id} e={e} onOpen={openFile} />)}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        {general.length > 0 && (
          <section>
            <h2 className="text-3xl">Other records</h2>
            <ul className="mt-4 space-y-2">{general.map((e) => <EvidenceRow key={e.id} e={e} onOpen={openFile} />)}</ul>
          </section>
        )}
        {fileErr && <Notice kind="error">{fileErr}</Notice>}

        {snap.context.length > 0 && (
          <section>
            <h2 className="text-3xl sm:text-4xl">In the renter’s own words</h2>
            <p className="mt-2 max-w-2xl text-ink-soft">Context the renter chose to add. It is not verified and is kept apart from the facts above.</p>
            <ul className="mt-4 space-y-4">
              {snap.context.map((n) => (
                <li key={n.id} className="rounded-2xl border border-line bg-card p-5">
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">{n.topic} · Renter Provided</p>
                  <p className="mt-2 whitespace-pre-wrap">{n.body}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-3xl border border-line bg-card p-5 sm:p-8">
          <h2 className="text-3xl">Need something more?</h2>
          <p className="mt-2 max-w-2xl text-ink-soft">You can ask the renter for more information. They decide what to add.</p>
          <div className="mt-5"><RequestForm shareId={id} /></div>
        </section>

        <section>
          <h2 className="text-2xl">How to read this</h2>
          <p className="mt-2 max-w-3xl text-ink-soft">
            Each label says where a fact came from: the renter, a document, a payment record, or the housing provider. There is no score and no rating, and RentalStories does not make rental decisions. The decision is yours, and the renter chose to share this with you.
          </p>
          <p className="mt-3"><Link to="/evidence-levels" className="font-semibold text-forest underline underline-offset-4">What each evidence level means</Link></p>
        </section>
        <SiteDisclaimer />
      </Container>
    </>
  );
}

function EvidenceRow({ e, onOpen }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper p-3.5 text-[0.95rem]">
      <div className="min-w-0">
        <p className="break-words font-semibold text-ink">{e.title}</p>
        <p className="text-sm text-ink-soft">
          {catLabel(e.category)}{e.date ? ` · ${fmtDay(e.date)}` : ""}{e.source ? ` · Source: ${e.source}` : ""}{e.redacted ? " · Redacted by the renter" : ""}
        </p>
        {e.note && <p className="mt-1 text-sm text-ink">{e.note}</p>}
      </div>
      <div className="flex items-center gap-2">
        <EvidenceBadge type={e.level} />
        {e.fileId && <Btn type="button" variant="ghost" className="min-h-10 px-4 py-1.5 text-sm" onClick={() => onOpen(e)}>Open file</Btn>}
      </div>
    </li>
  );
}


