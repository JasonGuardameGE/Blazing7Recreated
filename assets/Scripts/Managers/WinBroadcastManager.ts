import { _decorator, Component, EventHandler, Node } from 'cc';
import { Announcement } from '../Types';
import { PopUpManager, PopUpPrefabPath } from './PopUpManager';
import { Services } from './Services';
import { WinnerBroadcastPopUp } from '../UI/PopUp/WinnerBroadcastPopUp';
import { WsManager } from './WebsocketManager';
import { WsConfig } from './WsConfig';
import SceneManager, { ScenePrefabPath } from './SceneManager';

const { ccclass } = _decorator;

@ccclass('WinBroadcastManager')
export class WinBroadcastManager extends Component {

    private readonly INITIAL_DELAY_SECONDS: number = 5;

    private queuedAnnouncements: Announcement[] = [];

    private _popupManager: PopUpManager | null = null;
    private _sceneManager: SceneManager | null = null;

    private winnerBroadcastPopup: WinnerBroadcastPopUp | null = null;

    private isInitialized: boolean = false;
    private isShowingAnnouncement: boolean = false;
    private isGameSceneReady: boolean = false;

    private isInitialDelayRunning: boolean = false;
    private canShowAnnouncement: boolean = false;
    private hasStartedInitialDelay: boolean = false;

    private readonly boundOnNewAnnouncement = this.onNewAnnouncement.bind(this);

    protected async start(): Promise<void> {
        await this.initialize();

        this.updateGameSceneReadyState();

        if (this.isGameSceneReady) {
            this.startInitialDelay();
        }
    }

    protected onDestroy(): void {
        this.unscheduleAllCallbacks();

        /**
         * If WsManager supports removing listeners,
         * unregister this.boundOnNewAnnouncement here.
         *
         * Example:
         * WsManager.getInstance().offMessage(
         *     WsConfig.GAME.ANNOUNCEMENT,
         *     this.boundOnNewAnnouncement,
         * );
         */
    }

    private async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        this._sceneManager = Services.GetService(SceneManager);
        this._popupManager = Services.GetService(PopUpManager);

        this.registerSceneChangeCallback();

        await this.initializePopup();

        WsManager.getInstance().onMessage(
            WsConfig.GAME.ANNOUNCEMENT,
            this.boundOnNewAnnouncement,
        );

        this.isInitialized = true;
    }

    private registerSceneChangeCallback(): void {
        if (!this._sceneManager) {
            return;
        }

        const sceneChangeHandler = new EventHandler();

        sceneChangeHandler.target = this.node;
        sceneChangeHandler.component = 'WinBroadcastManager';
        sceneChangeHandler.handler = 'allowAnnouncements';

        this._sceneManager.onSceneChangeCallback.push(sceneChangeHandler);
    }

    private async initializePopup(): Promise<void> {
        if (!this._popupManager || this.winnerBroadcastPopup) {
            return;
        }

        const node: Node = await this._popupManager.LoadPopup(
            PopUpPrefabPath.WINNER_ANNOUNCEMENT_POPUP,
            true,
        );

        this.winnerBroadcastPopup = node.getComponent(WinnerBroadcastPopUp);

        if (!this.winnerBroadcastPopup) {
            console.error('[WinBroadcastManager] WinnerBroadcastPopUp component missing.');
            return;
        }

        const announcementComplete = new EventHandler();

        announcementComplete.target = this.node;
        announcementComplete.component = 'WinBroadcastManager';
        announcementComplete.handler = 'AnnouncementComplete';

        this.winnerBroadcastPopup.onAnnouncementCompleteCallbacks.push(announcementComplete);

        this.winnerBroadcastPopup.HideInstant?.();
    }

    private onNewAnnouncement(data: any): void {
        if (!Array.isArray(data)) {
            return;
        }

        for (const announcement of data as Announcement[]) {
            if (!announcement || announcement.announcementType !== 'BIG') {
                continue;
            }

            this.queuedAnnouncements.push(announcement);
        }

        this.checkAnnouncements();
    }

    public AnnouncementComplete(): void {
        this.isShowingAnnouncement = false;
        this.canShowAnnouncement = true;

        /**
         * No interval delay.
         * Show the next queued announcement immediately.
         */
        this.checkAnnouncements();
    }

    public allowAnnouncements(): void {
        this.updateGameSceneReadyState();

        if (!this.isGameSceneReady) {
            this.canShowAnnouncement = false;
            this.hasStartedInitialDelay = false;
            this.isInitialDelayRunning = false;
            this.unschedule(this.finishInitialDelay);
            return;
        }

        /**
         * Start the 5-second delay the moment GAME_SCENE is allowed.
         */
        this.startInitialDelay();
    }

    public checkAnnouncements(): void {
        if (!this.isGameSceneReady) {
            return;
        }

        if (!this.canShowAnnouncement) {
            return;
        }

        if (this.isShowingAnnouncement) {
            return;
        }

        if (this.queuedAnnouncements.length <= 0) {
            return;
        }

        this.ShowAnnouncement();
    }

    private ShowAnnouncement(): void {
        if (!this.winnerBroadcastPopup) {
            return;
        }

        if (!this.isGameSceneReady) {
            return;
        }

        const announcement = this.queuedAnnouncements.shift();

        if (!announcement) {
            return;
        }

        this.isShowingAnnouncement = true;
        this.canShowAnnouncement = false;

        this.winnerBroadcastPopup.ShowPopUp(announcement);
    }

    private updateGameSceneReadyState(): void {
        this.isGameSceneReady =
            this._sceneManager?.CurrentScene === ScenePrefabPath.GAME_SCENE;
    }

    private startInitialDelay(): void {
        if (this.hasStartedInitialDelay) {
            return;
        }

        if (this.isInitialDelayRunning) {
            return;
        }

        this.hasStartedInitialDelay = true;
        this.isInitialDelayRunning = true;
        this.canShowAnnouncement = false;

        this.scheduleOnce(this.finishInitialDelay, this.INITIAL_DELAY_SECONDS);
    }

    private finishInitialDelay = (): void => {
        this.isInitialDelayRunning = false;
        this.canShowAnnouncement = true;

        this.checkAnnouncements();
    };
}