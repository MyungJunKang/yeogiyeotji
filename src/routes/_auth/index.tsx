import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../lib/auth";

export const Route = createFileRoute("/_auth/")({
  component: HomePage,
});

function HomePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await signOut();
    queryClient.clear();
    await navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">여기였지</h1>
        <p className="mt-2 text-muted">지도 준비 중</p>
        <p className="mt-1 text-sm text-muted">{user?.email ?? user?.id}</p>
      </div>
      <button
        type="button"
        onClick={() => void handleLogout()}
        className="rounded-md border border-border px-4 py-2 text-sm"
      >
        로그아웃
      </button>
    </div>
  );
}
