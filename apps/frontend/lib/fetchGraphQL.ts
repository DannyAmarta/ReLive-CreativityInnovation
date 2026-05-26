import { BACKEND_URL } from "./constants";

type GraphqlErrorPayload = {
    message?: string;
    extensions?: Record<string, unknown>;
};

export class GraphqlRequestError extends Error {
    responseStatus: number;
    graphqlErrors: GraphqlErrorPayload[];
    isAuthenticationFailure: boolean;

    constructor(
        message: string,
        responseStatus: number,
        graphqlErrors: GraphqlErrorPayload[],
        isAuthenticationFailure = false,
    ) {
        super(message);
        this.name = "GraphqlRequestError";
        this.responseStatus = responseStatus;
        this.graphqlErrors = graphqlErrors;
        this.isAuthenticationFailure = isAuthenticationFailure;
    }
}

export function isGraphqlRequestError(error: unknown): error is GraphqlRequestError {
    return error instanceof GraphqlRequestError;
}

export function isAuthenticationGraphqlError(
    error: unknown,
): error is GraphqlRequestError {
    return error instanceof GraphqlRequestError && error.isAuthenticationFailure;
}

export function isThrottledGraphqlError(error: unknown): boolean {
    if (error instanceof GraphqlRequestError) {
        return error.graphqlErrors.some(
            (err) =>
                err.message?.includes("ThrottlerException") ||
                err.message?.toLowerCase().includes("too many requests"),
        );
    }
    if (error instanceof Error) {
        return (
            error.message.includes("ThrottlerException") ||
            error.message.toLowerCase().includes("too many requests")
        );
    }
    return false;
}

export const fetchGraphql = async <T = unknown>(
    query: string,
    variables?: Record<string, unknown>,
): Promise<T> => {
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

    if (!response.ok || result.payload?.errors?.length) {
        const graphqlErrors = result.payload?.errors ?? [];
        const authenticationFailure = isAuthenticationFailure(
            response.status,
            graphqlErrors,
            result.errorMessage,
        );

        if (authenticationFailure) {
            console.warn('Graphql Auth Warning:', graphqlErrors);
        } else {
            console.error('Graphql Error:', graphqlErrors);
        }

        throw new GraphqlRequestError(
            result.errorMessage ?? `GraphQL request failed with status ${response.status}.`,
            response.status,
            graphqlErrors,
            authenticationFailure,
        );
    }

    return result.payload?.data as T;
}

export const authFetchGraphql = async <T = unknown>(
    query: string,
    variables?: Record<string, unknown>,
): Promise<T> => {
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

    if (!response.ok || result.payload?.errors?.length) {
        const graphqlErrors = result.payload?.errors ?? [];
        const authenticationFailure = isAuthenticationFailure(
            response.status,
            graphqlErrors,
            result.errorMessage,
        );

        if (authenticationFailure) {
            console.warn('Graphql Auth Warning:', graphqlErrors);
        } else {
            console.error('Graphql Error:', graphqlErrors);
        }

        throw new GraphqlRequestError(
            result.errorMessage ?? `GraphQL request failed with status ${response.status}.`,
            response.status,
            graphqlErrors,
            authenticationFailure,
        );
    }

     return result.payload?.data as T;
}

type GraphqlResponsePayload = {
    data?: unknown;
    errors?: GraphqlErrorPayload[];
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

function isAuthenticationFailure(
    responseStatus: number,
    graphqlErrors: GraphqlErrorPayload[],
    errorMessage: string | null,
) {
    if (responseStatus === 401) {
        return true;
    }

    const messages = [
        errorMessage,
        ...graphqlErrors.map((error) => error.message),
    ]
        .filter((message): message is string => typeof message === "string")
        .map((message) => message.toLowerCase());

    return messages.some(
        (message) =>
            message.includes("not authenticated") ||
            message.includes("invalid or expired token") ||
            message.includes("unauthorized"),
    );
}
