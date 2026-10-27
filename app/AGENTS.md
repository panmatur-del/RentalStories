# Project Setup

Last updated: 2026-10-24 — full RentalStories.org prototype built.

Factual state of this project, for the assistant's reference. Record project
state here only — structure, installed packages, active patterns. Keep it brief.

## Stack

A **Vite + React** single-page app (JSX), styled with **Tailwind CSS v4**. The
dev server runs with live reload, so edits appear in the preview immediately —
no build or restart needed to see a change.

The app is rendered inside **React StrictMode** in dev. StrictMode
intentionally double-invokes components, effects, and state updaters (mounting
each component twice on the first render) to surface unsafe side effects. Write
code that tolerates this: effects must clean up after themselves (return a
teardown from `useEffect`), and rendering, reducers, and state updaters must be
pure — no side effects, mutation, or one-off work outside an effect. Don't treat
the double render as a bug or try to suppress it; just write idempotent,
effect-safe code and it behaves correctly in production (where StrictMode adds
no double-invocation).

Provided by the platform (available at runtime — never add these to
`package.json`): React, react-dom, react-router, Vite, @vitejs/plugin-react,
lucide-react, pocketbase, `tailwind-merge`, and the Tailwind v4 engine itself.
This project has **no dependencies of its own** — `package.json` is empty and
there is no `node_modules`. Do not `npm install` anything for styling.

## Tailwind v4 notes

This is Tailwind **v4**, not v3. Almost all utilities are identical, but:

- The stylesheet entry is `@import "tailwindcss";` (not the three `@tailwind`
  directives). Already set up in `src/index.css`.
- **Theme customization goes in `tailwind.config.cjs`** (custom colors, fonts,
  spacing under `theme.extend`). It is wired in via `@config` in `index.css` —
  edit the config file as you would in v3. You may instead define tokens with a
  `@theme { --color-brand: …; }` block in `index.css`.
- **Never add `postcss.config`, `postcss`, or `autoprefixer`** — vendor
  prefixing is built into the v4 engine. Adding them breaks the build.
- A few renamed utilities vs v3: `shadow` → `shadow-sm`, `shadow-sm` →
  `shadow-xs`, `rounded` → `rounded-sm`, `outline-none` → `outline-hidden`,
  `flex-shrink-0` → `shrink-0`, and `bg-opacity-50` → the `bg-black/50` slash
  syntax. The default border color is now `currentColor` (set one explicitly,
  e.g. `border border-gray-200`).
- Arbitrary values (`w-[473px]`, `text-[#1da1f2]`, `grid-cols-[1fr_2fr]`) work
  exactly as in v3.

## Structure

```
src/
  App.jsx      # Root component — replace with the user's app
  main.jsx     # Entry point — renders <App/> into #root, imports index.css
  index.css    # @import "tailwindcss" + @config bridge
public/
  favicon.svg  # Placeholder — replace with the user's mark
index.html
package.json · vite.config.js · tailwind.config.cjs
```

`dist/` is committed (the deploy reads from it); `node_modules/` is ignored.

## Starting point

`App.jsx` ships a placeholder welcome page. Replace its contents with whatever
the user is building. Also replace the placeholder `<title>`, meta
description and `public/favicon.svg` with ones that match the
business — see your instructions for the full checklist.

## Routing & asset paths

The published `dist/` is served from more than one base path (the live site at
`/`, and read-only history snapshots under a longer prefix). The build uses a
relative asset base plus a `<base href>` in `index.html` so the same output
works from any of them — so two rules keep links and assets from breaking:

- **Never hardcode root-absolute URLs** (a leading `/`) for in-app assets or
  links — `/logo.png`, `/about`, `fetch("/data.json")`. Import assets
  (`import logo from "./logo.png"`) or reference them relatively; they then
  resolve against the base automatically.
  - **Exception — `/static/…`.** Files in the project's `static/` directory are
    served by the platform at the fixed absolute URL `/static/<filename>`, which
    resolves the same on every base path (live, preview, snapshots) because it's
    mapped outside the app, not bundled into `dist/`. Reference these **exactly**
    as `/static/<file>` (e.g. `<img src="/static/photo.jpg">`) — leading slash and
    all. This is the one allowed root-absolute path. Never copy a `static/` asset
    into the app (`public/`, `src/`) and never reach it with a relative `../`
    path. (The get-image skill saves design images into `static/` and prints the
    `/static/<file>` path to use verbatim.)
