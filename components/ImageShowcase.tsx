"use client";

import { motion } from "framer-motion";

const images = [
  {
    src: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=900&auto=format&fit=crop",
    alt: "Person holding a smartphone with a protective case",
    caption: "Coverage that travels with the device",
    span: "lg:col-span-2 lg:row-span-2",
    float: 7,
  },
  {
    src: "https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=700&auto=format&fit=crop",
    alt: "Technician repairing a smartphone screen",
    caption: "Repairs tracked end to end",
    span: "",
    float: 5.5,
  },
  {
    src: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=700&auto=format&fit=crop",
    alt: "Close-up of a smartphone camera module",
    caption: "Every claim backed by AI inspection",
    span: "",
    float: 6.5,
  },
];

export default function ImageShowcase() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.15em] text-cyan-500">
            See It In Action
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Protection you can actually see
          </h2>
          <p className="mt-4 text-[14.5px] leading-relaxed text-secondary">
            From the moment a device is registered to the moment a repair
            is complete, Extra Shield stays with it.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:auto-rows-[220px] lg:grid-cols-3">
          {images.map((img, i) => (
            <motion.div
              key={img.alt}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className={`group relative overflow-hidden rounded-3xl shadow-soft ${img.span}`}
            >
              <motion.img
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: img.float,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                src={img.src}
                alt={img.alt}
                className="h-64 w-full scale-105 object-cover transition-transform duration-700 group-hover:scale-110 lg:h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/10 to-transparent" />
              <p className="absolute bottom-4 left-4 right-4 text-[13px] font-semibold text-white">
                {img.caption}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}