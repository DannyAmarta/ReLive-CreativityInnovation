import { z } from "zod"; 

export const SignUpFormSchema = z
.object({
    name: z.string().min(2).trim(),
    email: z.string().email(),
    password: z
        .string()
        .min(8)
        .regex(/[a-zA-Z]/, { message: "Contain at least one letter."})
        .regex(/[0-9]/, { message: "Contain at least one number."})
        .regex(/[^a-zA-Z0-9]/, { message: "Contain at least one special letter."})
        .trim(),
    password2: z.string()
})
.refine((data) => data.password === data.password2, {
    message: "Passwords do not match",
    path: ['password2']
})

export const SignInFormSchema = z.object({
    email: z.string().email(),
    password: z
        .string()
        .min(8)
        .regex(/[a-zA-Z]/, { message: "Contain at least one letter."})
        .regex(/[0-9]/, { message: "Contain at least one number."})
        .regex(/[^a-zA-Z0-9]/, { message: "Contain at least one special letter."})
        .trim(),
})

export const ForgotPasswordSchema = z.object({
    email: z.string().email()
})

export const ResetPasswordSchema = z.object({
    token: z.string().min(1, "Invalid reset token"),
    newPassword: z
        .string()
        .min(8)
        .regex(/[a-zA-Z]/, { message: "Contain at least one letter."})
        .regex(/[0-9]/, { message: "Contain at least one number."})
        .regex(/[^a-zA-Z0-9]/, { message: "Contain at least one special letter."})
        .trim(),
})