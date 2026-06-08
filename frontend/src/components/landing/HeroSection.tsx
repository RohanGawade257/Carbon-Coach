import { ArrowRight, Leaf } from "lucide-react";
import { Button } from "../ui/Button";

export function HeroSection({ onDemo, loading }: { onDemo: () => void; loading: boolean }) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1800&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto grid min-h-[86vh] max-w-7xl content-center gap-8 px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
            <Leaf className="h-4 w-4" aria-hidden="true" />
            AI-powered personal sustainability
          </div>
          <h1 className="max-w-3xl text-5xl font-black leading-tight sm:text-6xl lg:text-7xl">Carbon Coach</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50">
            Calculate your footprint, understand the why behind every chart, and reduce emissions with a practical Carbon Twin action plan.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button onClick={onDemo} disabled={loading} className="bg-white text-ink hover:bg-mint">
              Try Demo Account
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <a className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md border border-white/40 px-4 py-2 text-sm font-semibold hover:bg-white/10" href="/register">
              Create Account
            </a>
          </div>
        </div>
        <div className="grid max-w-4xl gap-3 sm:grid-cols-3">
          {[
            ["Calculate", "Track transport, food, energy, shopping, and waste."],
            ["Understand", "Every metric includes a plain-English AI explanation."],
            ["Reduce", "Follow a 30-day plan powered by your Carbon Twin."]
          ].map(([title, copy]) => (
            <div key={title} className="rounded-md border border-white/20 bg-white/10 p-4 backdrop-blur">
              <p className="font-bold">{title}</p>
              <p className="mt-1 text-sm text-emerald-50">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

