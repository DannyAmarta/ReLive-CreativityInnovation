"use client";

export function SetHero() {
  return (
    <div className="space-y-4 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
        Set Lab
      </div>
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
          Log a set, preview your strength, and build the next routine.
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
          Choose a movement, record what you just did, and turn it into a safer
          next session in one flow.
        </p>
      </div>
    </div>
  );
}
