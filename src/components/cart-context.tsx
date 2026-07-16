"use client";

import { createContext, useContext, useMemo, useState } from "react";

type CartContextValue = {
  count: number;
  addToCart: (amount?: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);

  const value = useMemo<CartContextValue>(
    () => ({
      count,
      addToCart: (amount = 1) => {
        setCount((previous) => previous + Math.max(1, amount));
      },
    }),
    [count],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider.");
  }

  return context;
}