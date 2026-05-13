import {
    _decorator,
    CCFloat,
    Component,
    Label,
    Node,
    sp,
    tween,
    Tween,
    Vec3,
    UITransform,
    EventHandler,
} from 'cc';
import { AudioManager } from '../../Managers/AudioManager';
import { Services } from '../../Managers/Services';

const { ccclass, property } = _decorator;

@ccclass('WinPopUp')
export class WinPopUp extends Component {

    onCoinReachBalanceCallback: EventHandler[] = [];
    onWinPopUpFinishedCallback: EventHandler[] = [];

    @property(Node)
    public coinFlyTarget: Node = null;

    @property(Node)
    public skipButton: Node | null = null;

    @property(sp.Skeleton)
    public normalWin: sp.Skeleton | null = null;

    @property(sp.Skeleton)
    public superWin: sp.Skeleton | null = null;

    @property(Label)
    public winAmountLabel: Label = null;

    @property(CCFloat)
    public normalWinIncrementDuration: number = 1;

    @property(CCFloat)
    public superWinIncrementDuration: number = 1.75;

    // Coins Related Variables
    @property([Node])
    private coins: Node[] = [];

    @property(CCFloat)
    public coinFlyDelayBetween: number = 0.08;

    @property(CCFloat)
    public coinFlyDuration: number = 0.45;

    @property(CCFloat)
    public coinStartScale: number = 0.3;

    @property(CCFloat)
    public coinPeakScale: number = 1;

    @property(CCFloat)
    public coinEndScale: number = 0.3;

    // Label Related Variables
    private isSuperWin: boolean = false;
    private winAmount: number = 0;
    private originalWinAmountFontSize: number = 0;
    private incrementTweenTarget: { value: number } = { value: 0 };

    private isIncrementFinished: boolean = false;
    private hasPlayedCoinFly: boolean = false;
    private coinOriginalPositions: Vec3[] = [];

    private onWinPopupDoneCallback: (() => void) | null = null;

    IsPopUpInitialized: boolean = false;
    
    private _audioManager: AudioManager;

    protected start(): void {
        this._audioManager = Services.GetService(AudioManager);
    }

    protected onLoad(): void {
        this.cacheCoinOriginalPositions();
        this.resetCoins();
    }

    protected onEnable(): void {
        if (this.skipButton) {
            this.skipButton.on(Node.EventType.TOUCH_END, this.onSkipTouched, this);
        }
    }

    protected onDisable(): void {
        if (this.skipButton) {
            this.skipButton.off(Node.EventType.TOUCH_END, this.onSkipTouched, this);
        }

        Tween.stopAllByTarget(this.incrementTweenTarget);
        Tween.stopAllByTarget(this.node);

        this.stopCoinTweens();
        this.resetCoins();
    }

    public StartShowing(
        newWinValue: number,
        isSuperWin: number = 0,
        callback: (() => void) | null = null,
    ): void {
        this.winAmount = newWinValue;
        this.isSuperWin = isSuperWin === -1;
        this.onWinPopupDoneCallback = callback;

        this.node.active = true;

        this.Play();
    }

    protected async Play(): Promise<void> {
        try{            
            if(!this._audioManager){
                this._audioManager = Services.GetService(AudioManager);
            }

            await this._audioManager.playEffectByName("fire");

            this.isIncrementFinished = false;
            this.hasPlayedCoinFly = false;

            this.resetCoins();

            if (this.normalWin) {
                this.normalWin.node.active = true;
                this.normalWin.setAnimation(0, 'blazing7-win_popup_animation', false);
                await this._audioManager.playEffectByName("win");
            }

            if (this.superWin) {
                this.superWin.node.active = false;
            }

            if (this.winAmountLabel) {
                this.winAmountLabel.node.active = false;
                this.originalWinAmountFontSize = this.winAmountLabel.fontSize;
                this.winAmountLabel.string = '0';
            }

            tween(this.node)
                .delay(0.5)
                .call(() => {
                    this.startShowingValue();
                })
                .start();

            if (this.isSuperWin) {
                await this._audioManager.playEffectByName("superwin");
                this.showSuperWin();
            } else {
                tween(this.node)
                    .delay(2)
                    .call(() => {
                        if (this.normalWin) {
                            this.normalWin.setAnimation(0, 'blazing7-win_looping_animation', true);
                        }
                    })
                    .start();
            }
        }catch(err){
            console.error(`[WinPopUp] Error:`, err);
        }
    }

