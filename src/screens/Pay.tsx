import { useEffect } from "react";
import { Back, Shell } from "../components/Shell";
import { pesos, products } from "../data";
import { useKiosk } from "../store";

export function Pay() {
  const { state, dispatch, totals } = useKiosk();

  // Guard: if no student or empty cart, redirect
  useEffect(() => {
    if (!state.student) {
      dispatch({ type: "go", screen: "signin" });
    } else if (state.cart.length === 0 && state.payStatus !== "processing" && !state.order) {
      dispatch({ type: "go", screen: "cart" });
    }
  }, [state.student, state.cart.length, state.payStatus, state.order, dispatch]);

  if (!state.student || state.cart.length === 0) return null;

  const student = state.student;
  const processing = state.payStatus === "processing";
  const declined = state.payStatus === "declined";
  const canBalance = student.balance >= totals.total;
  const insufficient =
    state.payStatus === "insufficient" ||
    (state.payMethod === "balance" && !canBalance);

  const after = Math.round((student.balance - totals.total) * 100) / 100;
  const short = Math.round((totals.total - student.balance) * 100) / 100;

  useEffect(() => {
    if (processing) {
      const timer = setTimeout(() => {
        dispatch({ type: "payResult", result: "ok" });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [processing, dispatch]);

  const title = processing
    ? "Taking care of your order."
    : "One last thing. Make it yours.";
  const lede = processing
    ? "Keep your student card with you. Please don’t leave this screen."
    : "Choose how to pay. Your gear is almost ready for pickup.";

  const orderItems = state.cart.map((item) => {
    const p = products.find((x) => x.id === item.productId)!;
    return {
      name: p.name,
      qty: item.qty,
      size: item.size,
      variantLabel: p.variantLabel,
      price: p.price * item.qty,
    };
  });

  return (
    <Shell>
      <Back onClick={() => !processing && dispatch({ type: "go", screen: "cart" })}>
        Back to cart
      </Back>
      <h2 className="display">{title}</h2>
      <p className="lede">{lede}</p>

      {processing ? (
        <div className="banner soft">
          <Clock />
          <div>
            <h3>Processing · Please wait</h3>
            <p>
              Authorizing {pesos(totals.total)} from{" "}
              {state.payMethod === "card" ? "your card" : "campus balance"}. This usually takes a
              few seconds. Do not tap again.
            </p>
          </div>
        </div>
      ) : declined ? (
        <div className="banner danger">
          <Warn />
          <div>
            <h3>Your card payment was declined</h3>
            <p>
              No payment was taken. Try a different card, or use your {pesos(student.balance)} campus
              balance.
            </p>
          </div>
        </div>
      ) : insufficient && state.payMethod === "balance" ? (
        <div className="banner danger">
          <Warn />
          <div>
            <h3>Not enough available campus balance</h3>
            <p>
              {pesos(student.balance)} is available. You need {pesos(short)} more. Choose a bank card
              or add funds at the campus card office.
            </p>
          </div>
        </div>
      ) : (
        <div className="banner soft">
          <Shield />
          <div>
            <h3>Secure checkout</h3>
            <p>Your purchase is protected. A receipt and pickup code appear after payment.</p>
          </div>
        </div>
      )}

      <div className="two-col">
        <div>
          <h3 className="section-title">Payment method</h3>
          <button
            type="button"
            className={`card pay-opt ${state.payMethod === "balance" ? "selected" : ""}`}
            disabled={processing}
            onClick={() => dispatch({ type: "setPayMethod", method: "balance" })}
          >
            <div className="top">
              <strong>
                <CardI /> Campus balance
              </strong>
              <span className={`radio ${state.payMethod === "balance" ? "on" : ""}`} />
            </div>
            <div className="amt">{pesos(student.balance)}</div>
            <p className="tiny">Available to spend: {pesos(student.balance)}</p>
            {canBalance ? (
              <p style={{ fontWeight: 700, marginTop: 8 }}>After this order: {pesos(after)}</p>
            ) : (
              <p className="warn" style={{ marginTop: 8 }}>
                Insufficient · {pesos(short)} short
              </p>
            )}
          </button>

          <button
            type="button"
            className={`card pay-opt ${state.payMethod === "card" ? "selected" : ""}`}
            disabled={processing}
            onClick={() => dispatch({ type: "setPayMethod", method: "card" })}
          >
            <div className="top">
              <strong>
                <Bank /> Debit / credit card
              </strong>
              <span className={`radio ${state.payMethod === "card" ? "on" : ""}`} />
            </div>
            {declined ? (
              <>
                <p style={{ margin: "8px 0 4px", fontWeight: 500 }}>
                  Visa •••• 4242 · Declined
                </p>
                <p className="tiny">Visa · Mastercard · Apple Pay</p>
                <p style={{ fontWeight: 700, marginTop: 10 }}>
                  Full card payment: {pesos(totals.total)}
                </p>
              </>
            ) : (
              <>
                <p style={{ margin: "8px 0 4px", fontWeight: 500 }}>
                  Tap or insert at the card reader
                </p>
                <p className="tiny">Visa · Mastercard · Apple Pay</p>
                {state.payMethod === "card" ? (
                  <p style={{ fontWeight: 700, marginTop: 10 }}>
                    Full card payment: {pesos(totals.total)}
                  </p>
                ) : null}
              </>
            )}
          </button>
          <p className="tiny" style={{ marginTop: 12 }}>
            One payment method per order. No split payments or cash.
          </p>
        </div>

        <div>
          <div className="banner soft" style={{ display: "block", marginBottom: 14 }}>
            <h3 style={{ marginBottom: 8 }}>Your order</h3>
            {orderItems.map((item, idx) => (
              <p key={idx} style={{ marginTop: 8, color: "var(--ink)", fontSize: 15 }}>
                {item.qty} × {item.name}
                {item.size ? ` · ${item.size}` : item.variantLabel ? ` · ${item.variantLabel}` : ""}
                <br />
                <span style={{ fontWeight: 600 }}>{pesos(item.price)}</span>
              </p>
            ))}
            <p className="tiny" style={{ marginTop: 12, lineHeight: 1.4 }}>
              North Hall pickup
              <br />
              Ready in about 5 minutes
            </p>
          </div>

          <div className="card summary">
            <h3 className="section-title" style={{ marginTop: 0, marginBottom: 12 }}>
              Order summary · {totals.count} items
            </h3>
            <div className="row">
              <span>Subtotal</span>
              <span>{pesos(totals.subtotal)}</span>
            </div>
            <div className="row">
              <span>Campus tax · 5%</span>
              <span>{pesos(totals.tax)}</span>
            </div>
            <div
              className="total"
              style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #eeeae0" }}
            >
              <span>Total</span>
              <span>{pesos(totals.total)}</span>
            </div>
          </div>
          <p className="points-note">+{totals.pointsEarned.toFixed(2)} Hawks points on purchase</p>
        </div>
      </div>

      {processing ? (
        <>
          <div className="processing-bar">
            Processing payment… <span className="spin" />
          </div>
          <p className="fine" style={{ marginTop: 14 }}>
            Please wait for your confirmation before collecting your items.
          </p>
        </>
      ) : declined ? (
        <div className="btn-row" style={{ marginTop: 24 }}>
          <button
            className="btn ghost"
            type="button"
            onClick={() => dispatch({ type: "setPayMethod", method: "balance" })}
          >
            Use campus balance
          </button>
          <button
            className="btn primary"
            type="button"
            onClick={() => dispatch({ type: "beginPay" })}
          >
            Try a different card <Lock />
          </button>
        </div>
      ) : insufficient && !canBalance ? (
        <div className="btn-row" style={{ marginTop: 24 }}>
          <button
            className="btn ghost"
            type="button"
            onClick={() => dispatch({ type: "go", screen: "cart" })}
          >
            Review cart
          </button>
          <button
            className="btn primary"
            type="button"
            onClick={() => {
              dispatch({ type: "setPayMethod", method: "card" });
              dispatch({ type: "beginPay" });
            }}
          >
            Pay {pesos(totals.total)} by card <Lock />
          </button>
        </div>
      ) : (
        <div className="btn-row" style={{ marginTop: 24 }}>
          <button
            className="btn ghost"
            type="button"
            onClick={() => dispatch({ type: "go", screen: "cart" })}
          >
            Review cart
          </button>
          <button
            className="btn primary"
            type="button"
            onClick={() => dispatch({ type: "beginPay" })}
          >
            {state.payMethod === "balance"
              ? `Pay ${pesos(totals.total)} · Campus balance`
              : `Pay ${pesos(totals.total)} by card`}{" "}
            <Lock />
          </button>
        </div>
      )}
    </Shell>
  );
}

function Lock() {
  return (
    <svg className="lock" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
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

function Clock() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="#1a4d38" strokeWidth="1.7" />
      <path d="M12 7v5l3 2" stroke="#1a4d38" strokeWidth="1.7" strokeLinecap="round" />
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

function CardI() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{ marginRight: 6, verticalAlign: "-3px" }}
    >
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function Bank() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{ marginRight: 6, verticalAlign: "-3px" }}
    >
      <rect x="3" y="8" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
