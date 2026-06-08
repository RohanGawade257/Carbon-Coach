import { Leaf } from "lucide-react";

export function CarbonTwinSection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-mint text-forest">
            <Leaf className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="text-3xl font-black text-ink">Carbon Twin</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Carbon Twin keeps the MVP focused: top emission source, biggest opportunity, user goal, constraints, and a simple monthly baseline.
          </p>
        </div>
        <div className="rounded-md border border-emerald-100 bg-[#f6faf7] p-6 shadow-soft">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md bg-white p-4">
              <dt className="text-xs font-bold uppercase text-slate-500">Top emission source</dt>
              <dd className="mt-1 text-lg font-bold text-ink">Transport</dd>
            </div>
            <div className="rounded-md bg-white p-4">
              <dt className="text-xs font-bold uppercase text-slate-500">Biggest opportunity</dt>
              <dd className="mt-1 text-lg font-bold text-ink">Replace short car trips</dd>
            </div>
            <div className="rounded-md bg-white p-4 sm:col-span-2">
              <dt className="text-xs font-bold uppercase text-slate-500">Action plan</dt>
              <dd className="mt-1 text-lg font-bold text-ink">30 days of practical reductions</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

