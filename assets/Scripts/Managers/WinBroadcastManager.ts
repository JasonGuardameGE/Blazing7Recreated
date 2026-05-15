import { _decorator, Component, EventHandler, Node, tween } from 'cc';
import { Announcement } from '../Types';
import { PopUpManager, PopUpPrefabPath } from './PopUpManager';
import { Services } from './Services';
import { WinnerBroadcastPopUp } from '../UI/PopUp/WinnerBroadcastPopUp';
import { WsManager } from './WebsocketManager';
import { WsConfig } from './WsConfig';
import SceneManager, { ScenePrefabPath } from './SceneManager';

const { ccclass, property } = _decorator;

@ccclass('WinBroadcastManager')
export class WinBroadcastManager extends Component {
   
    private queuedAnnouncements: Announcement[] = [];
    private _popupManager: PopUpManager;

    private winnerBroadcastPopup: WinnerBroadcastPopUp;
    private isShowingAnnouncement: boolean = false;

    private delayShow: number = 15;
    private delayTweenValue = { value: 5 };

    private _sceneManager: SceneManager;
    private isGameSceneReady: boolean = false;

    protected async start(): Promise<void> {
        this._sceneManager = Services.GetService(SceneManager);
        if(this._sceneManager)
        {
            const sceneChangeHandler = new EventHandler();
            sceneChangeHandler.target = this.node;
            sceneChangeHandler.component = 'WinBroadcastManager';
            sceneChangeHandler.handler = 'allowAnnouncements';

            this._sceneManager.onSceneChangeCallback.push(sceneChangeHandler);

            console.log(`[WinBroadcastManager] Adding onSceneCallback: ${this._sceneManager.onSceneChangeCallback.length}`);
        }

        await this.initialize();
        this.startDelayCountdown();
    }

    private async initialize(): Promise<void> {
        if (!this._popupManager) {
            this._popupManager = Services.GetService(PopUpManager);
        }

        if (!this.winnerBroadcastPopup) {
            const node: Node = await this._popupManager.LoadPopup(
                PopUpPrefabPath.WINNER_ANNOUNCEMENT_POPUP,
                true
            );

            this.winnerBroadcastPopup = node.getComponent(WinnerBroadcastPopUp);

            const AnnouncementComplete = new EventHandler();
            AnnouncementComplete.target = this.node;
            AnnouncementComplete.component = 'WinBroadcastManager';
            AnnouncementComplete.handler = 'AnnouncementComplete';

            this.winnerBroadcastPopup.onAnnouncementCompleteCallbacks.push(AnnouncementComplete);
        }

        // Register to WebsocketManager.
        WsManager.getInstance().onMessage(
            WsConfig.GAME.ANNOUNCEMENT,
            this.onNewAnnouncement.bind(this),
        );
    }

    private async onNewAnnouncement(data: any): Promise<void> {
        data.forEach((announcement: Announcement) => {
            if (announcement.announcementType === 'BIG') {
                this.queuedAnnouncements.push(announcement);
            }
        });

        this.checkAnnouncements();
    }

    public AnnouncementComplete(){
        this.isShowingAnnouncement = false;
        this.checkAnnouncements();
    }
    
    public async checkAnnouncements(): Promise<void> {
        if (this.isShowingAnnouncement || this.delayShow > 0) {
            return;
        }
    
        if (this.queuedAnnouncements.length > 0) {
            await this.ShowAnnouncement();
        }
    }

    public allowAnnouncements(): void {
        this.isGameSceneReady = this._sceneManager?.CurrentScene == ScenePrefabPath.GAME_SCENE;
    
        console.log(`[WinBroadcastManager] AllowAnnouncement Called: ${this.isGameSceneReady}`);
    
        if (!this.isGameSceneReady) {
            return;
        }
    
        this.startDelayCountdown();
    }

    private async ShowAnnouncement(): Promise<void> {
        if (!this.winnerBroadcastPopup) {
            return;
        }

        if(!this.isGameSceneReady){
            return;
        }

        const announcement = this.queuedAnnouncements.shift();

        if (!announcement) {
            return;
        }

        this.isShowingAnnouncement = true;

        this.winnerBroadcastPopup.ShowPopUp(announcement);
    }

    public onAnnouncementCompleted(): void {
        this.isShowingAnnouncement = false;
        this.checkAnnouncements();
    }

    private startDelayCountdown(): void {
        this.delayTweenValue.value = this.delayShow;
    
        tween(this.delayTweenValue)
            .to(this.delayShow, { value: 0 }, {
                onUpdate: () => {
                    this.delayShow = this.delayTweenValue.value;
                }
            })
            .call(() => {
                this.delayShow = 0;
                this.checkAnnouncements();
            })
            .start();
    }
}