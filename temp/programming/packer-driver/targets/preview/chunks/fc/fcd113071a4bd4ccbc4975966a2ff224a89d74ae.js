System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, UIkeys, _crd, UIType;

  function _reportPossibleCrUseOfUIItem(extras) {
    _reporterNs.report("UIItem", "../types/global.d", _context.meta, extras);
  }

  _export("UIkeys", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "06d40pE9SxN67kJAz0gdQD2", "UIkeys", undefined);

      _export("UIType", UIType = /*#__PURE__*/function (UIType) {
        UIType[UIType["alert"] = 0] = "alert";
        UIType[UIType["popup"] = 1] = "popup";
        UIType[UIType["panel"] = 2] = "panel";
        UIType[UIType["scene"] = 3] = "scene";
        UIType[UIType["toast"] = 4] = "toast";
        UIType[UIType["loading"] = 5] = "loading";
        return UIType;
      }({}));

      _export("UIkeys", UIkeys = class UIkeys {});

      // 结算面板
      UIkeys.superWin = {
        path: 'prefab/WinPopUp',
        name: 'WinPopUp',
        type: UIType.popup
      };
      // 大奖赢钱面板
      UIkeys.regularWin = {
        path: 'prefab/RegularWin',
        name: 'RegularWin',
        type: UIType.popup
      };
      // toast
      UIkeys.toast = {
        path: 'prefab/Toast',
        name: 'Toast',
        type: UIType.toast
      };
      // 退出面板
      UIkeys.ExitPopup = {
        path: 'prefab/ExitPopup',
        name: 'ExitPopup',
        type: UIType.popup
      };
      // 菜单面板
      UIkeys.MenuPopup = {
        path: 'prefab/Menu',
        name: 'Menu',
        type: UIType.panel
      };
      // 卡片详情面板
      UIkeys.cardDetail = {
        path: 'prefab/CardDetail',
        name: 'CardDetail',
        type: UIType.panel
      };
      // 游戏投注记录面板
      UIkeys.gameRecords = {
        path: 'prefab/GameRecords',
        name: 'GameRecords',
        type: UIType.panel
      };
      // 游戏规则面板
      UIkeys.gameRules = {
        path: 'prefab/GameRules',
        name: 'GameRules',
        type: UIType.panel
      };
      // 其他游戏面板
      UIkeys.otherGames = {
        path: 'prefab/OtherGames',
        name: 'OtherGames',
        type: UIType.panel
      };
      // 荣誉榜面板
      UIkeys.honorBoard = {
        path: 'prefab/HonorBoard',
        name: 'HonorBoard',
        type: UIType.panel
      };
      // 轨迹播放面板
      UIkeys.trajectory = {
        path: 'menu-bundle:resources/prefab/PopupCardDetail',
        name: 'Trajectory',
        type: UIType.alert
      };
      // 大赢特赢面板
      UIkeys.bigWin = {
        path: 'prefab/BigWin',
        name: 'BigWin',
        type: UIType.panel
      };
      // 卡销特赢面板
      UIkeys.cardSale = {
        path: 'prefab/CardSale',
        name: 'CardSale',
        type: UIType.panel
      };
      // 大奖特赢面板
      UIkeys.grandPrize = {
        path: 'prefab/GrandPrize',
        name: 'GrandPrize',
        type: UIType.panel
      };
      // 提示面板
      UIkeys.mention = {
        path: 'prefab/MentionPopUp',
        name: 'MentionPopUp',
        type: UIType.popup
      };
      // 菜单面板
      UIkeys.BundleMenuPopup = {
        path: 'menu-bundle:resources/prefab/BundleMenu',
        name: 'BundleMenu',
        type: UIType.panel
      };

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=fcd113071a4bd4ccbc4975966a2ff224a89d74ae.js.map