System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, instantiate, Node, find, UITransform, MessageFlag, PLK, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _crd, ccclass, property, UIRoot;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfMessageFlag(extras) {
    _reporterNs.report("MessageFlag", "../manager/MessageFlag", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPLK(extras) {
    _reporterNs.report("PLK", "../PLK", _context.meta, extras);
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
      instantiate = _cc.instantiate;
      Node = _cc.Node;
      find = _cc.find;
      UITransform = _cc.UITransform;
    }, function (_unresolved_2) {
      MessageFlag = _unresolved_2.MessageFlag;
    }, function (_unresolved_3) {
      PLK = _unresolved_3.default;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "6e0bfkVju5BsawITwMJXwkk", "UIRoot", undefined);

      __checkObsolete__(['_decorator', 'Component', 'instantiate', 'Node', 'find', 'UITransform', 'Color', 'Size', 'Animation', 'tween', 'Vec3', 'view', 'SpriteFrame']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("UIRoot", UIRoot = (_dec = ccclass('UIRoot'), _dec2 = property(Node), _dec3 = property(Node), _dec(_class = (_class2 = class UIRoot extends Component {
        constructor(...args) {
          super(...args);
          // 主场景
          this.scene = void 0;
          // 弹窗
          this.popup = void 0;
          // 面板
          this.panel = void 0;
          // 提示
          this.toast = void 0;
          // 警告
          this.alert = void 0;
          // 加载
          this.loading = void 0;
          // 遮罩
          this.mask = void 0;
          // 遮罩节点
          this.maskNode = void 0;
          this.apiLoading = void 0;

          // h5
          _initializerDefineProperty(this, "h5", _descriptor, this);

          // pc
          _initializerDefineProperty(this, "pc", _descriptor2, this);

          // 延迟200ms才开始播放叶子动画
          this.delayPlayLeafAnimation = null;
        }

        onLoad() {}

        start() {
          this.onResize();
        }

        init() {
          this.scene = this.findNode('scene');
          this.popup = this.findNode('popup');
          this.panel = this.findNode('panel');
          this.toast = this.findNode('toast');
          this.alert = this.findNode('alert');
          this.loading = this.findNode('loading');
          this.mask = this.findNode('mask');
          this.maskNode = this.findNode('maskNode');
          this.apiLoading = this.findNode('apiLoading');
          this.apiLoading.active = false;
          this.maskNode.active = false;
          this.mask.active = false;
          this.loading.active = false; // 监听API加载

          (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
            error: Error()
          }), PLK) : PLK).event.on((_crd && MessageFlag === void 0 ? (_reportPossibleCrUseOfMessageFlag({
            error: Error()
          }), MessageFlag) : MessageFlag).SHOW_API_LOADING, this.onShowApiLoading, this);
          (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
            error: Error()
          }), PLK) : PLK).event.on((_crd && MessageFlag === void 0 ? (_reportPossibleCrUseOfMessageFlag({
            error: Error()
          }), MessageFlag) : MessageFlag).HIDE_API_LOADING, this.onHideApiLoading, this); // 监听resize

          (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
            error: Error()
          }), PLK) : PLK).event.on((_crd && MessageFlag === void 0 ? (_reportPossibleCrUseOfMessageFlag({
            error: Error()
          }), MessageFlag) : MessageFlag).RESIZE, this.onResize, this);
        }

        onShowApiLoading() {
          this.apiLoading.active = true;
        }

        onHideApiLoading() {
          this.apiLoading.active = false;
        }

        findNode(path) {
          return find(path, this.node);
        }

        addScene(node) {
          node && this.scene.addChild(node);
          const firstScene = this.scene.children[0];
          this.scene.children.length > 1 && firstScene && this.scene.removeChild(firstScene);
        }

        addPopup(node, hasMask = true) {
          let mask = this.cloneMask;
          mask.name = 'mask'; // mask.addChild(node)

          this.popup.addChild(mask);
          this.popup.addChild(node);
        }

        addAlert(node) {
          let mask = this.cloneMask;
          mask.name = 'mask';
          this.alert.addChild(mask);
          this.alert.addChild(node);
        }

        addPanel(node, hasMask = true) {
          let mask = this.cloneMask;
          mask.name = 'mask'; // mask.name = node.name
          // mask.addChild(node)

          this.panel.addChild(mask);
          this.panel.addChild(node);
        }

        addToast(node) {
          node && this.toast.addChild(node);
        }

        removePanel(name) {
          let mask = this.panel.getChildByName('mask');
          mask && this.panel.removeChild(mask);

          if (typeof name == 'string') {
            let node = this.panel.getChildByName(name);
            node && this.panel.removeChild(node);
          } else {
            this.panel.removeChild(name);
          }
        }

        removePopup(name) {
          let mask = this.popup.getChildByName('mask');
          mask && this.popup.removeChild(mask);

          if (typeof name == 'string') {
            let node = this.popup.getChildByName(name);
            node && this.popup.removeChild(node);
          } else {
            this.popup.removeChild(name);
          }
        }

        get cloneMask() {
          let mask = instantiate(this.maskNode);
          mask.active = true;
          return mask;
        }

        showLoading() {
          this.loading.active = true;
          this.unschedule(this.hideLoading);
          this.scheduleOnce(this.hideLoading, 10);
        }

        showMask() {
          this.mask.active = true;
          this.unschedule(this.hideMask);
          this.scheduleOnce(this.hideMask, 10);
        }

        hideLoading() {
          this.loading.active = false;
        }

        hideMask() {
          this.mask.active = false;
        }

        get sceneWidth() {
          return this.scene.getComponent(UITransform).width;
        }

        get sceneHeight() {
          return this.scene.getComponent(UITransform).height;
        }

        onResize() {
          if ((_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
            error: Error()
          }), PLK) : PLK).gameData.deviceType == 'pc') {
            this.pc && (this.pc.active = true);
            this.h5 && (this.h5.active = false);
          } else {
            this.pc && (this.pc.active = false);
            this.h5 && (this.h5.active = true);
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "h5", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: null
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "pc", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: null
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=fc75abbaa204f0f222a8e551f18dc17e1342656a.js.map