import { Bot } from "lucide-react";

export function AiCoachSection() {
  return (
    <section className="bg-[#f6faf7] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-sky-100 text-skyline">
            <Bot className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="text-3xl font-black text-ink">AI Coach</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            The chat coach uses Carbon Twin context, recent entries, and the active action plan to give relevant sustainability guidance.
          </p>
        </div>
      </div>
    </section>
  );
}

