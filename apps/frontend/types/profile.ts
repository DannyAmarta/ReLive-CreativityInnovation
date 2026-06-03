type ProfileUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  bio?: string;
  avatar: string | null;
  
  // --- Add these fields here ---
  profileCompleted: boolean;
  vitalityScore: number;
  fitnessLevel: string | null;
  primaryGoal: string | null;
  dailyActivity: string | null;
  // ----------------------------

  hasOpenRouterConnection: boolean;
  openRouterKeyLabel: string | null;
  openRouterConnectedAt: Date | null;
  createdAt: Date;
};

export type ProfilePageClientProps = { user: ProfileUser };
