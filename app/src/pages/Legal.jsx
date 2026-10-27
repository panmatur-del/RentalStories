import { Link } from "react-router";
import FileClock from "icon:file-clock";
import { Container, Eyebrow, SiteDisclaimer, BtnLink } from "../components/ui.jsx";

const PAGES = {
  terms: {
    eyebrow: "Terms",
    title: "Terms of use.",
    lead: "Plain-language terms for the RentalStories early version.",
    sections: [
      ["What this site is", ["RentalStories is an early version of a tool that helps renters document and share their rental history. Some pages show sample information. See Feature Status for what works today."]],
      ["What it is not", ["It is not a credit bureau, a screening service, a blacklist, a marketplace or a renter-scoring system.", "It does not give legal advice and does not make or recommend rental decisions."]],
      ["Using the site", ["Use RentalStories honestly. Do not upload someone else’s documents without their permission, do not submit false information, and do not use the site to harass anyone or to look up people.", "Stories you submit must follow our Community Standards."]],
      ["Your information", ["Your rental history belongs to you. We do not sell your private rental information. How we handle information is described on the Privacy, Consent and Retention pages."]],
      ["Changes", ["These terms will change as the product does. Accounts are open in an early version, and these terms are a draft waiting for professional review. We will publish updated terms and tell account holders when they change."]],
    ],
  },
  consent: {
    eyebrow: "Consent",
    title: "Consent, in plain terms.",
    lead: "Nothing is shared, published or confirmed without a clear yes from the person it concerns.",
    sections: [
      ["Your consent comes first", ["Your Passport is private by default. Nothing leaves it unless you create a share, and every share names what is included, who it is for and when it ends.", "You can stop any share at any time. Access ends immediately."]],
      ["Landlords and other people", ["When a housing provider is asked to confirm a tenancy, they are told what is being asked and why. They are only asked about facts about the tenancy, and they can decline.", "A renter is told when a landlord has responded."]],
      ["Stories", ["A story is only considered for publication if you submit it and agree to the community terms. It is reviewed before anyone can see it, and personal details are removed or covered where needed. Never publish anyone’s private details."]],
      ["Withdrawing consent", ["You can withdraw a share, ask to remove a story or delete your records. See Retention and Deletion for how."]],
    ],
  },
  retention: {
    eyebrow: "Retention and deletion",
    title: "Keep what you choose. Delete what you want gone.",
    lead: "How long we plan to keep information, and how you can remove it.",
    sections: [
      ["Your records", ["You decide what is in your Passport and Evidence Vault. You can delete individual records, all of your records, or your whole account at any time from your Account page. Deleted records are removed straight away, along with any share links that depended on them."]],
      ["Shares", ["Every share expires. When a share ends or you revoke it, the link stops opening. You keep its access history until you delete the share. Copies of documents made for a share are removed when you revoke it, and for an expired share the next time you open your Passport."]],
      ["Contact messages and sign-ups", ["Messages from the contact form and Early Access sign-ups are kept so we can reply and keep you posted. Ask us to delete yours at any time through the contact form."]],
      ["Stories", ["Stories you submit are kept while they are being reviewed and, if approved, while they are shown. Ask us to remove yours at any time."]],
      ["Lease Check", ["Files you add to Lease Check are read on your device. They are not uploaded and not saved."]],
      ["Still being finalised", ["Exact retention periods, and how long backups are kept, will be set and published before this leaves early access."]],
    ],
  },
  corrections: {
    eyebrow: "Corrections and disputes",
    title: "Disagreements stay visible.",
    lead: "Either side can ask for a correction. Neither version is erased.",
    sections: [
      ["Asking for a correction", ["A renter or a housing provider can ask for a record to be corrected, with a short explanation and any supporting document. The record is marked “Disputed / Correction Requested” while the request is open."]],
      ["Both versions are shown", ["Until it is settled, a reader sees both versions, who gave each one, and what backs them. A dispute label is not a verdict and never counts against a renter."]],
      ["Settling it", ["If both sides agree, the record is updated and the old version stays in its history. If they do not, both versions remain and the label stays."]],
      ["Your words", ["A renter can add context to any record. It is shown in its own section, labelled as theirs."]],
      ["What we do not do", ["We do not decide who is right. We do not delete a version because the other side objects, and we do not turn disputes into scores."]],
      ["Status", ["Corrections work in your Passport today. A housing provider answers a confirmation request with different details, and you can accept their version, agree, or keep yours with a note. A housing provider can also update their answer until it is confirmed."]],
    ],
  },
  accessibility: {
    eyebrow: "Accessibility",
    title: "Built for everyone to use.",
    lead: "Housing records are for everyone, so the site should work for everyone.",
    sections: [
      ["Our aim", ["We design RentalStories to work with a keyboard, a screen reader and a phone, with clear contrast and readable text. We aim to meet the Web Content Accessibility Guidelines, level AA. We have not had an independent audit yet, so we do not claim conformance."]],
      ["What we do", ["Real headings, labels and buttons; visible focus; text that scales; no information carried by colour alone; and no content that depends on a mouse."]],
      ["Tell us what is not working", ["If something is hard to use, please tell us and we will fix it, or help you another way."]],
    ],
  },
  "community-standards": {
    eyebrow: "Community Standards",
    title: "Stories that help, not harm.",
    lead: "Rental Stories are secondary to the Passport. They are optional, reviewed and written with care.",
    sections: [
      ["How stories work", ["Stories are submitted by the person who lived them, reviewed by our team and only then shown. They are optional and never part of anyone’s Passport."]],
      ["What belongs", ["First-hand experience of renting, written without naming private individuals. Practical lessons, what helped and what you would do differently."]],
      ["What does not", ["Accusations against named people. Addresses, phone numbers, photos of individuals or any detail that identifies someone. Hate, harassment or threats. Invented stories. Advertising."]],
      ["Evidence and redaction", ["Where a story makes a factual claim about a property or a company, we may ask for evidence. We remove or cover identifying details before anything is shown. We may decline or remove any story."]],
      ["No public records", ["There are no public renter records, no public landlord ratings and no blacklists. A story is a personal account, not a verdict."]],
      ["Report a concern", ["If you see something that should not be there, tell us through the contact form and we will review it promptly."]],
    ],
  },
};

