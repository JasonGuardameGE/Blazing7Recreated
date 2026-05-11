import { _decorator, Animation, Component, EventHandler, Node } from 'cc';
import { CENTERBUTTON, GameOptions } from './GameOptions';
import { ScratchCardView } from '../Card/ScratchCardView';
import { ScratchSystem } from '../Scratch/ScratchSystem';
import { buyCard, mockBuyCard } from '../Api/GameApi';
import { GameData } from '../Data/GameData';
import { GameManager } from '../Managers/GameManager';
import { Services } from '../Managers/Services';
import { PopUpManager, PopUpPrefabPath } from '../Managers/PopUpManager';
import { WinPopUp } from '../UI/WinPopUp/WinPopUp';
import { SettleRes } from '../Types';
import { PricePopUpOptions } from './PricePopUpOptions';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {

    @property(Node)
    balanceShake: Node = null;
    private balanceShakeAnim: Animation = null;
    @property(Node)
    private combinationGuide: Node = null;

    @property(GameOptions)
    gameOptions: GameOptions;
    @property(PricePopUpOptions)
    priceOptions: PricePopUpOptions;
    @property(PricePopUpOptions)
    autoAttemptOptions: PricePopUpOptions;

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

        if(this.balanceShake){
            this.balanceShakeAnim = this.balanceShake.getComponent(Animation);

        }

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
        this.SetupAuxillaryOptions();
    }

    private SetupBuyButton(){        
        if (!this.gameOptions.buyCardButton) {
            console.error('[Game] buyCardButton is null');
            return;
        }

        const buyNewCard = this.NewEventHandler('Game', 'buyNewCard');
        this.gameOptions.buyCardButton.clickEndInsideCallbacks.push(buyNewCard);

        const scratchAll = this.NewEventHandler('Game', 'scratchAll');
        this.gameOptions.scratchAllButton.clickEndInsideCallbacks.push(scratchAll);
    }

    private SetupAuxillaryOptions(){
        this.gameOptions.setPriceButton.node.on(Node.EventType.TOUCH_END, this.showPriceOptions, this);
        this.gameOptions.setAutoButton.node.on(Node.EventType.TOUCH_END, this.onAutoButtonClicked, this);
        this.gameOptions.pauseButton.node.on(Node.EventType.TOUCH_END, this.onStopButtonClicked, this);

        const updateCurrentPrice = this.NewEventHandler('Game', 'updateCurrentPrice');
        this.priceOptions.onPriceValueUpdateCallback.push(updateCurrentPrice);
    }

    private SetupWinPopup(winPopup: WinPopUp){
        const shakeBalance = this.NewEventHandler('Game', 'shakeBalance');
        winPopup.onCoinReachBalanceCallback.push(shakeBalance);
        winPopup.IsPopUpInitialized = true;
    }

    private scratchAll(){
        this.scratchSystem.ScratchAll();
        this.cardAllScratched();
    }

    private async buyNewCard(): Promise<void> {
        if (this.cardCurrentlyShowing) return;

        if(this.combinationGuide.active){
            this.combinationGuide.active = false;
            return;
        }
    
        this.cardCurrentlyShowing = true;
        this.gameOptions.ShowCenterButton(CENTERBUTTON.BUY_CARD_BUTTON, true);
        this.scratchSystem.ToggleTouch(false);
    
        try {
            console.log('[Game] BuyNewCard clicked');
            
            await this._gameManager.ScratchCard.PurchaseCard();

            this.scratchSystem.GenerateScratchRenderer();
            this.scratchCardView.StartCardPlayIn();    
        } catch (error) {
            console.error('[Game] buyNewCard failed:', error);
    
            this.cardCurrentlyShowing = false;
                    this.gameOptions.ShowCenterButton(CENTERBUTTON.BUY_CARD_BUTTON);
        }
    }

    private cardPlayInComplete(){
        this.scratchSystem.ToggleTouch(true);
        this.gameOptions.ShowCenterButton(CENTERBUTTON.SCRATCH_ALL_BUTTON)
    }

    private async cardAllScratched(){
        this.gameOptions.ShowCenterButton(CENTERBUTTON.BUY_CARD_BUTTON);
        this.cardCurrentlyShowing = false;  

        //SETTLE
        await this._gameManager.ScratchCard.SettleCard();
        const settleRes = this._gameManager.GameData.TicketData.settleInfo as SettleRes;
        console.log(`[GAME] TOTAL PAYOUT: ${settleRes.totalPayout}`);

        if(settleRes.totalPayout <= 0)
        {
            return;
        }

        this.scratchCardView.RevealWins();
        await this.showWinResult(settleRes);
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

    private async showWinResult(settleRes: SettleRes){
        // SHOW RESULTS
        let node: Node = await this._popupManager.LoadPopup(PopUpPrefabPath.WIN_POPUP);        
        let winPopUp = node.getComponent(WinPopUp);
        
        if(!winPopUp.IsPopUpInitialized){
            this.SetupWinPopup(winPopUp);
        }

        winPopUp.StartShowing(settleRes.totalPayout, settleRes.winType);

        //TODO: UPDATE PLAYER BALANCE
    }

    private showPriceOptions(){
        this.priceOptions.node.active = true;
    }

    private onAutoButtonClicked(){
        if(this.autoAttemptOptions.node.active){
            this.gameOptions.ToggleAutoButton(false);
            this.autoAttemptOptions.node.active = false;
            this.updateAutoValue();
        }else{
            this.gameOptions.ToggleAutoButton(true);
            this.autoAttemptOptions.node.active = true;
        }
    }

    private onStopButtonClicked(){
        this.gameOptions.ToggleAutoButton(true);
    }

    private updateCurrentPrice(){
        this.gameOptions.setPriceButton.label.string = this.priceOptions.CurrentPriceValue.toString();
    }

    private updateAutoValue(){
        this.gameOptions.pauseButton.label.string = this.autoAttemptOptions.CurrentPriceValue.toString();
    }
    
    private shakeBalance(){
        this.balanceShakeAnim.play();
    }
}


