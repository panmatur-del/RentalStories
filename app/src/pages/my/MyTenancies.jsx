import { useState } from "react";
import Plus from "icon:plus";
import { Eyebrow, Btn, Field, inputCls } from "../../components/ui.jsx";
import { pb } from "../../lib/pb.js";
import { useMy, rid } from "../../lib/my.jsx";
import { friendlyError } from "../../lib/auth.jsx";
import { dateOnly, publicLink, fmtDay } from "../../lib/share.js";
import { Panel, Notice, Empty, CopyLink, ConfirmButton, TenancyFacts, VersionsTable } from "./bits.jsx";

const blank = { address: "", city: "", region: "", start_date: "", end_date: "", rent: "", landlord_name: "", landlord_role: "" };

function TenancyForm({ initial = blank, onSave, onCancel, busy, submitLabel }) {
  const [f, setF] = useState(() => {
    const o = {};
    for (const k of Object.keys(blank)) o[k] = initial[k] ?? "";
    o.start_date = dateOnly(initial.start_date);
    o.end_date = dateOnly(initial.end_date);
    return o;
  });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const id = (k) => `tf-${initial.id || "new"}-${k}`;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...f, rent: f.rent === "" ? null : Number(f.rent), start_date: f.start_date || null, end_date: f.end_date || null });
      }}
      className="grid gap-5 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <Field label="Address" htmlFor={id("address")}>
          <input id={id("address")} required maxLength={160} value={f.address} onChange={set("address")} className={inputCls} autoComplete="off" />
        </Field>
      </div>
      <Field label="City" htmlFor={id("city")}><input id={id("city")} maxLength={80} value={f.city} onChange={set("city")} className={inputCls} /></Field>
      <Field label="Province or territory" htmlFor={id("region")}><input id={id("region")} maxLength={80} value={f.region} onChange={set("region")} className={inputCls} /></Field>
      <Field label="Move-in date" htmlFor={id("start")}><input id={id("start")} type="date" required value={f.start_date} onChange={set("start_date")} className={inputCls} /></Field>
      <Field label="Move-out date" htmlFor={id("end")} hint="Leave empty if you still live here.">
        <input id={id("end")} type="date" value={f.end_date} onChange={set("end_date")} className={inputCls} />
      </Field>
      <Field label="Monthly rent ($)" htmlFor={id("rent")} hint="Optional. You choose later whether to share it.">
        <input id={id("rent")} type="number" min="0" max="1000000" step="1" inputMode="numeric" value={f.rent} onChange={set("rent")} className={inputCls} />
      </Field>
      <Field label="Housing provider’s name" htmlFor={id("ll")} hint="Optional.">
        <input id={id("ll")} maxLength={120} value={f.landlord_name} onChange={set("landlord_name")} className={inputCls} />
      </Field>
      <Field label="Their role" htmlFor={id("role")} hint="For example owner, property manager.">
        <input id={id("role")} maxLength={80} value={f.landlord_role} onChange={set("landlord_role")} className={inputCls} />
      </Field>
      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <Btn type="submit" disabled={busy}>{busy ? "Saving…" : submitLabel}</Btn>
        {onCancel && <Btn type="button" variant="ghost" onClick={onCancel}>Cancel</Btn>}
      </div>
    </form>
  );
}

