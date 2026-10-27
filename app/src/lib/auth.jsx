import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { pb } from "./pb.js";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (pb.authStore.isValid ? pb.authStore.record : null));

  useEffect(() => {
    if (pb.authStore.isValid) {
      pb.collection("members")
        .authRefresh()
        .catch(() => pb.authStore.clear());
    }
    const off = pb.authStore.onChange(() => setUser(pb.authStore.isValid ? pb.authStore.record : null));
    return () => off();
  }, []);

  const signIn = useCallback(async (email, password) => {
    await pb.collection("members").authWithPassword(email.trim(), password);
  }, []);

  const signUp = useCallback(async (name, email, password) => {
    await pb.collection("members").create({
      name: name.trim(),
      email: email.trim(),
      password,
      passwordConfirm: password,
    });
    await pb.collection("members").authWithPassword(email.trim(), password);
  }, []);

  const signOut = useCallback(() => pb.authStore.clear(), []);

  const value = useMemo(() => ({ user, signIn, signUp, signOut }), [user, signIn, signUp, signOut]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}

/** Turn a failed request into a short, kind sentence. */
export function friendlyError(e, fallback = "Something went wrong. Please try again.") {
  const d = e?.response?.data;
  if (d && typeof d === "object") {
    const first = Object.values(d)[0];
    if (first?.message) {
      const key = Object.keys(d)[0];
      if (key === "email") return "That email address can’t be used. It may already have an account, or it may be mistyped.";
      if (key === "password") return "Please choose a password with at least 8 characters.";
      return first.message;
    }
  }
  if (e?.status === 400 && e?.response?.message?.includes("authenticate")) return "That email and password don’t match.";
  if (e?.status === 0) return "We couldn’t reach the server. Check your connection and try again.";
  return fallback;
}
