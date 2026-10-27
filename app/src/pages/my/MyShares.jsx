import { useMemo, useState } from "react";
import Link2 from "icon:link-2";
import { Eyebrow, Btn, Field, inputCls } from "../../components/ui.jsx";
import { pb } from "../../lib/pb.js";
import { useMy, rid } from "../../lib/my.jsx";
import { friendlyError } from "../../lib/auth.jsx";
import {
  SHARE_PACKAGES, DURATIONS, buildSnapshot, catLabel, publicLink, shareState, timeLeft, fmtWhen, fmtDay, isDisputed,
} from "../../lib/share.js";
import { Panel, Notice, Empty, CopyLink, ConfirmButton } from "./bits.jsx";

const EVENT_TEXT = {
  opened: "Link opened",
  file_viewed: "Document opened",
  info_requested: "Asked for more information",
};

function ShareCard({ s, logs, requests, reload }) {
  const [err, setErr] = useState("");
  const state = shareState(s);
  const mine = logs.filter((l) => l.share === s.id).sort((a, b) => (a.created < b.created ? 1 : -1));
  const reqs = requests.filter((r) => r.share === s.id);
  const pill = {
    active: "border-moss/40 bg-moss-tint text-moss",
    expired: "border-line bg-sand text-ink",
    revoked: "border-clay/40 bg-rose-tint text-clay",
  }[state];

  async function revoke() {
    setErr("");
    try {
      await pb.collection("shares").update(s.id, { revoked: true });
      await reload();
    } catch (e) { setErr(friendlyError(e)); }
  }
  async function remove() {
    try { await pb.collection("shares").delete(s.id); await reload(); } catch (e) { setErr(friendlyError(e)); }
  }
  async function handled(r) {
    try { await pb.collection("info_requests").update(r.id, { handled: !r.handled }); await reload(); } catch (e) { setErr(friendlyError(e)); }
  }

  return (
    <li className="rounded-2xl border border-line bg-paper p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-sans text-xl font-semibold">{s.title || "Untitled share"}</h3>
          <p className="text-sm text-ink-soft">
            {SHARE_PACKAGES.find((p) => p.id === s.package)?.label || "Custom"} · Made {fmtDay(s.created)} · Expires {fmtWhen(s.expires_at)}
          </p>
        </div>
        <span className={`inline-flex rounded-full border px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.12em] ${pill}`}>
          {state === "active" ? `Active · ${timeLeft(s)}` : state === "expired" ? "Expired" : "Revoked"}
        </span>
      </div>
      {state === "active" && <div className="mt-4"><CopyLink url={publicLink(`shared/${s.id}`)} /></div>}
      {state !== "active" && <p className="mt-3 text-sm text-ink-soft">This link no longer opens. Documents copied for it are removed.</p>}

      {reqs.length > 0 && (
        <div className="mt-5">
          <h4 className="font-sans text-base font-semibold">Requests for more information</h4>
          <ul className="mt-2 space-y-2">
            {reqs.map((r) => (
              <li key={r.id} className="rounded-xl border border-line bg-white p-4 text-[0.95rem]">
                <p className="font-semibold text-ink">{r.requester_name || "Someone"}{r.requester_org ? `, ${r.requester_org}` : ""} <span className="font-normal text-ink-soft">· {fmtWhen(r.created)}</span></p>
                <p className="mt-1 whitespace-pre-wrap text-ink">{r.message}</p>
                <button type="button" onClick={() => handled(r)} className="mt-2 min-h-9 text-sm font-semibold text-forest underline underline-offset-4">
                  {r.handled ? "Marked as handled. Undo" : "Mark as handled"}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-ink-soft">They can’t reach you through the site. Reply by whichever route you already have with them.</p>
        </div>
      )}

      <div className="mt-5">
        <h4 className="font-sans text-base font-semibold">Access activity</h4>
        {mine.length === 0 ? (
          <p className="mt-1 text-sm text-ink-soft">Nobody has opened this link yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line rounded-xl border border-line bg-white text-[0.95rem]">
            {mine.map((l) => (
              <li key={l.id} className="flex flex-wrap justify-between gap-x-4 px-4 py-2.5">
                <span className="text-ink">{EVENT_TEXT[l.event] || l.event}{l.detail ? `: ${l.detail}` : ""}</span>
                <span className="text-ink-soft">{fmtWhen(l.created)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {err && <Notice kind="error" className="mt-4">{err}</Notice>}
      <div className="mt-5 flex flex-wrap gap-3">
        {state === "active" && <ConfirmButton label="Revoke access now" confirmLabel="Yes, revoke it" onConfirm={revoke} />}
        <ConfirmButton label="Delete this share" confirmLabel="Yes, delete it" onConfirm={remove} />
      </div>
    </li>
  );
}

export default function MyShares() {
  const { user, tenancies, evidence, notes, confirmations, shares, requests, logs, reload } = useMy();
  const disputedIds = useMemo(() => new Set(confirmations.filter(isDisputed).map((c) => c.tenancy)), [confirmations]);
  const [pkgId, setPkgId] = useState("application");
  const [title, setTitle] = useState("");
  const [dur, setDur] = useState("7");
  const [selTen, setSelTen] = useState(() => new Set(tenancies.map((t) => t.id)));
  const [selEv, setSelEv] = useState(() => new Set(evidence.filter((e) => SHARE_PACKAGES[3].cats.includes(e.category)).map((e) => e.id)));
  const [showRent, setShowRent] = useState(true);
  const [withCtx, setWithCtx] = useState(true);
  const [withFiles, setWithFiles] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [made, setMade] = useState(null);

  function pickPackage(id) {
    const p = SHARE_PACKAGES.find((x) => x.id === id);
    setPkgId(id);
    const tens = p.onlyDisputed && disputedIds.size ? tenancies.filter((t) => disputedIds.has(t.id)) : tenancies;
    setSelTen(new Set(tens.map((t) => t.id)));
    setSelEv(new Set(evidence.filter((e) => p.cats.includes(e.category) && tens.some((t) => t.id === e.tenancy || (!e.tenancy && !p.onlyDisputed))).map((e) => e.id)));
    setShowRent(p.rent);
    setWithCtx(p.context);
    setWithFiles(false);
  }
  const toggle = (set, setter, id) => {
    const n = new Set(set);
    n.has(id) ? n.delete(id) : n.add(id);
    setter(n);
  };

  const chosenEv = evidence.filter((e) => selEv.has(e.id));
  const filesAvailable = chosenEv.filter((e) => e.file).length;

  async function create(e) {
    e.preventDefault();
    if (busy) return;
    setErr(""); setMade(null);
    if (!title.trim()) { setErr("Please say who this is for, so you can recognise it later."); return; }
    if (selTen.size === 0) { setErr("Choose at least one tenancy to share."); return; }
    setBusy(true);
    const id = rid();
    try {
      const hours = DURATIONS.find((d) => d.id === dur).hours;
      const fileIds = new Map();
      if (withFiles) chosenEv.filter((x) => x.file).forEach((x) => fileIds.set(x.id, rid()));
      const snapshot = buildSnapshot({
        renterName: user.name || "A renter",
        packageId: pkgId,
        title: title.trim(),
        tenancies: tenancies.filter((t) => selTen.has(t.id)),
        evidence: chosenEv.filter((x) => !x.tenancy || selTen.has(x.tenancy)).map((x) => ({ ...x, __shareFileId: fileIds.get(x.id) || "" })),
        confirmations,
        notes: withCtx ? notes : [],
        opts: { showRent },
      });
      await pb.collection("shares").create({
        id, owner: user.id, title: title.trim(), package: pkgId,
        expires_at: new Date(Date.now() + hours * 3600000).toISOString(),
        revoked: false, include_context: withCtx, include_files: withFiles, snapshot,
      });
      if (withFiles) {
        const token = await pb.files.getToken();
        for (const ev of chosenEv.filter((x) => x.file && fileIds.has(x.id))) {
          const url = pb.files.getURL(ev, ev.file, { token });
          const blob = await (await fetch(url)).blob();
          const fd = new FormData();
          fd.append("id", fileIds.get(ev.id));
          fd.append("share", id);
          fd.append("label", ev.title);
          fd.append("file", new File([blob], ev.file, { type: blob.type }));
          await pb.collection("share_files").create(fd);
        }
      }
      await reload();
      setMade(id);
      setTitle("");
    } catch (ex) {
      try { await pb.collection("shares").delete(id); } catch { /* nothing to undo */ }
      setErr(friendlyError(ex, "We couldn’t create that link. Nothing was shared. Please try again."));
    }
    setBusy(false);
  }

  return (
    <div className="space-y-8">
      <header>
        <Eyebrow className="text-moss">Secure Share</Eyebrow>
        <h1 className="mt-3 text-4xl sm:text-5xl">Choose the evidence. Choose the recipient. Choose the duration.</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">
          Make a link for one person or company. They see only what you tick, only until it expires, and you can revoke it at any time.
        </p>
      </header>

      <Panel title="Create a share link">
        {tenancies.length === 0 ? (
          <Empty>Add a tenancy first, then come back to choose what to share.</Empty>
        ) : (
          <form onSubmit={create} className="space-y-7">
            <fieldset>
              <legend className="text-sm font-semibold text-ink">Start from a package</legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {SHARE_PACKAGES.map((p) => (
                  <label key={p.id} className={`flex cursor-pointer gap-3 rounded-2xl border-2 p-4 ${pkgId === p.id ? "border-forest bg-moss-tint" : "border-line bg-paper hover:border-forest/60"}`}>
                    <input type="radio" name="pkg" checked={pkgId === p.id} onChange={() => pickPackage(p.id)} className="mt-1 h-5 w-5 accent-forest" />
                    <span><span className="block font-semibold text-ink">{p.label}</span><span className="block text-sm text-ink-soft">{p.desc}</span></span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-sm text-ink-soft">A package only ticks the boxes below for you. You can change anything.</p>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Who is this for?" htmlFor="sh-title" hint="For example, Birch Court leasing office.">
                <input id="sh-title" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
              </Field>
              <Field label="How long should it work?" htmlFor="sh-dur">
                <select id="sh-dur" value={dur} onChange={(e) => setDur(e.target.value)} className={inputCls}>
                  {DURATIONS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                </select>
              </Field>
            </div>

            <fieldset>
              <legend className="text-sm font-semibold text-ink">Tenancies to include</legend>
              <div className="mt-2 space-y-2">
                {tenancies.map((t) => (
                  <label key={t.id} className="flex items-start gap-3 rounded-xl border border-line bg-paper p-3 text-[0.95rem]">
                    <input type="checkbox" checked={selTen.has(t.id)} onChange={() => toggle(selTen, setSelTen, t.id)} className="mt-1 h-5 w-5 accent-forest" />
                    <span>{t.address}{disputedIds.has(t.id) ? " (disputed)" : ""}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-ink">Records to include</legend>
              {evidence.length === 0 ? <p className="mt-2 text-sm text-ink-soft">You haven’t added any records. The share will show your tenancies only.</p> : (
                <div className="mt-2 space-y-2">
                  {evidence.map((r) => (
                    <label key={r.id} className="flex items-start gap-3 rounded-xl border border-line bg-paper p-3 text-[0.95rem]">
                      <input type="checkbox" checked={selEv.has(r.id)} onChange={() => toggle(selEv, setSelEv, r.id)} className="mt-1 h-5 w-5 accent-forest" />
                      <span>{r.title} <span className="text-ink-soft">· {catLabel(r.category)}</span></span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-ink">Extras</legend>
              <label className="flex items-start gap-3 text-[0.95rem] text-ink"><input type="checkbox" checked={showRent} onChange={(e) => setShowRent(e.target.checked)} className="mt-1 h-5 w-5 accent-forest" /><span>Show rent amounts</span></label>
              <label className="flex items-start gap-3 text-[0.95rem] text-ink"><input type="checkbox" checked={withCtx} onChange={(e) => setWithCtx(e.target.checked)} className="mt-1 h-5 w-5 accent-forest" /><span>Include my context notes ({notes.length}), shown apart from the facts</span></label>
              <label className="flex items-start gap-3 text-[0.95rem] text-ink">
                <input type="checkbox" checked={withFiles} disabled={filesAvailable === 0} onChange={(e) => setWithFiles(e.target.checked)} className="mt-1 h-5 w-5 accent-forest" />
                <span>Let them open and download the files of the ticked records ({filesAvailable} with files). Off unless you turn it on.</span>
              </label>
            </fieldset>

            <p className="rounded-2xl bg-sand p-4 text-[0.95rem] text-ink">
              Summary: {selTen.size} tenanc{selTen.size === 1 ? "y" : "ies"}, {chosenEv.length} record{chosenEv.length === 1 ? "" : "s"}, rent {showRent ? "shown" : "hidden"}, context {withCtx ? "included" : "not included"}, files {withFiles ? "can be opened" : "not shared"}.
            </p>
            {err && <Notice kind="error">{err}</Notice>}
            <Btn type="submit" disabled={busy}><Link2 className="h-4 w-4" aria-hidden="true" />{busy ? "Creating…" : "Create share link"}</Btn>
          </form>
        )}
        {made && (
          <div className="mt-6 space-y-3">
            <Notice>Your link is ready. Send it to the person you chose. It works only until it expires, and only for what you ticked.</Notice>
            <CopyLink url={publicLink(`shared/${made}`)} />
          </div>
        )}
      </Panel>

      <Panel title="Your share links" lead="See who opened each one, and revoke access whenever you like.">
        {shares.length === 0 ? <Empty>You haven’t shared anything yet. Everything stays private until you do.</Empty> : (
          <ul className="space-y-5">
            {shares.map((s) => <ShareCard key={s.id} s={s} logs={logs} requests={requests} reload={reload} />)}
          </ul>
        )}
      </Panel>
    </div>
  );
}
