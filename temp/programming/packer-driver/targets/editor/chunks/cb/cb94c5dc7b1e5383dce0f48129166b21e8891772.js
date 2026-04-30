System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7", "__unresolved_8", "__unresolved_9", "__unresolved_10", "__unresolved_11", "__unresolved_12", "__unresolved_13", "__unresolved_14", "__unresolved_15", "__unresolved_16"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, EventDispatcher, GameData, UIManager, Managers, GameUserInfo, logger, MessageFlag, Game, game, resources, WsManager, Sensor, DeviceUtils, TicketData, ActionQueue, WakeLock, ScratchSound, GameApi, AudioManager, PLK, _crd;

  function _reportPossibleCrUseOfEventDispatcher(extras) {
    _reporterNs.report("EventDispatcher", "./utils/EventDispatcher", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameData(extras) {
    _reporterNs.report("GameData", "./data/GameData", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUIManager(extras) {
    _reporterNs.report("UIManager", "./manager/UIManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfManagers(extras) {
    _reporterNs.report("Managers", "./Managers", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameUserInfo(extras) {
    _reporterNs.report("GameUserInfo", "./data/GameUserInfo", _context.meta, extras);
  }

  function _reportPossibleCrUseOflogger(extras) {
    _reporterNs.report("logger", "./utils/logger", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMessageFlag(extras) {
    _reporterNs.report("MessageFlag", "./manager/MessageFlag", _context.meta, extras);
  }

  function _reportPossibleCrUseOfWsManager(extras) {
    _reporterNs.report("WsManager", "./manager/Websocketmanager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSensor(extras) {
    _reporterNs.report("Sensor", "./utils/sensore", _context.meta, extras);
  }

  function _reportPossibleCrUseOfDeviceUtils(extras) {
    _reporterNs.report("DeviceUtils", "./utils/DeviceUtils", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTicketData(extras) {
    _reporterNs.report("TicketData", "./data/TicketData", _context.meta, extras);
  }

  function _reportPossibleCrUseOfActionQueue(extras) {
    _reporterNs.report("ActionQueue", "./manager/ActionQueue", _context.meta, extras);
  }

  function _reportPossibleCrUseOfWakeLock(extras) {
    _reporterNs.report("WakeLock", "./utils/WakeLock", _context.meta, extras);
  }

  function _reportPossibleCrUseOfScratchSound(extras) {
    _reporterNs.report("ScratchSound", "./scratch/ScratchSound", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAudioManager(extras) {
    _reporterNs.report("AudioManager", "./manager/AudioManager", _context.meta, extras);
  }

  _export("default", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Game = _cc.Game;
      game = _cc.game;
      resources = _cc.resources;
    }, function (_unresolved_2) {
      EventDispatcher = _unresolved_2.default;
    }, function (_unresolved_3) {
      GameData = _unresolved_3.GameData;
    }, function (_unresolved_4) {
      UIManager = _unresolved_4.default;
    }, function (_unresolved_5) {
      Managers = _unresolved_5.Managers;
    }, function (_unresolved_6) {
      GameUserInfo = _unresolved_6.GameUserInfo;
    }, function (_unresolved_7) {
      logger = _unresolved_7.default;
    }, function (_unresolved_8) {
      MessageFlag = _unresolved_8.MessageFlag;
    }, function (_unresolved_9) {
      WsManager = _unresolved_9.WsManager;
    }, function (_unresolved_10) {
      Sensor = _unresolved_10.default;
    }, function (_unresolved_11) {
      DeviceUtils = _unresolved_11.DeviceUtils;
    }, function (_unresolved_12) {
      TicketData = _unresolved_12.default;
    }, function (_unresolved_13) {
      ActionQueue = _unresolved_13.ActionQueue;
    }, function (_unresolved_14) {
      WakeLock = _unresolved_14.default;
    }, function (_unresolved_15) {
      ScratchSound = _unresolved_15.ScratchSound;
    }, function (_unresolved_16) {
      GameApi = _unresolved_16;
    }, function (_unresolved_17) {
      AudioManager = _unresolved_17.AudioManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "fd1fa9hMcVM4IBhgrgbk57C", "PLK", undefined); // assets/script/PLK.ts


      __checkObsolete__(['director', 'Game', 'game', 'resources', 'Sprite', 'SpriteFrame']);

      _export("default", PLK = class PLK {
        constructor() {
          this.delayTimer = null;
        }

        static init() {
          PLK.gameData.initConfig();
          PLK.gameData.getUrlParams();
          PLK.onVisibilityChange();
          PLK.sensor.init(); // 将 PLK 暴露到全局，以便 menu-bundle 可以访问

          if (typeof window !== 'undefined') {
            window.PLK = PLK;
            window.GameApi = GameApi;
            window.AudioManager = _crd && AudioManager === void 0 ? (_reportPossibleCrUseOfAudioManager({
              error: Error()
            }), AudioManager) : AudioManager;
          }

          if (typeof globalThis !== 'undefined') {
            globalThis.PLK = PLK;
            globalThis.GameApi = GameApi;
            globalThis.AudioManager = _crd && AudioManager === void 0 ? (_reportPossibleCrUseOfAudioManager({
              error: Error()
            }), AudioManager) : AudioManager;
          }
        } // 进入游戏场景后进行预加载的节点
        // 优先预加载 WinPopUp，其它弹窗按较低优先级分批静默后台预加载


        static preloadPopUp() {
          // 最高优先级：WinPopUp
          const highPriorityPath = "prefab/WinPopUp";
          PLK.ui.preloadScene(highPriorityPath, progress => {// logger.log('WinPopUp 预加载进度', progress);
          }); // 低优先级：其他二级弹窗，分批静默后台预加载，避免集中卡顿

          const lowPriorityList = ["prefab/ExitPopup", "prefab/Trajectory", "menu-bundle:resources/prefab/BundleMenu"];
          const baseDelay = 800; // 毫秒，首个低优先级弹窗的延迟时间

          lowPriorityList.forEach((path, index) => {
            const delay = baseDelay * (index + 1);
            setTimeout(() => {
              PLK.ui.preloadScene(path, progress => {// logger.log('后台预加载进度', path, progress);
              });
            }, delay);
          });
        }

        static exitGame() {
          // 根据params的callbackUrl退出游戏
          PLK.sensor.gameLeave();
          PLK.gameData.isExitGame = true;
          (_crd && logger === void 0 ? (_reportPossibleCrUseOflogger({
            error: Error()
          }), logger) : logger).log('执行退出游戏');
          PLK.event.emit((_crd && MessageFlag === void 0 ? (_reportPossibleCrUseOfMessageFlag({
            error: Error()
          }), MessageFlag) : MessageFlag).EXIT_GAME);
          const callbackUrl = PLK.gameData.urlParams.callbackUrl;

          if (callbackUrl) {
            window.location.href = callbackUrl;
            (_crd && logger === void 0 ? (_reportPossibleCrUseOflogger({
              error: Error()
            }), logger) : logger).log('退出游戏', callbackUrl);
          }
        }

        static freeze() {
          // 暂停游戏
          game.pause();
          (_crd && logger === void 0 ? (_reportPossibleCrUseOflogger({
            error: Error()
          }), logger) : logger).log('整个游戏已冻结');
        }

        static unfreeze() {
          // 恢复游戏
          game.resume();
          (_crd && logger === void 0 ? (_reportPossibleCrUseOflogger({
            error: Error()
          }), logger) : logger).log('整个游戏已解冻');
        }

        static onVisibilityChange() {
          game.on(Game.EVENT_HIDE, () => {
            (_crd && logger === void 0 ? (_reportPossibleCrUseOflogger({
              error: Error()
            }), logger) : logger).log('页面隐藏');
          });
          game.on(Game.EVENT_SHOW, () => {
            (_crd && logger === void 0 ? (_reportPossibleCrUseOflogger({
              error: Error()
            }), logger) : logger).log('页面显示'); // 检查ws连接状态，如果被踢下线，则不进行重连，否则重连

            if (!PLK.gameData.isKickOff && !(_crd && WsManager === void 0 ? (_reportPossibleCrUseOfWsManager({
              error: Error()
            }), WsManager) : WsManager).getInstance().isConnected()) {
              // 执行ws重连
              (_crd && WsManager === void 0 ? (_reportPossibleCrUseOfWsManager({
                error: Error()
              }), WsManager) : WsManager).getInstance().reconnect();
            }
          });
        } // 根据当前设备类型加载背景图，texture/h5 或 texture/pc


        static loadBackground(sprite) {
          const deviceType = (_crd && DeviceUtils === void 0 ? (_reportPossibleCrUseOfDeviceUtils({
            error: Error()
          }), DeviceUtils) : DeviceUtils).isMobile() ? 'h5' : 'pc';

          if (deviceType === 'h5') {
            resources.load('texture/h5', (err, texture) => {
              if (err) return;
              sprite.spriteFrame = texture;
            });
          } else {
            resources.load('texture/pc', (err, texture) => {
              if (err) return;
              sprite.spriteFrame = texture;
            });
          }
        }

        static preloadUI() {
          // 循环进行预加载
          const uiList = ["prefab/GameRecords", "prefab/CardDetail", "prefab/OtherGames", "prefab/HonorBoard"];
          uiList.forEach(item => {
            PLK.ui.preloadScene(item, progress => {// logger.log('预加载进度', item, progress)
            });
          });
        } // 跳转新游戏


        static switchGame() {
          const gameId = PLK.gameData.turnToGameId;
          let path = new URLSearchParams(window.location.search);
          path.set('gameId', gameId); // 跳转规则是把playtype正则去掉特使符号，然后转为小写

          const _gamePath = PLK.gameData.turnToPlayType.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

          let newGamePath = `${PLK.gameData.config.otherGamePath}/${_gamePath}?${path.toString()}`;
          (_crd && logger === void 0 ? (_reportPossibleCrUseOflogger({
            error: Error()
          }), logger) : logger).log('跳转新游戏地址', newGamePath); // 跳转新游戏

          window.location.href = `${PLK.gameData.config.otherGamePath}/${_gamePath}?${path.toString()}`;
        }

      });

      PLK.event = new (_crd && EventDispatcher === void 0 ? (_reportPossibleCrUseOfEventDispatcher({
        error: Error()
      }), EventDispatcher) : EventDispatcher)();
      PLK.gameData = new (_crd && GameData === void 0 ? (_reportPossibleCrUseOfGameData({
        error: Error()
      }), GameData) : GameData)();
      PLK.res = (_crd && Managers === void 0 ? (_reportPossibleCrUseOfManagers({
        error: Error()
      }), Managers) : Managers).res;
      PLK.ui = new (_crd && UIManager === void 0 ? (_reportPossibleCrUseOfUIManager({
        error: Error()
      }), UIManager) : UIManager)();
      PLK.userInfo = new (_crd && GameUserInfo === void 0 ? (_reportPossibleCrUseOfGameUserInfo({
        error: Error()
      }), GameUserInfo) : GameUserInfo)();
      PLK.sensor = new (_crd && Sensor === void 0 ? (_reportPossibleCrUseOfSensor({
        error: Error()
      }), Sensor) : Sensor)();
      PLK.ticketData = new (_crd && TicketData === void 0 ? (_reportPossibleCrUseOfTicketData({
        error: Error()
      }), TicketData) : TicketData)();
      PLK.actionQueue = new (_crd && ActionQueue === void 0 ? (_reportPossibleCrUseOfActionQueue({
        error: Error()
      }), ActionQueue) : ActionQueue)();
      PLK.wakeLock = new (_crd && WakeLock === void 0 ? (_reportPossibleCrUseOfWakeLock({
        error: Error()
      }), WakeLock) : WakeLock)();
      PLK.scratchSound = new (_crd && ScratchSound === void 0 ? (_reportPossibleCrUseOfScratchSound({
        error: Error()
      }), ScratchSound) : ScratchSound)();

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=cb94c5dc7b1e5383dce0f48129166b21e8891772.js.map