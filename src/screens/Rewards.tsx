import { useEffect, useState } from "react";
import { Back, Shell } from "../components/Shell";
import { pesos } from "../data";
import { useKiosk } from "../store";
import { playTap, playRedeem } from "../utils/sound";

export function Rewards() {
  const { state, dispatch } = useKiosk();
  const [showDepositModal, setShowDepositModal] = useState(false);

  // Guard: if not signed in, go back to welcome
  useEffect(() => {
    if (!state.student) {
      dispatch({ type: "go", screen: "welcome" });
    }
  }, [state.student, dispatch]);

  if (!state.student) return null;

  const student = state.student;
  const redeemed = state.redeemed100;
  const order = state.order;
  const backTarget = order ? "confirm" : (state.returnTo && state.returnTo !== "rewards" ? state.returnTo : "browse");
  const backLabel =
    order
      ? "Back to confirmation"
      : backTarget === "cart"
      ? "Back to cart"
      : backTarget === "product"
      ? "Back to product"
      : "Back to browse";

  const pointsNeededFor1000 = Math.max(0, 1000 - student.points);

  const subText = redeemed
    ? "500 points redeemed · ₱100 added"
    : order
    ? `${order.pointsEarned.toFixed(2)} earned today · ${
        student.points >= 500 ? "₱100 reward unlocked" : "keep earning!"
      }`
    : student.points >= 500
    ? "₱100 reward unlocked"
    : "Keep earning with every purchase";

  return (
    <Shell>
      <Back onClick={() => { playTap(); dispatch({ type: "go", screen: backTarget, returnTo: null }); }}>
        {backLabel}
      </Back>
      <h2 className="display">Your campus perks, all here.</h2>
      <p className="lede">
        {student.name} · Student ID •••• {student.id.slice(-4)} · Hawks Rewards Member
      </p>

      <div className="perk-row">
        <div className="perk green">
          <div className="label">Campus balance</div>
          <div className="big">{pesos(student.balance)}</div>
          <div className="sub" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Available now</span>
            <button
              className="quick-reload-pill"
              type="button"
              onClick={() => {
                playTap();
                setShowDepositModal(true);
              }}
            >
              + Reload
            </button>
          </div>
        </div>
        <div className="perk gold">
          <div className="label">Hawks points</div>
          <div className="big">{student.points.toFixed(2)}</div>
          <div className="sub">{subText}</div>
        </div>
      </div>

      {redeemed ? (
        <div className="banner soft">
          <Shield />
          <div>
            <h3>₱100.00 added to your campus balance</h3>
            <p>
              500 points redeemed successfully. Your new balance is {pesos(student.balance)} and you
              have {student.points.toFixed(2)} points remaining.
            </p>
          </div>
        </div>
      ) : (
        <div className="banner soft">
          <Shield />
          <div>
            <h3>Small purchases. Big school spirit.</h3>
            <p>
              Earn 1 point per ₱10.00 of merchandise, before tax. Redeem 500 points for ₱100 campus
              store credit.
            </p>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "14px 0 10px",
        }}
      >
        <h3 className="section-title" style={{ margin: 0 }}>
          Redeem your points
        </h3>
        <GiftIcon />
      </div>

      <div className="redeem-grid">
        <div
          className="card"
          style={{
            borderColor: redeemed
              ? "var(--line)"
              : student.points >= 500
              ? "var(--green)"
              : "var(--line)",
          }}
        >
          <h4 style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)" }}>
            ₱100 store credit
          </h4>
          <p className="tiny" style={{ marginTop: 4, fontWeight: 600 }}>
            500 Hawks points
          </p>
          <p style={{ margin: "12px 0 18px", color: "#4d5c54", fontSize: 15, lineHeight: 1.4 }}>
            Adds to campus balance instantly. Use on your next store purchase.
          </p>
          {redeemed ? (
            <button className="btn disabled wide" type="button" disabled>
              Redeemed · {Math.round(student.points)} points left
            </button>
          ) : (
            <button
              className="btn primary wide"
              type="button"
              disabled={student.points < 500}
              onClick={() => {
                playRedeem();
                dispatch({ type: "redeem100" });
              }}
            >
              {student.points >= 500 ? "Redeem 500 points" : "Need 500 points"}
            </button>
          )}
        </div>

        <div className="card" style={{ borderColor: "var(--line)" }}>
          <h4 style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)" }}>
            ₱300 store credit
          </h4>
          <p className="tiny" style={{ marginTop: 4, fontWeight: 600 }}>
            1,000 Hawks points
          </p>
          <p style={{ margin: "12px 0 18px", color: "#4d5c54", fontSize: 15, lineHeight: 1.4 }}>
            {pointsNeededFor1000 > 0
              ? `${Math.ceil(pointsNeededFor1000)} more points to unlock.`
              : "Ready to unlock!"}{" "}
            Keep earning with every purchase.
          </p>
          <button className="btn disabled wide" type="button" disabled>
            Locked · 1,000 points
          </button>
        </div>
      </div>

      <div className="card activity" style={{ marginTop: 18 }}>
        <h3 className="section-title" style={{ marginTop: 0, marginBottom: 12 }}>
          Today’s activity
        </h3>
        {order ? (
          <>
            {redeemed && (
              <div
                className="row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ color: "var(--ink)", fontWeight: 500 }}>Reward redeemed</span>
                <span style={{ fontWeight: 700, color: "var(--ink)" }}>
                  −500 points / +₱100.00
                </span>
              </div>
            )}
            <div
              className="row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ color: "var(--ink)", fontWeight: 500 }}>Order #{order.id}</span>
              <span style={{ fontWeight: 700, color: "var(--ink)" }}>
                −{pesos(order.total)} / +{order.pointsEarned.toFixed(2)} points
              </span>
            </div>
            <div className="row" style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--ink)", fontWeight: 500 }}>Starting balance</span>
              <span style={{ fontWeight: 700, color: "var(--ink)" }}>
                {pesos(
                  Math.round(
                    (student.balance +
                      (order.method === "balance" ? order.total : 0) -
                      (redeemed ? 100 : 0)) *
                      100
                  ) / 100
                )}{" "}
                / {Math.round(student.points - order.pointsEarned + (redeemed ? 500 : 0))} points
              </span>
            </div>
          </>
        ) : (
          <>
            <div
              className="row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ color: "var(--ink)", fontWeight: 500 }}>Account status</span>
              <span style={{ fontWeight: 700, color: "var(--green)" }}>Active Hawks Member</span>
            </div>
            <div className="row" style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--ink)", fontWeight: 500 }}>Current balance</span>
              <span style={{ fontWeight: 700, color: "var(--ink)" }}>
                {pesos(student.balance)} / {Math.round(student.points)} points
              </span>
            </div>
          </>
        )}
      </div>

      <p className="fine" style={{ textAlign: "left", marginTop: 14, fontSize: 14 }}>
        Campus balances update instantly across all North Hall registers and dining commons.
      </p>

      {/* Quick Deposit Modal */}
      {showDepositModal ? (
        <div className="overlay" onClick={() => setShowDepositModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reload Campus Card Balance</h3>
            <p>Add funds to {student.name} ({student.id}).</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "20px 0" }}>
              <button
                className="btn ghost"
                type="button"
                onClick={() => {
                  dispatch({ type: "deposit", amount: 200 });
                  setShowDepositModal(false);
                }}
              >
                + ₱200.00
              </button>
              <button
                className="btn ghost"
                type="button"
                onClick={() => {
                  dispatch({ type: "deposit", amount: 500 });
                  setShowDepositModal(false);
                }}
              >
                + ₱500.00
              </button>
              <button
                className="btn ghost"
                type="button"
                onClick={() => {
                  dispatch({ type: "deposit", amount: 1000 });
                  setShowDepositModal(false);
                }}
              >
                + ₱1,000.00
              </button>
              <button
                className="btn primary"
                type="button"
                onClick={() => {
                  dispatch({ type: "deposit", amount: 2000 });
                  setShowDepositModal(false);
                }}
              >
                + ₱2,000.00
              </button>
            </div>
            <button
              className="btn ghost wide"
              type="button"
              onClick={() => setShowDepositModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
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

function GiftIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{ color: "var(--ink)" }}
    >
      <rect x="3" y="10" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M3 10h18M12 10v11M12 10c0-3 2-5 4.5-4 1.8.7 1.7 3.3.2 4M12 10c0-3-2-5-4.5-4-1.8.7-1.7 3.3-.2 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
