export interface SessionInfo {
    sessionId: string;
}

export interface ApiResponse<T> {
    code: number;
    success: boolean;
    data: T;
    message: string;
    msg: string;
}

export interface ConnectResp {
    agent: string;
    currency: string;
    customerId: string;
    productId: string;
    token: string;
    userName: string;
}

export interface LoginResp {
    token: string;
    gameUrl: string;
}