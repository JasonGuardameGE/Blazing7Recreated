import {
    _decorator,
    Component,
    EventTouch,
    Node,
    Sprite,
    CCFloat,
    Vec2,
    UITransform,
    Vec3,
    EventHandler,
} from 'cc';

import { ScratchRenderer } from './ScratchRenderer';
import { GridCell } from './ScratchTypes';
import { ScratchMask } from './ScratchMask';
import { FragmentView } from './FragmentView';
import { AudioManager } from '../Managers/AudioManager';
import { Services } from '../Managers/Services';
import { HelpView } from '../UI/VisualFx/HelpView';

const { ccclass, property } = _decorator;

@ccclass('ScratchSystem')
export class ScratchSystem extends Component {

    onCardNumberScratchedCallbacks: EventHandler[] = [];

    allCardScratchedCallbacks: EventHandler[] = [];

    @property({
        type: CCFloat,
        tooltip: 'Delay between each cell when ScratchAll is used.',
    })
    scratchAllInterval: number = 0.12;

    @property(FragmentView)
    fragmentView: FragmentView = null;

    @property(Sprite)
    defaultScratchCover: Sprite = null;

    @property(Node)
    scratchRenderedHolder: Node = null;

    @property({
        type: CCFloat,
        tooltip: 'Scratch brush size.',
    })
    brushSize: number = 90;

    @property({
        type: CCFloat,
        tooltip: 'Erase percentage needed for a single cell to be considered scratched.',
    })
    singleErasedAreaThreshold: number = 5;

    @property({
        type: CCFloat,
        tooltip: 'How many random fragment positions to spawn per cell when ScratchAll is used.',
    })
    scratchAllFragmentsPerCell: number = 3;

    @property({
        type: CCFloat,
        tooltip: 'How many fragments to spawn per random position when ScratchAll is used.',
    })
    scratchAllFragmentsPerBurst: number = 1;

    @property([Node])
    scratchNumberNodes: Node[] = [];

    // ADDED AFK DETECTION
    private helpView: HelpView;
    set HelpView(value:HelpView){
        this.helpView = value;
    }

    private validCells: GridCell[] = [];
    private cellScratched: boolean[] = [];

    // MASK AND RENDERER
    private scratchMask: ScratchMask = null;
    private scratchRenderer: ScratchRenderer = null;

    // LOCAL VALUE REFERENCE
    private textureWidth: number = 0;
    private textureHeight: number = 0;

    private isTouched: boolean = false;
    
    private isAllScratched: boolean = false;
    get IsAllScratched(): boolean {
        return this.isAllScratched;
    }

    private isAutoScratching: boolean = false;

    private isGeneratingScratch: boolean = false;
    get IsGeneratingScratch(): boolean {
        return this.isGeneratingScratch;
    }

    private scratchSessionId: number = 0;

    private _audioManager: AudioManager;
    
    protected onLoad(): void {
        if (!this.defaultScratchCover || !this.defaultScratchCover.spriteFrame) {
            console.error('[ScratchSystem] defaultScratchCover or spriteFrame is null');
            return;
        }

        const spriteFrame = this.defaultScratchCover.spriteFrame;
        const texture = spriteFrame.texture;

        if (!texture) {
            console.error('[ScratchSystem] defaultScratchCover texture is null');
            return;
        }

        this.textureWidth = texture.width;
        this.textureHeight = texture.height;

        if (!this.scratchMask) {
            this.scratchMask = new ScratchMask();
            this.scratchMask.setTextureSize(this.textureWidth, this.textureHeight);
        }

        this.scratchRenderer = new ScratchRenderer();
        this.scratchRenderer.Init(
            this.scratchMask,
            this.scratchRenderedHolder,
            this.defaultScratchCover,
        );
    }

    protected start(): void {
        this.GenerateScratchRenderer();
        this._audioManager = Services.GetService(AudioManager);
    }

    public async ResetScratchCard(): Promise<void> {
        await this.GenerateScratchRenderer();
    }

    public ToggleTouch(toggle: boolean): void {
        if (toggle) {
            this.enableTouch();
        } else {
            this.disableTouch();
        }
    }

