import { useState } from "react";
import { Link } from "react-router";
import Check from "icon:check";
import X from "icon:x";
import Eye from "icon:eye";
import {
  Container,
  Eyebrow,
  Btn,
  EvidenceBadge,
  StatusBadge,
  FeaturePill,
  SiteDisclaimer,
  SectionTitle,
  JumpButton,
  ContactLink,
  fmtDate,
  Field,
  inputCls,
  BuildYourOwn,
} from "../components/ui.jsx";
import EarlyAccess from "../components/EarlyAccess.jsx";
import { TENANCIES, PAYMENTS, REFERENCES } from "../data/passport.js";

function LandlordView() {
  const [confirmed, setConfirmed] = useState({});
  const [asked, setAsked] = useState("");
  const [askText, setAskText] = useState("");
  const [askOpen, setAskOpen] = useState(false);

  return (
    <div className="rounded-3xl border border-line bg-card p-5 shadow-[0_30px_70px_-44px_rgba(23,58,43,0.45)] sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">What a housing provider sees · sample</p>
          <p className="mt-1 font-display text-3xl text-forest">Shared by Alex Rivera</p>
          <p className="text-sm text-ink-soft">Package: Rental Application · expires {fmtDate("2026-10-29")} · downloads off</p>
        </div>
        <FeaturePill status="demo" />
      </div>

      <h3 className="mt-6 text-2xl">Tenancy timeline</h3>
      <ul className="mt-3 grid gap-3">
        {TENANCIES.map((t) => (
          <li key={t.id} className="rounded-2xl border border-line bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{t.address}</p>
                <p className="text-sm text-ink-soft">{t.from} to {t.to}</p>
              </div>
              <StatusBadge status={t.status} />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {t.evidence.map((e) => <EvidenceBadge key={e} type={e} />)}
            </div>
            <p className="mt-2 text-sm text-ink-soft">
              Source: {t.source} · checked {fmtDate(t.verifiedOn)}
            </p>
            {t.versions && (
              <p className="mt-2 rounded-xl bg-rose-tint p-3 text-sm">
                Two versions of the move-out date are on record: {t.versions.map((v) => `${v.who}: ${v.says}`).join("; ")}.
                You can take part in settling it.
              </p>
            )}
            {t.id === "t1" && (
              <div className="mt-3">
                {confirmed[t.id] ? (
                  <p role="status" className="text-sm font-semibold text-moss">Thank you. Confirmation recorded in this demo, with your name, role and today’s date.</p>
                ) : (
                  <Btn type="button" variant="ghost" onClick={() => setConfirmed({ ...confirmed, [t.id]: true })}>
                    <Check className="h-4 w-4" aria-hidden="true" /> Confirm this tenancy
                  </Btn>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      <h3 className="mt-8 text-2xl">Payment evidence</h3>
      <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
        {PAYMENTS.slice(0, 3).map((p) => (
          <li key={p.month} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <span className="font-semibold">{p.month} · {p.amount}</span>
            <EvidenceBadge type={p.evidence} />
          </li>
        ))}
      </ul>

      <h3 className="mt-8 text-2xl">Confirmations from other housing providers</h3>
      <p className="mt-2 text-ink-soft">
        {REFERENCES[0].name}, {REFERENCES[0].role}. {fmtDate(REFERENCES[0].date)}.
      </p>

      <h3 className="mt-8 text-2xl">The renter’s own context</h3>
      <p className="mt-2 text-ink-soft">
        Shown in a separate section and labelled as the renter’s words. It does not change any evidence level.
      </p>

      <div className="mt-8 rounded-2xl bg-sand p-4">
        {asked ? (
          <p role="status" className="font-semibold">Request noted in this demo: “{asked}”. In the real product the renter is asked, and chooses whether to answer.</p>
        ) : askOpen ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (askText.trim()) setAsked(askText.trim().slice(0, 200));
            }}
            className="grid gap-3"
          >
            <Field label="What would you like to ask the renter?" htmlFor="ask" hint="Ask about a record. You can’t ask for anything that was not shared.">
              <input id="ask" className={inputCls} maxLength={200} value={askText} onChange={(e) => setAskText(e.target.value)} />
            </Field>
            <div className="flex flex-wrap gap-3">
              <Btn type="submit">Send request</Btn>
              <Btn type="button" variant="ghost" onClick={() => setAskOpen(false)}>Cancel</Btn>
            </div>
          </form>
        ) : (
          <Btn type="button" variant="ghost" onClick={() => setAskOpen(true)}>
            <Eye className="h-4 w-4" aria-hidden="true" /> Request more information
          </Btn>
        )}
      </div>
    </div>
  );
}

export default function Landlords() {
  return (
    <>
      <section>
        <Container className="py-14 sm:py-20">
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow className="text-moss">For landlords and housing providers</Eyebrow>
            <FeaturePill status="available" />
          </div>
          <h1 className="rise mt-4 max-w-4xl text-[2.75rem] sm:text-6xl lg:text-[3.6rem]">
            Clear evidence from the renter. <em className="text-moss">Your decision stays yours.</em>
          </h1>
          <p className="rise mt-6 max-w-2xl text-lg text-ink-soft sm:text-xl" style={{ animationDelay: "0.1s" }}>
            When a renter chooses to share, you see a tenancy timeline, where each fact comes from, any confirmations and the
            documents they have authorised. You can confirm what you know, ask a question and take part if something is
            disputed.
          </p>
          <div className="rise mt-8" style={{ animationDelay: "0.2s" }}>
            <JumpButton to="early-access">Be among the first housing providers</JumpButton>
          </div>
        </Container>
      </section>

      <Container className="pb-4">
        <BuildYourOwn />
      </Container>
      <Container className="pb-16 pt-6">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <LandlordView />
          <div className="space-y-6 self-start">
            <article className="on-dark rounded-3xl bg-forest p-7 text-paper">
              <h2 className="text-3xl text-paper">What you can do</h2>
              <ul className="mt-4 space-y-3 text-paper">
                {[
                  "Review what the renter chose to share",
                  "Confirm a tenancy you held, in your own name",
                  "Ask the renter for more information about a record",
                  "Take part in a correction or dispute",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <Check className="mt-1.5 h-4 w-4 shrink-0 text-sage-soft" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </article>
            <article className="rounded-3xl border border-line bg-card p-7">
              <h2 className="text-3xl">What will never exist</h2>
              <ul className="mt-4 space-y-3">
                {[
                  "Hidden renter profiles or secret searches",
                  "Blacklists, scores or ratings of renters",
                  "Automated approvals or declines",
                  "Access to anything the renter did not share",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <X className="mt-1.5 h-4 w-4 shrink-0 text-clay" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </Container>

      <section className="border-y border-line bg-sand/70 py-16 sm:py-20">
        <Container>
          <SectionTitle eyebrow="Why you can trust what you see" title="Every fact shows its source." />
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              ["Evidence levels, not scores", "Each item says whether it is Renter Provided, Document Supported, Payment Supported, Landlord Confirmed or Independently Verified."],
              ["Sources and dates", "You see who confirmed a fact and when, so you can judge how much weight to give it."],
              ["Disagreements stay visible", "If a renter and a former landlord disagree, both versions appear. Nothing is quietly resolved."],
            ].map(([t, d]) => (
              <li key={t} className="rounded-3xl border border-line bg-card p-6">
                <h3 className="text-2xl">{t}</h3>
                <p className="mt-2 text-ink-soft">{d}</p>
              </li>
            ))}
          </ul>
          <SiteDisclaimer className="mt-8" />
          <p className="mt-5 text-ink-soft">
            Learn more about{" "}
            <Link to="/evidence-levels" className="font-semibold text-forest underline underline-offset-4">evidence levels</Link>{" "}
            and{" "}
            <Link to="/corrections" className="font-semibold text-forest underline underline-offset-4">corrections and disputes</Link>.
            Housing decisions must follow the laws that apply where you operate.
          </p>
        </Container>
      </section>

      <section id="early-access" className="py-16">
        <Container className="grid gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow className="text-moss">Early access</Eyebrow>
            <h2 className="mt-3 text-4xl sm:text-5xl">Be among the first housing providers.</h2>
            <p className="mt-4 text-lg text-ink-soft">
              Confirmation works today: a renter sends you a private link, and you confirm the facts or tell them what differs. You don’t need an account. Want to hear about what comes next for housing providers? Leave your details. Questions? Use our <ContactLink />.
            </p>
          </div>
          <div className="rounded-3xl border border-line bg-card p-6 sm:p-8"><EarlyAccess defaultRole="landlord" /></div>
        </Container>
      </section>
    </>
  );
}
