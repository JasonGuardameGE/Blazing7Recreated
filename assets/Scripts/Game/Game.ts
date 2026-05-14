import { _decorator, Animation, Component, EventHandler, Label, Node, tween, Tween } from 'cc';
import { CENTERBUTTON, GameOptions } from './GameOptions';
import { ScratchCardView } from '../Card/ScratchCardView';
import { ScratchSystem } from '../Scratch/ScratchSystem';
import { buyCard, mockBuyCard } from '../Api/GameApi';
import { GameData } from '../Data/GameData';
import { GameManager } from '../Managers/GameManager';
import { Services } from '../Managers/Services';
import { PopUpManager, PopUpPrefabPath } from '../Managers/PopUpManager';
import { WinPopUp } from '../UI/PopUp/WinPopUp';
import { SettleRes } from '../Types';
import { PricePopUpOptions } from './PricePopUpOptions';
import { AudioManager } from '../Managers/AudioManager';
import { HelpView } from '../UI/VisualFx/HelpView';
import { LastWin } from '../UI/LastWin';
import { NodeMovement } from '../UI/VisualFx/NodeMovement';
import { NumberFormatter } from '../utils/NumberFormatter';
import { MaxWinToasterPopUp } from '../UI/PopUp/MaxWinToasterPopUp';

