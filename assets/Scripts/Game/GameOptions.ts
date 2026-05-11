import { _decorator, Component } from 'cc';
import { SingleButton } from '../UI/InteractableUIs/SingleButton';

const { ccclass, property } = _decorator;

export enum CENTERBUTTON {
    BUY_CARD_BUTTON,
    SCRATCH_ALL_BUTTON,
}

@ccclass('GameOptions')
export class GameOptions extends Component {
    
    @property(SingleButton)
    buyCardButton: SingleButton | null = null;

    @property(SingleButton)
    scratchAllButton: SingleButton | null = null;

    @property(SingleButton)
    setPriceButton: SingleButton | null = null;

    @property(SingleButton)
    setAutoButton: SingleButton | null = null;

    @property(SingleButton)
    pauseButton: SingleButton | null = null;

    private currentlyShownButton: SingleButton | null = null;

    public ShowCenterButton(newButtonShown: CENTERBUTTON, isDisabled: boolean = false): void {
        if (this.currentlyShownButton) {
            this.currentlyShownButton.node.active = false;
            this.currentlyShownButton.disabled = false;
        }

        switch (newButtonShown) {
            case CENTERBUTTON.BUY_CARD_BUTTON:
                this.currentlyShownButton = this.buyCardButton;
                break;

            case CENTERBUTTON.SCRATCH_ALL_BUTTON:
                this.currentlyShownButton = this.scratchAllButton;
                break;

            default:
                this.currentlyShownButton = null;
                break;
        }

        if (this.currentlyShownButton) {
            this.currentlyShownButton.node.active = true;
        }

        this.currentlyShownButton.disabled = isDisabled;
    }

    public ToggleAutoButton(toggle: boolean){
        this.setAutoButton.node.active = toggle;
        this.pauseButton.node.active = !toggle;
    }
}