"use server";

import { redirect } from "next/navigation";
import { fetchGraphql } from "./fetchGraphQL";
import { CREATE_USER_MUTATION } from "./gqlQueries";
import { SignUpFormState } from "./types/formState";
import { SignUpFormSchema } from "./zodSchemas/signUpFormSchema";
import { print } from "graphql";

export async function Register(
    state: SignUpFormState | undefined,
    formData: FormData
): Promise<SignUpFormState> {
    const validatedFields = SignUpFormSchema.safeParse(
        Object.fromEntries(formData.entries())
    )

    if(!validatedFields.success)
        return {
            data: Object.fromEntries(formData.entries()),
            errors: validatedFields.error.flatten().fieldErrors
        }

    const data = await fetchGraphql(print(CREATE_USER_MUTATION), {
        input: {...validatedFields.data}
    })

    if(data.errors)
        return{
            data: Object.fromEntries(formData.entries()),
            message: 'Something went wrong'
        }

    redirect('auth/signIn')
}