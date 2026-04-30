System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Color, CCBoolean, Component, Label, Node, Sprite, SpriteFrame, CCFloat, tween, Vec3, AudioManager, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _crd, ccclass, property, SingleButton;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfAudioManager(extras) {
    _reporterNs.report("AudioManager", "../manager/AudioManager", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Color = _cc.Color;
      CCBoolean = _cc.CCBoolean;
      Component = _cc.Component;
      Label = _cc.Label;
      Node = _cc.Node;
      Sprite = _cc.Sprite;
      SpriteFrame = _cc.SpriteFrame;
      CCFloat = _cc.CCFloat;
      tween = _cc.tween;
      Vec3 = _cc.Vec3;
    }, function (_unresolved_2) {
      AudioManager = _unresolved_2.AudioManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "60569kt4spFb6YMQZFdGggG", "SingleButton", undefined);

      __checkObsolete__(['_decorator', 'Color', 'CCBoolean', 'Component', 'Label', 'Node', 'Sprite', 'SpriteFrame', 'CCFloat', 'tween', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("SingleButton", SingleButton = (_dec = ccclass('SingleButton'), _dec2 = property(SpriteFrame), _dec3 = property(SpriteFrame), _dec4 = property(SpriteFrame), _dec5 = property(SpriteFrame), _dec6 = property(SpriteFrame), _dec7 = property(SpriteFrame), _dec8 = property(SpriteFrame), _dec9 = property(SpriteFrame), _dec10 = property(SpriteFrame), _dec11 = property(Color), _dec12 = property(Color), _dec13 = property(Color), _dec14 = property(CCBoolean), _dec15 = property(CCFloat), _dec16 = property(CCBoolean), _dec17 = property(CCBoolean), _dec(_class = (_class2 = class SingleButton extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "normal", _descriptor, this);

          _initializerDefineProperty(this, "select", _descriptor2, this);

          _initializerDefineProperty(this, "disabledSprite", _descriptor3, this);

          _initializerDefineProperty(this, "normal_Tag", _descriptor4, this);

          _initializerDefineProperty(this, "select_Tag", _descriptor5, this);

          _initializerDefineProperty(this, "disabled_Tag", _descriptor6, this);

          _initializerDefineProperty(this, "normal_Tag2", _descriptor7, this);

          _initializerDefineProperty(this, "select_Tag2", _descriptor8, this);

          _initializerDefineProperty(this, "disabled_Tag2", _descriptor9, this);

          _initializerDefineProperty(this, "normalColor", _descriptor10, this);

          _initializerDefineProperty(this, "selectColor", _descriptor11, this);

          _initializerDefineProperty(this, "disabledColor", _descriptor12, this);

          _initializerDefineProperty(this, "autoChange", _descriptor13, this);

          _initializerDefineProperty(this, "clickScale", _descriptor14, this);

          this._isSelect = false;
          this._disabled = false;
        }

        get isSelect() {
          return this._isSelect;
        }

        set isSelect(value) {
          this._isSelect = value;
          this.updateState();
        }

        get disabled() {
          return this._disabled;
        }

        set disabled(value) {
          this._disabled = value;
          this.updateState();
        }

        updateState() {
          if (this._disabled) {
            this.node.getComponent(Sprite).spriteFrame = this.disabledSprite;

            if (this.node.getChildByName('tag')) {
              this.node.getChildByName('tag').getComponent(Sprite).spriteFrame = this.disabled_Tag;
            }

            if (this.node.getChildByName('Label')) {
              this.node.getChildByName('Label').getComponent(Label).color = this.disabledColor;
            }

            if (this.node.getChildByName('tag2')) {
              this.node.getChildByName('tag2').getComponent(Sprite).spriteFrame = this.disabled_Tag2;
            }
          } else {
            if (this._isSelect) {
              this.node.getComponent(Sprite).spriteFrame = this.select;

              if (this.node.getChildByName('tag')) {
                this.node.getChildByName('tag').getComponent(Sprite).spriteFrame = this.select_Tag;
              }

              if (this.node.getChildByName('Label')) {
                this.node.getChildByName('Label').getComponent(Label).color = this.selectColor;
              }

              if (this.node.getChildByName('tag2')) {
                this.node.getChildByName('tag2').getComponent(Sprite).spriteFrame = this.select_Tag2;
              }
            } else {
              this.node.getComponent(Sprite).spriteFrame = this.normal;

              if (this.node.getChildByName('tag')) {
                this.node.getChildByName('tag').getComponent(Sprite).spriteFrame = this.normal_Tag;
              }

              if (this.node.getChildByName('Label')) {
                this.node.getChildByName('Label').getComponent(Label).color = this.normalColor;
              }

              if (this.node.getChildByName('tag2')) {
                this.node.getChildByName('tag2').getComponent(Sprite).spriteFrame = this.normal_Tag2;
              }
            }
          }
        }

        start() {
          this.node.on(Node.EventType.TOUCH_END, this.changeState, this);
        }

        changeState() {
          if (!this.disabled) {
            (_crd && AudioManager === void 0 ? (_reportPossibleCrUseOfAudioManager({
              error: Error()
            }), AudioManager) : AudioManager).getInstance().playEffectByName('click');
          }

          if (this.autoChange) {
            this.isSelect = !this.isSelect;
          }

          if (this.clickScale > 0) {
            // tween to scale
            let originScale = this.node.getScale();
            let targetScale = new Vec3(originScale.x + this.clickScale, originScale.y + this.clickScale, 1);
            tween(this.node).to(0.1, {
              scale: targetScale
            }, {
              easing: 'quartOut'
            }).call(() => {
              tween(this.node).to(0.1, {
                scale: originScale
              }, {
                easing: 'quartOut'
              }).start();
            }).start();
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "normal", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "select", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "disabledSprite", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "normal_Tag", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "select_Tag", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "disabled_Tag", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "normal_Tag2", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "select_Tag2", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "disabled_Tag2", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "normalColor", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return new Color();
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "selectColor", [_dec12], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return new Color();
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "disabledColor", [_dec13], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return new Color();
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "autoChange", [_dec14], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return true;
        }
      }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "clickScale", [_dec15], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0;
        }
      }), _applyDecoratedDescriptor(_class2.prototype, "isSelect", [_dec16], Object.getOwnPropertyDescriptor(_class2.prototype, "isSelect"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "disabled", [_dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "disabled"), _class2.prototype)), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=7350e875d0fc056d17c491952a409445c90ceaf2.js.map