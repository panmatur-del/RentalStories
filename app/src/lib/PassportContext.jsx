import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DOCUMENTS_INITIAL, SCOPES } from "../data/passport.js";

const Ctx = createContext(null);

// Fixed reference moment so the sample data is stable.
const NOW0 = new Date("2026-10-24T09:00:00").getTime();
const H = 3600 * 1000;

const SEED_SHARES = [
  {
    id: "s1",
    recipient: "Birch Court Apartments — leasing office",
    scopes: ["history", "payments", "references"],
    docs: [],
    created: NOW0 - 2 * 24 * H,
    expires: NOW0 + 5 * 24 * H,
    revoked: false,
    code: "bc7-4Kq9-mX2p",
    log: [
      { at: NOW0 - 2 * 24 * H, what: "Share created by you" },
      { at: NOW0 - 2 * 24 * H + 3 * H, what: "Link opened — Rental history viewed" },
      { at: NOW0 - 1 * 24 * H - 4 * H, what: "Payment history viewed" },
    ],
  },
  {
    id: "s2",
    recipient: "Cedar & Pine Property Group",
    scopes: ["history", "context"],
    docs: [],
    created: NOW0 - 12 * 24 * H,
    expires: NOW0 - 5 * 24 * H,
    revoked: false,
    code: "cp3-Rt8w-Lz5n",
    log: [
      { at: NOW0 - 12 * 24 * H, what: "Share created by you" },
      { at: NOW0 - 11 * 24 * H, what: "Link opened — Rental history viewed" },
      { at: NOW0 - 5 * 24 * H, what: "Access expired automatically" },
    ],
  },
];

function randCode() {
  const a = "abcdefghjkmnpqrstuvwxyz23456789";
  const seg = (n) => Array.from({ length: n }, () => a[Math.floor(Math.random() * a.length)]).join("");
  return `${seg(3)}-${seg(4)}-${seg(4)}`;
}

export function PassportProvider({ children }) {
  const [shares, setShares] = useState(SEED_SHARES);
  const [docs, setDocs] = useState(DOCUMENTS_INITIAL);
  const [notes, setNotes] = useState([]); // corrections/disputes raised by the renter in this session
  const [now] = useState(NOW0);

  const createShare = useCallback(
    ({ recipient, scopes, docIds, hours, allowDownload = false, pkg = null }) => {
      const share = {
        id: `s${Date.now()}`,
        recipient: recipient.trim() || "Unnamed recipient",
        scopes,
        docs: docIds,
        allowDownload,
        pkg,
        created: now,
        expires: now + hours * H,
        revoked: false,
        code: randCode(),
        log: [{ at: now, what: "Share created by you" }],
      };
      setShares((s) => [share, ...s]);
      return share;
    },
    [now],
  );

  const revokeShare = useCallback(
    (id) => {
      setShares((all) =>
        all.map((s) =>
          s.id === id && !s.revoked
            ? { ...s, revoked: true, log: [...s.log, { at: now, what: "Access revoked by you — link stopped working immediately" }] }
            : s,
        ),
      );
    },
    [now],
  );

  const deleteDoc = useCallback((id) => setDocs((d) => d.filter((x) => x.id !== id)), []);
  const classifyDoc = useCallback((id, evidence) => setDocs((d) => d.map((x) => (x.id === id ? { ...x, evidence } : x))), []);
  const deleteAllDocs = useCallback(() => setDocs([]), []);
  const addNote = useCallback((n) => setNotes((x) => [{ ...n, id: `n${Date.now()}`, at: now }, ...x]), [now]);

  const isActive = useCallback((s) => !s.revoked && s.expires > now, [now]);

  const value = useMemo(
    () => ({ shares, docs, notes, now, createShare, revokeShare, deleteDoc, classifyDoc, deleteAllDocs, addNote, isActive, scopes: SCOPES }),
    [shares, docs, notes, now, createShare, revokeShare, deleteDoc, classifyDoc, deleteAllDocs, addNote, isActive],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePassport() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePassport must be used inside PassportProvider");
  return v;
}

export function timeLeft(expires, now) {
  const ms = expires - now;
  if (ms <= 0) return "Expired";
  const h = Math.floor(ms / H);
  if (h < 48) return `${h} hour${h === 1 ? "" : "s"} left`;
  return `${Math.floor(h / 24)} days left`;
}
