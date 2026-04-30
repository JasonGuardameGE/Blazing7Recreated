System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, _dec, _class, _crd, ccclass, property, GameData;

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "e8a67qXx1pJs5VYr62qL3pQ", "GameData", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("GameData", GameData = (_dec = ccclass('GameData'), _dec(_class = class GameData {
        constructor() {
          // 设备类型
          this._deviceType = "h5";
          // 是否是被踢下线
          this._isKickOff = false;
          // 退出游戏
          this._isExitGame = false;
          // 当前游戏类型
          this._gameType = "SCRATCH";
          // 当前游戏的gameid
          this._gameId = "2000802906231672834";
          // 当前卡的cardid
          this._cardId = "";
          // 当前游戏名称
          this._gameName = "Go Bananas";
          // 当前玩法
          this._currentPlayType = "GO_BANANAS2";
          // 游戏配置
          this._gameConfig = null;
          // 游戏api配置
          this._config = null;
          // 地址栏参数
          this._urlParams = null;
          // aesKey
          this._aesKey = "";
          // token
          this._token = "";
          //卡片单价
          this._cardPrice = 20;
          // 卡片单价（unitPrice），默认 20
          this._unitPrice = 20;
          // 当前所有可用的刮刮乐游戏列表数据
          this._gameList = [];
          // 当前游戏的数据
          this._currentGameData = null;
          // 当前游戏的剩余卡片数量
          this._remainingCardCount = 0;
          // 当前是否是手动刮卡
          this._isManualRightScratching = false;
          // 当前是否开启自动刮卡
          this._isAutoScratching = false;
          // 自动刮卡的数量
          this._autoScratchCount = -1;
          // 已经自动刮开的数量
          this._autoScratchedCount = 0;
          // 自动刮卡累计金额
          this._autoScratchTotalAmount = 0;
          // 自动刮卡累计赢钱卡数量
          this._autoScratchWinCardCount = 0;
          // 是否开启一键刮卡
          this._isOneKeyScratching = false;
          // 当前卡的数据
          //private _currentTicketData: TicketItem = null;
          // 当前卡片状态 初始化待刮卡，挂卡中，刮卡结束 init, scratching, over, finished
          this._currentCardStatus = "init";
          // 当前卡片结算状态 未开始init 结算结束settled，结算中settling
          this._currentCardSettlementStatus = "init";
          // 当前卡片是否刮卡结束
          this._isScratchOver = false;
          // 当前是否是刮卡结束
          this._isDownScratchOver = false;
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=d9e989e3911e310821333903950c51538c2c38d9.js.map