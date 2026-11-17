import { useState, useEffect } from "react";
import { StoreProvider, useKiosk } from "./store";
import { Welcome } from "./screens/Welcome";
import { SignIn } from "./screens/SignIn";
import { SignUp } from "./screens/SignUp";
import { Browse } from "./screens/Browse";
import { Product } from "./screens/Product";
import { Cart } from "./screens/Cart";
import { Pay } from "./screens/Pay";
import { Confirm } from "./screens/Confirm";
import { Rewards } from "./screens/Rewards";
import "./kiosk.css";

function KioskContent() {
  const { state } = useKiosk();

  switch (state.screen) {
    case "welcome":
      return <Welcome />;
    case "signin":
      return <SignIn />;
    case "signup":
      return <SignUp />;
    case "browse":
      return <Browse />;
    case "product":
      return <Product />;
    case "cart":
      return <Cart />;
    case "pay":
      return <Pay />;
    case "confirm":
      return <Confirm />;
    case "rewards":
      return <Rewards />;
    default:
      return <Welcome />;
  }
}

export function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}

function MainLayout() {
  const [fitScale, setFitScale] = useState(0.65);

  useEffect(() => {
    function compute() {
      const availableH = window.innerHeight - 32;
      const availableW = window.innerWidth - 32;
      const scale = Math.min(availableH / 1440, availableW / 1024, 1);
      setFitScale(scale);
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return (
    <div className="app-viewport">
      <div className="stage">
        <div
          className="kiosk-scaler"
          style={{
            transform: `scale(${fitScale})`,
            transformOrigin: "top center",
            width: 1024,
            height: 1440,
            marginBottom: 1440 * (fitScale - 1),
          }}
        >
          <div className="kiosk-frame" style={{ position: "relative", width: 1024, height: 1440 }}>
            <KioskContent />
          </div>
        </div>
      </div>
    </div>
  );
}
