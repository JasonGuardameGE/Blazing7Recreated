import { _decorator, CCFloat, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DragonMovement')
export class DragonMovement extends Component {
    
    @property(Node)
    dragonNode: Node = null!;

    @property(CCFloat)
    targetYPosition: number = 0;

    @property(CCFloat)
    delay: number = 2.5;

    @property(CCFloat)
    moveDuration: number = 0.5;
    
    protected start(): void {
        this.scheduleOnce(() => {
            if (!this.dragonNode) return;

            const currentPos = this.dragonNode.position;

            tween(this.dragonNode)
                .to(this.moveDuration, {
                    position: new Vec3(
                        currentPos.x,
                        this.targetYPosition,
                        currentPos.z
                    )
                })
                .start();

        }, this.delay);
    }
}