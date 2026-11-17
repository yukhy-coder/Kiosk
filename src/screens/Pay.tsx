import { useEffect, useState } from "react";
import { Back, Shell } from "../components/Shell";
import { pesos, products } from "../data";
import { useKiosk } from "../store";
import { playTap } from "../utils/sound";

export function Pay() {
  const { state, dispatch, totals } = useKiosk();
  const [showTopUpModal, setShowTopUpModal] = useState(false);

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
          <div style={{ flex: 1 }}>
            <h3>Not enough available campus balance</h3>
            <p>
              {pesos(student.balance)} is available. You need {pesos(short)} more. Choose a bank card
              or reload your campus card instantly below.
            </p>
            <button
              className="btn ghost"
              type="button"
              style={{ marginTop: 10, padding: "8px 16px", fontSize: 14 }}
              onClick={() => {
                playTap();
                setShowTopUpModal(true);
              }}
            >
              + Quick Reload Campus Balance
            </button>
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

          {/* Option 1: Campus Balance */}
          <button
            type="button"
            className={`card pay-opt ${state.payMethod === "balance" ? "selected" : ""}`}
            disabled={processing}
            onClick={() => {
              playTap();
              dispatch({ type: "setPayMethod", method: "balance" });
            }}
          >
            <div className="top">
              <strong>
                <CardI /> Alder Campus Balance
              </strong>
              <span className={`radio ${state.payMethod === "balance" ? "on" : ""}`} />
            </div>
            <div className="amt">{pesos(student.balance)}</div>
            <p className="tiny">Available to spend: {pesos(student.balance)}</p>
            {canBalance ? (
              <p style={{ fontWeight: 700, marginTop: 8, color: "var(--green)" }}>
                After this order: {pesos(after)}
              </p>
            ) : (
              <div style={{ marginTop: 8 }}>
                <p className="warn">Insufficient · {pesos(short)} short</p>
                <span
                  className="quick-reload-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    playTap();
                    setShowTopUpModal(true);
                  }}
                >
                  Reload balance →
                </span>
              </div>
            )}
          </button>

          {/* Option 2: Debit / Credit Card / Apple Pay */}
          <button
            type="button"
            className={`card pay-opt ${state.payMethod === "card" ? "selected" : ""}`}
            disabled={processing}
            onClick={() => {
              playTap();
              dispatch({ type: "setPayMethod", method: "card" });
            }}
          >
            <div className="top">
              <strong>
                <Bank /> Debit / Credit / Apple Pay
              </strong>
              <span className={`radio ${state.payMethod === "card" ? "on" : ""}`} />
            </div>
            {declined ? (
              <>
                <p style={{ margin: "8px 0 4px", fontWeight: 500, color: "var(--danger)" }}>
                  Visa •••• 4242 · Declined
                </p>
                <p className="tiny">Visa · Mastercard · Apple Pay · GPay</p>
                <p style={{ fontWeight: 700, marginTop: 10 }}>
                  Full card payment: {pesos(totals.total)}
                </p>
              </>
            ) : (
              <>
                <p style={{ margin: "8px 0 4px", fontWeight: 500 }}>
                  Tap card or device at the reader below
                </p>
                <p className="tiny">Visa · Mastercard · Apple Pay · Contactless</p>
                {state.payMethod === "card" ? (
                  <p style={{ fontWeight: 700, marginTop: 10 }}>
                    Full card payment: {pesos(totals.total)}
                  </p>
                ) : null}
              </>
            )}
          </button>

          {/* Contactless Hardware Terminal Mockup */}
          {state.payMethod === "card" && !processing ? (
            <div
              className="pos-terminal-box"
              onClick={() => {
                dispatch({ type: "beginPay" });
              }}
              title="Tap to simulate card swipe"
            >
              <div className="pos-antenna-pulse">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
                  <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
                  <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3"/>
                </svg>
              </div>
              <div>
                <strong>Simulated Contactless Terminal</strong>
                <p>Tap here or tap your physical card against Kiosk Reader #1</p>
              </div>
              <span className="tap-badge">TAP TO PAY</span>
            </div>
          ) : null}

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
            {totals.discount > 0 ? (
              <div className="row discount-row">
                <span>Voucher discount</span>
                <span>− {pesos(totals.discount)}</span>
              </div>
            ) : null}
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
            Authorizing payment… <span className="spin" />
          </div>
          <p className="fine" style={{ marginTop: 14 }}>
            Please wait for your pickup confirmation before leaving the kiosk.
          </p>
        </>
      ) : declined ? (
        <div className="btn-row" style={{ marginTop: 24 }}>
          <button
            className="btn ghost"
            type="button"
            onClick={() => {
              playTap();
              dispatch({ type: "setPayMethod", method: "balance" });
            }}
          >
            Switch to Campus Balance
          </button>
          <button
            className="btn primary"
            type="button"
            onClick={() => {
              dispatch({ type: "beginPay" });
            }}
          >
            Retry Card · {pesos(totals.total)}
          </button>
        </div>
      ) : (
        <div className="btn-row" style={{ marginTop: 24 }}>
          <button
            className="btn ghost"
            type="button"
            onClick={() => {
              playTap();
              dispatch({ type: "go", screen: "cart" });
            }}
          >
            Review Cart
          </button>
          {state.payMethod === "balance" && !canBalance ? (
            <button
              className="btn disabled"
              type="button"
              disabled
              title="Insufficient balance"
            >
              Insufficient balance · {pesos(short)} short
            </button>
          ) : (
            <button
              className="btn primary"
              type="button"
              onClick={() => {
                dispatch({ type: "beginPay" });
              }}
            >
              Pay with {state.payMethod === "card" ? "Card" : "Campus Balance"} · {pesos(totals.total)}
            </button>
          )}
        </div>
      )}

      {/* Quick Deposit Modal */}
      {showTopUpModal ? (
        <div className="overlay" onClick={() => setShowTopUpModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reload Campus Card Balance</h3>
            <p>Add funds instantly to student account {student.id}.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "20px 0" }}>
              <button
                className="btn ghost"
                type="button"
                onClick={() => {
                  dispatch({ type: "deposit", amount: 200 });
                  setShowTopUpModal(false);
                }}
              >
                + ₱200.00
              </button>
              <button
                className="btn ghost"
                type="button"
                onClick={() => {
                  dispatch({ type: "deposit", amount: 500 });
                  setShowTopUpModal(false);
                }}
              >
                + ₱500.00
              </button>
              <button
                className="btn ghost"
                type="button"
                onClick={() => {
                  dispatch({ type: "deposit", amount: 1000 });
                  setShowTopUpModal(false);
                }}
              >
                + ₱1,000.00
              </button>
              <button
                className="btn primary"
                type="button"
                onClick={() => {
                  dispatch({ type: "deposit", amount: 2000 });
                  setShowTopUpModal(false);
                }}
              >
                + ₱2,000.00
              </button>
            </div>
            <button
              className="btn ghost wide"
              type="button"
              onClick={() => setShowTopUpModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}

function CardI() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function Bank() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="8" cy="12" r="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function Warn() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="var(--danger)" strokeWidth="1.7" />
      <path d="M12 7.5v6" stroke="var(--danger)" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r=".9" fill="var(--danger)" />
    </svg>
  );
}

function Clock() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="#1a4d38" strokeWidth="1.7" />
      <path d="M12 7v5l3 3" stroke="#1a4d38" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