- **If you add a router**, set its basename from the document base, never a
  literal `/`:

  ```jsx
  import { createBrowserRouter } from "react-router";
  // strip the trailing slash; "/" becomes "" which react-router wants
  const basename = new URL(document.baseURI).pathname.replace(/\/$/, "");
  const router = createBrowserRouter(routes, { basename });
  ```

  (or `<BrowserRouter basename={basename}>`). This makes the app mount
  correctly whether served from `/` or a longer prefix.

## Current project state (RentalStories.org)

Last updated: 2026-10-25 — real accounts, Passport, Evidence Vault, landlord confirmation, Secure Share built on top of the redesign.

Multi-page site (react-router, basename from document base). Routes in `src/App.jsx`: / , /passport, /evidence-vault, /share, /lease-check, /stories, /common, /landlords, /how-it-works, /evidence-levels, /who-its-for, /status, /privacy, /trust (Security), /responsible-ai, /about, /early-access, /contact, /sign-in, legal pages via `Legal.jsx` (/terms /consent /retention /corrections /accessibility /community-standards), /verification redirects to /evidence-levels, 404.
- Proposition (whole site): "Your rental history should move with you." Private, portable, evidence-backed rental record; Rental Passport is the primary product; Evidence Vault, Secure Share, Lease Check, Rental Stories support it. Core lines: "Not a credit score. Not a renter score. Your documented rental history." / "Choose the evidence. Choose the recipient. Choose the duration." / "Your rental history belongs to you. We do not sell your private rental information." Disclaimer text is `DISCLAIMER_TEXT` / `SiteDisclaimer` in ui.jsx.
- Evidence levels (keys in `EVIDENCE`, ui.jsx): self=Renter Provided, document=Document Supported, payment=Payment Supported, landlord=Landlord Confirmed, provider=Independently Verified, disputed=Disputed / Correction Requested. Renters may only classify records as self/document/payment; landlord/provider are set by others. Renter context (`CONTEXT_NOTES`) is always shown separately from verified facts. No scores anywhere.
- **Real product (built 2026-10-25)**: `src/lib/auth.jsx` (AuthProvider, email+password via `members` auth collection, no email features), `src/lib/my.jsx` (MyProvider loads all of the signed-in renter's records; also deletes stale share document copies), `src/lib/share.js` (packages, durations, evidence-level logic, snapshot builder). Signed-in area `/my` (MyLayout guard; pages in `src/pages/my/`: MyPassport, MyTenancies, MyVault, MyContext, MyShares, MyAccount; shared bits in `my/bits.jsx`). Public pages: `/confirm/:id` (Confirm.jsx, landlord answers a request, no account) and `/shared/:id` (Shared.jsx, recipient view + ask-for-more-info form). `/sample` pages (/passport, /evidence-vault, /share, /landlords) still use sample data in `src/data/passport.js` + `PassportContext` and show `BuildYourOwn`.
- PocketBase stores for the real product: `members` (auth), `tenancies`, `evidence` (file protected; level select only self/document/payment), `context_notes`, `confirmations` (id generated client-side = the private link; public view by id; landlord update allowed only on response fields while not confirmed; owner can only write renter_note/resolution), `shares` (snapshot JSON; public view only while not revoked and not expired; id = the link), `share_files` (copies of files; public view by id while share valid; removed on revoke/expiry when owner next loads), `access_log` and `info_requests` (public create only while share valid; owner reads). All owner-scoped rules use `owner = @request.auth.id`; deleting a member cascades everything. Never loosen these rules; verify with node scripts after any change.
- `members` also stores optional `phone` and `second_step` (email|text) — saved from /my/account as the renter's preference only; nothing is sent (email/SMS unavailable). Shown with a Planned pill. Owner-only read/update. Never shared with recipients.
- Not built (labelled Planned): Independently Verified (no providers), multi-factor sign-in (needs email/SMS), automatic bank linking, password reset by email.
- Feature honesty: `FeaturePill` (Available Now / Demo / In Development / Planned) on every product area; `/status` lists all. Available Now = accounts, Passport, Evidence Vault, landlord confirmation, corrections, Secure Share, download/delete, Lease Check, Rental Stories, Early Access, Contact. Demo = the sample pages. Planned = Independently Verified, MFA, bank linking. Never present planned features as working; no "bank-level", "100% secure", "fully compliant".
- Look: Canadian calm trust brand — deep forest (`forest`), muted sage (`sage`, `sage-soft`), warm off-white (`paper`), charcoal (`ink`), neutral greys. Newsreader + Hanken Grotesk + IBM Plex Mono (loaded in index.html, tokens in `@theme` in `src/index.css`). `clay` only for disputed/error states. Token names `sun`/`moss`/`lake` are remapped to sage/green/slate shades.
- Nav (Layout.jsx): Rental Passport, Evidence Vault, Secure Share, Lease Check, Rental Stories, For Landlords, Trust & Security, Sign In, Join Early Access (full nav at xl, menu below; menu also lists How It Works, Evidence Levels, Who It's For, Feature Status, About). Footer lists all legal pages.
- Sharing demo: `PACKAGES` + `SCOPES` in `src/data/passport.js` (Tenancy History, Payment History, Landlord Reference, Rental Application, Dispute Evidence); shares have optional `allowDownload` (default off). Landlord view on /landlords is a demo (confirm / request more information are in-memory only).
- Legal pages are marked "Draft for review" — a professional must review before real renter data is collected.
- `src/components/ui.jsx` — shared UI. `EarlyAccess.jsx` — form (name, email, role, optional organization; no documents).
- Sign In (`/sign-in`) is real: sign in / create account tabs, honeypot, min 10-char password. Official resources in `src/data/lease.js` are Canadian.
- Lease Check (`src/pages/LeaseCheck.jsx`) reads the renter’s own PDF/.docx/.txt or pasted text in the browser (`src/lib/leaseReader.js`, nothing uploaded) and finds clauses/amounts with rule-based `src/lib/leaseAnalyzer.js`; findings and Money at Risk come only from the text read. The sample lease (`SAMPLE_TEXT` in `src/data/lease.js`) runs through the same analyzer. Scanned/image PDFs are not readable (user is told to paste text).
- `src/data/*.js` fictional sample data; `src/lib/PassportContext.jsx` in-memory demo state (not persisted).
- Persisted via PocketBase (`src/lib/pb.js`): `stories` (public create as status=pending; list only approved) and `early_access` (create-only: name, email, role select, organisation).
- No scores/ratings anywhere by design. Plain hash anchors avoided (base href); use `jumpTo`/`JumpButton`.

### Lease Check input (updated)
- `src/lib/leaseOcr.js` (lazy-loaded): photos, scanned PDFs and video frames are read in the browser with Tesseract (tesseract.js 5.1.1) and PDF pages with pdf.js 3.11.174, both self-hosted in `static/ocr/` (served at `/static/ocr/…`, no outside hosts, no browser cache of language data) and loaded on demand via script tags; the lease file never leaves the device. PDFs use pdf.js text + form-field values first and fall back to page OCR when a page has <150 letters; the hand-written parser in leaseReader.js is a last fallback.
- `readLeaseFile(file, report)` accepts image/*, video/*, PDF, .docx, .txt; new ReadError codes: oldWord, imageFormat, videoFormat, ocrUnavailable. Handwriting is only partly readable; drawings are not interpreted (stated in the UI).

### Security notes
- No PHP or server code; fully static front end. Forms: honeypot field + length limits + double-submit guard (EarlyAccess, Stories). Store rules: `early_access` create-only, `stories` create as pending / list approved only; no update/delete for the public.
- `index.html` carries a light CSP (object-src none, base-uri/form-action self) and a referrer policy. MFA is not built (needs email-based second factor, unavailable here). Trust copy says "designed to" — keep it honest, never claim certifications.
- Audit (post-publish): store rules re-verified — `early_access` list/view/update/delete closed to the public (anon list = 403); `stories` public list/view only when approved, create only as pending, no public update/delete. No innerHTML/eval/localStorage/cookies; external links use noopener; no secrets in repo; no source maps shipped. CSP also sets frame-src none. Response headers (HSTS, X-Frame-Options, full CSP) are a hosting-level setting — not controllable from the app.

### Contact
- Support address (info@rentalstories.org) is never printed in the page. `/contact` (`src/pages/Contact.jsx`) has a contact form saving to `contact_messages` (create-only for the public; list/view/update/delete closed). The address is assembled in code and only revealed by a "Show our email address" toggle inside the form. `ContactLink` (ui.jsx) links to /contact from Trust, Early Access, Landlords, Sign In, 404; footer has "Contact us". No mailto links anywhere.
