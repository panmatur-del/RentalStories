// A fictional sample lease for the prototype. Not a real property, landlord or contract.

export const SAMPLE_LEASE = {
  name: "Sample lease — Willow Court, Unit 5C",
  term: "12 months",
  rent: 1850,
};

export const RESOURCES = {
  tenancy: { label: "Steps to Justice — Housing law information for tenants in Canada", href: "https://stepstojustice.ca/legal-topic/housing-law/" },
  fcac: { label: "Financial Consumer Agency of Canada — Consumer tools", href: "https://www.canada.ca/en/financial-consumer-agency.html" },
  legal: { label: "Department of Justice Canada — Legal aid in your province or territory", href: "https://www.justice.gc.ca/eng/fund-fina/gov-gouv/aid-aide.html" },
  cmhc: { label: "CMHC — Renting a home", href: "https://www.cmhc-schl.gc.ca/consumers/renting-a-home" },
};

export const FINDINGS = [
  {
    id: "rent",
    cat: "Rent & payment requirements",
    title: "How rent must be paid",
    ref: "Section 3",
    clause:
      "Tenant shall pay monthly rent of $1,850.00 on or before the 1st day of each month, by electronic transfer through Landlord’s designated portal. A convenience charge of $4.95 applies to each payment made by card. Cash and checks are not accepted.",
    plain:
      "Rent is $1,850 and is due on the 1st. You have to pay through the landlord’s online portal. Paying by card adds a small fee each time.",
    money: "Paying by card adds about $59.40 a year ($4.95 × 12). Bank transfer may avoid it — the lease doesn’t say.",
    questions: [
      "Is there a free way to pay, such as a bank transfer?",
      "If the portal is down on the 1st, how is my payment date recorded?",
      "Will I receive a receipt for every payment?",
    ],
    resources: ["tenancy", "fcac"],
    review: false,
  },
  {
    id: "deposit",
    cat: "Deposits",
    title: "Security deposit",
    ref: "Section 4",
    clause:
      "Tenant shall deposit $1,850.00 as security prior to move-in. The deposit may be applied to unpaid rent, damage beyond normal wear and tear, and cleaning costs. Return will occur within 45 days after Tenant vacates and returns all keys.",
    plain:
      "You pay one month’s rent up front as a deposit. The landlord can take money from it for unpaid rent, damage and cleaning, and has 45 days after you leave to return what’s left.",
    money: "$1,850 is held for the length of your tenancy. Any deductions reduce what you get back.",
    questions: [
      "Will I get a written move-in inspection report to sign?",
      "Will deductions be itemized in writing?",
      "Where is the deposit held, and is the 45-day return period the one that applies where I live?",
    ],
    resources: ["tenancy", "legal"],
    review: false,
  },
  {
    id: "utilities",
    cat: "Utilities",
    title: "Utilities and bill-back",
    ref: "Section 5",
    clause:
      "Tenant shall pay all electricity and gas charges directly to the providers. Water, sewer and trash are billed back to Tenant at a flat $65.00 per month, which Landlord may adjust upon thirty (30) days’ written notice.",
    plain:
      "You set up and pay electricity and gas yourself. Water, sewer and trash cost a flat $65 a month — and that number can change with 30 days’ notice.",
    money: "$780 a year for water, sewer and trash today, with no stated limit on increases. Electricity and gas vary and aren’t quoted.",
    questions: [
      "What did the previous tenant typically pay for electricity and gas?",
      "What decides when the $65 charge is adjusted, and by how much?",
      "Are utilities in this unit separately metered?",
    ],
    resources: ["tenancy", "fcac"],
    review: false,
  },
  {
    id: "late",
    cat: "Late fees",
    title: "Late fees and failed payments",
    ref: "Section 6",
    clause:
      "Rent received after the 3rd day of the month incurs a late charge of $75.00, plus $10.00 for each additional day until paid in full. A fee of $50.00 applies to any returned or failed payment.",
    plain:
      "You have until the 3rd. After that there’s a $75 fee, and it grows by $10 for every extra day. A bounced payment costs another $50.",
    money: "Rent arriving on the 15th would carry $185 in late charges. See the calculator in Money at Risk.",
    questions: [
      "Is there any upper limit on the daily late charge?",
      "What happens if I contact you ahead of time about a delay?",
      "Do rules where I live set a grace period or cap on late fees?",
    ],
    resources: ["tenancy", "legal"],
    review: false,
  },
  {
    id: "cleaning",
    cat: "Cleaning",
    title: "Cleaning fee and move-out cleaning",
    ref: "Section 7",
    clause:
      "Tenant shall pay a non-refundable cleaning fee of $250.00 at signing. At move-out the unit must be returned professionally cleaned and carpets professionally shampooed; receipts are required.",
    plain:
      "There’s a $250 cleaning fee you won’t get back, and you also have to pay for professional cleaning and carpet shampooing when you leave.",
    money: "$250 up front, plus a move-out cleaning cost the lease doesn’t quantify — you may be paying for cleaning twice.",
    questions: [
      "Does the $250 fee replace the move-out cleaning, or is it in addition?",
      "Is professional cleaning required even if the unit is already clean?",
      "Do rules where I live limit non-refundable fees?",
    ],
    resources: ["tenancy", "legal"],
    review: false,
  },
  {
    id: "insurance",
    cat: "Insurance",
    title: "Renter’s insurance requirement",
    ref: "Section 8",
    clause:
      "Tenant must maintain renter’s insurance with at least $100,000 personal liability coverage and provide proof before move-in and at each renewal. If proof lapses, Landlord may purchase a policy and charge the premium plus a $15.00 monthly administration fee to Tenant.",
    plain:
      "You need your own renter’s insurance with a minimum liability amount, and must show proof. If you forget, the landlord can buy a policy and bill you for it plus a monthly fee.",
    money: "Your premium varies by insurer. If proof lapses: the landlord’s premium plus $15 a month ($180 a year).",
    questions: [
      "May I use any insurer that meets the coverage level?",
      "How much notice will I get before a policy is bought on my behalf?",
      "Does the landlord need to be named on my policy?",
    ],
    resources: ["fcac", "tenancy"],
    review: false,
  },
  {
    id: "maintenance",
    cat: "Maintenance & repairs",
    title: "Who pays for repairs",
    ref: "Section 9",
    clause:
      "Tenant is responsible for the first $150.00 of any repair, for replacement of light bulbs, smoke-detector batteries and filters, and for any damage not reported in writing within 24 hours of discovery. Landlord will respond to repair requests submitted through the portal.",
    plain:
      "You pay the first $150 of any repair, handle small items like bulbs and batteries, and need to report problems in writing within a day. Requests go through the portal.",
    money: "Up to $150 out of pocket each time something needs fixing. Reporting late may shift more cost to you.",
    questions: [
      "Does the $150 apply to heating, plumbing and appliances provided with the unit?",
      "What counts as an emergency, and how is it reported after hours?",
      "Is there a target response time for repairs?",
    ],
    resources: ["tenancy", "legal"],
    review: false,
  },
  {
    id: "pets",
    cat: "Pets",
    title: "Pets and pet charges",
    ref: "Section 10",
    clause:
      "Pets are permitted with written approval. Approved pets require a $300.00 non-refundable pet fee and $35.00 monthly pet rent per pet. Unapproved animals are a default of this Lease.",
    plain:
      "Pets need written approval first. Each approved pet costs $300 once and $35 every month. A pet the landlord hasn’t approved counts as breaking the lease.",
    money: "For one pet: $300 once, then $420 a year. Each extra pet adds the same.",
    questions: [
      "Are there breed, size or number limits?",
      "How are service and assistance animals handled under this lease?",
      "Is pet rent ever refunded or reduced?",
    ],
    resources: ["tenancy"],
    review: false,
  },
  {
    id: "guests",
    cat: "Guests",
    title: "Guest limits",
    ref: "Section 11",
    clause:
      "Guests may stay no more than ten (10) days in any six-month period without Landlord’s written consent. Tenant is responsible for the conduct of guests.",
    plain:
      "Visitors can stay up to 10 days in any six months before you need permission. You’re answerable for how your guests behave.",
    money: "No fixed charge stated, but exceeding the limit could be treated as a lease violation.",
    questions: [
      "How are guest-nights counted?",
      "How do I request permission for a longer stay, such as a family visit?",
    ],
    resources: ["tenancy", "legal"],
    review: false,
  },
  {
    id: "entry",
    cat: "Landlord entry",
    title: "Landlord’s right to enter",
    ref: "Section 12",
    clause:
      "Landlord may enter the Unit at any time for inspection, repair, or showing, with twelve (12) hours’ notice posted on the door or sent by text message. In an emergency no notice is required.",
    plain:
      "The landlord can come into your home for inspections, repairs or showings with 12 hours’ notice by door note or text. In an emergency, no notice is needed.",
    money: "No direct charge. This is about privacy and scheduling.",
    questions: [
      "Can visits be limited to reasonable hours?",
      "Can I be present, and can I ask to reschedule?",
      "Notice rules for entry differ by location — what applies where I live?",
    ],
    resources: ["tenancy", "legal"],
    review: true,
    reviewWhy: "Entry and notice rules vary by location, so it’s worth confirming what applies where you rent.",
  },
  {
    id: "sublet",
    cat: "Subletting",
    title: "Subletting and short-term rentals",
    ref: "Section 13",
    clause:
      "Tenant shall not sublet, assign or list the Unit on any short-term rental platform. Any approved sublease requires a $200.00 processing fee and Landlord’s written consent, which may be withheld.",
    plain:
      "You can’t sublet or list the home for short stays. A sublease might be approved for a $200 fee, but the landlord can say no.",
    money: "$200 if a sublease is approved. If you have to leave, you can’t count on subletting to cover the rent.",
    questions: [
      "On what grounds would a sublease request be refused?",
      "Is there an alternative, such as an assignment or early release?",
    ],
    resources: ["tenancy", "legal"],
    review: false,
  },
  {
    id: "break",
    cat: "Lease breaking",
    title: "Ending the lease early",
    ref: "Section 14",
    clause:
      "If Tenant ends the Lease before the end date, Tenant shall pay a termination fee equal to two (2) months’ rent ($3,700.00) and a re-letting fee of $500.00, and shall remain liable for rent until the Unit is re-rented.",
    plain:
      "Leaving early costs two months’ rent as a fee, plus $500 to find a new tenant — and you may keep owing rent until someone else moves in.",
    money: "At least $4,200 in fees, plus rent for any months the unit stays empty.",
    questions: [
      "Does rent I owe stop the day a new tenant starts?",
      "Are there exceptions — job relocation, military orders, safety or health reasons?",
      "Could I negotiate an earlier exit or a smaller fee up front?",
    ],
    resources: ["legal", "tenancy", "cmhc"],
    review: true,
    reviewWhy: "This clause involves the largest possible one-time amount in the lease. A tenant organization or a lawyer can tell you how it applies where you live.",
  },
  {
    id: "fees",
    cat: "Fees",
    title: "Other administrative fees",
    ref: "Section 15",
    clause:
      "Administrative fees: $100.00 lease renewal processing fee; $25.00 for each lock-out; $35.00 for each notice delivered for any violation of this Lease.",
    plain:
      "Smaller extra charges: $100 to renew, $25 each time you’re locked out, and $35 each time you’re sent a notice about a violation.",
    money: "$100 at renewal, plus $25 or $35 each time these events happen.",
    questions: [
      "Is the $100 renewal fee charged even if the terms don’t change?",
      "Is there a list of everything that can trigger a violation notice?",
    ],
    resources: ["fcac", "tenancy"],
    review: false,
  },
  {
    id: "parking",
    cat: "Parking",
    title: "Parking",
    ref: "Section 16",
    clause:
      "One assigned space is $75.00 per month and is mandatory for all residents with a registered vehicle. Vehicles parked in unauthorized spaces may be towed at Tenant’s expense.",
    plain:
      "If you have a car, you pay $75 a month for one assigned space. Parking elsewhere risks towing, at your cost.",
    money: "$900 a year if you have a vehicle. Towing costs are not stated.",
    questions: [
      "Is guest parking available, and where?",
      "Can I opt out if I don’t use the space?",
    ],
    resources: ["tenancy"],
    review: false,
  },
  {
    id: "liability",
    cat: "Liability",
    title: "Liability and indemnity",
    ref: "Section 17",
    clause:
      "Tenant agrees to indemnify and hold Landlord harmless from any claim, loss or damage arising from Tenant’s occupancy, including those caused by Landlord’s agents, except to the extent prohibited by law.",
    plain:
      "You agree to cover the landlord’s costs if a claim comes up because of your living there — and the wording appears to include things caused by the landlord’s own staff.",
    money: "Not capped or quantified. Language like this can move financial risk onto you; how far depends on local law.",
    questions: [
      "Does this apply to incidents caused by the landlord’s own staff or contractors?",
      "How does my renter’s insurance respond to a claim under this clause?",
    ],
    resources: ["legal", "tenancy"],
    review: true,
    reviewWhy: "Liability wording can have large, open-ended consequences. Consider having a tenant organization or a lawyer read it before signing.",
  },
  {
    id: "renewal",
    cat: "Renewal",
    title: "Automatic renewal and rent increases",
    ref: "Section 18",
    clause:
      "This Lease renews automatically for successive twelve (12) month terms unless Tenant gives sixty (60) days’ written notice before the end date. Rent on renewal may be increased by Landlord upon thirty (30) days’ notice.",
    plain:
      "Unless you give written notice 60 days before the end, the lease starts over for another full year. The landlord can raise the rent with 30 days’ notice.",
    money: "Missing the notice window could commit you to another 12 months of rent ($22,200 at today’s rent), possibly at a higher price.",
    questions: [
      "Will I get a reminder before the 60-day notice deadline?",
      "Is there a month-to-month option after the first year?",
      "Is there any limit on how much rent can rise at renewal?",
    ],
    resources: ["tenancy", "legal"],
    review: false,
  },
  {
    id: "addendum",
    cat: "Addenda",
    title: "Addendum B — disputes",
    ref: "Addendum B",
    clause:
      "Any dispute arising under this Lease shall be resolved by binding arbitration. Tenant waives the right to participate in a class action. Arbitration costs shall be shared equally.",
    plain:
      "If you and the landlord disagree, it goes to a private arbitrator rather than a court. You give up joining group claims, and you’d split the arbitrator’s cost.",
    money: "Arbitration fees can be significant and aren’t quoted here.",
    questions: [
      "What are the arbitrator’s fees, and could they be reduced?",
      "Does this cover deposit disputes and repair issues?",
      "Which parts of the lease addenda would I be bound by?",
    ],
    resources: ["legal", "cmhc"],
    review: true,
    reviewWhy: "Addenda can change your options if there’s ever a dispute. A tenant organization or a lawyer can explain what this means in practice.",
  },
];

export const CATEGORIES = FINDINGS.map((f) => f.cat);

// The fictional sample lease, as plain text — it goes through the same reader as a renter's own file.
export const SAMPLE_TEXT = [
  "RESIDENTIAL LEASE — WILLOW COURT, UNIT 5C (FICTIONAL SAMPLE)",
  "Premises: Willow Court, Unit 5C, Sample City",
  "Term: this lease is for a term of twelve (12) months.",
  ...FINDINGS.map((f) => `${f.ref.startsWith("Addendum") ? f.ref.toUpperCase() : f.ref.toUpperCase()}. ${f.title.toUpperCase()}\n${f.clause}`),
].join("\n");
