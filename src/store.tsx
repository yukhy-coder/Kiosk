import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { products, TAX_RATE, type Product } from "./data";
import { playAddCart, playSuccess, playError, playRedeem, playTap } from "./utils/sound";

export type Screen =
  | "welcome"
  | "signin"
  | "signup"
  | "browse"
  | "product"
  | "cart"
  | "pay"
  | "confirm"
  | "rewards";

export type Step = 1 | 2 | 3 | 4 | 5;

export type CartItem = {
  productId: string;
  qty: number;
  size?: string;
};

export type Student = {
  id: string;
  name: string;
  balance: number;
  points: number;
};

export type Order = {
  id: string;
  pickupCode: string;
  method: "balance" | "card";
  subtotal: number;
  tax: number;
  total: number;
  pointsEarned: number;
  items: { name: string; qty: number; size?: string; price: number }[];
};

export type State = {
  screen: Screen;
  help: boolean;
  student: Student | null;
  cart: CartItem[];
  productId: string | null;
  productQty: number;
  productSize: string;
  payMethod: "balance" | "card";
  payStatus: "idle" | "processing" | "declined" | "insufficient";
  cardLocked: boolean;
  order: Order | null;
  redeemed100: boolean;
  returnTo: Screen | null;
  promoCode: string | null;
  discount: number;
  toast: string | null;
};

// Known student database
const DEFAULT_STUDENTS: Record<string, Student> = {
  "20481736": {
    id: "20481736",
    name: "Jordan Lee",
    balance: 1500,
    points: 393,
  },
};

const inMemoryStudents: Record<string, Student> = { ...DEFAULT_STUDENTS };

export function getStudents(): Record<string, Student> {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const saved = localStorage.getItem("alder_students");
      if (saved) return { ...DEFAULT_STUDENTS, ...inMemoryStudents, ...JSON.parse(saved) };
    } catch {}
  }
  return { ...inMemoryStudents };
}

export function saveStudent(student: Student) {
  inMemoryStudents[student.id] = student;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const all = getStudents();
      all[student.id] = student;
      localStorage.setItem("alder_students", JSON.stringify(all));
    } catch {}
  }
}

export const initial: State = {
  screen: "welcome",
  help: false,
  student: null,
  cart: [],
  productId: null,
  productQty: 1,
  productSize: "M",
  payMethod: "balance",
  payStatus: "idle",
  cardLocked: false,
  order: null,
  redeemed100: false,
  returnTo: null,
  promoCode: null,
  discount: 0,
  toast: null,
};

export type Action =
  | { type: "go"; screen: Screen; returnTo?: Screen | null }
  | { type: "help"; open: boolean }
  | { type: "end" }
  | { type: "signIn"; id: string }
  | { type: "registerStudent"; student: Student }
  | { type: "openProduct"; id: string }
  | { type: "setQty"; qty: number }
  | { type: "setSize"; size: string }
  | { type: "addToCart" }
  | { type: "quickAdd"; productId: string; size?: string }
  | { type: "cartQty"; productId: string; size?: string; qty: number }
  | { type: "remove"; productId: string; size?: string }
  | { type: "clearCart" }
  | { type: "applyPromo"; code: string }
  | { type: "deposit"; amount: number }
  | { type: "setToast"; message: string | null }
  | { type: "setPayMethod"; method: "balance" | "card" }
  | { type: "beginPay" }
  | { type: "payResult"; result: "ok" | "declined" | "insufficient" }
  | { type: "redeem100" };

