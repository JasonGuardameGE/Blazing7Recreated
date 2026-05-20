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
    Tween,
    CCInteger,
    CCBoolean,
} from 'cc';

import { DevicePerformanceManager } from '../Managers/DevicePerformanceManager';

const { ccclass, property } = _decorator;

type FragmentItem = {
    node: Node;
    sprite: Sprite | null;

    /**
     * Reused tween offsets.
     * Avoids creating new Vec3 objects every spawn.
     */
    upOffset: Vec3;
    downOffset: Vec3;
};

@ccclass('FragmentView')
export class FragmentView extends Component {

    @property({ type: Prefab })
    fragmentPrefab: Prefab | null = null;

    @property({ type: [SpriteFrame] })
    fragmentFrames: SpriteFrame[] = [];

    @property(CCInteger)
    private initialPoolSize: number = 40;

    @property(CCInteger)
    private maxPoolSize: number = 80;

    @property(CCInteger)
    private warmupPerFrame: number = 8;

    /**
     * Recommended: false.
     * Runtime instantiate during scratching can cause FPS spikes.
     */
    @property(CCBoolean)
    private allowRuntimeInstantiate: boolean = false;

    /**
     * Recommended: true.
     * Prewarms up to DevicePerformanceManager.Settings.maxFragments.
     */
    @property(CCBoolean)
    private prewarmToMaxPoolSize: boolean = true;

    /**
     * Used only when DevicePerformanceManager is missing.
     */
    @property(CCInteger)
    private fallbackFragmentsPerScratch: number = 2;

    private pool: FragmentItem[] = [];
    private allItems: FragmentItem[] = [];

    private activeCount: number = 0;

    private cachedUITransform: UITransform | null = null;
    private tempLocalPos: Vec3 = new Vec3();

    private hasWarnedMissingPrefab: boolean = false;
    private hasWarnedMissingFrames: boolean = false;

    protected onLoad(): void {
        this.cachedUITransform = this.node.getComponent(UITransform);

        this.applyDevicePerformanceSettings();

        const preloadCount = this.prewarmToMaxPoolSize
            ? this.maxPoolSize
            : this.initialPoolSize;

        this.preloadFragmentsGradually(preloadCount);
    }

    /**
     * Spawn scratch fragments.
     * @param data.worldPos World position where fragments should spawn.
     * @param data.count Number of fragments requested by caller.
     */
    public spawnFragments(data: { worldPos: Vec3; count: number }): void {
        if (!data || !data.worldPos) {
            return;
        }

        if (!this.hasValidSetup()) {
            return;
        }

        /**
         * DevicePerformanceManager can change quality while playing,
         * so read this dynamically instead of only onLoad.
         */
        this.applyDevicePerformanceSettings();

        const requestedCount = Math.max(0, Math.floor(data.count || 0));
        const qualityCount = this.getFragmentsPerScratch();

        const count = Math.min(requestedCount, qualityCount);

        if (count <= 0) {
            return;
        }

        for (let i = 0; i < count; i++) {
            this.spawnOne(data.worldPos);
        }
    }

    /**
     * Use this for Scratch All.
     * DevicePerformanceManager can disable Scratch All fragments on LOW/MEDIUM.
     */
    public spawnFragmentsForScratchAll(data: { worldPos: Vec3; count: number }): void {
        const settings = DevicePerformanceManager.Instance?.Settings;

        if (settings && !settings.enableFragmentsDuringScratchAll) {
            return;
        }

        this.spawnFragments(data);
    }

    private spawnOne(worldPos: Vec3): void {
        const item = this.getFragmentFromPool();

        if (!item) {
            return;
        }

        const frag = item.node;

        this.setFragmentPosition(frag, worldPos);
        this.setRandomSprite(item);
        this.setRandomScale(frag);

        frag.angle = 0;
        frag.active = true;

        this.activeCount++;

        const vx = (Math.random() - 0.5) * 60;
        const upVy = 60 + Math.random() * 60;
        const downVy = -180 - Math.random() * 120;
        const rot = (Math.random() - 0.5) * 360;

        item.upOffset.set(
            vx * 0.2,
            upVy * 0.2,
            0,
        );

        item.downOffset.set(
            vx * 0.4,
            downVy,
            0,
        );

        tween(frag)
            .by(
                0.15,
                {
                    position: item.upOffset,
                    angle: rot * 0.3,
                },
                { easing: 'quadOut' },
            )
            .by(
                0.5,
                {
                    position: item.downOffset,
                    angle: rot,
                },
                { easing: 'quadIn' },
            )
            .call(() => {
                this.recycleFragment(item);
            })
            .start();
    }

    private applyDevicePerformanceSettings(): void {
        const settings = DevicePerformanceManager.Instance?.Settings;

        if (!settings) {
            this.initialPoolSize = Math.min(this.initialPoolSize, this.maxPoolSize);
            return;
        }

        this.maxPoolSize = Math.max(0, settings.maxFragments);

        this.initialPoolSize = Math.min(
            this.initialPoolSize,
            this.maxPoolSize,
        );
    }

