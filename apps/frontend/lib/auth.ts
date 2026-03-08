"use server";

import { redirect } from "next/navigation";
import { fetchGraphql } from "./fetchGraphQL";
import { CREATE_USER_MUTATION, SIGN_IN_MUTATION } from "./gqlQueries";
import { SignInFormState, SignUpFormState } from './types/formState';
import { SignInFormSchema, SignUpFormSchema } from "./zodSchemas/signUpFormSchema";
import { print } from "graphql";
import { revalidatePath } from "next/cache";

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

    redirect('/auth/login')

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

    try{
        const data = await fetchGraphql(print(SIGN_IN_MUTATION), {
            input:  validatedFields.data
        })
     } catch (e:any){
        console.error('Login error', e);

        return{
            data: rawData,
            message: e.message
        }
    }
    revalidatePath('/')
    redirect('/')
}