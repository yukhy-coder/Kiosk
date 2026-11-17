import { useState } from "react";
import { Back, Shell } from "../components/Shell";
import { useKiosk, lookupStudent } from "../store";
import { playKeypad, playTap, playError, playSuccess } from "../utils/sound";

export function SignIn() {
  const { state, dispatch } = useKiosk();
  const [id, setId] = useState("");
  const [isError, setIsError] = useState(false);

  function key(k: string) {
    if (isError) {
      setIsError(false);
    }
    if (k === "C") {
      playTap();
      setId("");
    } else if (k === "D") {
      playTap();
      setId((v) => v.slice(0, -1));
    } else {
      playKeypad(500 + Number(k) * 35);
      setId((v) => (v.length >= 8 ? v : v + k));
    }
  }

  function handleContinue() {
    if (id.length !== 8) return;
    const student = lookupStudent(id);
    if (!student) {
      playError();
      setIsError(true);
      return;
    }
    playSuccess();
    dispatch({ type: "signIn", id });
  }

  const backTarget = state.returnTo ? "cart" : "welcome";
  const backLabel = state.returnTo ? "Back to cart" : "Back to welcome";

  return (
    <Shell>
      <Back onClick={() => { playTap(); dispatch({ type: "go", screen: backTarget, returnTo: null }); }}>
        {backLabel}
      </Back>
      <h2 className="display">Let's make it yours.</h2>
      <p className="lede">Enter your 8-digit student ID to use campus balance and rewards.</p>
      
      <div className="field-card">
        <label htmlFor="sid">Student ID</label>
        <div className={`id-box ${isError ? "has-error" : ""}`} id="sid">
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>
            {id || "\u00A0"}
          </span>
          {isError ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="var(--danger)" strokeWidth="1.8" />
              <path d="M12 7.5v6" stroke="var(--danger)" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="16.5" r=".9" fill="var(--danger)" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: "#8a968e" }}>
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="8.5" cy="11" r="2" stroke="currentColor" strokeWidth="1.7" />
              <path d="M13.5 10h4M13.5 13.5h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <p className="tiny" style={{ marginTop: 10 }}>
          Find this number on the front of your Alder student card.
        </p>
      </div>

      {isError ? (
        <div className="banner danger" style={{ flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <Warn />
            <div>
              <h3>We couldn't find that student ID</h3>
              <p>Check all 8 digits, or register this ID to create a new student card.</p>
            </div>
          </div>
          <button
            type="button"
            className="btn ghost"
            style={{ height: 42, fontSize: 15, alignSelf: "flex-start", marginLeft: 36 }}
            onClick={() => {
              playTap();
              dispatch({ type: "go", screen: "signup" });
            }}
          >
            Register ID "{id}" now →
          </button>
        </div>
      ) : (
        <div className="banner soft">
          <Shield />
          <div>
            <h3>Secure student sign-in</h3>
            <p>We only use your ID to find your account. Your details clear when you end your session.</p>
          </div>
        </div>
      )}

      <div className="pad">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "Clear", "0", "Delete"].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => key(k === "Clear" ? "C" : k === "Delete" ? "D" : k)}
          >
            {k === "Delete" ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M7 6H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7l-5-6 5-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="m11 9 5 6M16 9l-5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Delete
              </span>
            ) : (
              k
            )}
          </button>
        ))}
      </div>

      <button
        className="btn primary wide"
        type="button"
        disabled={id.length !== 8}
        onClick={handleContinue}
      >
        {isError ? "Try student ID again →" : "Continue to campus store →"}
      </button>

      <div style={{ marginTop: 14, textAlign: "center" }}>
        <button
          type="button"
          onClick={() => {
            playTap();
            dispatch({ type: "go", screen: "signup" });
          }}
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
          Don't have an ID? Register student card →
        </button>
      </div>
    </Shell>
  );
}

function Shield() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="#1a4d38" strokeWidth="1.7" />
      <path d="m8 12 2.6 2.6L16 9.4" stroke="#1a4d38" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Warn() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="var(--danger)" strokeWidth="1.7" />
      <path d="M12 7.5v6" stroke="var(--danger)" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r=".9" fill="var(--danger)" />
    </svg>
  );
}
