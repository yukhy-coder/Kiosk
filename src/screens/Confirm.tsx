import { useEffect } from "react";
import { Shell } from "../components/Shell";
import { pesos } from "../data";
import { useKiosk } from "../store";

export function Confirm() {
  const { state, dispatch } = useKiosk();

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

  return (
    <Shell>
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
          <span>ORDER {order.id}</span>
        </div>
        <div className="code">{order.pickupCode.replace("-", "–")}</div>
        <div className="gold">Ready in about 5 minutes · North Hall counter</div>
      </div>

      <div className="next">
        <div>
          <h3 className="section-title">Here’s what happens next.</h3>
          <div className="next-item">
            <span className="step-num">1</span>
            <div>
              <strong>Head to the pickup counter</strong>
              <p className="tiny" style={{ marginTop: 2 }}>
                Look for the Hawks sign beside this kiosk.
              </p>
            </div>
          </div>
          <div className="next-item">
            <span className="step-num">2</span>
            <div>
              <strong>Show code {order.pickupCode}</strong>
              <p className="tiny" style={{ marginTop: 2 }}>
                Have your student ID ready for the associate.
              </p>
            </div>
          </div>
          <div className="next-item">
            <span className="step-num">3</span>
            <div>
              <strong>Collect your campus gear</strong>
              <p className="tiny" style={{ marginTop: 2 }}>
                Check your hoodie size before you head out.
              </p>
            </div>
          </div>
        </div>

        <div className="card summary">
          <h3 className="section-title" style={{ marginTop: 0, marginBottom: 12 }}>
            Receipt · {itemCount} items
          </h3>
          {order.items.map((i) => (
            <div className="row" key={i.name + (i.size ?? "")} style={{ margin: "6px 0" }}>
              <span style={{ color: "var(--ink)", fontWeight: 500 }}>
                {i.name}
                {i.size ? ` · ${i.size}` : ""}
              </span>
              <span style={{ color: "var(--ink)", fontWeight: 600 }}>{pesos(i.price)}</span>
            </div>
          ))}
          <div className="row" style={{ margin: "6px 0" }}>
            <span style={{ color: "var(--ink)", fontWeight: 500 }}>Campus tax</span>
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>{pesos(order.tax)}</span>
          </div>
          <div
            className="total"
            style={{
              fontSize: 22,
              marginTop: 12,
              paddingTop: 10,
              borderTop: "1px solid #eeeae0",
            }}
          >
            <span>Total paid·</span>
            <span>{pesos(order.total)}</span>
          </div>
          <p className="tiny" style={{ marginTop: 8 }}>
            Paid with {order.method === "balance" ? "campus balance" : "card"}
          </p>
          <p style={{ fontWeight: 700, marginTop: 6, color: "var(--ink)" }}>
            Balance left · {pesos(student.balance)}
          </p>
          <p className="tiny" style={{ marginTop: 8 }}>
            Receipt sent to your Alder student email.
          </p>
        </div>
      </div>

      <div className="banner soft" style={{ marginTop: 20 }}>
        <Shield />
        <div>
          <h3>
            {order.pointsEarned.toFixed(2)} points earned. That’s {student.points.toFixed(2)} Hawks
            points!
          </h3>
          <p>
            {student.points >= 500
              ? "You’ve unlocked ₱100 store credit. View Balance & Rewards to redeem it."
              : "Keep earning points with every purchase. View Balance & Rewards."}
          </p>
        </div>
      </div>

      <div className="btn-row" style={{ marginTop: 20 }}>
        <button
          className="btn ghost"
          type="button"
          onClick={() => dispatch({ type: "go", screen: "rewards" })}
        >
          Balance & rewards
        </button>
        <button className="btn primary" type="button" onClick={() => dispatch({ type: "end" })}>
          Done · End session ✓
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
