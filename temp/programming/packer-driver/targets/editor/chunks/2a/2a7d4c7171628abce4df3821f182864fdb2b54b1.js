System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Button, find, Label, ProgressBar, Sprite, Toggle, UIHelper, _crd;

  _export("default", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Button = _cc.Button;
      find = _cc.find;
      Label = _cc.Label;
      ProgressBar = _cc.ProgressBar;
      Sprite = _cc.Sprite;
      Toggle = _cc.Toggle;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "17774Xd6OxNZJk98uQ1JwBG", "UIHelper", undefined);

      __checkObsolete__(['Button', 'find', 'Label', 'Node', 'ProgressBar', 'Sprite', 'Toggle']);

      _export("default", UIHelper = class UIHelper {
        constructor() {
          this._canvas = null;
        }

        get canvas() {
          if (!this._canvas) this._canvas = find('Canvas');
          return this._canvas;
        }

        findNode(path, parent = null) {
          if (!path) return null;
          if (!parent) parent = this.canvas;
          return find(path, parent);
        }

        findSprite(path, parent = null) {
          var _this$findNode;

          return (_this$findNode = this.findNode(path, parent)) == null ? void 0 : _this$findNode.getComponent(Sprite);
        }

        findButton(path, parent = null) {
          var _this$findNode2;

          return (_this$findNode2 = this.findNode(path, parent)) == null ? void 0 : _this$findNode2.getComponent(Button);
        }

        findToggle(path, parent = null) {
          var _this$findNode3;

          return (_this$findNode3 = this.findNode(path, parent)) == null ? void 0 : _this$findNode3.getComponent(Toggle);
        }

        findLabel(path, parent = null) {
          var _this$findNode4;

          return (_this$findNode4 = this.findNode(path, parent)) == null ? void 0 : _this$findNode4.getComponent(Label);
        }

        findProgress(path, parent = null) {
          var _this$findNode5;

          return (_this$findNode5 = this.findNode(path, parent)) == null ? void 0 : _this$findNode5.getComponent(ProgressBar);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=2a7d4c7171628abce4df3821f182864fdb2b54b1.js.map