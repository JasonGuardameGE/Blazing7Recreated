/**
 * CocosCreator WebSocket 管理器
 *
 * 功能特性：
 * 1. 单例模式，全局唯一实例
 * 2. 自动连接管理（连接、重连、心跳）
 * 3. 消息发送和接收
 * 4. 协议监听和事件分发
 * 5. 连接状态管理
 * 6. 错误处理和日志记录
 *
 * 使用示例：
 * ```typescript
 * // 初始化
 * await WsManager.getInstance().init({
 *   url: 'wss://your-server.com/ws',
 *   aesKey: 'your-aes-key'
 * });
 *
 * // 监听协议
 * WsManager.getInstance().onMessage('gameState', (data) => {
 *   logger.log('游戏状态更新:', data);
 * });
 *
 * // 发送消息
 * WsManager.getInstance().send('gameAction', { action: 'bet', amount: 100 });
 * ```
 */

import { WsService, WsConfig, WsMessage } from "@ge/game-common-sdk";
//import PLK from "../PLK";

import logger from "../utils/logger";
import { Services } from "./Services";
import { GameManager } from "./GameManager";

// 在 CocosCreator 环境中，cc 对象是全局可用的
declare const cc: any;

/**
 * WebSocket 连接状态
 */
export enum WsConnectionState {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  RECONNECTING = "reconnecting",
  ERROR = "error",
}

/**
 * WebSocket 管理器配置
 */
export interface WsManagerConfig extends WsConfig {
  // 扩展配置项
  enableLog?: boolean; // 是否启用日志
  enableAutoReconnect?: boolean; // 是否启用自动重连
  maxReconnectAttempts?: number; // 最大重连次数
  reconnectInterval?: number; // 重连间隔
  heartbeatInterval?: number; // 心跳间隔
}

/**
 * 协议监听器类型
 */
type ProtocolListener = (data: any) => void;

/**
 * 连接状态监听器类型
 */
type ConnectionListener = (state: WsConnectionState, data?: any) => void;

/**
 * CocosCreator WebSocket 管理器
 */
export class WsManager {
  private static instance: WsManager;

  private wsService: WsService | null = null;
  private config: WsConfig | null = null;
  private connectionState: WsConnectionState = WsConnectionState.DISCONNECTED;
  private protocolListeners: Map<string, ProtocolListener[]> = new Map();
  private connectionListeners: ConnectionListener[] = [];
  private isInitialized: boolean = false;
  private reconnectAttempts: number = 0;

  private token: string;
  private aesKey: string;
  private language = "en-US";

  ///ws/lotto/websocket/game/{token}/{lang}/{gameId}
  //private url = `${PLK.gameData.config.ws}/game/${this.token}/${this.language}/${PLK.gameData.gameId}`;
  private url = "";

  private _wsConfig: WsConfig;

