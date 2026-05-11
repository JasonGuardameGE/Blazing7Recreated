import { request } from './ApiCore';

import {
    ApiResponse,
    BigPrizeRankingData,
    ScratchListData,
    CurrentTicketList,
    TopPrizeRanking,
    SaleRanking,
} from '../Types';

import logger from '../utils/logger';
//import PLK from '../PLK';
//import { MessageFlag } from '../manager/MessageFlag';

/**
 * 统一的API请求处理函数
 * @param method HTTP方法
 * @param url 请求URL
 * @param params 请求参数
 * @param apiName API名称（用于日志）
 * @returns 成功时返回data，失败时抛出错误
 */
const apiRequestPromiseMap = new Map<string, Promise<any>>();
const API_REQUEST_DEBOUNCE_TIME = 200; // ms

function getDebounceKey(method: string, url: string, params: any): string {
    return `${method}|${url}|${JSON.stringify(params)}`;
}

async function apiRequest<T>(
    method: 'get' | 'post',
    url: string,
    params: any,
    apiName: string,
    showLoading: boolean = true,
    showLoadingMask: boolean = false,
    callback?: (res: T) => void,
    errorCallback?: (res: any) => void
): Promise<T> {
    const debounceKey = getDebounceKey(method, url, params);

    const p = (async () => {
        let loadingTimer: ReturnType<typeof setTimeout> | null = null;
        let loadingTimerMask: ReturnType<typeof setTimeout> | null = null;
        let isLoadingShown = false;
        let isLoadingShownMask = false;

        if (showLoading) {
            loadingTimer = setTimeout(() => {
                //PLK.event.emit(MessageFlag.SHOW_API_LOADING);
                isLoadingShown = true;
            }, 1000);
        }

        if (showLoadingMask) {
            loadingTimerMask = setTimeout(() => {
                //PLK.event.emit(MessageFlag.SHOW_API_LOADING_MASK);
                isLoadingShownMask = true;
            }, 1000);
        }

        try {
            const response = await request<ApiResponse<T>>(method, url, params);

            if (response.code === 200) {
                if (callback) {
                    callback(response.data);
                }

                return response.data;
            }

            const errorMsg = `${apiName}失败: ${response.msg || '未知错误'}`;
            logger.error(`[GameApi] ${errorMsg}`, response);

            if (callback) {
                callback(null as any);
            }

            if (errorCallback) {
                errorCallback(response);
            }

            return null as any as T;

        } catch (error) {
            logger.error(`[GameApi] ${apiName}请求异常:`, error);

            if (callback) {
                callback(null as any);
            }

            if (errorCallback) {
                errorCallback(error);
            }

            return null as any as T;

        } finally {
            if (loadingTimer) {
                clearTimeout(loadingTimer);
            }

            if (loadingTimerMask) {
                clearTimeout(loadingTimerMask);
            }

            if (isLoadingShown) {
                //PLK.event.emit(MessageFlag.HIDE_API_LOADING);
            }

            if (isLoadingShownMask) {
                //PLK.event.emit(MessageFlag.HIDE_API_LOADING_MASK);
            }

            setTimeout(() => apiRequestPromiseMap.delete(debounceKey), API_REQUEST_DEBOUNCE_TIME);
        }
    })();

    apiRequestPromiseMap.set(debounceKey, p);
    return p;
}

// 查询当前所有可玩的游戏剩余卡片
export async function getScratchList(params?: any): Promise<ScratchListData[]> {
    return apiRequest<ScratchListData[]>(
        'post',
        '/api/lotto/scratch/egame/list',
        params,
        '查询当前所有可玩的游戏',
        false
    );
}

// 请求游戏卡片列表
export async function getCardList(params: {
    page: number,
    pageSize: number,
    type: 3 | 4 | null,
    gameId: string,
    extField?: string
}): Promise<CurrentTicketList> {
    return apiRequest<CurrentTicketList>(
        'post',
        '/api/lotto/scratch/scratch/queryCards',
        params,
        '查询游戏卡片列表',
        false
    );
}

