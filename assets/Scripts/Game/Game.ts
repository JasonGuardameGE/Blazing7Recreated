import { _decorator, Animation, Component, EventHandler, Label, Node, tween, Tween } from 'cc';
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
    @property(Label)
    playerBalance: Label;
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


    private balanceTweenTarget: { value: number } = { value: 0 };

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

        this.updatePlayerBalance();
        this.setupRemainingCard();
    }

    private async setupRemainingCard(){
        if(this._gameManager.GameData.TicketData.currentTicket != null){
            this.combinationGuide.active = false;
            this.showCurrentCard();
        }
    }

    private setupCardView(){
        const cardPlayInComplete = this.NewEventHandler('Game', 'cardPlayInComplete');
        this.scratchCardView.cardFinishedPlayInCallbacks.push(cardPlayInComplete);
        this.scratchCardView.SetupEvents();

        const updatePlayerBalance = this.NewEventHandler('Game', 'updatePlayerBalance');
        this._gameManager.updatePlayerBalanceCallbacks.push(updatePlayerBalance);
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
        this.scratchSystem.ToggleTouch(false);
    
        try {
            console.log('[Game] BuyNewCard clicked');
            
            await this._gameManager.PurchaseCard();
            this.showCurrentCard();

        } catch (error) {
            console.error('[Game] buyNewCard failed:', error);
    
            this.cardCurrentlyShowing = false;
            this.gameOptions.ShowCenterButton(CENTERBUTTON.BUY_CARD_BUTTON);
        }
    }

    private showCurrentCard(){
        console.log('[Game] Showing Current Card');

        this.scratchSystem.GenerateScratchRenderer();
        this.scratchCardView.StartCardPlayIn();
        this.gameOptions.ShowCenterButton(CENTERBUTTON.BUY_CARD_BUTTON, true);    
        this._gameManager.ScratchCard.SetupCurrentCardNumbers();
    }

    private cardPlayInComplete(){
        this.scratchSystem.ToggleTouch(true);
        this.gameOptions.ShowCenterButton(CENTERBUTTON.SCRATCH_ALL_BUTTON)
    }

    private async cardAllScratched(){
        this.gameOptions.ShowCenterButton(CENTERBUTTON.BUY_CARD_BUTTON);
        this.cardCurrentlyShowing = false;  

        //SETTLE
        await this._gameManager.SettleCard();
        const settleRes = this._gameManager.GameData.TicketData.settleInfo as SettleRes;
        console.log(`[GAME] TOTAL PAYOUT: ${settleRes.totalPayout}`);

        if(settleRes.totalPayout <= 0)
        {
            return;
        }

        this.scratchCardView.RevealWins();
        await this.showWinResult(settleRes);
    }

    private updatePlayerBalance(){
        this.playerBalance.string = this.formatAmountWithDecimal(this._gameManager.GameUserInfo.balance) || "0";
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
    
    private shakeBalance(skipAnimation: boolean = false): void {
        if (!this.playerBalance) {
            console.error('[Game] playerBalance label is null');
            return;
        }
    
        const finalBalance =
            this._gameManager.GameUserInfo.balance + this._gameManager.GameData.lastWinAmount;
    
        if (skipAnimation) {
            Tween.stopAllByTarget(this.balanceTweenTarget);
    
            this.balanceTweenTarget.value = 0;
            this.playerBalance.string = this.formatAmountWithDecimal(finalBalance);
    
            return;
        }
    
        if (this.balanceShakeAnim) {
            this.balanceShakeAnim.play();
        }
    
        if (this.balanceTweenTarget.value > 0) {
            return;
        }
    
        Tween.stopAllByTarget(this.balanceTweenTarget);
    
        const currentBalance = this.parseFormattedAmount(this.playerBalance.string);
    
        this.balanceTweenTarget.value = currentBalance;
    
        tween(this.balanceTweenTarget)
            .to(
                1,
                { value: finalBalance },
                {
                    onUpdate: () => {
                        this.playerBalance.string = this.formatAmountWithDecimal(
                            this.balanceTweenTarget.value,
                        );
                    },
                },
            )
            .call(() => {
                this.balanceTweenTarget.value = finalBalance;
                this.playerBalance.string = this.formatAmountWithDecimal(finalBalance);
                this.balanceTweenTarget.value = 0;
            })
            .start();
    }


    private formatAmountWithDecimal(amount: number): string {
        if (amount == null || !Number.isFinite(amount)) return '0.00';
        const absAmount = Math.abs(amount);
        const truncated = this.truncateNumber(absAmount, 2);
        const raw = this.formatFixedNoRound(truncated, 2);
        const parts = raw.split('.');
        const intPart = parts[0];
        const fracPart = parts[1] || '00';
        const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const sign = amount < 0 ? '-' : '';
        return `${sign}${intWithCommas}.${fracPart}`;
    }

    private truncateNumber(value: number, decimals: number): number {
        if (!Number.isFinite(value)) return 0;
        const factor = Math.pow(10, decimals);
        const truncated = value < 0 ? Math.ceil(value * factor) : Math.floor(value * factor);
        return truncated / factor;
    }

    private formatFixedNoRound(value: number, decimals: number = 2): string {
        if (!Number.isFinite(value)) return '0';
        const factor = Math.pow(10, decimals);
        const truncated = value < 0 ? Math.ceil(value * factor) : Math.floor(value * factor);
        const absTruncated = Math.abs(truncated / factor);
        const integerPart = Math.floor(absTruncated);
        const sign = truncated < 0 ? '-' : '';
        if (decimals === 0) {
            return `${sign}${integerPart}`;
        }
        const fractionAsInt = Math.floor((absTruncated - integerPart) * factor);
        let fractionStr = fractionAsInt.toString();
        while (fractionStr.length < decimals) {
            fractionStr = `0${fractionStr}`;
        }
        return `${sign}${integerPart}.${fractionStr}`;
    }

    private parseFormattedAmount(value: string): number {
        if (!value) {
            return 0;
        }
    
        const normalized = value.replace(/,/g, '');
        const parsed = Number(normalized);
    
        return Number.isFinite(parsed) ? parsed : 0;
    }
}