  // 私有构造函数，确保单例模式
  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): WsManager {
    if (!WsManager.instance) {
      WsManager.instance = new WsManager();
    }
    return WsManager.instance;
  }

  /**
   * 初始化 WebSocket 管理器
   */
  public async init(): Promise<void> {
    if (this.isInitialized) {
      this.log("WebSocket Manager has been initialized");
      return;
    }
    
    // Adjusted Initialization 
    const gameManager = Services.GetService(GameManager);
    const gameData = gameManager.GameData;

    this.token = gameData.token;
    this.aesKey = gameData.aesKey;
    this.language = gameData.urlParams.language || "en-US";
    this.url = `${gameData.config.ws}/game/${this.token}/${this.language}/${gameData.gameId}`
    
    this._wsConfig = {
        url: this.url,
        aesKey: this.aesKey,
        heartbeatCheckInterval: 5000, // 5秒检测一次
        maxHeartbeatFailures: 5, // 最大检测次数
    };


    try {
      this.config = {
        ...this._wsConfig,
      };

      this.log("Start initializing the WebSocket manager...");

      // 创建 WsService 实例
      this.wsService = new WsService(this.config);

      // 设置事件监听器
      this.setupEventListeners();

      // 连接 WebSocket
      await this.connect();

      this.isInitialized = true;
      this.log("WebSocket 管理器初始化成功");
    } catch (error) {
      this.log("WebSocket Manager initialization failed:", error);
      this.updateConnectionState(WsConnectionState.ERROR, error);
      throw error;
    }
  }

  /**
   * 连接 WebSocket
   */
  private async connect(): Promise<void> {
    if (!this.wsService) {
      this.init();
    }

    try {
      this.updateConnectionState(WsConnectionState.CONNECTING);
      await this.wsService.connect();
    } catch (error) {
      this.log("WebSocket 连接失败:", error);
      this.updateConnectionState(WsConnectionState.ERROR, error);
      throw error;
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.wsService) return;

    // 连接打开事件
    this.wsService.onOpen((data) => {
      this.log("WebSocket 连接成功");
      this.reconnectAttempts = 0;
      this.updateConnectionState(WsConnectionState.CONNECTED, data);
    });

    // 连接关闭事件
    this.wsService.onClose((data) => {
      this.log("WebSocket 连接关闭");
      this.updateConnectionState(WsConnectionState.DISCONNECTED, data);

      // 自动重连
      if (
        this.config?.autoReconnect &&
        this.reconnectAttempts < (this.config.maxReconnectAttempts || 5)
      ) {
        this.scheduleReconnect();
      }
    });

    // 连接错误事件
    this.wsService.onError((data) => {
      this.log("WebSocket 连接错误:", data);
      this.updateConnectionState(WsConnectionState.ERROR, data);
    });

    // 重连事件
    this.wsService.onReconnect((data) => {
      this.log("WebSocket 重连中...");
      this.reconnectAttempts++;
      this.updateConnectionState(WsConnectionState.RECONNECTING, data);
    });

    // 消息事件
    this.wsService.onMessage((message) => {
      if (message.cmd !== "PONG") {
        this.log("收到消息:", message);
      }
      this.handleMessage(message);
    });

    // 心跳事件
    this.wsService.onHeartbeat((data) => {
      // this.log('心跳消息:', data);
    });

    // 监听连接丢失（断联）
    this.wsService.onConnectionLost((data) => {
      logger.log("检测到WebSocket断联！");
      logger.log("失败次数:", data.failures);
      logger.log("最后PONG时间:", new Date(data.lastPongTime));

      // 可以在这里显示提示信息
      // showDisconnectMessage('网络连接已断开，正在重新连接...');
    });

    // 监听心跳超时（每次失败都会触发）
    this.wsService.onHeartbeatTimeout((data) => {
      logger.log(`心跳检测失败 ${data.failures}/${data.maxFailures}`);

      console.log(`[Websocket Manager] URL: ${this.url}`);
      console.log(`[Websocket Manager] Token: ${this.token}`);
      console.log(`[Websocket Manager] AesKey: ${this.aesKey}`);
      console.log(`[Websocket Manager] Language: ${this.language}`);
      // 可以在这里显示警告信息
    });

    // 监听连接关闭
    this.wsService.onClose((data) => {
      logger.log("WebSocket连接关闭:", data.reason);
    });

    // 监听重连
    this.wsService.onReconnect((data) => {
      logger.log("正在重连，第", data.attempt, "次");
    });
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(message: WsMessage): void {
    const { cmd, data } = message;

    // 1. 发送通用消息事件到 CocosCreator 事件系统
    cc.systemEvent.emit("wsMessage", message);

    // 2. 根据协议类型分发到对应的监听器
    const listeners = this.protocolListeners.get(cmd);
    if (cmd == "PONG") {
      return;
    }
    if (listeners && listeners.length > 0) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          this.log("协议监听器执行错误:", error);
        }
      });
    } else {
      this.log("未找到协议监听器:", cmd);
    }
  }

  /**
   * 更新连接状态
   */
  private updateConnectionState(state: WsConnectionState, data?: any): void {
    this.connectionState = state;

    // 通知连接状态监听器
    this.connectionListeners.forEach((listener) => {
      try {
        listener(state, data);
      } catch (error) {
        this.log("连接状态监听器执行错误:", error);
      }
    });

    // 发送状态事件到 CocosCreator 事件系统
    cc.systemEvent.emit("wsConnectionState", { state, data });
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= (this.config?.maxReconnectAttempts || 5)) {
      this.log("达到最大重连次数，停止重连");
      return;
    }

    const interval = this.config?.reconnectInterval || 3000;
    this.log(
      `安排重连，${interval}ms 后重试 (${this.reconnectAttempts + 1}/${this.config?.maxReconnectAttempts})`,
    );

    setTimeout(() => {
      if (this.connectionState === WsConnectionState.DISCONNECTED) {
        this.connect().catch((error) => {
          this.log("重连失败:", error);
        });
      }
    }, interval);
  }

  /**
   * 发送消息
   */
  public send(type: string, data: any): boolean {
    if (!this.wsService || !this.isConnected()) {
      this.log("WebSocket 未连接，无法发送消息");
      return false;
    }

    try {
      const success = this.wsService.send(type, data);
      if (success) {
        this.log("消息发送成功:", type, data);
      } else {
        this.log("消息发送失败:", type, data);
      }
      return success;
    } catch (error) {
      this.log("消息发送异常:", error);
      return false;
    }
  }

  /**
   * 监听协议消息
   */
  public onMessage(type: string, listener: ProtocolListener): void {
    if (!this.protocolListeners.has(type)) {
      this.protocolListeners.set(type, []);
    }
    this.protocolListeners.get(type)!.push(listener);
    this.log(`添加协议监听器: ${type}`);
  }

  /**
   * 移除协议监听器
   */
  public offMessage(type: string, listener: ProtocolListener): void {
    const listeners = this.protocolListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
        this.log(`移除协议监听器: ${type}`);
      }
    }
  }

  /**
   * 监听连接状态变化
   */
  public onConnectionStateChange(listener: ConnectionListener): void {
    this.connectionListeners.push(listener);
  }

  /**
   * 移除连接状态监听器
   */
  public offConnectionStateChange(listener: ConnectionListener): void {
    const index = this.connectionListeners.indexOf(listener);
    if (index > -1) {
      this.connectionListeners.splice(index, 1);
    }
  }

  /**
   * 检查是否已连接
   */
  public isConnected(): boolean {
    return this.wsService?.isConnected() || false;
  }

  /**
   * 获取连接状态
   */
  public getConnectionState(): WsConnectionState {
    return this.connectionState;
  }

  /**
   * 获取连接状态文本
   */
  public getConnectionStateText(): string {
    const stateMap = {
      [WsConnectionState.DISCONNECTED]: "已断开",
      [WsConnectionState.CONNECTING]: "连接中",
      [WsConnectionState.CONNECTED]: "已连接",
      [WsConnectionState.RECONNECTING]: "重连中",
      [WsConnectionState.ERROR]: "连接错误",
    };
    return stateMap[this.connectionState] || "未知状态";
  }

  /**
   * 手动重连
   */
  public async reconnect(): Promise<void> {
    this.log("手动重连...");
    this.reconnectAttempts = 0;
    await this.connect();
  }

  /**
   * 断开连接
   */
  public disconnect(): void {
    if (this.wsService) {
      this.wsService.close();
    }
  }

  /**
   * 销毁管理器
   */
  public destroy(): void {
    this.log("销毁 WebSocket 管理器...");

    // 断开连接
    this.disconnect();

    // 清理监听器
    this.protocolListeners.clear();
    this.connectionListeners = [];

    // 销毁服务
    if (this.wsService) {
      this.wsService.destroy();
      this.wsService = null;
    }

    // 重置状态
    this.isInitialized = false;
    this.connectionState = WsConnectionState.DISCONNECTED;
    this.reconnectAttempts = 0;
    this.config = null;

    this.log("WebSocket 管理器已销毁");
  }

  /**
   * 日志输出
   */
  private log(...args: any[]): void {
    logger.log("[WsManager]", ...args);
  }

  /**
   * 获取统计信息
   */
  public getStats(): any {
    return {
      isInitialized: this.isInitialized,
      connectionState: this.connectionState,
      connectionStateText: this.getConnectionStateText(),
      isConnected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      protocolListenersCount: this.protocolListeners.size,
      connectionListenersCount: this.connectionListeners.length,
    };
  }
}

// ==================== 协议类型定义 ====================

/**
 * 游戏状态协议
 */
export interface GameStateProtocol {
  gameId: string;
  players: PlayerInfo[];
  state: "waiting" | "playing" | "finished";
  currentRound: number;
  timestamp: number;
}

/**
 * 玩家信息
 */
export interface PlayerInfo {
  id: string;
  name: string;
  avatar: string;
  score: number;
  isOnline: boolean;
}

/**
 * 玩家动作协议
 */
export interface PlayerActionProtocol {
  playerId: string;
  action: "bet" | "fold" | "call" | "raise" | "check";
  data: any;
  timestamp: number;
}

/**
 * 聊天消息协议
 */
export interface ChatMessageProtocol {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

/**
 * 通知消息协议
 */
export interface NotificationProtocol {
  type: "success" | "warning" | "error" | "info";
  title: string;
  content: string;
  duration?: number;
  timestamp: number;
}
