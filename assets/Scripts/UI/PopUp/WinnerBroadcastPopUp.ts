import {
    _decorator,
    Component,
    EventHandler,
    RichText,
    UIOpacity,
    tween,
    Tween,
} from 'cc';

import { Announcement } from '../../Types';
import { Services } from '../../Managers/Services';
import { PopUpManager, PopUpPrefabPath } from '../../Managers/PopUpManager';
import { DevicePerformanceManager } from '../../Managers/DevicePerformanceManager';

const { ccclass, property } = _decorator;

@ccclass('WinnerBroadcastPopUp')
export class WinnerBroadcastPopUp extends Component {

    public onAnnouncementCompleteCallbacks: EventHandler[] = [];

    @property(UIOpacity)
    opacity: UIOpacity | null = null;

    @property(RichText)
    labelRichText: RichText | null = null;

    private announcementData: Announcement | null = null;
    private isShowing: boolean = false;

    protected onLoad(): void {
        this.RegisterPopUp();
        this.cacheComponents();
        this.HideInstant();
    }

    protected onDestroy(): void {
        this.stopTweens();
        this.unscheduleAllCallbacks();
    }

    public ShowPopUp(data: Announcement): void {
        if (!data) {
            return;
        }

        this.stopTweens();
        this.unscheduleAllCallbacks();

        this.announcementData = data;
        this.isShowing = true;

        this.node.active = true;

        this.setLabelValue();

        const settings = DevicePerformanceManager.Instance?.Settings;
        const useFade = settings?.winnerBroadcastUseFade ?? true;
        const fadeDuration = settings?.winnerBroadcastFadeDuration ?? 0.35;
        const visibleDuration = settings?.winnerBroadcastVisibleDuration ?? 3;

        if (!this.opacity) {
            /**
             * If opacity is missing, do not try to tween null.
             * Just wait, then complete.
             */
            this.scheduleOnce(() => {
                this.completeAnnouncement();
            }, visibleDuration);

            return;
        }

        if (!useFade || fadeDuration <= 0) {
            /**
             * LOW tier path:
             * No fade tween. This is cheaper and avoids tiny popup animation spikes.
             */
            this.opacity.opacity = 255;

            this.scheduleOnce(() => {
                this.completeAnnouncement();
            }, visibleDuration);

            return;
        }

        /**
         * MEDIUM/HIGH path:
         * Fade is allowed, but duration depends on quality tier.
         */
        this.opacity.opacity = 0;

        tween(this.opacity)
            .to(fadeDuration, { opacity: 255 })
            .delay(visibleDuration)
            .to(fadeDuration, { opacity: 0 })
            .call(() => {
                this.completeAnnouncement();
            })
            .start();
    }

    public HideInstant(): void {
        this.stopTweens();
        this.unscheduleAllCallbacks();

        this.isShowing = false;
        this.announcementData = null;

        this.node.active = true;

        if (this.opacity) {
            this.opacity.opacity = 0;
        }

        if (this.labelRichText) {
            this.labelRichText.string = '';
        }
    }

    private completeAnnouncement(): void {
        if (!this.isShowing) {
            return;
        }

        this.stopTweens();
        this.unscheduleAllCallbacks();

        this.isShowing = false;

        if (this.opacity) {
            this.opacity.opacity = 0;
        }

        EventHandler.emitEvents(this.onAnnouncementCompleteCallbacks, this);
    }

    private cacheComponents(): void {
        if (!this.opacity) {
            this.opacity = this.node.getComponent(UIOpacity);
        }

        if (!this.opacity) {
            this.opacity = this.node.addComponent(UIOpacity);
        }
    }

    private stopTweens(): void {
        if (this.opacity) {
            Tween.stopAllByTarget(this.opacity);
        }
    }

    private RegisterPopUp(): void {
        const popupManager = Services.GetService(PopUpManager);

        if (!popupManager) {
            console.warn('[WinnerBroadcastPopUp] Trying to register popup, but Manager does not exist.');
            return;
        }

        popupManager.RegisterPopup(PopUpPrefabPath.WINNER_ANNOUNCEMENT_POPUP, this.node);
    }

    private setLabelValue(): void {
        if (!this.labelRichText || !this.announcementData) {
            return;
        }

        const {
            conditionType,
            userName,
            bonus,
            winAmount,
            gameName,
        } = this.announcementData;

        const formattedAmount = this.formatAmount(winAmount);

        let content = '';

        switch (conditionType) {
            case 'MULTIPLIER':
                content =
                    `<b><u><color=#FFFC43>${bonus}X</color></u></b>` +
                    `<color=white> Win! ${userName} wins ₱${formattedAmount} in </color>` +
                    `<color=#FFFC43><b><u>${gameName}</u></b>!</color>`;
                break;

            case 'AMOUNT':
                content =
                    `<color=white>Big Win! ${userName} claims </color>` +
                    `<color=#FFFC43><b><u>₱${formattedAmount}</u></b></color>` +
                    `<color=white> in </color>` +
                    `<color=#FFFC43><b><u>${gameName}</u></b>!</color>`;
                break;

            case 'AMOUNT_MULTIPLIER':
                content =
                    `<color=white>Epic Win! ${userName} hits </color>` +
                    `<color=#FFFC43><b><u>${bonus}X</u></b></color>` +
                    `<color=white> for </color>` +
                    `<color=#FFFC43><b><u>₱${formattedAmount}</u></b></color>` +
                    `<color=white> in </color>` +
                    `<color=#FFFC43><b><u>${gameName}</u></b></color>` +
                    `<color=white>!</color>`;
                break;

            default:
                content =
                    `<color=#ffffff>Congrats!</color>` +
                    `<color=#1CFFE9> ${userName} </color>` +
                    `<b><color=#ffffff>just won </color></b>` +
                    `<b><u><color=#FD0>₱${formattedAmount}</color></u></b>` +
                    `<color=#ffffff> in </color>` +
                    `<b><u><color=#ffffff>${gameName}!</color></u></b>`;
                break;
        }

        this.labelRichText.string = content;
    }

    private formatAmount(amount: number): string {
        if (!amount || !Number.isFinite(amount)) {
            return '0';
        }

        const absAmount = Math.abs(amount);
        const amountStr = absAmount.toString();

        let fractionDigits = 0;

        if (!amountStr.includes('e') && amountStr.includes('.')) {
            fractionDigits = amountStr.split('.')[1].length;
        }

        const decimalsToKeep = Math.min(fractionDigits, 2);
        const truncated = this.truncateNumber(absAmount, decimalsToKeep);
        const raw = this.formatFixedNoRound(truncated, decimalsToKeep);
        const parts = raw.split('.');
        const intPart = parts[0];
        const fracPart = parts[1];

        const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const sign = amount < 0 ? '-' : '';

        return fracPart
            ? `${sign}${intWithCommas}.${fracPart}`
            : `${sign}${intWithCommas}`;
    }

    private truncateNumber(value: number, decimals: number): number {
        if (!Number.isFinite(value)) {
            return 0;
        }

        const factor = Math.pow(10, decimals);
        const truncated =
            value < 0
                ? Math.ceil(value * factor)
                : Math.floor(value * factor);

        return truncated / factor;
    }

    private formatFixedNoRound(value: number, decimals: number = 2): string {
        if (!Number.isFinite(value)) {
            return '0';
        }

        const factor = Math.pow(10, decimals);
        const truncated =
            value < 0
                ? Math.ceil(value * factor)
                : Math.floor(value * factor);

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
}