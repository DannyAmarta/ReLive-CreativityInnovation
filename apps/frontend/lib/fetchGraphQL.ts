import { BACKEND_URL } from "./constants";

export const fetchGraphql = async <T = any>(query: string, variables?: {}): Promise<T> => {
    let response: Response;

    try {
        response = await fetch(`${BACKEND_URL}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            cache: 'no-store',
            body: JSON.stringify({
                query,
                variables
            })
        });
    } catch (error) {
        throw new Error(getNetworkErrorMessage(error));
    }

    const result = await readGraphqlResponse(response);

    if (!response.ok) {
        throw new Error(result.errorMessage ?? `GraphQL request failed with status ${response.status}.`);
    }

    if (result.payload?.errors?.length) {
        console.error('Graphql Error:', result.payload.errors);
        throw new Error(result.payload.errors[0]?.message ?? 'GraphQL request failed.');
    }

    return result.payload?.data as T;
}

export const authFetchGraphql = async <T = any>(query: string, variables?: {}): Promise<T> => {
    // The authenticated helper is server-only because it depends on cookies.
    // We import the session helper lazily so plain client-side GraphQL fetches
    // can still bundle safely.
    const { getSession } = await import("./session.server");
    const session = await getSession();
    let response: Response;

    try {
        response = await fetch(`${BACKEND_URL}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session?.accessToken}`
            },
            cache: 'no-store',
            body: JSON.stringify({
                query,
                variables
            })
        });
    } catch (error) {
        throw new Error(getNetworkErrorMessage(error));
    }

    const result = await readGraphqlResponse(response);

    if (!response.ok) {
        throw new Error(result.errorMessage ?? `GraphQL request failed with status ${response.status}.`);
    }

    if (result.payload?.errors?.length) {
        console.error('Graphql Error:', result.payload.errors);
        throw new Error(result.payload.errors[0]?.message ?? 'Failed to fetch the data from graphql');
    }

     return result.payload?.data as T;
}

type GraphqlResponsePayload = {
    data?: unknown;
    errors?: Array<{ message?: string }>;
    message?: string;
};

async function readGraphqlResponse(response: Response): Promise<{
    payload: GraphqlResponsePayload | null;
    errorMessage: string | null;
}> {
    const rawText = await response.text();

    if (!rawText) {
        return {
            payload: null,
            errorMessage: response.ok ? null : 'The backend returned an empty response.',
        };
    }

    try {
        const payload = JSON.parse(rawText) as GraphqlResponsePayload;
        return {
            payload,
            errorMessage: payload.message ?? payload.errors?.[0]?.message ?? null,
        };
    } catch {
        return {
            payload: null,
            errorMessage: rawText.trim() || 'The backend returned a non-JSON response.',
        };
    }
}

function getNetworkErrorMessage(error: unknown) {
    if (error instanceof Error && error.message) {
        return `Unable to reach the backend at ${BACKEND_URL}. ${error.message}`;
    }

    return `Unable to reach the backend at ${BACKEND_URL}.`;
}
