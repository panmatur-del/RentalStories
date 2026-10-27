import { Routes, Route, Navigate, useParams } from "react-router";
import { AuthProvider } from "./lib/auth.jsx";
import MyLayout from "./pages/my/MyLayout.jsx";
import MyPassport from "./pages/my/MyPassport.jsx";
import MyTenancies from "./pages/my/MyTenancies.jsx";
import MyVault from "./pages/my/MyVault.jsx";
import MyContext from "./pages/my/MyContext.jsx";
import MyShares from "./pages/my/MyShares.jsx";
import MyAccount from "./pages/my/MyAccount.jsx";
import Shared from "./pages/Shared.jsx";
import Confirm from "./pages/Confirm.jsx";
import Layout from "./components/Layout.jsx";
import { PassportProvider } from "./lib/PassportContext.jsx";
import Home from "./pages/Home.jsx";
import Passport from "./pages/Passport.jsx";
import Share from "./pages/Share.jsx";
import LeaseCheck from "./pages/LeaseCheck.jsx";
import Stories from "./pages/Stories.jsx";
import Common from "./pages/Common.jsx";
import Privacy from "./pages/Privacy.jsx";
import Landlords from "./pages/Landlords.jsx";
import Trust from "./pages/Trust.jsx";
import ResponsibleAI from "./pages/ResponsibleAI.jsx";
import About from "./pages/About.jsx";
import HowItWorks from "./pages/HowItWorks.jsx";
import EarlyAccessPage from "./pages/EarlyAccessPage.jsx";
import Contact from "./pages/Contact.jsx";
import SignIn from "./pages/SignIn.jsx";
import EvidenceVault from "./pages/EvidenceVault.jsx";
import EvidenceLevels from "./pages/EvidenceLevels.jsx";
import WhoItsFor from "./pages/WhoItsFor.jsx";
import Status from "./pages/Status.jsx";
import Legal from "./pages/Legal.jsx";
import NotFound from "./pages/NotFound.jsx";

function SharedPage() {
  const { id } = useParams();
  return <Shared key={id} id={id} />;
}

export default function App() {
  return (
    <AuthProvider>
    <PassportProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/passport" element={<Passport />} />
          <Route path="/share" element={<Share />} />
          <Route path="/lease-check" element={<LeaseCheck />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/common" element={<Common />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/verification" element={<Navigate to="/evidence-levels" replace />} />
          <Route path="/evidence-vault" element={<EvidenceVault />} />
          <Route path="/evidence-levels" element={<EvidenceLevels />} />
          <Route path="/who-its-for" element={<WhoItsFor />} />
          <Route path="/status" element={<Status />} />
          {["terms", "consent", "retention", "corrections", "accessibility", "community-standards"].map((k) => (
            <Route key={k} path={`/${k}`} element={<Legal page={k} />} />
          ))}
          <Route path="/landlords" element={<Landlords />} />
          <Route path="/trust" element={<Trust />} />
          <Route path="/responsible-ai" element={<ResponsibleAI />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />
          <Route path="/early-access" element={<EarlyAccessPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/my" element={<MyLayout />}>
            <Route index element={<MyPassport />} />
            <Route path="tenancies" element={<MyTenancies />} />
            <Route path="vault" element={<MyVault />} />
            <Route path="context" element={<MyContext />} />
            <Route path="share" element={<MyShares />} />
            <Route path="account" element={<MyAccount />} />
          </Route>
          <Route path="/shared/:id" element={<SharedPage />} />
          <Route path="/confirm/:id" element={<Confirm />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </PassportProvider>
    </AuthProvider>
  );
}
