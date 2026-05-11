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
          this._deviceType = "h5";
          this._currentTicketData = null;
          // bigAmount
          //TODO: VALUES ARE TEMPORARY, REMOVE INITIAL VALUE ONCE WE CONNECT TO API
          this._bigAmount = "100,2000";
          // totalAmount
          //TODO: VALUES ARE TEMPORARY, REMOVE INITIAL VALUE ONCE WE CONNECT TO API
          this._topAmount = "20,40";
          this._gameId = "2000802906231672834";
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

        set gameId(value) {
          this._gameId = value;
        }

        get gameId() {
          return this._gameId;
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
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=d9e989e3911e310821333903950c51538c2c38d9.js.map