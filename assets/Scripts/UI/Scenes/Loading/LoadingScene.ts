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
import ApiManager from '../../../Api/ApiManager';
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

    private _sceneManager : SceneManager;
    private _gameManager : GameManager;

    start() {
        this.initialize();
        this.playWinUpToSkeletonAnimation();
        this.loadingBar.init();
        this.loadingBar.StartLoading();
    }

    private initialize() : void{
        this._gameManager = Services.GetService(GameManager);
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
        // console.log(`Starting Loading: ${this.loadingBar.RealProgress}`);

        try{
            this.loadingBar.SetProgress(10);
            await this._sceneManager.PreLoadScene(ScenePrefabPath.GAME_SCENE);                
            this.loadingBar.SetProgress(25);
            // TODO: IF GAMEDATA SKIPS NEWPLAYER GUIDE -- SKIP PRELOADING GUIDE
            await this._sceneManager.PreLoadScene(ScenePrefabPath.NEW_PLAYER_SCENE);
            this.loadingBar.SetProgress(50);
            
            await this._gameManager.LoadGameSetup();
            if(this._gameManager.SetupLoaded){
                this.loadingBar.SetProgress(100);
                if(this.evtOnLoadingComplete){
                    this.evtOnLoadingComplete.invoke();
                }        
            }
        }catch(err){
            logger.error(`[Loading] Error when Loading game: ${err}`);
        }
    }

    private loadGameScene(){
        if(this._gameManager.GameUserInfo.userInfo['showOnboarding']){
            this._sceneManager.LoadScene(ScenePrefabPath.NEW_PLAYER_SCENE);
        }else{
            this._sceneManager.LoadScene(ScenePrefabPath.GAME_SCENE);
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


