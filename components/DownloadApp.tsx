import { Apple, PlayCircle } from "lucide-react";

export default function DownloadApp() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl bg-navy-900 px-8 py-16 text-center shadow-soft-lg sm:px-16">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, rgba(79,220,232,0.25), transparent 45%), radial-gradient(circle at 80% 80%, rgba(79,220,232,0.15), transparent 45%)",
            }}
          />
          <div className="relative">
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.15em] text-cyan-300">
              Take Extra Shield with you
            </p>
            <h2 className="mx-auto mt-3 max-w-lg font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Track claims and repairs from your pocket
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#"
                className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[13.5px] font-semibold text-navy-900 transition-transform hover:scale-[1.03]"
              >
                <Apple size={17} />
                App Store
              </a>
              <a
                href="#"
                className="flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-[13.5px] font-semibold text-white transition-transform hover:scale-[1.03]"
              >
                <PlayCircle size={17} />
                Google Play
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}