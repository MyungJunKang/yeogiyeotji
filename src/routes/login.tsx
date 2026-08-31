import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuth } from "../lib/auth";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  beforeLoad: ({ context }) => {
    if (context.auth.session) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const { signInWithKakao } = useAuth();
  const { redirect: redirectTo } = Route.useSearch();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-10 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">여기였지</h1>
        <p className="mt-2 text-muted">가본 곳을 기록하는 개인 지도</p>
      </div>
      <button
        type="button"
        onClick={() => void signInWithKakao(redirectTo)}
        className="flex w-full max-w-xs items-center justify-center rounded-md bg-kakao py-3 font-medium text-kakao-label"
      >
        카카오 로그인
      </button>
    </div>
  );
}
