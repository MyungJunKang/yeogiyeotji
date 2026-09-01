import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../lib/auth";
import { profileQueryOptions } from "../lib/profile";
import { Splash } from "../components/Splash";

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { error?: string; redirect?: string } => ({
    error: typeof search.error === "string" ? search.error : undefined,
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, loading } = useAuth();
  const { error, redirect } = Route.useSearch();

  useEffect(() => {
    // OAuth 취소(사용자가 창을 닫음)는 에러로 취급하지 않고 로그인으로 되돌린다.
    if (error) {
      void navigate({ to: "/login", replace: true });
      return;
    }
    if (loading || !session) return;

    let active = true;
    void (async () => {
      const profile = await queryClient.ensureQueryData(
        profileQueryOptions(session.user.id),
      );
      if (!active) return;
      if (!profile) {
        await navigate({ to: "/onboarding", replace: true });
        return;
      }
      await navigate({ to: redirect ?? "/", replace: true });
    })();

    return () => {
      active = false;
    };
  }, [session, loading, error, redirect, navigate, queryClient]);

  return <Splash label="로그인 중…" />;
}