    public async GenerateScratchRenderer(): Promise<boolean> {
        if (this.isGeneratingScratch) {
            return false;
        }
    
        if (!this.scratchRenderer) {
            console.error('[ScratchSystem] scratchRenderer is null');
            return false;
        }
    
        this.scratchSessionId++;
        const sessionId = this.scratchSessionId;
    
        this.isGeneratingScratch = true;
    
        try {
            this.isTouched = false;
            this.isAllScratched = false;
            this.isAutoScratching = false;
    
            const success = this.scratchRenderer.CreateNewRenderedScratch();
    
            if (!success) {
                return false;
            }
    
            await this.waitOneFrame();
    
            if (sessionId !== this.scratchSessionId) {
                return false;
            }
    
            if (this.defaultScratchCover) {
                this.defaultScratchCover.node.active = false;
            }
    
            this.calculateGridCellContainers();
    
            return true;
        } finally {
            if (sessionId === this.scratchSessionId) {
                this.isGeneratingScratch = false;
            }
        }
    }

    public async ScratchAll(): Promise<void> {
        if (this.isAllScratched || this.isAutoScratching) {
            return;
        }
    
        if (!this.cellScratched || this.cellScratched.length === 0) {
            return;
        }
    
        const sessionId = this.scratchSessionId;
        const unscratchedIndexes: number[] = [];
    
        for (let i = 0; i < this.cellScratched.length; i++) {
            if (!this.cellScratched[i]) {
                unscratchedIndexes.push(i);
            }
        }
    
        if (unscratchedIndexes.length === 0) {
            return;
        }
    
        this.isAutoScratching = true;
        this.isTouched = false;
        this.disableTouch();
    
        if (this._audioManager) {
            this._audioManager.playAutoScratchSound();
        }
    
        try {
            for (const index of unscratchedIndexes) {
                if (sessionId !== this.scratchSessionId) {
                    return;
                }
    
                if (this.isAllScratched) {
                    break;
                }
    
                if (this.cellScratched[index]) {
                    continue;
                }
    
                this.cellScratched[index] = true;
    
                this.spawnScratchAllFragmentsForCell(index);
                
                this.autoScratchCell(index, sessionId);
    
                if (sessionId !== this.scratchSessionId) {
                    return;
                }
    
                await this.waitSeconds(this.scratchAllInterval);
    
                if (sessionId !== this.scratchSessionId) {
                    return;
                }
            }
        } finally {
            if (sessionId === this.scratchSessionId) {
                this.isAutoScratching = false;
                this.CheckScratchProgress();
            }
        }
    }

    public CancelScratchAll(): void {
        this.scratchSessionId++;
        this.isAutoScratching = false;
        this.isTouched = false;
        this.unscheduleAllCallbacks();
        this.disableTouch();
    }

    private spawnScratchAllFragmentsForCell(cellIndex: number): void {
        if (!this.fragmentView) {
            return;
        }

        if (cellIndex < 0 || cellIndex >= this.validCells.length) {
            return;
        }

        const burstCount = Math.max(0, Math.floor(this.scratchAllFragmentsPerCell));
        const fragmentsPerBurst = Math.max(0, Math.floor(this.scratchAllFragmentsPerBurst));

        if (burstCount <= 0 || fragmentsPerBurst <= 0) {
            return;
        }

        for (let i = 0; i < burstCount; i++) {
            const worldPos = this.getRandomWorldPositionInsideCell(cellIndex);

            if (!worldPos) {
                continue;
            }

            this.fragmentView.spawnFragments({
                worldPos,
                count: fragmentsPerBurst,
            });
        }
    }

    private getRandomWorldPositionInsideCell(cellIndex: number): Vec3 | null {
        if (!this.scratchRenderedHolder) {
            return null;
        }

        if (cellIndex < 0 || cellIndex >= this.validCells.length) {
            return null;
        }

        const coverUI = this.scratchRenderedHolder.getComponent(UITransform);

        if (!coverUI) {
            return null;
        }

        const cell = this.validCells[cellIndex];

        const randomTexX = cell.x + Math.random() * cell.width;
        const randomTexY = cell.y + Math.random() * cell.height;

        const localX =
            (randomTexX / this.textureWidth) * coverUI.width -
            coverUI.width / 2;

        const localY =
            coverUI.height / 2 -
            (randomTexY / this.textureHeight) * coverUI.height;

        const worldPos = new Vec3();

        coverUI.convertToWorldSpaceAR(
            new Vec3(localX, localY, 0),
            worldPos,
        );

        return worldPos;
    }

