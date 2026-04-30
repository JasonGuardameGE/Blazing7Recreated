import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('GameData')
export class GameData {
  // 设备类型
  private _deviceType: string = "h5";

  // 是否是被踢下线
  private _isKickOff: boolean = false;

  // 退出游戏
  private _isExitGame: boolean = false;

  // 当前游戏类型
  private _gameType: string = "SCRATCH";

  // 当前游戏的gameid
  private _gameId: string = "2000802906231672834";

  // 当前卡的cardid
  private _cardId: string = "";

  // 当前游戏名称
  private _gameName: string = "Go Bananas";

  // 当前玩法
  private _currentPlayType: string = "GO_BANANAS2";

  // 游戏配置
  public _gameConfig: any = null;

  // 游戏api配置
  private _config: any = null;

  // 地址栏参数
  private _urlParams: any = null;

  // aesKey
  private _aesKey: string = "";

  // token
  private _token: string = "";

  //卡片单价
  private _cardPrice: number = 20;

  // 卡片单价（unitPrice），默认 20
  private _unitPrice: number = 20;

  // 当前所有可用的刮刮乐游戏列表数据
  private _gameList: any[] = [];

  // 当前游戏的数据
  private _currentGameData: any = null;

  // 当前游戏的剩余卡片数量
  private _remainingCardCount: number = 0;

  // 当前是否是手动刮卡
  private _isManualRightScratching: boolean = false;

  // 当前是否开启自动刮卡
  private _isAutoScratching: boolean = false;

  // 自动刮卡的数量
  private _autoScratchCount: number = -1;

  // 已经自动刮开的数量
  private _autoScratchedCount: number = 0;

  // 自动刮卡累计金额
  private _autoScratchTotalAmount: number = 0;

  // 自动刮卡累计赢钱卡数量
  private _autoScratchWinCardCount: number = 0;

  // 是否开启一键刮卡
  private _isOneKeyScratching: boolean = false;

  // 当前卡的数据
  //private _currentTicketData: TicketItem = null;

  // 当前卡片状态 初始化待刮卡，挂卡中，刮卡结束 init, scratching, over, finished
  private _currentCardStatus: string = "init";

  // 当前卡片结算状态 未开始init 结算结束settled，结算中settling
  private _currentCardSettlementStatus: string = "init";

  // 当前卡片是否刮卡结束
  private _isScratchOver: boolean = false;

  // 当前是否是刮卡结束
  private _isDownScratchOver: boolean = false;

}


