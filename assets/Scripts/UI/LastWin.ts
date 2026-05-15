import { _decorator, Component, Label, Node, sp } from 'cc';
import { GameManager } from '../Managers/GameManager';
import { Services } from '../Managers/Services';
import { NumberFormatter } from '../utils/NumberFormatter';
const { ccclass, property } = _decorator;

@ccclass('LastWin')
export class LastWin extends Component {
    
    @property(sp.Skeleton)
    animation: sp.Skeleton = null;

    @property(Label)
    labelValue: Label = null;

    private _gameManager: GameManager = null;


    public CheckLastWin(){
        if(!this._gameManager){
            this._gameManager = Services.GetService(GameManager);
        }

        const lastWin = this._gameManager.GameData.TicketData.lastWin;

        if(lastWin > 0){
            this.node.active = true;
            this.animation.setAnimation(0, "blazing7s-lastwin_animation", false);
            this.labelValue.string = NumberFormatter.formatAmountWithDecimal(lastWin);
        }else{
            this.node.active = false;
        }
    }
}


