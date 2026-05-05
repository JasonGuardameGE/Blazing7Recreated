// ScratchMask.ts
import { GridCell } from './ScratchTypes';

export class ScratchMask {

    public cells: GridCell[] = [];
    private cellTotalPixels: number[] = [];
    private cellErasedPixelSet: Set<string>[] = [];

    texWidth = 0;
    texHeight = 0;

    constructor() {}

    destroy() {
        this.cells = [];
        this.cellErasedPixelSet = [];
        this.cellTotalPixels = [];
        this.texWidth = 0;
        this.texHeight = 0;
    }
    

    setTextureSize(w: number, h: number) {
        this.texWidth = w;
        this.texHeight = h;
    }

    setCells(cells: GridCell[]) {
        this.cells = cells || [];
        this.cellTotalPixels = [];
        this.cellErasedPixelSet = [];

        for (let i = 0; i < this.cells.length; i++) {
            const c = this.cells[i];
            const total = Math.max(1, Math.floor(c.width) * Math.floor(c.height));
            this.cellTotalPixels.push(total);
            this.cellErasedPixelSet.push(new Set());
        }
    }

    findCellIndex(px: number, py: number): number {
        for (let i = 0; i < this.cells.length; i++) {
            const c = this.cells[i];
            if (
                px >= c.x && px < c.x + c.width &&
                py >= c.y && py < c.y + c.height
            ) {
                return i;
            }
        }
        return -1;
    }

    markErased(px: number, py: number) {
        const idx = this.findCellIndex(px, py);
        if (idx === -1) return;

        const key = `${px},${py}`;
        this.cellErasedPixelSet[idx].add(key);
    }

    getCellPercent(index: number): number {
        if (index < 0 || index >= this.cellTotalPixels.length) return 0;
        return this.cellErasedPixelSet[index].size / this.cellTotalPixels[index] * 100;
    }

    areAllCellsDone(thresholdPercent: number): boolean {
        for (let i = 0; i < this.cellTotalPixels.length; i++) {
            if (this.getCellPercent(i) < thresholdPercent) return false;
        }
        return true;
    }

    reset() {
        for (let i = 0; i < this.cellErasedPixelSet.length; i++) {
            this.cellErasedPixelSet[i].clear();
        }
    }
}
