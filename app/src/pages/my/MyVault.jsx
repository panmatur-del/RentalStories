import { useRef, useState } from "react";
import Upload from "icon:upload";
import Download from "icon:download";
import { Eyebrow, Btn, Field, inputCls, EvidenceBadge, EVIDENCE } from "../../components/ui.jsx";
import { pb } from "../../lib/pb.js";
import { useMy } from "../../lib/my.jsx";
import { friendlyError } from "../../lib/auth.jsx";
import { CATS, catLabel, fmtDay } from "../../lib/share.js";
import { Panel, Notice, Empty, ConfirmButton } from "./bits.jsx";

const LEVELS = ["self", "document", "payment"];
const MAX = 10 * 1024 * 1024;

export async function downloadEvidenceFile(rec) {
  const token = await pb.files.getToken();
  const url = pb.files.getURL(rec, rec.file, { token, download: true });
  const a = document.createElement("a");
  a.href = url;
  a.rel = "noopener";
  a.download = rec.title || "record";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function MyVault() {
  const { user, tenancies, evidence, reload } = useMy();
  const fileRef = useRef(null);
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [f, setF] = useState({ title: "", category: "lease", tenancy: "", level: "document", date: "", source: "", note: "", redacted: false });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function add(e) {
    e.preventDefault();
    if (busy) return;
    setErr(""); setOk("");
    const file = fileRef.current?.files?.[0];
    if (f.level !== "self" && !file) { setErr("Document Supported and Payment Supported need a file attached. Choose a file, or switch to Renter Provided."); return; }
    if (file && file.size > MAX) { setErr("That file is over 10 MB. Please choose a smaller one."); return; }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("owner", user.id);
      fd.append("title", f.title.trim());
      fd.append("category", f.category);
      fd.append("level", f.level);
      if (f.tenancy) fd.append("tenancy", f.tenancy);
      if (f.date) fd.append("evidence_date", f.date);
      if (f.source.trim()) fd.append("source", f.source.trim());
      if (f.note.trim()) fd.append("note", f.note.trim());
      fd.append("redacted", f.redacted ? "true" : "false");
      if (file) fd.append("file", file);
      await pb.collection("evidence").create(fd);
      await reload();
      setF((s) => ({ ...s, title: "", date: "", source: "", note: "", redacted: false }));
      if (fileRef.current) fileRef.current.value = "";
      setOk("Added to your private Evidence Vault.");
    } catch (ex) {
      setErr(friendlyError(ex, "We couldn’t save that. The file may be a type we don’t accept. PDFs, photos, Word and text files work."));
    }
    setBusy(false);
  }

  async function reclassify(rec, level) {
    setErr("");
    if (level !== "self" && !rec.file) { setErr("That level needs a file attached to the record."); return; }
    try { await pb.collection("evidence").update(rec.id, { level }); await reload(); } catch (ex) { setErr(friendlyError(ex)); }
  }
  async function remove(rec) {
    setErr("");
    try { await pb.collection("evidence").delete(rec.id); await reload(); } catch (ex) { setErr(friendlyError(ex)); }
  }
  async function dl(rec) {
    try { await downloadEvidenceFile(rec); } catch (ex) { setErr("We couldn’t get that file just now. Please try again."); }
  }

  const shown = evidence.filter((e) => filter === "all" || e.category === filter);
  const tenName = (id) => tenancies.find((t) => t.id === id)?.address;

  return (
    <div className="space-y-8">
      <header>
        <Eyebrow className="text-moss">Evidence Vault</Eyebrow>
        <h1 className="mt-3 text-4xl sm:text-5xl">Your private records.</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">
          Upload leases, receipts and more. You classify each record yourself. Housing providers confirm theirs separately.
        </p>
      </header>

      <Panel title="Add a record" lead="Nothing is shared when you add a record. It stays private until you include it in a share.">
        <form onSubmit={add} className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="What is it?" htmlFor="ev-title" hint="For example, “Lease renewal 2025” or “May rent receipt”.">
              <input id="ev-title" required maxLength={160} value={f.title} onChange={set("title")} className={inputCls} />
            </Field>
          </div>
          <Field label="Type of record" htmlFor="ev-cat">
            <select id="ev-cat" value={f.category} onChange={set("category")} className={inputCls}>
              {CATS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Which tenancy?" htmlFor="ev-ten" hint="Optional.">
            <select id="ev-ten" value={f.tenancy} onChange={set("tenancy")} className={inputCls}>
              <option value="">Not linked to a tenancy</option>
              {tenancies.map((t) => <option key={t.id} value={t.id}>{t.address}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Evidence level" htmlFor="ev-level" hint={EVIDENCE[f.level].desc}>
              <select id="ev-level" value={f.level} onChange={set("level")} className={inputCls}>
                {LEVELS.map((l) => <option key={l} value={l}>{EVIDENCE[l].label}</option>)}
              </select>
            </Field>
            <p className="mt-2 text-sm text-ink-soft">Landlord Confirmed and Independently Verified can’t be chosen here. Those come from someone else.</p>
          </div>
          <Field label="Date on the record" htmlFor="ev-date" hint="Optional.">
            <input id="ev-date" type="date" value={f.date} onChange={set("date")} className={inputCls} />
          </Field>
          <Field label="Where it came from" htmlFor="ev-source" hint="For example, the property portal or your bank.">
            <input id="ev-source" maxLength={160} value={f.source} onChange={set("source")} className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="File" htmlFor="ev-file" hint="PDF, photo, Word or text file, up to 10 MB.">
              <input
                id="ev-file" ref={fileRef} type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.txt,.docx,application/pdf,image/*,text/plain"
                className="block w-full rounded-xl border-2 border-dashed border-ink-soft/60 bg-white p-3 text-sm text-ink file:mr-4 file:min-h-10 file:rounded-full file:border-0 file:bg-forest file:px-5 file:font-semibold file:text-paper"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Note" htmlFor="ev-note" hint="Optional. Shown with the record.">
              <textarea id="ev-note" rows={2} maxLength={500} value={f.note} onChange={set("note")} className={`${inputCls} resize-y`} />
            </Field>
          </div>
          <label className="flex items-start gap-3 text-[0.95rem] text-ink sm:col-span-2">
            <input type="checkbox" checked={f.redacted} onChange={set("redacted")} className="mt-1 h-5 w-5 accent-forest" />
            <span>I covered up private details (like account numbers) before uploading, and I’d like it marked as redacted.</span>
          </label>
          <div className="sm:col-span-2">
            <Btn type="submit" disabled={busy}><Upload className="h-4 w-4" aria-hidden="true" />{busy ? "Saving…" : "Add to my vault"}</Btn>
          </div>
          {err && <div className="sm:col-span-2"><Notice kind="error">{err}</Notice></div>}
          {ok && <div className="sm:col-span-2"><Notice>{ok}</Notice></div>}
        </form>
      </Panel>

      <Panel title="Your records">
        <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter by type">
          {[{ id: "all", label: `All (${evidence.length})` }, ...CATS.filter((c) => evidence.some((e) => e.category === c.id)).map((c) => ({ id: c.id, label: c.label }))].map((c) => (
            <button
              key={c.id} type="button" aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}
              className={`min-h-10 rounded-full border px-4 text-sm font-semibold ${filter === c.id ? "border-forest bg-forest text-paper" : "border-line bg-paper text-ink hover:border-forest"}`}
            >{c.label}</button>
          ))}
        </div>
        {shown.length === 0 ? <Empty>No records here yet.</Empty> : (
          <ul className="space-y-4">
            {shown.map((r) => (
              <li key={r.id} className="rounded-2xl border border-line bg-paper p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words font-sans text-lg font-semibold">{r.title}</h3>
                    <p className="text-sm text-ink-soft">
                      {catLabel(r.category)}
                      {tenName(r.tenancy) ? ` · ${tenName(r.tenancy)}` : ""}
                      {r.evidence_date ? ` · ${fmtDay(r.evidence_date)}` : ""}
                      {r.source ? ` · Source: ${r.source}` : ""}
                    </p>
                  </div>
                  <EvidenceBadge type={r.level} />
                </div>
                {r.note && <p className="mt-2 text-[0.95rem] text-ink">{r.note}</p>}
                <p className="mt-2 text-sm text-ink-soft">
                  {r.file ? "File attached" : "No file"}{r.redacted ? " · Redacted by you" : ""} · Added {fmtDay(r.created)}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-ink">
                    Level
                    <select value={r.level} onChange={(e) => reclassify(r, e.target.value)} className="min-h-10 rounded-lg border-2 border-line bg-white px-2 text-sm font-normal">
                      {LEVELS.map((l) => <option key={l} value={l}>{EVIDENCE[l].label}</option>)}
                    </select>
                  </label>
                  {r.file && <Btn type="button" variant="ghost" onClick={() => dl(r)}><Download className="h-4 w-4" aria-hidden="true" />Download</Btn>}
                  <ConfirmButton label="Delete" confirmLabel="Yes, delete it" onConfirm={() => remove(r)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
