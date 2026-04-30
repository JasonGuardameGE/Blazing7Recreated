System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, ApiError, _crd, ApiErrorType;

  _export("ApiError", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "bf7560isqBG3pmFXscJlxTq", "ApiError", undefined);

      _export("ApiErrorType", ApiErrorType = /*#__PURE__*/function (ApiErrorType) {
        ApiErrorType["NETWORK_ERROR"] = "NETWORK_ERROR";
        ApiErrorType["TIMEOUT_ERROR"] = "TIMEOUT_ERROR";
        ApiErrorType["SERVER_ERROR"] = "SERVER_ERROR";
        ApiErrorType["BUSINESS_ERROR"] = "BUSINESS_ERROR";
        ApiErrorType["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
        return ApiErrorType;
      }({}));

      _export("ApiError", ApiError = class ApiError extends Error {
        constructor(type, message, code, data) {
          if (code === void 0) {
            code = 0;
          }

          super(message);
          this.type = void 0;
          this.code = void 0;
          this.data = void 0;
          this.type = type;
          this.code = code;
          this.data = data;
          this.name = 'ApiError';
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=b5a116e4cefb830334493950b7a110a8281fbdf1.js.map