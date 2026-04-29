"use client";

import { useState } from "react";
import { OnboardingWizard } from "./OnboardingWizard";
import { useOnboarding } from "@/hooks/features/profile/useOnboarding"; // The hook we made

interface OnboardingBotanicalProps {
  user: any;
  onComplete: () => void;
}

export function OnboardingBotanicalTheme({ user, onComplete }: OnboardingBotanicalProps) {
  const { completeOnboarding, loading, error } = useOnboarding();
  
  // 1. Local state to store the selections from the wizard
  const [selections, setSelections] = useState({
    fitnessLevel: "",
    primaryGoal: "",
    dailyActivity: ""
  });

  // 2. The function that actually triggers the "Planting"
  const handleFinalize = async (finalData: typeof selections) => {
    try {
      // Calls our hook which talks to authFetchGraphql -> NestJS
      await completeOnboarding(finalData);
      
      // Tell the parent (the Wrapper) that we are done!
      onComplete(); 
    } catch (err) {
      console.error("Failed to save your soil analysis", err);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#F9F9F7]">
      {/* 3. Render the UI and pass it the data/functions it needs */}
      <OnboardingWizard 
        userName={user.name}
        onFinalize={handleFinalize}
        isLoading={loading}
        serverError={error}
      />
      
      {/* Optional: Add a subtle 'Botanical' branding overlay here */}
      <div className="absolute bottom-4 right-6 opacity-20 pointer-events-none">
          <p className="text-[#2D4A22] font-serif italic text-sm">ReLive Soil Analysis v1.0</p>
      </div>
    </div>
  );
}