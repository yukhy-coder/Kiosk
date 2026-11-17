import { useEffect } from "react";
import { Back, Shell } from "../components/Shell";
import { pesos } from "../data";
import { useKiosk } from "../store";

export function Product() {
  const { dispatch, product, state } = useKiosk();

  useEffect(() => {
    if (!product) {
      dispatch({ type: "go", screen: "browse" });
    }
  }, [product, dispatch]);

  if (!product) return null;
  const img = product.detailImage ?? product.image;

  const isXLUnavailable = product.id === "hoodie" && state.productSize === "XL";

  return (
    <Shell>
      <Back onClick={() => dispatch({ type: "go", screen: "browse" })}>Back to browse</Back>
      <div className="product-layout">
        <div>
          <p className="kicker">{product.collection.toUpperCase()}</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h2 className="display" style={{ fontSize: 44, margin: "2px 0 14px" }}>
              {product.name}
            </h2>
            <div className="price-lg" style={{ fontFamily: "Fraunces, serif", fontSize: 38 }}>
              {pesos(product.price)}
            </div>
          </div>
          <img className="product-photo" src={img} alt={product.name} />
          <p style={{ marginTop: 14, color: "#4d5c54", fontSize: 16, lineHeight: 1.45 }}>
            {product.blurb}
          </p>
          <p style={{ marginTop: 10, color: "#4d5c54", whiteSpace: "pre-line", fontSize: 15, lineHeight: 1.45 }}>
            {product.facts}
          </p>
        </div>
        <div>
          <p className="section-title" style={{ marginTop: 28 }}>
            Color · {product.color.split(" ")[0]}
          </p>
          <div className="color-pill">
            <span className="swatch" />
            <span>{product.color}</span>
            <span style={{ marginLeft: 2 }}>✓</span>
          </div>
          {product.sizes ? (
            <>
              <p className="section-title">
                Size · {isXLUnavailable ? "XL unavailable" : `${state.productSize} selected`}
              </p>
              <div className="sizes">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    className={`size ${state.productSize === s ? "on" : ""}`}
                    type="button"
                    onClick={() => dispatch({ type: "setSize", size: s })}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="tiny" style={{ marginTop: 8 }}>
                Size guide: M · chest 38–40 in
              </p>
            </>
          ) : product.variantLabel ? (
            <p className="section-title">Size · {product.variantLabel}</p>
          ) : null}

          <p className="section-title" style={{ marginTop: 20 }}>Quantity</p>
          <div className="qty">
            <button
              type="button"
              disabled={isXLUnavailable}
              onClick={() => dispatch({ type: "setQty", qty: state.productQty - 1 })}
            >
              −
            </button>
            <span>{state.productQty}</span>
            <button
              type="button"
              disabled={isXLUnavailable}
              onClick={() => dispatch({ type: "setQty", qty: state.productQty + 1 })}
            >
              +
            </button>
          </div>

          {isXLUnavailable ? (
            <p className="stock" style={{ color: "var(--danger)" }}>
              ✕ XL is out of stock
            </p>
          ) : (
            <p className="stock">
              ✓ {product.sizes ? `${state.productSize} is` : "In"} stock at North Hall
            </p>
          )}
        </div>
      </div>

      {isXLUnavailable ? (
        <div className="banner danger" style={{ marginTop: 24 }}>
          <Warn />
          <div>
            <h3>This size is currently unavailable</h3>
            <p>Choose S, M or L to continue. You can also browse other campus favorites.</p>
          </div>
        </div>
      ) : (
        <div className="banner soft" style={{ marginTop: 24 }}>
          <Shield />
          <div>
            <h3>Ready for pickup today</h3>
            <p>
              Your hoodie will be reserved after payment. Earn {product.points} Hawks points on this item.
            </p>
          </div>
        </div>
      )}

      {isXLUnavailable ? (
        <div className="btn-row" style={{ marginTop: 18 }}>
          <button
            className="btn ghost"
            type="button"
            onClick={() => dispatch({ type: "setSize", size: "M" })}
          >
            Choose size M
          </button>
          <button className="btn disabled" type="button" disabled>
            Unavailable · choose a size
          </button>
        </div>
      ) : (
        <div className="btn-row" style={{ marginTop: 18 }}>
          <button className="btn ghost" type="button" onClick={() => dispatch({ type: "go", screen: "browse" })}>
            Keep browsing
          </button>
          <button className="btn primary" type="button" onClick={() => dispatch({ type: "addToCart" })}>
            Add to cart · {pesos(product.price * state.productQty)} +
          </button>
        </div>
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

function Warn() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="var(--danger)" strokeWidth="1.7" />
      <path d="M12 7.5v6" stroke="var(--danger)" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r=".9" fill="var(--danger)" />
    </svg>
  );
}