    private getFragmentsPerScratch(): number {
        const settings = DevicePerformanceManager.Instance?.Settings;

        if (!settings) {
            return Math.max(0, this.fallbackFragmentsPerScratch);
        }

        return Math.max(0, settings.fragmentsPerScratch);
    }

    private getCurrentMaxActiveFragments(): number {
        const settings = DevicePerformanceManager.Instance?.Settings;

        if (!settings) {
            return this.maxPoolSize;
        }

        return Math.max(0, settings.maxFragments);
    }

    private preloadFragmentsGradually(totalCount: number): void {
        if (!this.hasValidSetup()) {
            return;
        }

        const targetCount = Math.min(
            Math.max(0, totalCount),
            this.maxPoolSize,
        );

        if (targetCount <= 0) {
            return;
        }

        let created = 0;

        const createBatch = () => {
            const remaining = targetCount - created;

            if (remaining <= 0) {
                this.unschedule(createBatch);
                return;
            }

            const batchCount = Math.min(
                Math.max(1, this.warmupPerFrame),
                remaining,
            );

            for (let i = 0; i < batchCount; i++) {
                const item = this.createFragmentItem();

                if (!item) {
                    continue;
                }

                this.pool.push(item);
                this.allItems.push(item);
                created++;
            }

            if (created >= targetCount) {
                this.unschedule(createBatch);
            }
        };

        this.schedule(createBatch, 0);
    }

    private getFragmentFromPool(): FragmentItem | null {
        const currentMaxActiveFragments = this.getCurrentMaxActiveFragments();

        /**
         * This limits how many can be active at once,
         * even if the pool contains more from an earlier higher tier.
         */
        if (this.activeCount >= currentMaxActiveFragments) {
            return null;
        }

        if (this.pool.length > 0) {
            return this.pool.pop();
        }

        if (!this.allowRuntimeInstantiate) {
            return null;
        }

        if (this.allItems.length >= this.maxPoolSize) {
            return null;
        }

        const item = this.createFragmentItem();

        if (item) {
            this.allItems.push(item);
        }

        return item;
    }

    private createFragmentItem(): FragmentItem | null {
        if (!this.fragmentPrefab) {
            if (!this.hasWarnedMissingPrefab) {
                this.hasWarnedMissingPrefab = true;
                console.warn('[FragmentView] fragmentPrefab is null.');
            }

            return null;
        }

        const node = instantiate(this.fragmentPrefab);

        node.active = false;
        node.setPosition(0, 0, 0);
        node.setScale(1, 1, 1);
        node.angle = 0;

        /**
         * Important:
         * Keep fragment under the same parent forever.
         * Do not add/remove parent during gameplay.
         */
        this.node.addChild(node);

        return {
            node,
            sprite: node.getComponent(Sprite),
            upOffset: new Vec3(),
            downOffset: new Vec3(),
        };
    }

    private recycleFragment(item: FragmentItem): void {
        const frag = item.node;

        if (!frag || !frag.isValid) {
            this.activeCount = Math.max(0, this.activeCount - 1);
            return;
        }

        frag.active = false;
        frag.setPosition(0, 0, 0);
        frag.setScale(1, 1, 1);
        frag.angle = 0;

        this.activeCount = Math.max(0, this.activeCount - 1);

        this.pool.push(item);
    }

    private setFragmentPosition(frag: Node, worldPos: Vec3): void {
        if (this.cachedUITransform) {
            this.cachedUITransform.convertToNodeSpaceAR(worldPos, this.tempLocalPos);
            frag.setPosition(this.tempLocalPos);
            return;
        }

        frag.setWorldPosition(worldPos);
    }

    private setRandomSprite(item: FragmentItem): void {
        if (!item.sprite || this.fragmentFrames.length === 0) {
            return;
        }

        const randomIndex = Math.floor(Math.random() * this.fragmentFrames.length);
        item.sprite.spriteFrame = this.fragmentFrames[randomIndex];
    }

    private setRandomScale(frag: Node): void {
        const scale = 0.5 + Math.random() * 0.4;
        frag.setScale(scale, scale, 1);
    }

    private hasValidSetup(): boolean {
        if (!this.fragmentPrefab) {
            if (!this.hasWarnedMissingPrefab) {
                this.hasWarnedMissingPrefab = true;
                console.warn('[FragmentView] fragmentPrefab is null.');
            }

            return false;
        }

        if (!this.fragmentFrames || this.fragmentFrames.length === 0) {
            if (!this.hasWarnedMissingFrames) {
                this.hasWarnedMissingFrames = true;
                console.warn('[FragmentView] fragmentFrames is empty.');
            }

            return false;
        }

        return true;
    }

    protected onDestroy(): void {
        this.unscheduleAllCallbacks();

        for (const item of this.allItems) {
            if (!item || !item.node || !item.node.isValid) {
                continue;
            }

            Tween.stopAllByTarget(item.node);
            item.node.destroy();
        }

        this.pool.length = 0;
        this.allItems.length = 0;
        this.activeCount = 0;
    }
}