export default function Legal({ page }) {
  const p = PAGES[page];
  return (
    <>
      <section>
        <Container className="py-14 sm:py-20">
          <Eyebrow className="text-moss">{p.eyebrow}</Eyebrow>
          <h1 className="rise mt-4 max-w-4xl text-[2.75rem] sm:text-6xl lg:text-[3.6rem]">{p.title}</h1>
          <p className="rise mt-6 max-w-2xl text-lg text-ink-soft sm:text-xl" style={{ animationDelay: "0.1s" }}>{p.lead}</p>
        </Container>
      </section>
      <Container className="grid gap-12 pb-16 lg:grid-cols-[1fr_17rem]">
        <div className="max-w-3xl">
          <p className="flex gap-3 rounded-2xl border border-line bg-sand p-4 text-sm leading-relaxed text-ink">
            <FileClock className="mt-0.5 h-5 w-5 shrink-0 text-lake" aria-hidden="true" />
            <span>
              Draft for review. This page describes how RentalStories is meant to work. A qualified professional will
              review it before any real renter information is collected.
            </span>
          </p>
          <div className="mt-10 space-y-10">
            {p.sections.map(([h, paras]) => (
              <section key={h}>
                <h2 className="text-3xl">{h}</h2>
                {paras.map((t) => (
                  <p key={t} className="mt-3 text-lg text-ink-soft">{t}</p>
                ))}
              </section>
            ))}
          </div>
          <SiteDisclaimer className="mt-12" />
        </div>
        <aside className="self-start rounded-3xl border border-line bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-sans text-base font-semibold">Related</h2>
          <ul className="mt-3 space-y-1">
            {[
              ["/privacy", "Privacy"],
              ["/consent", "Consent"],
              ["/retention", "Retention and Deletion"],
              ["/corrections", "Corrections and Disputes"],
              ["/terms", "Terms"],
              ["/community-standards", "Community Standards"],
              ["/accessibility", "Accessibility"],
            ].map(([to, l]) => (
              <li key={to}>
                <Link to={to} className="inline-flex min-h-9 items-center font-medium text-forest underline-offset-4 hover:underline">{l}</Link>
              </li>
            ))}
          </ul>
          <BtnLink to="/contact" variant="ghost" className="mt-4 w-full">Contact us</BtnLink>
        </aside>
      </Container>
    </>
  );
}
