import { useKiosk, type Step } from "../store";
import { pesos } from "../data";

const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: "Browse" },
  { n: 2, label: "Select" },
  { n: 3, label: "Cart" },
  { n: 4, label: "Pay" },
  { n: 5, label: "Confirm" },
];

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2.5 7.2 5.5 10.2 11.5 3.8" stroke="#123d2c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Header() {
  const { state } = useKiosk();
  const signed = !!state.student;
  return (
    <header className="header">
      <div className="brand">
        <div className="logo">A</div>
        <div>
          <h1>ALDER UNIVERSITY</h1>
          <p>CAMPUS MERCHANDISE / NORTH HALL</p>
        </div>
      </div>
      <div className="header-right">
        {signed ? (
          <>
            <div className="hi">Hi, {state.student!.name}</div>
            <div className="gold">
              Campus balance {pesos(state.student!.balance).replace(".00", "")}
            </div>
          </>
        ) : (
          <>
            <div className="welcome-tag">WELCOME, ALDER HAWKS</div>
            <div className="welcome-sub">OFFICIAL CAMPUS STORE</div>
          </>
        )}
      </div>
    </header>
  );
}

export function Stepper() {
  const { step, state } = useKiosk();
  const paid = !!state.order;

  return (
    <nav className="stepper" aria-label="Checkout progress">
      {STEPS.map((s) => {
        const done = (paid && s.n < 5) || (!paid && s.n < step);
        const active = paid ? s.n === 5 : s.n === step;
        return (
          <div key={s.n} className={`step ${done ? "done" : ""} ${active ? "active" : ""}`}>
            <span className="dot">{done ? <Check /> : s.n}</span>
            <span className="label">{s.label}</span>
          </div>
        );
      })}
    </nav>
  );
}

export function Footer() {
  const { dispatch } = useKiosk();
  return (
    <footer className="footer">
      <button className="end" type="button" onClick={() => dispatch({ type: "end" })}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        End session
      </button>
      <span className="hint">Your session is private. End session when you’re done.</span>
      <button className="help-btn" type="button" onClick={() => dispatch({ type: "help", open: true })}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M9.5 9.5a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="17" r="1" fill="currentColor" />
        </svg>
        Help
      </button>
    </footer>
  );
}

export function HelpModal() {
  const { state, dispatch } = useKiosk();
  if (!state.help) return null;
  return (
    <div className="overlay" onClick={() => dispatch({ type: "help", open: false })}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>North Hall kiosk help</h3>
        <p>Pay with campus balance or a debit / credit card. Cash is not accepted.</p>
        <p>Pickup is at this counter, usually within five minutes of payment.</p>
        <p>Your student ID is only used for this session. End session when you are done.</p>
        <button
          className="btn primary wide"
          type="button"
          style={{ marginTop: 20 }}
          onClick={() => dispatch({ type: "help", open: false })}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="kiosk">
      <Header />
      <Stepper />
      <main className="content">{children}</main>
      <Footer />
      <HelpModal />
    </div>
  );
}

export function Back({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button className="back" type="button" onClick={onClick}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M15 6 9 12l6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      {children}
    </button>
  );
}
