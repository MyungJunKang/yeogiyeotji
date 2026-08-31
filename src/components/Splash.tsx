export function Splash({ label = "불러오는 중…" }: { label?: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg text-fg">
      <span className="text-lg font-semibold">여기였지</span>
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}
