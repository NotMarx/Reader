export class APIError extends Error {

    /**
     * The error response
     */
    response: Record<string, unknown>;

    /**
     * The Endpoint URL that caused the error
     */
    url: string;

    constructor(response: Record<string, unknown>, url: string) {
        super(JSON.stringify(response));

        this.response = response;
        this.url = url;
        this.name = "APIError";
        Error.captureStackTrace(this, APIError);
    }
}
