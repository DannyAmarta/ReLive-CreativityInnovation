import { Sidebar } from "@/components/navigation/Sidebar";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-full bg-zinc-950 text-white font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-0">
        {children}
      </main>
    </div>
  );
}
