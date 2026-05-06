export interface GetUserBalanceSuccessData {
    userName: string;
    currency: string;
    balance: number;
}

export interface UserInfo {
    userId: string;
    userName: string;
    balance: number;
    avatar: string;
    level: number;
}