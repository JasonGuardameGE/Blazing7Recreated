// ApiCore.ts（增强支持初始化完成再请求 & 缓存）
import { ApiService, ApiConfig } from "@ge/game-common-sdk";
import { ApiError, ApiErrorType } from "./ApiError";
//import PLK from "../PLK";
//import { MessageFlag } from "../manager/MessageFlag";
import logger from "../utils/logger";

let sdk: ApiService | null = null;
let isInitialized = false;
let initPromise: Promise<void> | null = null;

const requestQueue: (() => void)[] = []; // 请求队列

export function getSdk(): ApiService {
  if (!sdk || !isInitialized) {
    throw new ApiError(ApiErrorType.UNKNOWN_ERROR, "Api SDK 未初始化");
  }
  return sdk;
}

export function isReady(): boolean {
  return isInitialized && sdk !== null;
}

export async function initSdk(config?: Partial<ApiConfig>): Promise<void> {
  if (isInitialized) {
    logger.warn("[ApiCore] SDK 已初始化");
    return;
  }
  if (initPromise) return initPromise; // 避免重复初始化
  let username = localStorage.getItem("username");
  if (!username) {
    username = Math.random().toString(36).substring(2, 15);
    localStorage.setItem("username", username);
  }

  initPromise = new Promise<void>((resolve, reject) => {
    const baseConfig: ApiConfig = {
      baseUrl: "temp",//PLK.gameData.config.http,
      aesKeyUrl: "/api/lotto/aes-key",
      token: "temp",//PLK.gameData.urlParams.token,
      loginUrl: "/api/lotto/game/open/test/login",
      userInfoApiUrl: "/api/lotto/user/customer/info",
      loginParams: {
        gameId: "temp",//PLK.gameData.gameId,
        username: username,
        balance: "8000",
      },
      retryTimes: 0,
      onAesKeySuccess: (data) => ("temp"),//PLK.gameData.aesKey = data.key),
      onTokenSuccess: (data) => ("temp"),//PLK.gameData.token = data.token),
      ...config,
    };

    sdk = new ApiService(baseConfig);

    sdk.on("initialized", () => {
      logger.log("[ApiCore] SDK 初始化完成");
      isInitialized = true;
      resolve();

      // 获取用户信息
      //PLK.userInfo.userInfo = sdk.getUserInfoData();

      //PLK.userInfo.userInfo.aliasName = sdk.getUserInfoData().aliasName;

      // 执行排队请求
      requestQueue.forEach((cb) => cb());
      requestQueue.length = 0;
    });

    sdk.on("error", (err) => {
      logger.error("[ApiCore] SDK 错误:", err);
      reject(err);
    });
  });

  return initPromise;
}

export async function request<T>(
  method: "get" | "post" | "put" | "delete",
  url: string,
  data?: any,
): Promise<T> {
  // 保证 SDK 初始化完成后才发请求
  if (!isInitialized) {
    return new Promise<T>((resolve, reject) => {
      requestQueue.push(() => {
        request<T>(method, url, data).then(resolve).catch(reject);
      });
    });
  }

  try {
    const sdkInstance = getSdk();
    let res: any = await sdkInstance[method](url, data);
    return handleResponse<T>(res);
  } catch (err) {
    throw handleError(err);
  }
}

function handleResponse<T>(res: any): T {
  if (res && res.code === 200) {
    return res;
  }
  if (res.code === 401) {
    //PLK.exitGame();
    return;
  }
  throw new ApiError(
    ApiErrorType.BUSINESS_ERROR,
    res.message || "业务错误",
    res.code,
    res,
  );
}

function handleError(error: any): ApiError {
  // 只打印日志，不弹窗也不抛出异常
  logger.error("[ApiCore] handleError:", error);
  return;
  if (error instanceof ApiError) return error;
  if (error.code === "ECONNABORTED")
    return new ApiError(ApiErrorType.TIMEOUT_ERROR, "请求超时");
  if (error.message === "Network Error")
    return new ApiError(ApiErrorType.NETWORK_ERROR, "网络错误");
  if (error.response) {
    return new ApiError(
      ApiErrorType.SERVER_ERROR,
      "服务器错误",
      error.response.status,
      error.response.data,
    );
  }
  return new ApiError(ApiErrorType.UNKNOWN_ERROR, error.message || "未知错误");
}

export function destroySdk(): void {
  if (sdk) {
    sdk.off("initialized", () => {});
    sdk.off("error", () => {});
    sdk = null;
    isInitialized = false;
    initPromise = null;
    requestQueue.length = 0;
  }
}
