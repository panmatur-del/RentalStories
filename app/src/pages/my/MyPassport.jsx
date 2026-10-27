import { Link } from "react-router";
import Check from "icon:circle-check";
import Circle from "icon:circle";
import Printer from "icon:printer";
import { Eyebrow, Btn, BtnLink, SiteDisclaimer } from "../../components/ui.jsx";
import { useMy } from "../../lib/my.jsx";
import { shareState, fmtDay } from "../../lib/share.js";
import { Panel, TenancyFacts, VersionsTable, Empty } from "./bits.jsx";

export default function MyPassport() {
  const { user, tenancies, evidence, notes, confirmations, shares } = useMy();
  const confBy = new Map(confirmations.map((c) => [c.tenancy, c]));
  const active = shares.filter((s) => shareState(s) === "active").length;
  const steps = [
    ["Add a tenancy", tenancies.length > 0, "/my/tenancies"],
    ["Add leases and other evidence", evidence.length > 0, "/my/vault"],
    ["Ask a housing provider to confirm", confirmations.some((c) => c.status !== "requested") || confirmations.length > 0, "/my/tenancies"],
    ["Add your own context (optional)", notes.length > 0, "/my/context"],
    ["Choose what to share, and with whom", shares.length > 0, "/my/share"],
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <Eyebrow className="text-moss">Rental Passport</Eyebrow>
          <h1 className="mt-3 text-4xl sm:text-5xl">{user.name ? `${user.name}’s Rental Passport` : "Your Rental Passport"}</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-soft">
            Your documented rental history. Not a credit score. Not a renter score. Private until you share it.
          </p>
        </div>
        <Btn type="button" variant="ghost" onClick={() => window.print()} className="print:hidden">
          <Printer className="h-4 w-4" aria-hidden="true" />
          Print or save as PDF
        </Btn>
      </header>

      <Panel title="Where you are" className="print:hidden">
        <ol className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          {steps.map(([label, done, to], i) => (
            <li key={label} className={`rounded-2xl border p-4 ${done ? "border-moss/40 bg-moss-tint" : "border-line bg-paper"}`}>
              <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                {done ? <Check className="h-5 w-5 text-moss" aria-hidden="true" /> : <Circle className="h-5 w-5 text-ink-soft" aria-hidden="true" />}
                Step {i + 1}{done ? " · done" : ""}
              </span>
              <Link to={to} className="mt-2 block font-semibold text-forest underline underline-offset-4">{label}</Link>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-ink-soft">
          {tenancies.length} tenanc{tenancies.length === 1 ? "y" : "ies"} · {evidence.length} record{evidence.length === 1 ? "" : "s"} · {active} active share link{active === 1 ? "" : "s"}
        </p>
      </Panel>

      <Panel title="Tenancy timeline" lead="Each tenancy shows where it came from and how well it is backed up.">
        {tenancies.length === 0 ? (
          <div className="space-y-4">
            <Empty>You haven’t added a tenancy yet. Start with the most recent place you rented.</Empty>
            <BtnLink to="/my/tenancies" arrow>Add your first tenancy</BtnLink>
          </div>
        ) : (
          <ol className="space-y-5">
            {tenancies.map((t) => {
              const c = confBy.get(t.id);
              return (
                <li key={t.id} className="rounded-2xl border border-line bg-paper p-5">
                  <h3 className="font-sans text-xl font-semibold">{t.address}</h3>
                  <p className="text-ink-soft">{[t.city, t.region].filter(Boolean).join(", ")}</p>
                  <div className="mt-3">
                    <TenancyFacts t={t} evidence={evidence} conf={c} />
                    <VersionsTable t={t} conf={c} />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Panel>

      <Panel title="In your own words" lead="Your context sits beside the facts. It is never mixed into them, and it is not verified.">
        {notes.length === 0 ? (
          <Empty>
            Nothing here yet. If a credit issue, a gap in work or something else doesn’t tell the whole story, you can{" "}
            <Link to="/my/context" className="font-semibold text-forest underline underline-offset-4">add context</Link>.
          </Empty>
        ) : (
          <ul className="space-y-4">
            {notes.map((n) => (
              <li key={n.id} className="rounded-2xl border border-line bg-paper p-5">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">{n.topic} · Renter Provided · {fmtDay(n.created)}</p>
                <p className="mt-2 whitespace-pre-wrap text-ink">{n.body}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <SiteDisclaimer />
    </div>
  );
}
