import { Link } from "react-router";
import { useEffect, useState } from "react";
import { pb } from "../lib/pb.js";
import {
  Container,
  Eyebrow,
  Btn,
  Field,
  inputCls,
  fmtDate,
  SectionTitle,
  PrivacyLadder,
  JumpButton,
} from "../components/ui.jsx";
import Check from "icon:check";
import Ban from "icon:ban";

export const CATEGORIES = [
  "Finding a Home",
  "Applications",
  "Lease Lessons",
  "Financial Recovery",
  "Newcomers",
  "Families",
  "Maintenance",
  "Moving",
  "Positive Experiences",
  "Disputes & Resolutions",
];

const EXAMPLES = [
  {
    cat: "Lease Lessons",
    title: "I asked one question about the renewal clause",
    body: "I almost missed the 60-day notice window. A friend told me to check for automatic renewal. Now I put the date in my calendar the day I sign.",
  },
  {
    cat: "Newcomers",
    title: "No local credit history, plenty of rental history",
    body: "I moved here from abroad with years of on-time rent and no local credit file. What helped was a landlord who was willing to look at my payment records.",
  },
  {
    cat: "Disputes & Resolutions",
    title: "Getting the deposit conversation back on track",
    body: "I photographed everything at move-out and asked for an itemized list in writing. We found we had mixed up two dates and sorted it out in one call.",
  },
];

function StoryCard({ s, example = false }) {
  return (
    <article className="flex flex-col rounded-3xl border border-line bg-card p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-sun px-3 py-1 text-xs font-bold uppercase tracking-wider">{s.cat}</span>
        {example && (
          <span className="rounded-full border border-line bg-sand px-3 py-1 text-xs font-semibold">Example story</span>
        )}
      </div>
      <h3 className="mt-4 text-3xl">{s.title}</h3>
      <p className="mt-3 flex-1 whitespace-pre-line text-ink-soft">{s.body}</p>
      {!example && (
        <p className="mt-4 text-sm font-semibold">
          {s.anon ? "Anonymous" : s.name || "Anonymous"}
          <span className="font-normal text-ink-soft"> · {fmtDate(s.created)}</span>
        </p>
      )}
    </article>
  );
}