// 购买卡片
export async function buyCard(params: {
    gameId: string,
    betType?: number,
    unitPrice?: string,
    quantity?: number,
    expand1?: string,
    expand2?: string,
    showLoading?: boolean,
    showLoadingMask?: boolean,
}, callback?: (res: any) => void, errorCallback?: (res: any) => void): Promise<any> {
    return apiRequest<any>(
        'post',
        '/api/lotto/scratch/egame/bet',
        params,
        '购买卡片',
        params.showLoading,
        params.showLoadingMask,
        callback,
        errorCallback
    );
}

//#region MOCK GAME DATA

type ScratchCodeItem = {
    value: number;
    win?: number;
};

type ScratchCodeValue = string | number[] | ScratchCodeItem[];

type WinPattern = {
    name: string;
    indices: number[];
    multiplier: number;
};

const WIN_PATTERNS: WinPattern[] = [
    {
        name: 'TopLeft 7000x',
        indices: [0, 1, 4, 8],
        multiplier: 7000,
    },
    {
        name: 'TopRight 7000x',
        indices: [1, 2, 4, 6],
        multiplier: 7000,
    },
    {
        name: 'LeftColumn 3x',
        indices: [0, 3, 6],
        multiplier: 3,
    },
    {
        name: 'CenterColumn 500x',
        indices: [1, 4, 7],
        multiplier: 500,
    },
    {
        name: 'RightColumn 1x',
        indices: [2, 5, 8],
        multiplier: 1,
    },
    {
        name: 'TopRow 7x',
        indices: [0, 1, 2],
        multiplier: 7,
    },
    {
        name: 'MiddleRow 70x',
        indices: [3, 4, 5],
        multiplier: 70,
    },
    {
        name: 'BottomRow 1x',
        indices: [6, 7, 8],
        multiplier: 1,
    },
];

function randomId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function randomCardNo(): string {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    return `MOCK-CARD-${randomNumber}`;
}

function randomScratchCodes(winType: number = 0, length: number = 9): string {
    const numbers: number[] = [];

    for (let i = 0; i < length; i++) {
        numbers.push(winType === 0 ? randomScratchNumber() : randomNonWinningScratchNumber());
    }

    switch (winType) {
        case 1:
            // Normal Win: force x1 multiplier
            // Right column = [2, 5, 8]
            applyPattern(numbers, [2, 5, 8], 7);
            break;

        case 2:
            // Super Win: force x70 multiplier
            // Middle row = [3, 4, 5]
            applyPattern(numbers, [3, 4, 5], 7);
            break;

        case 0:
        default:
            // Pure random
            break;
    }

    return numbers.join(',');
}

function randomScratchNumber(): number {
    return Math.floor(1 + Math.random() * 7); // 1 to 7
}

function randomNonWinningScratchNumber(): number {
    return Math.floor(1 + Math.random() * 6); // 1 to 6 only
}

function applyPattern(numbers: number[], indices: number[], target: number): void {
    for (const index of indices) {
        if (index >= 0 && index < numbers.length) {
            numbers[index] = target;
        }
    }
}

function normalizeScratchCodes(codes: ScratchCodeValue): number[] {
    if (typeof codes === 'string') {
        return codes
            .split(',')
            .map(value => Number(value.trim()))
            .filter(value => !Number.isNaN(value));
    }

    if (Array.isArray(codes)) {
        if (codes.length === 0) {
            return [];
        }

        if (typeof codes[0] === 'number') {
            return codes as number[];
        }

        return (codes as ScratchCodeItem[]).map(item => item.value);
    }

    console.warn('[GameApi] Invalid scratch codes format:', codes);
    return [];
}

