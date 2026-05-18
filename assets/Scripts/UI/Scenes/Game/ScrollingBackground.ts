import { _decorator, CCFloat, Component, Node, UITransform } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ScrollingBackground')
export class ScrollingBackground extends Component {

    @property(CCFloat)
    overlapOffset: number = 10;

    @property(CCFloat)
    speed: number = 120;

    @property([Node])
    backgrounds: Node[] = [];

    private bgHeight = 0;
    private spacing = 0;
    private totalHeight = 0;

    protected start(): void {
        if (this.backgrounds.length === 0) {
            console.warn('[ScrollingBackground] No backgrounds assigned');
            return;
        }

        const ui = this.backgrounds[0].getComponent(UITransform);

        if (!ui) {
            console.warn('[ScrollingBackground] First background has no UITransform');
            return;
        }

        this.bgHeight = ui.height;

        // Distance between each background.
        // Smaller than bgHeight means they overlap slightly.
        this.spacing = this.bgHeight - this.overlapOffset;

        // Full loop height for all backgrounds.
        this.totalHeight = this.spacing * this.backgrounds.length;

        for (let i = 0; i < this.backgrounds.length; i++) {
            const bg = this.backgrounds[i];

            bg.setPosition(
                bg.position.x,
                i * this.spacing,
                bg.position.z
            );
        }
    }

    update(dt: number): void {
        if (this.bgHeight <= 0 || this.backgrounds.length === 0) {
            return;
        }

        const dy = this.speed * dt;

        for (let i = 0; i < this.backgrounds.length; i++) {
            const bg = this.backgrounds[i];

            const x = bg.position.x;
            const y = bg.position.y - dy;
            const z = bg.position.z;

            bg.setPosition(x, y, z);

            // Recycle once it goes below its own height.
            if (bg.position.y <= -this.spacing) {
                bg.setPosition(
                    bg.position.x,
                    bg.position.y + this.totalHeight,
                    bg.position.z
                );
            }
        }
    }
}