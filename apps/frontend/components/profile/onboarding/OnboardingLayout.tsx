"use client";

import { useRouter } from "next/navigation";
import { OnboardingBotanicalTheme } from "./OnboardingBotanicalTheme";

interface OnboardingLayoutWrapperProps {
  initialUser: any;
}

export function OnboardingLayout({ initialUser }: OnboardingLayoutWrapperProps) {
  const router = useRouter();

  const handleRefresh = () => {
    /**
     * router.refresh() tells Next.js to re-run the Server Components (like HomeLayout).
     * Since the database now has 'profileCompleted: true', the layout will
     * stop rendering this onboarding and finally show the Sidebar/Dashboard.
     */
    router.refresh();
  };

  return (
    // This ensures the onboarding covers the entire screen, blocking the zinc-950 dashboard
    <div className="fixed inset-0 z-[9999] bg-white overflow-hidden">
      <OnboardingBotanicalTheme user={initialUser} onComplete={handleRefresh} />
    </div>
  );
}