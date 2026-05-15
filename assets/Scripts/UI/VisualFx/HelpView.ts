import { _decorator, CCFloat, Component, Node, input, Input, EventTouch, EventMouse, Game } from 'cc';
import { GameManager } from '../../Managers/GameManager';
import { Services } from '../../Managers/Services';

const { ccclass, property } = _decorator;

@ccclass('HelpView')
export class HelpView extends Component {
    @property(CCFloat)
    idleTime: number = 5.0;

    @property(Node)
    handGuide: Node = null;

    private _gameManager: GameManager;

    protected start(): void {
        this._gameManager = Services.GetService(GameManager);    
    }

    protected onEnable(): void {
        input.on(Input.EventType.TOUCH_START, this.onPlayerInput, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onPlayerInput, this);
        input.on(Input.EventType.MOUSE_DOWN, this.onPlayerInput, this);

        this.startCountdown();
    }

    protected onDisable(): void {
        input.off(Input.EventType.TOUCH_START, this.onPlayerInput, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onPlayerInput, this);
        input.off(Input.EventType.MOUSE_DOWN, this.onPlayerInput, this);

        this.unschedule(this.showIdleHelp);
    }

    public onAutoInput(){
        this.resetCountdown();
    }
    
    private onPlayerInput(event?: EventTouch | EventMouse): void {
        this.resetCountdown();
    }

    public resetCountdown(): void {
        this.hideIdleHelp();
        this.unschedule(this.showIdleHelp);
        this.scheduleOnce(this.showIdleHelp, this.idleTime);
    }

    private startCountdown(): void {
        this.resetCountdown();
    }

    private showIdleHelp(): void {
        if (!this.handGuide) return;

        // Dont show help if there's no existing ticket
        if(!this._gameManager.GameData.TicketData.currentTicket){
            this.resetCountdown();
            return;
        }

        this.handGuide.active = true;
    }

    private hideIdleHelp(): void {
        if (!this.handGuide) return;

        this.handGuide.active = false;
    }
}