System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, _dec, _class, _crd, ccclass, property, GameData;

  function _reportPossibleCrUseOfTicketData(extras) {
    _reporterNs.report("TicketData", "./TicketData", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
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
          // DEVICE TYPE
          this._deviceType = "h5";
          // CURRENT TICKET DATA
          this._currentTicketData = null;
          // GAME LIST
          this._gameList = [];
          // GAME ID
          this._gameId = "2000802906231672834";
          // GameName
          this._gameName = "Go Bananas";
          // CurrentPlayType
          this._currentPlayType = "GO_BANANAS2";
          // Last Win
          this._lastWinAmount = 0;
          // Remaining Cards
          this._remainingCardCount = 0;
          // Card Price
          this._cardPrice = 20;
          // Auto Play
          this._isAutoPlay = true;
          // Price List
          this._gamePriceList = [];
          // Unit Price
          this._unitPrice = 20;
          // MaxWinMultiple
          this._maxWinMultiple = 14582;
          // Token
          this._token = "";
          // aesKey
          this._aesKey = "";
          // CONFIG
          this._config = null;
          this._onlineConfig = null;
          this._productId = "GV1";
          this._urlParams = null;
          this._showBackBtn = true;
          this.topItemDelay = 50;
          this.contentItemDelay = 50;
          this.topToContentDelay = 100;
          //#region  big and top Amounts
          //TODO: VALUES ARE TEMPORARY, REMOVE INITIAL VALUE ONCE WE CONNECT TO API
          this._bigAmount = "100,2000";
          //TODO: VALUES ARE TEMPORARY, REMOVE INITIAL VALUE ONCE WE CONNECT TO API
          this._topAmount = "20,40";
        }

        get DeviceType() {
          return this._deviceType;
        }

        set DeviceType(value) {
          this._deviceType = value;
        }

        set TicketData(value) {
          this._currentTicketData = value;
        }

        get TicketData() {
          return this._currentTicketData;
        }

        set gameList(value) {
          this._gameList = value;
        }

        get gameList() {
          return this._gameList;
        }

        set gameId(value) {
          this._gameId = value;
        }

        get gameId() {
          return this._gameId;
        }

        set gameName(value) {
          this._gameName = value;
        }

        get gameName() {
          return this._gameName;
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

        set lastWinAmount(value) {
          this._lastWinAmount = value;
        }

        get lastWinAmount() {
          return this._lastWinAmount;
        }

        set remainingCardCount(value) {
          this._remainingCardCount = value;
        }

        get remainingCardCount() {
          return this._remainingCardCount;
        }

        set cardPrice(value) {
          this._cardPrice = value;
        }

        get cardPrice() {
          return this._cardPrice;
        }

        set isAutoPlay(value) {
          this._isAutoPlay = value;
        }

        get isAutoPlay() {
          return this._isAutoPlay;
        }

        set gamePriceList(value) {
          this._gamePriceList = value;
        }

        get gamePriceList() {
          return this._gamePriceList;
        }

        set unitPrice(value) {
          this._unitPrice = value != null ? value : 20;
        }

        get unitPrice() {
          return this._unitPrice;
        }

        set maxWinMultiple(value) {
          this._maxWinMultiple = value;
        }

        get maxWinMultiple() {
          return this._maxWinMultiple;
        }

        set token(value) {
          this._token = value;
        }

        get token() {
          return this._token;
        }

        set aesKey(value) {
          this._aesKey = value;
        }

        get aesKey() {
          return this._aesKey;
        }

        get config() {
          return this._config;
        }

        get urlParams() {
          return this._urlParams;
        }

        initConfig() {
          this.getUrlParams();
          const win = window;
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

        async getGameConfig() {
          var _config$back_button_c;

          if (this.isLocal()) {
            this._config.menuBundleRemoteUrl = "menu-bundle";
            this._showBackBtn = true;
            this.replaceConfig();
            return;
          }

          const cdn = this._config.cdn.split("/scratch/")[0] + "/scratch/";
          const config = await this.loadRemoteJson(window.location.origin + "/version");
          this._config.menuBundleRemoteUrl = cdn + "menubundleremote/" + config.menu + "/dist/remote/menu-bundle";
          const hideBackBtn = (config == null || (_config$back_button_c = config.back_button_config) == null ? void 0 : _config$back_button_c.hide) || [];
          hideBackBtn.includes(this._productId) ? this._showBackBtn = false : this._showBackBtn = true;
          this._onlineConfig = config;
          this.replaceConfig();
          return config;
        }

        getUrlParams() {
          //const urlParams = new URLSearchParams(window.location.search);
          const urlParams = new URLSearchParams("?token=eyJhbGciOiJSUzI1NiIsInppcCI6IkdaSVAifQ.H4sIAAAAAAAA_y2LzQrCMBCE32XPPXQ33U3SF9BepCev0iapVOwPMQVFfHdDFeYwfPPNG9a4-M2lxkMNhzNCAfflOs6nbgo_ckFSe5A4r257pGUKcT8ISVUia1FaiJnFyq7EGGb3ykJ7bDO4pTF3Sx6tMq7HTqpBpDfKeSlVWamBuB-yOHYJatTaGFJWbAHhuf4Bkxb7-QL093_TsAAAAA.hMAoBy8XpTRRjg3V4hfpxv4SVFTM_ulcUUO0CSchVWp_z-jzroPbkpCLc14LhIcdZ2VjYyHscf0P_vrfBN-D4y9Y-M2QZCd3ArOwtCYSlm5ceN78UHEfzOIDsf_D_2jURx9kw24QiB75aDrcoDVH_2H-abzXeKhrOmGxwy6Hvwd3XCQrGunRubalcLNWnIJvg5P4GPpvy70epn_TmgCsRy1jQjNZo6TJSYmRMLbx_2XViJe-71KNKMx5Te17YF8cRFtxnA3MaYJovPuWe5mfLVGyyyzL0MlSAYyBLoQARPl3Zv71vnT8_sPmdUmf7av2e0KRFQpUZjIW0n4k8ptfyw&gameId=2000802906231672834&lang=en-US&productId=GV1&gameName=BLAZING%207s&playType=BLAZING_7S_SCRATCH&callbackUrl=https://pilot.gelotto-test.com");
          const token = urlParams.get("token");
          const gameId = urlParams.get("gameId");
          const lang = urlParams.get("lang");
          const callbackUrl = urlParams.get("callbackUrl");
          const playType = urlParams.get("playType");
          const topItemDelay = urlParams.get("topItemDelay");
          const contentItemDelay = urlParams.get("contentItemDelay");
          const topToContentDelay = urlParams.get("topToContentDelay");
          const productId = urlParams.get("productId") || "GV1";
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

        replaceConfig() {
          for (const key in this._config) {
            this._config[key] = this.removeTrailingSlash(this._config[key]);
          }
        }

        initTopAndBigAmount(bigAmount, topAmount) {
          this._bigAmount = bigAmount;
          this._topAmount = topAmount;
        }

        get BigAmount() {
          return this._bigAmount;
        }

        set BigAmount(value) {
          this._bigAmount = value;
        }

        get TopAmount() {
          return this._topAmount;
        }

        set TopAmount(value) {
          this._topAmount = value;
        } //#endregion


        removeTrailingSlash(str) {
          if (!str) return str;
          return str.endsWith('/') ? str.slice(0, -1) : str;
        }

        isLocal() {
          if (typeof window === "undefined") {
            return false;
          }

          const host = window.location.hostname;
          const port = window.location.port; // localhost or 127.0.0.1

          if (host === "localhost" || host === "127.0.0.1") {
            return true;
          } // IPv6 localhost


          if (host === "::1") {
            return true;
          } // 10.x.x.x 私有 IP 段


          if (/^10\.\d+\.\d+\.\d+$/.test(host)) {
            return true;
          } // 192.168.x.x 私有 IP 段


          if (/^192\.168\.\d+\.\d+$/.test(host)) {
            return true;
          } // 172.16.0.0 – 172.31.255.255 私有 IP 段


          if (/^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(host)) {
            return true;
          }

          return false;
        }

        async loadRemoteJson(url) {
          const res = await fetch(url, {
            cache: 'no-store'
          });
          if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
          return await res.json();
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=d9e989e3911e310821333903950c51538c2c38d9.js.map