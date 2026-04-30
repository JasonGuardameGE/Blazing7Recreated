System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, ProgressBar, Sprite, Label, _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, LoadingBar;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      ProgressBar = _cc.ProgressBar;
      Sprite = _cc.Sprite;
      Label = _cc.Label;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "1ab6eNZ0wtPAJrLErfhXNX4", "LoadingBar", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'ProgressBar', 'Sprite', 'Label']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("LoadingBar", LoadingBar = (_dec = ccclass('LoadingBar'), _dec2 = property(Label), _dec3 = property(ProgressBar), _dec4 = property(Sprite), _dec5 = property(Sprite), _dec(_class = (_class2 = class LoadingBar extends Component {
        constructor(...args) {
          super(...args);
          this.evtOnLoadingBarStartLoading = null;

          _initializerDefineProperty(this, "progressLabel", _descriptor, this);

          _initializerDefineProperty(this, "progressBar", _descriptor2, this);

          _initializerDefineProperty(this, "bar", _descriptor3, this);

          _initializerDefineProperty(this, "progressTog", _descriptor4, this);

          this.realProgress = 0;
          this.isSceneLoading = false;
          this.RealProgress = this.realProgress;
        }

        setEvtOnLoadingBarStartLoading(cb) {
          this.evtOnLoadingBarStartLoading = cb;
        }

        init() {
          this.Reset();
        }

        async StartLoading() {
          if (!this.evtOnLoadingBarStartLoading) {
            console.error("Loading cannot start, No loading event registered.");
            return;
          }

          await this.evtOnLoadingBarStartLoading();
        }

        Reset() {
          this.realProgress = 0;
          this.UpdateBar();
        }

        update(deltaTime) {}

        SetProgress(newProgress) {
          this.realProgress = newProgress;
          this.UpdateBar();
        }

        UpdateBar() {
          var _this$realProgress;

          const p = Math.min(Math.max((_this$realProgress = this.realProgress) != null ? _this$realProgress : 0, 0), 100);
          this.progressBar.progress = p / 100;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "progressLabel", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "progressBar", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "bar", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "progressTog", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=887f3befa77162f12ee6a600dc90b09b23dbd2e6.js.map