import { BACKEND_URL } from "./constants";
import { getSession } from "./session.server";

export const fetchGraphql = async (query: string, variables?: {}) => {

    const response = await fetch(`${BACKEND_URL}/graphql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query,
            variables
        })
    })

    const result = await response.json()

    if(result.errors){
        console.error('Graphql Error:', result.errors);
        throw new Error(result.errors[0].message)
    }
    return result.data
}

export const authFetchGraphql = async (query: string, variables?: {}) => {
    const session = await getSession()
    const response = await fetch(`${BACKEND_URL}/graphql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({
            query,
            variables
        })
    })
    const result = await response.json()
    if(result.errors){
        console.error('Graphql Error:', result.errors);
        throw new Error('Failed to fetch the data from graphql')
    }
     return result.data
}
