System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, request, logger, PLK, MessageFlag, _crd, apiRequestPromiseMap, API_REQUEST_DEBOUNCE_TIME, win;

  // ms
  function getDebounceKey(method, url, params) {
    // 简单序列化，保证同一请求唯一性
    return `${method}|${url}|${JSON.stringify(params)}`;
  }

  async function apiRequest(method, url, params, apiName, showLoading = true, showLoadingMask = false, callback, errorCallback) {
    // Promise合并防抖
    const debounceKey = getDebounceKey(method, url, params); // if (apiRequestPromiseMap.has(debounceKey)) {
    //     logger.warn(`[GameApi] ${apiName}请求被防抖合并:`, debounceKey);
    //     return apiRequestPromiseMap.get(debounceKey) as Promise<T>;
    // }

    const p = (async () => {
      // 延迟显示加载提示：如果接口在1秒内响应，则不显示加载提示
      let loadingTimer = null;
      let loadingTimerMask = null;
      let isLoadingShown = false; // 标记是否已显示加载提示

      let isLoadingShownMask = false; // 标记是否已显示加载提示

      if (showLoading) {
        loadingTimer = setTimeout(() => {
          (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
            error: Error()
          }), PLK) : PLK).event.emit((_crd && MessageFlag === void 0 ? (_reportPossibleCrUseOfMessageFlag({
            error: Error()
          }), MessageFlag) : MessageFlag).SHOW_API_LOADING);
          isLoadingShown = true;
        }, 1000); // 延迟1秒显示
      }

      if (showLoadingMask) {
        loadingTimerMask = setTimeout(() => {
          (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
            error: Error()
          }), PLK) : PLK).event.emit((_crd && MessageFlag === void 0 ? (_reportPossibleCrUseOfMessageFlag({
            error: Error()
          }), MessageFlag) : MessageFlag).SHOW_API_LOADING_MASK);
          isLoadingShownMask = true;
        }, 1000); // 延迟1秒显示
      }

      try {
        const response = await (_crd && request === void 0 ? (_reportPossibleCrUseOfrequest({
          error: Error()
        }), request) : request)(method, url, params);

        if (response.code === 200) {
          // logger.log(`[GameApi] ${apiName}成功:`, response.data);
          if (callback) {
            callback(response.data);
          }

          return response.data;
        } else {
          const errorMsg = `${apiName}失败: ${response.msg || '未知错误'}`;
          (_crd && logger === void 0 ? (_reportPossibleCrUseOflogger({
            error: Error()
          }), logger) : logger).error(`[GameApi] ${errorMsg}`, response); // 业务错误时，调用callback传递null或false

          if (callback) {
            callback(null);
          }

          if (errorCallback) {
            errorCallback(response);
          }

          return null;
        }
      } catch (error) {
        (_crd && logger === void 0 ? (_reportPossibleCrUseOflogger({
          error: Error()
        }), logger) : logger).error(`[GameApi] ${apiName}请求异常:`, error); // 网络异常时，调用callback传递null或false

        if (callback) {
          callback(null);
        }

        if (errorCallback) {
          errorCallback(error);
        }

        return null;
      } finally {
        // 清除延迟显示加载提示的定时器
        if (loadingTimer) {
          clearTimeout(loadingTimer);
        }

        if (loadingTimerMask) {
          clearTimeout(loadingTimerMask);
        } // 如果已经显示了加载提示，则隐藏它


        if (isLoadingShown) {
          (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
            error: Error()
          }), PLK) : PLK).event.emit((_crd && MessageFlag === void 0 ? (_reportPossibleCrUseOfMessageFlag({
            error: Error()
          }), MessageFlag) : MessageFlag).HIDE_API_LOADING);
        }

        if (isLoadingShownMask) {
          (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
            error: Error()
          }), PLK) : PLK).event.emit((_crd && MessageFlag === void 0 ? (_reportPossibleCrUseOfMessageFlag({
            error: Error()
          }), MessageFlag) : MessageFlag).HIDE_API_LOADING_MASK);
        } // 一定时间后清理Promise缓存


        setTimeout(() => apiRequestPromiseMap.delete(debounceKey), API_REQUEST_DEBOUNCE_TIME);
      }
    })();

    apiRequestPromiseMap.set(debounceKey, p);
    return p;
  } // 查询当前所有可玩的游戏剩余卡片


  async function getScratchList(params) {
    return apiRequest('post', '/api/lotto/scratch/egame/list', params, '查询当前所有可玩的游戏', false);
  } // 请求游戏卡片列表


  async function getCardList(params) {
    return apiRequest('post', '/api/lotto/scratch/scratch/queryCards', params, '查询游戏卡片列表', false);
  } // 购买卡片


  async function buyCard(params, callback, errorCallback) {
    return apiRequest('post', '/api/lotto/scratch/egame/bet', params, '购买卡片', params.showLoading, params.showLoadingMask, callback, errorCallback);
  } // 结算


  async function settleScratch(params) {
    return apiRequest('post', '/api/lotto/scratch/egame/settle', params, '刮卡结算', params.showLoading, params.showLoadingMask);
  } // 收藏


  async function addFavorites(params, callback) {
    (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
      error: Error()
    }), PLK) : PLK).sensor.collectButtonClick(params.cardId, true);
    return apiRequest('post', '/api/lotto/scratch/cardFavorites/addFavorites', params, '取消收藏', true, false, callback);
  } // 取消收藏


  async function cancelFavorites(params, callback) {
    (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
      error: Error()
    }), PLK) : PLK).sensor.collectButtonClick(params.cardId, false);
    return apiRequest('post', '/api/lotto/scratch/cardFavorites/cancelFavorites', params, '取消收藏', true, false, callback);
  } // 收藏卡片列表


  async function getCollectionList(params) {
    return apiRequest('post', '/api/lotto/scratch/cardFavorites/queryPage', params, '获取收藏卡片列表', true);
  } // 刮卡获取卡片详情


  async function getScratchDetail(params) {
    return apiRequest('post', '/api/lotto/scratch/scratch/detail', params, '获取刮卡详情', true);
  } // 排行榜


  async function getBigWinScratchRank(params) {
    return apiRequest('post', '/api/lotto/scratch/announcement/getBigPriceRanking', params, '获取游戏排行榜', true);
  } // 排行榜


  async function getCardSaleScratchRank(params) {
    return apiRequest('post', '/api/lotto/scratch/announcement/getSaleRanking', params, '获取游戏排行榜', true);
  } // 排行榜


  async function getGrandPrizeScratchRank(params) {
    return apiRequest('post', '/api/lotto/scratch/announcement/getTopPriceRanking', params, '获取游戏排行榜', true);
  } // 游戏跳转校验


  async function notifySwapGame(params) {
    return apiRequest('post', '/api/lotto/game/game/notifySwapGame', params, '游戏跳转校验', true);
  } // 注单记录 api/lotto/game/customer/customerGameHistory


  async function getCustomerGameHistory(params) {
    return apiRequest('post', '/api/lotto/scratch/scratch/customerGameHistory', params, '注单记录', true);
  } // 注单卡片详情


  async function getCardDetail(params) {
    return apiRequest('post', '/api/lotto/scratch/scratch/cardDetail', params, '注单卡片详情', true);
  } //
  // 上报新手引导完成


  async function reportGuideComplete(params) {
    return apiRequest('post', `/api/lotto/user/customer/guide/${params.gameId}`, params, '上报新手引导完成', true);
  } // 刮卡轨迹上报


  async function reportScratchTrajectory(params) {
    return apiRequest('post', '/api/lotto/scratch/scratch/reportPathTrace', params, '刮卡轨迹上报', false);
  }

  function _reportPossibleCrUseOfrequest(extras) {
    _reporterNs.report("request", "./ApiCore", _context.meta, extras);
  }

  function _reportPossibleCrUseOfApiResponse(extras) {
    _reporterNs.report("ApiResponse", "../types/global.d", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBigPrizeRankingData(extras) {
    _reporterNs.report("BigPrizeRankingData", "../types/global.d", _context.meta, extras);
  }

  function _reportPossibleCrUseOfScratchListData(extras) {
    _reporterNs.report("ScratchListData", "../types/global.d", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCurrentTicketList(extras) {
    _reporterNs.report("CurrentTicketList", "../types/global.d", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTopPrizeRanking(extras) {
    _reporterNs.report("TopPrizeRanking", "../types/global.d", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSaleRanking(extras) {
    _reporterNs.report("SaleRanking", "../types/global.d", _context.meta, extras);
  }

  function _reportPossibleCrUseOflogger(extras) {
    _reporterNs.report("logger", "../utils/logger", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPLK(extras) {
    _reporterNs.report("PLK", "../PLK", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMessageFlag(extras) {
    _reporterNs.report("MessageFlag", "../manager/MessageFlag", _context.meta, extras);
  }

  _export({
    getScratchList: getScratchList,
    getCardList: getCardList,
    buyCard: buyCard,
    settleScratch: settleScratch,
    addFavorites: addFavorites,
    cancelFavorites: cancelFavorites,
    getCollectionList: getCollectionList,
    getScratchDetail: getScratchDetail,
    getBigWinScratchRank: getBigWinScratchRank,
    getCardSaleScratchRank: getCardSaleScratchRank,
    getGrandPrizeScratchRank: getGrandPrizeScratchRank,
    notifySwapGame: notifySwapGame,
    getCustomerGameHistory: getCustomerGameHistory,
    getCardDetail: getCardDetail,
    reportGuideComplete: reportGuideComplete,
    reportScratchTrajectory: reportScratchTrajectory
  });

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      request = _unresolved_2.request;
    }, function (_unresolved_3) {
      logger = _unresolved_3.default;
    }, function (_unresolved_4) {
      PLK = _unresolved_4.default;
    }, function (_unresolved_5) {
      MessageFlag = _unresolved_5.MessageFlag;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "21485X9iklF3YpTvD/rMYWS", "GameApi", undefined);

      /**
       * 统一的API请求处理函数
       * @param method HTTP方法
       * @param url 请求URL
       * @param params 请求参数
       * @param apiName API名称（用于日志）
       * @returns 成功时返回data，失败时抛出错误
       */
      apiRequestPromiseMap = new Map();
      API_REQUEST_DEBOUNCE_TIME = 200;
      win = window;

      if (!win.gegameapi) {
        win.gegameapi = apiRequest;
      }

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=c91ba75fb8777fbbc5587e963d80a78b473b4675.js.map