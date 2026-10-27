import { useState } from "react";
import Check from "icon:circle-check";
import Alert from "icon:triangle-alert";
import Copy from "icon:copy";
import { Btn, EvidenceBadge, fmtDate } from "../../components/ui.jsx";
import { EVIDENCE } from "../../components/ui.jsx";
import { fmtDay, money, period, tenancyLevels, isDisputed, fmtWhen } from "../../lib/share.js";

export function Notice({ kind = "info", children, className = "" }) {
  const err = kind === "error";
  const Icon = err ? Alert : Check;
  return (
    <p
      role={err ? "alert" : "status"}
      className={`flex gap-3 rounded-2xl border p-4 text-[0.95rem] leading-relaxed text-ink ${
        err ? "border-clay/40 bg-rose-tint" : "border-moss/30 bg-moss-tint"
      } ${className}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${err ? "text-clay" : "text-moss"}`} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function Panel({ title, lead, children, className = "", action }) {
  return (
    <section className={`rounded-3xl border border-line bg-card p-5 sm:p-7 ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-2xl sm:text-3xl">{title}</h2>}
            {lead && <p className="mt-1.5 max-w-2xl text-ink-soft">{lead}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={title ? "mt-5" : ""}>{children}</div>
    </section>
  );
}

export function CopyLink({ url, label = "Copy link" }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } catch {
      setDone(false);
    }
  }
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        readOnly
        value={url}
        aria-label="Link"
        onFocus={(e) => e.target.select()}
        className="block min-h-11 w-full min-w-0 rounded-xl border-2 border-line bg-white px-3.5 py-2 font-mono text-sm text-ink"
      />
      <Btn type="button" variant="ghost" onClick={copy} className="shrink-0">
        <Copy className="h-4 w-4" aria-hidden="true" />
        {done ? "Copied" : label}
      </Btn>
    </div>
  );
}

export function Empty({ children }) {
  return (
    <p className="rounded-2xl border border-dashed border-ink-soft/50 bg-transparent p-5 text-ink-soft">{children}</p>
  );
}

/** Two-step confirm button for destructive actions. */
export function ConfirmButton({ label, confirmLabel = "Yes, do it", onConfirm, variant = "ghost", disabled }) {
  const [ask, setAsk] = useState(false);
  if (!ask)
    return (
      <Btn type="button" variant={variant} disabled={disabled} onClick={() => setAsk(true)}>
        {label}
      </Btn>
    );
  return (
    <span className="inline-flex flex-wrap items-center gap-2" role="group" aria-label="Please confirm">
      <Btn
        type="button"
        variant="danger"
        onClick={() => {
          setAsk(false);
          onConfirm();
        }}
      >
        {confirmLabel}
      </Btn>
      <Btn type="button" variant="ghost" onClick={() => setAsk(false)}>
        Cancel
      </Btn>
    </span>
  );
}

/** One tenancy, showing facts, evidence levels, and where each one comes from. */
export function TenancyFacts({ t, evidence, conf }) {
  const levels = tenancyLevels(t, evidence, conf);
  const disputed = isDisputed(conf);
  const docs = evidence.filter((e) => e.tenancy === t.id);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {levels.map((l) => (
          <EvidenceBadge key={l} type={l} />
        ))}
      </div>
      <dl className="mt-4 grid gap-x-8 gap-y-2 text-[0.95rem] sm:grid-cols-2">
        <div>
          <dt className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">Period</dt>
          <dd className="text-ink">{period(t)}</dd>
        </div>
        {t.rent ? (
          <div>
            <dt className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">Rent</dt>
            <dd className="text-ink">{money(t.rent)}</dd>
          </div>
        ) : null}
        {t.landlord_name ? (
          <div>
            <dt className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">Housing provider</dt>
            <dd className="text-ink">
              {t.landlord_name}
              {t.landlord_role ? `, ${t.landlord_role}` : ""}
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">Records attached</dt>
          <dd className="text-ink">{docs.length === 0 ? "None yet" : `${docs.length} record${docs.length === 1 ? "" : "s"}`}</dd>
        </div>
      </dl>
      <ConfirmationLine conf={conf} />
      {disputed && <p className="mt-3 text-sm text-ink">Both versions stay visible until this is settled. A dispute is not a verdict.</p>}
    </div>
  );
}

export function ConfirmationLine({ conf }) {
  if (!conf) return <p className="mt-4 text-sm text-ink-soft">Source: entered by the renter. No confirmation requested yet.</p>;
  if (conf.status === "requested")
    return <p className="mt-4 text-sm text-ink-soft">Confirmation requested {fmtDay(conf.created)}. Waiting for the housing provider.</p>;
  if (conf.status === "declined")
    return <p className="mt-4 text-sm text-ink-soft">Housing provider declined to confirm on {fmtDay(conf.responded_at)}. This stays Renter Provided.</p>;
  const who = [conf.responder_name, conf.responder_role].filter(Boolean).join(", ");
  if (conf.status === "confirmed")
    return (
      <p className="mt-4 text-sm text-ink">
        <span className="font-semibold">Source:</span> confirmed by {who || "the housing provider"} on {fmtDay(conf.responded_at)}.
        {conf.response_note ? <span className="text-ink-soft"> “{conf.response_note}”</span> : null}
      </p>
    );
  return (
    <p className="mt-4 text-sm text-ink">
      <span className="font-semibold">Source:</span> {who || "the housing provider"} responded on {fmtDay(conf.responded_at)} with different details.
      {conf.resolution === "accepted_theirs" && " The renter accepted their version."}
      {conf.resolution === "agreed" && " Both sides now agree."}
      {conf.resolution === "kept_mine" && " The renter kept their own version."}
    </p>
  );
}

export function VersionsTable({ t, conf }) {
  if (!conf || conf.status !== "corrected") return null;
  const rows = [
    ["Move-in", fmtDay(conf.claim_start), conf.their_start ? fmtDay(conf.their_start) : "—"],
    ["Move-out", conf.claim_end ? fmtDay(conf.claim_end) : "Present", conf.their_end ? fmtDay(conf.their_end) : "—"],
    ["Rent", conf.claim_rent ? `$${conf.claim_rent}` : "—", conf.their_rent ? `$${conf.their_rent}` : "—"],
  ];
  return (
    <table className="mt-4 w-full border-collapse text-left text-[0.95rem]">
      <caption className="sr-only">The renter’s details compared with the housing provider’s</caption>
      <thead>
        <tr className="border-b border-line">
          <th scope="col" className="py-2 pr-3 font-semibold">Detail</th>
          <th scope="col" className="py-2 pr-3 font-semibold">Renter says</th>
          <th scope="col" className="py-2 font-semibold">Housing provider says</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([k, a, b]) => (
          <tr key={k} className="border-b border-line/70 align-top">
            <th scope="row" className="py-2 pr-3 font-medium">{k}</th>
            <td className="py-2 pr-3">{a}</td>
            <td className="py-2">{b}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export { EVIDENCE, fmtDate, fmtWhen };
