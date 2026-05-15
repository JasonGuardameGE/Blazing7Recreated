import { _decorator, CCFloat, Component, tween, screen, Vec3, Tween } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('NodeMovement')
export class NodeMovement extends Component {

    @property(CCFloat)
    targetYPosition: number = 0;

    @property(CCFloat)
    delay: number = 2.5;

    @property(CCFloat)
    moveDuration: number = 0.5;
    
    @property(Boolean)
    startOnLoad: boolean = false;

    @property(Boolean)
    disableOnReach: boolean = false;

    private hasMoved: boolean = false;

    protected start(): void {
        if (this.startOnLoad) {
            this.StartMoving();
        }

        screen.on('window-resize', this.onResolutionChanged, this);
        screen.on('orientation-change', this.onResolutionChanged, this);
    }

    protected onDestroy(): void {
        screen.off('window-resize', this.onResolutionChanged, this);
        screen.off('orientation-change', this.onResolutionChanged, this);

        Tween.stopAllByTarget(this.node);
    }
    
    public StartMoving(): void {
        this.scheduleOnce(() => {
            if (!this.node || !this.node.isValid) return;

            const currentPos = this.node.position.clone();

            tween(this.node)
                .to(this.moveDuration, {
                    position: new Vec3(
                        currentPos.x,
                        this.targetYPosition,
                        currentPos.z
                    )
                })
                .call(() => {
                    this.hasMoved = true;
                    this.finalizePosition();

                    if (this.disableOnReach && this.node && this.node.isValid) {
                        this.node.active = false;
                    }
                })
                .start();

        }, this.delay);
    }

    private onResolutionChanged(): void {
        if (!this.hasMoved) return;

        // Let Canvas / Widget / layout finish first.
        this.scheduleOnce(() => {
            this.finalizePosition();
        }, 0);
    }

    public finalizePosition(): void {
        if (!this.node || !this.node.isValid) return;

        const currentPos = this.node.position;

        this.node.setPosition(
            currentPos.x,
            this.targetYPosition,
            currentPos.z
        );
    }
}