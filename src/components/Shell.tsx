import { useState, useEffect, useRef } from "react";
import { useKiosk, type Step } from "../store";
import { pesos } from "../data";
import { isSoundEnabled, toggleSound, playTap } from "../utils/sound";

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
  const { state, dispatch } = useKiosk();
  const signed = !!state.student;
  const processing = state.payStatus === "processing";

  return (
    <header className="header">
      <div
        className="brand"
        onClick={() => {
          if (!processing && state.screen !== "welcome") {
            playTap();
            dispatch({ type: "go", screen: "browse" });
          }
        }}
        style={{ cursor: state.screen !== "welcome" && !processing ? "pointer" : "default" }}
      >
        <div className="logo">A</div>
        <div>
          <h1>ALDER UNIVERSITY</h1>
          <p>CAMPUS MERCHANDISE / NORTH HALL</p>
        </div>
      </div>
      <div className="header-right">
        {signed ? (
          <button
            type="button"
            className="header-account-btn"
            disabled={processing}
            onClick={() => {
              playTap();
              if (state.screen !== "rewards") {
                dispatch({ type: "go", screen: "rewards", returnTo: state.screen });
              }
            }}
            title="View Balance & Rewards"
          >
            <div className="hi">Hi, {state.student!.name}</div>
            <div className="gold">
              Campus balance {pesos(state.student!.balance)}
              <span className="badge-arrow">· Rewards →</span>
            </div>
          </button>
        ) : (
          <div
            className="header-welcome-box"
            onClick={() => {
              if (state.screen === "browse" || state.screen === "welcome") {
                playTap();
                dispatch({ type: "go", screen: "signin" });
              }
            }}
            style={{ cursor: "pointer" }}
            title="Student Sign In"
          >
            <div className="welcome-tag">WELCOME, ALDER HAWKS</div>
            <div className="welcome-sub">STUDENT SIGN IN →</div>
          </div>
        )}
      </div>
    </header>
  );
}

export function Stepper() {
  const { step, state, dispatch } = useKiosk();
  const paid = !!state.order;

  return (
    <nav className="stepper" aria-label="Checkout progress">
      {STEPS.map((s) => {
        const done = (paid && s.n < 5) || (!paid && s.n < step);
        const active = paid ? s.n === 5 : s.n === step;
        const canClick =
          !paid &&
          state.payStatus !== "processing" &&
          ((s.n === 1 && state.screen !== "browse") ||
            (s.n === 3 && state.cart.length > 0 && state.screen !== "cart"));

        return (
          <div
            key={s.n}
            className={`step ${done ? "done" : ""} ${active ? "active" : ""} ${canClick ? "clickable" : ""}`}
            onClick={() => {
              if (canClick) {
                playTap();
                if (s.n === 1) dispatch({ type: "go", screen: "browse" });
                else if (s.n === 3) dispatch({ type: "go", screen: "cart" });
              }
            }}
          >
            <span className="dot">{done ? <Check /> : s.n}</span>
            <span className="label">{s.label}</span>
          </div>
        );
      })}
    </nav>
  );
}

