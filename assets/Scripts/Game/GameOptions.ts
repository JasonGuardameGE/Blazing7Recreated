import { _decorator, Component, NodeEventType } from 'cc';
import { SingleButton } from '../UI/InteractableUIs/SingleButton';
import { AudioManager } from '../Managers/AudioManager';
import { Services } from '../Managers/Services';

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
    private _audioManager: AudioManager;
    
    protected start(): void {
        this._audioManager = Services.GetService(AudioManager);
        this.initializeButtons();   
    }

    private initializeButtons(){
        this.buyCardButton.node.on(NodeEventType.TOUCH_END, this.playClickButton, this);
        this.scratchAllButton.node.on(NodeEventType.TOUCH_END, this.playClickButton, this);
        this.setPriceButton.node.on(NodeEventType.TOUCH_END, this.playClickButton, this);
        this.setAutoButton.node.on(NodeEventType.TOUCH_END, this.playClickButton, this);
        this.pauseButton.node.on(NodeEventType.TOUCH_END, this.playClickButton, this);
    }

    private playClickButton(){
        this._audioManager.playEffectByName('click');
    }

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

        if (!this.currentlyShownButton) {
            return;
        }

        this.currentlyShownButton.node.active = true;
        this.currentlyShownButton.disabled = isDisabled;
    }

    public DisableAuxillaryOptions(toggle: boolean): void {
        if (this.setAutoButton) {
            this.setAutoButton.disabled = toggle;
        }

        if (this.setPriceButton) {
            this.setPriceButton.disabled = toggle;
        }
    }

    public ToggleAutoButton(showAutoButton: boolean): void {
        if (this.setAutoButton) {
            this.setAutoButton.node.active = showAutoButton;
        }

        if (this.pauseButton) {
            this.pauseButton.node.active = !showAutoButton;
        }
    }

    public SetPauseButtonCount(count: number): void {
        if (!this.pauseButton || !this.pauseButton.label) {
            return;
        }

        this.pauseButton.label.string = (count > 90000) ? '∞' : count.toString();
    }

    public SetAutoModeUI(isAutoRunning: boolean): void {
        this.ToggleAutoButton(!isAutoRunning);
        this.DisableAuxillaryOptions(isAutoRunning);

        if (!isAutoRunning) {
            this.ShowCenterButton(CENTERBUTTON.BUY_CARD_BUTTON, false);
        }
    }
}