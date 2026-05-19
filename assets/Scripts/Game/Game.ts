import { _decorator, Animation, Component, EventHandler, Label, Node, tween, Tween } from 'cc';
import { CENTERBUTTON, GameOptions } from './GameOptions';
import { ScratchCardView } from '../Card/ScratchCardView';
import { ScratchSystem } from '../Scratch/ScratchSystem';
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
    helpView: HelpView = null;

    @property(LastWin)
    lastWin: LastWin = null;

    @property(Label)
    maxWinAmount: Label = null;

    @property(Node)
    balanceShake: Node = null;

    @property(Label)
    playerBalance: Label = null;

    @property(NodeMovement)
    private combinationGuide: NodeMovement = null;

    @property(GameOptions)
    gameOptions: GameOptions = null;

    @property(PricePopUpOptions)
    priceOptions: PricePopUpOptions = null;

    @property(PricePopUpOptions)
    autoAttemptOptions: PricePopUpOptions = null;

    @property(ScratchCardView)
    scratchCardView: ScratchCardView = null;

    @property(ScratchSystem)
    scratchSystem: ScratchSystem = null;

    @property(Node)
    cardInfoNode: Node = null;

    private readonly infiniteAutoAttemptCount: number = 99999;
    private readonly autoNextCardDelay: number = 0.5;

    private autoAttemptCount: number = 0;

    private cardCurrentlyShowing: boolean = false;
    private isShowingResults: boolean = false;
    private isSettlingCard: boolean = false;

    private balanceShakeAnim: Animation = null;
    private balanceTweenTarget: { value: number } = { value: 0 };

    private _gameManager: GameManager = null;
    private _audioManager: AudioManager = null;
    private _popupManager: PopUpManager = null;

    private maxWinToaster: MaxWinToasterPopUp = null;

    protected start(): void {
        this.cacheReferences();
        this.preloadPopups();

        this.setupGameOptions();
        this.setupCardView();
        this.setupScratchSystem();

        this.updatePlayerBalance();
        this.setupRemainingCard();
    }

    protected onDisable(): void {
        this.unschedule(this.updateAuto);
    }

    protected onDestroy(): void {
        this.unschedule(this.updateAuto);
        Tween.stopAllByTarget(this.balanceTweenTarget);
    }

    private cacheReferences(): void {
        if (this.balanceShake) {
            this.balanceShakeAnim = this.balanceShake.getComponent(Animation);
        }

        this._gameManager = Services.GetService(GameManager);
        this._popupManager = Services.GetService(PopUpManager);
        this._audioManager = Services.GetService(AudioManager);
    }

    private preloadPopups(): void {
        this._popupManager.PreLoadPopUp(PopUpPrefabPath.WIN_POPUP);
        this._popupManager.PreLoadPopUp(PopUpPrefabPath.MAX_WIN_TOASTER_POPUP);
    }

    private async setupRemainingCard(): Promise<void> {
        if (!this.HasCurrentTicket()) {
            return;
        }

        if (this.combinationGuide) {
            this.combinationGuide.node.active = false;
        }

        this.gameOptions.DisableAuxillaryOptions(true);
        await this.showCurrentCard();
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

        this.scratchSystem.HelpView = this.helpView;
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

        if (!this.gameOptions.scratchAllButton) {
            console.error('[Game] scratchAllButton is null');
            return;
        }

        const buyNewCard = this.NewEventHandler('Game', 'buyNewCard');
        this.gameOptions.buyCardButton.clickEndInsideCallbacks.push(buyNewCard);

        const scratchAll = this.NewEventHandler('Game', 'scratchAll');
        this.gameOptions.scratchAllButton.clickEndInsideCallbacks.push(scratchAll);
    }

    private async SetupAuxillaryOptions(): Promise<void> {
        try {
            this.gameOptions.setPriceButton.node.on(Node.EventType.TOUCH_END, this.showPriceOptions, this);
            this.gameOptions.setAutoButton.node.on(Node.EventType.TOUCH_END, this.onAutoButtonClicked, this);
            this.gameOptions.pauseButton.node.on(Node.EventType.TOUCH_END, this.onStopButtonClicked, this);

            const updateCurrentPrice = this.NewEventHandler('Game', 'updateCurrentPrice');

            this.priceOptions.Initialize(this._gameManager.GameData.gamePriceList);
            this.priceOptions.onPriceValueUpdateCallback.push(updateCurrentPrice);

            const toasterNode = await this._popupManager.LoadPopup(
                PopUpPrefabPath.MAX_WIN_TOASTER_POPUP,
                false,
                999,
            );

            this.maxWinToaster = toasterNode.getComponent(MaxWinToasterPopUp);

            this.updateCurrentPrice(false);
        } catch (err) {
            console.error('[Game] SetupAuxillaryOptions Error:', err);
        }
    }

    private SetupWinPopup(winPopup: WinPopUp): void {
        const shakeBalance = this.NewEventHandler('Game', 'shakeBalance');

        winPopup.onCoinReachBalanceCallback.push(shakeBalance);
        winPopup.IsPopUpInitialized = true;
    }

    private scratchAll(): void {
        if (!this.CanScratchAll()) {
            return;
        }

        this.ShowScratchAllDisabled();
        this.scratchSystem.ScratchAll();
    }

    private async buyNewCard(): Promise<void> {
        if (!this.CanBuyNewCard()) {
            return;
        }

        this.prepareNewCardFlow();

        try {
            this.gameOptions.DisableAuxillaryOptions(true);

            await this._gameManager.PurchaseCard();

            const didShowCard = await this.showCurrentCard();

            if (!didShowCard) {
                this.cardCurrentlyShowing = false;
                this.RestoreNormalControls();
                return;
            }

            this.disableAuxillaryPopUpOptions();

        } catch (error) {
            console.error('[Game] buyNewCard failed:', error);

            this.cardCurrentlyShowing = false;

            if (this.IsAutoRunning()) {
                this.stopAuto();
                return;
            }

            this.RestoreNormalControls();
        }
    }

    private CanBuyNewCard(): boolean {
        if (this.cardCurrentlyShowing) {
            return false;
        }

        if (this.scratchSystem.IsGeneratingScratch) {
            return false;
        }

        return true;
    }

    private CanScratchAll(): boolean {
        const scratchAllButton = this.gameOptions.scratchAllButton;

        if (scratchAllButton?.disabled && !this.IsAutoRunning()) {
            return false;
        }

        return true;
    }

    private prepareNewCardFlow(): void {
        this.scratchSystem.CancelScratchAll();

        if (this.combinationGuide?.node.active) {
            this.combinationGuide.StartMoving();
        }

        this.cardCurrentlyShowing = true;
        this.scratchSystem.ToggleTouch(false);

        this.ShowScratchAllDisabled();
    }

    private async showCurrentCard(): Promise<boolean> {
        const generated = await this.scratchSystem.GenerateScratchRenderer();

        if (!generated) {
            return false;
        }

        this.scratchCardView.StartCardPlayIn();

        this.ShowScratchAllDisabled();

        this._gameManager.ScratchCard.SetupCurrentCardNumbers();

        if (this.cardInfoNode) {
            this.cardInfoNode.active = true;
        }

        return true;
    }

    private cardPlayInComplete(): void {
        this.scratchSystem.ToggleTouch(true);

        if (this.IsAutoRunning()) {
            this.handleAutoCardPlayInComplete();
            return;
        }

        this.gameOptions.UpdateCenterButton();
    }

    private handleAutoCardPlayInComplete(): void {
        this.ShowScratchAllDisabled();

        this.scratchAll();

        this.DecreaseAutoAttemptCount();
        this.gameOptions.SetPauseButtonCount(this.autoAttemptCount);

        this.gameOptions.SetAutoModeUI(true);
        this.gameOptions.DisableAuxillaryOptions(true);
    }

    private async cardAllScratched(): Promise<void> {
        if (this.isSettlingCard) {
            return;
        }

        this.isSettlingCard = true;
        this.cardCurrentlyShowing = false;

        try {
            await this._gameManager.SettleCard();

            const settleRes = this.GetSettleResult();

            if (!settleRes) {
                this.RestoreNormalControls();
                return;
            }

            if (settleRes.totalPayout <= 0) {
                this.handleNoWinSettlement();
                return;
            }

            this.scratchCardView.RevealWins();
            await this.showWinResult(settleRes);

        } finally {
            this.isSettlingCard = false;
        }
    }

    private handleNoWinSettlement(): void {
        if (this.IsAutoRunning()) {
            this.checkAutoCall();
            return;
        }

        this.RestoreNormalControls();
    }

    private async showWinResult(settleRes: SettleRes): Promise<void> {
        if (this.isShowingResults) {
            return;
        }

        this.isShowingResults = true;

        const node = await this._popupManager.LoadPopup(PopUpPrefabPath.WIN_POPUP);
        const winPopUp = node.getComponent(WinPopUp);

        if (!winPopUp.IsPopUpInitialized) {
            this.SetupWinPopup(winPopUp);
        }

        winPopUp.StartShowing(settleRes.totalPayout, settleRes.winType, () => {
            this.isShowingResults = false;

            if (this.IsAutoRunning()) {
                this.checkAutoCall();
            } else {
                this.RestoreNormalControls();
            }

            this.lastWin.CheckLastWin();
        });
    }

    private showPriceOptions(): void {
        if (this.gameOptions.setPriceButton.disabled) {
            return;
        }

        if (this.IsAutoRunning()) {
            return;
        }

        this.disableAuxillaryPopUpOptions();
        this.priceOptions.node.active = true;
    }

    private onAutoButtonClicked(): void {
        if (this.gameOptions.setAutoButton.disabled) {
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

    private setAutoValue(): void {
        this.autoAttemptCount = this.GetSelectedAutoAttemptCount();

        if (!this.IsAutoRunning()) {
            this.stopAuto();
            return;
        }

        this.unschedule(this.updateAuto);

        this.gameOptions.SetAutoModeUI(true);
        this.gameOptions.SetPauseButtonCount(this.autoAttemptCount);

        this.RunAutoStep();
    }

    private checkAutoCall(): void {
        this.unschedule(this.updateAuto);

        if (this.IsAutoRunning()) {
            this.scheduleOnce(this.updateAuto, this.autoNextCardDelay);
        } else {
            this.stopAuto();
        }
    }

    private updateAuto = (): void => {
        if (!this.IsAutoRunning()) {
            this.stopAuto();
            return;
        }

        this.helpView.onAutoInput();
        this.RunAutoStep();

        this.RefreshInfiniteAutoCountIfNeeded();

        this.gameOptions.SetAutoModeUI(true);
        this.gameOptions.SetPauseButtonCount(this.autoAttemptCount);

        if (!this.IsAutoInfinite() && !this.IsAutoRunning()) {
            this.stopAuto();
            return;
        }

        if (this.combinationGuide?.node.active) {
            this.combinationGuide.node.active = false;
        }
    };

    private RunAutoStep(): void {
        if (this.ShouldBuyNewCardForAuto()) {
            this.buyNewCard();
            return;
        }

        this.scratchAll();
    }

    private ShouldBuyNewCardForAuto(): boolean {
        const ticketData = this._gameManager.GameData.TicketData;

        return !ticketData.currentTicket && !ticketData.hasSettle;
    }

    private stopAuto(): void {
        this.unschedule(this.updateAuto);

        this.autoAttemptCount = 0;

        if (this.autoAttemptOptions) {
            this.autoAttemptOptions.node.active = false;
        }

        this.gameOptions.ToggleAutoButton(true);
        this.gameOptions.DisableAuxillaryOptions(false);
        this.gameOptions.UpdateCenterButton();
    }

    private RestoreNormalControls(): void {
        this.gameOptions.SetAutoModeUI(false);
        this.gameOptions.UpdateCenterButton();
        this.gameOptions.DisableAuxillaryOptions(false);
    }

    private ShowScratchAllDisabled(): void {
        this.gameOptions.UpdateCenterButton({
            forceButton: CENTERBUTTON.SCRATCH_ALL_BUTTON,
            disabled: true,
        });
    }

    private DecreaseAutoAttemptCount(): void {
        if (this.IsAutoInfinite()) {
            this.autoAttemptCount = this.infiniteAutoAttemptCount;
            return;
        }

        this.autoAttemptCount--;
    }

    private RefreshInfiniteAutoCountIfNeeded(): void {
        if (this.IsAutoInfinite()) {
            this.autoAttemptCount = this.infiniteAutoAttemptCount;
        }
    }

    private GetSelectedAutoAttemptCount(): number {
        const selectedAutoValue = this.autoAttemptOptions.CurrentPriceValue;

        if (selectedAutoValue === -1) {
            return this.infiniteAutoAttemptCount;
        }

        return selectedAutoValue;
    }

    private IsAutoInfinite(): boolean {
        return this.autoAttemptOptions.CurrentPriceValue === -1;
    }

    private IsAutoRunning(): boolean {
        return this.autoAttemptCount > 0;
    }

    private HasCurrentTicket(): boolean {
        return this._gameManager.GameData.TicketData.currentTicket != null;
    }

    private GetSettleResult(): SettleRes | null {
        return this._gameManager.GameData.TicketData.settleInfo as SettleRes;
    }

    private updatePlayerBalance(): void {
        if (!this.playerBalance) {
            return;
        }

        this.playerBalance.string =
            NumberFormatter.formatAmountWithDecimal(this._gameManager.GameUserInfo.balance) || '0';
    }

    private cardNumberScratched(index: number): void {
        this.scratchCardView.OnCardNumberFullyScratched(index);
    }

    private disableAuxillaryPopUpOptions(): void {
        if (this.priceOptions) {
            this.priceOptions.node.active = false;
        }

        if (this.autoAttemptOptions) {
            this.autoAttemptOptions.node.active = false;
        }
    }

    private updateCurrentPrice(showToaster: boolean = true): void {
        if (!this.gameOptions?.setPriceButton?.label) {
            return;
        }

        this.gameOptions.setPriceButton.label.string = this.priceOptions.CurrentPriceValue.toString();
        this.updateMaximumAmount(showToaster);
    }

    private updateMaximumAmount(showToaster: boolean = true): void {
        if (!this.maxWinAmount) {
            console.warn('[Game] Trying to update Maximum Amount Label, not set properly');
            return;
        }

        this._gameManager.UpdateCardPrice(this.priceOptions.CurrentPriceValue);

        const newValue =
            this._gameManager.GameData.unitPrice *
            this._gameManager.GameData.maxWinMultiple;

        const newAmount = NumberFormatter.formatAmount(newValue);

        this.maxWinAmount.string = `p${newAmount}`;

        if (this.maxWinToaster && showToaster) {
            this.maxWinToaster.showValue(newValue);
        }
    }

    private shakeBalance(skipAnimation: boolean = false): void {
        if (!this.playerBalance) {
            console.error('[Game] playerBalance label is null');
            return;
        }

        const finalBalance =
            this._gameManager.GameUserInfo.balance +
            this._gameManager.GameData.lastWinAmount;

        if (skipAnimation) {
            Tween.stopAllByTarget(this.balanceTweenTarget);

            this.balanceTweenTarget.value = 0;
            this.playerBalance.string = NumberFormatter.formatAmountWithDecimal(finalBalance);

            return;
        }

        if (this.balanceShakeAnim) {
            this.balanceShakeAnim.play();
            this._audioManager.playEffectByName('coin');
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

    private NewEventHandler(component: string, handler: string): EventHandler {
        const eventHandler = new EventHandler();

        eventHandler.target = this.node;
        eventHandler.component = component;
        eventHandler.handler = handler;

        return eventHandler;
    }
}