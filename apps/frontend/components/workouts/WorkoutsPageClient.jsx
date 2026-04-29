import { useState } from "react";

export default function WorkoutsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-[#2D4A22]">Workout Archive</h1>
      <p className="text-[#8C8C8C] mt-2 uppercase tracking-widest text-xs">
        Documenting your physical vitality
      </p>
      
      {/* Your workout tracking UI will go here */}
      <div className="mt-8 h-64 w-full rounded-3xl border border-dashed border-[#DDE1DF] flex items-center justify-center text-[#DDE1DF]">
        No active logs in the archive yet.
      </div>
    </div>
  );
}