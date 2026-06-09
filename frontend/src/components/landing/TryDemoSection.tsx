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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full md:w-auto">
          <Button onClick={onDemo} isLoading={loading} loadingLabel="Loading demo..." className="bg-green-900 text-ink hover:bg-green-400 w-full sm:w-auto">
            Try Demo Account
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