function evaluateScratchWin(codes: ScratchCodeValue, target: number = 7) {
    const nums = normalizeScratchCodes(codes);

    let bestWin: WinPattern | null = null;

    for (const pattern of WIN_PATTERNS) {
        const matched = pattern.indices.every(index => nums[index] === target);

        if (!matched) {
            continue;
        }

        if (!bestWin || pattern.multiplier > bestWin.multiplier) {
            bestWin = pattern;
        }
    }

    const win = Array(9).fill(0);

    if (bestWin) {
        bestWin.indices.forEach(index => {
            win[index] = 1;
        });
    }

    return {
        isWin: !!bestWin,
        multiplier: bestWin?.multiplier || 0,
        patternName: bestWin?.name || '',
        rawNumbers: nums,
        markedCodes: nums.map((value, index) => ({
            value,
            win: win[index],
        })),
    };
}

export async function mockBuyCard(params: {
    gameId: string,
    betType?: number,
    unitPrice?: string,
    quantity?: number,
    expand1?: string,
    expand2?: string,
    showLoading?: boolean,
    showLoadingMask?: boolean,

    // Testing only:
    // 0 - Random
    // 1 - Normal Win, x1
    // 2 - Super Win, x70
    winType?: number,
}): Promise<any> {
    const unitPrice = Number(params.unitPrice || 0);
    const quantity = params.quantity || 1;
    const winType = params.winType || 0;

    const billId = randomId('mock_bill');
    const cardId = randomId('mock_card');
    const cardNo = randomCardNo();
    const codes = randomScratchCodes(winType);

    return {
        code: 200,
        balance: 9500,
        totalBetAmount: unitPrice * quantity,
        betData: [],
        cardsNum: quantity,
        scratchCardData: {
            billId,
            cardNo,
            cardId,
            codes,
            sellStatus: 'SOLD',
            unitPrice,
            bonusMultiple: 1,
        },
    };
}

export async function mockSettleScratch(params: {
    gameId: string,
    billId?: string,
    number?: number,
    showLoading?: boolean,
    showLoadingMask?: boolean,
    extField?: string,

    // Mock-only helper.
    // Pass the same scratchCardData returned by mockBuyCard,
    // or the processed currentTicket if it has already passed through TicketData.updateTicketItem().
    scratchCardData?: any,
}): Promise<any> {
    const card = params.scratchCardData;

    const billId = params.billId || card?.billId || 'mock_bill_001';
    const cardId = card?.cardId || 'mock_card_001';
    const cardNo = card?.cardNo || 'MOCK-CARD-001';
    const codes: ScratchCodeValue = card?.codes || '7,1,2,3,7,4,5,6,7';
    const unitPrice = card?.unitPrice || 100;
    const bonusMultiple = card?.bonusMultiple || 1;

    const winResult = evaluateScratchWin(codes, 7);

    const isWin = winResult.isWin;
    const totalPayout = isWin
        ? unitPrice * winResult.multiplier * bonusMultiple
        : 0;

    return {
        balance: 10500 + totalPayout,
        totalPayout,
        settleData: [
            {
                billId,
                cardId,
                cardNo,
                gameId: params.gameId,
                winAmount: totalPayout,
                payout: totalPayout,
                bonusMultiple,
                unitPrice,

                // Keep original shape for debugging.
                codes,

                // Normalized and evaluated data.
                rawNumbers: winResult.rawNumbers,
                markedCodes: winResult.markedCodes,

                win: isWin,
                multiplier: winResult.multiplier,
                patternName: winResult.patternName,
                settleTime: new Date().toISOString(),
            },
        ],
        cardsNum: 1,
        billId,
    };
}

//#endregion

// 结算
export async function settleScratch(params: {
    gameId: string,
    billId?: string,
    number?: number,
    showLoading?: boolean,
    showLoadingMask?: boolean,
    extField?: string
}): Promise<any> {
    return apiRequest<any>(
        'post',
        '/api/lotto/scratch/egame/settle',
        params,
        '刮卡结算',
        params.showLoading,
        params.showLoadingMask
    );
}

