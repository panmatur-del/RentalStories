// Sample data for the prototype. Everything here is fictional.

export const RENTER = { name: "Alex Rivera", initials: "AR", since: "Passport opened Jan 2026" };

export const TENANCIES = [
  {
    id: "t1",
    address: "412 Alder Street, Apt 3B",
    place: "Portland, OR",
    from: "Mar 2023",
    to: "Present",
    rent: "$1,640 / month",
    evidence: ["landlord", "payment", "document"],
    status: "confirmed",
    source: "Harbor Row Properties — property manager",
    verifiedOn: "2026-09-12",
    note: "Dates, address and monthly rent confirmed by the housing provider. Payment records matched for the months listed in Rent payments.",
  },
  {
    id: "t2",
    address: "88 Mill Lane, Unit 2",
    place: "Salem, OR",
    from: "Aug 2020",
    to: "Feb 2023",
    rent: "$1,295 / month",
    evidence: ["document", "landlord", "disputed"],
    status: "disputed",
    source: "Mill Lane Rentals — owner",
    verifiedOn: "2026-08-03",
    note: "Move-in date and rent were confirmed. The move-out date is disputed.",
    versions: [
      { who: "Renter", says: "Moved out Feb 14, 2023", backing: "Key-return receipt (uploaded)" },
      { who: "Housing provider", says: "Moved out Feb 28, 2023", backing: "Owner's inspection record" },
    ],
  },
  {
    id: "t3",
    address: "19 Ferry Road, Room 2 (shared house)",
    place: "Salem, OR",
    from: "Jan 2019",
    to: "Jul 2020",
    rent: "$575 / month",
    evidence: ["self"],
    status: "unable",
    source: "No response from the former housing provider",
    verifiedOn: "2026-07-20",
    note: "A verification request was sent and has not been answered. It stays Renter Provided, and it is not counted against anything.",
  },
];

export const PAYMENTS = [
  { month: "Sep 2026", amount: "$1,640", paid: "Sep 1, 2026", source: "Linked bank record", date: "2026-10-02", status: "confirmed", evidence: "payment" },
  { month: "Aug 2026", amount: "$1,640", paid: "Aug 1, 2026", source: "Linked bank record", date: "2026-09-02", status: "confirmed", evidence: "payment" },
  { month: "Jul 2026", amount: "$1,640", paid: "Jul 6, 2026", source: "Linked bank record", date: "2026-08-02", status: "confirmed", evidence: "payment" },
  { month: "Jun 2026", amount: "$1,640", paid: "Jun 1, 2026", source: "Linked bank record", date: "2026-07-02", status: "confirmed", evidence: "payment" },
  { month: "May 2026", amount: "$1,640", paid: "May 3, 2026", source: "Rent receipt (uploaded)", date: "2026-06-04", status: "partial", evidence: "document" },
  { month: "Apr 2026", amount: "$1,640", paid: "Apr 1, 2026", source: "Landlord ledger", date: "2026-05-02", status: "confirmed", evidence: "landlord" },
];

export const REFERENCES = [
  {
    id: "r1",
    name: "Priya Nair",
    role: "Property manager, Harbor Row Properties",
    relation: "Current housing provider · 2023–present",
    statement:
      "Alex has been a resident of 412 Alder Street since March 2023. Rent is paid through our resident portal and we have no open balance.",
    evidence: "landlord",
    status: "confirmed",
    date: "2026-10-02",
  },
  {
    id: "r2",
    name: "Daniel Okafor",
    role: "Owner, Mill Lane Rentals",
    relation: "Previous housing provider · 2020–2023",
    statement:
      "Alex was a resident from August 2020. Our records show a move-out date of February 28, 2023. Alex disagrees with that date and has added a note.",
    evidence: "landlord",
    status: "disputed",
    date: "2026-08-03",
  },
];

export const EMPLOYMENT = [
  {
    id: "e1",
    employer: "Northfield Community Clinic",
    title: "Medical assistant",
    since: "Jun 2022",
    evidence: "provider",
    status: "confirmed",
    source: "Payroll verification provider",
    date: "2026-09-28",
    hidden: "Income figures stay hidden unless you choose to include them in a share.",
  },
];

export const VAULT_CATEGORIES = [
  { id: "lease", label: "Leases", hint: "Signed agreements and renewals" },
  { id: "payment", label: "Payment evidence", hint: "Receipts, ledgers, bank records of rent" },
  { id: "landlord", label: "Landlord confirmations", hint: "Statements and tenancy confirmations" },
  { id: "deposit", label: "Deposits", hint: "Deposit receipts and returns" },
  { id: "movein", label: "Move-in / move-out records", hint: "Checklists, photos, key returns" },
  { id: "maintenance", label: "Maintenance", hint: "Requests and repair records" },
  { id: "notice", label: "Notices", hint: "Rent changes, entry, end of tenancy" },
  { id: "comms", label: "Key communications", hint: "Messages that matter to a decision" },
  { id: "completed", label: "Completed-tenancy confirmations", hint: "Confirmation that a tenancy ended in good order" },
];

