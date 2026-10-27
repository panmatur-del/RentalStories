import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { pb } from "./pb.js";
import { useAuth } from "./auth.jsx";
import { shareState } from "./share.js";

const Ctx = createContext(null);

export const rid = () => {
  const a = new Uint8Array(15);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join("");
};

export function MyProvider({ children }) {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, error: "" });
  const [data, setData] = useState({
    tenancies: [], evidence: [], notes: [], confirmations: [], shares: [], shareFiles: [], requests: [], logs: [],
  });

  const load = useCallback(async () => {
    try {
      const [tenancies, evidence, notes, confirmations, shares, shareFiles, requests, logs] = await Promise.all([
        pb.collection("tenancies").getFullList({ sort: "-start_date,-created" }),
        pb.collection("evidence").getFullList({ sort: "-created" }),
        pb.collection("context_notes").getFullList({ sort: "-created" }),
        pb.collection("confirmations").getFullList({ sort: "-created" }),
        pb.collection("shares").getFullList({ sort: "-created" }),
        pb.collection("share_files").getFullList({ sort: "-created" }),
        pb.collection("info_requests").getFullList({ sort: "-created" }),
        pb.collection("access_log").getFullList({ sort: "-created" }),
      ]);
      // Copies of documents are removed as soon as a link is withdrawn or has run out.
      const stale = shareFiles.filter((f) => {
        const s = shares.find((x) => x.id === f.share);
        return !s || shareState(s) !== "active";
      });
      stale.forEach((f) => pb.collection("share_files").delete(f.id).catch(() => {}));
      setData({
        tenancies, evidence, notes, confirmations, shares, requests, logs,
        shareFiles: shareFiles.filter((f) => !stale.includes(f)),
      });
      setState({ loading: false, error: "" });
    } catch (e) {
      if (e?.isAbort) return;
      setState({ loading: false, error: "We couldn’t load your Passport just now. Please refresh the page." });
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const value = useMemo(() => ({ ...data, ...state, reload: load, user }), [data, state, load, user]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMy() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useMy must be used inside MyProvider");
  return v;
}
