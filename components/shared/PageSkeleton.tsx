export function PageSkeleton() {
  return (
    <div
      className="min-h-[60vh] animate-pulse bg-gradient-to-b from-[#FAF6EE] via-[#FFF9F2] to-[#EAF2E8]"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 h-3 w-40 rounded-full bg-[#D4AF37]/25" />
        <div className="mx-auto mb-4 h-10 max-w-lg rounded-lg bg-[#0F2420]/10" />
        <div className="mx-auto mb-12 h-4 max-w-md rounded-full bg-[#0F2420]/8" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="aspect-[16/10] rounded-2xl border border-[#D4AF37]/20 bg-white/50"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
