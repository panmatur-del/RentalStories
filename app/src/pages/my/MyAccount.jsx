import { useState } from "react";
import { useNavigate } from "react-router";
import Download from "icon:download";
import { Eyebrow, Btn, Field, inputCls } from "../../components/ui.jsx";
import { pb } from "../../lib/pb.js";
import { useAuth, friendlyError } from "../../lib/auth.jsx";
import { useMy } from "../../lib/my.jsx";
import { Panel, Notice } from "./bits.jsx";
import { FeaturePill } from "../../components/ui.jsx";

const strip = (r) => {
  const { collectionId, collectionName, expand, ...rest } = r;
  return rest;
};

export default function MyAccount() {
  const { user, signOut } = useAuth();
  const my = useMy();
  const nav = useNavigate();
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [typed, setTyped] = useState("");
  const [typed2, setTyped2] = useState("");
  const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState({ old: "", next: "" });
  const [rec, setRec] = useState({ phone: user?.phone || "", step: user?.second_step || "" });
  const [recMsg, setRecMsg] = useState("");

  function download() {
    const out = {
      exported: new Date().toISOString(),
      account: { name: user.name, email: user.email, phone: user.phone || "", second_step_choice: user.second_step || "" },
      tenancies: my.tenancies.map(strip),
      evidence: my.evidence.map(strip),
      context_notes: my.notes.map(strip),
      confirmation_requests: my.confirmations.map(strip),
      share_links: my.shares.map(({ snapshot, ...r }) => strip(r)),
      access_activity: my.logs.map(strip),
      note: "Files you uploaded can be downloaded one by one from your Evidence page.",
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(out, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-rental-passport.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function deleteRecords() {
    setBusy(true); setErr(""); setOk("");
    try {
      for (const [col, list] of [["shares", my.shares], ["confirmations", my.confirmations], ["context_notes", my.notes], ["evidence", my.evidence], ["tenancies", my.tenancies]])
        for (const r of list) await pb.collection(col).delete(r.id);
      await my.reload();
      setTyped("");
      setOk("All of your records have been deleted. Your account is still here.");
    } catch (e) { setErr(friendlyError(e)); }
    setBusy(false);
  }
  async function deleteAccount() {
    setBusy(true); setErr("");
    try {
      await pb.collection("members").delete(user.id);
      pb.authStore.clear();
      nav("/", { replace: true });
    } catch (e) { setErr(friendlyError(e)); setBusy(false); }
  }
  async function saveRecovery(e) {
    e.preventDefault();
    setErr(""); setOk(""); setRecMsg("");
    const phone = rec.phone.trim();
    if (phone && !/^[+()\d][\d\s().-]{6,24}$/.test(phone)) { setErr("Please check the phone number. Use digits only, with an optional + at the start."); return; }
    if (rec.step === "text" && !phone) { setErr("Add a phone number to choose text messages, or choose email instead."); return; }
    setBusy(true);
    try {
      await pb.collection("members").update(user.id, { phone, second_step: rec.step });
      setRecMsg("Saved. We’ll use these when email and text sign-in options open.");
    } catch (ex) { setErr(friendlyError(ex)); }
    setBusy(false);
  }
  async function changePw(e) {
    e.preventDefault();
    setErr(""); setOk("");
    if (pw.next.length < 10) { setErr("Please use a new password with at least 10 characters."); return; }
    setBusy(true);
    try {
      await pb.collection("members").update(user.id, { oldPassword: pw.old, password: pw.next, passwordConfirm: pw.next });
      await pb.collection("members").authWithPassword(user.email, pw.next);
      setPw({ old: "", next: "" });
      setOk("Your password has been changed.");
    } catch (ex) { setErr("We couldn’t change it. Please check your current password."); }
    setBusy(false);
  }

  return (
    <div className="space-y-8">
      <header>
        <Eyebrow className="text-moss">Account</Eyebrow>
        <h1 className="mt-3 text-4xl sm:text-5xl">Your records belong to you.</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">Take a copy, change your password, or delete everything. We don’t sell your private rental information.</p>
      </header>
      {err && <Notice kind="error">{err}</Notice>}
      {ok && <Notice>{ok}</Notice>}

      <Panel title="Download your records" lead="A complete copy of what you’ve entered, in a file you can keep. Documents download one by one from the Evidence page.">
        <Btn type="button" onClick={download}><Download className="h-4 w-4" aria-hidden="true" />Download my records</Btn>
      </Panel>

      <Panel title="Recovery and second-step sign-in" lead="Choose how you’d like to get a code to reset your password or confirm it’s you. Your sign-in email is already saved.">
        <div className="mb-5"><FeaturePill status="planned" /></div>
        <p className="mb-5 max-w-2xl text-sm text-ink-soft">These choices are saved to your account only. Reset codes and second-step sign-in are not switched on yet, so nothing will be sent for now. Your phone number is never shared with anyone you share a Passport with.</p>
        <form onSubmit={saveRecovery} className="grid max-w-md gap-5">
          <Field label="Phone number (optional)" htmlFor="rec-phone" hint="Only needed if you want codes by text message.">
            <input id="rec-phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} value={rec.phone} onChange={(e) => setRec((s) => ({ ...s, phone: e.target.value }))} className={inputCls} />
          </Field>
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink">Send my codes by</legend>
            <div className="grid gap-2">
              {[["", "I’ll decide later"], ["email", "Email: " + (user?.email || "")], ["text", "Text message to my phone"]].map(([v, l]) => (
                <label key={v || "none"} className="flex min-h-11 items-center gap-3 text-ink">
                  <input type="radio" name="rec-step" value={v} checked={rec.step === v} onChange={() => setRec((s) => ({ ...s, step: v }))} className="h-5 w-5 accent-forest" />
                  <span>{l}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {recMsg && <Notice>{recMsg}</Notice>}
          <div><Btn type="submit" disabled={busy}>Save my choices</Btn></div>
        </form>
      </Panel>

      <Panel title="Change your password">
        <form onSubmit={changePw} className="grid max-w-md gap-5">
          <Field label="Current password" htmlFor="pw-old"><input id="pw-old" type="password" required autoComplete="current-password" value={pw.old} onChange={(e) => setPw((s) => ({ ...s, old: e.target.value }))} className={inputCls} /></Field>
          <Field label="New password" htmlFor="pw-new" hint="At least 10 characters."><input id="pw-new" type="password" required minLength={10} autoComplete="new-password" value={pw.next} onChange={(e) => setPw((s) => ({ ...s, next: e.target.value }))} className={inputCls} /></Field>
          <div><Btn type="submit" disabled={busy}>Change password</Btn></div>
        </form>
      </Panel>

      <Panel title="Delete your records" lead="Removes every tenancy, record, note, confirmation request and share link, and withdraws access at once. Your account stays.">
        <div className="grid max-w-md gap-4">
          <Field label="Type DELETE to confirm" htmlFor="del1"><input id="del1" value={typed} onChange={(e) => setTyped(e.target.value)} className={inputCls} autoComplete="off" /></Field>
          <div><Btn type="button" variant="danger" disabled={busy || typed !== "DELETE"} onClick={deleteRecords}>Delete all my records</Btn></div>
        </div>
      </Panel>

      <Panel title="Delete your account" lead="Removes your account and everything in it, permanently. Any share links stop working immediately.">
        <div className="grid max-w-md gap-4">
          <Field label="Type DELETE to confirm" htmlFor="del2"><input id="del2" value={typed2} onChange={(e) => setTyped2(e.target.value)} className={inputCls} autoComplete="off" /></Field>
          <div><Btn type="button" variant="danger" disabled={busy || typed2 !== "DELETE"} onClick={deleteAccount}>Delete my account</Btn></div>
        </div>
      </Panel>

      <Panel title="Sign out">
        <Btn type="button" variant="ghost" onClick={() => { signOut(); nav("/"); }}>Sign out</Btn>
      </Panel>
    </div>
  );
}
