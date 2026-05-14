import { _decorator, Component, EventHandler, Node, RichText, UIOpacity, tween } from 'cc';
import { Announcement } from '../../Types';
import { Services } from '../../Managers/Services';
import { PopUpManager, PopUpPrefabPath } from '../../Managers/PopUpManager';

const { ccclass, property } = _decorator;

@ccclass('WinnerBroadcastPopUp')
export class WinnerBroadcastPopUp extends Component {

    onAnnouncementCompleteCallbacks: EventHandler[] = [];

    @property(UIOpacity)
    opacity: UIOpacity;

    @property(RichText)
    labelRichText: RichText;

    private announcementData: Announcement;

    protected start(): void {
        this.RegisterPopUp();    
    }

    public ShowPopUp(data: Announcement) {    
        this.announcementData = data;
        this.setLabelValue();

        // Reset opacity
        this.opacity.opacity = 255;

        // Stop any existing fade tween to avoid overlap
        tween(this.opacity).stop();

        // Wait 2 seconds, fade out, then trigger callbacks
        tween(this.opacity)
            .delay(2)
            .to(1, { opacity: 0 })
            .delay(1)
            .call(() => {
                this.onAnnouncementCompleteCallbacks.forEach(callback => {
                    EventHandler.emitEvents([callback], this);
                });
            })
            .start();
    }

    private RegisterPopUp(){
        const popupManager = Services.GetService(PopUpManager);

        if(!popupManager){
            console.warn(`[WinPopUp] Trying to register popup, but Manager does not exist`)
            return;
        }

        popupManager.RegisterPopup(PopUpPrefabPath.WINNER_ANNOUNCEMENT_POPUP, this.node);
    }

    private setLabelValue() {
        const { conditionType, userName, bonus, winAmount, gameName } = this.announcementData || {};
        
        let content = "";    

        switch (conditionType) {
            case "MULTIPLIER":
                content = `<b><u><color=#FFFC43>${bonus}X</u></color></b><color=white> Win! ${userName} wins ₱${this.formatAmount(winAmount)} in </color><color=#FFFC43><b><u>${gameName}</u></b>!</color>`;
                break;

            case "AMOUNT":
                content = `<color=white>Big Win! ${userName} claims </color><color=#FFFC43><b><u>₱${this.formatAmount(winAmount)} </u></b></color><color=white>in </color><color=#FFFC43><b><u>${gameName}</u></b>!</color>`;
                break;

            case "AMOUNT_MULTIPLIER":
                content = `<color=white>Epic Win! ${userName} hits </color><color=#FFFC43><b><u>${bonus}X </u></b></color><color=white>for </color><color=#FFFC43><b><u>₱${this.formatAmount(winAmount)} </u></b></color><color=white>in </color><color=#FFFC43><b><u>${gameName}</u></b></color><color=white>!</color>`;
                break;

            default:
                content = `<color=#ffffff>Congrats!</color><color=#1CFFE9> ${userName} </color><b><color=#ffffff>just won</b></color><b><u><color=#FD0> ₱${this.formatAmount(winAmount)} </color></u></b><color=#ffffff>in </color><b><u><color=#ffffff>${gameName}!</color></u></b>`;
                break;
        }

        this.labelRichText.string = content;
    }

    private formatAmount(amount: number): string {
        if (!amount || !Number.isFinite(amount)) return '0';

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

        return fracPart ? `${sign}${intWithCommas}.${fracPart}` : `${sign}${intWithCommas}`;
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
}