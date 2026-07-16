"use client";

import { useEffect, useRef, useState } from "react";

const galleryCards = [
  {
    title: "Bridal Process Highlights",
    description: "Sketch to fitting moments from custom bridal builds.",
    images: [
      "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    title: "Evening Capsule",
    description: "Structured silhouettes and soft movement in event wear.",
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    title: "RTW Editorial",
    description: "Lookbook shots for current ready-to-wear drops.",
    images: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    title: "Client Celebrations",
    description: "Multiple client moments grouped by occasion.",
    images: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

export default function GalleryPage() {
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);

  const activeCard = activeCardIndex === null ? null : galleryCards[activeCardIndex];

  useEffect(() => {
    if (activeCardIndex === null) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveCardIndex(null);
        return;
      }

      if (!activeCard) {
        return;
      }

      if (event.key === "ArrowRight") {
        setActiveImageIndex((currentIndex) => (currentIndex + 1) % activeCard.images.length);
      }

      if (event.key === "ArrowLeft") {
        setActiveImageIndex((currentIndex) => (currentIndex - 1 + activeCard.images.length) % activeCard.images.length);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeCard, activeCardIndex]);

  const openLightbox = (cardIndex: number, imageIndex: number) => {
    setActiveCardIndex(cardIndex);
    setActiveImageIndex(imageIndex);
  };

  const closeLightbox = () => {
    setActiveCardIndex(null);
  };

  const showPreviousImage = () => {
    if (!activeCard) {
      return;
    }

    setActiveImageIndex((currentIndex) => (currentIndex - 1 + activeCard.images.length) % activeCard.images.length);
  };

  const showNextImage = () => {
    if (!activeCard) {
      return;
    }

    setActiveImageIndex((currentIndex) => (currentIndex + 1) % activeCard.images.length);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchCurrentX.current = touchStartX.current;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    touchCurrentX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchCurrentX.current === null) {
      touchStartX.current = null;
      touchCurrentX.current = null;
      return;
    }

    const swipeDistance = touchCurrentX.current - touchStartX.current;
    const swipeThreshold = 44;

    if (Math.abs(swipeDistance) >= swipeThreshold) {
      if (swipeDistance > 0) {
        showPreviousImage();
      } else {
        showNextImage();
      }
    }

    touchStartX.current = null;
    touchCurrentX.current = null;
  };

  return (
    <>
      <main className="border-b border-[var(--line)] py-16 sm:py-20">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Gallery</p>
          <h1 className="text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">Lookbook stories in image sets.</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            Each card can hold multiple images, making it easy to group moments from the same fitting, event, or collection launch.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {galleryCards.map((card, cardIndex) => (
              <article
                key={card.title}
                data-scroll-delay={120 + cardIndex * 110}
                data-scroll-direction={cardIndex % 2 === 0 ? "left" : "right"}
                className="rounded-[28px] border border-[var(--line)] bg-white p-4 sm:p-5"
              >
                <div className="grid grid-cols-2 gap-3">
                  {card.images.map((image, index) => (
                    <button
                      type="button"
                      key={`${card.title}-${index}`}
                      className={`overflow-hidden rounded-[18px] text-left transition hover:opacity-90 ${index === 0 ? "col-span-2" : ""}`}
                      onClick={() => openLightbox(cardIndex, index)}
                      aria-label={`Open ${card.title} image ${index + 1}`}
                    >
                      <img
                        src={image}
                        alt={`${card.title} image ${index + 1}`}
                        className={`w-full object-cover ${index === 0 ? "h-64 sm:h-72" : "h-36 sm:h-44"}`}
                      />
                    </button>
                  ))}
                </div>
                <div className="px-1 pb-1 pt-5">
                  <h2 className="text-3xl tracking-[-0.04em] text-neutral-950">{card.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{card.description}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Tap any image to view the full set.</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      {activeCard ? (
        <div className="fixed inset-0 z-50 bg-black/80 p-4 sm:p-6" role="dialog" aria-modal="true" aria-label={`${activeCard.title} gallery`}>
          <button type="button" className="absolute inset-0" aria-label="Close gallery viewer" onClick={closeLightbox} />
          <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col justify-center">
            <div className="relative overflow-hidden rounded-[30px] bg-[#111] p-3 sm:p-5">
              <div className="mb-4 flex items-start justify-between gap-4 text-white">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-white/60">Gallery viewer</p>
                  <h2 className="mt-2 text-3xl tracking-[-0.04em]">{activeCard.title}</h2>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-white/20 px-4 py-2 text-sm transition hover:bg-white hover:text-black"
                  onClick={closeLightbox}
                >
                  Close
                </button>
              </div>

              <div
                className="relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  key={`${activeCard.title}-${activeImageIndex}`}
                  src={activeCard.images[activeImageIndex]}
                  alt={`${activeCard.title} image ${activeImageIndex + 1}`}
                  className="h-[52vh] w-full rounded-[24px] object-cover animate-[fadeIn_0.35s_ease_both] sm:h-[68vh]"
                />

                {activeCard.images.length > 1 ? (
                  <>
                    <button
                      type="button"
                      className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-xl text-black transition hover:scale-[1.03]"
                      onClick={showPreviousImage}
                      aria-label="Previous image"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-xl text-black transition hover:scale-[1.03]"
                      onClick={showNextImage}
                      aria-label="Next image"
                    >
                      →
                    </button>
                  </>
                ) : null}
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 text-sm text-white/72">
                <p>{activeCard.description}</p>
                <p>
                  {activeImageIndex + 1} / {activeCard.images.length}
                </p>
              </div>

              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/45">
                Swipe on mobile or use arrows to move through the set.
              </p>

              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
                {activeCard.images.map((image, index) => (
                  <button
                    type="button"
                    key={`${activeCard.title}-thumb-${index}`}
                    className={`overflow-hidden rounded-[16px] border transition duration-300 ${
                      index === activeImageIndex ? "border-white" : "border-white/10"
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`View ${activeCard.title} image ${index + 1}`}
                    style={{ animation: "riseIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both", animationDelay: `${80 + index * 55}ms` }}
                  >
                    <img src={image} alt={`${activeCard.title} thumbnail ${index + 1}`} className="h-20 w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}