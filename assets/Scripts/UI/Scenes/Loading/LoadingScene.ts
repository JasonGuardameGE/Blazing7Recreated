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
import { Services } from '../../../Managers/Services';
import SceneManager, { ScenePrefabPath } from '../../../Managers/SceneManager';
import { GameManager } from '../../../Managers/GameManager';
import { BaseEventListener } from '../../../EventListener/BaseEventListener';
import { PopUpManager } from '../../../Managers/PopUpManager';

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

    private _sceneManager : SceneManager;
    private _gameManager : GameManager;

    start() {
        this.initialize();
        this.playWinUpToSkeletonAnimation();
        this.loadingBar.init();
        this.loadingBar.StartLoading();
    }

    private initialize() : void{
        this._sceneManager = Services.GetService(SceneManager);
        this._sceneManager.SetCurrentScene(this.node);

        this.RegisterEvents();
    }

    private RegisterEvents(){
        this.evtOnLoadingComplete.add(this.loadGameScene.bind(this));
    }

    protected onLoad() : void{
        if(!this.loadingBar){
            console.error('[LoadingScene] loadingBar is null or not assigned in Inspector');
            return;
        }

        this.loadingBar.setEvtOnLoadingBarStartLoading(this.startLoading.bind(this));
    }

    public AddEvtOnLoadingComplete(cb: () => void){
        this.evtOnLoadingComplete.add(cb);
    }

    private async startLoading(): Promise<void> {
        try {
            console.log(`Test Start`);
            console.log(`Starting Loading: ${this.loadingBar.RealProgress}`);

            this._sceneManager.PreLoadScene(ScenePrefabPath.GAME_SCENE);

            // TODO: IF GAMEDATA SKIPS NEWPLAYER GUIDE -- SKIP PRELOADING GUIDE
            this._sceneManager.PreLoadScene(ScenePrefabPath.NEW_PLAYER_SCENE);


            // TODO: ADD LOADING PROGRESS EVERYTIME A SCENE IS PRE-LOADED.

            // Note: Placeholder
            while (this.loadingBar.RealProgress < 100) {
                const delay = this.randomRange(0.25, 1.0);
                const increment = this.randomRange(3, 12);
                await this.sleep(delay);
    
                const newProgressValue = Math.min(this.loadingBar.RealProgress + increment, 100);
                //console.log(`[Loading] Progress: ${newProgressValue}%`);

                this.loadingBar.SetProgress(newProgressValue);
            }


            if(this.evtOnLoadingComplete){
                this.evtOnLoadingComplete.invoke();
            }
        } catch (err) {
            console.error('[Loading] startLoading failed:', err);
        }
    }

    private loadGameScene(){
        //TODO: Check on GameData if player is a new Player or nah
        this._sceneManager.LoadScene(ScenePrefabPath.NEW_PLAYER_SCENE);
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


