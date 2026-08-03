"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const slides = [
  {
    src: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1600&auto=format&fit=crop",
    alt: "A smartphone protected under an Extra Shield plan",
  },
  {
    src: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=1600&auto=format&fit=crop",
    alt: "Person holding a smartphone in a protective case",
  },
  {
    src: "https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=1600&auto=format&fit=crop",
    alt: "Technician repairing a smartphone screen",
  },
  {
    src: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1600&auto=format&fit=crop",
    alt: "Close-up of a smartphone camera module",
  },
];

const AUTOPLAY_MS = 4500;

/**
 * Standalone, clean photo banner — no text overlaid on the photos.
 * Just the slideshow, a subtle gradient for edge polish, and nav controls.
 */
export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), []);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + slides.length) % slides.length),
    []
  );

  useEffect(() => {
    const t = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [next]);

  return (
    <div className="relative h-[320px] w-full overflow-hidden sm:h-[420px] lg:h-[500px]">
      <AnimatePresence mode="sync">
        <motion.img
          key={slides[index].src}
          src={slides[index].src}
          alt={slides[index].alt}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>

      {/* subtle edge polish only — photos stay clean and unobstructed */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/25 via-transparent to-transparent" />

      {/* arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 sm:left-6"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 sm:right-6"
      >
        <ChevronRight size={20} />
      </button>

      {/* dots */}
      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((s, i) => (
          <button
            key={s.src}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-cyan-400" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}