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
    message?: string;
}| undefined;

