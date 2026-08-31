import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  return <div className="p-4">온보딩</div>;
}
