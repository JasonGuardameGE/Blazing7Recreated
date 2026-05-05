import { _decorator, Component, Node } from 'cc';
import { SingleButton } from '../UI/InteractableUIs/SingleButton';
const { ccclass, property } = _decorator;

@ccclass('GameOptions')
export class GameOptions extends Component {
    
    @property(SingleButton)
    buyCardButton: SingleButton;

    @property(SingleButton)
    setPriceButton: SingleButton;

    @property(SingleButton)
    autoButton: SingleButton;
}