function Confirmation({ t, conf, reload, user }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [note, setNote] = useState(conf?.renter_note || "");

  async function run(fn) {
    setBusy(true);
    setErr("");
    try { await fn(); await reload(); } catch (e) { setErr(friendlyError(e)); }
    setBusy(false);
  }

  const send = () =>
    run(async () => {
      if (conf) await pb.collection("confirmations").delete(conf.id);
      await pb.collection("confirmations").create({
        id: rid(), owner: user.id, tenancy: t.id, status: "requested",
        claim_renter: user.name || "", claim_address: [t.address, t.city, t.region].filter(Boolean).join(", "),
        claim_start: dateOnly(t.start_date), claim_end: dateOnly(t.end_date), claim_rent: t.rent ? String(t.rent) : "",
        landlord_name: t.landlord_name || "",
      });
    });

  const changed =
    conf &&
    (conf.claim_start !== dateOnly(t.start_date) || conf.claim_end !== dateOnly(t.end_date) || conf.claim_rent !== (t.rent ? String(t.rent) : ""));

  const resolve = (resolution, patch = {}) =>
    run(async () => {
      if (patch.tenancy) await pb.collection("tenancies").update(t.id, patch.tenancy);
      await pb.collection("confirmations").update(conf.id, { resolution, renter_note: note.slice(0, 1000) });
    });

  const link = conf ? publicLink(`confirm/${conf.id}`) : "";

  return (
    <div className="mt-5 rounded-2xl border border-line bg-white p-5">
      <h4 className="font-sans text-lg font-semibold">Housing provider confirmation</h4>
      {!conf && (
        <>
          <p className="mt-1 text-ink-soft">
            Get a private link to send to your housing provider yourself. They confirm the facts or tell you what differs. They never rate you.
          </p>
          <div className="mt-4"><Btn type="button" onClick={send} disabled={busy}>Create a confirmation link</Btn></div>
        </>
      )}
      {conf?.status === "requested" && (
        <div className="mt-2 space-y-3">
          <p className="text-ink">Send this link to your housing provider. Only people with the link can open it.</p>
          <CopyLink url={link} />
          {changed && <Notice>You’ve changed this tenancy since the link was made. Make a new link so they see the current details.</Notice>}
          <div className="flex flex-wrap gap-3">
            {changed && <Btn type="button" onClick={send} disabled={busy}>Make a new link</Btn>}
            <ConfirmButton label="Withdraw this request" confirmLabel="Yes, withdraw it" onConfirm={() => run(() => pb.collection("confirmations").delete(conf.id))} />
          </div>
        </div>
      )}
      {conf?.status === "declined" && (
        <div className="mt-2 space-y-3">
          <p className="text-ink">Your housing provider declined to confirm. This tenancy stays Renter Provided. It isn’t counted against you.</p>
          <Btn type="button" variant="ghost" onClick={send} disabled={busy}>Ask again</Btn>
        </div>
      )}
      {conf?.status === "confirmed" && (
        <div className="mt-2 space-y-3">
          <p className="text-ink">
            Confirmed by {conf.responder_name}{conf.responder_role ? `, ${conf.responder_role}` : ""} on {fmtDay(conf.responded_at)}.
            {conf.response_note ? ` “${conf.response_note}”` : ""}
          </p>
          {changed && (
            <>
              <Notice>You’ve changed details since this was confirmed. Ask again so the confirmation matches what you share.</Notice>
              <Btn type="button" variant="ghost" onClick={send} disabled={busy}>Ask for a new confirmation</Btn>
            </>
          )}
        </div>
      )}
      {conf?.status === "corrected" && (
        <div className="mt-2 space-y-4">
          <p className="text-ink">
            {conf.responder_name}{conf.responder_role ? `, ${conf.responder_role}` : ""} says some details are different.
            {conf.resolution ? "" : " Until you respond, this shows as Disputed / Correction Requested."}
          </p>
          <VersionsTable t={t} conf={conf} />
          {conf.response_note && <p className="rounded-xl bg-sand p-3 text-[0.95rem] text-ink">Their note: “{conf.response_note}”</p>}
          <Field label="Your note, shown beside both versions" htmlFor={`rn-${t.id}`} hint="Optional.">
            <textarea id={`rn-${t.id}`} rows={3} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} className={`${inputCls} resize-y`} />
          </Field>
          <div className="flex flex-wrap gap-3">
            <Btn
              type="button" disabled={busy}
              onClick={() => resolve("accepted_theirs", { tenancy: {
                start_date: conf.their_start || t.start_date || null,
                end_date: conf.their_end || null,
                rent: conf.their_rent && !isNaN(Number(conf.their_rent)) ? Number(conf.their_rent) : t.rent ?? null,
              } })}
            >Accept their version</Btn>
            <Btn type="button" variant="ghost" disabled={busy} onClick={() => resolve("agreed")}>We now agree</Btn>
            <Btn type="button" variant="ghost" disabled={busy} onClick={() => resolve("kept_mine")}>Keep my version</Btn>
          </div>
          <p className="text-sm text-ink-soft">Keeping your version leaves it marked as disputed, with both sides visible. Nothing is removed.</p>
        </div>
      )}
      {err && <Notice kind="error" className="mt-3">{err}</Notice>}
    </div>
  );
}

export default function MyTenancies() {
  const { user, tenancies, evidence, confirmations, reload } = useMy();
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const confBy = new Map(confirmations.map((c) => [c.tenancy, c]));

  async function save(data, id) {
    setBusy(true);
    setErr("");
    try {
      if (id) await pb.collection("tenancies").update(id, data);
      else await pb.collection("tenancies").create({ ...data, owner: user.id });
      await reload();
      setAdding(false);
      setEditId("");
    } catch (e) { setErr(friendlyError(e, "We couldn’t save that. Please check the details.")); }
    setBusy(false);
  }
  async function remove(id) {
    setErr("");
    try { await pb.collection("tenancies").delete(id); await reload(); } catch (e) { setErr(friendlyError(e)); }
  }

  return (
    <div className="space-y-8">
      <header>
        <Eyebrow className="text-moss">Tenancies</Eyebrow>
        <h1 className="mt-3 text-4xl sm:text-5xl">Where you have rented.</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">Add each tenancy, attach evidence, then ask the housing provider to confirm the facts.</p>
      </header>
      {err && <Notice kind="error">{err}</Notice>}
      <Panel
        title={adding ? "New tenancy" : "Your tenancies"}
        action={!adding && <Btn type="button" onClick={() => setAdding(true)}><Plus className="h-4 w-4" aria-hidden="true" />Add a tenancy</Btn>}
      >
        {adding && <TenancyForm busy={busy} submitLabel="Save tenancy" onSave={(d) => save(d)} onCancel={() => setAdding(false)} />}
        {!adding && tenancies.length === 0 && <Empty>No tenancies yet. Add the most recent place you rented to begin.</Empty>}
        {!adding && (
          <ul className="space-y-6">
            {tenancies.map((t) => {
              const c = confBy.get(t.id);
              return (
                <li key={t.id} className="rounded-2xl border border-line bg-paper p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-sans text-xl font-semibold">{t.address}</h3>
                      <p className="text-ink-soft">{[t.city, t.region].filter(Boolean).join(", ")}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editId !== t.id && <Btn type="button" variant="ghost" onClick={() => setEditId(t.id)}>Edit</Btn>}
                      <ConfirmButton label="Delete" confirmLabel="Yes, delete it" onConfirm={() => remove(t.id)} />
                    </div>
                  </div>
                  {editId === t.id ? (
                    <div className="mt-5">
                      <TenancyForm initial={t} busy={busy} submitLabel="Save changes" onSave={(d) => save(d, t.id)} onCancel={() => setEditId("")} />
                    </div>
                  ) : (
                    <div className="mt-4">
                      <TenancyFacts t={t} evidence={evidence} conf={c} />
                    </div>
                  )}
                  <Confirmation t={t} conf={c} reload={reload} user={user} />
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
