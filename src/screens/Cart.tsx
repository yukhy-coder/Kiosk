import { Back, Shell } from "../components/Shell";
import { pesos, products } from "../data";
import { useKiosk } from "../store";

export function Cart() {
  const { state, dispatch, totals } = useKiosk();
  const empty = state.cart.length === 0;
  const firstName = state.student?.name.split(" ")[0] ?? "";
  const title = firstName ? `Good picks, ${firstName}.` : "Good picks.";
  const pointsToEarn = Math.floor(totals.subtotal / 10);
  const currentPoints = Math.round(state.student?.points ?? 0);
  const nextPoints = currentPoints + pointsToEarn;

  return (
    <Shell>
      <Back onClick={() => dispatch({ type: "go", screen: "browse" })}>Back to browse</Back>
      {empty ? (
        <>
          <h2 className="display">Your next favorite is waiting.</h2>
          <p className="lede">Your cart is empty. Let’s find something that feels like Alder.</p>
          <div className="empty">
            <svg className="bag" viewBox="0 0 64 64" fill="none" aria-hidden>
              <rect
                x="18"
                y="24"
                width="28"
                height="26"
                rx="4"
                stroke="currentColor"
                strokeWidth="2.2"
              />
              <path
                d="M25 24v-4a7 7 0 0 1 14 0v4"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M28 35c1.5 2 6.5 2 8 0"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
            <h3 className="display" style={{ fontSize: 28, margin: "14px 0 8px" }}>
              No items in your cart
            </h3>
            <p className="lede" style={{ marginBottom: 28 }}>
              Browse all 25 campus essentials and choose your favorites.
            </p>
            <div
              className="summary"
              style={{ maxWidth: 520, margin: "0 auto", textAlign: "left", padding: "0 10px" }}
            >
              <div
                className="row"
                style={{ color: "var(--ink)", fontWeight: 700, fontSize: 18 }}
              >
                <span>Total</span>
                <span>{pesos(0)}</span>
              </div>
            </div>
          </div>
          <button
            className="btn primary wide"
            type="button"
            onClick={() => dispatch({ type: "go", screen: "browse" })}
          >
            Browse campus merchandise →
          </button>
          <div style={{ height: 12 }} />
          <button className="btn disabled wide" type="button" disabled>
            Checkout · cart is empty
          </button>
        </>
      ) : (
        <>
          <h2 className="display">{title}</h2>
          <p className="lede">
            Your cart · {totals.count} item{totals.count === 1 ? "" : "s"} · Pickup at North Hall
            campus store
          </p>
          {state.cart.map((item) => {
            const p = products.find((x) => x.id === item.productId)!;
            return (
              <div className="cart-item" key={`${item.productId}-${item.size ?? ""}`}>
                <img src={p.image} alt={p.name} />
                <div>
                  <h4>{p.name}</h4>
                  <div className="meta">
                    {p.color.split(" ")[0]} /{" "}
                    {item.size ? `Size ${item.size}` : p.variantLabel ?? "One size"}
                  </div>
                  <div className="qty-mini">
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: "cartQty",
                          productId: item.productId,
                          size: item.size,
                          qty: item.qty - 1,
                        })
                      }
                    >
                      −
                    </button>
                    <span style={{ minWidth: 20, textAlign: "center", fontWeight: 700 }}>
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: "cartQty",
                          productId: item.productId,
                          size: item.size,
                          qty: item.qty + 1,
                        })
                      }
                    >
                      +
                    </button>
                    <button
                      className="remove"
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: "remove",
                          productId: item.productId,
                          size: item.size,
                        })
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <strong style={{ fontSize: 20 }}>{pesos(p.price * item.qty)}</strong>
              </div>
            );
          })}
          <div className="two-col" style={{ marginTop: 16 }}>
            <div>
              <div className="banner soft">
                <Shield />
                <div>
                  <h3>Pickup right here</h3>
                  <p>North Hall · Ready in about 5 minutes after payment.</p>
                </div>
              </div>
              {state.student ? (
                <div className="banner soft">
                  <Shield />
                  <div>
                    <h3>Earn {pointsToEarn} Hawks points</h3>
                    <p>
                      {currentPoints} points now → {nextPoints} points after this order. Points
                      exclude tax.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="banner soft">
                  <Shield />
                  <div>
                    <h3>Earn Hawks points</h3>
                    <p>
                      Sign in with your student ID at checkout to earn 1 point per ₱10 spent.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="card summary">
              <h3 className="section-title" style={{ marginTop: 0, marginBottom: 14 }}>
                Order summary · {totals.count} item{totals.count === 1 ? "" : "s"}
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
                style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid #eeeae0" }}
              >
                <span>Total</span>
                <span>{pesos(totals.total)}</span>
              </div>
            </div>
          </div>
          <div className="btn-row" style={{ marginTop: 24 }}>
            <button
              className="btn ghost"
              type="button"
              onClick={() => dispatch({ type: "go", screen: "browse" })}
            >
              Keep browsing
            </button>
            <button
              className="btn primary"
              type="button"
              onClick={() => {
                if (!state.student) {
                  dispatch({ type: "go", screen: "signin", returnTo: "pay" });
                } else {
                  dispatch({ type: "go", screen: "pay" });
                }
              }}
            >
              Checkout · {pesos(totals.total)} →
            </button>
          </div>
          <p className="tiny" style={{ marginTop: 14, textAlign: "center" }}>
            Review sizes and quantities before continuing. No payment has been taken.
          </p>
        </>
      )}
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
