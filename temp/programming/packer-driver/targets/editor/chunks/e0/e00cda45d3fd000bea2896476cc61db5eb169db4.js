System.register(["cc", "__unresolved_0", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _cclegacy, ApiCore, GameApi, _crd, ApiManager;

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_) {
      ApiCore = _unresolved_;
    }, function (_unresolved_2) {
      GameApi = _unresolved_2;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "95c978FE6xNoqD06xx1+ZhJ", "ApiManager", undefined);

      ApiManager = {
        initialize: ApiCore.initSdk,
        isReady: ApiCore.isReady,
        getSdk: ApiCore.getSdk,
        destroy: ApiCore.destroySdk,
        GameApi
      };

      _export("default", ApiManager);

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=e00cda45d3fd000bea2896476cc61db5eb169db4.js.map