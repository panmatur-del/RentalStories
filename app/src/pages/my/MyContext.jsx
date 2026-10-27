import { useState } from "react";
import { Eyebrow, Btn, Field, inputCls } from "../../components/ui.jsx";
import { CONTEXT_PROMPTS } from "../../data/passport.js";
import { pb } from "../../lib/pb.js";
import { useMy } from "../../lib/my.jsx";
import { friendlyError } from "../../lib/auth.jsx";
import { fmtDay } from "../../lib/share.js";
import { Panel, Notice, Empty, ConfirmButton } from "./bits.jsx";

export default function MyContext() {
  const { user, tenancies, notes, reload } = useMy();
  const [f, setF] = useState({ topic: CONTEXT_PROMPTS[0], body: "", tenancy: "" });
  const [editId, setEditId] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setErr("");
    try {
      const data = { topic: f.topic, body: f.body.trim(), tenancy: f.tenancy || "" };
      if (editId) await pb.collection("context_notes").update(editId, data);
      else await pb.collection("context_notes").create({ ...data, owner: user.id });
      await reload();
      setF({ topic: CONTEXT_PROMPTS[0], body: "", tenancy: "" });
      setEditId("");
    } catch (ex) { setErr(friendlyError(ex, "We couldn’t save that. Please try again.")); }
    setBusy(false);
  }
  async function remove(id) {
    try { await pb.collection("context_notes").delete(id); await reload(); } catch (ex) { setErr(friendlyError(ex)); }
  }
  function edit(n) {
    setEditId(n.id);
    setF({ topic: n.topic, body: n.body, tenancy: n.tenancy || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-8">
      <header>
        <Eyebrow className="text-moss">My context</Eyebrow>
        <h1 className="mt-3 text-4xl sm:text-5xl">In your own words.</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">
          Credit issues, a consumer proposal, a gap in work, self-employment or a move to Canada don’t always show how you actually rent. Explain here if you’d like. It is always shown apart from the verified facts, and labelled as yours.
        </p>
      </header>
      <Panel title={editId ? "Edit your note" : "Add a note"}>
        <form onSubmit={save} className="grid gap-5">
          <Field label="What is this about?" htmlFor="cx-topic">
            <select id="cx-topic" value={f.topic} onChange={set("topic")} className={inputCls}>
              {CONTEXT_PROMPTS.includes(f.topic) ? null : <option value={f.topic}>{f.topic}</option>}
              {CONTEXT_PROMPTS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Which tenancy does it relate to?" htmlFor="cx-ten" hint="Optional.">
            <select id="cx-ten" value={f.tenancy} onChange={set("tenancy")} className={inputCls}>
              <option value="">All of my history</option>
              {tenancies.map((t) => <option key={t.id} value={t.id}>{t.address}</option>)}
            </select>
          </Field>
          <Field label="Your explanation" htmlFor="cx-body" hint="Keep it factual and in your own words. Up to 2,000 characters.">
            <textarea id="cx-body" required rows={5} maxLength={2000} value={f.body} onChange={set("body")} className={`${inputCls} resize-y`} />
          </Field>
          {err && <Notice kind="error">{err}</Notice>}
          <div className="flex flex-wrap gap-3">
            <Btn type="submit" disabled={busy}>{busy ? "Saving…" : editId ? "Save changes" : "Add note"}</Btn>
            {editId && <Btn type="button" variant="ghost" onClick={() => { setEditId(""); setF({ topic: CONTEXT_PROMPTS[0], body: "", tenancy: "" }); }}>Cancel</Btn>}
          </div>
        </form>
      </Panel>
      <Panel title="Your notes">
        {notes.length === 0 ? <Empty>No notes yet. Adding context is always optional.</Empty> : (
          <ul className="space-y-4">
            {notes.map((n) => (
              <li key={n.id} className="rounded-2xl border border-line bg-paper p-5">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">{n.topic} · Renter Provided · {fmtDay(n.created)}</p>
                <p className="mt-2 whitespace-pre-wrap text-ink">{n.body}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Btn type="button" variant="ghost" onClick={() => edit(n)}>Edit</Btn>
                  <ConfirmButton label="Delete" confirmLabel="Yes, delete it" onConfirm={() => remove(n.id)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
