import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import Menu from "icon:menu";
import X from "icon:x";
import Lock from "icon:lock";
import { Container } from "./ui.jsx";
import { useAuth } from "../lib/auth.jsx";

const NAV = [
  { to: "/passport", label: "Rental Passport" },
  { to: "/evidence-vault", label: "Evidence Vault" },
  { to: "/share", label: "Secure Share" },
  { to: "/lease-check", label: "Lease Check" },
  { to: "/stories", label: "Rental Stories" },
  { to: "/landlords", label: "For Landlords" },
  { to: "/trust", label: "Trust & Security" },
];

const MORE = [
  { to: "/how-it-works", label: "How It Works" },
  { to: "/evidence-levels", label: "Evidence Levels" },
  { to: "/who-its-for", label: "Who It’s For" },
  { to: "/status", label: "Feature Status" },
  { to: "/about", label: "About" },
  { to: "/sign-in", label: "Sign In" },
];

function Logo({ light = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill={light ? "#F7F5EE" : "#163A2C"} />
        <path d="M8 15 16 8l8 7v9a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1z" fill={light ? "#163A2C" : "#CFDCCA"} />
        <circle cx="16" cy="18" r="2.6" fill={light ? "#F7F5EE" : "#163A2C"} />
        <rect x="15.2" y="19" width="1.6" height="4" rx=".8" fill={light ? "#F7F5EE" : "#163A2C"} />
      </svg>
      <span className="font-display text-2xl leading-none tracking-tight">RentalStories</span>
    </span>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  const { user } = useAuth();
  const links = NAV;
  const linkCls = ({ isActive }) =>
    `whitespace-nowrap rounded-full px-2.5 py-2 text-[0.9rem] font-medium transition-colors ${
      isActive ? "bg-moss-tint text-forest" : "text-ink hover:bg-sand"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[88rem] items-center justify-between gap-4 px-5 sm:px-8 xl:px-6">
        <Link to="/" aria-label="RentalStories home" className="shrink-0 text-forest">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-0.5 xl:flex">
          {links.map((n) => (
            <NavLink key={n.to} to={n.to} className={linkCls}>
              {n.label}
            </NavLink>
          ))}
          <NavLink to={user ? "/my" : "/sign-in"} className={linkCls}>
            {user ? "My Passport" : "Sign In"}
          </NavLink>
          <Link
            to="/early-access"
            className="ml-2 inline-flex min-h-10 items-center whitespace-nowrap rounded-full bg-forest px-5 text-[0.9rem] font-semibold text-paper transition-colors hover:bg-moss"
          >
            Join Early Access
          </Link>
        </nav>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-forest/50 px-4 text-sm font-semibold text-ink xl:hidden"
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-line bg-paper xl:hidden">
          <Container className="grid gap-1 py-4">
            {[{ to: "/", label: "Home" }, ...NAV, ...MORE.map((m) => (m.to === "/sign-in" && user ? { to: "/my", label: "My Passport" } : m))].map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `flex min-h-12 items-center rounded-xl px-4 text-lg font-medium ${
                    isActive ? "bg-moss-tint text-forest" : "text-ink hover:bg-sand"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <Link
              to="/early-access"
              className="mt-2 flex min-h-12 items-center justify-center rounded-full bg-forest px-5 text-lg font-semibold text-paper"
            >
              Join Early Access
            </Link>
          </Container>
        </nav>
      )}
    </header>
  );
}

function PrototypeStrip() {
  return (
    <div className="bg-sun text-ink">
      <Container className="flex items-center justify-center gap-2 py-2 text-center text-[0.8rem] font-semibold sm:text-sm">
        <Lock className="hidden h-4 w-4 shrink-0 sm:block" aria-hidden="true" />
        <span>
          Early version. Some pages show sample information, and every feature is labelled Available Now, Demo, In Development or Planned.{" "}
          <Link to="/status" className="underline underline-offset-4">See what works today</Link>
        </span>
      </Container>
    </div>
  );
}

const FOOT = [
  {
    title: "The platform",
    links: [
      ["/passport", "Rental Passport"],
      ["/evidence-vault", "Evidence Vault"],
      ["/share", "Secure Share"],
      ["/lease-check", "Lease Check"],
      ["/stories", "Rental Stories"],
    ],
  },
  {
    title: "Learn",
    links: [
      ["/how-it-works", "How It Works"],
      ["/evidence-levels", "Evidence Levels"],
      ["/who-its-for", "Who It’s For"],
      ["/landlords", "For Landlords"],
      ["/status", "Feature Status"],
      ["/about", "About"],
    ],
  },
  {
    title: "Trust and legal",
    links: [
      ["/privacy", "Privacy"],
      ["/terms", "Terms"],
      ["/consent", "Consent"],
      ["/retention", "Retention and Deletion"],
      ["/corrections", "Corrections and Disputes"],
      ["/trust", "Security"],
      ["/accessibility", "Accessibility"],
      ["/community-standards", "Community Standards"],
      ["/responsible-ai", "Responsible AI"],
      ["/contact", "Contact"],
    ],
  },
];

function Footer() {
  return (
    <footer className="on-dark mt-24 bg-forest text-paper">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs font-display text-2xl leading-tight text-paper">
              Your rental history should move with you.
            </p>
            <p className="mt-4 max-w-xs text-sm text-paper">
              Your rental history belongs to you. We do not sell your private rental information.
            </p>
          </div>
          {FOOT.map((col) => (
            <div key={col.title}>
              <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-sage-soft">{col.title}</h2>
              <ul className="mt-4 space-y-1">
                {col.links.map(([to, label]) => (
                  <li key={to}>
                    <Link to={to} className="inline-flex min-h-9 items-center text-paper underline-offset-4 hover:underline">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm text-paper">
          Questions or feedback?{" "}
          <Link to="/contact" className="inline-flex min-h-9 items-center font-semibold text-paper underline underline-offset-4">
            Contact us
          </Link>
        </p>
        <div className="perf mt-6 h-[2px] opacity-40" />
        <p className="mt-6 max-w-4xl text-sm leading-relaxed text-paper">
          RentalStories helps renters document and share their rental history. It does not provide legal advice, make rental decisions, or assign renter scores. Sample information is fictional and for demonstration only.
        </p>
        <p className="mt-3 text-sm text-paper">© 2026 RentalStories.org</p>
      </Container>
    </footer>
  );
}

export default function Layout() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
    else {
      const el = document.getElementById(hash.slice(1));
      if (el) el.scrollIntoView();
    }
  }, [pathname, hash]);

  return (
    <div className="flex min-h-screen flex-col">
      <button type="button" onClick={() => { const m = document.getElementById("main"); m.setAttribute("tabindex","-1"); m.focus(); }} className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-forest focus:px-5 focus:py-3 focus:text-paper">Skip to content</button>
      <PrototypeStrip />
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
