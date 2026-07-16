"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { useCart } from "@/components/cart-context";

type DrawerProduct = {
  name: string;
  code: string;
};

type CustomizationDrawerContextValue = {
  openDrawer: (product: DrawerProduct) => void;
};

const CLOSE_ANIMATION_MS = 260;

const CustomizationDrawerContext = createContext<CustomizationDrawerContextValue | null>(null);

export function CustomizationDrawerProvider({ children }: { children: React.ReactNode }) {
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<DrawerProduct | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);

  const openDrawer = (product: DrawerProduct) => {
    setSelectedProduct(product);
    setIsMounted(true);
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  };

  const closeDrawer = () => {
    setIsVisible(false);
    window.setTimeout(() => {
      setIsMounted(false);
      setSelectedProduct(null);
    }, CLOSE_ANIMATION_MS);
  };

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMounted]);

  const contextValue = useMemo<CustomizationDrawerContextValue>(
    () => ({ openDrawer }),
    [],
  );

  return (
    <CustomizationDrawerContext.Provider value={contextValue}>
      {children}

      {isMounted && selectedProduct && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close customize panel"
            className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${isVisible ? "opacity-100" : "opacity-0"}`}
            onClick={closeDrawer}
          />

          <aside
            className={`absolute right-0 top-0 h-full w-full max-w-[520px] overflow-y-auto bg-white p-7 shadow-[-30px_0_80px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isVisible ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-5xl leading-[0.95] tracking-[-0.04em] text-neutral-950">Customize Your Piece</h3>
                <p className="mt-4 text-base leading-8 text-[var(--muted)]">Your selected product details are attached to checkout metadata.</p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-full bg-[var(--soft)] px-4 py-2 text-sm text-neutral-800"
              >
                Close
              </button>
            </div>

            <form
              className="mt-6 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                addToCart();
                closeDrawer();
                setIsToastVisible(true);
                window.setTimeout(() => {
                  setIsToastVisible(false);
                }, 2200);
              }}
            >
              <label className="grid gap-2 text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
                Product Name
                <input
                  value={selectedProduct.name}
                  readOnly
                  className="rounded-2xl border border-[var(--line)] bg-[#f7f7f7] px-4 py-3 text-sm text-neutral-900"
                />
              </label>

              <label className="grid gap-2 text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
                Product Code
                <input
                  value={selectedProduct.code}
                  readOnly
                  className="rounded-2xl border border-[var(--line)] bg-[#f7f7f7] px-4 py-3 text-sm text-neutral-900"
                />
              </label>

              <label className="grid gap-2 text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
                Customer Name
                <input
                  required
                  name="name"
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
                />
              </label>

              <label className="grid gap-2 text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
                Email
                <input
                  required
                  type="email"
                  name="email"
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
                  Bust
                  <input
                    name="bust"
                    placeholder="e.g. 38"
                    className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
                  />
                </label>
                <label className="grid gap-2 text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
                  Waist
                  <input
                    name="waist"
                    placeholder="e.g. 30"
                    className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
                  />
                </label>
                <label className="grid gap-2 text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
                  Hips
                  <input
                    name="hips"
                    placeholder="e.g. 40"
                    className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
                  />
                </label>
                <label className="grid gap-2 text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
                  Height
                  <input
                    name="height"
                    placeholder="e.g. 5'7"
                    className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
                Custom Notes
                <textarea
                  name="notes"
                  rows={4}
                  placeholder="Tell us if you need extra length, structure adjustments, or any fit preferences."
                  className="rounded-[20px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
                />
              </label>

              <button type="submit" className="rounded-full border border-black bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-900">
                Add Customization
              </button>
            </form>
          </aside>
        </div>
      )}

      {isToastVisible && (
        <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="rounded-[28px] border border-black bg-black px-8 py-7 text-center text-white shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <p className="text-xs uppercase tracking-[0.22em] text-white/75">Success</p>
            <p className="mt-3 text-3xl leading-[0.95] tracking-[-0.03em]">Customization Added</p>
            <p className="mt-3 text-sm text-white/80">Your details were saved and this item was added to your bag.</p>
          </div>
        </div>
      )}
    </CustomizationDrawerContext.Provider>
  );
}

export function useCustomizationDrawer() {
  const context = useContext(CustomizationDrawerContext);

  if (!context) {
    throw new Error("useCustomizationDrawer must be used within CustomizationDrawerProvider.");
  }

  return context;
}