"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  code: string;
  size: string;
  quantity: number;
  unitPriceCents: number;
  weightKg: number;
};

type AddToCartInput = {
  name?: string;
  code?: string;
  size?: string;
  quantity?: number;
  unitPriceCents?: number;
  weightKg?: number;
};

type CartContextValue = {
  count: number;
  items: CartItem[];
  addToCart: (input?: AddToCartInput) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const value = useMemo<CartContextValue>(
    () => ({
      count: items.reduce((total, item) => total + item.quantity, 0),
      items,
      addToCart: (input = {}) => {
        const nextQuantity = Math.max(1, input.quantity ?? 1);
        const name = input.name?.trim() || "OW Couture Piece";
        const code = input.code?.trim() || "OW-CUSTOM";
        const size = input.size?.trim() || "Unspecified";
        const unitPriceCents = Math.max(0, Math.floor(input.unitPriceCents ?? 0));
        const weightKg = typeof input.weightKg === "number" && Number.isFinite(input.weightKg) && input.weightKg > 0 ? input.weightKg : 1;

        setItems((previous) => {
          const existingIndex = previous.findIndex((item) => item.code === code && item.size === size);

          if (existingIndex === -1) {
            return [
              ...previous,
              {
                id: `${code}-${size}`,
                name,
                code,
                size,
                quantity: nextQuantity,
                unitPriceCents,
                weightKg,
              },
            ];
          }

          return previous.map((item, index) =>
            index === existingIndex
              ? {
                  ...item,
                  quantity: item.quantity + nextQuantity,
                  unitPriceCents: unitPriceCents || item.unitPriceCents,
                  weightKg: weightKg || item.weightKg,
                }
              : item,
          );
        });
      },
      removeFromCart: (id) => {
        setItems((previous) => previous.filter((item) => item.id !== id));
      },
      clearCart: () => {
        setItems([]);
      },
    }),
    [items],
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