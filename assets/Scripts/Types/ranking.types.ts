export interface BigPrizeRankingData {
    totalElements: number;
    totalPage: number;
    currentPage: number;
    pageSize: number;
    currentSize: number;
    content: BigPrizeRanking[];
    haveNextPage: boolean;
}

export interface BigPrizeRanking {
    announcementType: string;
    userName: string;
    cardId: string;
    cardNo: string;
    batchNo: string;
    codes: string;
    bonus: number;
    winAmount: number;
    gameId: string;
    gameType: string;
    playType: string;
    gameName: string;
    unitPrice: number;
    settleTime: string;
    favorite: boolean;
}

export interface SaleRanking {
    userName: string;
    gameId: string;
    gameName: string;
    gameType: string;
    playType: string;
    totalSales: number;
    reachTime: string;
    status: string;
}

export interface TopPrizeRanking {
    totalElements: number;
    totalPage: number;
    currentPage: number;
    pageSize: number;
    currentSize: number;
    content: BigPrizeRanking[];
    haveNextPage: boolean;
    total: BigPrizeRanking;
}

export interface RankData {
    bigPrizeRanking: BigPrizeRankingData;
    saleRanking: SaleRanking[];
    topPrizeRanking: TopPrizeRanking;
}