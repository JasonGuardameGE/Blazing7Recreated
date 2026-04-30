System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, GameUtils, GameData, _crd;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _reportPossibleCrUseOfGameUtils(extras) {
    _reporterNs.report("GameUtils", "../utils/GameUtils", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTicketItem(extras) {
    _reporterNs.report("TicketItem", "../types/global.d", _context.meta, extras);
  }

  _export("GameData", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      GameUtils = _unresolved_2.GameUtils;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ce6acmSJP1OxZGHIq8u+FY4", "GameData", undefined);

      // 性能配置接口
      _export("GameData", GameData = class GameData {
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
          this._currentTicketData = null;
          // 当前卡片状态 初始化待刮卡，挂卡中，刮卡结束 init, scratching, over, finished
          this._currentCardStatus = "init";
          // 当前卡片结算状态 未开始init 结算结束settled，结算中settling
          this._currentCardSettlementStatus = "init";
          // 当前卡片是否刮卡结束
          this._isScratchOver = false;
          // 当前是否是刮卡结束
          this._isDownScratchOver = false;
          // 上一次中奖的索引数组
          this._lastWinIndexs = [];
          // 当前卡片是否赢钱
          this._isCurrentCardWin = false;
          // 当前结算的billId
          this._currentSettledBillId = "";
          //
          this._isSettlementClosed = true;
          this._isRegularWin = false;
          // 当前是否是一键刮单张卡
          this._isOneKeyScratchingSingleCard = false;
          // bigAmount
          this._bigAmount = "";
          // totalAmount
          this._topAmount = "";
          // 当前要执行刮卡后的状态
          this._currentCardAfterScratchStatus = "";
          // 上次赢钱金额
          this._lastWinAmount = 0;
          // 切换游戏时，要跳转的游戏id
          this._turnToGameId = "";
          // 切换游戏时，要跳转的游戏id
          this._turnToGameName = "";
          // 切换游戏时，要跳转的游戏玩法
          this._turnToPlayType = "";
          // bonusTrajectoryData
          this._bonusTrajectoryData = null;
          // yourNumbersTrajectoryData
          this._yourNumbersTrajectoryData = null;
          // 当前的倍数
          this._currentBonusMultiple = 1;
          this.topItemDelay = 50;
          this.contentItemDelay = 50;
          this.topToContentDelay = 100;
          this.particleNumber = 2;
          this.needExitGame = false;
          this.scratchCount = 0;
          // 是否开启autoPlay按钮功能
          this._isAutoPlay = true;
          // max win multiple
          this._maxWinMultiple = 14582;
          // game pricelist
          this._gamePriceList = [];
          this._onlineConfig = null;
          this._showBackBtn = true;
          this._productId = "GV1";
          // 性能配置（从PerformanceDetector同步）
          this._performanceSettings = {
            enableSkeletonAnimation: true,
            scratchEffectFrequency: 1.0,
            scratchTextureUpdateInterval: 0,
            enableLeafParticles: true,
            maxLeafPerCellPercent: 0.6,
            enablePhysics2D: true,
            level: "medium"
          };
        }

        // 切换游戏时，重置所有状态
        resetAllStatus() {
          this._deviceType = "h5";
          this._isKickOff = false;
          this._isExitGame = false;
          this._isManualRightScratching = false;
          this._isAutoScratching = false;
          this._autoScratchCount = -1;
          this._autoScratchedCount = 0;
          this._autoScratchTotalAmount = 0;
          this._autoScratchWinCardCount = 0;
          this._isOneKeyScratching = false;
          this._remainingCardCount = 0;
          this._currentTicketData = null;
          this._isDownScratchOver = false;
          this._lastWinIndexs = [];
          this._isCurrentCardWin = false;
          this._currentSettledBillId = "";
          this._isSettlementClosed = false;
          this._isRegularWin = false;
          this._isOneKeyScratchingSingleCard = false;
          this._currentCardAfterScratchStatus = "";
          this._lastWinAmount = 0;
          this._turnToGameId = "";
          this._turnToPlayType = "";
          this._turnToGameName = "";
          this._bonusTrajectoryData = null;
          this._yourNumbersTrajectoryData = null;
          this._cardId = "";
          this._currentBonusMultiple = 1;
          this._isAutoPlay = true;
          this._gamePriceList = [];
        }

        get deviceLevel() {
          return this._performanceSettings.level;
        }

        initConfig() {
          this.getUrlParams();
          var win = window;
          this._config = {
            http: "https://lotto-gateway.gelotto-test.com",
            ws: "wss://lotto-scratch-websocket.gelotto-test.com/scratch/ws/lotto/websocket/",
            cdn: "https://minio-api.complexdevops.com/common-base/scratch/",
            sensors: "https://dev-8106.digiplus-bigdata.com/sa?project=BingoPlus",
            staticCdn: "https://detcslitqpsmv.cloudfront.net/img.gurl.ph/",
            otherGamePath: "https://scratch.gelotto-test.com/"
          };

          if (win.getAppConfig) {
            this._config = win.getAppConfig();
          }

          this.getGameConfig();
        }

        getGameConfig() {
          var _this = this;

          return _asyncToGenerator(function* () {
            var _config$back_button_c;

            if ((_crd && GameUtils === void 0 ? (_reportPossibleCrUseOfGameUtils({
              error: Error()
            }), GameUtils) : GameUtils).isLocal()) {
              _this._config.menuBundleRemoteUrl = "menu-bundle";
              _this._showBackBtn = true;

              _this.replaceConfig();

              return;
            }

            var cdn = _this._config.cdn.split("/scratch/")[0] + "/scratch/";
            var config = yield (_crd && GameUtils === void 0 ? (_reportPossibleCrUseOfGameUtils({
              error: Error()
            }), GameUtils) : GameUtils).loadRemoteJson(window.location.origin + "/version");
            _this._config.menuBundleRemoteUrl = cdn + "menubundleremote/" + config.menu + "/dist/remote/menu-bundle";
            var hideBackBtn = (config == null || (_config$back_button_c = config.back_button_config) == null ? void 0 : _config$back_button_c.hide) || [];
            hideBackBtn.includes(_this._productId) ? _this._showBackBtn = false : _this._showBackBtn = true;
            _this._onlineConfig = config;

            _this.replaceConfig();

            return config;
          })();
        }

        getUrlParams() {
          var urlParams = new URLSearchParams("?token=eyJhbGciOiJSUzI1NiIsInppcCI6IkdaSVAifQ.H4sIAAAAAAAA_y3KQQ6CMBCF4bvMmkU7TCnlAqgLw8K4NaWMBiMtKSXRGO9ug-5e_ve9YY5hWF3aD9BAe5ZQwCPcRn-0E__K5WCX4NsTLymfbl1SmDhuXsnaSMKSjBDKUKWrciMxsnevDLpdl8M9jXlbvPYWVWlqJ6hitOyQSAjk3iBrynC0CRqptSZURmIB_Jz_QZGW-PkCnx7TMK8AAAA.PNITa8s4Y_H5tN1pHl-tghJt1LxrNaZcjJcPFjRLA-K5GL5XO_TLbzmKwtqxPUk8k8lvtb3mCr7vURlR2RkeLZWEl-6xAHr_j11EbORFwtvwbc0dcfYsSvxQE5rLK0c0gCSP9ypj9GUoChNDPTllQpcl53-abBZEpiwdns0X-sYfIcZacpPV3hajgCmFPizcpNxGrTGrfQOK0wv-5RcZTmrkUTyrMOmB-eeuRq8RBXVLPJxbXxPfC-mnqBsOLprIRwP7N9HOUpd32cKdjJH18qArJ83HTpc4sqyvmzNu0q5apMKil_RHh_1h0sSZBRQtdqGDQhybuyAMV4t3Bq6FJg&gameId=2000802906231672834&lang=en-US&productId=GV1&gameName=BLAZING%207s&playType=BLAZING_7S_SCRATCH&callbackUrl=https://pilot.gelotto-test.com");
          var token = urlParams.get("token");
          var gameId = urlParams.get("gameId");
          var lang = urlParams.get("lang");
          var callbackUrl = urlParams.get("callbackUrl");
          var playType = urlParams.get("playType");
          var topItemDelay = urlParams.get("topItemDelay");
          var contentItemDelay = urlParams.get("contentItemDelay");
          var topToContentDelay = urlParams.get("topToContentDelay");
          var productId = urlParams.get("productId") || "GV1";
          this._productId = productId;

          if (topItemDelay) {
            this.topItemDelay = Number(topItemDelay);
          }

          if (contentItemDelay) {
            this.contentItemDelay = Number(contentItemDelay);
          }

          if (topToContentDelay) {
            this.topToContentDelay = Number(topToContentDelay);
          }

          if (gameId) {
            this.gameId = gameId;
          }

          this._urlParams = {
            token,
            gameId,
            lang,
            callbackUrl,
            playType,
            productId
          }; // 如果playType不为空，则设置当前游戏玩法

          if (playType) {
            this.currentPlayType = playType;
          }

          if (gameId) {
            this.gameId = gameId;
          }

          if (token) {
            this.token = token;
          }
        }

        get urlParams() {
          return this._urlParams;
        }

        get productId() {
          var _this$_urlParams;

          return ((_this$_urlParams = this._urlParams) == null ? void 0 : _this$_urlParams.productId) || "GV1";
        }

        replaceConfig() {
          for (var key in this._config) {
            this._config[key] = (_crd && GameUtils === void 0 ? (_reportPossibleCrUseOfGameUtils({
              error: Error()
            }), GameUtils) : GameUtils).removeTrailingSlash(this._config[key]);
          }
        }

        get showBackBtn() {
          return this._showBackBtn;
        }

        get config() {
          return this._config;
        }

        set gameConfig(value) {
          this._gameConfig = value;
        }

        get gameConfig() {
          return this._gameConfig;
        }

        set aesKey(value) {
          this._aesKey = value;
        }

        get aesKey() {
          return this._aesKey;
        }

        set token(value) {
          this._token = value;
        }

        get token() {
          return this._token;
        }

        set gameName(value) {
          this._gameName = value;
        }

        get gameName() {
          return this._gameName;
        }

        set gameId(value) {
          this._gameId = value;
        }

        get gameId() {
          return this._gameId;
        }

        set cardId(value) {
          this._cardId = value;
        }

        get cardId() {
          return this._cardId;
        }

        set cardPrice(value) {
          this._cardPrice = value;
        }

        get cardPrice() {
          return this._cardPrice;
        }

        set unitPrice(value) {
          this._unitPrice = value != null ? value : 20;
        }

        get unitPrice() {
          return this._unitPrice;
        }

        set gameList(value) {
          this._gameList = value;
        }

        get gameList() {
          return this._gameList;
        }

        set gameType(value) {
          this._gameType = value;
        }

        get gameType() {
          return this._gameType;
        }

        set currentPlayType(value) {
          this._currentPlayType = value;
        }

        get currentPlayType() {
          // 当前游戏id对应的玩法
          this._gameList.forEach(game => {
            if (game.gameId === this._gameId) {
              this._currentPlayType = game.playType;
            }
          });

          return this._currentPlayType;
        }

        set currentGameData(value) {
          this._currentGameData = value;
        }

        get currentGameData() {
          // 当前游戏id对应的数据
          this._gameList.forEach(game => {
            if (game.gameId === this._gameId) {
              this._currentGameData = game;
            }
          });

          return this._currentGameData;
        }

        set remainingCardCount(value) {
          this._remainingCardCount = value;
        }

        get remainingCardCount() {
          return this._remainingCardCount;
        }

        set isExitGame(value) {
          this._isExitGame = value;
        }

        get isExitGame() {
          return this._isExitGame;
        }

        set isManualRightScratching(value) {
          this._isManualRightScratching = value;
        }

        get isManualRightScratching() {
          return this._isManualRightScratching;
        }

        set isAutoScratching(value) {
          this._isAutoScratching = value;
        }

        get isAutoScratching() {
          return this._isAutoScratching;
        }

        set autoScratchCount(value) {
          this._autoScratchCount = value;
        }

        get autoScratchCount() {
          return this._autoScratchCount;
        }

        set autoScratchedCount(value) {
          this._autoScratchedCount = value;
        }

        set autoScratchTotalAmount(value) {
          this._autoScratchTotalAmount = value;
        }

        get autoScratchTotalAmount() {
          return this._autoScratchTotalAmount;
        }

        set autoScratchWinCardCount(value) {
          this._autoScratchWinCardCount = value;
        }

        get autoScratchWinCardCount() {
          return this._autoScratchWinCardCount;
        }

        get autoScratchedCount() {
          return this._autoScratchedCount;
        }

        set isOneKeyScratching(value) {
          this._isOneKeyScratching = value;
        }

        get isOneKeyScratching() {
          return this._isOneKeyScratching;
        }

        set currentTicketData(value) {
          this._currentTicketData = value;
        }

        get currentTicketData() {
          return this._currentTicketData;
        }

        set currentCardStatus(value) {
          this._currentCardStatus = value;
        }

        get currentCardStatus() {
          return this._currentCardStatus;
        }

        set isKickOff(value) {
          this._isKickOff = value;
        }

        get isKickOff() {
          return this._isKickOff;
        }

        set currentCardSettlementStatus(value) {
          this._currentCardSettlementStatus = value;
        }

        get currentCardSettlementStatus() {
          return this._currentCardSettlementStatus;
        }

        set isDownScratchOver(value) {
          this._isDownScratchOver = value;
        }

        get isDownScratchOver() {
          return this._isDownScratchOver;
        }

        set isCurrentCardWin(value) {
          this._isCurrentCardWin = value;
        }

        get isCurrentCardWin() {
          return this._isCurrentCardWin;
        }

        set lastWinIndexs(value) {
          this._lastWinIndexs = value;
        }

        get lastWinIndexs() {
          return this._lastWinIndexs;
        }

        set currentSettledBillId(value) {
          this._currentSettledBillId = value;
        }

        get currentSettledBillId() {
          return this._currentSettledBillId;
        }

        set isScratchOver(value) {
          this._isScratchOver = value;
        }

        get isScratchOver() {
          return this._isScratchOver;
        }

        set isSettlementClosed(value) {
          this._isSettlementClosed = value;
        }

        get isSettlementClosed() {
          return this._isSettlementClosed;
        }

        set isRegularWin(value) {
          this._isRegularWin = value;
        }

        get isRegularWin() {
          return this._isRegularWin;
        }

        set isOneKeyScratchingSingleCard(value) {
          this._isOneKeyScratchingSingleCard = value;
        }

        get isOneKeyScratchingSingleCard() {
          return this._isOneKeyScratchingSingleCard;
        }

        set isAutoPlay(value) {
          this._isAutoPlay = value;
        }

        get isAutoPlay() {
          return this._isAutoPlay;
        }

        get bigAmount() {
          return this._bigAmount;
        }

        set bigAmount(value) {
          this._bigAmount = value;
        }

        get topAmount() {
          return this._topAmount;
        }

        set topAmount(value) {
          this._topAmount = value;
        }

        initTopAndBigAmount(bigAmount, topAmount) {
          this._bigAmount = bigAmount;
          this._topAmount = topAmount;
        }

        set currentCardAfterScratchStatus(value) {
          this._currentCardAfterScratchStatus = value;
        }

        get currentCardAfterScratchStatus() {
          return this._currentCardAfterScratchStatus;
        }

        set lastWinAmount(value) {
          this._lastWinAmount = value;
        }

        get lastWinAmount() {
          return this._lastWinAmount;
        }

        set turnToGameId(value) {
          this._turnToGameId = value;
        }

        get turnToGameId() {
          return this._turnToGameId;
        }

        set turnToGameName(value) {
          this._turnToGameName = value;
        }

        get turnToGameName() {
          return this._turnToGameName;
        }

        set turnToPlayType(value) {
          this._turnToPlayType = value;
        }

        get turnToPlayType() {
          return this._turnToPlayType;
        }

        set yourNumbersTrajectoryData(value) {
          this._yourNumbersTrajectoryData = value;
        }

        get yourNumbersTrajectoryData() {
          return this._yourNumbersTrajectoryData;
        }

        set bonusTrajectoryData(value) {
          this._bonusTrajectoryData = value;
        }

        get bonusTrajectoryData() {
          return this._bonusTrajectoryData;
        }

        set deviceType(value) {
          this._deviceType = value;
        }

        get deviceType() {
          return this._deviceType;
        }

        set currentBonusMultiple(value) {
          this._currentBonusMultiple = value;
        }

        get currentBonusMultiple() {
          return this._currentBonusMultiple;
        }

        set maxWinMultiple(value) {
          this._maxWinMultiple = value;
        }

        get maxWinMultiple() {
          return this._maxWinMultiple;
        }

        set gamePriceList(value) {
          this._gamePriceList = value;
        }

        get gamePriceList() {
          return this._gamePriceList;
        }

        set Level(value) {
          this._performanceSettings.level = value;
        }

        get Level() {
          return this._performanceSettings.level;
        }

        set performanceSettings(value) {
          this._performanceSettings = value;

          if (value.level === "low") {
            this.particleNumber = 0;
          } else if (value.level === "medium") {
            this.particleNumber = 1;
          } else if (value.level === "high") {
            this.particleNumber = 2;
          }
        }

        get performanceSettings() {
          return this._performanceSettings;
        }

        getCurrentCardPrice(playType) {
          var _this$gameList$find;

          var price = 0;

          if (!this || !this.gameList) {
            return price;
          }

          var curPrice = (_this$gameList$find = this.gameList.find(game => game.playType === playType)) == null ? void 0 : _this$gameList$find.unitPrice;

          switch (playType) {
            case "GO_BANANAS":
              price = 20;
              break;

            case "SEVEN_SEVEN_SEVEN":
              price = 20;
              break;

            case "INSTANT_KENO":
              price = 50;
              break;

            case "LUCKY_COLORS":
              price = 20;
              break;

            case "IN_BETWEEN":
              price = 20;
              break;

            case "BINGO_CARD":
              price = 50;
              break;

            case "GINTO_SCRATCH":
              price = 20;
              break;

            case "PIKA_SCRATCH":
              price = 20;
              break;

            case "LUCKY_NUMBER_SCRATCH":
              price = 20;
              break;

            case "HALO_SCRATCH":
              price = 20;
              break;

            default:
              price = 20;
              break;
          }

          return curPrice || price;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=c5f9c7a732dc18c2a61bebb82444b606551512a2.js.map