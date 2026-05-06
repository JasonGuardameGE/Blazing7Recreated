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
    // 简单序列化，保证同一请求唯一性
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
    // Promise合并防抖
    const debounceKey = getDebounceKey(method, url, params);
    // if (apiRequestPromiseMap.has(debounceKey)) {
    //     logger.warn(`[GameApi] ${apiName}请求被防抖合并:`, debounceKey);
    //     return apiRequestPromiseMap.get(debounceKey) as Promise<T>;
    // }
    const p = (async () => {
        // 延迟显示加载提示：如果接口在1秒内响应，则不显示加载提示
        let loadingTimer: ReturnType<typeof setTimeout> | null = null;
        let loadingTimerMask: ReturnType<typeof setTimeout> | null = null;
        let isLoadingShown = false; // 标记是否已显示加载提示
        let isLoadingShownMask = false; // 标记是否已显示加载提示

        if (showLoading) {
            loadingTimer = setTimeout(() => {
                //PLK.event.emit(MessageFlag.SHOW_API_LOADING);
                isLoadingShown = true;
            }, 1000); // 延迟1秒显示
        }

        if (showLoadingMask) {
            loadingTimerMask = setTimeout(() => {
                //PLK.event.emit(MessageFlag.SHOW_API_LOADING_MASK);
                isLoadingShownMask = true;
            }, 1000); // 延迟1秒显示
        }

        try {
            const response = await request<ApiResponse<T>>(method, url, params);

            if (response.code === 200) {
                // logger.log(`[GameApi] ${apiName}成功:`, response.data);
                if (callback) {
                    callback(response.data);
                }
                return response.data;
            } else {
                const errorMsg = `${apiName}失败: ${response.msg || '未知错误'}`;
                logger.error(`[GameApi] ${errorMsg}`, response);
                // 业务错误时，调用callback传递null或false
                if (callback) {
                    callback(null as any);
                }
                if (errorCallback) {
                    errorCallback(response);
                }
                return null as any as T;
            }
        } catch (error) {
            logger.error(`[GameApi] ${apiName}请求异常:`, error);
            // 网络异常时，调用callback传递null或false
            if (callback) {
                callback(null as any);
            }
            if (errorCallback) {
                errorCallback(error);
            }
            return null as any as T;
        } finally {
            // 清除延迟显示加载提示的定时器
            if (loadingTimer) {
                clearTimeout(loadingTimer);
            }
            if (loadingTimerMask) {
                clearTimeout(loadingTimerMask);
            }
            // 如果已经显示了加载提示，则隐藏它
            if (isLoadingShown) {
                //PLK.event.emit(MessageFlag.HIDE_API_LOADING);
            }
            if (isLoadingShownMask) {
                //PLK.event.emit(MessageFlag.HIDE_API_LOADING_MASK);
            }
            // 一定时间后清理Promise缓存
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

export async function mockBuyCard(params: {
    gameId: string,
    betType?: number,
    unitPrice?: string,
    quantity?: number,
    expand1?: string,
    expand2?: string,
    showLoading?: boolean,
    showLoadingMask?: boolean,
}): Promise<any>{
    return {
        code: 200,
        balance: 9500,
        totalBetAmount: 100,
        betData: [],
        cardsNum: 1,
        scratchCardData: {
            billId: 'mock_bill_001',
            cardNo: 'MOCK-CARD-001',
            cardId: 'mock_card_001',
            codes: '7,1,2,3,7,4,5,6,7',
            sellStatus: 'SOLD',
            unitPrice: 100,
            bonusMultiple: 1,
            kenoNumbers: '',
            luckyColors: '',
            dragonGate: '',
            data: '',
            card1: '',
            card2: '',
            extField: '',
        },
    };    
}

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
    //PLK.sensor.collectButtonClick(params.cardId, true)
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
    //PLK.sensor.collectButtonClick(params.cardId, false)
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

//
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