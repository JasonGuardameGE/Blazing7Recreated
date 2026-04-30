System.register(["__unresolved_0", "cc", "@ge/game-common-sdk", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, ApiService, ApiError, ApiErrorType, PLK, logger, _crd, sdk, isInitialized, initPromise, requestQueue;

  // 请求队列
  function getSdk() {
    if (!sdk || !isInitialized) {
      throw new (_crd && ApiError === void 0 ? (_reportPossibleCrUseOfApiError({
        error: Error()
      }), ApiError) : ApiError)((_crd && ApiErrorType === void 0 ? (_reportPossibleCrUseOfApiErrorType({
        error: Error()
      }), ApiErrorType) : ApiErrorType).UNKNOWN_ERROR, "Api SDK 未初始化");
    }

    return sdk;
  }

  function isReady() {
    return isInitialized && sdk !== null;
  }

  async function initSdk(config) {
    if (isInitialized) {
      (_crd && logger === void 0 ? (_reportPossibleCrUseOflogger({
        error: Error()
      }), logger) : logger).warn("[ApiCore] SDK 已初始化");
      return;
    }

    if (initPromise) return initPromise; // 避免重复初始化

    let username = localStorage.getItem("username");

    if (!username) {
      username = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("username", username);
    }

    initPromise = new Promise((resolve, reject) => {
      const baseConfig = {
        baseUrl: (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
          error: Error()
        }), PLK) : PLK).gameData.config.http,
        aesKeyUrl: "/api/lotto/aes-key",
        token: (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
          error: Error()
        }), PLK) : PLK).gameData.urlParams.token,
        loginUrl: "/api/lotto/game/open/test/login",
        userInfoApiUrl: "/api/lotto/user/customer/info",
        loginParams: {
          gameId: (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
            error: Error()
          }), PLK) : PLK).gameData.gameId,
          username: username,
          balance: "8000"
        },
        retryTimes: 0,
        onAesKeySuccess: data => (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
          error: Error()
        }), PLK) : PLK).gameData.aesKey = data.key,
        onTokenSuccess: data => (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
          error: Error()
        }), PLK) : PLK).gameData.token = data.token,
        ...config
      };
      sdk = new (_crd && ApiService === void 0 ? (_reportPossibleCrUseOfApiService({
        error: Error()
      }), ApiService) : ApiService)(baseConfig);
      sdk.on("initialized", () => {
        (_crd && logger === void 0 ? (_reportPossibleCrUseOflogger({
          error: Error()
        }), logger) : logger).log("[ApiCore] SDK 初始化完成");
        isInitialized = true;
        resolve(); // 获取用户信息

        (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
          error: Error()
        }), PLK) : PLK).userInfo.userInfo = sdk.getUserInfoData();
        (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
          error: Error()
        }), PLK) : PLK).userInfo.userInfo.aliasName = sdk.getUserInfoData().aliasName; // 执行排队请求

        requestQueue.forEach(cb => cb());
        requestQueue.length = 0;
      });
      sdk.on("error", err => {
        (_crd && logger === void 0 ? (_reportPossibleCrUseOflogger({
          error: Error()
        }), logger) : logger).error("[ApiCore] SDK 错误:", err);
        reject(err);
      });
    });
    return initPromise;
  }

  async function request(method, url, data) {
    // 保证 SDK 初始化完成后才发请求
    if (!isInitialized) {
      return new Promise((resolve, reject) => {
        requestQueue.push(() => {
          request(method, url, data).then(resolve).catch(reject);
        });
      });
    }

    try {
      const sdkInstance = getSdk();
      let res = await sdkInstance[method](url, data);
      return handleResponse(res);
    } catch (err) {
      throw handleError(err);
    }
  }

  function handleResponse(res) {
    if (res && res.code === 200) {
      return res;
    }

    if (res.code === 401) {
      (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
        error: Error()
      }), PLK) : PLK).exitGame();
      return;
    }

    throw new (_crd && ApiError === void 0 ? (_reportPossibleCrUseOfApiError({
      error: Error()
    }), ApiError) : ApiError)((_crd && ApiErrorType === void 0 ? (_reportPossibleCrUseOfApiErrorType({
      error: Error()
    }), ApiErrorType) : ApiErrorType).BUSINESS_ERROR, res.message || "业务错误", res.code, res);
  }

  function handleError(error) {
    // 只打印日志，不弹窗也不抛出异常
    (_crd && logger === void 0 ? (_reportPossibleCrUseOflogger({
      error: Error()
    }), logger) : logger).error("[ApiCore] handleError:", error);
    return;
    if (error instanceof (_crd && ApiError === void 0 ? (_reportPossibleCrUseOfApiError({
      error: Error()
    }), ApiError) : ApiError)) return error;
    if (error.code === "ECONNABORTED") return new (_crd && ApiError === void 0 ? (_reportPossibleCrUseOfApiError({
      error: Error()
    }), ApiError) : ApiError)((_crd && ApiErrorType === void 0 ? (_reportPossibleCrUseOfApiErrorType({
      error: Error()
    }), ApiErrorType) : ApiErrorType).TIMEOUT_ERROR, "请求超时");
    if (error.message === "Network Error") return new (_crd && ApiError === void 0 ? (_reportPossibleCrUseOfApiError({
      error: Error()
    }), ApiError) : ApiError)((_crd && ApiErrorType === void 0 ? (_reportPossibleCrUseOfApiErrorType({
      error: Error()
    }), ApiErrorType) : ApiErrorType).NETWORK_ERROR, "网络错误");

    if (error.response) {
      return new (_crd && ApiError === void 0 ? (_reportPossibleCrUseOfApiError({
        error: Error()
      }), ApiError) : ApiError)((_crd && ApiErrorType === void 0 ? (_reportPossibleCrUseOfApiErrorType({
        error: Error()
      }), ApiErrorType) : ApiErrorType).SERVER_ERROR, "服务器错误", error.response.status, error.response.data);
    }

    return new (_crd && ApiError === void 0 ? (_reportPossibleCrUseOfApiError({
      error: Error()
    }), ApiError) : ApiError)((_crd && ApiErrorType === void 0 ? (_reportPossibleCrUseOfApiErrorType({
      error: Error()
    }), ApiErrorType) : ApiErrorType).UNKNOWN_ERROR, error.message || "未知错误");
  }

  function destroySdk() {
    if (sdk) {
      sdk.off("initialized", () => {});
      sdk.off("error", () => {});
      sdk = null;
      isInitialized = false;
      initPromise = null;
      requestQueue.length = 0;
    }
  }

  function _reportPossibleCrUseOfApiService(extras) {
    _reporterNs.report("ApiService", "@ge/game-common-sdk", _context.meta, extras);
  }

  function _reportPossibleCrUseOfApiConfig(extras) {
    _reporterNs.report("ApiConfig", "@ge/game-common-sdk", _context.meta, extras);
  }

  function _reportPossibleCrUseOfApiError(extras) {
    _reporterNs.report("ApiError", "./ApiError", _context.meta, extras);
  }

  function _reportPossibleCrUseOfApiErrorType(extras) {
    _reporterNs.report("ApiErrorType", "./ApiError", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPLK(extras) {
    _reporterNs.report("PLK", "../PLK", _context.meta, extras);
  }

  function _reportPossibleCrUseOflogger(extras) {
    _reporterNs.report("logger", "../utils/logger", _context.meta, extras);
  }

  _export({
    getSdk: getSdk,
    isReady: isReady,
    initSdk: initSdk,
    request: request,
    destroySdk: destroySdk
  });

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_geGameCommonSdk) {
      ApiService = _geGameCommonSdk.ApiService;
    }, function (_unresolved_2) {
      ApiError = _unresolved_2.ApiError;
      ApiErrorType = _unresolved_2.ApiErrorType;
    }, function (_unresolved_3) {
      PLK = _unresolved_3.default;
    }, function (_unresolved_4) {
      logger = _unresolved_4.default;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "a6346U+XPxFgY0sdaeq4gH2", "ApiCore", undefined); // ApiCore.ts（增强支持初始化完成再请求 & 缓存）


      sdk = null;
      isInitialized = false;
      initPromise = null;
      requestQueue = [];

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=a71769b9dc58a23c68c995a842d37dd4001daa62.js.map