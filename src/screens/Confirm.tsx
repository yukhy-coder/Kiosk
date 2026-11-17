import { useEffect, useState } from "react";
import { Shell } from "../components/Shell";
import { pesos } from "../data";
import { useKiosk } from "../store";
import { playTap, playSuccess } from "../utils/sound";

export function Confirm() {
  const { state, dispatch } = useKiosk();
  const [printed, setPrinted] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Guard: if no order or student, return to welcome
  useEffect(() => {
    if (!state.order || !state.student) {
      dispatch({ type: "go", screen: "welcome" });
    }
  }, [state.order, state.student, dispatch]);

  if (!state.order || !state.student) return null;

  const order = state.order;
  const student = state.student;
  const itemCount = order.items.reduce((acc, item) => acc + item.qty, 0);
  const studentEmail = `${student.name.toLowerCase().replace(/[^a-z0-9]/g, ".")}@alder.edu`;

  return (
    <Shell>
      {/* Confetti Celebration Elements */}
      <div className="confetti-container" aria-hidden>
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className={`confetti-piece color-${i % 4}`}
            style={{
              left: `${(i * 4.2 + 2)}%`,
              animationDelay: `${(i % 6) * 0.15}s`,
              animationDuration: `${1.8 + (i % 5) * 0.25}s`,
            }}
          />
        ))}
      </div>

      <div className="success-row">
        <div className="check-lg">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="m5 12 5 5L20 7"
              stroke="white"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p className="kicker">PAYMENT SUCCESSFUL</p>
          <h2 className="display" style={{ fontSize: 36, margin: "2px 0 0" }}>
            You’re officially geared up.
          </h2>
        </div>
      </div>

      <div className="pickup">
        <div className="over">
          <span>YOUR PICKUP CODE</span>
          <span>ORDER #{order.id}</span>
        </div>
        <div className="code">{order.pickupCode.replace("-", "–")}</div>
        <div className="gold">Ready in about 5 minutes · North Hall Counter</div>
      </div>

      <div className="next">
        <div>
          <h3 className="section-title">Here’s what happens next.</h3>
          <div className="next-item">
            <span className="step-num">1</span>
            <div>
              <strong>Head to the pickup counter</strong>
              <p className="tiny" style={{ marginTop: 2 }}>
                Look for the North Hall Hawks sign right beside this kiosk.
              </p>
            </div>
          </div>
          <div className="next-item">
            <span className="step-num">2</span>
            <div>
              <strong>Show code {order.pickupCode}</strong>
              <p className="tiny" style={{ marginTop: 2 }}>
                Have your Alder student ID ready for the associate.
              </p>
            </div>
          </div>
          <div className="next-item">
            <span className="step-num">3</span>
            <div>
              <strong>Collect your official Alder gear</strong>
              <p className="tiny" style={{ marginTop: 2 }}>
                Inspect your items before you head out to class.
              </p>
            </div>
          </div>

          {/* Action buttons under next steps */}
          <div className="receipt-actions-box">
            <button
              className={`btn ${printed ? "ghost" : "primary"} wide`}
              type="button"
              onClick={() => {
                playSuccess();
                setPrinted(true);
              }}
            >
              {printed ? "✓ Physical Receipt Printed" : "🖨️ Print Paper Receipt"}
            </button>

            <button
              className="btn ghost wide"
              type="button"
              style={{ marginTop: 10 }}
              onClick={() => {
                playTap();
                setEmailSent(true);
              }}
            >
              {emailSent ? `✓ Sent to ${studentEmail}` : `📧 Email Copy to ${studentEmail}`}
            </button>
          </div>
        </div>

        {/* Physical Thermal Paper Receipt Styled Box */}
        <div className="thermal-receipt">
          <div className="receipt-header">
            <div className="receipt-logo">★ ALDER UNIVERSITY ★</div>
            <div className="receipt-store">NORTH HALL CAMPUS MERCHANDISE</div>
            <div className="receipt-sub">KIOSK #01 · TAX INVOICE</div>
          </div>

          <div className="receipt-divider">- - - - - - - - - - - - - - - - - - - - - - -</div>

          <div className="receipt-meta">
            <div>ORDER: #{order.id} ({itemCount} ITEMS)</div>
            <div>DATE: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div>STUDENT: {student.name}</div>
            <div>ID: •••• {student.id.slice(-4)}</div>
          </div>

          <div className="receipt-divider">- - - - - - - - - - - - - - - - - - - - - - -</div>

          <div className="receipt-items">
            {order.items.map((i, idx) => (
              <div className="receipt-line" key={idx}>
                <span className="receipt-name">
                  {i.qty}x {i.name} {i.size ? `(${i.size})` : ""}
                </span>
                <span className="receipt-price">{pesos(i.price)}</span>
              </div>
            ))}
          </div>

          <div className="receipt-divider">- - - - - - - - - - - - - - - - - - - - - - -</div>

          <div className="receipt-line">
            <span>Subtotal:</span>
            <span>{pesos(order.subtotal)}</span>
          </div>
          <div className="receipt-line">
            <span>Campus Tax (5%):</span>
            <span>{pesos(order.tax)}</span>
          </div>
          <div className="receipt-line receipt-total-line">
            <span>TOTAL:</span>
            <span>{pesos(order.total)}</span>
          </div>

          <div className="receipt-divider">- - - - - - - - - - - - - - - - - - - - - - -</div>

          <div className="receipt-meta" style={{ textAlign: "center" }}>
            <div>PAYMENT: {order.method === "balance" ? "CAMPUS BALANCE" : "DEBIT/CREDIT CARD"}</div>
            <div>CAMPUS BALANCE LEFT: {pesos(student.balance)}</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>POINTS EARNED: +{order.pointsEarned.toFixed(2)} PTS</div>
          </div>

          {/* Barcode visual */}
          <div className="receipt-barcode" aria-hidden>
            <div className="barcode-bars" />
            <span className="barcode-num">ALD-{order.id}-{order.pickupCode}</span>
          </div>

          <div className="receipt-footer">
            THANK YOU FOR SUPPORTING ALDER ATHLETICS
            <br />
            GO HAWKS!
          </div>
        </div>
      </div>

      <div className="banner soft" style={{ marginTop: 20 }}>
        <Shield />
        <div>
          <h3>
            +{order.pointsEarned.toFixed(2)} points earned! You now have {student.points.toFixed(2)} Hawks points.
          </h3>
          <p>
            {student.points >= 500
              ? "🎉 You’ve unlocked a ₱100 store credit reward! View your Balance & Rewards to redeem it."
              : "Every purchase earns 1 point per ₱10 spent. Check your rewards tier anytime."}
          </p>
        </div>
      </div>

      <div className="btn-row" style={{ marginTop: 24 }}>
        <button
          className="btn ghost"
          type="button"
          onClick={() => {
            playTap();
            dispatch({ type: "go", screen: "rewards", returnTo: null });
          }}
        >
          View Balance & Rewards
        </button>
        <button
          className="btn primary"
          type="button"
          onClick={() => {
            playTap();
            dispatch({ type: "end" });
          }}
        >
          Done · End Session ✓
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
