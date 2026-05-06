export interface GameResult {
    win: number;
    color: string;
    multiple: number;
    id: string;
    billNo: string;
    isJackpot: boolean;
}

export interface BetRequest {
    gameId: string;
    amount: number;
    betType: string;
    betNumber?: number;
}

export interface BetResponse {
    betId: string;
    result: string;
    winAmount: number;
    newBalance: number;
}

export interface GameHistory {
    id: string;
    gameType: string;
    betAmount: number;
    winAmount: number;
    timestamp: number;
    status: string;
}

export interface ScratchListData {
    gameId: string;
    gameName: string;
    gameType: string;
    playType: string;
    unitPrice: number;
    unitPriceList: number[];
    maxWin: number;
    unusedCount: number;
    bigAmount: string;
    topAmount: string;
    autoPlay: number;
}

export interface GameListItem {
    gameId: string;
    gameName: string;
    gameType: string;
    playType: string;
    unitPrice: number;
    maxWin: number;
    unusedCount: number;
}

export enum AniType {
    none,
    center,
    left,
    right,
    top,
    bottom,
    opacity,
}