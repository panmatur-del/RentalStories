import { useState } from "react";
import { pb } from "../lib/pb.js";
import { Btn, Field, inputCls } from "./ui.jsx";

export const ROLES = [
  { value: "renter", label: "Renter" },
  { value: "landlord", label: "Landlord" },
  { value: "property_manager", label: "Property manager" },
  { value: "housing_professional", label: "Housing professional" },
  { value: "financial_counsellor", label: "Financial counsellor" },
  { value: "partner", label: "Partner organization" },
];

function roleNoun(role) {
  switch (role) {
    case "renter":
      return "renters";
    case "landlord":
      return "landlords";
    case "property_manager":
      return "property managers";
    case "housing_professional":
      return "housing professionals";
    case "financial_counsellor":
      return "financial counsellors";
    default:
      return "partners";
  }
}

export default function EarlyAccess({ defaultRole = "renter" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(defaultRole);
  const [org, setOrg] = useState("");
  const [trap, setTrap] = useState("");
  const [state, setState] = useState("idle"); // idle | saving | done | error
  const [errs, setErrs] = useState({});

  const showOrg = role !== "renter";

  async function submit(e) {
    e.preventDefault();
    if (state === "saving") return;
    if (trap) {
      setState("done");
      return;
    }
    const next = {};
    if (!name.trim()) next.name = "Please tell us your name so we know who to greet.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Please enter a valid email address, like name@example.com.";
    setErrs(next);
    if (Object.keys(next).length) return;
    setState("saving");
    try {
      await pb.collection("early_access").create({
        name: name.trim(),
        email: email.trim(),
        role,
        organisation: showOrg ? org.trim() : "",
      });
      setState("done");
    } catch (error) {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div role="status" className="rounded-2xl bg-moss-tint p-6">
        <p className="font-display text-3xl text-forest">You’re on the list, {name.trim().split(" ")[0]}.</p>
        <p className="mt-2 text-ink">
          Your place is saved. We’ll write to you when early access opens for {roleNoun(role)}. We only hold your name,
          email and role — nothing else.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="relative grid gap-5">
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="ea-site">Leave this empty</label>
        <input id="ea-site" name="website" type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="ea-name">
          <input
            id="ea-name"
            type="text"
            maxLength={120}
            autoComplete="name"
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-describedby={errs.name ? "ea-name-err" : undefined}
            aria-invalid={errs.name ? true : undefined}
          />
          {errs.name && (
            <p id="ea-name-err" className="mt-1.5 text-sm font-semibold text-clay">
              {errs.name}
            </p>
          )}
        </Field>
        <Field label="Email address" htmlFor="ea-email">
          <input
            id="ea-email"
            type="email"
            maxLength={200}
            autoComplete="email"
            className={inputCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            aria-describedby={errs.email ? "ea-email-err" : undefined}
            aria-invalid={errs.email ? true : undefined}
          />
          {errs.email && (
            <p id="ea-email-err" className="mt-1.5 text-sm font-semibold text-clay">
              {errs.email}
            </p>
          )}
        </Field>
      </div>

      <Field label="I am a…" htmlFor="ea-role">
        <select id="ea-role" className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </Field>

      {showOrg && (
        <Field label="Organization (optional)" htmlFor="ea-org" hint="Your company, agency or team name.">
          <input
            id="ea-org"
            type="text"
            maxLength={160}
            autoComplete="organization"
            className={inputCls}
            value={org}
            onChange={(e) => setOrg(e.target.value)}
          />
        </Field>
      )}

      {state === "error" && (
        <p role="alert" className="text-sm font-semibold text-clay">
          That didn’t go through. Please try again in a moment.
        </p>
      )}

      <div>
        <Btn type="submit" variant="primary" disabled={state === "saving"}>
          {state === "saving" ? "Saving your place…" : "Join Early Access"}
        </Btn>
      </div>
      <p className="text-sm text-ink-soft">
        We collect only your name, email and role. Please don’t send leases, IDs or other documents — it’s too early for
        that, and we’ll never ask for them here. We never sell your details.
      </p>
    </form>
  );
}
