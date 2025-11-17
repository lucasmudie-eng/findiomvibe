export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border">
      <div className="absolute inset-0">
        <img
          src="/hero/iom-hero.webp"
          alt="Isle of Man coastline"
          className="h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#D90429]/25 via-black/20 to-black/40" />
      </div>

      <div className="relative z-10 p-8 md:p-12 text-white max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Find trusted locals on the Isle of Man
        </h1>
        <p className="mt-3 text-white/90">
          Businesses, marketplace, and what’s on—one hive for everything local.
        </p>
        <div className="mt-6 flex gap-2">
          <a href="/categories" className="rounded-xl bg-white/95 px-4 py-2.5 text-[#D90429] hover:bg-white">
            Browse categories
          </a>
          <a href="/list-business" className="rounded-xl border border-white/70 px-4 py-2.5 hover:bg-white/10">
            List your business
          </a>
        </div>
      </div>
    </section>
  );
}