    private waitSeconds(seconds: number): Promise<void> {
        return new Promise((resolve) => {
            this.scheduleOnce(() => {
                resolve();
            }, Math.max(0, seconds));
        });
    }
    
    private calculateGridCellContainers(): void {
        if (!this.scratchMask) {
            console.error('[ScratchSystem] scratchMask is null');
            return;
        }

        if (!this.scratchRenderedHolder) {
            console.error('[ScratchSystem] scratchRenderedHolder is null');
            return;
        }

        const coverUI = this.scratchRenderedHolder.getComponent(UITransform);
        if (!coverUI) {
            console.error('[ScratchSystem] scratchRenderedHolder is missing UITransform');
            return;
        }

        const cells: GridCell[] = [];

        const coverW = coverUI.width;
        const coverH = coverUI.height;

        for (let i = 0; i < this.scratchNumberNodes.length; i++) {
            const n = this.scratchNumberNodes[i];

            if (!n) {
                continue;
            }

            const ui = n.getComponent(UITransform);
            if (!ui) {
                console.warn(`[ScratchSystem] scratchNumberNodes[${i}] is missing UITransform`);
                continue;
            }

            const world = n.worldPosition;
            const local = coverUI.convertToNodeSpaceAR(world);

            const texX = ((local.x + coverW / 2) / coverW) * this.textureWidth;
            const texY = ((coverH / 2 - local.y) / coverH) * this.textureHeight;

            const texW = (ui.width / coverW) * this.textureWidth;
            const texH = (ui.height / coverH) * this.textureHeight;

            cells.push({
                row: 0,
                col: 0,
                x: texX - texW / 2,
                y: texY - texH / 2,
                width: texW,
                height: texH,
                valid: true,
            });
        }

        this.validCells = cells;
        this.scratchMask.setCells(cells);

        this.cellScratched = new Array(cells.length).fill(false);
    }

    //#region TOUCH RELATED CODE