export function totals(cart: CartItem[], discount: number = 0) {
  const subtotal = cart.reduce((sum, item) => {
    const p = products.find((x) => x.id === item.productId);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = Math.round(discountedSubtotal * TAX_RATE * 100) / 100;
  const total = Math.round((discountedSubtotal + tax) * 100) / 100;
  const pointsEarned = Math.round((total / 10) * 100) / 100;
  const count = cart.reduce((n, i) => n + i.qty, 0);
  return { subtotal, discount, discountedSubtotal, tax, total, pointsEarned, count };
}

export function lookupStudent(id: string): Student | null {
  const students = getStudents();
  return students[id] ? { ...students[id] } : null;
}

function generateOrderId(): string {
  const num = 1000 + Math.floor(Math.random() * 9000);
  return `AU-${num}`;
}

function generatePickupCode(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const num = 100 + Math.floor(Math.random() * 900);
  return `${letter}-${num}`;
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "go":
      return {
        ...state,
        screen: action.screen,
        returnTo: action.returnTo !== undefined ? action.returnTo : state.returnTo,
        payStatus:
          action.screen === "pay"
            ? state.payStatus
            : state.payStatus === "processing"
            ? "processing"
            : state.payStatus,
        help: false,
      };
    case "help":
      return { ...state, help: action.open };
    case "end":
      return { ...initial };
    case "signIn": {
      const student = lookupStudent(action.id);
      if (!student) return state;
      const next = state.returnTo ?? (state.cart.length > 0 ? "cart" : "browse");
      return { ...state, student, screen: next, returnTo: null };
    }
    case "registerStudent": {
      saveStudent(action.student);
      const next = state.returnTo ?? (state.cart.length > 0 ? "cart" : "browse");
      return { ...state, student: action.student, screen: next, returnTo: null };
    }
    case "openProduct": {
      const p = products.find((x) => x.id === action.id);
      return {
        ...state,
        productId: action.id,
        productQty: 1,
        productSize: p?.sizes?.[1] ?? p?.sizes?.[0] ?? "M",
        screen: "product",
      };
    }
    case "setQty":
      return { ...state, productQty: Math.max(1, Math.min(9, action.qty)) };
    case "setSize":
      return { ...state, productSize: action.size };
    case "addToCart": {
      if (!state.productId) return state;
      const p = products.find((x) => x.id === state.productId);
      const size = p?.sizes ? state.productSize : undefined;
      const idx = state.cart.findIndex(
        (i) => i.productId === state.productId && i.size === size,
      );
      const cart = [...state.cart];
      if (idx >= 0) cart[idx] = { ...cart[idx], qty: cart[idx].qty + state.productQty };
      else cart.push({ productId: state.productId, qty: state.productQty, size });
      playAddCart();
      return {
        ...state,
        cart,
        screen: "cart",
        toast: `Added ${p?.name ?? "item"} to cart`,
      };
    }
    case "quickAdd": {
      const p = products.find((x) => x.id === action.productId);
      if (!p) return state;
      const size = action.size ?? p.sizes?.[0];
      const idx = state.cart.findIndex(
        (i) => i.productId === action.productId && i.size === size,
      );
      const cart = [...state.cart];
      if (idx >= 0) cart[idx] = { ...cart[idx], qty: cart[idx].qty + 1 };
      else cart.push({ productId: action.productId, qty: 1, size });
      playAddCart();
      return { ...state, cart, toast: `Added ${p.name} to cart` };
    }
    case "clearCart":
      return { ...state, cart: [], promoCode: null, discount: 0 };
    case "applyPromo": {
      const code = action.code.trim().toUpperCase();
      const t = totals(state.cart, 0);
      let disc = 0;
      let toastMsg = "";
      if (code === "HAWKS10") {
        disc = Math.round(t.subtotal * 0.1 * 100) / 100;
        toastMsg = "Promo HAWKS10 applied: 10% off!";
        playSuccess();
      } else if (code === "ALDER50") {
        disc = Math.min(t.subtotal, 50);
        toastMsg = "Voucher ALDER50 applied: ₱50.00 off!";
        playSuccess();
      } else if (code === "FROSH") {
        disc = Math.min(t.subtotal, 100);
        toastMsg = "Frosh Welcome applied: ₱100.00 off!";
        playSuccess();
      } else {
        playError();
        return { ...state, toast: "Invalid promo code" };
      }
      return { ...state, promoCode: code, discount: disc, toast: toastMsg };
    }
    case "deposit": {
      if (!state.student) return state;
      const updated: Student = {
        ...state.student,
        balance: Math.round((state.student.balance + action.amount) * 100) / 100,
      };
      saveStudent(updated);
      playRedeem();
      return {
        ...state,
        student: updated,
        toast: `Loaded ₱${action.amount.toFixed(2)} to Campus Card!`,
      };
    }
    case "setToast":
      return { ...state, toast: action.message };
    case "cartQty": {
      const cart = state.cart
        .map((i) =>
          i.productId === action.productId && i.size === action.size
            ? { ...i, qty: Math.max(0, action.qty) }
            : i,
        )
        .filter((i) => i.qty > 0);
      return { ...state, cart };
    }
    case "remove":
      return {
        ...state,
        cart: state.cart.filter(
          (i) => !(i.productId === action.productId && i.size === action.size),
        ),
      };
    case "setPayMethod":
      return {
        ...state,
        payMethod: action.method,
        payStatus:
          action.method === "balance" && state.payStatus === "declined"
            ? "idle"
            : state.payStatus === "declined"
            ? "declined"
            : "idle",
      };
    case "beginPay": {
      if (!state.student || state.cart.length === 0) return state;
      const t = totals(state.cart, state.discount);
      if (state.payMethod === "balance" && state.student.balance < t.total) {
        playError();
        return { ...state, payStatus: "insufficient", screen: "pay" };
      }
      playTap();
      return { ...state, payStatus: "processing", screen: "pay" };
    }
    case "payResult": {
      if (action.result === "declined") {
        playError();
        return {
          ...state,
          payStatus: "declined",
          payMethod: "card",
          cardLocked: true,
        };
      }
      if (action.result === "insufficient") {
        playError();
        return { ...state, payStatus: "insufficient" };
      }
      if (!state.student || state.cart.length === 0) return state;
      const t = totals(state.cart, state.discount);
      const items = state.cart.map((i) => {
        const p = products.find((x) => x.id === i.productId)!;
        return { name: p.name, qty: i.qty, size: i.size, price: p.price * i.qty };
      });
      const order: Order = {
        id: generateOrderId(),
        pickupCode: generatePickupCode(),
        method: state.payMethod,
        ...t,
        items,
      };
      const student: Student = {
        ...state.student,
        balance:
          state.payMethod === "balance"
            ? Math.round((state.student.balance - t.total) * 100) / 100
            : state.student.balance,
        points: Math.round((state.student.points + t.pointsEarned) * 100) / 100,
      };
      saveStudent(student);
      playSuccess();
      return {
        ...state,
        student,
        order,
        cart: [],
        promoCode: null,
        discount: 0,
        payStatus: "idle",
        screen: "confirm",
      };
    }
    case "redeem100": {
      if (!state.student || state.redeemed100 || state.student.points < 500) {
        playError();
        return state;
      }
      const updatedStudent: Student = {
        ...state.student,
        points: Math.round((state.student.points - 500) * 100) / 100,
        balance: Math.round((state.student.balance + 100) * 100) / 100,
      };
      saveStudent(updatedStudent);
      playRedeem();
      return {
        ...state,
        redeemed100: true,
        student: updatedStudent,
        toast: "Redeemed 500 points for ₱100.00 store credit!",
      };
    }
    default:
      return state;
  }
}

function stepFor(screen: Screen): Step {
  switch (screen) {
    case "welcome":
    case "signin":
    case "signup":
    case "browse":
      return 1;
    case "product":
      return 2;
    case "cart":
      return 3;
    case "pay":
      return 4;
    case "confirm":
    case "rewards":
      return 5;
  }
}

const Ctx = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
  step: Step;
  product: Product | null;
  totals: ReturnType<typeof totals>;
} | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const product = products.find((p) => p.id === state.productId) ?? null;
  const t = useMemo(
    () => totals(state.cart, state.discount),
    [state.cart, state.discount],
  );
  const step = stepFor(state.screen);
  return (
    <Ctx.Provider value={{ state, dispatch, step, product, totals: t }}>
      {children}
    </Ctx.Provider>
  );
}

export function useKiosk() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useKiosk must be used within StoreProvider");
  return ctx;
}
