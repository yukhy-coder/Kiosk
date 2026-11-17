import { useState, useMemo } from "react";
import { Shell } from "../components/Shell";
import { categoryCount, categoryMeta, pesos, products, type Category } from "../data";
import { useKiosk } from "../store";
import { playTap } from "../utils/sound";

type SortOption = "featured" | "price-asc" | "price-desc";

export function Browse() {
  const { state, dispatch, totals } = useKiosk();
  const [filter, setFilter] = useState<"all" | Category | "rewards">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("featured");

  const filteredList = useMemo(() => {
    let list =
      filter === "all" || filter === "rewards"
        ? [...products]
        : products.filter((p) => p.category === filter);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.blurb.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.collection.toLowerCase().includes(q)
      );
    }

    if (sort === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [filter, search, sort]);

  return (
    <Shell>
      <div className="browse-head">
        <div>
          <h2 className="display">Find your campus favorite.</h2>
          <p className="lede" style={{ marginBottom: 0 }}>
            25 essentials · All prices before 5% campus tax
          </p>
        </div>
        <button
          className="btn primary cart-badge-btn"
          type="button"
          onClick={() => {
            playTap();
            dispatch({ type: "go", screen: "cart" });
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Cart · {totals.count}</span>
        </button>
      </div>

      <div className="browse-controls-row">
        {/* Search input with live clear */}
        <div className="kiosk-search-wrap">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            className="kiosk-search-input"
            placeholder="Search hoodies, caps, tumblers, scarves..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search ? (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                playTap();
                setSearch("");
              }}
              title="Clear search"
            >
              ✕
            </button>
          ) : null}
        </div>

        {/* Sort selector */}
        <div className="kiosk-sort-wrap">
          <label htmlFor="kiosk-sort" className="sort-label">Sort:</label>
          <select
            id="kiosk-sort"
            className="kiosk-sort-select"
            value={sort}
            onChange={(e) => {
              playTap();
              setSort(e.target.value as SortOption);
            }}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="chips">
        {categoryMeta.map((c) => {
          const count =
            c.id === "all"
              ? 25
              : c.id === "rewards"
                ? null
                : categoryCount(c.id);
          const label = count == null ? c.label : `${c.label} · ${count}`;
          return (
            <button
              key={c.id}
              className={`chip ${filter === c.id ? "on" : ""}`}
              type="button"
              onClick={() => {
                playTap();
                if (c.id === "rewards") {
                  if (!state.student) {
                    dispatch({ type: "go", screen: "signin", returnTo: "rewards" });
                  } else {
                    dispatch({ type: "go", screen: "rewards", returnTo: "browse" });
                  }
                  return;
                }
                setFilter(c.id);
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {filteredList.length === 0 ? (
        <div className="browse-empty-state">
          <p style={{ fontSize: 44, margin: "16px 0 8px" }}>🔍</p>
          <h3 className="display" style={{ fontSize: 26, margin: "0 0 8px" }}>No items match "{search}"</h3>
          <p style={{ color: "#4d5c54", fontSize: 16, marginBottom: 20 }}>
            Try a different search keyword or browse all campus categories.
          </p>
          <button
            className="btn ghost"
            type="button"
            onClick={() => {
              playTap();
              setSearch("");
              setFilter("all");
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid">
          {filteredList.map((p) => {
            const inCart = state.cart.some((c) => c.productId === p.id);
            return (
              <div
                key={p.id}
                className="tile-card"
                onClick={() => {
                  playTap();
                  dispatch({ type: "openProduct", id: p.id });
                }}
              >
                {p.badge ? <span className={`tile-badge badge-${p.badge.toLowerCase().replace(/\s+/g, "-")}`}>{p.badge}</span> : null}
                <div className="tile-img-container">
                  <img src={p.image} alt={p.name} loading="lazy" />
                  <button
                    className="tile-quick-add"
                    type="button"
                    title={`Quick add ${p.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({
                        type: "quickAdd",
                        productId: p.id,
                        size: p.sizes ? "M" : undefined,
                      });
                    }}
                  >
                    <span className="plus-icon">+</span>
                    <span className="quick-label">Add</span>
                  </button>
                </div>
                <div className="tile-info">
                  <strong>{p.name}</strong>
                  <div className="tile-row">
                    <em>{pesos(p.price)}</em>
                    {inCart ? <span className="in-cart-indicator">In cart ✓</span> : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="fine">
        {filteredList.length} products available · Select any item for size guide & North Hall pickup availability.
      </p>
    </Shell>
  );
}
