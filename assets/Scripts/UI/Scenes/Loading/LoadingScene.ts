import {
    _decorator,
    Component,
    ProgressBar,
    Sprite,
    Label,
    Node,
    sp,
    UITransform
} from 'cc';

import { LoadingBar } from './LoadingBar';

const { ccclass, property } = _decorator;

@ccclass('Loading')
export class LoadingScene extends Component {

    @property(LoadingBar)
    loadingBar: LoadingBar = null;

    @property(Node)
    maskNode: Node = null;

    @property(Node)
    logoNode: Node = null;

    @property(Node)
    winUpToSkeleton: Node = null;

    start() {
        this.playWinUpToSkeletonAnimation();
        this.loadingBar.init();
        this.loadingBar.StartLoading();
    }

    protected onLoad() : void{
        if(!this.loadingBar){
            console.error('[LoadingScene] loadingBar is null or not assigned in Inspector');
            return;
        }

        this.loadingBar.setEvtOnLoadingBarStartLoading(this.startLoading);
    }

    update(deltaTime: number) {
        
    }

    private async startLoading(): Promise<void> {
        try {
            console.log("[Loading]");
            // Note: Placeholder
            while (this.loadingBar.RealProgress < 100) {
                const delay = this.randomRange(0.25, 1.0);
                const increment = this.randomRange(3, 12);
    
                await this.sleep(delay);
    
                const newProgressValue = Math.min(this.loadingBar.RealProgress + increment, 100);
                    
                this.loadingBar.SetProgress(newProgressValue);
            }

            //TODO: Add Initialization of WebSocket here
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
            //logger.error('[Loading] ApiManager 初始化失败:', err);
            //this.showRetryOption();
        }
    }

    private playWinUpToSkeletonAnimation(): void {
        if (!this.winUpToSkeleton) {
            console.error('[LoadingScene] playWinUpToSkeletonAnimation didnt play, winUpToSkeleton is null or not assigned in Inspector');
            return;
        }

        const skeletonNode = this.winUpToSkeleton;

        const skeleton = skeletonNode?.getComponent(sp.Skeleton);
        if (skeleton) {
            skeleton.setAnimation(0, 'blazing7s-WinUpTo_animation', true);
        }
    }

    // NOTE: Remove once Initialization of WebSocket is added
    private sleep(seconds: number): Promise<void> {
        return new Promise(resolve => {
            this.scheduleOnce(() => resolve(), seconds);
        });
    }
    
    // NOTE: Remove once Initialization of WebSocket is added
    private randomRange(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
}


