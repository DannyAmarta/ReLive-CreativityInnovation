"use server";

import { redirect } from "next/navigation";
import { fetchGraphql } from "./fetchGraphQL";
import { CREATE_USER_MUTATION, SIGN_IN_MUTATION } from "./gqlQueries";
import { SignInFormState, SignUpFormState } from './types/formState';
import { SignInFormSchema, SignUpFormSchema } from "./zodSchemas/signUpFormSchema";
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
    revalidatePath('/')
    redirect('/')
}

// const async function ResetPassword(
//     formData: FormData
// ): Promise<{
//      async function submit() {
//         await fetch("http://localhost:8000/auth/forgot-password", {
//             method: "POST",

//             headers: { "Content-Type": "application/json" },

//             body: JSON.stringify({
//                 token,

//                 newPassword: password,
//             }),
//         });

//         alert("Reset email sent");
//     }
// }