export interface BuyCardSuccessData {
    code: number;
    balance: number;
    totalBetAmount: number;
    betData: any[];
    cardsNum: number;
    scratchCardData: TicketItem;
}

export interface RightResultItem {
    index: number;
    codes: number[];
    amount: number;
    win: boolean;
}

export interface TicketItem {
    billId: string;
    cardNo: string;
    cardId: string;
    codes: string;
    sellStatus: string;
    unitPrice: number;
    bonusMultiple: number;
    kenoNumbers: string;
    luckyColors: string;
    dragonGate: string;
    data: string;
    card1: string;
    card2: string;
    extField: string;
}

export interface CurrentCardResult {
    amount: number;
    codes: number[];
    suit: string;
    win: boolean;
    winCodes: {
        card1: number[];
        card2: number[];
    };
}

export interface CurrentTicketList {
    totalElements: number;
    totalPage: number;
    currentPage: number;
    pageSize: number;
    currentSize: number;
    content: TicketItem[];
    haveNextPage: boolean;
}

export interface SettleRes {
    balance: number;
    totalPayout: number;
    settleData: any[];
    cardsNum: number;
    billId: string;
}

export interface DragonGate {
    /**
     * Poker value:
     * A-1, 2-2, 3-3, 4-4, 5-5, 6-6, 7-7, 8-8, 9-9,
     * 10-10, J-11, Q-12, K-13
     */
    code: string;

    /**
     * Suit:
     * SPADES, HEARTS, CLUBS, DIAMONDS
     */
    suit: string;

    amount?: number;
}