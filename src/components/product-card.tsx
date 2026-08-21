"use client";

import { useState } from "react";

import { useCart } from "@/components/cart-context";
import { useCustomizationDrawer } from "@/components/customization-drawer-context";
import type { Product } from "@/data/products";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { openDrawer } = useCustomizationDrawer();
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isOrderAdded, setIsOrderAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [sizeError, setSizeError] = useState("");

  const parsePriceToCents = (priceFrom: string) => {
    const parsed = Number(priceFrom.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 0;
    }

    return Math.round(parsed * 100);
  };

  const sizeChartRows = [
    ["XS", "6", "34", "26", "36"],
    ["S", "8", "36", "28", "38"],
    ["M", "10", "38", "30", "40"],
    ["L", "12", "40", "32", "42"],
    ["XL", "14", "42", "34", "44"],
    ["XXL", "16", "44", "36", "46"],
  ];

  return (
    <>
      <article className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.09)]">
        <img src={product.image} alt={product.name} className="h-80 w-full object-cover" />
        <div className="space-y-4 p-6">
          <div>
            <h3 className="text-2xl leading-[1.05] tracking-[-0.04em] text-neutral-950">{product.name}</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">Code: {product.code}</p>
          </div>
          <p className="text-sm font-semibold text-neutral-950">Estimated Production Time: {product.leadTime}</p>
          <p className="text-sm leading-7 text-[var(--muted)]">Additional measurements will be taken during your consultation.</p>
          <label className="grid gap-2 text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            Choose size
            <select
              value={selectedSize}
              onChange={(event) => {
                setSelectedSize(event.target.value);
                if (event.target.value) {
                  setSizeError("");
                }
              }}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
            >
              <option value="">Select size</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
              <option value="Custom">Custom</option>
            </select>
          </label>
          {sizeError ? <p className="text-xs text-red-700">{sizeError}</p> : null}
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsSizeChartOpen(true)}
              className="rounded-full border border-black bg-white px-4 py-2.5 text-sm text-black transition hover:-translate-y-0.5"
            >
              View Size Chart
            </button>
            <button
              type="button"
              onClick={() =>
                openDrawer({
                  name: product.name,
                  code: product.code,
                  size: selectedSize,
                  unitPriceCents: parsePriceToCents(product.priceFrom),
                })
              }
              className="rounded-full border border-black bg-black px-4 py-2.5 text-sm text-white transition hover:bg-neutral-900"
            >
              Customize
            </button>
            <button
              type="button"
              onClick={() => {
                if (!selectedSize) {
                  setSizeError("Please choose a size before ordering.");
                  return;
                }

                setSizeError("");
                addToCart({
                  name: product.name,
                  code: product.code,
                  size: selectedSize,
                  quantity: 1,
                  unitPriceCents: parsePriceToCents(product.priceFrom),
                });
                setIsOrderAdded(true);
                window.setTimeout(() => setIsOrderAdded(false), 1400);
              }}
              className="rounded-full border border-black bg-white px-4 py-2.5 text-sm text-black transition hover:-translate-y-0.5"
            >
              {isOrderAdded ? "Added" : "Order"}
            </button>
          </div>
        </div>
      </article>
      {isSizeChartOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close size chart"
            className="absolute inset-0 bg-black/45"
            onClick={() => setIsSizeChartOpen(false)}
          />
          <div className="absolute left-1/2 top-1/2 w-[min(680px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-[30px] bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.25)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-4xl leading-[0.98] tracking-[-0.04em] text-neutral-950">OW Couture Size Chart</h4>
              <button
                type="button"
                onClick={() => setIsSizeChartOpen(false)}
                className="rounded-full bg-[var(--soft)] px-4 py-2 text-sm text-neutral-800"
              >
                Close
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--line)]">
              <div className="grid grid-cols-5 border-b border-[var(--line)] bg-[var(--soft)] text-xs uppercase tracking-[0.08em] text-neutral-700">
                <div className="px-3 py-2">Size</div>
                <div className="px-3 py-2">UK</div>
                <div className="px-3 py-2">Bust</div>
                <div className="px-3 py-2">Waist</div>
                <div className="px-3 py-2">Hips</div>
              </div>
              {sizeChartRows.map((row) => (
                <div key={row[0]} className="grid grid-cols-5 border-b border-[var(--line)] text-sm text-neutral-800 last:border-b-0">
                  {row.map((cell) => (
                    <div key={`${row[0]}-${cell}`} className="px-3 py-2">
                      {cell}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