function StoryForm() {
  const [form, setForm] = useState({ title: "", body: "", category: "", anonymous: true, display_name: "" });
  const [errs, setErrs] = useState({});
  const [state, setState] = useState("idle");
  const [trap, setTrap] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (state === "saving") return;
    if (trap) {
      setState("done");
      return;
    }
    const er = {};
    if (!form.category) er.category = "Please choose a topic.";
    if (form.title.trim().length < 4) er.title = "Give your story a short title.";
    if (form.body.trim().length < 30) er.body = "Please write a little more — at least a couple of sentences.";
    if (!form.anonymous && !form.display_name.trim()) er.display_name = "Add the name you’d like shown, or keep it anonymous.";
    setErrs(er);
    if (Object.keys(er).length) return;
    setState("saving");
    try {
      await pb.collection("stories").create({
        title: form.title.trim(),
        body: form.body.trim(),
        category: form.category,
        anonymous: form.anonymous,
        display_name: form.anonymous ? "" : form.display_name.trim(),
        status: "pending",
      });
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div role="status" className="rounded-3xl bg-moss-tint p-6">
        <p className="text-2xl font-semibold text-moss">Thank you — your story is saved and waiting for review.</p>
        <p className="mt-2">
          A person reads every story before it appears. Nothing is public until it’s approved, and you’ll only ever be
          named if you chose to be.
        </p>
        <Btn className="mt-4" variant="ghost" onClick={() => { setState("idle"); setForm({ title: "", body: "", category: "", anonymous: true, display_name: "" }); }}>
          Write another
        </Btn>
      </div>
    );
  }

  const errP = (id, m) => m && (
    <p id={id} role="alert" className="mt-1 text-sm font-semibold text-clay">{m}</p>
  );

  return (
    <form onSubmit={submit} noValidate className="relative grid gap-5">
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="st-site">Leave this empty</label>
        <input id="st-site" name="website" type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
      </div>
      <Field label="Topic" htmlFor="st-cat">
        <select id="st-cat" className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)} aria-describedby={errs.category ? "e-cat" : undefined}>
          <option value="">Choose a topic…</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        {errP("e-cat", errs.category)}
      </Field>
      <Field label="Title" htmlFor="st-title">
        <input id="st-title" maxLength={140} className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} aria-describedby={errs.title ? "e-title" : undefined} />
        {errP("e-title", errs.title)}
      </Field>
      <Field label="Your story" htmlFor="st-body" hint="What happened, what you learned, what helped. Describe events — please don’t name private individuals or share personal details.">
        <textarea id="st-body" rows={7} maxLength={6000} className={inputCls} value={form.body} onChange={(e) => set("body", e.target.value)} aria-describedby={errs.body ? "e-body" : undefined} />
        {errP("e-body", errs.body)}
      </Field>
      <fieldset>
        <legend className="text-sm font-semibold">How should your story appear?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {[
            [true, "Anonymous", "No name shown"],
            [false, "With my name", "You choose the name shown"],
          ].map(([v, l, d]) => (
            <label key={l} className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl border-2 p-3 ${form.anonymous === v ? "border-forest bg-moss-tint" : "border-line bg-white"}`}>
              <input type="radio" name="anon" className="mt-1 h-5 w-5 accent-ink" checked={form.anonymous === v} onChange={() => set("anonymous", v)} />
              <span><span className="block font-semibold">{l}</span><span className="block text-sm text-ink-soft">{d}</span></span>
            </label>
          ))}
        </div>
      </fieldset>
      {!form.anonymous && (
        <Field label="Name to show" htmlFor="st-name">
          <input id="st-name" maxLength={80} className={inputCls} value={form.display_name} onChange={(e) => set("display_name", e.target.value)} aria-describedby={errs.display_name ? "e-name" : undefined} />
          {errP("e-name", errs.display_name)}
        </Field>
      )}
      {state === "error" && <p role="alert" className="font-semibold text-clay">That didn’t go through. Please try again in a moment.</p>}
      <div>
        <Btn type="submit" disabled={state === "saving"}>{state === "saving" ? "Saving…" : "Submit for review"}</Btn>
      </div>
    </form>
  );
}

export default function Stories() {
  const [cat, setCat] = useState("All");
  const [items, setItems] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setItems(null);
    setFailed(false);
    pb.collection("stories")
      .getList(1, 30, {
        sort: "-created",
        filter: cat === "All" ? "" : pb.filter("category = {:c}", { c: cat }),
        signal: controller.signal,
      })
      .then((r) =>
        setItems(
          r.items.map((x) => ({
            id: x.id,
            cat: x.category,
            title: x.title,
            body: x.body,
            anon: x.anonymous,
            name: x.display_name,
            created: x.created,
          })),
        ),
      )
      .catch((e) => {
        if (e?.isAbort || e?.name === "AbortError") return;
        setFailed(true);
        setItems([]);
      });
    return () => controller.abort();
  }, [cat]);

  const examples = cat === "All" ? EXAMPLES : EXAMPLES.filter((e) => e.cat === cat);

  return (
    <>
      <section>
        <Container className="py-14 sm:py-20">
          <Eyebrow className="text-moss">Rental Stories · optional · moderated</Eyebrow>
          <h1 className="rise mt-4 max-w-4xl text-[3rem] sm:text-6xl lg:text-[4.4rem]">Everyone has a rental story.</h1>
          <p className="rise mt-6 max-w-2xl text-xl text-ink-soft" style={{ animationDelay: "0.1s" }}>
            Optional, moderated, consent-based experiences from renters like you. Stories sit beside your Rental Passport and are never part of it. Share anonymously or with your name, and read what others learned.
          </p>
          <div className="rise mt-8" style={{ animationDelay: "0.2s" }}>
            <JumpButton to="share">Share your story</JumpButton>
          </div>
        </Container>
      </section>

      <Container>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-moss p-6 text-white on-dark">
            <h2 className="text-3xl text-white">What belongs here</h2>
            <ul className="mt-4 space-y-2">
              {["Honest, first-hand experiences", "What you learned and what helped", "Anonymous or named, your choice", "Every story reviewed by a person first", "Identifying details removed or covered before anything is shown"].map((t) => (
                <li key={t} className="flex gap-3"><Check className="mt-1 h-4 w-4 shrink-0 text-sage-soft" aria-hidden="true" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-dashed border-sage p-6">
            <h2 className="text-3xl">What never will</h2>
            <ul className="mt-4 space-y-2">
              {["Landlord star ratings", "“Worst landlord” lists", "Renter blacklists", "Public renter or landlord records", "Leases published automatically", "Accusations naming private individuals"].map((t) => (
                <li key={t} className="flex gap-3"><Ban className="mt-1 h-4 w-4 shrink-0 text-clay" aria-hidden="true" />{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      <Container className="py-14">
        <div role="group" aria-label="Filter stories by topic" className="flex flex-wrap gap-2">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
              className={`min-h-10 rounded-full border border-line px-4 text-sm font-semibold ${cat === c ? "bg-forest text-paper" : "hover:bg-sand"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <h2 className="mt-10 text-4xl">From the community</h2>
        {items === null && <p className="mt-4 text-ink-soft" role="status">Loading stories…</p>}
        {items && items.length === 0 && (
          <p className="mt-4 rounded-3xl border border-dashed border-sage p-8 text-lg">
            {failed
              ? "Stories couldn’t be loaded just now. Please try again in a moment."
              : cat === "All"
                ? "No community stories have been approved yet. Yours could be the first."
                : `No approved stories in “${cat}” yet. Yours could be the first.`}
          </p>
        )}
        {items && items.length > 0 && (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {items.map((s) => <StoryCard key={s.id} s={s} />)}
          </div>
        )}

        {examples.length > 0 && (
          <>
            <h2 className="mt-14 text-4xl">The kind of story we welcome</h2>
            <p className="mt-2 max-w-2xl text-ink-soft">
              These examples were written by the RentalStories team to show the tone — they are not from real
              community members.
            </p>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {examples.map((s) => <StoryCard key={s.title} s={s} example />)}
            </div>
          </>
        )}
      </Container>

      <section id="share" className="border-y border-line bg-sand/60 py-16">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionTitle eyebrow="Share your story" title="Your words, your choice." />
            <p className="mt-4 text-ink-soft">
              Stories start as <strong>private submissions</strong>. A moderator reads each one. Only approved stories are
              shown — and only because you chose to submit them.
            </p>
            <p className="mt-3 text-ink-soft">
              Please don’t include addresses, full names of private individuals, or photos of documents. Claims about a property or company may need evidence before we show them. See our <Link to="/community-standards" className="font-semibold underline underline-offset-4">Community Standards</Link>.
            </p>
          </div>
          <div className="rounded-3xl border border-line bg-card p-6 sm:p-8">
            <StoryForm />
          </div>
        </Container>
      </section>

      <Container className="py-16">
        <SectionTitle eyebrow="Nothing goes public by accident" title="Public only by your explicit action." />
        <PrivacyLadder className="mt-8" />
      </Container>
    </>
  );
}
