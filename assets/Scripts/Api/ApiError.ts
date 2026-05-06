export enum ApiErrorType {
    NETWORK_ERROR = 'NETWORK_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
    SERVER_ERROR = 'SERVER_ERROR',
    BUSINESS_ERROR = 'BUSINESS_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class ApiError extends Error {
    public type: ApiErrorType;
    public code: number;
    public data?: any;

    constructor(type: ApiErrorType, message: string, code: number = 0, data?: any) {
        super(message);
        this.type = type;
        this.code = code;
        this.data = data;
        this.name = 'ApiError';
    }
}