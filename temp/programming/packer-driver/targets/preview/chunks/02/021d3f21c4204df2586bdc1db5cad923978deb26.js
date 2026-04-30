System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Node, tween, UIOpacity, UITransform, Vec3, Widget, BaseUI, PLK, AudioManager, AniType, MessageFlag, UIType, _dec, _class, _crd, ccclass, property, BasePanel;

  function _reportPossibleCrUseOfBaseUI(extras) {
    _reporterNs.report("BaseUI", "./BaseUI", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPLK(extras) {
    _reporterNs.report("PLK", "../PLK", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAudioManager(extras) {
    _reporterNs.report("AudioManager", "../manager/AudioManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAniType(extras) {
    _reporterNs.report("AniType", "../types/global.d", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMessageFlag(extras) {
    _reporterNs.report("MessageFlag", "../manager/MessageFlag", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUIType(extras) {
    _reporterNs.report("UIType", "../eui/UIkeys", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Node = _cc.Node;
      tween = _cc.tween;
      UIOpacity = _cc.UIOpacity;
      UITransform = _cc.UITransform;
      Vec3 = _cc.Vec3;
      Widget = _cc.Widget;
    }, function (_unresolved_2) {
      BaseUI = _unresolved_2.BaseUI;
    }, function (_unresolved_3) {
      PLK = _unresolved_3.default;
    }, function (_unresolved_4) {
      AudioManager = _unresolved_4.AudioManager;
    }, function (_unresolved_5) {
      AniType = _unresolved_5.AniType;
    }, function (_unresolved_6) {
      MessageFlag = _unresolved_6.MessageFlag;
    }, function (_unresolved_7) {
      UIType = _unresolved_7.UIType;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ee2c8DJvrFKdr75/FTBnT6Y", "BasePanel", undefined);

      __checkObsolete__(['_decorator', 'CCBoolean', 'Component', 'Enum', 'Node', 'tween', 'UIOpacity', 'UITransform', 'Vec3', 'Widget']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("BasePanel", BasePanel = (_dec = ccclass("BasePanel"), _dec(_class = class BasePanel extends (_crd && BaseUI === void 0 ? (_reportPossibleCrUseOfBaseUI({
        error: Error()
      }), BaseUI) : BaseUI) {
        constructor() {
          super(...arguments);
          this.closeBtn = null;
          this.closeWithMask = false;
          this.aniType = (_crd && AniType === void 0 ? (_reportPossibleCrUseOfAniType({
            error: Error()
          }), AniType) : AniType).none;
          this.uiType = (_crd && UIType === void 0 ? (_reportPossibleCrUseOfUIType({
            error: Error()
          }), UIType) : UIType).panel;
        }

        onLoad() {
          // 确保Widget组件先生效，然后执行动画
          this.ensureWidgetUpdatedThenShowAni();

          if (this.closeWithMask) {
            this.node.parent.on(Node.EventType.TOUCH_END, this.onMaskClick, this);
          }

          this.closeBtn = this.node.getChildByName("closeBtn") || this.findChildRecursively(this.node, "closeBtn");

          if (this.closeBtn) {
            this.closeBtn.on(Node.EventType.TOUCH_END, this.close, this);
          }
        }
        /**
         * 处理遮罩点击事件
         * 只有当点击目标不是面板本身或其子节点时才关闭面板
         */


        onMaskClick(event) {
          var target = event.target; // 检查点击目标是否是当前面板或其子节点

          if (this.isNodeChildOf(target, this.node)) {
            // 如果点击的是面板内部的元素，不关闭面板
            return;
          }

          (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
            error: Error()
          }), PLK) : PLK).event.emit((_crd && MessageFlag === void 0 ? (_reportPossibleCrUseOfMessageFlag({
            error: Error()
          }), MessageFlag) : MessageFlag).MASK_CHANGE, {
            isShow: false,
            node: null
          }); // 如果点击的是背景区域，关闭面板

          this.close(false);
        }
        /**
         * 检查节点是否是指定父节点的子节点
         */


        isNodeChildOf(child, parent) {
          if (!child || !parent) {
            return false;
          }

          if (child === parent) {
            return true;
          }

          var currentParent = child.parent;

          while (currentParent) {
            if (currentParent === parent) {
              return true;
            }

            currentParent = currentParent.parent;
          }

          return false;
        }
        /**
         * 确保Widget组件更新后再执行动画
         */


        ensureWidgetUpdatedThenShowAni() {
          var widget = this.node.getComponent(Widget);

          if (widget) {
            // 简单延迟，让Widget组件自然完成布局更新
            // 不手动调用updateAlignment，避免重复更新导致闪现
            this.scheduleOnce(() => {
              this.showAni();
            }, 0.01); // 稍微增加延迟时间，确保Widget完成更新
          } else {
            // 没有Widget组件，直接执行动画
            this.showAni();
          }
        }
        /**
         * 递归查找子节点
         * @param parent 父节点
         * @param name 要查找的节点名称
         * @returns 找到的节点或null
         */


        findChildRecursively(parent, name) {
          // 先检查直接子节点
          for (var i = 0; i < parent.children.length; i++) {
            var child = parent.children[i];

            if (child.name === name) {
              return child;
            }
          } // 递归检查子节点的子节点


          for (var _i = 0; _i < parent.children.length; _i++) {
            var _child = parent.children[_i];
            var found = this.findChildRecursively(_child, name);

            if (found) {
              return found;
            }
          }

          return null;
        }

        close(playClick, callback, closeMask) {
          if (playClick === void 0) {
            playClick = true;
          }

          if (callback === void 0) {
            callback = null;
          }

          if (closeMask === void 0) {
            closeMask = true;
          }

          if (playClick) {
            (_crd && AudioManager === void 0 ? (_reportPossibleCrUseOfAudioManager({
              error: Error()
            }), AudioManager) : AudioManager).getInstance().playEffectByName("click2");
          }

          if (this.closeWithMask || closeMask) {
            (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
              error: Error()
            }), PLK) : PLK).event.emit((_crd && MessageFlag === void 0 ? (_reportPossibleCrUseOfMessageFlag({
              error: Error()
            }), MessageFlag) : MessageFlag).MASK_CHANGE, {
              isShow: false,
              node: null
            });
          }

          if (this.closeWithMask) {
            var _this$node;

            (_this$node = this.node) == null || (_this$node = _this$node.parent) == null || _this$node.off(Node.EventType.TOUCH_END, this.onMaskClick, this);
          }

          switch (this.aniType) {
            case (_crd && AniType === void 0 ? (_reportPossibleCrUseOfAniType({
              error: Error()
            }), AniType) : AniType).center:
              this.closeWithCenter(callback);
              break;

            case (_crd && AniType === void 0 ? (_reportPossibleCrUseOfAniType({
              error: Error()
            }), AniType) : AniType).left:
              this.closeWithLeft(callback);
              break;

            case (_crd && AniType === void 0 ? (_reportPossibleCrUseOfAniType({
              error: Error()
            }), AniType) : AniType).right:
              this.closeWithRight(callback);
              break;

            case (_crd && AniType === void 0 ? (_reportPossibleCrUseOfAniType({
              error: Error()
            }), AniType) : AniType).bottom:
              this.closeWithBottom(callback);
              break;

            case (_crd && AniType === void 0 ? (_reportPossibleCrUseOfAniType({
              error: Error()
            }), AniType) : AniType).top:
              this.closeWithTop(callback);
              break;

            case (_crd && AniType === void 0 ? (_reportPossibleCrUseOfAniType({
              error: Error()
            }), AniType) : AniType).opacity:
              this.closeWithOpacity(callback);
              break;

            default:
              this.closeNoAni(callback);
          }
        }

        removePanel() {
          if (this.uiType === (_crd && UIType === void 0 ? (_reportPossibleCrUseOfUIType({
            error: Error()
          }), UIType) : UIType).panel) {
            (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
              error: Error()
            }), PLK) : PLK).ui.removePanel(this.node);
          } else if (this.uiType === (_crd && UIType === void 0 ? (_reportPossibleCrUseOfUIType({
            error: Error()
          }), UIType) : UIType).popup) {
            (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
              error: Error()
            }), PLK) : PLK).ui.removePopup(this.node);
          }
        }

        showAni() {
          switch (this.aniType) {
            case (_crd && AniType === void 0 ? (_reportPossibleCrUseOfAniType({
              error: Error()
            }), AniType) : AniType).center:
              this.openWithCenter();
              break;

            case (_crd && AniType === void 0 ? (_reportPossibleCrUseOfAniType({
              error: Error()
            }), AniType) : AniType).left:
              this.openWithLeft();
              break;

            case (_crd && AniType === void 0 ? (_reportPossibleCrUseOfAniType({
              error: Error()
            }), AniType) : AniType).right:
              this.openWithRight();
              break;

            case (_crd && AniType === void 0 ? (_reportPossibleCrUseOfAniType({
              error: Error()
            }), AniType) : AniType).top:
              this.openWithTop();
              break;

            case (_crd && AniType === void 0 ? (_reportPossibleCrUseOfAniType({
              error: Error()
            }), AniType) : AniType).bottom:
              this.openWithBottom();
              break;

            case (_crd && AniType === void 0 ? (_reportPossibleCrUseOfAniType({
              error: Error()
            }), AniType) : AniType).opacity:
              this.openWithOpacity();
              break;

            default:
              this.openNoAni();
          }
        }

        openWithRight() {
          var nodeWidth = this.node.getComponent(UITransform).width;
          var parentWidth = (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
            error: Error()
          }), PLK) : PLK).ui.sceneWidth; // 获取Widget生效后的正确Y位置

          var widgetAdjustedY = this.node.position.y; // 右侧开启：从右侧外边缘滑入到内边缘

          var startX = (parentWidth - nodeWidth) / 2 + nodeWidth;
          var targetX = 0; //startX - nodeWidth  // 与计算规则一致
          // 先设置起始位置，避免在tween中设置active导致闪现

          this.node.setPosition(startX, widgetAdjustedY, 0);
          this.node.getComponent(UIOpacity) && (this.node.getComponent(UIOpacity).opacity = 255);
          tween(this.node).to(0.2, {
            position: new Vec3(targetX, widgetAdjustedY, 0)
          }).start();
        }

        closeWithRight(callback) {
          var nodeWidth = this.node.getComponent(UITransform).width;
          var parentWidth = (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
            error: Error()
          }), PLK) : PLK).ui.sceneWidth; // 右侧关闭：移动到右侧外边缘

          var targetX = (parentWidth - nodeWidth) / 2 + nodeWidth;
          tween(this.node).to(0.2, {
            position: new Vec3(targetX, this.node.position.y, 0)
          }).call(() => {
            this.removePanel();
            callback && callback();
          }).start();
        }

        openWithBottom() {
          var nodeHeight = this.node.getComponent(UITransform).height;
          var parentHeight = (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
            error: Error()
          }), PLK) : PLK).ui.sceneHeight; // 获取Widget生效后的正确X位置

          var widgetAdjustedX = this.node.position.x; // 底部开启：从底部外边缘滑入到内边缘

          var startY = -((parentHeight - nodeHeight) / 2 + nodeHeight);
          var targetY = startY + nodeHeight; // 与计算规则一致
          // 先设置起始位置，避免在tween中设置active导致闪现

          this.node.setPosition(widgetAdjustedX, startY, 0);
          this.node.getComponent(UIOpacity) && (this.node.getComponent(UIOpacity).opacity = 255);
          tween(this.node).to(0.2, {
            position: new Vec3(widgetAdjustedX, targetY, 0)
          }).start();
        }

        openWithLeft() {
          var nodeWidth = this.node.getComponent(UITransform).width;
          var parentWidth = (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
            error: Error()
          }), PLK) : PLK).ui.sceneWidth; // 获取Widget生效后的正确Y位置

          var widgetAdjustedY = this.node.position.y; // 左侧开启：从左侧外边缘滑入到内边缘

          var startX = -((parentWidth - nodeWidth) / 2 + nodeWidth);
          var targetX = 0; //startX + nodeWidth  // 与Menu.ts中的计算一致
          // 先设置起始位置，避免在tween中设置active导致闪现

          this.node.setPosition(startX, widgetAdjustedY, 0);
          this.node.getComponent(UIOpacity) && (this.node.getComponent(UIOpacity).opacity = 255);
          tween(this.node).to(0.2, {
            position: new Vec3(targetX, widgetAdjustedY, 0)
          }).start();
        }

        openWithTop() {
          var nodeHeight = this.node.getComponent(UITransform).height;
          var parentHeight = (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
            error: Error()
          }), PLK) : PLK).ui.sceneHeight; // 获取Widget生效后的正确X位置

          var widgetAdjustedX = this.node.position.x; // 顶部开启：从顶部外边缘滑入到内边缘

          var startY = (parentHeight - nodeHeight) / 2 + nodeHeight;
          var targetY = startY - nodeHeight; // 与计算规则一致
          // 先设置起始位置，避免在tween中设置active导致闪现

          this.node.setPosition(widgetAdjustedX, startY, 0);
          this.node.getComponent(UIOpacity) && (this.node.getComponent(UIOpacity).opacity = 255);
          tween(this.node).to(0.2, {
            position: new Vec3(widgetAdjustedX, targetY, 0)
          }).start();
        }

        openWithCenter() {
          // 中心开启：从小到大出现
          // 设置初始缩放为0
          this.node.setScale(0, 0, 1);
          this.node.getComponent(UIOpacity) && (this.node.getComponent(UIOpacity).opacity = 255); // 缩放到正常大小

          tween(this.node).to(0.2, {
            scale: new Vec3(1, 1, 1)
          }).start();
        }

        closeWithBottom(callback) {
          var nodeHeight = this.node.getComponent(UITransform).height;
          var parentHeight = (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
            error: Error()
          }), PLK) : PLK).ui.sceneHeight; // 底部关闭：移动到底部外边缘

          var targetY = -((parentHeight - nodeHeight) / 2 + nodeHeight);
          tween(this.node).to(0.2, {
            position: new Vec3(this.node.position.x, targetY, 0)
          }).call(() => {
            this.removePanel();
            callback && callback();
          }).start();
        }

        closeWithLeft(callback) {
          var nodeWidth = this.node.getComponent(UITransform).width;
          var parentWidth = (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
            error: Error()
          }), PLK) : PLK).ui.sceneWidth; // 左侧关闭：移动到左侧外边缘

          var targetX = -((parentWidth - nodeWidth) / 2 + nodeWidth);
          tween(this.node).to(0.2, {
            position: new Vec3(targetX, this.node.position.y, 0)
          }).call(() => {
            this.removePanel();
            callback && callback();
          }).start();
        }

        closeWithTop(callback) {
          var nodeHeight = this.node.getComponent(UITransform).height;
          var parentHeight = (_crd && PLK === void 0 ? (_reportPossibleCrUseOfPLK({
            error: Error()
          }), PLK) : PLK).ui.sceneHeight; // 顶部关闭：移动到顶部外边缘

          var targetY = (parentHeight - nodeHeight) / 2 + nodeHeight;
          tween(this.node).to(0.2, {
            position: new Vec3(this.node.position.x, targetY, 0)
          }).call(() => {
            this.removePanel();
            callback && callback();
          }).start();
        }

        closeWithCenter(callback) {
          // 中心关闭：从大到小消失
          tween(this.node).to(0.2, {
            scale: new Vec3(0, 0, 1)
          }).call(() => {
            this.removePanel();
            callback && callback();
          }).start();
        }

        openNoAni() {
          tween(this.node.getComponent(UIOpacity)).set({
            opacity: 0
          }).to(0.3, {
            opacity: 255
          }).start();
        }

        closeNoAni(callback) {
          tween(this.node.getComponent(UIOpacity)).to(0.2, {
            opacity: 0
          }).call(() => {
            this.removePanel();
            callback && callback();
          }).start();
        }

        openWithOpacity() {
          // 透明度淡入：从透明到不透明
          var uiOpacity = this.node.getComponent(UIOpacity);

          if (!uiOpacity) {
            // 如果没有UIOpacity组件，添加一个
            uiOpacity = this.node.addComponent(UIOpacity);
          } // 设置初始透明度为0


          uiOpacity.opacity = 0; // 淡入到不透明

          tween(uiOpacity).to(0.3, {
            opacity: 255
          }).start();
        }

        closeWithOpacity(callback) {
          // 透明度淡出：从不透明到透明
          var uiOpacity = this.node.getComponent(UIOpacity);

          if (uiOpacity) {
            tween(uiOpacity).to(0.3, {
              opacity: 0
            }).call(() => {
              this.removePanel();
              callback && callback();
            }).start();
          } else {
            // 如果没有UIOpacity组件，直接关闭
            this.removePanel();
            callback && callback();
          }
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=021d3f21c4204df2586bdc1db5cad923978deb26.js.map