import { _decorator, Component, sys } from 'cc';

const { ccclass } = _decorator;

export enum PerformanceTier {
    LOW = 0,
    MEDIUM = 1,
    HIGH = 2,
}

export type QualitySettings = {
    tier: PerformanceTier;

    // FRAGMENTS
    maxFragments: number;
    fragmentsPerScratch: number;
    enableFragmentsDuringScratchAll: boolean;

    // SCRATCH
    scratchUpdateIntervalMs: number;
    scratchAllCellsPerFrame: number;

    /**
     * Auto scratch renderer optimization.
     *
     * Higher value = fewer texture uploads = smoother FPS.
     * Lower value = smoother visual reveal, but more expensive.
     *
        Example:
        LOW    = upload every 3 frames
        MEDIUM = upload every 2 frames
        HIGH   = upload every 2 frames
     */
    autoScratchUploadEveryFrames: number;

    /**
     * Full cell cleanup optimization.
     *
     * Lower value = spreads erase work across more frames.
     * Higher value = finishes faster, but can spike FPS.
     *
     * Example:
     * LOW    = erase 3 circles, then upload
     * MEDIUM = erase 5 circles, then upload
     * HIGH   = erase 8 circles, then upload
     */
    scratchFullErasePerFrame: number;

    // WIN POPUP / COINS
    coinFlyCountMultiplier: number;

    // GENERAL FX
    enableBackgroundEffects: boolean;
    enableLoopingSpineEffects: boolean;

    // WINNER BROADCAST POPUP
    winnerBroadcastUseFade: boolean;
    winnerBroadcastFadeDuration: number;
    winnerBroadcastVisibleDuration: number;
};

@ccclass('DevicePerformanceManager')
export class DevicePerformanceManager extends Component {

    public static Instance: DevicePerformanceManager | null = null;

    public Tier: PerformanceTier = PerformanceTier.MEDIUM;
    public Settings: QualitySettings = DevicePerformanceManager.GetMediumSettings();

    private frameSamples: number[] = [];
    private fpsCheckTimer: number = 0;

    protected onLoad(): void {
        DevicePerformanceManager.Instance = this;

        this.Tier = this.detectInitialTier();
        this.Settings = this.getSettingsForTier(this.Tier);

        console.log(
            '[DevicePerformanceManager] Initial tier:',
            PerformanceTier[this.Tier],
            this.Settings,
        );
    }

    protected onDestroy(): void {
        if (DevicePerformanceManager.Instance === this) {
            DevicePerformanceManager.Instance = null;
        }

        this.frameSamples.length = 0;
    }

    protected update(dt: number): void {
        this.collectFpsSample(dt);
    }

    private detectInitialTier(): PerformanceTier {
        const isMobile = sys.isMobile;
        const cpuThreads = navigator.hardwareConcurrency || 4;
        const deviceMemory = (navigator as any).deviceMemory || 4;
        const dpr = window.devicePixelRatio || 1;

        let score = 0;

        if (!isMobile) {
            score += 2;
        }

        if (cpuThreads >= 8) {
            score += 2;
        } else if (cpuThreads >= 4) {
            score += 1;
        }

        if (deviceMemory >= 8) {
            score += 2;
        } else if (deviceMemory >= 4) {
            score += 1;
        }

        /**
         * High DPR mobile screens are more expensive.
         */
        if (dpr >= 3 && isMobile) {
            score -= 1;
        }

        if (score >= 5) {
            return PerformanceTier.HIGH;
        }

        if (score >= 3) {
            return PerformanceTier.MEDIUM;
        }

        return PerformanceTier.LOW;
    }

    private collectFpsSample(dt: number): void {
        if (dt <= 0) {
            return;
        }

        this.fpsCheckTimer += dt;

        const fps = 1 / dt;
        this.frameSamples.push(fps);

        if (this.frameSamples.length > 120) {
            this.frameSamples.shift();
        }

        /**
         * Check average FPS every 3 seconds.
         */
        if (this.fpsCheckTimer < 3) {
            return;
        }

        this.fpsCheckTimer = 0;
        this.adjustTierByRuntimeFps();
    }

