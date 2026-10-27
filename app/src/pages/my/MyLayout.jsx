import { NavLink, Navigate, Outlet } from "react-router";
import Lock from "icon:lock";
import { Container } from "../../components/ui.jsx";
import { useAuth } from "../../lib/auth.jsx";
import { MyProvider, useMy } from "../../lib/my.jsx";
import { Notice } from "./bits.jsx";

const TABS = [
  ["/my", "My Passport", true],
  ["/my/tenancies", "Tenancies", false],
  ["/my/vault", "Evidence", false],
  ["/my/context", "My context", false],
  ["/my/share", "Share", false],
  ["/my/account", "Account", false],
];

function Body() {
  const { loading, error } = useMy();
  if (loading) return <p className="py-16 text-center text-ink-soft" role="status">Opening your Passport…</p>;
  if (error) return <Notice kind="error">{error}</Notice>;
  return <Outlet />;
}

export default function MyLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/sign-in" replace />;
  return (
    <MyProvider>
      <div className="border-b border-line bg-sand">
        <Container className="py-3">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
              <Lock className="h-4 w-4" aria-hidden="true" />
              Private to you · {user.name || user.email}
            </p>
            <nav aria-label="Your Passport" className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1 py-1">
              {TABS.map(([to, label, end]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-4 text-[0.92rem] font-semibold ${
                      isActive ? "bg-forest text-paper" : "text-ink hover:bg-card"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </Container>
      </div>
      <Container className="py-10 sm:py-14">
        <Body />
      </Container>
    </MyProvider>
  );
}
