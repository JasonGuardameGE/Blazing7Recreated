System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, ResolutionPolicy, view, GameManager, Services, _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, UIRoot;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfGameManager(extras) {
    _reporterNs.report("GameManager", "../Managers/GameManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfServices(extras) {
    _reporterNs.report("Services", "../Managers/Services", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Node = _cc.Node;
      ResolutionPolicy = _cc.ResolutionPolicy;
      view = _cc.view;
    }, function (_unresolved_2) {
      GameManager = _unresolved_2.GameManager;
    }, function (_unresolved_3) {
      Services = _unresolved_3.Services;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "1f905TbNR9OeoAgpBYWe2N+", "UIRoot", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'ResolutionPolicy', 'view']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("UIRoot", UIRoot = (_dec = ccclass('UIRoot'), _dec2 = property(Node), _dec3 = property(Node), _dec4 = property(Node), _dec5 = property(Node), _dec(_class = (_class2 = class UIRoot extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "scene", _descriptor, this);

          _initializerDefineProperty(this, "backgroundH5", _descriptor2, this);

          _initializerDefineProperty(this, "backgroundPC", _descriptor3, this);

          _initializerDefineProperty(this, "popup", _descriptor4, this);

          this._gameManager = void 0;
          this.detectedDeviceResolution = 'h5';
        }

        get SceneRoot() {
          return this.scene;
        }

        get PopUpRoot() {
          return this.popup;
        }

        get DetectedDeviceResolution() {
          return this.detectedDeviceResolution;
        }

        start() {
          this.detectCanvas();
        }

        onResize() {
          if (!this._gameManager) {
            this._gameManager = (_crd && Services === void 0 ? (_reportPossibleCrUseOfServices({
              error: Error()
            }), Services) : Services).GetService(_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
              error: Error()
            }), GameManager) : GameManager);
          }

          if (this._gameManager.GameData.DeviceType == 'pc') {
            this.backgroundPC && (this.backgroundPC.active = true);
            this.backgroundH5 && (this.backgroundH5.active = false);
          } else {
            this.backgroundPC && (this.backgroundPC.active = false);
            this.backgroundH5 && (this.backgroundH5.active = true);
          }
        }

        detectCanvas() {
          var visibleSize = view.getVisibleSize();
          var designSize = view.getDesignResolutionSize();

          if (visibleSize.height / visibleSize.width > designSize.height / designSize.width) {
            // 长屏
            view.setDesignResolutionSize(designSize.width, designSize.height, ResolutionPolicy.FIXED_WIDTH);
            this.detectedDeviceResolution = 'h5';
          } else {
            // 宽屏
            view.setDesignResolutionSize(designSize.width, designSize.height, ResolutionPolicy.FIXED_HEIGHT);
            this.detectedDeviceResolution = 'pc';
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "scene", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "backgroundH5", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "backgroundPC", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "popup", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=ce221ae86ab9a3df4325b4b80cff91d56ea47b5a.js.map