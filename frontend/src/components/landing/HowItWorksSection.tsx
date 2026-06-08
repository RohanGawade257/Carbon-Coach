import { Calculator, LineChart, Target } from "lucide-react";

const steps = [
  { title: "Calculate", copy: "Log everyday activity and calculate kg CO2e with seeded emission factors.", icon: Calculator },
  { title: "Understand", copy: "See charts with explanation panels that name the biggest drivers.", icon: LineChart },
  { title: "Reduce", copy: "Use Carbon Twin recommendations, challenges, badges, and progress tracking.", icon: Target }
];

export function HowItWorksSection() {
  return (
    <section className="bg-[#f6faf7] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black text-ink">How It Works</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map(({ title, copy, icon: Icon }) => (
            <div key={title} className="rounded-md border border-emerald-100 bg-white p-6 shadow-soft">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-mint text-forest">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