    private adjustTierByRuntimeFps(): void {
        if (this.frameSamples.length < 60) {
            return;
        }

        const averageFps = this.getAverageFps();

        /**
         * Downgrade if runtime FPS is struggling.
         */
        if (averageFps < 48 && this.Tier > PerformanceTier.LOW) {
            this.setTier(this.Tier - 1);
            return;
        }

        /**
         * Keep auto-upgrade disabled for now.
         * Auto-upgrade can cause quality to bounce during gameplay.
         */
        if (averageFps > 58 && this.Tier < PerformanceTier.HIGH) {
            // this.setTier(this.Tier + 1);
        }
    }

    private getAverageFps(): number {
        let total = 0;

        for (const fps of this.frameSamples) {
            total += fps;
        }

        return total / this.frameSamples.length;
    }

    public setTier(tier: PerformanceTier): void {
        if (this.Tier === tier) {
            return;
        }

        this.Tier = tier;
        this.Settings = this.getSettingsForTier(tier);

        console.log(
            '[DevicePerformanceManager] Changed tier:',
            PerformanceTier[this.Tier],
            this.Settings,
        );
    }

    private getSettingsForTier(tier: PerformanceTier): QualitySettings {
        switch (tier) {
            case PerformanceTier.LOW:
                return DevicePerformanceManager.GetLowSettings();

            case PerformanceTier.HIGH:
                return DevicePerformanceManager.GetHighSettings();

            case PerformanceTier.MEDIUM:
            default:
                return DevicePerformanceManager.GetMediumSettings();
        }
    }

    public static GetLowSettings(): QualitySettings {
        return {
            tier: PerformanceTier.LOW,
    
            maxFragments: 20,
            fragmentsPerScratch: 1,
            enableFragmentsDuringScratchAll: true,
    
            scratchUpdateIntervalMs: 50,
            scratchAllCellsPerFrame: 4,
    
            // Keep this low enough so diagonal still looks diagonal.
            autoScratchUploadEveryFrames: 2,
    
            // This is where we spread heavier cleanup work.
            scratchFullErasePerFrame: 3,
    
            coinFlyCountMultiplier: 0.5,
    
            enableBackgroundEffects: false,
            enableLoopingSpineEffects: false,
    
            winnerBroadcastUseFade: false,
            winnerBroadcastFadeDuration: 0,
            winnerBroadcastVisibleDuration: 2.25,
        };
    }
    
    public static GetMediumSettings(): QualitySettings {
        return {
            tier: PerformanceTier.MEDIUM,
    
            maxFragments: 40,
            fragmentsPerScratch: 2,
            enableFragmentsDuringScratchAll: true,
    
            scratchUpdateIntervalMs: 33,
            scratchAllCellsPerFrame: 8,
    
            // Medium should still look smooth.
            autoScratchUploadEveryFrames: 2,
    
            // Cleanup batching still saves FPS.
            scratchFullErasePerFrame: 5,
    
            coinFlyCountMultiplier: 0.75,
    
            enableBackgroundEffects: true,
            enableLoopingSpineEffects: true,
    
            winnerBroadcastUseFade: true,
            winnerBroadcastFadeDuration: 0.2,
            winnerBroadcastVisibleDuration: 2.75,
        };
    }
    
    public static GetHighSettings(): QualitySettings {
        return {
            tier: PerformanceTier.HIGH,
    
            maxFragments: 80,
            fragmentsPerScratch: 3,
            enableFragmentsDuringScratchAll: true,
    
            scratchUpdateIntervalMs: 16,
            scratchAllCellsPerFrame: 16,
    
            autoScratchUploadEveryFrames: 2,
            scratchFullErasePerFrame: 8,
    
            coinFlyCountMultiplier: 1,
    
            enableBackgroundEffects: true,
            enableLoopingSpineEffects: true,
    
            winnerBroadcastUseFade: true,
            winnerBroadcastFadeDuration: 0.35,
            winnerBroadcastVisibleDuration: 3,
        };
    }
}