    private showSuperWin(): void {
        tween(this.node)
            .delay(1.25)
            .call(() => {
                if (this.normalWin) {
                    this.normalWin.node.active = false;
                }

                if (this.superWin) {
                    this.superWin.node.active = true;
                    this.superWin.setAnimation(0, 'blazing7-superwin_popup_animation', false);
                }
            })
            .start();

        tween(this.node)
            .delay(2)
            .call(() => {
                if (this.superWin) {
                    this.superWin.setAnimation(0, 'blazing7-superwin_looping_animation', true);
                }
            })
            .start();
    }

    private startShowingValue(): void {
        if (!this.winAmountLabel) {
            return;
        }

        this.winAmountLabel.node.active = true;
        this.IncrementLabelToWinValue();
    }

    private IncrementLabelToWinValue(): void {
        if (!this.winAmountLabel) {
            return;
        }

        Tween.stopAllByTarget(this.incrementTweenTarget);

        this.isIncrementFinished = false;

        const targetValue = Math.max(0, this.winAmount);
        const duration = this.isSuperWin
            ? this.superWinIncrementDuration
            : this.normalWinIncrementDuration;

        this.incrementTweenTarget.value = 0;
        this.winAmountLabel.string = '0';

        const originalFontSize = this.originalWinAmountFontSize || this.winAmountLabel.fontSize;
        const pulseFontSize = originalFontSize * 1.5;

        this.winAmountLabel.fontSize = originalFontSize;

        tween(this.incrementTweenTarget)
            .to(
                duration,
                { value: targetValue },
                {
                    onUpdate: () => {
                        const currentValue = Math.floor(this.incrementTweenTarget.value);
                        this.winAmountLabel.string = this.FormatWinAmount(currentValue);

                        const pulse = Math.sin(Date.now() * 0.02);
                        const normalizedPulse = (pulse + 1) * 0.5;

                        this.winAmountLabel.fontSize =
                            originalFontSize + (pulseFontSize - originalFontSize) * normalizedPulse;
                    },
                },
            )
            .call(() => {
                this.CompleteIncrementLabel();
            })
            .start();
    }

    private onSkipTouched(): void {
        if (!this.isIncrementFinished) {
            this.CompleteIncrementLabel();
            this.SkipToLoopingAnimation();
            return;
        }

        this.SkipBalanceAnimation();
        this.FinishWinPopup();
    }

    private SkipBalanceAnimation(): void {
        EventHandler.emitEvents(this.onCoinReachBalanceCallback, true);
    }

    private CompleteIncrementLabel(): void {
        if (!this.winAmountLabel) {
            return;
        }

        Tween.stopAllByTarget(this.incrementTweenTarget);

        const targetValue = Math.max(0, this.winAmount);

        this.incrementTweenTarget.value = targetValue;
        this.winAmountLabel.string = this.FormatWinAmount(targetValue);
        this.winAmountLabel.fontSize = this.originalWinAmountFontSize || this.winAmountLabel.fontSize;

        this.isIncrementFinished = true;

        this.playCoinFlySequenceOnce();
    }

    private SkipToLoopingAnimation(): void {
        Tween.stopAllByTarget(this.node);

        if (this.isSuperWin) {
            if (this.normalWin) {
                this.normalWin.node.active = false;
            }

            if (this.superWin) {
                this.superWin.node.active = true;
                this.superWin.setAnimation(0, 'blazing7-superwin_looping_animation', true);
            }

            return;
        }

        if (this.superWin) {
            this.superWin.node.active = false;
        }

        if (this.normalWin) {
            this.normalWin.node.active = true;
            this.normalWin.setAnimation(0, 'blazing7-win_looping_animation', true);
        }
    }

