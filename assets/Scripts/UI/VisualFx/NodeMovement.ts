import { _decorator, CCFloat, Component, Node, tween, Vec3 } from 'cc';

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

    protected start(): void {
        if (this.startOnLoad) {
            this.StartMoving();
        }
    }
    
    public StartMoving(): void {
        this.scheduleOnce(() => {
            if (!this.node) return;

            const currentPos = this.node.position;

            tween(this.node)
                .to(this.moveDuration, {
                    position: new Vec3(
                        currentPos.x,
                        this.targetYPosition,
                        currentPos.z
                    )
                })
                .call(() => {
                    if (this.disableOnReach && this.node) {
                        this.node.active = false;
                    }
                })
                .start();

        }, this.delay);
    }
}