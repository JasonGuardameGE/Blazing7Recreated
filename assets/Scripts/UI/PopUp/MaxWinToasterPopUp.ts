import { _decorator, CCFloat, Component, Label, Node } from 'cc';
import { NumberFormatter } from '../../utils/NumberFormatter';

const { ccclass, property } = _decorator;

@ccclass('MaxWinToasterPopUp')
export class MaxWinToasterPopUp extends Component {
    
    @property(Label)
    maxWinValue: Label;

    @property(CCFloat)
    showDuration: number = 3;

    public showValue(newMaxValue: number): void {
        this.unscheduleAllCallbacks();

        const newAmount = NumberFormatter.formatAmount(newMaxValue);

        this.maxWinValue.string = `₱${newAmount.toString()}`;
        this.node.active = true;

        this.scheduleOnce(() => {
            this.node.active = false;
        }, this.showDuration);
    }
}