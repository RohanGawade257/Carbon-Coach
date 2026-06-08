import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";

export function TryDemoSection({ onDemo, loading }: { onDemo: () => void; loading: boolean }) {
  return (
    <section className="bg-forest py-16 text-white">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
        <div>
          <h2 className="text-3xl font-black">Try the full demo instantly.</h2>
          <p className="mt-2 text-emerald-50">No registration required. Demo profile, footprint data, Carbon Twin, action plan, badges, and AI chat are preloaded.</p>
        </div>
        <Button onClick={onDemo} isLoading={loading} loadingLabel="Loading demo..." className="bg-white text-ink hover:bg-mint">
          Try Demo Account
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
