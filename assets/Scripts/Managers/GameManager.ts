import { _decorator, Component } from 'cc';
import { Services } from './Services';
import SceneManager from './SceneManager';
import ResourceManager from './ResourceManager';
import { AudioManager } from './AudioManager';
import { UIRoot } from '../UI/UIRoot';
import { GameData } from '../Data/GameData';
import TicketData from '../Data/TicketData';
import { PopUpManager } from './PopUpManager';
import { mockBuyCard } from '../Api/GameApi';

const { ccclass, property } = _decorator;

type CardNumberData = Array<{ value: number; win: number }>;

@ccclass('GameManager')
export class GameManager extends Component {

    /**
     * Called after a card is purchased and ticket card numbers are ready.
     */
    public onPurchaseUpdateCardVisualCallbacks: Array<(numbers: CardNumberData) => void> = [];

    private gameData: GameData = null;

    get CurrentTicketData() {
        return this.gameData.currentTicketData;
    }

    @property(UIRoot)
    uiRoot: UIRoot = null;

    @property(AudioManager)
    private audioManager: AudioManager = null;

    private sceneManager: SceneManager = null;
    private popupManager: PopUpManager = null;
    private resourceManager: ResourceManager = null;

    protected onLoad(): void {
        // TODO: Load from server the player's current Game Data
        this.gameData = new GameData();

        this.registerServices();
        this.initializeServices();
    }

    private registerServices(): void {
        Services.Register(SceneManager, new SceneManager());
        Services.Register(PopUpManager, new PopUpManager());
        Services.Register(ResourceManager, new ResourceManager());
        Services.Register(AudioManager, this.audioManager);
        Services.Register(GameManager, this);

        console.log('[GameManager] Services registered');
    }

    private initializeServices(): void {
        this.sceneManager = Services.GetService(SceneManager);
        this.popupManager = Services.GetService(PopUpManager);
        this.resourceManager = Services.GetService(ResourceManager);
        this.audioManager = Services.GetService(AudioManager);

        this.sceneManager.Init(this.uiRoot);
        this.popupManager.Init(this.uiRoot);
        this.resourceManager.Init();
        this.audioManager.Init();

        console.log('[GameManager] Services initialized');
    }

    public async PurchaseCard(): Promise<void> {
        console.log('[GameManager] CardPurchased...');

        // TODO: Later get the data from the gameData.
        let params = {
            gameId: "Test",
            quantity: 1,
            showLoading: false,
            betType: 1,
            unitPrice: "20"//PLK.gameData.unitPrice.toString(),
        };

        const res = await mockBuyCard(params);

        if (!res) {
            console.error('[GameManager] CardPurchased failed: response is null');
            return;
        }

        if (!res.scratchCardData) {
            console.error('[GameManager] CardPurchased failed: scratchCardData is missing', res);
            return;
        }

        if (!this.gameData.currentTicketData) {
            this.gameData.currentTicketData = new TicketData();
        }

        this.gameData.currentTicketData.updateTicketItem(res.scratchCardData);

        const numbers = this.gameData.currentTicketData.currentTicket.codes as CardNumberData;

        console.log('[GameManager] Numbers being emitted:', numbers);
        console.log(
            '[GameManager] Callback count before emit:',
            this.onPurchaseUpdateCardVisualCallbacks.length,
        );

        this.onPurchaseUpdateCardVisualCallbacks.forEach((callback) => {
            callback(numbers);
        });
    }
}