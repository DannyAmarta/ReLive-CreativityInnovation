import type { FoodSearchResponse } from "@/types/food";
import type { RecipeSearchResponse } from "@/types/recipe";
import type {
    GeneratedWorkoutPlan,
    LoggedWorkoutSetPayload,
    SetCalculationResult,
} from "@/types/set";

export type SignUpFormState = {
    data:{
        name?: string,
        email?: string,
        password?: string,
        password2?: string,
    }
    errors?:{
        name?: string[];
        email?: string[];
        password?: string[];
        password2?: string[];
    };
    status?: "success" | "error";
    message?: string;
}| undefined;

export type SignInFormState = {
    data:{
        name?: string,
        email?: string,
        password?: string,
    }
    errors?:{
        name?: string[];
        email?: string[];
        password?: string[];
    };
    status?: "success" | "error";
    message?: string;
}| undefined;

// kita jangan return password kak
export type ForgotPasswordFormState = {
    errors?: {
        email?: string[]
    }
    status?: "success" | "error";
    message?: string
}| undefined;

export type ResetPasswordFormState = {
    errors?: {
        newPassword?: string[]
    }
    status?: "success" | "error";
    message?: string
}| undefined;

export type FoodSearchFormState = {
    data?: {
        query?: string;
        servingSize?: number;
        page?: number;
        limit?: number;
    };
    errors?: {
        query?: string[];
        servingSize?: string[];
        page?: string[];
        limit?: string[];
    };
    status?: "success" | "error";
    message?: string;
    result?: FoodSearchResponse | null;
} | undefined;

export type RecipeSearchFormState = {
    data?: {
        query?: string;
        page?: number;
        limit?: number;
    };
    errors?: {
        query?: string[];
        page?: string[];
        limit?: string[];
    };
    status?: "success" | "error";
    message?: string;
    result?: RecipeSearchResponse | null;
} | undefined;

export type SetCalculatorFormState = {
    data?: {
        exerciseId?: string;
        category?: string;
        weightKg?: number;
        reps?: number;
        rir?: number;
        durationMinutes?: number;
        distanceMeters?: number | "";
        rpe?: number;
        notes?: string;
    };
    errors?: {
        exerciseId?: string[];
        category?: string[];
        weightKg?: string[];
        reps?: string[];
        rir?: string[];
        durationMinutes?: string[];
        distanceMeters?: string[];
        rpe?: string[];
        notes?: string[];
    };
    status?: "success" | "error";
    message?: string;
    result?: SetCalculationResult | null;
} | undefined;

export type SetLogFormState = {
    data?: {
        exerciseId?: string;
        category?: string;
        weightKg?: number;
        reps?: number;
        rir?: number;
        durationMinutes?: number;
        distanceMeters?: number | "";
        rpe?: number;
        notes?: string;
    };
    errors?: {
        exerciseId?: string[];
        category?: string[];
        weightKg?: string[];
        reps?: string[];
        rir?: string[];
        durationMinutes?: string[];
        distanceMeters?: string[];
        rpe?: string[];
        notes?: string[];
    };
    status?: "success" | "error";
    message?: string;
    result?: LoggedWorkoutSetPayload | null;
} | undefined;

export type SetRecommendationFormState = {
    data?: {
        exerciseId?: string;
        phaseGoal?: string;
        days?: number;
        trainingDaysPerWeek?: number;
        targetSets?: number;
        targetReps?: number;
        notes?: string;
    };
    errors?: {
        exerciseId?: string[];
        phaseGoal?: string[];
        days?: string[];
        trainingDaysPerWeek?: string[];
        targetSets?: string[];
        targetReps?: string[];
        notes?: string[];
    };
    status?: "success" | "error";
    message?: string;
    result?: GeneratedWorkoutPlan | null;
} | undefined;

