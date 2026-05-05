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

const { ccclass, property } = _decorator;

@ccclass('ScratchSystem')
export class ScratchSystem extends Component {

    @property({
        type: [EventHandler],
        tooltip: 'Called once all scratch cells are scratched.',
    })
    allCardScratchedCallbacks: EventHandler[] = [];

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

    @property([Node])
    scratchNumberNodes: Node[] = [];

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
    }

    public ResetScratchCard(): void {
        this.GenerateScratchRenderer();
    }

    public ToggleTouch(toggle: boolean): void {
        if (toggle) {
            this.enableTouch();
        } else {
            this.disableTouch();
        }
    }

    public GenerateScratchRenderer(): void {
        if (!this.scratchRenderer) {
            console.error('[ScratchSystem] scratchRenderer is null');
            return;
        }

        this.isTouched = false;
        this.isAllScratched = false;

        const success = this.scratchRenderer.CreateNewRenderedScratch();

        console.log(`[ScratchSystem] GenerateScratchRenderer Result: ${success}`);

        if (success && this.defaultScratchCover) {
            this.defaultScratchCover.node.active = false;
            this.calculateGridCellContainers();
        }
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

        console.log(`[ScratchSystem] Calculated ${cells.length} scratch cells.`);
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
        if (this.isAllScratched) {
            return;
        }

        this.isTouched = true;
        this.OnTouchUpdate(e);
    }

    private onTouchMove(e: EventTouch): void {
        if (!this.isTouched || this.isAllScratched) {
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

            console.log(
                `[ScratchSystem] Cell ${closestCellIndex} scratched. Percent: ${percent.toFixed(2)}`,
            );

            this.CheckScratchProgress();
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

    private async autoScratchCell(index: number): Promise<void> {
        if (!this.scratchRenderer) {
            return;
        }

        if (index < 0 || index >= this.validCells.length) {
            return;
        }

        const cell = this.validCells[index];
        const duration: number = 450;

        await this.scratchRenderer.autoScratchDiagonalOptimized(
            cell.x,
            cell.y,
            cell.width + 20,
            cell.height + 20,
            this.brushSize / 5,
            duration,
        );
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