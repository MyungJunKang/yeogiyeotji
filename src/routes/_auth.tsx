import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { profileQueryOptions } from "../lib/profile";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context, location }) => {
    const session = context.auth.session;
    if (!session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }

    // 세션은 있는데 Profile 행이 없으면 온보딩으로. (완료 판정은 행 존재 여부)
    const profile = await context.queryClient.ensureQueryData(
      profileQueryOptions(session.user.id),
    );
    if (!profile) {
      throw redirect({ to: "/onboarding" });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
