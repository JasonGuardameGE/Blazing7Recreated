System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, sp, LoadingBar, Services, SceneManager, ScenePrefabPath, BaseEventListener, _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, LoadingScene;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfLoadingBar(extras) {
    _reporterNs.report("LoadingBar", "./LoadingBar", _context.meta, extras);
  }

  function _reportPossibleCrUseOfServices(extras) {
    _reporterNs.report("Services", "../../../Managers/Services", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSceneManager(extras) {
    _reporterNs.report("SceneManager", "../../../Managers/SceneManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfScenePrefabPath(extras) {
    _reporterNs.report("ScenePrefabPath", "../../../Managers/SceneManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameManager(extras) {
    _reporterNs.report("GameManager", "../../../Managers/GameManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBaseEventListener(extras) {
    _reporterNs.report("BaseEventListener", "../../../EventListener/BaseEventListener", _context.meta, extras);
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
      sp = _cc.sp;
    }, function (_unresolved_2) {
      LoadingBar = _unresolved_2.LoadingBar;
    }, function (_unresolved_3) {
      Services = _unresolved_3.Services;
    }, function (_unresolved_4) {
      SceneManager = _unresolved_4.default;
      ScenePrefabPath = _unresolved_4.ScenePrefabPath;
    }, function (_unresolved_5) {
      BaseEventListener = _unresolved_5.BaseEventListener;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "97ec7BohnVIBqmktWD4Liq3", "LoadingScene", undefined);

      __checkObsolete__(['_decorator', 'Component', 'ProgressBar', 'Sprite', 'Label', 'Node', 'sp', 'UITransform']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("LoadingScene", LoadingScene = (_dec = ccclass('Loading'), _dec2 = property(_crd && LoadingBar === void 0 ? (_reportPossibleCrUseOfLoadingBar({
        error: Error()
      }), LoadingBar) : LoadingBar), _dec3 = property(Node), _dec4 = property(Node), _dec5 = property(Node), _dec(_class = (_class2 = class LoadingScene extends Component {
        constructor(...args) {
          super(...args);
          this.evtOnLoadingComplete = new (_crd && BaseEventListener === void 0 ? (_reportPossibleCrUseOfBaseEventListener({
            error: Error()
          }), BaseEventListener) : BaseEventListener)();

          _initializerDefineProperty(this, "loadingBar", _descriptor, this);

          _initializerDefineProperty(this, "maskNode", _descriptor2, this);

          _initializerDefineProperty(this, "logoNode", _descriptor3, this);

          _initializerDefineProperty(this, "winUpToSkeleton", _descriptor4, this);

          this._sceneManager = void 0;
          this._gameManager = void 0;
        }

        start() {
          this.initialize();
          this.playWinUpToSkeletonAnimation();
          this.loadingBar.init();
          this.loadingBar.StartLoading();
        }

        initialize() {
          this._sceneManager = (_crd && Services === void 0 ? (_reportPossibleCrUseOfServices({
            error: Error()
          }), Services) : Services).GetService(_crd && SceneManager === void 0 ? (_reportPossibleCrUseOfSceneManager({
            error: Error()
          }), SceneManager) : SceneManager);

          this._sceneManager.SetCurrentScene(this.node);

          this.RegisterEvents();
        }

        RegisterEvents() {
          this.evtOnLoadingComplete.add(this.loadGameScene.bind(this));
        }

        onLoad() {
          if (!this.loadingBar) {
            console.error('[LoadingScene] loadingBar is null or not assigned in Inspector');
            return;
          }

          this.loadingBar.setEvtOnLoadingBarStartLoading(this.startLoading.bind(this));
        }

        AddEvtOnLoadingComplete(cb) {
          this.evtOnLoadingComplete.add(cb);
        }

        async startLoading() {
          try {
            console.log(`Test Start`);
            console.log(`Starting Loading: ${this.loadingBar.RealProgress}`);

            this._sceneManager.PreLoadScene((_crd && ScenePrefabPath === void 0 ? (_reportPossibleCrUseOfScenePrefabPath({
              error: Error()
            }), ScenePrefabPath) : ScenePrefabPath).GAME_SCENE); // Note: Placeholder


            while (this.loadingBar.RealProgress < 100) {
              const delay = this.randomRange(0.25, 1.0);
              const increment = this.randomRange(3, 12);
              await this.sleep(delay);
              const newProgressValue = Math.min(this.loadingBar.RealProgress + increment, 100); //console.log(`[Loading] Progress: ${newProgressValue}%`);

              this.loadingBar.SetProgress(newProgressValue);
            }

            if (this.evtOnLoadingComplete) {
              this.evtOnLoadingComplete.invoke();
            } //TODO: Add Initialization of WebSocket here
            //logger.log('[Loading] 初始化 ApiManager...');
            //await ApiManager.initialize();
            // // 获取当前所有游戏的列表，根据当前gameid获取当前游戏名称
            // ApiManager.GameApi.getScratchList().then((res) => {
            //     const gameList = PLK.gameData.gameList = res;
            //     const currentGame = gameList.find((item: any) => item.gameId == PLK.gameData.gameId);
            //     // 获取当前游戏的BigAmount和TopAmount
            //     PLK.gameData.initTopAndBigAmount(currentGame.bigAmount, currentGame.topAmount);
            //     // 获取当前游戏的gameType
            //     PLK.gameData.gameName = currentGame.gameType;
            //     // 获取当前游戏的playType
            //     PLK.gameData.currentPlayType = currentGame.playType;
            //     // 获取当前游戏的剩余卡片数量
            //     PLK.gameData.remainingCardCount = currentGame.unusedCount;
            //     // 获取当前游戏的单价
            //     PLK.gameData.cardPrice = currentGame.unitPrice;
            //     // 获取当前游戏的单价
            //     PLK.gameData.unitPrice = currentGame.unitPrice;
            //     // 获取当前游戏的priceList
            //     PLK.gameData.gamePriceList = currentGame.unitPriceList;
            //     // 获取当前游戏的isAutoPlay
            //     PLK.gameData.isAutoPlay = currentGame.autoPlay != null && currentGame.autoPlay != 0;
            // });
            // // 加载游戏场景
            // logger.log('[Loading] 开始加载新手引导:', PLK.userInfo.userInfo['showOnboarding']);
            // if (PLK.userInfo.userInfo['showOnboarding']) {
            //     this.checkAndLoadScene('newPlayerGuide');
            // } else {
            //     this.checkAndLoadScene('game');
            // }

          } catch (err) {
            console.error('[Loading] startLoading failed:', err); //logger.error('[Loading] ApiManager 初始化失败:', err);
            //this.showRetryOption();
          }
        }

        loadGameScene() {
          this._sceneManager.LoadScene((_crd && ScenePrefabPath === void 0 ? (_reportPossibleCrUseOfScenePrefabPath({
            error: Error()
          }), ScenePrefabPath) : ScenePrefabPath).GAME_SCENE);
        }

        playWinUpToSkeletonAnimation() {
          if (!this.winUpToSkeleton) {
            console.error('[LoadingScene] playWinUpToSkeletonAnimation didnt play, winUpToSkeleton is null or not assigned in Inspector');
            return;
          }

          const skeletonNode = this.winUpToSkeleton;
          const skeleton = skeletonNode == null ? void 0 : skeletonNode.getComponent(sp.Skeleton);

          if (skeleton) {
            skeleton.setAnimation(0, 'blazing7s-WinUpTo_animation', true);
          }
        } // NOTE: Remove once Initialization of WebSocket is added


        sleep(seconds) {
          return new Promise(resolve => {
            this.scheduleOnce(() => resolve(), seconds);
          });
        } // NOTE: Remove once Initialization of WebSocket is added


        randomRange(min, max) {
          return Math.random() * (max - min) + min;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "loadingBar", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "maskNode", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "logoNode", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "winUpToSkeleton", [_dec5], {
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
//# sourceMappingURL=4648144d8513977ca708e25c94246bffd79fccb2.js.map