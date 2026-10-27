import { useState } from "react";
import { Navigate } from "react-router";
import Lock from "icon:lock";
import { Container, Eyebrow, Btn, Field, inputCls, BtnLink } from "../components/ui.jsx";
import { useAuth, friendlyError } from "../lib/auth.jsx";
import { Notice } from "./my/bits.jsx";

export default function SignIn() {
  const { user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState("in");
  const [f, setF] = useState({ name: "", email: "", password: "", trap: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (user) return <Navigate to="/my" replace />;
  const up = mode === "up";
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    if (f.trap) return;
    setErr("");
    if (f.password.length < 10) {
      setErr("Please use a password with at least 10 characters.");
      return;
    }
    setBusy(true);
    try {
      if (up) await signUp(f.name, f.email, f.password);
      else await signIn(f.email, f.password);
    } catch (ex) {
      setErr(up ? friendlyError(ex, "We couldn’t create your account. Please try again.") : "That email and password don’t match. Please check them and try again.");
      setBusy(false);
    }
  }

  return (
    <section>
      <Container className="py-12 sm:py-20">
        <div className="mx-auto max-w-xl rounded-3xl border border-line bg-card p-6 shadow-[0_30px_70px_-40px_rgba(23,58,43,0.4)] sm:p-10">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-moss-tint text-forest">
            <Lock className="h-7 w-7" aria-hidden="true" />
          </span>
          <Eyebrow className="mt-6 text-moss">{up ? "Create your account" : "Sign in"}</Eyebrow>
          <h1 className="mt-3 text-4xl sm:text-5xl">{up ? "Start your private Rental Passport." : "Welcome back."}</h1>
          <p className="mt-4 text-lg text-ink-soft">
            {up
              ? "Everything you add is private to you until you choose to share it."
              : "Sign in to your private Rental Passport."}
          </p>

          <div role="group" aria-label="Choose" className="mt-6 grid grid-cols-2 gap-1 rounded-full border border-line bg-sand p-1">
            {[["in", "Sign in"], ["up", "Create account"]].map(([k, l]) => (
              <button
                key={k}
                type="button"
                aria-pressed={mode === k}
                onClick={() => { setMode(k); setErr(""); }}
                className={`min-h-11 rounded-full px-3 text-[0.95rem] font-semibold ${mode === k ? "bg-forest text-paper" : "text-ink hover:bg-card"}`}
              >
                {l}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-5" noValidate={false}>
            {up && (
              <Field label="Your name" htmlFor="su-name" hint="Shown on what you choose to share.">
                <input id="su-name" required maxLength={80} autoComplete="name" value={f.name} onChange={set("name")} className={inputCls} />
              </Field>
            )}
            <Field label="Email address" htmlFor="su-email">
              <input id="su-email" type="email" required maxLength={160} autoComplete="email" value={f.email} onChange={set("email")} className={inputCls} />
            </Field>
            <Field label="Password" htmlFor="su-pass" hint={up ? "At least 10 characters. A few random words works well." : undefined}>
              <input
                id="su-pass"
                type="password"
                required
                minLength={up ? 10 : undefined}
                maxLength={120}
                autoComplete={up ? "new-password" : "current-password"}
                value={f.password}
                onChange={set("password")}
                className={inputCls}
              />
            </Field>
            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
              <label>
                Leave this empty
                <input tabIndex={-1} autoComplete="off" value={f.trap} onChange={set("trap")} />
              </label>
            </div>
            {err && <Notice kind="error">{err}</Notice>}
            <Btn type="submit" disabled={busy} className="w-full">
              {busy ? "One moment…" : up ? "Create my account" : "Sign in"}
            </Btn>
          </form>

          {up && (
            <p className="mt-5 text-sm text-ink-soft">
              This is an early version. Our policies are still in draft and waiting for professional review, so please add
              only what you’re comfortable keeping here for now. You can delete everything, account included, at any time.
            </p>
          )}
          <p className="mt-5 text-sm text-ink-soft">
            Password resets and second-step sign-in by email or text are planned but not available yet. Keep your password somewhere safe, and you can change it any time once you’re signed in.
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            Want to look around first? <BtnLink to="/passport" variant="ghost" className="ml-1 min-h-9 px-4 py-1 text-sm">See a sample Passport</BtnLink>
          </p>
        </div>
      </Container>
    </section>
  );
}
