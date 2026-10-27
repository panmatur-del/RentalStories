// Reads the text of a lease and pulls out the terms that affect a renter's money.
// Everything here is rule-based and runs in the browser. It only reports what the text says:
// where a number isn't in the lease, nothing is invented.

const WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  fifteen: 15, twenty: 20, thirty: 30, forty: 40, "forty-five": 45, fifty: 50, sixty: 60, ninety: 90,
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10,
};
const toNum = (s) => {
  if (s == null) return NaN;
  const k = String(s).toLowerCase();
  return /^\d+$/.test(k) ? Number(k) : WORDS[k] ?? NaN;
};
const fmt = (n) => `$${Number(n).toLocaleString("en-CA", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
const ord = (n) => `${n}${[, "st", "nd", "rd"][(n % 100 >> 3) ^ 1 && n % 10] || "th"}`;
const list = (a) => (a.length < 2 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);

function amountsIn(t) {
  const out = [];
  for (const m of t.matchAll(/(?:C?\$|CAD\s?)\s?(\d[\d,]*(?:\.\d{1,2})?)/g)) {
    const n = Number(m[1].replace(/,/g, ""));
    if (!Number.isFinite(n)) continue;
    const b = t.slice(Math.max(0, m.index - 60), m.index);
    const a = t.slice(m.index + m[0].length, m.index + m[0].length + 60);
    out.push({
      n,
      b,
      a,
      w: b + a,
      monthly: /^\s*(?:\)|\.)?\s*(?:per|a|each|every|\/)\s*(?:month|mo\b)|^\s*(?:monthly)/i.test(a) || /monthly\s*$/i.test(b.slice(-20)),
      perDay: /^[^.;]{0,25}(?:per|each|every|a)\s+(?:additional\s+|extra\s+)?day|daily/i.test(a),
      nonRef: /non-?\s?refundable/i.test(b.slice(-40) + a.slice(0, 40)),
    });
  }
  return out;
}

function periodsIn(t) {
  const out = [];
  const re = /(\d+|[a-z]+(?:-[a-z]+)?)\s*(?:\((\d+)\)\s*)?[- ]?(hours?|days?|nights?|weeks?|months?|years?)\b/gi;
  for (const m of t.matchAll(re)) {
    const n = m[2] ? Number(m[2]) : toNum(m[1]);
    if (!Number.isFinite(n)) continue;
    out.push({
      n,
      unit: m[3].toLowerCase().replace(/s$/, ""),
      b: t.slice(Math.max(0, m.index - 50), m.index),
      a: t.slice(m.index + m[0].length, m.index + m[0].length + 50),
    });
  }
  return out;
}

const RES = {
  rent: ["tenancy", "fcac"],
  deposit: ["tenancy", "legal"],
  utilities: ["tenancy", "fcac"],
  late: ["tenancy", "legal"],
  cleaning: ["tenancy", "legal"],
  insurance: ["fcac", "tenancy"],
  maintenance: ["tenancy", "legal"],
  pets: ["tenancy"],
  guests: ["tenancy", "legal"],
  entry: ["tenancy", "legal"],
  sublet: ["tenancy", "legal"],
  break: ["legal", "tenancy", "cmhc"],
  fees: ["fcac", "tenancy"],
  parking: ["tenancy"],
  liability: ["legal", "tenancy"],
  renewal: ["tenancy", "legal"],
  addendum: ["legal", "cmhc"],
};

/* Each category: how to recognise it, and how to read the numbers out of it. */
const CATS = [
  {
    id: "rent",
    cat: "Rent & payment requirements",
    title: "How rent must be paid",
    head: /\b(rent|rental|payments?)\b/i,
    body: [[/monthly rent|base rent|rent (?:of|is|shall|will|payable)|pay(?:s|able)? (?:the )?rent|rent[^.]{0,30}\bdue\b/i, 3], [/\bdue (?:on|by)\b|first day|1st day/i, 1], [/portal|e-?transfer|electronic|cheque|check\b|cash\b|pre-?authorized|auto/i, 1]],
    questions: ["Is there a free way to pay, such as a bank transfer?", "If my payment is delayed by the payment system, how is my payment date recorded?", "Will I receive a receipt for every payment?"],
    read(c) {
      const rent = c.A.find((a) => /rent/i.test(a.b.slice(-35)) && !/late|fee|charge|deposit|increase|convenience/i.test(a.b.slice(-35))) || (c.A.length === 1 ? c.A[0] : null);
      const early = c.t.split(/\blate\b/i)[0];
      const dm = /(\d{1,2})(?:st|nd|rd|th)\s+(?:day\s+)?of\s+(?:each|every|the)\s+month/i.exec(early);
      const due = dm ? Number(dm[1]) : /first\s+(?:\w+\s+)?day|1st/i.test(early) ? 1 : null;
      const methods = [];
      if (/portal/i.test(c.t)) methods.push("an online portal");
      if (/e-?transfer|electronic|bank transfer|direct deposit|pre-?authorized|auto(?:matic)?[- ]?(?:debit|pay)/i.test(c.t)) methods.push("electronic or automatic payment");
      const neg = /(?:cash|cheques?|checks?)[^.]{0,25}(?:not accepted|not permitted|not allowed)|(?:no|not accept(?:ed|ing)?)\s+(?:cash|cheques?|checks?)/i.test(c.t);
      if (neg) methods.push("cash or cheques (stated as not accepted)");
      else {
        if (/cheque|check\b/i.test(c.t)) methods.push("cheque");
        if (/\bcash\b/i.test(c.t)) methods.push("cash");
      }
      if (/\bcash\b/i.test(c.t) || /cheque|check\b/i.test(c.t)) {}
      if (/credit card|debit card|by card|card payment/i.test(c.t)) methods.push("card");
      const cardFee = c.A.find((a) => a !== rent && /card|convenience|processing|transaction/i.test(a.w));
      const parts = [];
      if (rent) parts.push(`Rent is stated as ${fmt(rent.n)}${rent.monthly || /month/i.test(rent.a) ? " a month" : ""}${due ? `, due on the ${ord(due)}` : ""}.`);
      else parts.push("This clause covers how and when rent is paid. We couldn’t pick out an exact rent amount from it, so check the wording.");
      if (methods.length) parts.push(`Payment ways mentioned: ${list(methods)}. Read the clause to see which are allowed.`);
      if (cardFee) parts.push(`A charge of ${fmt(cardFee.n)} is mentioned in connection with paying by card.`);
      const money = [];
      if (rent) money.push(`${fmt(rent.n)} a month adds up to ${fmt(rent.n * 12)} over twelve months.`);
      if (cardFee) money.push(`A ${fmt(cardFee.n)} card charge each month would add about ${fmt(Math.round(cardFee.n * 12 * 100) / 100)} a year.`);
      if (!money.length) money.push("No amount was found in this clause.");
      return {
        rent: rent && rent.n,
        plain: parts.join(" "),
        money: money.join(" "),
        recurring: rent ? [{ label: "Rent", amount: rent.n }] : [],
        penalties: cardFee ? [{ label: "Card payment charge", text: `${fmt(cardFee.n)} per payment` }] : [],
      };
    },
  },
  {
    id: "deposit",
    cat: "Deposits",
    title: "Security deposit",
    head: /deposit/i,
    body: [[/security deposit|damage deposit|deposit of|last month[’']?s? rent|key deposit/i, 3], [/deposit/i, 1]],
    questions: ["Will I get a written move-in inspection report to sign?", "Will any deductions be itemized in writing?", "Where is the deposit held, and does the return period here match the rules where I live?"],
    read(c) {
      const amt = c.A.find((a) => /deposit/i.test(a.w)) || c.A[0];
      const days = c.P.find((p) => (p.unit === "day" || p.unit === "week") && /return|refund|within|after/i.test(p.b + p.a));
      const uses = [];
      if (/unpaid rent|arrears|rent (?:owing|due)/i.test(c.t)) uses.push("unpaid rent");
      if (/damage/i.test(c.t)) uses.push("damage");
      if (/clean/i.test(c.t)) uses.push("cleaning");
      if (/other (?:sums|charges|amounts|obligations)|any (?:sums|amounts)/i.test(c.t)) uses.push("other amounts owed");
      const parts = [];
      parts.push(amt ? `A deposit of ${fmt(amt.n)} is required.` : "This clause is about a deposit. We couldn’t find an amount in it.");
      if (uses.length) parts.push(`The landlord may use it for: ${list(uses)}.`);
      if (/last month[’']?s? rent/i.test(c.t)) parts.push("Part or all of it may be applied to the last month’s rent.");
      if (days) parts.push(`A return time of ${days.n} ${days.unit}${days.n > 1 ? "s" : ""} is mentioned.`);
      const others = c.A.filter((a) => a !== amt);
      if (others.length) parts.push(`Other amounts in this clause: ${list(others.map((a) => fmt(a.n)))}.`);
      if (/non-?refundable/i.test(c.t)) parts.push("Part of this is described as non-refundable. Check which part.");
      return {
        plain: parts.join(" "),
        money: amt ? `${fmt(amt.n)} is held while you rent. Any deductions reduce what you get back.` : "No amount was found in this clause.",
        oneTime: [...(amt ? [{ label: "Security deposit (held, may be returned)", amount: amt.n }] : []), ...c.A.filter((a) => a !== amt && /deposit/i.test(a.b.slice(-30))).map((a) => ({ label: /key/i.test(a.b.slice(-30)) ? "Key deposit (refundable)" : "Other deposit", amount: a.n }))],
      };
    },
  },
  {
    id: "utilities",
    cat: "Utilities",
    title: "Utilities and bill-back",
    head: /utilit/i,
    body: [[/utilit/i, 3], [/electric|hydro|\bgas\b|heat(?:ing)?\b|water|sewer|trash|garbage|internet|cable/i, 2]],
    questions: ["What did the previous tenant typically pay for electricity, gas and water?", "If a flat charge is listed, what decides when it changes, and by how much?", "Are utilities in this unit separately metered?"],
    read(c) {
      const svc = [];
      for (const [k, re] of [["electricity", /electric|hydro/i], ["gas", /\bgas\b/i], ["heat", /\bheat(?:ing)?\b/i], ["water", /\bwater\b/i], ["sewer", /sewer/i], ["trash", /trash|garbage|waste/i], ["internet or cable", /internet|cable|wi-?fi/i]]) if (re.test(c.t)) svc.push(k);
      const flat = c.A.find((a) => a.monthly || /flat|bill(?:ed)?[- ]?back|fixed/i.test(a.w));
      const included = /included in (?:the )?rent|landlord (?:shall|will|agrees to) (?:pay|provide|supply)/i.test(c.t);
      const adj = c.P.find((p) => /adjust|change|increase|revise/i.test(c.t) && /notice/i.test(p.a + p.b) && (p.unit === "day" || p.unit === "month"));
      const paysDirect = svc.filter((s) => ["electricity", "gas", "heat", "internet or cable"].includes(s));
      const parts = [];
      if (svc.length) parts.push(`Services mentioned: ${list(svc)}.`);
      if (included) parts.push("Some utilities appear to be included in rent. Check which ones.");
      if (flat) parts.push(`A fixed charge of ${fmt(flat.n)}${flat.monthly ? " a month" : ""} is mentioned${adj ? `, and it may change with ${adj.n} ${adj.unit}s’ notice` : ""}.`);
      if (!parts.length) parts.push("This clause is about who pays for utilities. Read it to see which ones are yours.");
      return {
        plain: parts.join(" "),
        money: flat ? `${fmt(flat.n)}${flat.monthly ? ` a month is ${fmt(flat.n * 12)} a year` : ""}${adj ? ", with no limit on increases stated in this clause" : ""}. Other utility costs depend on your use and aren’t quoted.` : "The lease doesn’t put a number on utility costs.",
        recurring: flat && flat.monthly ? [{ label: "Utility bill-back (fixed)", amount: flat.n }] : [],
        variable: [
          ...(paysDirect.length && !included ? [{ label: `${list(paysDirect.map((s) => s[0].toUpperCase() + s.slice(1)))}`, text: "Paid to providers; amount not stated in the lease" }] : []),
          ...(flat && adj ? [{ label: "Fixed utility charge can change", text: `Can be adjusted with ${adj.n} ${adj.unit}s’ notice` }] : []),
        ],
      };
    },
  },
  {
    id: "late",
    cat: "Late fees",
    title: "Late fees and failed payments",
    head: /late|default|penalt|nsf|returned/i,
    body: [[/late (?:fee|charge|payment|rent)|grace period|late\b[^.]{0,30}(?:fee|charge)/i, 3], [/returned (?:payment|cheque|check)|\bnsf\b|non-sufficient|bounced|dishonou?red|failed payment/i, 3]],
    questions: ["Is there any upper limit on the daily late charge?", "What happens if I contact you ahead of time about a delay?", "Do rules where I live set a grace period or a cap on late fees?"],
    read(c) {
      const returned = c.A.find((a) => /returned|failed|\bnsf\b|non-sufficient|bounced|dishonou?red/i.test(a.w));
      const perDay = c.A.find((a) => a.perDay && a !== returned);
      const base = c.A.find((a) => a !== returned && a !== perDay && /late|after|rent|charge|fee/i.test(a.w));
      const g1 = /(?:after|later than|beyond|past)\s+the\s+(\d{1,2}|[a-z]+?)(?:st|nd|rd|th)?\s*(?:\(\d+\)\s*)?(?:day|of)/i.exec(c.t);
      const g2 = /grace period of\s+(\d+|[a-z]+)\s*(?:\(\d+\)\s*)?days?/i.exec(c.t);
      const cutoff = g1 ? toNum(g1[1]) : g2 ? toNum(g2[1]) : NaN;
      const hasCut = Number.isFinite(cutoff);
      const parts = [];
      if (base) parts.push(`A late charge of ${fmt(base.n)} is stated${hasCut ? `, once rent is past the ${ord(cutoff)}` : ""}${perDay ? `, growing by ${fmt(perDay.n)} for each extra day` : ""}.`);
      else parts.push("This clause is about late or failed payments. We couldn’t find a late-fee amount in it.");
      if (returned) parts.push(`A failed or returned payment is listed at ${fmt(returned.n)}.`);
      const calc = base && hasCut ? { base: base.n, perDay: perDay ? perDay.n : 0, cutoff } : null;
      return {
        plain: parts.join(" "),
        money: calc && calc.perDay ? `Rent arriving on the ${ord(Math.min(28, cutoff + 12))} would carry ${fmt(calc.base + calc.perDay * (Math.min(28, cutoff + 12) - cutoff - 1))} in late charges on this wording. Try the calculator in Money at Risk.` : calc ? `${fmt(calc.base)} if rent arrives after the ${ord(calc.cutoff)}. Try the calculator in Money at Risk.` : base ? `${fmt(base.n)} per late payment${perDay ? ` plus ${fmt(perDay.n)} a day` : ""}.` : "No amount was found in this clause.",
        late: calc,
        penalties: [
          ...(base ? [{ label: "Late rent", text: `${fmt(base.n)}${perDay ? ` + ${fmt(perDay.n)} per extra day` : ""}` }] : []),
          ...(returned ? [{ label: "Failed or returned payment", text: `${fmt(returned.n)} each` }] : []),
        ],
      };
    },
  },
  {
    id: "cleaning",
    cat: "Cleaning",
    title: "Cleaning fee and move-out cleaning",
    head: /clean/i,
    body: [[/cleaning|shampoo|professionally clean|steam clean|carpet/i, 3]],
    questions: ["Does any cleaning fee replace move-out cleaning, or is it in addition?", "Is professional cleaning required even if the unit is already clean?", "Do rules where I live limit non-refundable fees?"],
    read(c) {
      const fee = c.A[0];
      const pro = /professional(?:ly)?[^.]{0,30}clean|clean[^.]{0,30}professional|shampoo|steam/i.test(c.t);
      const parts = [];
      if (fee) parts.push(`A cleaning charge of ${fmt(fee.n)} is stated${fee.nonRef || /non-?refundable/i.test(c.t) ? ", described as non-refundable" : ""}.`);
      if (pro) parts.push("The unit may need to be professionally cleaned or carpets shampooed when you leave, and receipts may be needed.");
      if (!parts.length) parts.push("This clause is about cleaning. Read it to see what is expected when you move out.");
      return {
        plain: parts.join(" "),
        money: fee ? `${fmt(fee.n)} up front${pro ? ", plus a move-out cleaning cost the lease doesn’t put a number on" : ""}.` : pro ? "Professional cleaning costs aren’t stated in the lease." : "No amount was found in this clause.",
        oneTime: fee ? [{ label: `Cleaning fee${fee.nonRef || /non-?refundable/i.test(c.t) ? " (non-refundable)" : ""}`, amount: fee.n }] : [],
        variable: pro ? [{ label: "Move-out professional cleaning", text: "Cost not stated; receipts may be required" }] : [],
      };
    },
  },
  {
    id: "insurance",
    cat: "Insurance",
    title: "Renter’s insurance requirement",
    head: /insurance/i,
    body: [[/renter[’']?s?[’']? insurance|tenant[’']?s? insurance|liability coverage|insurance/i, 3]],
    questions: ["May I use any insurer that meets the coverage level?", "How much notice will I get before a policy is bought on my behalf?", "Does the landlord need to be named on my policy?"],
    read(c) {
      const cover = c.A.find((a) => /liab|coverage|cover/i.test(a.w) && a.n >= 1000) || c.A.find((a) => a.n >= 1000);
      const admin = c.A.find((a) => a !== cover && /admin|month|fee/i.test(a.w));
      const lapse = /lapse|fail|force|purchase|obtain a policy|charge/i.test(c.t);
      const required = /must|shall|required|require/i.test(c.t);
      const parts = [];
      parts.push(required ? "Insurance is required." : "This clause is about insurance.");
      if (cover) parts.push(`A minimum of ${fmt(cover.n)} in coverage is mentioned.`);
      if (/proof|evidence|certificate/i.test(c.t)) parts.push("You may need to show proof.");
      if (lapse && admin) parts.push(`If proof lapses, the landlord may charge you, including ${fmt(admin.n)}${admin.monthly ? " a month" : ""}.`);
      return {
        plain: parts.join(" "),
        money: `Your premium depends on the insurer and coverage and isn’t stated in the lease.${admin ? ` If proof lapses, a charge of ${fmt(admin.n)}${admin.monthly ? ` a month (${fmt(admin.n * 12)} a year)` : ""} is mentioned.` : ""}`,
        variable: [{ label: "Renter’s insurance premium", text: "Depends on the insurer and coverage" }],
        penalties: lapse && admin ? [{ label: "Insurance lapse", text: `Premium cost plus ${fmt(admin.n)}${admin.monthly ? " a month" : ""}` }] : [],
      };
    },
  },
  {
    id: "maintenance",
    cat: "Maintenance & repairs",
    title: "Who pays for repairs",
    head: /maintenance|repair|upkeep/i,
    body: [[/repair|maintenance|maintain|upkeep|plumb|pest|light ?bulb|smoke[- ]detector|filter/i, 2], [/tenant (?:shall|must|is responsible|will)[^.]{0,40}(?:repair|replace|maintain)/i, 2]],
    questions: ["Does any dollar limit apply to heating, plumbing and appliances provided with the unit?", "What counts as an emergency, and how is it reported after hours?", "Is there a target response time for repairs?"],
    read(c) {
      const first = c.A.find((a) => /first|repair|per|each|any/i.test(a.w)) || c.A[0];
      const rep = c.P.find((p) => /report|notif|notice|discover/i.test(p.b + p.a) && (p.unit === "hour" || p.unit === "day"));
      const small = [];
      if (/bulb/i.test(c.t)) small.push("light bulbs");
      if (/batter/i.test(c.t)) small.push("batteries");
      if (/filter/i.test(c.t)) small.push("filters");
      const parts = [];
      if (first) parts.push(`You may be responsible for the first ${fmt(first.n)} of a repair.`);
      if (small.length) parts.push(`Small items you may handle: ${list(small)}.`);
      if (rep) parts.push(`Problems may need to be reported within ${rep.n} ${rep.unit}${rep.n > 1 ? "s" : ""}.`);
      if (/portal/i.test(c.t)) parts.push("Requests may go through an online portal.");
      if (!parts.length) parts.push("This clause covers upkeep and repairs. Read it to see what is yours and what is the landlord’s.");
      return {
        plain: parts.join(" "),
        money: first ? `Up to ${fmt(first.n)} out of pocket each time something needs fixing${rep ? ", and reporting late may shift more cost to you" : ""}.` : "No dollar amount was found in this clause.",
        variable: first ? [{ label: `Repairs (first ${fmt(first.n)} each time)`, text: `Up to ${fmt(first.n)} per repair` }] : [],
      };
    },
  },
  {
    id: "pets",
    cat: "Pets",
    title: "Pets and pet charges",
    head: /\bpets?\b|animal/i,
    body: [[/\bpets?\b|animal|\bdogs?\b|\bcats?\b/i, 3]],
    questions: ["Are there breed, size or number limits?", "How are service and assistance animals handled under this lease?", "Is pet rent ever refunded or reduced?"],
    read(c) {
      const none = /no pets|pets? (?:are|is) not (?:permitted|allowed)|prohibit[^.]{0,20}pets?|pets? (?:are )?prohibited/i.test(c.t);
      const rentAmt = c.A.find((a) => a.monthly);
      const fee = c.A.find((a) => a !== rentAmt && !a.monthly && /pet|fee|deposit|animal/i.test(a.w));
      const approval = /approv|consent|permission|written/i.test(c.t);
      const parts = [];
      if (none) parts.push("Pets appear not to be allowed.");
      else {
        parts.push(approval ? "Pets appear to need the landlord’s written approval." : "This clause covers pets.");
        if (fee) parts.push(`A one-time pet charge of ${fmt(fee.n)}${fee.nonRef ? " (non-refundable)" : ""} is mentioned.`);
        if (rentAmt) parts.push(`Pet rent of ${fmt(rentAmt.n)} a month is mentioned.`);
      }
      if (/unapproved|without (?:approval|consent|permission)|default/i.test(c.t)) parts.push("An unapproved animal may count as breaking the lease.");
      return {
        plain: parts.join(" "),
        money: none ? "No pet charges apply if pets aren’t allowed." : fee || rentAmt ? `For one pet: ${fee ? `${fmt(fee.n)} once` : ""}${fee && rentAmt ? ", then " : ""}${rentAmt ? `${fmt(rentAmt.n * 12)} a year` : ""}.` : "No pet amounts were found in this clause.",
        recurring: rentAmt && !none ? [{ label: "Pet rent (one pet)", amount: rentAmt.n, opt: "pet" }] : [],
        oneTime: fee && !none ? [{ label: `Pet fee${fee.nonRef ? " (non-refundable)" : ""}`, amount: fee.n, opt: "pet" }] : [],
      };
    },
  },
  {
    id: "guests",
    cat: "Guests",
    title: "Guest limits",
    head: /guest|visitor|occupan/i,
    body: [[/guests?\b|visitors?\b|additional occupants?|overnight/i, 3]],
    questions: ["How are guest-nights counted?", "How do I request permission for a longer stay, such as a family visit?"],
    read(c) {
      const lim = c.P.find((p) => p.unit === "day" || p.unit === "night");
      const parts = [];
      parts.push(lim ? `Guests appear to be limited to ${lim.n} ${lim.unit}${lim.n > 1 ? "s" : ""}${(() => { const m = /(?:in|per|within|during)\s+any\s+((?:[\w-]+\s){0,2}?(?:period|month|year|week)s?)/i.exec(lim.a); return m ? ` in any ${m[1].toLowerCase()}` : ""; })()} before the landlord’s permission is needed.` : "This clause covers guests and visitors.");
      if (/responsib|liable|conduct/i.test(c.t)) parts.push("You may be responsible for how your guests behave.");
      return { plain: parts.join(" "), money: "No fixed charge is stated here, but going past a limit could be treated as a lease violation." };
    },
  },
  {
    id: "entry",
    cat: "Landlord entry",
    title: "Landlord’s right to enter",
    head: /entry|access|inspection|enter/i,
    body: [[/enter the (?:unit|premises|property|apartment|suite)|right (?:to enter|of entry)|(?:landlord|owner)[^.]{0,20}may enter|entry (?:to|into)|inspect/i, 3], [/showing|show the (?:unit|premises)/i, 1]],
    questions: ["Can visits be limited to reasonable hours?", "Can I be present, and can I ask to reschedule?", "Notice rules for entry differ by location. What applies where I live?"],
    review: true,
    reviewWhy: "Entry and notice rules vary by location, so it’s worth confirming what applies where you rent.",
    read(c) {
      const notice = c.P.find((p) => (p.unit === "hour" || p.unit === "day") && /notice|prior|advance/i.test(p.a + p.b));
      const parts = [];
      parts.push(notice ? `The landlord may enter with ${notice.n} ${notice.unit}${notice.n > 1 ? "s" : ""}’ notice.` : "This clause covers when the landlord may enter your home. We couldn’t find a notice period in it.");
      const why = [];
      if (/inspect/i.test(c.t)) why.push("inspections");
      if (/repair/i.test(c.t)) why.push("repairs");
      if (/show|prospective|market/i.test(c.t)) why.push("showings");
      if (why.length) parts.push(`Reasons listed: ${list(why)}.`);
      if (/emergenc/i.test(c.t)) parts.push("In an emergency, notice may not be needed.");
      if (/at any time|any time/i.test(c.t)) parts.push("The wording includes “at any time”.");
      return { plain: parts.join(" "), money: "No direct charge. This is about privacy and scheduling." };
    },
  },
  {
    id: "sublet",
    cat: "Subletting",
    title: "Subletting and short-term rentals",
    head: /sublet|sublease|assign|short[- ]term/i,
    body: [[/sublet|sublease|assign(?:ment)?\b[^.]{0,20}lease|airbnb|short[- ]term rental|vrbo/i, 3]],
    questions: ["On what grounds would a sublease request be refused?", "Is there an alternative, such as an assignment or early release?"],
    read(c) {
      const fee = c.A[0];
      const banned = /shall not|may not|must not|prohibit|not permitted|not allowed/i.test(c.t);
      const parts = [];
      parts.push(banned ? "Subletting, assigning or short-term rentals appear to need permission or are not allowed." : "This clause covers subletting.");
      if (/consent|approval|approv/i.test(c.t)) parts.push(/withheld|sole discretion|absolute/i.test(c.t) ? "Consent may be withheld." : "The landlord’s consent is mentioned.");
      if (fee) parts.push(`A fee of ${fmt(fee.n)} is mentioned.`);
      return {
        plain: parts.join(" "),
        money: fee ? `${fmt(fee.n)} if a sublease is approved. If you have to leave, you may not be able to count on subletting to cover rent.` : "No amount was found in this clause.",
        penalties: fee ? [{ label: "Approved sublease", text: `${fmt(fee.n)} fee` }] : [],
      };
    },
  },
  {
    id: "break",
    cat: "Lease breaking",
    title: "Ending the lease early",
    head: /terminat|early|break|surrender|vacat/i,
    body: [[/early termination|terminat(?:e|ion|ing)[^.]{0,20}(?:lease|tenancy)|before the end|break(?:ing)? (?:the |this )?lease|re-?let|remain liable for rent|buy[- ]?out/i, 3]],
    questions: ["Does rent I owe stop the day a new tenant starts?", "Are there exceptions, such as job relocation, safety or health reasons?", "Could I negotiate an earlier exit or a smaller fee up front?"],
    review: true,
    reviewWhy: "Ending a lease early can involve some of the largest amounts in a lease. A tenant organization or a lawyer can tell you how it applies where you live.",
    read(c) {
      const mr = /(\d+|[a-z]+)\s*(?:\((\d+)\)\s*)?months?[’']?s?[’']?\s+(?:of\s+)?rent/i.exec(c.t);
      const months = mr ? (mr[2] ? Number(mr[2]) : toNum(mr[1])) : NaN;
      const explicit = c.A.filter((a) => !/rent/i.test(a.b.slice(-12)) || true);
      const relet = c.A.find((a) => /re-?let|advertis|new tenant|re-?rent|leasing/i.test(a.b.slice(-30)));
      const feeAmt = c.A.find((a) => a !== relet && /terminat|fee|early|break|buy/i.test(a.b.slice(-45)));
      const liable = /remain liable|continue to be liable|responsible for (?:the )?rent|liable for (?:the )?rent|until (?:the unit|it) is re-?(?:let|rented)/i.test(c.t);
      const rent = c.rent;
      const items = [];
      let total = 0;
      if (feeAmt) {
        items.push(feeAmt.n);
        total += feeAmt.n;
      } else if (Number.isFinite(months) && rent) {
        items.push(months * rent);
        total += months * rent;
      }
      if (relet) total += relet.n;
      const parts = [];
      if (Number.isFinite(months)) parts.push(`Leaving early may cost ${months} month${months > 1 ? "s" : ""}’ rent${rent ? ` (${fmt(months * rent)})` : ""}.`);
      else if (feeAmt) parts.push(`A termination fee of ${fmt(feeAmt.n)} is mentioned.`);
      else parts.push("This clause covers ending the lease early. We couldn’t find an amount in it.");
      if (relet) parts.push(`A re-letting fee of ${fmt(relet.n)} is mentioned.`);
      if (liable) parts.push("You may keep owing rent until the unit is rented again.");
      return {
        plain: parts.join(" "),
        money: total ? `At least ${fmt(total)} in fees${liable ? ", plus rent for any months the unit stays empty" : ""}.` : liable ? "You may owe rent until the unit is rented again. The amount depends on how long that takes." : "No amount was found in this clause.",
        penalties: total || liable ? [{ label: "Ending the lease early", text: `${total ? `${fmt(total)}` : "Fees not stated"}${liable ? ", plus rent until re-rented" : ""}` }] : [],
      };
    },
  },
  {
    id: "fees",
    cat: "Fees",
    title: "Other administrative fees",
    head: /(?:administrative|additional|other|miscellaneous|service)\s+(?:fees?|charges)|^\W*(?:(?:section|article|clause)?\s*\d+[.):\s]*)?(?:fees?|charges)\b/i,
    body: [[/administrative fee|admin(?:istration)? fee|processing fee|lock-?out|violation|application fee|\bfees? of\b|key replacement|replacement key|transfer fee/i, 3]],
    questions: ["Is every fee listed here, or can others be added?", "Is a renewal fee charged even if the terms don’t change?", "Is there a list of everything that can trigger a violation notice?"],
    read(c) {
      const labelOf = (a) => {
        const s = (a.b + " ").toLowerCase();
        const keys = [["renewal", "Renewal"], ["lock-?out", "Lock-out"], ["violation", "Violation notice"], ["notice", "Notice"], ["application", "Application"], ["key", "Key replacement"], ["transfer", "Transfer"], ["admin", "Administration"], ["processing", "Processing"], ["inspection", "Inspection"], ["smoke", "Smoke detector"]];
        let best = null;
        for (const [k, l] of keys) {
          const m = [...s.matchAll(new RegExp(k, "g"))].pop();
          if (m && (!best || m.index > best.i)) best = { i: m.index, l };
        }
        const after = a.a.toLowerCase();
        if (!best) for (const [k, l] of keys) if (new RegExp(k).test(after.slice(0, 40))) return l;
        return best ? best.l : "Fee";
      };
      const rows = c.A.map((a) => { const l = labelOf(a); return { label: l === "Fee" ? "Fee" : `${l} fee`, a }; });
      const parts = rows.length ? [`Charges listed: ${list(rows.map((r) => `${r.label.toLowerCase()} ${fmt(r.a.n)}`))}.`] : ["This clause covers fees. We couldn’t find amounts in it."];
      return {
        plain: parts.join(" "),
        money: rows.length ? `Each charge applies when its event happens, for example ${rows.slice(0, 3).map((r) => `${fmt(r.a.n)} for ${r.label.toLowerCase()}`).join(", ")}.` : "No amounts were found in this clause.",
        penalties: rows.map((r) => ({ label: r.label, text: `${fmt(r.a.n)}${/each|per/i.test(r.a.a.slice(0, 30)) ? " each time" : ""}` })),
      };
    },
  },
  {
    id: "parking",
    cat: "Parking",
    title: "Parking",
    head: /parking|vehicle|garage|storage/i,
    body: [[/parking|vehicle|towed|towing|garage|storage locker/i, 3]],
    questions: ["Is guest parking available, and where?", "Can I opt out if I don’t use the space?"],
    read(c) {
      const amt = c.A.find((a) => a.monthly) || c.A[0];
      const mand = /mandatory|required|all residents|must (?:pay|rent)/i.test(c.t);
      const tow = /tow/i.test(c.t);
      const parts = [];
      if (amt) parts.push(`Parking is listed at ${fmt(amt.n)}${amt.monthly ? " a month" : ""}${mand ? ", and it may be required if you have a vehicle" : ""}.`);
      else parts.push("This clause covers parking. We couldn’t find an amount in it.");
      if (tow) parts.push("Vehicles in unauthorized spots may be towed, with towing costs on you.");
      return {
        plain: parts.join(" "),
        money: amt ? `${amt.monthly ? `${fmt(amt.n * 12)} a year if you have a vehicle.` : `${fmt(amt.n)}.`}${tow ? " Towing costs aren’t stated." : ""}` : "No amount was found in this clause.",
        recurring: amt && amt.monthly ? [{ label: "Assigned parking", amount: amt.n, opt: "car" }] : [],
        variable: amt && !amt.monthly ? [{ label: "Parking", text: `${fmt(amt.n)} (how often it is charged isn’t clear)` }] : [],
      };
    },
  },
  {
    id: "liability",
    cat: "Liability",
    title: "Liability and indemnity",
    head: /liabil|indemn|waiver|release/i,
    body: [[/indemnif|hold harmless|liab(?:le|ility)|waive|release[sd]? (?:the )?landlord/i, 3]],
    questions: ["Does this apply to incidents caused by the landlord’s own staff or contractors?", "How does my renter’s insurance respond to a claim under this clause?"],
    review: true,
    reviewWhy: "Liability wording can have large, open-ended consequences. Consider having a tenant organization or a lawyer read it before signing.",
    read(c) {
      const parts = [];
      if (/indemnif|hold harmless/i.test(c.t)) parts.push("You agree to cover the landlord’s costs if certain claims or losses come up.");
      if (/waive|release/i.test(c.t)) parts.push("Some of your rights may be given up.");
      if (/agents|employees|contractors|negligen|landlord[’']s own/i.test(c.t)) parts.push("The wording appears to mention the landlord’s own people or negligence. Read this part closely.");
      if (/except[^.]{0,40}(?:law|prohibited)|to the extent permitted/i.test(c.t)) parts.push("It says it applies as far as the law allows.");
      if (!parts.length) parts.push("This clause covers who bears responsibility for losses or damage.");
      return { plain: parts.join(" "), money: "Not capped or quantified. Language like this can move financial risk onto you; how far depends on local law." };
    },
  },
  {
    id: "renewal",
    cat: "Renewal",
    title: "Renewal and rent increases",
    head: /renew|holdover|increase|term\b/i,
    body: [[/renew|holdover|month-to-month|rent increase|increase (?:the |your )?rent|increase (?:in )?rent|automatically/i, 3]],
    questions: ["Will I get a reminder before the notice deadline?", "Is there a month-to-month option after the first term?", "Is there any limit on how much rent can rise at renewal?"],
    read(c) {
      const auto = /automatic|renews?\b|successive|continue(?:s)? (?:on|for)/i.test(c.t);
      const notice = c.P.find((p) => (p.unit === "day" || p.unit === "month") && /notice|prior|before/i.test(p.a + p.b) && !/increase|rent/i.test(p.b.slice(-25)));
      const incr = c.P.find((p) => p !== notice && (p.unit === "day" || p.unit === "month") && /increase|notice/i.test(p.b + p.a));
      const rm = /(?:successive|additional|another|further|new|subsequent)\s+(?:\w+\s+)?(?:\((\d+)\)\s*)?[- ]?(\d+|one|six|twelve)?[- ]?(month|year)s?/i.exec(c.t);
      let term = null;
      if (rm) {
        const n = rm[1] ? Number(rm[1]) : toNum(rm[2]);
        term = Number.isFinite(n) ? (rm[3].toLowerCase() === "year" ? n * 12 : n) : /year/i.test(rm[3]) ? 12 : null;
      }
      if (/month-to-month/i.test(c.t) && !term && !/successive|automatic/i.test(c.t)) term = 1;
      const fee = c.A[0];
      const m2m = term === 1 && /month-to-month/i.test(c.t);
      const parts = [];
      if (m2m) parts.push(`After the fixed term, the tenancy appears to continue month to month${notice ? ` unless either side gives ${notice.n} ${notice.unit}s’ notice` : ""}.`);
      else if (auto) parts.push(`The lease appears to renew automatically${term ? ` for another ${term} month${term > 1 ? "s" : ""}` : ""}${notice ? ` unless you give ${notice.n} ${notice.unit}s’ notice` : ""}.`);
      else parts.push("This clause covers renewal or rent increases.");
      if (incr) parts.push(`Rent may go up with ${incr.n} ${incr.unit}s’ notice.`);
      if (fee) parts.push(`A fee of ${fmt(fee.n)} is mentioned.`);
      const total = term > 1 && c.rent ? term * c.rent : null;
      return {
        plain: parts.join(" "),
        money: m2m ? "No fixed renewal term is stated. You’d keep paying rent month to month until notice is given." : auto && total ? `Missing the notice window could commit you to another ${term} months of rent (${fmt(total)} at today’s rent), possibly at a higher price.` : auto ? "Missing the notice window could commit you to another term of rent." : "No amount was found in this clause.",
        penalties: [
          ...(auto && !m2m ? [{ label: "Missing the renewal notice", text: `${term ? `Another ${term}-month term` : "Another term"}${fee ? `; ${fmt(fee.n)} fee` : ""}` }] : []),
        ],
      };
    },
  },
  {
    id: "addendum",
    cat: "Addenda",
    title: "Addenda and dispute terms",
    head: /addend|arbitrat|dispute|house rules|schedule|exhibit|rider|rules and regulations/i,
    body: [[/addendum|addenda|arbitrat|class action|jury|waives? (?:the |any )?right|dispute resolution|mediation|house rules|\brider\b/i, 3]],
    questions: ["What are the arbitrator’s or mediator’s fees, and could they be reduced?", "Does this cover deposit disputes and repair issues?", "Which parts of the lease addenda would I be bound by?"],
    review: true,
    reviewWhy: "Addenda can change your options if there’s ever a dispute. A tenant organization or a lawyer can explain what this means in practice.",
    read(c) {
      const parts = [];
      if (/arbitrat/i.test(c.t)) parts.push("Disputes may go to private arbitration rather than a court.");
      if (/class action/i.test(c.t)) parts.push("It mentions giving up group (class action) claims.");
      if (/jury/i.test(c.t)) parts.push("It mentions giving up a jury trial.");
      if (/mediation/i.test(c.t)) parts.push("Mediation is mentioned.");
      if (/shared equally|split|costs? (?:of|shall)|fees? shall/i.test(c.t)) parts.push("It says how costs are shared.");
      if (/house rules|rules and regulations/i.test(c.t)) parts.push("House rules are mentioned. Make sure you’ve read them.");
      if (!parts.length) parts.push("This is an addendum or extra set of terms. Read it closely, since it can add to the main lease.");
      return { plain: parts.join(" "), money: /arbitrat/i.test(c.t) ? "Arbitration fees can be significant and aren’t quoted here." : "No amount was found in this clause.", variable: /arbitrat/i.test(c.t) ? [{ label: "Arbitration costs", text: "Not stated; may be shared" }] : [] };
    },
  },
];

/* ------------------------------ splitting ------------------------------ */
const HEADLINE = /^(?:(?:section|article|clause|paragraph|addendum|schedule|exhibit|appendix)\b[^.]{0,60}$|\d{1,2}(?:\.\d{1,2})*[.)]?\s+[A-Za-z][^.]{0,60}$|[A-Z][A-Z0-9 &,/'’()\-—:.]{3,70}$)/i;

function toUnits(text) {
  const raw = text
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean);
  const units = [];
  let pendingHead = "";
  for (const line of raw) {
    const isHead = line.length <= 80 && !/[.!?]$/.test(line) && HEADLINE.test(line) && !/\$\d/.test(line);
    if (isHead) {
      pendingHead = pendingHead ? `${pendingHead} ${line}` : line;
      continue;
    }
    // A body line that opens with its own number + heading, e.g. "3. Rent. Tenant shall…"
    units.push({ head: pendingHead, body: line });
    pendingHead = "";
  }
  if (pendingHead) units.push({ head: pendingHead, body: "" });

  // Break very long paragraphs into sentence groups so each clause stays readable
  const out = [];
  for (const u of units) {
    const full = u.body;
    if (full.length <= 900) {
      out.push(u);
      continue;
    }
    const sentences = full.split(/(?<=[.;])\s+(?=[A-Z0-9(])/);
    let cur = "";
    let first = true;
    for (const s of sentences) {
      if ((cur + " " + s).length > 700 && cur) {
        out.push({ head: first ? u.head : "", body: cur.trim(), cont: !first });
        cur = s;
        first = false;
      } else cur += (cur ? " " : "") + s;
    }
    if (cur) out.push({ head: first ? u.head : "", body: cur.trim(), cont: !first });
  }
  return out;
}

function refOf(u, idx) {
  const s = `${u.head} ${u.body.slice(0, 60)}`.trim();
  let m = /^\s*(?:section|article|clause|paragraph)\s+([\dA-Za-z][\dA-Za-z.\-]*)/i.exec(s);
  if (m) return `Section ${m[1].replace(/[.\-]$/, "")}`;
  m = /^\s*addendum\s+([A-Za-z0-9]+)/i.exec(s);
  if (m) return `Addendum ${m[1].toUpperCase()}`;
  m = /^\s*(\d{1,2}(?:\.\d{1,2})*)[.)]\s/.exec(s);
  if (m) return `Section ${m[1]}`;
  return `Paragraph ${idx + 1}`;
}

function score(cat, u) {
  const h = u.head || "";
  const lead = u.body.slice(0, 50);
  let s = 0;
  if (h && cat.head.test(h)) s += 6;
  else if (!h && cat.head.test(lead.replace(/^[\d.)\s]+/, "").split(/[.:—-]/)[0] || "")) s += 4;
  const t = `${h} ${u.body}`;
  for (const [re, w] of cat.body) if (re.test(t)) s += w;
  return s;
}

function readSummary(text) {
  const s = {};
  const rent = /(?:monthly rent|base rent|rent)[^$\n]{0,60}(?:C?\$|CAD\s?)\s?(\d[\d,]*(?:\.\d\d)?)/i.exec(text);
  if (rent) s.rent = Number(rent[1].replace(/,/g, ""));
  const tm =
    /(?:term of|lease term|for a (?:fixed )?term of|for a period of|fixed term)[^.\d]{0,25}(\d+|[a-z]+)\s*(?:\((\d+)\)\s*)?[- ]?(month|year)s?/i.exec(text) ||
    /(\d+|one|six|twelve)\s*(?:\((\d+)\)\s*)?[- ](month|year)\s+(?:lease|term|tenancy)/i.exec(text);
  if (tm) {
    const n = tm[2] ? Number(tm[2]) : toNum(tm[1]);
    if (Number.isFinite(n)) s.term = `${n} ${tm[3].toLowerCase()}${n > 1 ? "s" : ""}`;
  }
  const addr = /(?:premises|property|unit|apartment|rental unit|located at|address)[^:\n]{0,20}[:\-–]\s*([^\n]{5,90})/i.exec(text);
  if (addr) s.place = addr[1].replace(/\s+/g, " ").split(/\s(?=[A-Z][a-z]+:\s)/)[0].replace(/[.;,]$/, "");
  const ll = /(?:landlord|lessor|owner)[^:\n]{0,15}[:\-–]\s*([A-Z][^\n,;]{2,60})/.exec(text);
  if (ll) s.landlord = ll[1].trim();
  const start = /(?:commenc\w+|begin\w*|start\w*)[^.\n]{0,25}?((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})/i.exec(text);
  if (start) s.start = start[1];
  return s;
}

const trimClause = (s) => (s.length > 1000 ? `${s.slice(0, 1000).replace(/\s+\S*$/, "")} …` : s);

export function analyzeLease(text) {
  const summary = readSummary(text);
  const units = toUnits(text);
  const picks = new Map();
  units.forEach((u, idx) => {
    const scores = CATS.map((c) => [c, score(c, u)]);
    const best = Math.max(...scores.map(([, s]) => s));
    const headed = scores.filter(([c]) => u.head && c.head.test(u.head)).map(([c]) => c.id);
    for (const [c, s] of scores) {
      const primary = headed.length ? headed.includes(c.id) : s >= best * 0.7;
      if (s >= 3 && (primary || s >= 6)) {
        const arr = picks.get(c.id) || [];
        const sec = !primary;
        let uu = u;
        if (sec) {
          const kept = u.body.split(/(?<=[.!?])\s+/).filter((x) => c.body.some(([re]) => re.test(x)));
          uu = { head: "", body: kept.length ? kept.join(" ") : u.body, cont: true, ref: refOf(u, idx) };
        }
        arr.push({ u: uu, idx, s: sec ? s - 1 : s });
        picks.set(c.id, arr);
      }
    }
  });

  const findings = [];
  const items = { recurring: [], oneTime: [], variable: [], penalties: [] };
  let late = null;

  // Rent first, so other readers know it
  const rentPick = (picks.get("rent") || []).sort((a, b) => b.s - a.s)[0];
  if (rentPick) {
    const r = CATS[0].read({ t: `${rentPick.u.head} ${rentPick.u.body}`, A: amountsIn(`${rentPick.u.head} ${rentPick.u.body}`), P: [] });
    if (r.rent) summary.rent = r.rent;
  }

  for (const cat of CATS) {
    const hits = (picks.get(cat.id) || []).sort((a, b) => b.s - a.s || a.idx - b.idx);
    if (!hits.length) continue;
    const chosen = [hits[0], ...hits.slice(1, 2).filter((h) => h.s >= 4 && h.s >= hits[0].s * 0.7 && h.u.body !== hits[0].u.body)].sort((a, b) => a.idx - b.idx);
    chosen.forEach((h, i) => {
      const t = `${h.u.head ? h.u.head + " — " : ""}${h.u.body}`.trim();
      const body = h.u.body || h.u.head;
      const ctx = { t: `${h.u.head} ${h.u.body}`, A: amountsIn(`${h.u.head} ${h.u.body}`), P: periodsIn(`${h.u.head} ${h.u.body}`), rent: summary.rent };
      const r = cat.read(ctx);
      const ref = h.u.ref || refOf(h.u, h.idx);
      findings.push({
        id: `${cat.id}${i ? "-" + (i + 1) : ""}`,
        cat: cat.cat,
        title: cat.title + (chosen.length > 1 ? ` (${ref})` : ""),
        ref,
        clause: trimClause(h.u.head && h.u.body ? t : body),
        plain: r.plain,
        money: r.money,
        questions: cat.questions,
        resources: RES[cat.id],
        review: !!cat.review,
        reviewWhy: cat.reviewWhy,
        _order: h.idx,
      });
      for (const k of ["recurring", "oneTime", "variable", "penalties"]) for (const it of r[k] || []) items[k].push({ ...it, ref });
      if (r.late && !late) late = { ...r.late, ref };
    });
  }
  findings.sort((a, b) => a._order - b._order);
  findings.forEach((f) => delete f._order);

  const found = new Set(findings.map((f) => f.cat));
  const missing = CATS.filter((c) => !found.has(c.cat)).map((c) => c.cat);
  return { findings, summary, items, late, missing, unitCount: units.length };
}
