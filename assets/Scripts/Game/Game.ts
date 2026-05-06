import { _decorator, Component, EventHandler, Node } from 'cc';
import { GameOptions } from './GameOptions';
import { ScratchCardView } from '../Card/ScratchCardView';
import { ScratchSystem } from '../Scratch/ScratchSystem';
import { buyCard, mockBuyCard } from '../Api/GameApi';
import { GameData } from '../Data/GameData';
import { GameManager } from '../Managers/GameManager';
import { Services } from '../Managers/Services';
import { PopUpManager, PopUpPrefabPath } from '../Managers/PopUpManager';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {

    @property(GameOptions)
    gameOptions: GameOptions;
    @property(ScratchCardView)
    scratchCardView: ScratchCardView;
    @property(ScratchSystem)
    scratchSystem: ScratchSystem;

    private cardCurrentlyShowing: boolean = false;
    private cardReady: boolean = false;
    private _gameManager: GameManager = null;

    private _popupManager: PopUpManager;

    public onLoad(): void {

    }

    protected start(): void {
      this._gameManager = Services.GetService(GameManager);   
      this._popupManager = Services.GetService(PopUpManager);

      this._popupManager.PreLoadPopUp(PopUpPrefabPath.WIN_POPUP);

      this.setupGameOptions();
      this.setupCardView();
      this.setupScratchSystem();
    }


    private setupCardView(){
        const cardPlayInComplete = this.NewEventHandler('Game', 'cardPlayInComplete');
        this.scratchCardView.cardFinishedPlayInCallbacks.push(cardPlayInComplete);
    }

    private setupScratchSystem(){
        const cardAllScratched = this.NewEventHandler('Game', 'cardAllScratched');
        this.scratchSystem.allCardScratchedCallbacks.push(cardAllScratched);

        const cardNumberScratched = this.NewEventHandler('Game', 'cardNumberScratched')
        this.scratchSystem.onCardNumberScratchedCallbacks.push(cardNumberScratched);
    }

    private setupGameOptions(): void {
        if (!this.gameOptions) {
            console.error('[Game] gameOptions is null');
            return;
        }

        this.SetupBuyButton();
    }


    private SetupBuyButton(){        
        if (!this.gameOptions.buyCardButton) {
            console.error('[Game] buyCardButton is null');
            return;
        }

        const eventHandler = this.NewEventHandler('Game', 'buyNewCard');
        this.gameOptions.buyCardButton.clickEndInsideCallbacks.push(eventHandler);
    }

    private async buyNewCard(): Promise<void> {
        if (this.cardCurrentlyShowing) return;
    
        this.cardCurrentlyShowing = true;
        this.gameOptions.buyCardButton.disabled = true;
        this.scratchSystem.ToggleTouch(false);
    
        try {
            console.log('[Game] BuyNewCard clicked');
            
            await this._gameManager.PurchaseCard();

            this.scratchSystem.GenerateScratchRenderer();
            this.scratchCardView.StartCardPlayIn();    
        } catch (error) {
            console.error('[Game] buyNewCard failed:', error);
    
            this.cardCurrentlyShowing = false;
            this.gameOptions.buyCardButton.disabled = false;
        }
    }

    private cardPlayInComplete(){
        this.scratchSystem.ToggleTouch(true);
    }

    private cardAllScratched(){
        this.gameOptions.buyCardButton.disabled = false;
        this.cardCurrentlyShowing = false;

        this.scratchCardView.RevealWins();
    }

    private cardNumberScratched(index: number){
        this.scratchCardView.OnCardNumberFullyScratched(index);
    }

    private NewEventHandler(component: string, handler: string): EventHandler{

        const eventHandler = new EventHandler();
        eventHandler.target = this.node;
        eventHandler.component = component;
        eventHandler.handler = handler;

        return eventHandler;
    }
}


