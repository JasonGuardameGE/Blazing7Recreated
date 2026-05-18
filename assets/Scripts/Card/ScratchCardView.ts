import { _decorator, CCFloat, Component, Node, EventHandler, Vec3, Label } from 'cc';
import { NumberCardView } from './NumberCardView';
import { Services } from '../Managers/Services';
import { GameManager } from '../Managers/GameManager';
import { NumberFormatter } from '../utils/NumberFormatter';
const { ccclass, property } = _decorator;

@ccclass('ScratchCardView')
export class ScratchCardView extends Component {
    
    // Called once the card reaches its final position
    cardFinishedPlayInCallbacks: EventHandler[] = [];

    @property(Node)
    card: Node = null;

    @property(CCFloat)
    initialPositionY: number = 1200;

    @property(CCFloat)
    moveSpeed: number = 300;

    @property(CCFloat)
    distanceThreshold: number = 5;

    @property([NumberCardView])
    private numberCards: NumberCardView[] = [];

    @property(Label)
    cardPrice: Label = null;

    @property(Label)
    cardNumber: Label = null;

    private isPlayingIn: boolean = false;
    private _gameManager: GameManager;
    
    public SetupEvents(): void {
        if(!this._gameManager){
            this._gameManager = Services.GetService(GameManager);
        }
    
        if (!this._gameManager) {
            console.error('[ScratchCardView] GameManager service not found');
            return;
        }

        this._gameManager.ScratchCard.onPurchaseUpdateCardVisualCallbacks.push(
            this.setCardNumbers.bind(this),
        );
    }
    
    public setCardNumbers(numbers: Array<{value: number, win: number}>){

        let idx = 0;
        this.numberCards.forEach( (numberCard) =>{
            numberCard.Reset();

            const numberSet = numbers[idx];
            numberCard.SetCardValue(numberSet.value);
            numberCard.ToggleWinBackground(numberSet.value == 7);

            idx++;
        })

        // Set Card Info
        this.SetCardInfo();
    }

    public SetCardInfo(){
        if(!this._gameManager){
            this._gameManager = Services.GetService(GameManager);
        }

        if(this._gameManager.GameData.TicketData.currentTicket){
            const moneyVal = NumberFormatter.formatUnit(this._gameManager.GameData.TicketData.currentTicket.unitPrice);
            this.cardPrice.string = `₱${moneyVal}`;
            this.cardNumber.string = `Card NO: ${this._gameManager.GameData.TicketData.currentTicket.cardNo}`;    
        }else{
            this.cardPrice.string = ``;
            this.cardNumber.string = ``;
        }
    }

    public StartCardPlayIn() {
        if (!this.card) {
            console.error('[ScratchCardView] card is null');
            return;
        }

        this.ResetPosition();
        this.isPlayingIn = true;
    }

    public CardFinishedPlayIn() {
        this.isPlayingIn = false;

        if (!this.card) {
            return;
        }

        // Snap exactly to final position
        const pos = this.card.position;
        this.card.setPosition(pos.x, 0, pos.z);

        // Fire inspector callbacks
        EventHandler.emitEvents(this.cardFinishedPlayInCallbacks, this);
    }

    public OnCardNumberFullyScratched(index: number){
        this.numberCards[index].UpdateBackground();
    }

    public RevealWins(){
        this.numberCards.forEach((numberCard) =>{
            numberCard.PlayWin();
        });
    }

    protected update(dt: number): void {
        if (!this.isPlayingIn || !this.card) {
            return;
        }

        const pos = this.card.position;
        const targetY = 0;
        const distance = targetY - pos.y;

        if (Math.abs(distance) <= this.distanceThreshold) {
            this.CardFinishedPlayIn();
            return;
        }

        const direction = Math.sign(distance);
        const moveAmount = this.moveSpeed * dt * direction;

        // Prevent overshooting past 0
        let newY = pos.y + moveAmount;

        if (
            (direction > 0 && newY > targetY) ||
            (direction < 0 && newY < targetY)
        ) {
            newY = targetY;
        }

        this.card.setPosition(pos.x, newY, pos.z);

        if (Math.abs(targetY - newY) <= this.distanceThreshold) {
            this.CardFinishedPlayIn();
        }
    }

    private ResetPosition() {
        if (!this.card) {
            console.error('[ScratchCardView] card is null');
            return;
        }

        const pos = this.card.position;
        this.card.setPosition(pos.x, this.initialPositionY, pos.z);
    }

    private NewEventHandler(component: string, handler: string): EventHandler{

        const eventHandler = new EventHandler();
        eventHandler.target = this.node;
        eventHandler.component = component;
        eventHandler.handler = handler;

        return eventHandler;
    }
}