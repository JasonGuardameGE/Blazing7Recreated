System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, TicketData, _crd;

  _export("default", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "da869RYn+9Prq9Z+p9CHQ1j", "TicketData", undefined);

      _export("default", TicketData = class TicketData {
        constructor() {
          this._currentTicket = null;
          this.tickets = new Map();
          this._settleInfo = null;
          this._scratchingCardInfo = null;
          this._hasSettle = false;
          this._isAutoScratching = false;
          this._lastWin = 0;
          this._needInit = false;
          this._inProgress = false;
        }

        updateTicketItem(data) {
          try {
            var codes = this.markWinningCells(data.codes);
            data.codes = codes;
            this.currentTicket = data;
            this.tickets.set(data.billId, data);
          } catch (error) {
            console.error(error);
          }
        }

        set inProgress(value) {
          this._inProgress = value;
        }

        get inProgress() {
          return this._inProgress;
        }

        set hasSettle(value) {
          this._hasSettle = value;
        }

        get hasSettle() {
          return this._hasSettle;
        }

        set isAutoScratching(value) {
          this._isAutoScratching = value;
        }

        get isAutoScratching() {
          return this._isAutoScratching;
        }

        set currentTicket(data) {
          this._currentTicket = data;
          this.scratchingCardInfo = data.codes;
        }

        get currentTicket() {
          return this._currentTicket;
        }

        get currentTicketId() {
          var _this$_currentTicket;

          return ((_this$_currentTicket = this._currentTicket) == null ? void 0 : _this$_currentTicket.billId) || '';
        }

        get numberList() {
          var _this$currentTicket;

          return ((_this$currentTicket = this.currentTicket) == null ? void 0 : _this$currentTicket.codes) || [];
        }

        set settleInfo(data) {
          this._settleInfo = data;

          if (data && data.totalPayout > 0) {
            this._lastWin = data.totalPayout;
          }
        }

        get lastWin() {
          return this._lastWin;
        }

        get settleInfo() {
          return this._settleInfo;
        }

        set scratchingCardInfo(data) {
          this._scratchingCardInfo = data;
        }

        get scratchingCardInfo() {
          return this._scratchingCardInfo;
        }

        get needInit() {
          return this._needInit;
        }

        markWinningCells(codeStr, target) {
          if (target === void 0) {
            target = 7;
          }

          var nums = codeStr.split(',').map(Number); // 3x3 grid

          var g = [nums.slice(0, 3), nums.slice(3, 6), nums.slice(6, 9)]; // 默认全部不中奖

          var win = Array(9).fill(0); // 所有需要检查的线

          var lines = [// 横向
          [[0, 0], [0, 1], [0, 2]], [[1, 0], [1, 1], [1, 2]], [[2, 0], [2, 1], [2, 2]], // 纵向
          [[0, 0], [1, 0], [2, 0]], [[0, 1], [1, 1], [2, 1]], [[0, 2], [1, 2], [2, 2]], // 斜线
          [[0, 0], [1, 1], [2, 2]], [[0, 2], [1, 1], [2, 0]]];
          lines.forEach(line => {
            if (line.every(_ref => {
              var [r, c] = _ref;
              return g[r][c] === target;
            })) {
              line.forEach(_ref2 => {
                var [r, c] = _ref2;
                win[r * 3 + c] = 1; // 标记中奖位置
              });
            }
          }); // 输出结构化结果

          return nums.map((value, i) => ({
            value,
            win: win[i]
          }));
        }

        removeSettleTicket(id) {
          this.tickets.delete(id);

          if (this._currentTicket && this._currentTicket.billId == id) {
            this._currentTicket = null;
          }

          if (this.tickets.size > 0) {
            this._currentTicket = this.tickets.values().next().value;
            this._needInit = true;
          } else {
            this._needInit = false;
          }
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=22531926e83c2fbe889782c594434c7298dd5a69.js.map