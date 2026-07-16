"use client";

import { useCart } from "@/components/cart-context";

type CartBubbleProps = {
  className?: string;
};

export function CartBubble({ className = "" }: CartBubbleProps) {
  const { count } = useCart();

  return <b className={`rounded-full bg-black px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white ${className}`}>{count}</b>;
}