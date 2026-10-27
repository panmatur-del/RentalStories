import { useMemo, useState } from "react";
import { Link } from "react-router";
import FileText from "icon:file-text";
import Trash2 from "icon:trash-2";
import Lock from "icon:lock";
import Download from "icon:download";
import Upload from "icon:upload";
import Send from "icon:send";
import {
  Container,
  Eyebrow,
  Btn,
  BtnLink,
  EvidenceBadge,
  FeaturePill,
  Field,
  inputCls,
  SiteDisclaimer,
  EVIDENCE,
  fmtDate,
  BuildYourOwn,
} from "../components/ui.jsx";
import { VAULT_CATEGORIES, TENANCIES } from "../data/passport.js";
import { usePassport } from "../lib/PassportContext.jsx";

const CHOOSABLE = ["self", "document", "payment"];

function Row({ d }) {
  const { deleteDoc, classifyDoc } = usePassport();
  const [confirm, setConfirm] = useState(false);
  const cat = VAULT_CATEGORIES.find((c) => c.id === d.cat);
  const locked = !CHOOSABLE.includes(d.evidence);
  return (
    <li className="rounded-2xl border border-line bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start gap-4">
        <FileText className="mt-1 h-7 w-7 shrink-0 text-lake" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="break-words font-semibold">{d.name}</p>
          <p className="text-sm text-ink-soft">
            {cat?.label} · {d.tenancy} · {d.size} · added {fmtDate(d.added)}
            {d.redacted && " · sensitive details covered"}
          </p>
        </div>
        <EvidenceBadge type={d.evidence} />
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-4">
        <div className="min-w-[14rem]">
          {locked ? (
            <p className="text-sm text-ink-soft">
              This level was set by the person who confirmed it, so you can’t change it here.
            </p>
          ) : (
            <Field label="How is this evidence classified?" htmlFor={`cls-${d.id}`}>
              <select
                id={`cls-${d.id}`}
                className={inputCls}
                value={d.evidence}
                onChange={(e) => classifyDoc(d.id, e.target.value)}
              >
                {CHOOSABLE.map((k) => (
                  <option key={k} value={k}>{EVIDENCE[k].label}</option>
                ))}
              </select>
            </Field>
          )}
        </div>
        {confirm ? (
          <span className="flex flex-wrap items-center gap-2">
            <Btn variant="danger" onClick={() => deleteDoc(d.id)}>Delete for good</Btn>
            <Btn variant="ghost" onClick={() => setConfirm(false)}>Keep</Btn>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirm(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-clay hover:bg-rose-tint"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
          </button>
        )}
      </div>
    </li>
  );
}

function ConfirmationRequest() {
  const [tenancy, setTenancy] = useState(TENANCIES[0].id);
  const [preview, setPreview] = useState(false);
  const t = TENANCIES.find((x) => x.id === tenancy);
  return (
    <section className="rounded-3xl border border-line bg-card p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl sm:text-4xl">Ask a landlord to confirm</h2>
        <FeaturePill status="development" />
      </div>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Landlord confirmation is how a record becomes Landlord Confirmed. This preview shows what a housing provider
        would be asked. This page uses sample data. Create your own confirmation link from your Passport.
      </p>
      <div className="mt-5 max-w-md">
        <Field label="Which tenancy?" htmlFor="ct">
          <select id="ct" className={inputCls} value={tenancy} onChange={(e) => { setTenancy(e.target.value); setPreview(false); }}>
            {TENANCIES.map((x) => (
              <option key={x.id} value={x.id}>{x.address}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="mt-4">
        <Btn type="button" variant="ghost" onClick={() => setPreview((p) => !p)} aria-expanded={preview}>
          <Send className="h-4 w-4" aria-hidden="true" /> {preview ? "Hide the preview" : "Preview the request"}
        </Btn>
      </div>
      {preview && (
        <div className="mt-5 rounded-2xl border border-line bg-white p-5">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">What the landlord sees</p>
          <p className="mt-3">
            Alex Rivera has asked you to confirm that they rented <strong>{t.address}</strong> ({t.place}) from{" "}
            <strong>{t.from}</strong> to <strong>{t.to}</strong>.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-soft">
            <li>You are asked about dates, address and rent only.</li>
            <li>You can confirm, correct, or decline. Declining is never counted against Alex.</li>
            <li>You are not asked to rate Alex, and nothing you say becomes a score.</li>
            <li>Your name, role and the date will appear next to your confirmation.</li>
          </ul>
        </div>
      )}
    </section>
  );
}

export default function EvidenceVault() {
  const { docs } = usePassport();
  const [cat, setCat] = useState("all");
  const counts = useMemo(() => {
    const c = {};
    docs.forEach((d) => { c[d.cat] = (c[d.cat] || 0) + 1; });
    return c;
  }, [docs]);
  const shown = cat === "all" ? docs : docs.filter((d) => d.cat === cat);

  function download() {
    const rows = [["Name", "Category", "Tenancy", "Evidence level", "Added"]].concat(
      docs.map((d) => [d.name, VAULT_CATEGORIES.find((c) => c.id === d.cat)?.label, d.tenancy, EVIDENCE[d.evidence].label, d.added]),
    );
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-evidence-list.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <section className="border-b border-line">
        <Container className="py-14 sm:py-20">
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow className="text-moss">Evidence Vault</Eyebrow>
            <FeaturePill status="demo" />
          </div>
          <h1 className="rise mt-4 max-w-4xl text-[2.75rem] sm:text-6xl lg:text-[3.6rem]">
            Where your records live, <em className="text-moss">and stay yours.</em>
          </h1>
          <p className="rise mt-6 max-w-2xl text-lg text-ink-soft sm:text-xl" style={{ animationDelay: "0.1s" }}>
            Leases, receipts, move-in photos, notices and messages, organised by tenancy and labelled with how strong the
            evidence is. Records here are private. They only leave the Vault inside a share you create.
          </p>
          <p className="rise mt-5 inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper" style={{ animationDelay: "0.2s" }}>
            <Lock className="h-4 w-4" aria-hidden="true" /> Private by default. Sample records below.
          </p>
        </Container>
      </section>

      <Container className="pt-8">
        <BuildYourOwn />
      </Container>
      <Container className="py-12">
        <div role="group" aria-label="Filter by type of record" className="flex flex-wrap gap-2">
          {[{ id: "all", label: "All records" }, ...VAULT_CATEGORIES].map((c) => {
            const n = c.id === "all" ? docs.length : counts[c.id] || 0;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={cat === c.id}
                onClick={() => setCat(c.id)}
                className={`min-h-11 rounded-full border border-line px-4 text-[0.92rem] font-semibold transition-colors ${
                  cat === c.id ? "bg-forest text-paper" : "bg-transparent text-ink hover:bg-sand"
                }`}
              >
                {c.label} <span className="font-mono text-xs">({n})</span>
              </button>
            );
          })}
        </div>

        <p className="mt-6 max-w-3xl text-ink-soft">
          Classify each record yourself as Renter Provided, Document Supported or Payment Supported.{" "}
          <Link to="/evidence-levels" className="font-semibold text-forest underline underline-offset-4">What the levels mean</Link>.
          Landlord Confirmed and Independently Verified are only set when someone else confirms a fact.
        </p>

        {shown.length === 0 ? (
          <p role="status" className="mt-6 rounded-3xl border border-dashed border-sage p-8 text-center text-lg">
            {docs.length === 0
              ? "Your Vault is empty. Records you delete are gone for good. Add new ones whenever you like."
              : "Nothing in this category yet."}
          </p>
        ) : (
          <ul className="mt-6 grid gap-3" aria-live="polite">
            {shown.map((d) => <Row key={d.id} d={d} />)}
          </ul>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-dashed border-sage p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-sans text-lg font-semibold">
                <Upload className="h-5 w-5" aria-hidden="true" /> Add a record
              </h2>
              <FeaturePill status="demo" />
            </div>
            <p className="mt-2 text-ink-soft">
              Add a file, choose its tenancy and type, and classify it yourself. This page uses sample data, so uploads here are switched off. Your own Evidence Vault is in your Passport.
            </p>
          </div>
          <div className="rounded-3xl border border-line bg-card p-6">
            <h2 className="flex items-center gap-2 font-sans text-lg font-semibold">
              <Download className="h-5 w-5" aria-hidden="true" /> Download your records
            </h2>
            <p className="mt-2 text-ink-soft">
              Your records are yours to take. This sample downloads a list of the records above.
            </p>
            <Btn type="button" variant="ghost" className="mt-4" onClick={download} disabled={docs.length === 0}>
              Download sample list (CSV)
            </Btn>
          </div>
        </div>

        <div className="mt-10">
          <ConfirmationRequest />
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4 rounded-3xl bg-sand p-6">
          <p className="max-w-xl text-lg">Ready to show someone part of this? Choose the evidence, the recipient and the duration.</p>
          <BtnLink to="/share" arrow>Open Secure Share</BtnLink>
        </div>
        <SiteDisclaimer className="mt-10" />
      </Container>
    </>
  );
}