export function Footer() {
  const { dispatch, state } = useKiosk();
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const processing = state.payStatus === "processing";

  return (
    <footer className="footer">
      <button
        className="end"
        type="button"
        disabled={processing}
        onClick={() => {
          playTap();
          dispatch({ type: "end" });
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        End session
      </button>

      <span className="hint">Your session is private. End session when you’re done.</span>

      <div className="footer-actions">
        <button
          className="sound-toggle-btn"
          type="button"
          onClick={() => {
            const next = toggleSound();
            setSoundOn(next);
          }}
          title={soundOn ? "Mute kiosk sounds" : "Enable tactile sounds"}
        >
          {soundOn ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
          <span>{soundOn ? "Sound" : "Muted"}</span>
        </button>

        <button
          className="help-btn"
          type="button"
          onClick={() => {
            playTap();
            dispatch({ type: "help", open: true });
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M9.5 9.5a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="17" r="1" fill="currentColor" />
          </svg>
          Help
        </button>
      </div>
    </footer>
  );
}

export function HelpModal() {
  const { state, dispatch } = useKiosk();
  const [associateCalled, setAssociateCalled] = useState(false);

  if (!state.help) return null;

  return (
    <div className="overlay" onClick={() => dispatch({ type: "help", open: false })}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>North Hall Kiosk Help & Support</h3>
        <p><strong>Payment Methods:</strong> Pay with Alder campus card balance or Visa, Mastercard, Apple Pay. Cash is not accepted at this terminal.</p>
        <p><strong>Pickup Location:</strong> Merch counter directly beside this kiosk. Orders are packed and ready in approximately 5 minutes.</p>
        <p><strong>Student ID:</strong> Your ID is securely loaded for this active session only. Always tap "End session" when finished.</p>

        {associateCalled ? (
          <div className="banner soft" style={{ marginTop: 16 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="var(--green)" strokeWidth="2" />
              <path d="m8 12 2.6 2.6L16 9.4" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div>
              <h3 style={{ fontSize: 16 }}>Associate Notified</h3>
              <p>A North Hall team member has been alerted and will arrive at Kiosk #1 momentarily.</p>
            </div>
          </div>
        ) : (
          <button
            className="btn ghost wide"
            type="button"
            style={{ marginTop: 16 }}
            onClick={() => {
              playTap();
              setAssociateCalled(true);
            }}
          >
            🔔 Call Store Associate to Kiosk
          </button>
        )}

        <button
          className="btn primary wide"
          type="button"
          style={{ marginTop: 12 }}
          onClick={() => {
            playTap();
            dispatch({ type: "help", open: false });
          }}
        >
          Return to Shopping
        </button>
      </div>
    </div>
  );
}

export function ToastBanner() {
  const { state } = useKiosk();
  if (!state.toast) return null;

  return (
    <div className="kiosk-toast" role="status" aria-live="polite">
      <span className="toast-icon">✓</span>
      <span>{state.toast}</span>
    </div>
  );
}

export function IdleTimeoutModal() {
  const { state, dispatch } = useKiosk();
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [showWarning, setShowWarning] = useState(false);
  const idleTimerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const resetTimer = () => {
    if (showWarning) return; // Keep warning visible once triggered
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    // In kiosk mode: warning appears after 75s of idle if signed in
    if (state.student && state.screen !== "welcome" && state.payStatus !== "processing") {
      idleTimerRef.current = window.setTimeout(() => {
        setShowWarning(true);
        setSecondsLeft(15);
      }, 75000);
    }
  };

  useEffect(() => {
    const events = ["mousedown", "touchstart", "keydown", "scroll"];
    events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [state.student, state.screen, state.payStatus]);

  useEffect(() => {
    if (showWarning) {
      countdownRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            setShowWarning(false);
            dispatch({ type: "end" });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [showWarning, dispatch]);

  if (!showWarning) return null;

  return (
    <div className="overlay" style={{ zIndex: 1000 }}>
      <div className="modal" style={{ textAlign: "center", maxWidth: 440 }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>⏳</div>
        <h3 style={{ fontSize: 26, margin: "0 0 10px" }}>Are you still here?</h3>
        <p style={{ fontSize: 16, color: "#4d5c54" }}>
          To protect your campus card balance and student privacy, this session will end automatically in:
        </p>
        <div style={{ fontSize: 40, fontWeight: 800, color: "var(--gold)", margin: "16px 0" }}>
          {secondsLeft}s
        </div>
        <div className="btn-row" style={{ marginTop: 20 }}>
          <button
            className="btn ghost"
            type="button"
            onClick={() => {
              playTap();
              setShowWarning(false);
              dispatch({ type: "end" });
            }}
          >
            End Now
          </button>
          <button
            className="btn primary"
            type="button"
            onClick={() => {
              playTap();
              setShowWarning(false);
              resetTimer();
            }}
          >
            Keep Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="kiosk">
      <ToastBanner />
      <Header />
      <Stepper />
      <main className="content">{children}</main>
      <Footer />
      <HelpModal />
      <IdleTimeoutModal />
    </div>
  );
}

export function Back({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button className="back" type="button" onClick={() => { playTap(); onClick(); }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M15 6 9 12l6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      {children}
    </button>
  );
}
