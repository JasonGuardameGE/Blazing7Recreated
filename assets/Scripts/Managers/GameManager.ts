import {
    _decorator,
    CCInteger,
    Component,
    EventHandler,
} from 'cc';

import { Services } from './Services';
import SceneManager from './SceneManager';
import ResourceManager from './ResourceManager';
import { AudioManager } from './AudioManager';
import { UIRoot } from '../UI/UIRoot';
import { GameData } from '../Data/GameData';
import TicketData from '../Data/TicketData';
import { PopUpManager } from './PopUpManager';
import { ScratchCard } from '../Card/ScratchCard';
import logger from '../utils/logger';
import ApiManager from '../Api/ApiManager';
import { GameUserInfo } from '../Data/GameUserInfo';
import { WinBroadcastManager } from './WinBroadcastManager';
import { WsManager } from './WebsocketManager';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property(UIRoot)
    private uiRoot: UIRoot | null = null;

    @property(AudioManager)
    private audioManager: AudioManager | null = null;

    @property(WinBroadcastManager)
    private winBroadcastManager: WinBroadcastManager | null = null;

    @property(PopUpManager)
    private popupManager: PopUpManager | null = null;

    @property(CCInteger)
    public forcedWinType: number = 0;

    public updatePlayerBalanceCallbacks: EventHandler[] = [];

    private gameData: GameData | null = null;
    private gameUserInfo: GameUserInfo = new GameUserInfo();

    private sceneManager: SceneManager | null = null;
    private resourceManager: ResourceManager | null = null;

    private scratchCard: ScratchCard | null = null;

    private setupLoaded: boolean = false;
    private isLoadingSetup: boolean = false;
    private isPurchasingCard: boolean = false;
    private isSettlingCard: boolean = false;

    public get GameData(): GameData {
        return this.gameData;
    }

    public get GameUserInfo(): GameUserInfo {
        return this.gameUserInfo;
    }

    public get ScratchCard(): ScratchCard {
        return this.scratchCard;
    }

    public get SetupLoaded(): boolean {
        return this.setupLoaded;
    }

    protected onLoad(): void {
        this.initializeGameData();
        this.initializeScratchCard();

        this.registerServices();
        this.initializeServices();
    }

    public async LoadGameSetup(): Promise<void> {
        if (this.isLoadingSetup) {
            return;
        }

        this.isLoadingSetup = true;
        this.setupLoaded = false;

        try {
            logger.log('[GameManager] Loading API Manager...');

            await ApiManager.initialize();

            await this.loadScratchGameConfig();

            if (this.uiRoot) {
                this.gameData.DeviceType = this.uiRoot.DetectedDeviceResolution;
                this.uiRoot.onResize();
            }

            WsManager.getInstance().init();

            await this.scratchCard.RequestRemainingCards();

            this.setupLoaded = true;
        } catch (error) {
            logger.error('[GameManager] Error when loading game setup:', error);
        } finally {
            this.isLoadingSetup = false;
        }
    }

    public UpdateCardPrice(newUnitPrice: number): void {
        if (!this.gameData) {
            return;
        }

        this.gameData.unitPrice = newUnitPrice;
        this.gameData.cardPrice = newUnitPrice;
    }

    public async PurchaseCard(): Promise<void> {
        if (this.isPurchasingCard || !this.scratchCard) {
            return;
        }

        this.isPurchasingCard = true;

        try {
            await this.scratchCard.PurchaseCard();
            this.emitPlayerBalanceUpdate();
        } catch (error) {
            logger.error('[GameManager] Error when purchasing card:', error);
        } finally {
            this.isPurchasingCard = false;
        }
    }

    public async SettleCard(): Promise<void> {
        if (this.isSettlingCard || !this.scratchCard) {
            return;
        }

        this.isSettlingCard = true;

        try {
            await this.scratchCard.SettleCard();
            this.emitPlayerBalanceUpdate();
        } catch (error) {
            logger.error('[GameManager] Error when settling card:', error);
        } finally {
            this.isSettlingCard = false;
        }
    }

    private initializeGameData(): void {
        this.gameData = new GameData();
        this.gameData.TicketData = new TicketData();
        this.gameData.initConfig();
    }

    private initializeScratchCard(): void {
        this.scratchCard = new ScratchCard();
        this.scratchCard.Init(this);
    }

    private registerServices(): void {
        Services.Register(SceneManager, new SceneManager());
        Services.Register(ResourceManager, new ResourceManager());

        Services.Register(GameManager, this);

        if (this.popupManager) {
            Services.Register(PopUpManager, this.popupManager);
        }

        if (this.winBroadcastManager) {
            Services.Register(WinBroadcastManager, this.winBroadcastManager);
        }

        if (this.audioManager) {
            Services.Register(AudioManager, this.audioManager);
        }
    }

    private initializeServices(): void {
        this.sceneManager = Services.GetService(SceneManager);
        this.resourceManager = Services.GetService(ResourceManager);
        this.popupManager = Services.GetService(PopUpManager);
        this.audioManager = Services.GetService(AudioManager);
        this.winBroadcastManager = Services.GetService(WinBroadcastManager);

        if (this.uiRoot) {
            this.sceneManager?.Init(this.uiRoot);
            this.popupManager?.Init(this.uiRoot);
        }

        this.resourceManager?.Init();
        this.audioManager?.Init();
    }

    private async loadScratchGameConfig(): Promise<void> {
        if (!this.gameData) {
            return;
        }

        const gameList = await ApiManager.GameApi.getScratchList();
        const currentGame = gameList.find((item: any) => item.gameId === this.gameData.gameId);

        if (!currentGame) {
            logger.error(`[GameManager] Game config not found. gameId: ${this.gameData.gameId}`);
            return;
        }

        this.gameData.gameList = gameList;

        this.gameData.initTopAndBigAmount(
            currentGame.bigAmount,
            currentGame.topAmount,
        );

        this.gameData.gameName = currentGame.gameType;
        this.gameData.remainingCardCount = currentGame.unusedCount;
        this.gameData.cardPrice = currentGame.unitPrice;
        this.gameData.unitPrice = currentGame.unitPrice;
        this.gameData.gamePriceList = currentGame.unitPriceList;
        this.gameData.isAutoPlay = currentGame.autoPlay != null && currentGame.autoPlay !== 0;
    }

    private emitPlayerBalanceUpdate(): void {
        if (this.updatePlayerBalanceCallbacks.length === 0) {
            return;
        }

        EventHandler.emitEvents(this.updatePlayerBalanceCallbacks);
    }
}