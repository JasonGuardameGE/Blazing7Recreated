import { _decorator, CCFloat, Component, Node, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScrollingBackground')
export class ScrollingBackground extends Component {
    
    @property(CCFloat)
    speed: number = 120;

    @property([Node])
    backgrounds: Node[] = [];
    
    private bgHeight = 0;
    
    protected start(): void {
        if (this.backgrounds.length === 0) {
            console.warn('[ScrollingBackground] No backgrounds assigned');
            return;
        }

        const ui = this.backgrounds[0].getComponent(UITransform)!;
        this.bgHeight = ui.height;

        for (let i = 0; i < this.backgrounds.length; i++) {
            const bg = this.backgrounds[i];
    
            const pos = bg.position.clone();
            pos.y = i * this.bgHeight;
    
            bg.setPosition(pos);
        }
    }

    update(dt: number) {
        const dy = this.speed * dt;
        const totalHeight = this.bgHeight * this.backgrounds.length;
    
        for (let i = 0; i < this.backgrounds.length; i++) {
            const bg = this.backgrounds[i];
    
            // Move down
            bg.setPosition(
                bg.position.x,
                bg.position.y - dy,
                bg.position.z
            );
    
            // Recycle when off screen
            if (bg.position.y <= -this.bgHeight) {
                bg.setPosition(
                    bg.position.x,
                    bg.position.y + totalHeight,
                    bg.position.z
                );
            }
        }
    }
   
}


