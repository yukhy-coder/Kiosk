import { useState } from "react";
import { Shell } from "../components/Shell";
import { categoryCount, categoryMeta, pesos, products, type Category } from "../data";
import { useKiosk } from "../store";

export function Browse() {
  const { state, dispatch, totals } = useKiosk();
  const [filter, setFilter] = useState<"all" | Category | "rewards">("all");
  const list =
    filter === "all" || filter === "rewards"
      ? products
      : products.filter((p) => p.category === filter);

  return (
    <Shell>
      <div className="browse-head">
        <div>
          <h2 className="display">Find your campus favorite.</h2>
          <p className="lede" style={{ marginBottom: 0 }}>
            25 essentials · All prices before 5% campus tax
          </p>
        </div>
        <button className="btn primary" type="button" onClick={() => dispatch({ type: "go", screen: "cart" })}>
          Cart · {totals.count}
        </button>
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
                if (c.id === "rewards") {
                  if (!state.student) {
                    dispatch({ type: "go", screen: "signin" });
                  } else {
                    dispatch({ type: "go", screen: "rewards" });
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
      <div className="grid">
        {list.map((p) => (
          <button key={p.id} className="tile" type="button" onClick={() => dispatch({ type: "openProduct", id: p.id })}>
            <img src={p.image} alt={p.name} />
            <strong>{p.name}</strong>
            <em>{pesos(p.price)}</em>
          </button>
        ))}
      </div>
      <p className="fine">All {list.length} products shown · Select any item to choose options and check availability.</p>
    </Shell>
  );
}
