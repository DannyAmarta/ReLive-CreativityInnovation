"use server";

import { redirect } from "next/navigation";
import { fetchGraphql } from "./fetchGraphQL";
import {
    CREATE_USER_MUTATION,
    FORGOT_PASSWORD,
    RESET_PASSWORD,
    SIGN_IN_MUTATION,
} from "./gqlQueries";
import {
    ForgotPasswordFormState,
    ResetPasswordFormState,
    SignInFormState,
    SignUpFormState,
} from "./types/formState";
import {
    ForgotPasswordSchema,
    ResetPasswordSchema,
    SignInFormSchema,
    SignUpFormSchema,
} from "./zodSchemas/signUpFormSchema";
import { decodeJwt } from "jose";
import { print } from "graphql";
import { revalidatePath } from "next/cache";
import { createSession } from "./session.server";

// This server action validates registration input and asks the backend to send an activation email.
// It is used only by the register page so the frontend never stores passwords outside the submitted request.
export async function Register(
    state: SignUpFormState | undefined,
    formData: FormData,
): Promise<SignUpFormState> {
    const rawData = {
        name: formData.get("name")?.toString() || "",
        email: formData.get("email")?.toString() || "",
        password: formData.get("password")?.toString() || "",
        password2: formData.get("password2")?.toString() || "",
    };

    const captchaToken = formData.get("cf-turnstile-response")?.toString() || "";

    const validatedFields = SignUpFormSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            data: rawData,
            errors: validatedFields.error.flatten().fieldErrors,
            status: "error",
        };
    }

    const { password2, ...userInput } = validatedFields.data;

    try {
        const data = (await fetchGraphql(print(CREATE_USER_MUTATION), {
            input: {
                ...userInput,
                captchaToken,
            },
        })) as any;

        return {
            data: {
                name: "",
                email: validatedFields.data.email,
            },
            message:
                data?.register?.message ??
                "Check your email to activate your account.",
            status: "success",
        };
    } catch (e: any) {
        return {
            data: rawData,
            message: e.message,
            status: "error",
        };
    }
}

// This server action validates local login and creates the encrypted Next.js session cookie.
// It is used only by the login form after the backend returns a valid auth payload.
export async function Login(
    state: SignInFormState | undefined,
    formData: FormData,
): Promise<SignInFormState> {
    const rawData = {
        email: formData.get("email")?.toString() || "",
        password: formData.get("password")?.toString() || "",
    };

    const validatedFields = SignInFormSchema.safeParse(rawData);
    if (!validatedFields.success) {
        return {
            data: rawData,
            errors: validatedFields.error.flatten().fieldErrors,
            status: "error",
        };
    }

    let data;

    try {
        data = (await fetchGraphql(print(SIGN_IN_MUTATION), {
            input: validatedFields.data,
        })) as any;
    } catch (e: any) {
        return {
            data: rawData,
            message: e.message,
            status: "error",
        };
    }

    let role: string | undefined;
    try {
        const decoded = decodeJwt(data.signIn.accessToken);
        if (typeof decoded.role === "string") {
            role = decoded.role;
        }
    } catch {
        // ignore decode errors
    }

    await createSession({
        user: {
            id: String(data.signIn.id),
            name: data.signIn.name,
            avatar: data.signIn.avatar,
            role: role as "USER" | "TRAINER" | "ADMIN" | undefined,
        },
        accessToken: data.signIn.accessToken,
    });

    const redirectPath = role === "TRAINER" || role === "ADMIN" ? "/trainer" : "/client";
    revalidatePath(redirectPath);
    redirect(redirectPath);
}

// This server action starts the reset-password email flow.
// It is used by the forgot-password page and always returns a privacy-safe message to the UI.
export async function ForgotPasswordQuery(
    state: ForgotPasswordFormState | undefined,
    formData: FormData,
): Promise<ForgotPasswordFormState> {
    const rawData = {
        email: formData.get("email")?.toString() || "",
    };

    const validatedFields = ForgotPasswordSchema.safeParse(rawData);
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            status: "error",
        };
    }

    try {
        await fetchGraphql(print(FORGOT_PASSWORD), {
            input: validatedFields.data,
        });
    } catch {
        return {
            message: "We could not send the reset email right now. Please try again.",
            status: "error",
        };
    }

    return {
        message: "If the email exists, a reset link has been sent.",
        status: "success",
    };
}

// This server action validates the reset form and sends the token/new password to the backend.
// It is used by the reset-password page after the user opens the reset link from email.
export async function ResetPasswordQuery(
    state: ResetPasswordFormState | undefined,
    formData: FormData,
): Promise<ResetPasswordFormState> {
    const rawData = {
        token: formData.get("token")?.toString() || "",
        newPassword: formData.get("newPassword")?.toString() || "",
    };

    const validationFields = ResetPasswordSchema.safeParse(rawData);

    if (!validationFields.success) {
        return {
            errors: validationFields.error.flatten().fieldErrors,
            status: "error",
        };
    }

    try {
        await fetchGraphql(print(RESET_PASSWORD), {
            input: validationFields.data,
        });
    } catch {
        return {
            message:
                "We could not reset the password. Please request a new reset link.",
            status: "error",
        };
    }

    return {
        message: "Password successfully reset.",
        status: "success",
    };
}