export const DOCUMENTS_INITIAL = [
  { id: "d1", name: "Lease — 412 Alder Street (2025 renewal).pdf", cat: "lease", tenancy: "412 Alder Street", size: "1.2 MB", added: "2026-02-08", evidence: "document", redacted: false },
  { id: "d2", name: "Key-return receipt — 88 Mill Lane.jpg", cat: "movein", tenancy: "88 Mill Lane", size: "640 KB", added: "2026-08-01", evidence: "document", redacted: false },
  { id: "d3", name: "Rent receipt — May 2026.pdf", cat: "payment", tenancy: "412 Alder Street", size: "88 KB", added: "2026-06-04", evidence: "payment", redacted: false },
  { id: "d4", name: "Rent ledger export — Jan to Sep 2026.pdf", cat: "payment", tenancy: "412 Alder Street", size: "210 KB", added: "2026-10-02", evidence: "payment", redacted: false },
  { id: "d5", name: "Reference letter — Harbor Row Properties.pdf", cat: "landlord", tenancy: "412 Alder Street", size: "145 KB", added: "2026-10-02", evidence: "landlord", redacted: false },
  { id: "d6", name: "Security deposit receipt — 88 Mill Lane.pdf", cat: "deposit", tenancy: "88 Mill Lane", size: "96 KB", added: "2026-03-14", evidence: "document", redacted: false },
  { id: "d7", name: "Move-in checklist — 412 Alder Street.pdf", cat: "movein", tenancy: "412 Alder Street", size: "2.1 MB", added: "2023-03-02", evidence: "document", redacted: false },
  { id: "d8", name: "Repair request — kitchen tap (Jun 2025).pdf", cat: "maintenance", tenancy: "412 Alder Street", size: "74 KB", added: "2025-06-12", evidence: "document", redacted: false },
  { id: "d9", name: "Notice of rent change — Jan 2026.pdf", cat: "notice", tenancy: "412 Alder Street", size: "112 KB", added: "2025-11-20", evidence: "document", redacted: false },
  { id: "d10", name: "Email thread about move-out date — Feb 2023.pdf", cat: "comms", tenancy: "88 Mill Lane", size: "180 KB", added: "2026-08-01", evidence: "self", redacted: true },
];

// Renter-written context. Always kept separate from verified facts.
export const CONTEXT_NOTES = [
  {
    id: "c1",
    topic: "Consumer proposal",
    written: "2026-09-15",
    text: "I entered a consumer proposal in 2024 after a period without work. My credit file shows it. My rent was paid on time through that period, and the payment evidence in my Passport covers those months.",
  },
  {
    id: "c2",
    topic: "Self-employment",
    written: "2026-09-15",
    text: "I work on contract, so my income isn’t a steady payslip. I’d rather you see twelve months of rent paid on time than a single income figure.",
  },
];

export const CONTEXT_PROMPTS = [
  "A credit issue or consumer proposal",
  "A gap in work or unemployment",
  "Self-employment or contract income",
  "Moving to Canada without a Canadian credit history",
  "A dispute with a past landlord",
  "Leaving shared or family housing",
  "Student or first-time renter",
  "Something else that matters",
];

export const TIMELINE = [
  { year: "2019", title: "Moved into 19 Ferry Road", sub: "Shared house · Salem", evidence: "self" },
  { year: "2020", title: "Moved into 88 Mill Lane", sub: "Unit 2 · Salem", evidence: "document" },
  { year: "2022", title: "Rent payments begin on a monthly schedule", sub: "Receipts and ledger entries attached", evidence: "payment" },
  { year: "2023", title: "Moved into 412 Alder Street", sub: "Apt 3B · Portland", evidence: "landlord" },
  { year: "2026", title: "Reference from current manager", sub: "Statement dated Oct 2, 2026", evidence: "landlord" },
];

// Share scopes
export const SCOPES = [
  { id: "history", label: "Tenancy history", desc: "Addresses, dates, and the evidence level, source and date for each tenancy." },
  { id: "payments", label: "Payment evidence", desc: "Month-by-month rent payments with the source of each record." },
  { id: "references", label: "Landlord confirmations and references", desc: "Statements from housing providers, with their name, role and date." },
  { id: "context", label: "My context", desc: "Your own explanations. Always shown apart from the verified facts." },
  { id: "documents", label: "Documents", desc: "Only the specific files you tick, nothing else." },
];

// Ready-made starting points. Each only pre-ticks boxes; the renter can change anything.
export const PACKAGES = [
  { id: "tenancy", label: "Tenancy History", scopes: ["history"], desc: "Where and when you have rented, with the evidence level for each tenancy." },
  { id: "payment", label: "Payment History", scopes: ["history", "payments"], desc: "Rent paid, month by month, with the source of every record." },
  { id: "reference", label: "Landlord Reference", scopes: ["history", "references"], desc: "Confirmations and references from housing providers." },
  { id: "application", label: "Rental Application", scopes: ["history", "payments", "references", "context"], desc: "A fuller picture for one application, with your context beside the facts." },
  { id: "dispute", label: "Dispute Evidence", scopes: ["history", "documents"], desc: "The records that bear on a correction or dispute, and nothing else." },
];

export const DURATIONS = [
  { id: "24h", label: "24 hours", hours: 24 },
  { id: "7d", label: "7 days", hours: 24 * 7 },
  { id: "14d", label: "14 days", hours: 24 * 14 },
  { id: "custom", label: "Custom", hours: null },
];
