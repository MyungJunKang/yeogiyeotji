export function Splash({ label = "불러오는 중…" }: { label?: string }) {
  return (
    <div className="splash-screen">
      <div className="splash-inner">
        <img
          className="splash-logo splash-logo--light"
          src="/icons/logo-mark.svg"
          alt="여기였지"
          width={52}
          height={52}
        />
        <img
          className="splash-logo splash-logo--dark"
          src="/icons/logo-mark-dark.svg"
          alt=""
          aria-hidden="true"
          width={52}
          height={52}
        />
        <span className="splash-wordmark">여기였지</span>
        <div className="splash-status">
          <span className="splash-spinner" aria-hidden="true" />
          <span className="splash-label">{label}</span>
        </div>
      </div>
    </div>
  );
}
