import { LazyWorldScene } from "@/components/world/LazyWorldScene";
import { NewWorldScene } from "@/components/world/NewWorldScene";

export default function WorldPage() {
  return (
    <main className="w-full h-screen bg-[#87CEEB]">
      <LazyWorldScene />
      <NewWorldScene/>
    </main>
  );
}
