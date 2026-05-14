import { _decorator, Component, EventHandler, Node } from 'cc';
import { Announcement } from '../Types';
import { PopUpManager, PopUpPrefabPath } from './PopUpManager';
import { Services } from './Services';
import { WinnerBroadcastPopUp } from '../UI/PopUp/WinnerBroadcastPopUp';
import { WsManager } from './WebsocketManager';
import { WsConfig } from './WsConfig';

const { ccclass, property } = _decorator;

@ccclass('WinBroadcastManager')
export class WinBroadcastManager extends Component {
   
    private queuedAnnouncements: Announcement[] = [];
    private _popupManager: PopUpManager;

    private winnerBroadcastPopup: WinnerBroadcastPopUp;
    private isShowingAnnouncement: boolean = false;

    protected async start(): Promise<void> {
        await this.initialize();
    }

    private async initialize(): Promise<void> {
        if (!this._popupManager) {
            this._popupManager = Services.GetService(PopUpManager);
        }

        if (!this.winnerBroadcastPopup) {
            const node: Node = await this._popupManager.LoadPopup(
                PopUpPrefabPath.WINNER_ANNOUNCEMENT_POPUP
            );

            this.winnerBroadcastPopup = node.getComponent(WinnerBroadcastPopUp);

            const callback = new EventHandler();
            callback.target = this.node;
            callback.component = 'WinBroadcastManager';
            callback.handler = 'checkAnnouncements';

            this.winnerBroadcastPopup.onAnnouncementCompleteCallbacks.push(callback);
        }

        // Register to WebsocketManager.
        WsManager.getInstance().onMessage(
            WsConfig.GAME.ANNOUNCEMENT,
            this.onNewAnnouncement.bind(this),
        );
    }

    private async onNewAnnouncement(data: any): Promise<void> {
        await this.initialize();

        data.forEach((announcement: Announcement) => {
            if (announcement.announcementType === 'BIG') {
                this.queuedAnnouncements.push(announcement);
            }
        });

        this.checkAnnouncements();
    }

    public async checkAnnouncements(): Promise<void> {
        if (this.isShowingAnnouncement) {
            return;
        }

        if (this.queuedAnnouncements.length > 0) {
            await this.ShowAnnouncement();
        }
    }

    private async ShowAnnouncement(): Promise<void> {
        await this.initialize();

        if (!this.winnerBroadcastPopup) {
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
}