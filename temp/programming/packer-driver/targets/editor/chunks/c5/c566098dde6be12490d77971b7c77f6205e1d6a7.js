System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, GameUserInfo, _crd;

  function _reportPossibleCrUseOfUserInfo(extras) {
    _reporterNs.report("UserInfo", "@ge/game-common-sdk", _context.meta, extras);
  }

  _export("GameUserInfo", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "f12e7aPWilMMbFNLJwC7AJN", "GameUserInfo", undefined);

      /**
       * UserInfo 类
       * 用于管理当前玩家的全局信息
       * 单例模式确保数据的唯一性
       */
      _export("GameUserInfo", GameUserInfo = class GameUserInfo {
        constructor() {
          this._userInfo = null;
        }

        get userInfo() {
          return this._userInfo;
        }

        set userInfo(userInfo) {
          this._userInfo = userInfo;
        }

        get balance() {
          return this.userInfo.balance;
        }

        set balance(balance) {
          this.userInfo.balance = balance;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=c566098dde6be12490d77971b7c77f6205e1d6a7.js.map