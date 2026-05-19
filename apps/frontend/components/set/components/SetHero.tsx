"use client";

export function SetHero() {
  return (
    <div className="space-y-5 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-sage-100/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-sage-800">
        <span className="h-1.5 w-1.5 rounded-full bg-terracotta-400" />
        Set Lab
      </div>
      <div className="space-y-4">
        <h1 className="font-serif text-4xl font-medium tracking-tight text-olive-900 sm:text-5xl">
          Log a set, uncover your strength, and shape the next session.
        </h1>
        <p className="mx-auto max-w-2xl font-sans text-base leading-relaxed text-stone-600">
          Pick an exercise, record your set, and get a smart recommendation for what comes next.
        </p>
      </div>
    </div>
  );
}