// 收藏
export async function addFavorites(params: {
    cardId: string,
    gameId: string
}, callback?: (res: any) => void): Promise<any> {
    return apiRequest<any>(
        'post',
        '/api/lotto/scratch/cardFavorites/addFavorites',
        params,
        '取消收藏',
        true,
        false,
        callback
    );
}

// 取消收藏
export async function cancelFavorites(params: {
    cardId: string,
    gameId: string
}, callback?: (res: any) => void): Promise<any> {
    return apiRequest<any>(
        'post',
        '/api/lotto/scratch/cardFavorites/cancelFavorites',
        params,
        '取消收藏',
        true,
        false,
        callback
    );
}

// 收藏卡片列表
export async function getCollectionList(params: {
    page: number,
    pageSize: number,
    gameId: string
}): Promise<any> {
    return apiRequest<any>(
        'post',
        '/api/lotto/scratch/cardFavorites/queryPage',
        params,
        '获取收藏卡片列表',
        true
    );
}

// 刮卡获取卡片详情
export async function getScratchDetail(params: {
    cardId: string
}): Promise<any> {
    return apiRequest<any>(
        'post',
        '/api/lotto/scratch/scratch/detail',
        params,
        '获取刮卡详情',
        true
    );
}

// 排行榜
export async function getBigWinScratchRank(params: {
    page: number
    pageSize: number
    gameId?: string
    playType?: string
}): Promise<BigPrizeRankingData> {
    return apiRequest<BigPrizeRankingData>(
        'post',
        '/api/lotto/scratch/announcement/getBigPriceRanking',
        params,
        '获取游戏排行榜',
        true
    );
}

// 排行榜
export async function getCardSaleScratchRank(params: {
    page: number
    pageSize: number
    gameId?: string
    playType?: string
}): Promise<SaleRanking[]> {
    return apiRequest<SaleRanking[]>(
        'post',
        '/api/lotto/scratch/announcement/getSaleRanking',
        params,
        '获取游戏排行榜',
        true
    );
}

// 排行榜
export async function getGrandPrizeScratchRank(params: {
    page: number
    pageSize: number
    gameId?: string
    playType?: string
}): Promise<TopPrizeRanking> {
    return apiRequest<TopPrizeRanking>(
        'post',
        '/api/lotto/scratch/announcement/getTopPriceRanking',
        params,
        '获取游戏排行榜',
        true
    );
}

// 游戏跳转校验
export async function notifySwapGame(params: {
    gameId: string
}): Promise<any> {
    return apiRequest<any>(
        'post',
        '/api/lotto/game/game/notifySwapGame',
        params,
        '游戏跳转校验',
        true
    );
}

// 注单记录 api/lotto/game/customer/customerGameHistory
export async function getCustomerGameHistory(params: {
    page: number,
    pageSize: number,
    gameType: string,
    playType: string,
    settleTimeBegin: string,
    settleTimeEnd: string,
    win?: string
}): Promise<any> {
    return apiRequest<any>(
        'post',
        '/api/lotto/scratch/scratch/customerGameHistory',
        params,
        '注单记录',
        true
    );
}

// 注单卡片详情
export async function getCardDetail(params: {
    gameId: string,
    cardId: string
}): Promise<any> {
    return apiRequest<any>(
        'post',
        '/api/lotto/scratch/scratch/cardDetail',
        params,
        '注单卡片详情',
        true
    );
}

// 上报新手引导完成
export async function reportGuideComplete(params: {
    gameId: string,
}): Promise<any> {
    return apiRequest<any>(
        'post',
        `/api/lotto/user/customer/guide/${params.gameId}`,
        params,
        '上报新手引导完成',
        true
    );
}

// 刮卡轨迹上报
export async function reportScratchTrajectory(params: {
    gameId: string,
    cardId: string,
    pathTrace: string
}): Promise<any> {
    return apiRequest<any>(
        'post',
        '/api/lotto/scratch/scratch/reportPathTrace',
        params,
        '刮卡轨迹上报',
        false
    );
}

let win: any = window;
if (!win.gegameapi) {
    win.gegameapi = apiRequest;
}