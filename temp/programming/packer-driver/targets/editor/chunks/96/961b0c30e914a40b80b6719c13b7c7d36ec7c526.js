System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, CCBoolean, Component, Sprite, UITransform, view, screen, _dec, _dec2, _class, _class2, _descriptor, _crd, ccclass, property, BGSize;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      CCBoolean = _cc.CCBoolean;
      Component = _cc.Component;
      Sprite = _cc.Sprite;
      UITransform = _cc.UITransform;
      view = _cc.view;
      screen = _cc.screen;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "94e9eMQVMNNNpHdKceNfIN+", "BGSize", undefined);

      __checkObsolete__(['_decorator', 'CCBoolean', 'Component', 'Node', 'Sprite', 'UITransform', 'view', 'screen']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("BGSize", BGSize = (_dec = ccclass('BGSize'), _dec2 = property(CCBoolean), _dec(_class = (_class2 = class BGSize extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "fixWidth", _descriptor, this);
        }

        start() {
          this.init();
          screen.on('window-resize', this.init, this);
        }

        init() {
          const bg = this.node.getComponent(Sprite);

          if (!bg || !bg.spriteFrame) {
            return;
          }

          const spriteFrame = bg.spriteFrame;
          const rect = spriteFrame.getRect();
          const w = rect.width; // 图片原始宽度

          const h = rect.height; // 图片原始高度

          if (w <= 0 || h <= 0) {
            return;
          }

          const uiTransform = this.node.getComponent(UITransform);

          if (!uiTransform) {
            return;
          }

          if (this.fixWidth) {
            // 固定宽度模式：动态计算高度，保持图片宽高比
            const nodew = uiTransform.width; // 节点当前宽度
            // 按照图片的宽高比，在图片宽度和node宽度一致的情况下，计算图片高度
            // 图片宽高比 = h / w (高度/宽度)
            // node高度 = node宽度 * 图片高度比例 = nodew * (h / w)

            const bgHeight = nodew * (h / w); // 设置节点高度

            uiTransform.height = bgHeight;
          } else {
            // 自适应缩放模式：宽高保持比例，铺满全屏
            const visibleSize = view.getVisibleSize();
            const screenWidth = visibleSize.width;
            const screenHeight = visibleSize.height; // 计算宽度和高度的缩放比例

            const scaleX = screenWidth / w;
            const scaleY = screenHeight / h; // 取较大的缩放比例，确保图片能够完全覆盖屏幕（可能会有部分超出）

            const scale = Math.max(scaleX, scaleY); // 设置节点宽高，保持图片比例

            uiTransform.width = w * scale;
            uiTransform.height = h * scale;
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "fixWidth", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return true;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=961b0c30e914a40b80b6719c13b7c7d36ec7c526.js.map