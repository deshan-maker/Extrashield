const brands = [
  "Apple",
  "Samsung",
  "Google Pixel",
  "Xiaomi",
  "OnePlus",
  "Huawei",
  "Oppo",
  "Vivo",
];

export default function TrustedBy() {
  return (
    <section className="border-y border-soft py-10">
      <div className="mx-auto max-w-6xl px-4">
        <p className="mb-6 text-center text-[11.5px] font-semibold uppercase tracking-[0.15em] text-secondary">
          Coverage built for every major device brand
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {brands.map((b) => (
            <span
              key={b}
              className="font-display text-[15px] font-bold text-secondary/70 transition-colors hover:text-cyan-500"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