    private enableTouch(): void {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private disableTouch(): void {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private onTouchStart(e: EventTouch): void {
        if (this.isAllScratched || this.isAutoScratching) {
            return;
        }

        this.isTouched = true;
        this.OnTouchUpdate(e);

        this.helpView?.resetCountdown();
        const texPos = this.getTextureXYFromTouch(e);
        this.scratchRenderer.EraseCircle(texPos.x, texPos.y, this.brushSize / 2);
    }

    private onTouchMove(e: EventTouch): void {
        if (!this.isTouched || this.isAllScratched || this.isAutoScratching) {
            return;
        }

        this.OnTouchUpdate(e);
    }

    private onTouchEnd(e: EventTouch): void {
        this.isTouched = false;
    }

    private OnTouchUpdate(e: EventTouch): void {
        if (!this.scratchRenderer) {
            return;
        }

        const texPos = this.getTextureXYFromTouch(e);

        this.scratchRenderer.EraseCircle(
            texPos.x,
            texPos.y,
            this.brushSize / 2,
        );

        const worldPos = this.getWorldPositionFromTouch(e);
        this.checkCellInLastPosition(worldPos);

        if (this._audioManager) {
            this._audioManager.playScratchEffectOneShot();
        }
    }

    private checkCellInLastPosition(worldPosition: Vec3): void {
        const closestCellIndex = this.getClosestCellIndexFromWorldPosition(worldPosition);

        if (closestCellIndex < 0) {
            return;
        }

        if (this.cellScratched[closestCellIndex]) {
            return;
        }

        if (!this.scratchMask) {
            return;
        }

        const percent = this.scratchMask.getCellPercent(closestCellIndex);

        if (percent >= this.singleErasedAreaThreshold) {
            this.cellScratched[closestCellIndex] = true;
            this.autoScratchCell(closestCellIndex);

            this.CheckScratchProgress();
        }
        
        if (this.fragmentView) {
            this.fragmentView.spawnFragments({
                worldPos: worldPosition,
                count: 1,
            });
        }
    }

    private CheckScratchProgress(): void {
        if (this.isAllScratched) {
            return;
        }

        if (!this.cellScratched || this.cellScratched.length === 0) {
            return;
        }

        const allScratched = this.cellScratched.every((isScratched) => isScratched);

        if (!allScratched) {
            return;
        }

        this.isAllScratched = true;
        this.isTouched = false;

        this.disableTouch();

        console.log('[ScratchSystem] All cells scratched.');

        EventHandler.emitEvents(this.allCardScratchedCallbacks, this);
    }

    private async autoScratchCell(index: number, sessionId: number = this.scratchSessionId): Promise<void> {
        if (sessionId !== this.scratchSessionId) {
            return;
        }
    
        if (!this.scratchRenderer) {
            return;
        }
    
        if (index < 0 || index >= this.validCells.length) {
            return;
        }
    
        const cell = this.validCells[index];
        const duration: number = 450;
    
        EventHandler.emitEvents(this.onCardNumberScratchedCallbacks, index);
    
        await this.scratchRenderer.autoScratchDiagonalOptimized(
            cell.x,
            cell.y,
            cell.width + 20,
            cell.height + 20,
            this.brushSize / 5,
            duration,
        );
    
        if (sessionId !== this.scratchSessionId) {
            return;
        }
    
        await this.eraseFullCell(index, sessionId);
    }

    private async eraseFullCell(index: number, sessionId: number = this.scratchSessionId): Promise<void> {
        if (sessionId !== this.scratchSessionId) {
            return;
        }
    
        if (!this.scratchRenderer) {
            return;
        }
    
        if (index < 0 || index >= this.validCells.length) {
            return;
        }
    
        const cell = this.validCells[index];
    
        const padding = 10;
        const eraseRadius = this.brushSize / 2;
    
        const startX = cell.x - padding;
        const startY = cell.y - padding;
        const endX = cell.x + cell.width + padding;
        const endY = cell.y + cell.height + padding;
    
        const step = Math.max(eraseRadius * 0.75, 8);
    
        let eraseCount = 0;
        const erasePerFrame = 8;
    
        for (let y = startY; y <= endY; y += step) {
            for (let x = startX; x <= endX; x += step) {
                if (sessionId !== this.scratchSessionId) {
                    return;
                }
    
                this.scratchRenderer.EraseCircle(
                    x,
                    y,
                    eraseRadius,
                );
    
                eraseCount++;
    
                if (eraseCount >= erasePerFrame) {
                    eraseCount = 0;
                    await this.waitOneFrame();
    
                    if (sessionId !== this.scratchSessionId) {
                        return;
                    }
                }
            }
        }
    }
    
    private waitOneFrame(): Promise<void> {
        return new Promise((resolve) => {
            this.scheduleOnce(() => {
                resolve();
            }, 0);
        });
    }

    private getWorldPositionFromTouch(e: EventTouch): Vec3 {
        const uiTransform = this.scratchRenderedHolder.getComponent(UITransform)!;

        const localPos = uiTransform.convertToNodeSpaceAR(
            new Vec3(e.getUILocation().x, e.getUILocation().y, 0),
        );

        const worldPos = new Vec3();
        uiTransform.convertToWorldSpaceAR(localPos, worldPos);

        return worldPos;
    }

    private getClosestCellIndexFromWorldPosition(worldPosition: Vec3): number {
        if (!this.scratchNumberNodes || this.scratchNumberNodes.length === 0) {
            return -1;
        }

        let closestIndex = -1;
        let closestDistanceSqr = Number.MAX_VALUE;

        for (let i = 0; i < this.scratchNumberNodes.length; i++) {
            const node = this.scratchNumberNodes[i];

            if (!node) {
                continue;
            }

            const nodeWorldPosition = node.worldPosition;

            const dx = worldPosition.x - nodeWorldPosition.x;
            const dy = worldPosition.y - nodeWorldPosition.y;

            const distanceSqr = dx * dx + dy * dy;

            if (distanceSqr < closestDistanceSqr) {
                closestDistanceSqr = distanceSqr;
                closestIndex = i;
            }
        }

        return closestIndex;
    }

    private getTextureXYFromTouch(e: EventTouch): Vec2 {
        const uiTransform = this.scratchRenderedHolder.getComponent(UITransform)!;

        const localPos = uiTransform.convertToNodeSpaceAR(
            new Vec3(e.getUILocation().x, e.getUILocation().y, 0),
        );

        const x =
            ((localPos.x + uiTransform.width / 2) / uiTransform.width) *
            this.textureWidth;

        const y =
            ((uiTransform.height / 2 - localPos.y) / uiTransform.height) *
            this.textureHeight;

        return new Vec2(x, y);
    }

    //#endregion
}