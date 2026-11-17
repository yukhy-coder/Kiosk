import { Shell } from "../components/Shell";
import { useKiosk } from "../store";

export function Welcome() {
  const { dispatch } = useKiosk();
  return (
    <Shell>
      <img className="hero" src="/hero.jpg" alt="Alder campus store merch on a stone plinth" />
      <div className="features">
        <span>
          <Bag /> Shop campus favorites
        </span>
        <span>
          <Card /> Pay with campus balance
        </span>
        <span>
          <Gift /> Earn Hawks points
        </span>
      </div>
      <button className="btn primary wide" type="button" onClick={() => dispatch({ type: "go", screen: "signin" })}>
        Start with student ID →
      </button>
      <div style={{ height: 12 }} />
      <button className="btn ghost wide" type="button" onClick={() => dispatch({ type: "go", screen: "browse" })}>
        Browse merchandise first
      </button>
      <div style={{ marginTop: 12, textAlign: "center" }}>
        <button
          type="button"
          onClick={() => dispatch({ type: "go", screen: "signup" })}
          style={{
            background: "none",
            border: 0,
            color: "var(--green)",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          New student? Register student ID →
        </button>
      </div>
      <p className="fine">Student ID is required at checkout. No cash accepted.</p>
    </Shell>
  );
}

function Bag() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 8h12l-1 12H7L6 8Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function Card() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
function Gift() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="11" width="16" height="9" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 11h16M12 11v9M12 11c0-3 2-5 4.2-4 1.6.7 1.6 3.2.2 4M12 11c0-3-2-5-4.2-4-1.6.7-1.6 3.2-.2 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
