import { _decorator, Component, Node, Prefab, SpriteFrame, Vec3, tween, instantiate, Sprite, UITransform, UIOpacity } from 'cc';
//import { MessageFlag } from '../manager/MessageFlag';
//import PLK from '../PLK';
const { ccclass, property } = _decorator;

@ccclass('FragmentView')
export class FragmentView extends Component {

    @property({ type: Prefab })
    fragmentPrefab: Prefab = null;

    @property({ type: [SpriteFrame] })
    fragmentFrames: SpriteFrame[] = [];

    private pool: Node[] = [];

    onLoad() {
        //PLK.event.on(MessageFlag.SCRATCH_ERASE, this.spawnFragments, this);
    }

    /**
     * 生成碎片
     * @param worldPos 世界坐标（刮卡位置）
     * @param count 数量
     */
    public spawnFragments(data:{worldPos: Vec3,count: number}) {
        let {worldPos,count} = data;
        if(count > 1) count = 1;
        for (let i = 0; i < count; i++) {
            this.spawnOne(worldPos);
        }
    }

    private spawnOne(worldPos: Vec3) {
        let frag: Node = null;
    
        if (this.pool.length > 0) {
            frag = this.pool.pop();
        } else {
            frag = instantiate(this.fragmentPrefab);
        }
    
        this.node.addChild(frag);
    
        // 世界坐标 → 本地坐标
        const localPos = new Vec3();
        this.node.getComponent(UITransform)?.convertToNodeSpaceAR(worldPos, localPos);
        frag.setPosition(localPos);
    
        // 随机碎片图
        const sprite = frag.getComponent(Sprite);
        sprite.spriteFrame =
            this.fragmentFrames[Math.floor(Math.random() * this.fragmentFrames.length)];
    
        // 随机缩放（偏小更真实）
        const scale = 0.5 + Math.random() * 0.4;
        frag.setScale(scale, scale, 1);
    
        // 👉 改这里：方向参数
        const vx = (Math.random() - 0.5) * 60;     // 左右轻微散开
        const upVy = 60 + Math.random() * 60;      // 先小弹起
        const downVy = -180 - Math.random() * 120; // 再明显下坠
    
        // 随机旋转
        const rot = (Math.random() - 0.5) * 360;
    
        const opacity = frag.getComponent(UIOpacity);
        opacity.opacity = 255;
        frag.active = true;
    
        // 👉 新动画：弹起 → 下坠 → 消失
        tween(frag)
            .by(0.15, {
                position: new Vec3(vx * 0.2, upVy * 0.2, 0),
                angle: rot * 0.3
            }, { easing: 'quadOut' })
    
            // 2️⃣ 被重力拉下
            .by(0.5, {
                position: new Vec3(vx * 0.4, downVy, 0),
                angle: rot
            }, { easing: 'quadIn' })
    
            // 3️⃣ 回收
            .call(() => {
                opacity.opacity = 255;
                frag.setScale(1, 1, 1);
                frag.setPosition(0, 0, 0);
                frag.angle = 0;
                frag.active = false;
                this.pool.push(frag);
            })
            .start();
    }
    

    onDestroy(): void {
        //PLK.event.off(MessageFlag.SCRATCH_ERASE, this.spawnFragments, this);
        this.pool = [];
    }
}
