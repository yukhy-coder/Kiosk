import { useState } from "react";
import { Back, Shell } from "../components/Shell";
import { pesos } from "../data";
import { useKiosk } from "../store";

const NAME_SUGGESTIONS = [
  "Alex Rivera",
  "Sam Taylor",
  "Morgan Chen",
  "Chris Santos",
];

const BALANCE_OPTIONS = [1000, 1500, 2000, 2500];

export function SignUp() {
  const { dispatch } = useKiosk();
  const [name, setName] = useState("Alex Rivera");
  const [id, setId] = useState(() => {
    // Generate a random unique 8-digit student ID starting with 2048
    return "2048" + Math.floor(1000 + Math.random() * 9000).toString();
  });
  const [balance, setBalance] = useState(1500);
  const [points, setPoints] = useState(500);
  const [error, setError] = useState("");

  function generateRandomId() {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    setId("2048" + randomSuffix);
    setError("");
  }

  function handleRegister() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter your student name.");
      return;
    }
    if (!/^\d{8}$/.test(id)) {
      setError("Student ID must be exactly 8 digits.");
      return;
    }

    dispatch({
      type: "registerStudent",
      student: {
        id,
        name: trimmedName,
        balance,
        points,
      },
    });
  }

  return (
    <Shell>
      <Back onClick={() => dispatch({ type: "go", screen: "signin" })}>
        Back to sign-in
      </Back>
      <h2 className="display">Register student ID.</h2>
      <p className="lede">
        Create an Alder University student account to use campus balance and Hawks rewards.
      </p>

      {error && (
        <div className="banner danger" style={{ marginBottom: 18 }}>
          <Warn />
          <div>
            <h3>Registration notice</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="field-card" style={{ marginBottom: 18 }}>
        <label htmlFor="student-name">Student full name</label>
        <input
          id="student-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError("");
          }}
          placeholder="e.g. Alex Rivera"
          className="id-box"
          style={{
            fontSize: 22,
            letterSpacing: "normal",
            width: "100%",
            outline: "none",
          }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <span className="tiny" style={{ alignSelf: "center", marginRight: 4 }}>
            Suggestions:
          </span>
          {NAME_SUGGESTIONS.map((sug) => (
            <button
              key={sug}
              type="button"
              className={`chip ${name === sug ? "on" : ""}`}
              style={{ height: 32, fontSize: 13, padding: "0 12px" }}
              onClick={() => {
                setName(sug);
                if (error) setError("");
              }}
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      <div className="field-card" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <label htmlFor="signup-id">8-digit Student ID</label>
          <button
            type="button"
            onClick={generateRandomId}
            style={{
              background: "none",
              border: 0,
              color: "var(--green)",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            🎲 Generate random ID
          </button>
        </div>
        <input
          id="signup-id"
          type="text"
          maxLength={8}
          value={id}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 8);
            setId(val);
            if (error) setError("");
          }}
          placeholder="e.g. 20481234"
          className="id-box"
          style={{ width: "100%", outline: "none" }}
        />
        <p className="tiny" style={{ marginTop: 8 }}>
          Alder student IDs typically begin with 2048 followed by 4 digits.
        </p>
      </div>

      <div className="two-col" style={{ marginBottom: 20 }}>
        <div className="field-card" style={{ margin: 0 }}>
          <label>Starting campus balance</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
            {BALANCE_OPTIONS.map((amt) => (
              <button
                key={amt}
                type="button"
                className={`card pay-opt ${balance === amt ? "selected" : ""}`}
                style={{ padding: "12px 14px", margin: 0, textAlign: "center" }}
                onClick={() => setBalance(amt)}
              >
                <div style={{ fontWeight: 700, fontSize: 18, color: "var(--ink)" }}>
                  {pesos(amt)}
                </div>
                <div className="tiny" style={{ fontSize: 12 }}>
                  {amt === 1500 ? "Standard" : "Custom"}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="field-card" style={{ margin: 0 }}>
          <label>Starting Hawks rewards points</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
            <button
              type="button"
              className={`card pay-opt ${points === 500 ? "selected" : ""}`}
              style={{ padding: "12px 14px", margin: 0, textAlign: "center" }}
              onClick={() => setPoints(500)}
            >
              <div style={{ fontWeight: 700, fontSize: 18, color: "var(--ink)" }}>
                500 points
              </div>
              <div className="tiny" style={{ fontSize: 12 }}>
                ₱100 credit ready!
              </div>
            </button>
            <button
              type="button"
              className={`card pay-opt ${points === 100 ? "selected" : ""}`}
              style={{ padding: "12px 14px", margin: 0, textAlign: "center" }}
              onClick={() => setPoints(100)}
            >
              <div style={{ fontWeight: 700, fontSize: 18, color: "var(--ink)" }}>
                100 points
              </div>
              <div className="tiny" style={{ fontSize: 12 }}>
                Starter tier
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="banner soft" style={{ marginBottom: 24 }}>
        <Shield />
        <div>
          <h3>Instant activation</h3>
          <p>
            Your account will be activated immediately with {pesos(balance)} campus balance and{" "}
            {points} Hawks points. You can use your student card at any kiosk.
          </p>
        </div>
      </div>

      <button
        className="btn primary wide"
        type="button"
        onClick={handleRegister}
        style={{ fontSize: 19 }}
      >
        Create student ID & shop →
      </button>
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
