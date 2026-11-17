import { useEffect, useState } from "react";
import { Back, Shell } from "../components/Shell";
import { pesos, products } from "../data";
import { useKiosk } from "../store";
import { playTap } from "../utils/sound";

export function Product() {
  const { dispatch, product, state } = useKiosk();
  const [showLightbox, setShowLightbox] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    if (!product) {
      dispatch({ type: "go", screen: "browse" });
    }
  }, [product, dispatch]);

  if (!product) return null;
  const img = product.detailImage ?? product.image;

  const isXLUnavailable = product.id === "hoodie" && state.productSize === "XL";

  // Frequently paired items (pick 3 other items, preferably from other categories)
  const pairedProducts = products
    .filter((p) => p.id !== product.id && p.category !== product.category)
    .slice(0, 3);

  return (
    <Shell>
      <Back onClick={() => dispatch({ type: "go", screen: "browse" })}>Back to browse</Back>
      <div className="product-layout">
        <div>
          <div className="product-kicker-row">
            <span className="kicker">{product.collection.toUpperCase()}</span>
            {product.badge ? (
              <span className={`product-badge badge-${product.badge.toLowerCase().replace(/\s+/g, "-")}`}>
                {product.badge}
              </span>
            ) : null}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h2 className="display" style={{ fontSize: 44, margin: "2px 0 14px" }}>
              {product.name}
            </h2>
            <div className="price-lg" style={{ fontFamily: "Fraunces, serif", fontSize: 38 }}>
              {pesos(product.price)}
            </div>
          </div>

          <div
            className="product-img-wrap"
            onClick={() => {
              playTap();
              setShowLightbox(true);
            }}
            title="Tap to zoom"
          >
            <img className="product-photo" src={img} alt={product.name} />
            <div className="zoom-hint">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="m20 20-3.5-3.5M11 8v6M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>Tap to inspect</span>
            </div>
          </div>

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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
                <p className="section-title" style={{ margin: 0 }}>
                  Size · {isXLUnavailable ? "XL unavailable" : `${state.productSize} selected`}
                </p>
                <button
                  type="button"
                  className="size-guide-btn"
                  onClick={() => {
                    playTap();
                    setShowSizeGuide(true);
                  }}
                >
                  📐 Size Guide
                </button>
              </div>
              <div className="sizes">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    className={`size ${state.productSize === s ? "on" : ""}`}
                    type="button"
                    onClick={() => {
                      playTap();
                      dispatch({ type: "setSize", size: s });
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="tiny" style={{ marginTop: 8 }}>
                Collegiate fit · Unisex standard sizing
              </p>
            </>
          ) : product.variantLabel ? (
            <p className="section-title">Specification · {product.variantLabel}</p>
          ) : null}

          <p className="section-title" style={{ marginTop: 20 }}>Quantity</p>
          <div className="qty">
            <button
              type="button"
              disabled={isXLUnavailable}
              onClick={() => {
                playTap();
                dispatch({ type: "setQty", qty: state.productQty - 1 });
              }}
            >
              −
            </button>
            <span>{state.productQty}</span>
            <button
              type="button"
              disabled={isXLUnavailable}
              onClick={() => {
                playTap();
                dispatch({ type: "setQty", qty: state.productQty + 1 });
              }}
            >
              +
            </button>
          </div>

          {isXLUnavailable ? (
            <p className="stock" style={{ color: "var(--danger)" }}>
              ✕ XL is out of stock at North Hall
            </p>
          ) : (
            <p className="stock">
              ✓ {product.sizes ? `${state.productSize} is in` : "In"} stock · North Hall inventory verified
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
              Your {product.name.toLowerCase()} will be reserved after payment. Earn {product.points * state.productQty} Hawks points on this purchase.
            </p>
          </div>
        </div>
      )}

      {isXLUnavailable ? (
        <div className="btn-row" style={{ marginTop: 18 }}>
          <button
            className="btn ghost"
            type="button"
            onClick={() => {
              playTap();
              dispatch({ type: "setSize", size: "M" });
            }}
          >
            Choose size M
          </button>
          <button className="btn disabled" type="button" disabled>
            Unavailable · choose a size
          </button>
        </div>
      ) : (
        <div className="btn-row" style={{ marginTop: 18 }}>
          <button
            className="btn ghost"
            type="button"
            onClick={() => {
              playTap();
              dispatch({ type: "go", screen: "browse" });
            }}
          >
            Keep browsing
          </button>
          <button
            className="btn primary"
            type="button"
            onClick={() => {
              dispatch({ type: "addToCart" });
            }}
          >
            Add to cart · {pesos(product.price * state.productQty)} +
          </button>
        </div>
      )}

      {/* Complete the Look / Frequently Paired */}
      <div className="paired-section">
        <h3 className="section-title" style={{ marginTop: 28, marginBottom: 12 }}>
          Complete your Alder look
        </h3>
        <div className="paired-grid">
          {pairedProducts.map((paired) => (
            <div
              key={paired.id}
              className="paired-card"
              onClick={() => {
                playTap();
                dispatch({ type: "openProduct", id: paired.id });
              }}
            >
              <img src={paired.image} alt={paired.name} />
              <div className="paired-info">
                <strong>{paired.name}</strong>
                <span>{pesos(paired.price)}</span>
              </div>
              <button
                className="paired-quick-btn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({
                    type: "quickAdd",
                    productId: paired.id,
                    size: paired.sizes ? "M" : undefined,
                  });
                }}
              >
                + Add
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox ? (
        <div className="overlay" onClick={() => setShowLightbox(false)}>
          <div className="lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-close"
              type="button"
              onClick={() => setShowLightbox(false)}
            >
              ✕
            </button>
            <img src={img} alt={product.name} />
            <div className="lightbox-caption">
              <h4>{product.name}</h4>
              <p>{product.color} · {pesos(product.price)}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Size Guide Modal */}
      {showSizeGuide ? (
        <div className="overlay" onClick={() => setShowSizeGuide(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Alder Apparel Size Guide</h3>
            <p>Standard North American collegiate unisex sizing.</p>
            <table className="size-guide-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest (in)</th>
                  <th>Length (in)</th>
                  <th>Sleeve (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr className={state.productSize === "S" ? "highlight-row" : ""}>
                  <td><strong>S</strong></td>
                  <td>34 – 36"</td>
                  <td>27"</td>
                  <td>33"</td>
                </tr>
                <tr className={state.productSize === "M" ? "highlight-row" : ""}>
                  <td><strong>M</strong></td>
                  <td>38 – 40"</td>
                  <td>28"</td>
                  <td>34"</td>
                </tr>
                <tr className={state.productSize === "L" ? "highlight-row" : ""}>
                  <td><strong>L</strong></td>
                  <td>42 – 44"</td>
                  <td>29"</td>
                  <td>35"</td>
                </tr>
                <tr className={state.productSize === "XL" ? "highlight-row" : ""}>
                  <td><strong>XL</strong></td>
                  <td>46 – 48"</td>
                  <td>30"</td>
                  <td>36"</td>
                </tr>
              </tbody>
            </table>
            <button
              className="btn primary wide"
              type="button"
              style={{ marginTop: 20 }}
              onClick={() => setShowSizeGuide(false)}
            >
              Got it
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

function Warn() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="var(--danger)" strokeWidth="1.7" />
      <path d="M12 7.5v6" stroke="var(--danger)" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r=".9" fill="var(--danger)" />
    </svg>
  );
}
