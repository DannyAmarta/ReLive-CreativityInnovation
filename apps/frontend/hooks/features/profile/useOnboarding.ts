import { useState } from "react";
import { authFetchGraphql } from "@/lib/fetchGraphQL";
import { UPDATE_PROFILE_MUTATION } from "@/lib/gqlQueries";

export function useOnboarding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeOnboarding = async (selections: {
    fitnessLevel: string;
    primaryGoal: string;
    dailyActivity: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      // We use authFetchGraphql because we need the Bearer token!
      // Inside useOnboarding.ts
        const data = (await authFetchGraphql(UPDATE_PROFILE_MUTATION.loc!.source.body, {
        input: {
            ...selections,
            profileCompleted: true,
            vitalityScore: 15,
        },
        })) as any;

      return data.updateProfile;
    } catch (err: any) {
      const msg = err.message || "Failed to plant your seeds.";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { completeOnboarding, loading, error };
}
