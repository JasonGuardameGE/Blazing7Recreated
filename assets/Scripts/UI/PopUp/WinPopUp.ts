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
    Vec2,
} from 'cc';
import { AudioManager } from '../../Managers/AudioManager';
import { Services } from '../../Managers/Services';
import { PopUpManager, PopUpPrefabPath } from '../../Managers/PopUpManager';
import { NumberFormatter } from '../../utils/NumberFormatter';

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

    protected onLoad(): void {
        this.RegisterPopUp();
        this.cacheCoinOriginalPositions();
        this.resetAnimationState();
    }

    protected start(): void {
        this._audioManager = Services.GetService(AudioManager);
    }

    protected onEnable(): void {
        if (this.skipButton) {
            this.skipButton.on(Node.EventType.TOUCH_START, this.onSkipTouched, this);
        }
    }

    protected onDisable(): void {
        if (this.skipButton) {
            this.skipButton.off(Node.EventType.TOUCH_START, this.onSkipTouched, this);
        }

        this.stopAllRunningTweens();
        this.stopCoinTweens();
        this.resetCoins();
        this.resetSkeleton(this.normalWin, false);
        this.resetSkeleton(this.superWin, false);
    }

    private RegisterPopUp(): void {
        const popupManager = Services.GetService(PopUpManager);

        if (!popupManager) {
            console.warn('[WinPopUp] Trying to register popup, but Manager does not exist');
            return;
        }

        popupManager.RegisterPopup(PopUpPrefabPath.WIN_POPUP, this.node);
    }

    public StartShowing(
        newWinValue: number,
        isSuperWin: number = 0,
        callback: (() => void) | null = null,
    ): void {
        this.winAmount = newWinValue;
        this.isSuperWin = isSuperWin === -1;
        this.onWinPopupDoneCallback = callback;

        this.resetAnimationState();

        this.node.active = true;

        this.Play();
    }

    protected async Play(): Promise<void> {
        try {
            if (!this._audioManager) {
                this._audioManager = Services.GetService(AudioManager);
            }

            this._audioManager.playEffectByName('fire');

            this.isIncrementFinished = false;
            this.hasPlayedCoinFly = false;

            this.resetCoins();

            if (this.superWin) {
                this.resetSkeleton(this.superWin, false);
            }

            if (this.normalWin) {
                this.playSkeletonAnimation(
                    this.normalWin,
                    'blazing7-win_popup_animation',
                    false,
                    true,
                );

                this._audioManager.playEffectByName('win');
            }

            if (this.winAmountLabel) {
                this.winAmountLabel.node.active = false;
                this.originalWinAmountFontSize = this.winAmountLabel.fontSize;
                this.winAmountLabel.string = NumberFormatter.formatAmountWithDecimal(0);
            }

            tween(this.node)
                .delay(0.5)
                .call(() => {
                    this.startShowingValue();
                })
                .start();

            if (this.isSuperWin) {
                this._audioManager.playEffectByName('superwin');
                this.showSuperWin();
            } else {
                tween(this.node)
                    .delay(2)
                    .call(() => {
                        if (this.normalWin) {
                            this.playSkeletonAnimation(
                                this.normalWin,
                                'blazing7-win_looping_animation',
                                true,
                                true,
                            );
                        }
                    })
                    .start();
            }
        } catch (err) {
            console.error('[WinPopUp] Error:', err);
        }
    }

    private showSuperWin(): void {
        tween(this.node)
            .delay(1.25)
            .call(() => {
                if (this.normalWin) {
                    this.resetSkeleton(this.normalWin, false);
                }

                if (this.superWin) {
                    this.playSkeletonAnimation(
                        this.superWin,
                        'blazing7-superwin_popup_animation',
                        false,
                        true,
                    );
                }
            })
            .start();

        tween(this.node)
            .delay(2)
            .call(() => {
                if (this.superWin) {
                    this.playSkeletonAnimation(
                        this.superWin,
                        'blazing7-superwin_looping_animation',
                        true,
                        true,
                    );
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
        this.winAmountLabel.string = NumberFormatter.formatAmountWithDecimal(0);

        const originalFontSize = this.originalWinAmountFontSize || this.winAmountLabel.fontSize;
        const pulseFontSize = originalFontSize * 1.5;

        this.winAmountLabel.fontSize = originalFontSize;

        tween(this.incrementTweenTarget)
            .to(
                duration,
                { value: targetValue },
                {
                    onUpdate: () => {
                        const currentValue = this.incrementTweenTarget.value;

                        this.winAmountLabel.string =
                            NumberFormatter.formatAmountWithDecimal(currentValue);

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
        this.winAmountLabel.string = NumberFormatter.formatAmountWithDecimal(targetValue);
        this.winAmountLabel.fontSize = this.originalWinAmountFontSize || this.winAmountLabel.fontSize;

        this.isIncrementFinished = true;

        this.playCoinFlySequenceOnce();
    }

    private SkipToLoopingAnimation(): void {
        Tween.stopAllByTarget(this.node);

        if (this.isSuperWin) {
            if (this.normalWin) {
                this.resetSkeleton(this.normalWin, false);
            }

            if (this.superWin) {
                this.playSkeletonAnimation(
                    this.superWin,
                    'blazing7-superwin_looping_animation',
                    true,
                    true,
                );
            }

            return;
        }

        if (this.superWin) {
            this.resetSkeleton(this.superWin, false);
        }

        if (this.normalWin) {
            this.playSkeletonAnimation(
                this.normalWin,
                'blazing7-win_looping_animation',
                true,
                true,
            );
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
            const targetPosition = this.getCoinTargetLocalPosition(coin);
            const delay = i * this.coinFlyDelayBetween;
            const isLastCoin = i === this.coins.length - 1;

            const startPoint = new Vec2(originalPosition.x, originalPosition.y);
            const endPoint = new Vec2(targetPosition.x, targetPosition.y);
            const controlPoint = this.getBezierCurve(startPoint, endPoint);

            const bezierProgress = { value: 0 };

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

                    bezierProgress.value = 0;
                })
                .parallel(
                    tween(bezierProgress)
                        .to(
                            this.coinFlyDuration,
                            { value: 1 },
                            {
                                easing: 'quadInOut',
                                onUpdate: () => {
                                    const curvedPosition = this.getQuadraticBezierPoint(
                                        startPoint,
                                        controlPoint,
                                        endPoint,
                                        bezierProgress.value,
                                    );

                                    coin.setPosition(
                                        curvedPosition.x,
                                        curvedPosition.y,
                                        originalPosition.z,
                                    );
                                },
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

    private resetAnimationState(): void {
        this.stopAllRunningTweens();
        this.stopCoinTweens();

        this.isIncrementFinished = false;
        this.hasPlayedCoinFly = false;

        this.incrementTweenTarget.value = 0;

        if (this.winAmountLabel) {
            this.originalWinAmountFontSize = this.winAmountLabel.fontSize;
            this.winAmountLabel.string = NumberFormatter.formatAmountWithDecimal(0);
            this.winAmountLabel.node.active = false;
        }

        this.resetSkeleton(this.normalWin, false);
        this.resetSkeleton(this.superWin, false);

        this.resetCoins();
    }

    private stopAllRunningTweens(): void {
        Tween.stopAllByTarget(this.incrementTweenTarget);
        Tween.stopAllByTarget(this.node);
    }

    private resetSkeleton(skeleton: sp.Skeleton | null, active: boolean): void {
        if (!skeleton) {
            return;
        }

        skeleton.clearTracks();
        skeleton.setToSetupPose();
        skeleton.updateAnimation(0);
        skeleton.node.active = active;
    }

    private playSkeletonAnimation(
        skeleton: sp.Skeleton | null,
        animationName: string,
        loop: boolean,
        active: boolean = true,
    ): void {
        if (!skeleton) {
            return;
        }

        skeleton.node.active = active;
        skeleton.clearTracks();
        skeleton.setToSetupPose();
        skeleton.setAnimation(0, animationName, loop);
        skeleton.updateAnimation(0);
    }

    private getBezierCurve(start: Vec2, end: Vec2): Vec2 {
        if (!start || !end) {
            return new Vec2();
        }

        const mid = new Vec2((start.x + end.x) / 2, (start.y + end.y) / 2);

        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        const nx = -dy / len;
        const ny = dx / len;

        const offset = Math.min(200, Math.max(50, len * 0.25));

        return new Vec2(mid.x + nx * offset, mid.y + ny * offset);
    }

    private getQuadraticBezierPoint(
        start: Vec2,
        control: Vec2,
        end: Vec2,
        t: number,
    ): Vec2 {
        const oneMinusT = 1 - t;

        const x =
            oneMinusT * oneMinusT * start.x +
            2 * oneMinusT * t * control.x +
            t * t * end.x;

        const y =
            oneMinusT * oneMinusT * start.y +
            2 * oneMinusT * t * control.y +
            t * t * end.y;

        return new Vec2(x, y);
    }
}