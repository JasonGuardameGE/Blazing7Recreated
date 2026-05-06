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
          this._currentTicketData = null;
        }

        set currentTicketData(value) {
          this._currentTicketData = value;
        }

        get currentTicketData() {
          return this._currentTicketData;
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=d9e989e3911e310821333903950c51538c2c38d9.js.map