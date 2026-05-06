export interface CardListData {
    cardId: string;
    cardName: string;
    cardType: string;
    cardValue: number;
}

export interface CardItem {
    favoriteId: string;
    customerId: string;
    gameId: string;
    cardId: string;
    cardNo: string;
    winAmount: number;
    bonus?: number;
    settleTime?: string;
    codes: string;
    createTime: string;
    playType: string;
    unitPrice?: number;
}

export interface CardCollectionData {
    totalElements: number;
    totalPage: number;
    currentPage: number;
    pageSize: number;
    currentSize: number;
    content: CardItem[];
    haveNextPage: boolean;
}

export interface CardDetailData {
    cardId: string;
    cardNo: string;
    betContent: any;
    bonusMultiple: number;
    customerId: string;
    userName: string;
    settleTime: string;
    winAmount: number;
    gameId: string;
    gameName: string;
    favorite: boolean;
    self: boolean;
    luckyColors?: string;
    kenoNumbers?: string;
    playType?: string;
    unitPrice?: number;
    codes?: string;
    dragonGate?: string;
    loginName?: string;
    card1?: string;
    card2?: string;
    pathTrace: string;
}

export interface RecordList {
    currentPage: number;
    currentSize: number;
    haveNextPage: boolean;
    pageSize: number;
    totalElements: number;
    totalPage: number;
    content: RecordItemData[];
}

export interface RecordItemData {
    page: number;
    pageSize: number;
    settleTime: string;
    cardId: string;
    cardNo: string;
    win: boolean;
    gameId: string;
    gameName: string;
    payout: number;
    unitPrice: number;
    status: string;
    codes: string;
    roundNo: string;
    bonusMultiple: number;
    gameType: string;
    playType: string;
    type: string;
}