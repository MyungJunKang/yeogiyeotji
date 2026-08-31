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
    <main className="login-screen">
      <div className="login-aurora" aria-hidden="true">
        <span className="login-blob login-blob--again" />
        <span className="login-blob login-blob--okay" />
        <span className="login-blob login-blob--never" />
      </div>

      <div className="login-shell">
        <div className="login-content">
          <img
            className="login-logo login-logo--light"
            src="/icons/logo-mark.svg"
            alt="여기였지"
            width={60}
            height={60}
          />
          <img
            className="login-logo login-logo--dark"
            src="/icons/logo-mark-dark.svg"
            alt=""
            aria-hidden="true"
            width={60}
            height={60}
          />

          <h1 className="login-wordmark">여기였지</h1>
          <p className="login-tagline">
            또 갈지, 말지.
            <br />
            다녀온 곳에 남겨요.
          </p>
        </div>

        <div className="login-actions">
          <button
            type="button"
            onClick={() => void signInWithKakao(redirectTo)}
            className="kakao-button"
          >
            <svg
              className="kakao-symbol"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M12 3C6.48 3 2 6.48 2 10.77c0 2.73 1.86 5.13 4.66 6.5-.15.53-.98 3.37-1.02 3.6 0 0-.02.17.09.24.11.06.24.01.24.01.31-.04 3.6-2.36 4.17-2.76.6.08 1.22.13 1.86.13 5.52 0 10-3.48 10-7.77C22 6.48 17.52 3 12 3z" />
            </svg>
            카카오 로그인
          </button>
        </div>
      </div>
    </main>
  );
}
