import { _decorator, CCInteger, Component, EventHandler, game } from 'cc';
import { Services } from './Services';
import SceneManager from './SceneManager';
import ResourceManager from './ResourceManager';
import { AudioManager } from './AudioManager';
import { UIRoot } from '../UI/UIRoot';
import { GameData } from '../Data/GameData';
import TicketData from '../Data/TicketData';
import { PopUpManager, PopUpPrefabPath } from './PopUpManager';
import { mockBuyCard, settleScratch } from '../Api/GameApi';
import { ScratchCard } from '../Card/ScratchCard';
import logger from '../utils/logger';
import ApiManager from '../Api/ApiManager';
import { GameUserInfo } from '../Data/GameUserInfo';
import { UserInfo } from '../Types';
import { WinBroadcastManager } from './WinBroadcastManager';
import { WsManager } from './WebsocketManager';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    updatePlayerBalanceCallbacks: EventHandler[] = [];

    private gameData: GameData = null;
    get GameData(){
        return this.gameData;
    }

    private gameUserInfo: GameUserInfo = new GameUserInfo();
    get GameUserInfo(){
        return this.gameUserInfo;
    }

    @property(UIRoot)
    uiRoot: UIRoot = null;

    @property(AudioManager)
    private audioManager: AudioManager = null;

    @property(WinBroadcastManager)
    private winBroadcastManager: WinBroadcastManager = null;
    
    @property(PopUpManager)
    private popupManager: PopUpManager = null;
    
    @property(CCInteger)
    forcedWinType: number = 0;

    private setupLoaded: boolean = false;
    get SetupLoaded(){
        return this.setupLoaded;
    }
    
    private sceneManager: SceneManager = null;
    private resourceManager: ResourceManager = null;

    private scratchCard: ScratchCard;
    get ScratchCard(){
        return this.scratchCard;
    }

    protected onLoad(): void {
        // TODO: Load from server the player's current Game Data
        this.gameData = new GameData();
        this.gameData.TicketData = new TicketData();
        this.gameData.initConfig();

        // Can Re-check if this one should be transferred elsewhere.
        this.scratchCard = new ScratchCard();
        this.scratchCard.Init(this);

        this.registerServices();
        this.initializeServices();
    }

    public async LoadGameSetup() : Promise<void> {
        try{
            this.setupLoaded = false;
            logger.log('[GameManager] Loading API Manager..');
            await ApiManager.initialize();

            ApiManager.GameApi.getScratchList().then((res) =>{
                const gameData = this.gameData;
                const gameList = gameData.gameList = res;
                const currentGame = gameList.find((item:any) => item.gameId == gameData.gameId);
                gameData.initTopAndBigAmount(currentGame.bigAmount, currentGame.topAmount);
                gameData.gameName = currentGame.gameType;
                gameData.remainingCardCount = currentGame.unusedCount;
                gameData.cardPrice = currentGame.unitPrice;
                gameData.unitPrice = currentGame.unitPrice;                
                gameData.gamePriceList = currentGame.unitPriceList;
                gameData.isAutoPlay = currentGame.autoPlay != null && currentGame.autoPlay != 0;
            });

            this.gameData.DeviceType = this.uiRoot.DetectedDeviceResolution;
            this.uiRoot.onResize();

            this.setupLoaded = true;
            WsManager.getInstance().init();
            await this.scratchCard.RequestRemainingCards();
        }catch(err){
            logger.error('[GameManager] Error when initializing API:', err);
        }
    }

    public UpdateCardPrice(newUnitPrice: number){
        this.gameData.unitPrice = this.gameData.cardPrice = newUnitPrice;
    }

    private registerServices(): void {
        Services.Register(SceneManager, new SceneManager());
        Services.Register(PopUpManager, this.popupManager);
        Services.Register(ResourceManager, new ResourceManager());
        Services.Register(WinBroadcastManager, this.winBroadcastManager);
        Services.Register(AudioManager, this.audioManager);
        Services.Register(GameManager, this);
    }

    private initializeServices(): void {
        this.sceneManager = Services.GetService(SceneManager);
        this.popupManager = Services.GetService(PopUpManager);
        this.resourceManager = Services.GetService(ResourceManager);
        this.audioManager = Services.GetService(AudioManager);
        this.winBroadcastManager = Services.GetService(WinBroadcastManager);

        this.sceneManager.Init(this.uiRoot);
        this.popupManager.Init(this.uiRoot);
        this.resourceManager.Init();
        this.audioManager.Init();
    }

    public async PurchaseCard(){
        
        await this.scratchCard.PurchaseCard();

        EventHandler.emitEvents(this.updatePlayerBalanceCallbacks);
    }

    public async SettleCard(){
        await this.scratchCard.SettleCard();

        EventHandler.emitEvents(this.updatePlayerBalanceCallbacks);
    }
}