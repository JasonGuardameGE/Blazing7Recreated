import { _decorator, Component, NodeEventType } from 'cc';
import { SingleButton } from '../UI/InteractableUIs/SingleButton';
import { AudioManager } from '../Managers/AudioManager';
import { Services } from '../Managers/Services';
import { GameManager } from '../Managers/GameManager';

const { ccclass, property } = _decorator;

export enum CENTERBUTTON {
    BUY_CARD_BUTTON,
    SCRATCH_ALL_BUTTON,
}

type CenterButtonUpdateOptions = {
    forceButton?: CENTERBUTTON;
    disabled?: boolean;
};

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
    private _audioManager: AudioManager | null = null;
    private _gameManager: GameManager | null = null;

    protected start(): void {
        this._audioManager = Services.GetService(AudioManager);
        this._gameManager = Services.GetService(GameManager);

        this.initializeButtons();
    }

    protected onDestroy(): void {
        this.removeButtonListeners();
    }

    private initializeButtons(): void {
    }

    private removeButtonListeners(): void {
    }

    public UpdateCenterButton(options: CenterButtonUpdateOptions = {}): void {
        const buttonToShow = options.forceButton ?? this.GetCorrectCenterButton();
        const isDisabled = options.disabled ?? this.GetCorrectCenterButtonDisabled(buttonToShow);

        this.ShowCenterButton(buttonToShow, isDisabled);
    }

    private GetCorrectCenterButton(): CENTERBUTTON {
        const hasCurrentTicket = this._gameManager?.GameData?.TicketData?.currentTicket != null;

        if (hasCurrentTicket) {
            return CENTERBUTTON.SCRATCH_ALL_BUTTON;
        }

        return CENTERBUTTON.BUY_CARD_BUTTON;
    }

    private GetCorrectCenterButtonDisabled(button: CENTERBUTTON): boolean {
        if (!_gameManagerSafe(this._gameManager)) {
            return false;
        }

        switch (button) {
            case CENTERBUTTON.SCRATCH_ALL_BUTTON:
                return this._gameManager.GameData.TicketData.hasSettle;

            case CENTERBUTTON.BUY_CARD_BUTTON:
                return false;

            default:
                return false;
        }
    }

    private ShowCenterButton(newButtonShown: CENTERBUTTON, isDisabled: boolean = false): void {
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

    public SetCenterButtonDisabled(isDisabled: boolean): void {
        if (!this.currentlyShownButton) {
            return;
        }

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

        this.pauseButton.label.string = count > 90000 ? '∞' : count.toString();
    }

    public SetAutoModeUI(isAutoRunning: boolean): void {
        this.ToggleAutoButton(!isAutoRunning);
        this.DisableAuxillaryOptions(isAutoRunning);

        if (!isAutoRunning) {
            this.UpdateCenterButton();
        }
    }
}

function _gameManagerSafe(gameManager: GameManager | null): gameManager is GameManager {
    return gameManager != null && gameManager.GameData != null;
}