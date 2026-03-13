"use server";

import { redirect } from "next/navigation";
import { fetchGraphql } from "./fetchGraphQL";
import { CREATE_USER_MUTATION, FORGOT_PASSWORD, RESET_PASSWORD, SIGN_IN_MUTATION } from "./gqlQueries";
import { ForgotPasswordFormState, ResetPasswordFormState, SignInFormState, SignUpFormState } from './types/formState';
import { ForgotPasswordSchema, ResetPasswordSchema, SignInFormSchema, SignUpFormSchema } from "./zodSchemas/signUpFormSchema";
import { print } from "graphql";
import { revalidatePath } from "next/cache";
import { createSession } from "./session.server";
import ResetPassword from '../app/auth/reset-password/page';

export async function Register(
    state: SignUpFormState | undefined,
    formData: FormData
): Promise<SignUpFormState> {
    
    // cara lama kurang safety dari zod
    // const rawData = Object.fromEntries(formData.entries())
    const rawData = {
        name: formData.get("name")?.toString() || "",
        email: formData.get("email")?.toString() || "",
        password: formData.get("password")?.toString() || "",
        password2: formData.get("password2")?.toString() || "",
    }
    console.log("FORM DATA:", rawData)

    const validatedFields = SignUpFormSchema.safeParse(rawData)

    console.log("VALIDATION RESULT:", validatedFields)

    if(!validatedFields.success){
        return {
            data: rawData,
            errors: validatedFields?.error?.flatten().fieldErrors
        }
    }
    
    const {password2, ...userInput} = validatedFields.data

    try{
        const data = await fetchGraphql(print(CREATE_USER_MUTATION), {
            input: userInput
        })

    } catch (e: any){
        console.error("Register error", e);
        
        return{
            data: rawData,
            message: e.message
        }
    }
    
    // redirect('/auth/login')
    redirect('/api/auth/activate/')
}

export async function Login(
    state: SignInFormState | undefined,
    formData: FormData
): Promise<SignInFormState> {

    const rawData = {
        email: formData.get('email')?.toString() || '',
        password: formData.get('password')?.toString() || ''
    }
    console.log("Login data raw", rawData)

    const validatedFields = SignInFormSchema.safeParse(rawData)
    console.log("VALIDATION RESULT:", validatedFields)
    if(!validatedFields.success){
        return{
            data: rawData,
            errors: validatedFields?.error?.flatten().fieldErrors
        }
    }

    let data;

    try{
        data = await fetchGraphql(print(SIGN_IN_MUTATION), {
            input:  validatedFields.data
        })
    } catch (e:any){
        console.error('Login error', e);

        return{
            data: rawData,
            message: e.message
        }
    }

    // bedanya di sini kita pake session kalo login
    await createSession({
        user:{
            id: data.signIn.id,
            name: data.signIn.name,
            avatar: data.signIn.avatar
        },
        accessToken: data.signIn.accessToken
    })
    revalidatePath('/home/')
    redirect('/home/')
}

export async function ForgotPasswordQuery(
    state: ForgotPasswordFormState | undefined,
    formData: FormData
): Promise<ForgotPasswordFormState> {
    const rawData = {
        email: formData.get('email')?.toString() || ''
    }
    console.log('Forgot password raw data:', rawData)

    const validatedFields = ForgotPasswordSchema.safeParse(rawData)
    console.log("VALIDATED RESULT:", validatedFields)
    if(!validatedFields.success){
        return{
            errors: validatedFields?.error?.flatten().fieldErrors
        }
    }

    try{
        const data = await fetchGraphql(print(FORGOT_PASSWORD),{
            input: validatedFields.data
        })
    } catch (e: any){
        console.error('Forgot password error', e);
        
        return{
            message: e.message
        }
    }
    return {
        message: "Please check your email now."
    }
}

export async function ResetPasswordQuery(
    state: ResetPasswordFormState | undefined,
    formData: FormData
): Promise<ResetPasswordFormState> {
    
    const rawData = {
        token: formData.get('token')?.toString() || '',
        newPassword: formData.get('newPassword')?.toString() || '',
    }
    console.log("Reset password data raw", rawData)

    const validationFields = ResetPasswordSchema.safeParse(rawData)
    console.log("VALIDATION RESULT:", validationFields)

    if(!validationFields.success){
        return{
            errors: validationFields?.error?.flatten().fieldErrors
        }
    }

    try{
        const data = await fetchGraphql(print(RESET_PASSWORD), {
            input: validationFields.data
        })
    } catch (e: any) {
        console.error("Reset password error:", e);
        
        return{
            message: e.message
        }
    }

    return {
        message: "Password successfully reset."
    }
}