    private FinishWinPopup(): void {
        const callback = this.onWinPopupDoneCallback;
        this.onWinPopupDoneCallback = null;

        EventHandler.emitEvents(this.onWinPopUpFinishedCallback);

        if (callback) {
            callback();
        }

        this.node.active = false;
    }

    private playCoinFlySequenceOnce(): void {
        if (this.hasPlayedCoinFly) {
            return;
        }

        this.hasPlayedCoinFly = true;
        this.playCoinFlySequence();
    }

    private cacheCoinOriginalPositions(): void {
        this.coinOriginalPositions = [];

        for (const coin of this.coins) {
            if (!coin) {
                this.coinOriginalPositions.push(Vec3.ZERO.clone());
                continue;
            }

            this.coinOriginalPositions.push(coin.position.clone());
        }
    }

    private resetCoins(): void {
        for (let i = 0; i < this.coins.length; i++) {
            const coin = this.coins[i];

            if (!coin) {
                continue;
            }

            Tween.stopAllByTarget(coin);

            const originalPosition = this.coinOriginalPositions[i];

            if (originalPosition) {
                coin.setPosition(originalPosition);
            }

            coin.setScale(
                this.coinStartScale,
                this.coinStartScale,
                this.coinStartScale,
            );

            coin.active = false;
        }
    }

    private stopCoinTweens(): void {
        for (const coin of this.coins) {
            if (!coin) {
                continue;
            }

            Tween.stopAllByTarget(coin);
        }
    }

    private playCoinFlySequence(): void {
        if (!this.coinFlyTarget) {
            console.warn('[WinPopUp] coinFlyTarget is null');
            return;
        }

        if (!this.coins || this.coins.length === 0) {
            return;
        }

        this.resetCoins();

        for (let i = 0; i < this.coins.length; i++) {
            const coin = this.coins[i];

            if (!coin) {
                continue;
            }

            const originalPosition = this.coinOriginalPositions[i]?.clone() || coin.position.clone();
            const delay = i * this.coinFlyDelayBetween;
            const isLastCoin = i === this.coins.length - 1;

            tween(coin)
                .delay(delay)
                .call(() => {
                    coin.active = true;
                    coin.setPosition(originalPosition);
                    coin.setScale(
                        this.coinStartScale,
                        this.coinStartScale,
                        this.coinStartScale,
                    );
                })
                .parallel(
                    tween()
                        .to(
                            this.coinFlyDuration,
                            {
                                position: this.getCoinTargetLocalPosition(coin),
                            },
                            {
                                easing: 'quadInOut',
                            },
                        ),

                    tween()
                        .to(
                            this.coinFlyDuration * 0.5,
                            {
                                scale: new Vec3(
                                    this.coinPeakScale,
                                    this.coinPeakScale,
                                    this.coinPeakScale,
                                ),
                            },
                            {
                                easing: 'backOut',
                            },
                        )
                        .to(
                            this.coinFlyDuration * 0.5,
                            {
                                scale: new Vec3(
                                    this.coinEndScale,
                                    this.coinEndScale,
                                    this.coinEndScale,
                                ),
                            },
                            {
                                easing: 'quadIn',
                            },
                        ),
                )
                .call(() => {
                    EventHandler.emitEvents(this.onCoinReachBalanceCallback, false);

                    coin.active = false;
                    coin.setPosition(originalPosition);
                    coin.setScale(
                        this.coinStartScale,
                        this.coinStartScale,
                        this.coinStartScale,
                    );

                    if (isLastCoin) {
                        this.FinishWinPopup();
                    }
                })
                .start();
        }
    }

    private getCoinTargetLocalPosition(coin: Node): Vec3 {
        if (!this.coinFlyTarget) {
            return coin.position.clone();
        }

        const targetWorldPosition = this.coinFlyTarget.worldPosition;

        if (!coin.parent) {
            return targetWorldPosition.clone();
        }

        const parentUI = coin.parent.getComponent(UITransform);

        if (parentUI) {
            return parentUI.convertToNodeSpaceAR(targetWorldPosition);
        }

        return coin.parent.inverseTransformPoint(new Vec3(), targetWorldPosition);
    }

    private FormatWinAmount(value: number): string {
        return Math.floor(value).toLocaleString();
    }
}