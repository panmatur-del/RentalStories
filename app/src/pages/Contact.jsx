import { useState } from "react";
import ShieldCheck from "icon:shield-check";
import Eye from "icon:eye";
import EyeOff from "icon:eye-off";
import { pb } from "../lib/pb.js";
import { Container, Eyebrow, Btn, Field, inputCls } from "../components/ui.jsx";

const TOPICS = [
  { value: "general", label: "A general question" },
  { value: "early_access", label: "Early access" },
  { value: "lease_check", label: "Lease Check" },
  { value: "stories", label: "Rental Stories" },
  { value: "landlords", label: "Landlords and housing providers" },
  { value: "security", label: "A security or privacy concern" },
  { value: "other", label: "Something else" },
];

// Kept in pieces so it isn't sitting in the page as one readable line until someone asks to see it.
const ADDRESS = ["info", "rentalstories.org"].join("@");

function RevealAddress() {
  const [shown, setShown] = useState(false);
  return (
    <div className="rounded-2xl border border-line bg-paper p-4">
      <p className="text-sm text-ink-soft">
        Prefer to write from your own email app? Our address stays hidden until you ask to see it.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-expanded={shown}
          aria-controls="contact-address"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-forest px-4 text-sm font-semibold text-forest hover:bg-moss-tint"
        >
          {shown ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          {shown ? "Hide our email address" : "Show our email address"}
        </button>
        <p id="contact-address" className="font-mono text-base font-semibold text-ink select-all">
          {shown ? ADDRESS : "••••••••••@••••••••••••••••"}
          {!shown && <span className="sr-only">Hidden</span>}
        </p>
      </div>
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", topic: "general", message: "" });
  const [trap, setTrap] = useState("");
  const [state, setState] = useState("idle"); // idle | saving | done | error
  const [errs, setErrs] = useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (state === "saving") return;
    if (trap) {
      setState("done");
      return;
    }
    const next = {};
    if (!form.name.trim()) next.name = "Please tell us your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Please enter a valid email address, like name@example.com.";
    if (form.message.trim().length < 10) next.message = "Please tell us a little more, so we can help.";
    setErrs(next);
    if (Object.keys(next).length) return;
    setState("saving");
    try {
      await pb.collection("contact_messages").create({
        name: form.name.trim(),
        email: form.email.trim(),
        topic: form.topic,
        message: form.message.trim(),
      });
      setState("done");
    } catch (error) {
      setState("error");
    }
  }

  const errP = (id, msg) =>
    msg ? (
      <p id={id} className="mt-1.5 text-sm font-semibold text-clay">
        {msg}
      </p>
    ) : null;

  return (
    <section>
      <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <Eyebrow className="text-moss">Contact us</Eyebrow>
          <h1 className="rise mt-4 text-[3rem] sm:text-6xl lg:text-[4rem]">We’d like to hear from you.</h1>
          <p className="rise mt-5 max-w-xl text-lg text-ink-soft" style={{ animationDelay: "0.1s" }}>
            Questions, ideas, a correction, or a concern about privacy or security — send us a note and a real person will read it.
          </p>
          <p className="mt-8 flex max-w-xl items-start gap-2 text-sm text-ink-soft">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-moss" aria-hidden="true" />
            Please don’t include leases, IDs, bank details or passwords in your message. We’ll never ask for them here.
          </p>
        </div>

        <div className="self-start rounded-3xl border border-line bg-card p-6 shadow-[0_30px_70px_-40px_rgba(23,58,43,0.4)] sm:p-9">
          {state === "done" ? (
            <div role="status" className="rounded-2xl bg-moss-tint p-6">
              <p className="font-display text-3xl text-forest">Thank you{form.name.trim() ? `, ${form.name.trim().split(" ")[0]}` : ""}.</p>
              <p className="mt-2 text-ink">
                Your message is saved and waiting for our team. We only keep your name, email and what you wrote — nothing else.
              </p>
              <Btn
                className="mt-5"
                variant="ghost"
                onClick={() => {
                  setForm({ name: "", email: "", topic: "general", message: "" });
                  setState("idle");
                }}
              >
                Send another message
              </Btn>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="relative grid gap-5">
              <h2 className="text-3xl">Send a message</h2>
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="ct-site">Leave this empty</label>
                <input id="ct-site" name="website" type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Your name" htmlFor="ct-name">
                  <input
                    id="ct-name"
                    type="text"
                    maxLength={120}
                    autoComplete="name"
                    className={inputCls}
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    aria-describedby={errs.name ? "ct-name-err" : undefined}
                    aria-invalid={errs.name ? true : undefined}
                  />
                  {errP("ct-name-err", errs.name)}
                </Field>
                <Field label="Your email address" htmlFor="ct-email" hint="So we can reply to you.">
                  <input
                    id="ct-email"
                    type="email"
                    maxLength={200}
                    autoComplete="email"
                    className={inputCls}
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="name@example.com"
                    aria-describedby={errs.email ? "ct-email-err" : undefined}
                    aria-invalid={errs.email ? true : undefined}
                  />
                  {errP("ct-email-err", errs.email)}
                </Field>
              </div>
              <Field label="What is it about?" htmlFor="ct-topic">
                <select id="ct-topic" className={inputCls} value={form.topic} onChange={(e) => set("topic", e.target.value)}>
                  {TOPICS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Your message" htmlFor="ct-message">
                <textarea
                  id="ct-message"
                  rows={6}
                  maxLength={4000}
                  className={inputCls}
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  aria-describedby={errs.message ? "ct-message-err" : undefined}
                  aria-invalid={errs.message ? true : undefined}
                />
                {errP("ct-message-err", errs.message)}
              </Field>

              <RevealAddress />

              {state === "error" && (
                <p role="alert" className="text-sm font-semibold text-clay">
                  That didn’t go through. Please try again in a moment.
                </p>
              )}
              <div>
                <Btn type="submit" variant="primary" disabled={state === "saving"}>
                  {state === "saving" ? "Sending…" : "Send message"}
                </Btn>
              </div>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
