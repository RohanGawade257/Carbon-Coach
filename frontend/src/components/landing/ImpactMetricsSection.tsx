const metrics = [
  ["18%", "demo simulation reduction"],
  ["5", "emission categories"],
  ["30", "day action plan"],
  ["4", "sample challenges"]
];

export function ImpactMetricsSection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black text-ink">Impact Metrics</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(([value, label]) => (
            <div key={label} className="rounded-md border border-emerald-100 bg-white p-6 shadow-soft">
              <p className="text-4xl font-black text-forest">{value}</p>
              <p className="mt-2 text-sm font-semibold text-slate-600">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

