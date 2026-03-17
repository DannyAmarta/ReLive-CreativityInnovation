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

