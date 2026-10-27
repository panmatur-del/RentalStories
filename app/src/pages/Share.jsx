import { useState } from "react";
import { Link } from "react-router";
import Lock from "icon:lock";
import Clock from "icon:clock";
import Ban from "icon:ban";
import Eye from "icon:eye";
import Copy from "icon:copy";
import {
  Container,
  PageHero,
  Btn,
  Field,
  inputCls,
  fmtDate,
  SectionTitle,
  PrivacyLadder,
  FeaturePill,
  SiteDisclaimer,
  BuildYourOwn,
} from "../components/ui.jsx";
import { DURATIONS, PACKAGES } from "../data/passport.js";
import { usePassport, timeLeft } from "../lib/PassportContext.jsx";

const fmtDT = (t) =>
  fmtDate(t, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export function ShareCard({ s, compact = false }) {
  const { revokeShare, now, isActive, scopes, docs } = usePassport();
  const active = isActive(s);
  const state = s.revoked ? "Revoked" : active ? "Active" : "Expired";
  const stateCls = s.revoked
    ? "bg-rose-tint text-clay"
    : active
      ? "bg-moss-tint text-moss"
      : "bg-sand text-ink";
  const names = s.scopes.map((id) => scopes.find((x) => x.id === id)?.label).filter(Boolean);
  const docNames = s.docs.map((id) => docs.find((d) => d.id === id)?.name).filter(Boolean);

  return (
    <li className="rounded-3xl border border-line bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-2xl sm:text-3xl">{s.recipient}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {s.revoked
              ? "Stopped early by you"
              : active
                ? `Expires ${fmtDT(s.expires)} · ${timeLeft(s.expires, now)}`
                : `Expired ${fmtDT(s.expires)}`}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${stateCls}`}>
          {state}
        </span>
      </div>

      <p className="mt-4 text-sm font-semibold">Shared items</p>
      <ul className="mt-1 flex flex-wrap gap-2">
        {names.map((n) => (
          <li key={n} className="rounded-full bg-sun-tint px-3 py-1 text-sm font-semibold">
            {n}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-ink-soft">
        {s.pkg ? `Package: ${PACKAGES.find((p) => p.id === s.pkg)?.label}. ` : ""}
        {s.allowDownload ? "Downloading a copy is allowed." : "Downloading is not allowed."}
      </p>
      {docNames.length > 0 && (
        <p className="mt-2 text-sm text-ink-soft">Files: {docNames.join(", ")}</p>
      )}

      {!compact && active && (
        <p className="mt-4 break-all rounded-xl bg-sand px-3 py-2 font-mono text-sm">
          rentalstories.org/s/{s.code}
        </p>
      )}

      <details className="mt-4">
        <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold">
          <Eye className="h-4 w-4" aria-hidden="true" /> Access history ({s.log.length})
        </summary>
        <ol className="mt-2 space-y-2 border-l-2 border-line pl-4">
          {[...s.log].reverse().map((l, i) => (
            <li key={i} className="text-sm">
              <span className="font-mono text-xs font-semibold text-ink-soft">{fmtDT(l.at)}</span>
              <br />
              {l.what}
            </li>
          ))}
        </ol>
      </details>

      {active && (
        <div className="mt-4">
          <Btn variant="danger" onClick={() => revokeShare(s.id)}>
            <Ban className="h-4 w-4" aria-hidden="true" /> Revoke access now
          </Btn>
        </div>
      )}
    </li>
  );
}

export default function Share() {
  const { createShare, shares, scopes, docs, isActive } = usePassport();
  const [recipient, setRecipient] = useState("");
  const [picked, setPicked] = useState([]);
  const [docPicked, setDocPicked] = useState([]);
  const [dur, setDur] = useState("7d");
  const [customDays, setCustomDays] = useState(30);
  const [err, setErr] = useState("");
  const [pkg, setPkg] = useState(null);
  const [allowDownload, setAllowDownload] = useState(false);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  function applyPkg(p) {
    setPkg(p.id);
    setPicked(p.scopes);
    setErr("");
  }

  const toggle = (arr, set, id) => {
    setPkg(null);
    set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  };

  function submit(e) {
    e.preventDefault();
    if (picked.length === 0) {
      setErr("Choose at least one thing to share. Nothing is shared by default.");
      return;
    }
    let hours = DURATIONS.find((d) => d.id === dur).hours;
    if (dur === "custom") {
      const n = Number(customDays);
      if (!Number.isFinite(n) || n < 1 || n > 90) {
        setErr("For a custom period, enter between 1 and 90 days.");
        return;
      }
      hours = Math.round(n) * 24;
    }
    setErr("");
    const s = createShare({
      recipient,
      scopes: picked,
      docIds: picked.includes("documents") ? docPicked : [],
      hours,
      allowDownload,
      pkg,
    });
    setCreated(s);
    setCopied(false);
    setPicked([]);
    setDocPicked([]);
    setRecipient("");
    setPkg(null);
    setAllowDownload(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(`https://rentalstories.org/s/${created.code}`);
    } catch {
      /* clipboard may be unavailable; the link is visible on screen anyway */
    }
    setCopied(true);
  }

  const active = shares.filter(isActive);
  const past = shares.filter((s) => !isActive(s));

  return (
    <>
      <PageHero
        eyebrow="Secure Share · Demo"
        title="Choose the evidence. Choose the recipient. Choose the duration."
        lead="Your Passport is private by default. Sharing is a deliberate act, and every link expires. You can see who looked, download your records and stop sharing at any time."
      />

      <Container className="pb-8">
        <BuildYourOwn />
      </Container>
      <Container className="grid gap-10 pb-16 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={submit} noValidate className="rounded-3xl border border-line bg-card p-6 sm:p-8">
          <p className="flex items-center gap-2 font-mono text-sm font-semibold tracking-[0.16em] text-moss">
            <Lock className="h-4 w-4" aria-hidden="true" /> PRIVATE → SHARED
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-4xl">Create a secure share</h2>
            <FeaturePill status="demo" />
          </div>

          <fieldset className="mt-6">
            <legend className="text-sm font-semibold">Start from a package, or build your own</legend>
            <p className="text-sm text-ink-soft">A package only ticks the boxes below. You can change anything.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {PACKAGES.map((p) => (
                <label
                  key={p.id}
                  className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl border-2 p-3 ${pkg === p.id ? "border-forest bg-moss-tint" : "border-line bg-white"}`}
                >
                  <input type="radio" name="pkg" className="mt-1 h-5 w-5 shrink-0 accent-ink" checked={pkg === p.id} onChange={() => applyPkg(p)} />
                  <span>
                    <span className="block font-semibold">{p.label}</span>
                    <span className="block text-sm text-ink-soft">{p.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-7">
            <legend className="text-sm font-semibold">1. Choose the evidence</legend>
            <p className="text-sm text-ink-soft">Nothing is ticked to begin with.</p>
            <div className="mt-3 grid gap-3">
              {scopes.map((s) => (
                <div key={s.id}>
                  <label
                    className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl border-2 p-3 ${
                      picked.includes(s.id) ? "border-forest bg-moss-tint" : "border-line bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5 shrink-0 accent-ink"
                      checked={picked.includes(s.id)}
                      onChange={() => toggle(picked, setPicked, s.id)}
                    />
                    <span>
                      <span className="block font-semibold">{s.label}</span>
                      <span className="block text-sm text-ink-soft">{s.desc}</span>
                    </span>
                  </label>
                  {s.id === "documents" && picked.includes("documents") && (
                    <div className="ml-4 mt-2 border-l border-sage pl-4">
                      <p className="text-sm font-semibold">Choose which files</p>
                      {docs.length === 0 ? (
                        <p className="text-sm text-ink-soft">You have no stored documents.</p>
                      ) : (
                        docs.map((d) => (
                          <label key={d.id} className="flex min-h-11 items-center gap-3 text-sm">
                            <input
                              type="checkbox"
                              className="h-5 w-5 accent-ink"
                              checked={docPicked.includes(d.id)}
                              onChange={() => toggle(docPicked, setDocPicked, d.id)}
                            />
                            <span className="break-words">{d.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </fieldset>

          <div className="mt-7">
            <Field label="2. Choose the recipient" htmlFor="recipient" hint="A name for your own reference, like “Birch Court, unit 4 application”. Only people with the link can open it.">
              <input id="recipient" className={inputCls} value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            </Field>
          </div>

          <fieldset className="mt-7">
            <legend className="text-sm font-semibold">3. Choose the duration</legend>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {DURATIONS.map((d) => (
                <label
                  key={d.id}
                  className={`flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border-2 px-3 text-center font-semibold ${
                    dur === d.id ? "border-forest bg-forest text-paper" : "border-line bg-white"
                  }`}
                >
                  <input type="radio" name="dur" className="sr-only" checked={dur === d.id} onChange={() => setDur(d.id)} />
                  {d.label}
                </label>
              ))}
            </div>
            {dur === "custom" && (
              <div className="mt-4 max-w-xs">
                <Field label="Number of days" htmlFor="customDays" hint="Between 1 and 90.">
                  <input id="customDays" type="number" min="1" max="90" className={inputCls} value={customDays} onChange={(e) => setCustomDays(e.target.value)} />
                </Field>
              </div>
            )}
            <p className="mt-3 text-sm text-ink-soft">Access ends automatically when the time is up.</p>
          </fieldset>

          <label className="mt-7 flex min-h-12 cursor-pointer items-start gap-3 rounded-2xl border-2 border-line bg-white p-3">
            <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-ink" checked={allowDownload} onChange={(e) => setAllowDownload(e.target.checked)} />
            <span>
              <span className="block font-semibold">Let them download a copy</span>
              <span className="block text-sm text-ink-soft">Off unless you turn it on. Downloads are listed in the access history.</span>
            </span>
          </label>

          {err && (
            <p role="alert" className="mt-5 font-semibold text-clay">
              {err}
            </p>
          )}
          <div className="mt-7">
            <Btn type="submit" className="w-full sm:w-auto">
              Create expiring link
            </Btn>
          </div>

          {created && (
            <div role="status" className="mt-6 rounded-2xl bg-moss-tint p-5">
              <p className="text-lg font-semibold text-moss">Secure share created for {created.recipient}.</p>
              <p className="mt-1 text-sm text-ink">
                This sample link only works for the people you send it to, until {fmtDT(created.expires)}.
              </p>
              <p className="mt-3 break-all rounded-xl bg-white px-3 py-2 font-mono text-sm">rentalstories.org/s/{created.code}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Btn type="button" variant="ghost" onClick={copy}>
                  <Copy className="h-4 w-4" aria-hidden="true" /> {copied ? "Copied" : "Copy link"}
                </Btn>
                <span className="text-sm text-ink">It appears below under Active shares, where you can revoke it.</span>
              </div>
            </div>
          )}
        </form>

        <aside className="self-start rounded-3xl bg-forest p-6 text-paper on-dark sm:p-8">
          <h2 className="text-3xl text-paper">What a recipient will never get</h2>
          <ul className="mt-5 space-y-3 text-paper">
            {[
              "A renter score or rating. None exists",
              "Anything you didn’t tick",
              "A permanent link. Every share expires",
              "A way to forward your Passport. Links are tied to the share",
              "A public profile. There is no public renter search and no secret profile",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <Ban className="mt-1 h-4 w-4 shrink-0 text-sage-soft" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-paper/30 pt-5 text-paper">
            Every time someone opens a share, it’s written to the access history so you can see who looked at what, and
            when. You can revoke a link at any time and it stops working straight away.
          </p>
          <p className="mt-4 font-semibold text-paper">Your rental history belongs to you. We do not sell your private rental information.</p>
        </aside>
      </Container>

      <section className="border-t border-line bg-sand/50 py-14">
        <Container>
          <SectionTitle eyebrow="Active shares" title={active.length ? "Who can see what, right now." : "No active shares."} />
          {active.length === 0 && (
            <p className="mt-4 text-lg text-ink-soft">Your Passport is completely private at the moment.</p>
          )}
          <ul className="mt-8 grid gap-5 lg:grid-cols-2">
            {active.map((s) => (
              <ShareCard key={s.id} s={s} />
            ))}
          </ul>
          {past.length > 0 && (
            <>
              <h2 className="mt-14 text-3xl">Past shares</h2>
              <p className="text-ink-soft">Ended shares keep their access history so you always have a record.</p>
              <ul className="mt-6 grid gap-5 lg:grid-cols-2">
                {past.map((s) => (
                  <ShareCard key={s.id} s={s} compact />
                ))}
              </ul>
            </>
          )}
        </Container>
      </section>

      <Container className="py-16">
        <SectionTitle eyebrow="The rule" title="Nothing moves up without you." />
        <PrivacyLadder className="mt-8" />
        <SiteDisclaimer className="mt-8" />
        <p className="mt-6">
          Want the full picture? Visit the{" "}
          <Link to="/privacy" className="font-semibold underline underline-offset-4">
            Privacy Center
          </Link>
          .
        </p>
      </Container>
    </>
  );
}