const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {

    @property(HelpView)
    helpView: HelpView;

    @property(LastWin)
    lastWin: LastWin;

    @property(Label)
    maxWinAmount: Label;

    @property(Node)
    balanceShake: Node = null;

    @property(Label)
    playerBalance: Label;

    private balanceShakeAnim: Animation = null;

    @property(NodeMovement)
    private combinationGuide: NodeMovement;

    @property(GameOptions)
    gameOptions: GameOptions;

    @property(PricePopUpOptions)
    priceOptions: PricePopUpOptions;

    @property(PricePopUpOptions)
    autoAttemptOptions: PricePopUpOptions;

    private autoAttemptCount: number = 0;
    private readonly infiniteAutoAttemptCount: number = 99999;

    @property(ScratchCardView)
    scratchCardView: ScratchCardView;

    @property(ScratchSystem)
    scratchSystem: ScratchSystem;

    @property(Node)
    cardInfoNode: Node;

    private cardCurrentlyShowing: boolean = false;
    private cardReady: boolean = false;
    private _gameManager: GameManager = null;
    private _audioManager: AudioManager;

    private _popupManager: PopUpManager;
    private isShowingResults: boolean = false;
    private balanceTweenTarget: { value: number } = { value: 0 };
    private maxWinToaster: MaxWinToasterPopUp;

    public onLoad(): void {

    }

    protected start(): void {
        if (this.balanceShake) {
            this.balanceShakeAnim = this.balanceShake.getComponent(Animation);
        }

        this._gameManager = Services.GetService(GameManager);
        this._popupManager = Services.GetService(PopUpManager);
        this._audioManager = Services.GetService(AudioManager);

        this._popupManager.PreLoadPopUp(PopUpPrefabPath.WIN_POPUP);
        this._popupManager.PreLoadPopUp(PopUpPrefabPath.MAX_WIN_TOASTER_POPUP);

        this.setupGameOptions();
        this.setupCardView();
        this.setupScratchSystem();

        this.updatePlayerBalance();
        this.setupRemainingCard();
    }

    private async setupRemainingCard(): Promise<void> {
        if (this._gameManager.GameData.TicketData.currentTicket != null) {
            this.combinationGuide.node.active = false;
            this.gameOptions.DisableAuxillaryOptions(true);
            this.showCurrentCard();
        }
    }

    private setupCardView(): void {
        const cardPlayInComplete = this.NewEventHandler('Game', 'cardPlayInComplete');
        this.scratchCardView.cardFinishedPlayInCallbacks.push(cardPlayInComplete);
        this.scratchCardView.SetupEvents();

        const updatePlayerBalance = this.NewEventHandler('Game', 'updatePlayerBalance');
        this._gameManager.updatePlayerBalanceCallbacks.push(updatePlayerBalance);
    }

    private setupScratchSystem(): void {
        const cardAllScratched = this.NewEventHandler('Game', 'cardAllScratched');
        this.scratchSystem.allCardScratchedCallbacks.push(cardAllScratched);

        const cardNumberScratched = this.NewEventHandler('Game', 'cardNumberScratched');
        this.scratchSystem.onCardNumberScratchedCallbacks.push(cardNumberScratched);
    }

    private setupGameOptions(): void {
        if (!this.gameOptions) {
            console.error('[Game] gameOptions is null');
            return;
        }

        this.SetupBuyButton();
        this.SetupAuxillaryOptions();

        this.gameOptions.SetAutoModeUI(false);
    }

    private SetupBuyButton(): void {
        if (!this.gameOptions.buyCardButton) {
            console.error('[Game] buyCardButton is null');
            return;
        }

        const buyNewCard = this.NewEventHandler('Game', 'buyNewCard');
        this.gameOptions.buyCardButton.clickEndInsideCallbacks.push(buyNewCard);

        const scratchAll = this.NewEventHandler('Game', 'scratchAll');
        this.gameOptions.scratchAllButton.clickEndInsideCallbacks.push(scratchAll);
    }

    private async SetupAuxillaryOptions(): Promise<void> {
        try{
            this.gameOptions.setPriceButton.node.on(Node.EventType.TOUCH_END, this.showPriceOptions, this);
            this.gameOptions.setAutoButton.node.on(Node.EventType.TOUCH_END, this.onAutoButtonClicked, this);
            this.gameOptions.pauseButton.node.on(Node.EventType.TOUCH_END, this.onStopButtonClicked, this);

            const updateCurrentPrice = this.NewEventHandler('Game', 'updateCurrentPrice');            
            this.priceOptions.Initialize(this._gameManager.GameData.gamePriceList);
            this.priceOptions.onPriceValueUpdateCallback.push(updateCurrentPrice);

            const toasterNode: Node = await this._popupManager.LoadPopup(PopUpPrefabPath.MAX_WIN_TOASTER_POPUP, false, 999);
            this.maxWinToaster = toasterNode.getComponent(MaxWinToasterPopUp);
            this.updateCurrentPrice(false);
        }catch(err){
            console.error(`[Game] SetupAuxillaryOptions Error:`, err);
        }
    }

    private SetupWinPopup(winPopup: WinPopUp): void {
        const shakeBalance = this.NewEventHandler('Game', 'shakeBalance');
        winPopup.onCoinReachBalanceCallback.push(shakeBalance);
        winPopup.IsPopUpInitialized = true;
    }

    private scratchAll(): void {
        this.scratchSystem.ScratchAll();
        this.cardAllScratched();
    }

    private async buyNewCard(): Promise<void> {
        if (this.cardCurrentlyShowing) return;

        if (this.combinationGuide.node.active) {
            this.combinationGuide.StartMoving();
        }

        this.cardCurrentlyShowing = true;
        this.scratchSystem.ToggleTouch(false);

        try {
            this.gameOptions.DisableAuxillaryOptions(true);
            await this._gameManager.PurchaseCard();
            this.showCurrentCard();
            this.disableAuxillaryPopUpOptions();

        } catch (error) {
            console.error('[Game] buyNewCard failed:', error);
            this.cardCurrentlyShowing = false;

            if (this.autoAttemptCount > 0) {
                this.stopAuto();
                return;
            }

            this.gameOptions.ShowCenterButton(CENTERBUTTON.BUY_CARD_BUTTON, false);
            this.gameOptions.DisableAuxillaryOptions(false);
        }
    }

    private showCurrentCard(): void {

        this.scratchSystem.GenerateScratchRenderer();
        this.scratchCardView.StartCardPlayIn();
        this.gameOptions.ShowCenterButton(CENTERBUTTON.SCRATCH_ALL_BUTTON, true);
        this._gameManager.ScratchCard.SetupCurrentCardNumbers();
        this.cardInfoNode.active = true;
    }

    private cardPlayInComplete(): void {
        this.scratchSystem.ToggleTouch(true);
        this.gameOptions.ShowCenterButton(CENTERBUTTON.SCRATCH_ALL_BUTTON, this.autoAttemptCount > 0);

        if (this.autoAttemptCount > 0) {
            this.scratchAll();
        }
    }

    private async cardAllScratched(): Promise<void> {
        this.gameOptions.ShowCenterButton(CENTERBUTTON.BUY_CARD_BUTTON, this.autoAttemptCount > 0);
        this.cardCurrentlyShowing = false;

        await this._gameManager.SettleCard();

        const settleRes = this._gameManager.GameData.TicketData.settleInfo as SettleRes;

        if (settleRes.totalPayout <= 0) {
            this.checkAutoCall();
            return;
        }

        this.scratchCardView.RevealWins();
        await this.showWinResult(settleRes);
    }

    private updatePlayerBalance(): void {
        this.playerBalance.string = NumberFormatter.formatAmountWithDecimal(this._gameManager.GameUserInfo.balance) || '0';
    }

    private cardNumberScratched(index: number): void {
        this.scratchCardView.OnCardNumberFullyScratched(index);
    }

    private disableAuxillaryPopUpOptions(){
        this.priceOptions.node.active = false;
        this.autoAttemptOptions.node.active = false;
    }

    private NewEventHandler(component: string, handler: string): EventHandler {
        const eventHandler = new EventHandler();
        eventHandler.target = this.node;
        eventHandler.component = component;
        eventHandler.handler = handler;

        return eventHandler;
    }

    private updateMaximumAmount(showToaster: boolean = true): void {
        if (!this.maxWinAmount) {
            console.warn('[Game] Trying to update Maximum Amount Label, not set properly');
            return;
        }

        this._gameManager.UpdateCardPrice(this.priceOptions.CurrentPriceValue);

        const newValue = this._gameManager.GameData.unitPrice * this._gameManager.GameData?.maxWinMultiple;
        const newAmount = NumberFormatter.formatAmount(newValue
        );

        this.maxWinAmount.string = `p${newAmount}`;

        if(this.maxWinToaster && showToaster){
            this.maxWinToaster.showValue(newValue);
        }
    }

    private async showWinResult(settleRes: SettleRes): Promise<void> {
        if(this.isShowingResults) return;

        this.isShowingResults = true;
        const node: Node = await this._popupManager.LoadPopup(PopUpPrefabPath.WIN_POPUP);
        const winPopUp = node.getComponent(WinPopUp);

        if (!winPopUp.IsPopUpInitialized) {
            this.SetupWinPopup(winPopUp);
        }

        winPopUp.StartShowing(settleRes.totalPayout, settleRes.winType, () => {
            this.isShowingResults = false;
            this.checkAutoCall();
            this.lastWin.CheckLastWin();
        });
    }

    private showPriceOptions(): void {
        if(this.gameOptions.setPriceButton.disabled){
            return;
        }

        if (this.autoAttemptCount > 0) {
            return;
        }

        this.disableAuxillaryPopUpOptions();
        this.priceOptions.node.active = true;
    }

    private onAutoButtonClicked(): void {
        if(this.gameOptions.setAutoButton.disabled){
            return;
        }

        if (this.autoAttemptOptions.node.active) {
            this.autoAttemptOptions.node.active = false;
            this.setAutoValue();
            return;
        }

        this.disableAuxillaryPopUpOptions();
        this.autoAttemptOptions.node.active = true;
    }

    private onStopButtonClicked(): void {
        this.stopAuto();
    }

    private updateCurrentPrice(showToaster: boolean = true): void {
        this.gameOptions.setPriceButton.label.string = this.priceOptions.CurrentPriceValue.toString();
        this.updateMaximumAmount(showToaster);
    }

    private setAutoValue(): void {
        const selectedAutoValue = this.autoAttemptOptions.CurrentPriceValue;

        if (selectedAutoValue === -1) {
            this.autoAttemptCount = this.infiniteAutoAttemptCount;
        } else {
            this.autoAttemptCount = selectedAutoValue;
        }

        if (this.autoAttemptCount <= 0) {
            this.stopAuto();
            return;
        }

        this.gameOptions.SetAutoModeUI(true);
        this.gameOptions.SetPauseButtonCount(this.autoAttemptCount);

        this.updateAuto();
    }

    private checkAutoCall(): void {
        if (this.autoAttemptCount > 0) {
            this.scheduleOnce(() => {
                this.updateAuto();
            }, 0.5);

            return;
        }

        this.stopAuto();
    }

    private updateAuto(): void {
        if (this.autoAttemptCount <= 0) {
            this.stopAuto();
            return;
        }

        const isInfiniteAuto = this.autoAttemptOptions.CurrentPriceValue === -1;

        if (isInfiniteAuto) {
            this.autoAttemptCount = this.infiniteAutoAttemptCount;
        } else {
            this.autoAttemptCount--;
        }

        this.gameOptions.SetAutoModeUI(true);
        this.gameOptions.SetPauseButtonCount(this.autoAttemptCount);

        if (!isInfiniteAuto && this.autoAttemptCount <= 0) {
            this.stopAuto();
            return;
        }

        if (this.combinationGuide.node.active) {
            this.combinationGuide.node.active = false;
        }

        this.helpView.onAutoInput();
        this.buyNewCard();
    }

    private stopAuto(): void {
        this.autoAttemptCount = 0;

        if (this.autoAttemptOptions) {
            this.autoAttemptOptions.node.active = false;
        }

        this.gameOptions.ToggleAutoButton(true);
        this.gameOptions.DisableAuxillaryOptions(false);
        this.gameOptions.ShowCenterButton(CENTERBUTTON.BUY_CARD_BUTTON, false);
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
            this.playerBalance.string = NumberFormatter.formatAmountWithDecimal(finalBalance);

            return;
        }

        if (this.balanceShakeAnim) {
            this.balanceShakeAnim.play();
            this._audioManager.playEffectByName("coin");
        }

        if (this.balanceTweenTarget.value > 0) {
            return;
        }

        Tween.stopAllByTarget(this.balanceTweenTarget);

        const currentBalance = NumberFormatter.parseFormattedAmount(this.playerBalance.string);

        this.balanceTweenTarget.value = currentBalance;

        tween(this.balanceTweenTarget)
            .to(
                1,
                { value: finalBalance },
                {
                    onUpdate: () => {
                        this.playerBalance.string = NumberFormatter.formatAmountWithDecimal(
                            this.balanceTweenTarget.value,
                        );
                    },
                },
            )
            .call(() => {
                this.balanceTweenTarget.value = finalBalance;
                this.playerBalance.string = NumberFormatter.formatAmountWithDecimal(finalBalance);
                this.balanceTweenTarget.value = 0;
            })
            .start();
    }
}