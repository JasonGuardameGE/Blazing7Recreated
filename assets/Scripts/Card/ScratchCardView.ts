import { _decorator, CCFloat, Component, Node, EventHandler, Vec3 } from 'cc';
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

    private isPlayingIn: boolean = false;

    protected start(): void {
        
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
}