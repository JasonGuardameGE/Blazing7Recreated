import {
    _decorator,
    Component,
    Node,
    sp,
} from 'cc';

import { LoadingBar } from './LoadingBar';
import { Services } from '../../../Managers/Services';
import SceneManager, { ScenePrefabPath } from '../../../Managers/SceneManager';
import { GameManager } from '../../../Managers/GameManager';
import { BaseEventListener } from '../../../EventListener/BaseEventListener';
import logger from '../../../utils/logger';

const { ccclass, property } = _decorator;

@ccclass('Loading')
export class LoadingScene extends Component {

    private evtOnLoadingComplete = new BaseEventListener<() => void>();

    @property(LoadingBar)
    loadingBar: LoadingBar = null;

    @property(Node)
    maskNode: Node = null;

    @property(Node)
    logoNode: Node = null;

    @property(Node)
    winUpToSkeleton: Node = null;

    private _sceneManager: SceneManager;
    private _gameManager: GameManager;

    protected onLoad(): void {
        if (!this.loadingBar) {
            console.error('[LoadingScene] loadingBar is null or not assigned in Inspector');
            return;
        }

        this.loadingBar.setEvtOnLoadingBarStartLoading(this.startLoading.bind(this));
    }

    protected start(): void {
        this.initialize();
        this.playWinUpToSkeletonAnimation();

        this.loadingBar.init();
        this.loadingBar.StartLoading();
    }

    private initialize(): void {
        this._gameManager = Services.GetService(GameManager);
        this._sceneManager = Services.GetService(SceneManager);

        this._sceneManager.SetCurrentScene(this.node);

        this.RegisterEvents();
    }

    private RegisterEvents(): void {
        this.evtOnLoadingComplete.add(this.loadGameScene.bind(this));
    }

    public AddEvtOnLoadingComplete(cb: () => void): void {
        this.evtOnLoadingComplete.add(cb);
    }

    private async startLoading(): Promise<void> {
        try {
            await this.loadingBar.SetProgressSmooth(10, 0.35);

            let progressTween = this.loadingBar.SetProgressSmooth(25, 0.16);
            await this._sceneManager.PreLoadScene(ScenePrefabPath.GAME_SCENE);
            await progressTween;

            progressTween = this.loadingBar.SetProgressSmooth(50, 0.26);
            await this._sceneManager.PreLoadScene(ScenePrefabPath.NEW_PLAYER_SCENE);
            await progressTween;

            progressTween = this.loadingBar.SetProgressSmooth(75, 0.36);
            await this._gameManager.LoadGameSetup();
            await progressTween;

            if (this._gameManager.SetupLoaded) {
                await this.loadingBar.SetProgressSmooth(100, 0.35);

                if (this.evtOnLoadingComplete) {
                    this.evtOnLoadingComplete.invoke();
                }
            }

        } catch (err) {
            logger.error(`[Loading] Error when Loading game: ${err}`);
        }
    }

    private loadGameScene(): void {
        if (this._gameManager.GameUserInfo.userInfo['showOnboarding']) {
            this._sceneManager.LoadScene(ScenePrefabPath.NEW_PLAYER_SCENE);
        } else {
            this._sceneManager.LoadScene(ScenePrefabPath.GAME_SCENE);
        }
    }

    private playWinUpToSkeletonAnimation(): void {
        if (!this.winUpToSkeleton) {
            console.error('[LoadingScene] playWinUpToSkeletonAnimation didnt play, winUpToSkeleton is null or not assigned in Inspector');
            return;
        }

        const skeleton = this.winUpToSkeleton.getComponent(sp.Skeleton);

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