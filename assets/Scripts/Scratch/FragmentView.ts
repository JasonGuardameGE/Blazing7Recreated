import {
    _decorator,
    Component,
    Node,
    Prefab,
    SpriteFrame,
    Vec3,
    tween,
    instantiate,
    Sprite,
    UITransform,
    UIOpacity,
    Tween,
} from 'cc';

const { ccclass, property } = _decorator;

@ccclass('FragmentView')
export class FragmentView extends Component {

    @property({ type: Prefab })
    fragmentPrefab: Prefab = null;

    @property({ type: [SpriteFrame] })
    fragmentFrames: SpriteFrame[] = [];

    private pool: Node[] = [];

    onLoad(): void {
        // PLK.event.on(MessageFlag.SCRATCH_ERASE, this.spawnFragments, this);
    }

    /**
     * Spawn scratch fragments.
     * @param data.worldPos World position where fragments should spawn.
     * @param data.count Number of fragments to spawn.
     */
    public spawnFragments(data: { worldPos: Vec3, count: number }): void {
        if (!data) {
            return;
        }

        const worldPos = data.worldPos;
        const count = Math.max(0, Math.floor(data.count || 0));

        if (!worldPos || count <= 0) {
            return;
        }

        for (let i = 0; i < count; i++) {
            this.spawnOne(worldPos);
        }
    }

    private spawnOne(worldPos: Vec3): void {
        if (!this.fragmentPrefab) {
            console.warn('[FragmentView] fragmentPrefab is null');
            return;
        }

        if (!this.fragmentFrames || this.fragmentFrames.length === 0) {
            console.warn('[FragmentView] fragmentFrames is empty');
            return;
        }

        let frag: Node = null;

        if (this.pool.length > 0) {
            frag = this.pool.pop();
        } else {
            frag = instantiate(this.fragmentPrefab);
        }

        if (!frag) {
            return;
        }

        this.node.addChild(frag);

        Tween.stopAllByTarget(frag);

        // World position to local position.
        const localPos = new Vec3();
        const thisUI = this.node.getComponent(UITransform);

        if (thisUI) {
            thisUI.convertToNodeSpaceAR(worldPos, localPos);
            frag.setPosition(localPos);
        } else {
            frag.setWorldPosition(worldPos);
        }

        // Random fragment sprite.
        const sprite = frag.getComponent(Sprite);

        if (sprite) {
            sprite.spriteFrame =
                this.fragmentFrames[Math.floor(Math.random() * this.fragmentFrames.length)];
        }

        // Random scale.
        const scale = 0.5 + Math.random() * 0.4;
        frag.setScale(scale, scale, 1);

        // Random direction.
        const vx = (Math.random() - 0.5) * 60;
        const upVy = 60 + Math.random() * 60;
        const downVy = -180 - Math.random() * 120;

        // Random rotation.
        const rot = (Math.random() - 0.5) * 360;

        const opacity = frag.getComponent(UIOpacity);

        if (opacity) {
            opacity.opacity = 255;
        }

        frag.angle = 0;
        frag.active = true;

        tween(frag)
            .by(
                0.15,
                {
                    position: new Vec3(vx * 0.2, upVy * 0.2, 0),
                    angle: rot * 0.3,
                },
                { easing: 'quadOut' },
            )
            .by(
                0.5,
                {
                    position: new Vec3(vx * 0.4, downVy, 0),
                    angle: rot,
                },
                { easing: 'quadIn' },
            )
            .call(() => {
                if (opacity) {
                    opacity.opacity = 255;
                }

                frag.setScale(1, 1, 1);
                frag.setPosition(0, 0, 0);
                frag.angle = 0;
                frag.active = false;

                if (frag.parent) {
                    frag.removeFromParent();
                }

                this.pool.push(frag);
            })
            .start();
    }

    onDestroy(): void {
        // PLK.event.off(MessageFlag.SCRATCH_ERASE, this.spawnFragments, this);

        for (const frag of this.pool) {
            if (frag && frag.isValid) {
                frag.destroy();
            }
        }

        this.pool = [];
    }
}