import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Provider, Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithKakao: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

function signInWithOAuth(provider: Provider, redirectTo?: string) {
  const callback = new URL("/auth/callback", window.location.origin);
  if (redirectTo) {
    callback.searchParams.set("redirect", redirectTo);
  }
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callback.toString() },
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signInWithKakao: async (redirectTo?: string) => {
        await signInWithOAuth("kakao", redirectTo);
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있습니다.");
  }
  return ctx;
}
