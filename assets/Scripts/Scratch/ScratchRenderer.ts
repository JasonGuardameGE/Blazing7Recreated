import { 
    _decorator,
    Node,
    Sprite,
    Texture2D,
    SpriteFrame,
    UITransform,
    Rect,
    Size,
    Vec2,
    Vec3,
} from 'cc';
import { GridCell } from './ScratchTypes';
import { ScratchMask } from './ScratchMask';

const { ccclass } = _decorator;

@ccclass('ScratchRenderer')
export class ScratchRenderer {
    public textureWidth = 0;
    public textureHeight = 0;

    private renderedScratch: Node = null;
    private scratchTextureReference: Texture2D = null;
    private scratchSpriteFrameReference: SpriteFrame = null;

    private mask: ScratchMask | null = null;
    private workingTexture: Texture2D = null;
    private textureData: Uint8Array = null;
    private originalTextureData: Uint8Array = null;
    private currentSpriteFrame: SpriteFrame = null;

    public Init(newScratchMask: ScratchMask, scratchRenderedHolder: Node, textureCover: Sprite) {
        this.renderedScratch = scratchRenderedHolder;

        const spriteFrame = textureCover.spriteFrame;
        if (!spriteFrame) {
            console.error('[ScratchRenderer] spriteFrame is null');
            return;
        }

        const texture = spriteFrame.texture as Texture2D;
        if (!texture) {
            console.error('[ScratchRenderer] texture is null');
            return;
        }

        this.scratchSpriteFrameReference = spriteFrame;
        this.scratchTextureReference = texture;

        this.textureWidth = texture.width;
        this.textureHeight = texture.height;
    }

    public CreateNewRenderedScratch(): boolean {
        if (!this.renderedScratch) {
            console.error('[ScratchRenderer] renderedScratch node is null');
            return false;
        }

        if (!this.scratchTextureReference) {
            console.error('[ScratchRenderer] scratchTextureReference is null');
            return false;
        }

        const data = this.ReadTexturePixels(this.scratchTextureReference);

        if (!data || data.length <= 0) {
            console.error('[ScratchRenderer] Failed to read texture pixels');
            return false;
        }

        this.textureData = new Uint8Array(data);
        this.originalTextureData = new Uint8Array(data);

        const workTex = new Texture2D();
        workTex.reset({
            width: this.textureWidth,
            height: this.textureHeight,
            format: Texture2D.PixelFormat.RGBA8888,
        });

        workTex.uploadData(this.textureData);
        this.workingTexture = workTex;

        const spriteFrame = new SpriteFrame();
        spriteFrame.texture = workTex;
        spriteFrame.rect = new Rect(0, 0, this.textureWidth, this.textureHeight);
        spriteFrame.originalSize = new Size(this.textureWidth, this.textureHeight);
        spriteFrame.offset = new Vec2(0, 0);

        this.currentSpriteFrame = spriteFrame;

        let sprite = this.renderedScratch.getComponent(Sprite);
        if (!sprite) {
            sprite = this.renderedScratch.addComponent(Sprite);
        }

        sprite.spriteFrame = spriteFrame;
        sprite.sizeMode = Sprite.SizeMode.RAW;

        const renderedTransform = this.renderedScratch.getComponent(UITransform)
            || this.renderedScratch.addComponent(UITransform);

        renderedTransform.setContentSize(this.textureWidth, this.textureHeight);

        this.renderedScratch.active = true;

        return true;
    }

    public Destroy() {
        if (this.currentSpriteFrame) {
            this.currentSpriteFrame.destroy();
            this.currentSpriteFrame = null;
        }

        if (this.workingTexture) {
            this.workingTexture.destroy();
            this.workingTexture = null;
        }

        this.textureData = null;
        this.originalTextureData = null;
        this.scratchTextureReference = null;
        this.scratchSpriteFrameReference = null;
        this.renderedScratch = null;

        this.textureWidth = 0;
        this.textureHeight = 0;
    }

    public EraseCircle(cx: number, cy: number, radius: number, applyImmediately: boolean = true): number {
        if (!this.textureData) {
            console.error('[ScratchRenderer] textureData is null');
            return 0;
        }
    
        if (!this.workingTexture) {
            console.error('[ScratchRenderer] workingTexture is null');
            return 0;
        }
    
        const r = Math.floor(radius);
    
        const startX = Math.max(0, Math.floor(cx - r));
        const endX = Math.min(this.textureWidth, Math.ceil(cx + r));
    
        const startY = Math.max(0, Math.floor(cy - r));
        const endY = Math.min(this.textureHeight, Math.ceil(cy + r));
    
        let erasedPixels = 0;
    
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const dx = x - cx;
                const dy = y - cy;
    
                if (dx * dx + dy * dy > r * r) {
                    continue;
                }
    
                const pixelIndex = (y * this.textureWidth + x) * 4;
                const alphaIndex = pixelIndex + 3;
    
                if (this.textureData[alphaIndex] > 0) {
                    this.textureData[alphaIndex] = 0;
                    erasedPixels++;
                }
            }
        }
    
        if (applyImmediately) {
            this.workingTexture.uploadData(this.textureData);
        }
    
        return erasedPixels;
    }

    public EraseCell(gridCell : GridCell){
        if(!this.textureData){
            return;
        }

        const startX = Math.max(0, Math.floor(gridCell.x));
        const endX = Math.min(this.textureWidth, Math.ceil(gridCell.x + gridCell.width));
        const startY = Math.max(0, Math.floor(gridCell.y));
        const endY = Math.min(this.textureHeight, Math.ceil(gridCell.y + gridCell.height));

        for (let py = startY; py < endY; py++) {
            for (let px = startX; px < endX; px++) {
              const idx = (py * this.textureWidth + px) * 4;
              this.textureData[idx + 3] = 0; // 设置 alpha 为 0
              if (this.mask) this.mask.markErased(px, py);
            }
        }
    }

    public async autoScratchDiagonalOptimized(
        x: number,
        y: number,
        width: number,
        height: number,
        brushRadius: number = 45,
        duration: number = 1200
      ): Promise<void> {
        if (!this.textureData) return;
      
        const dx = width;
        const dy = height;
        const len = Math.hypot(dx, dy);
        if (len === 0) return;
      
        const ux = dx / len;
        const uy = dy / len;
      
        const nx = -uy;
        const ny = ux;
      
        const lineSpacing = brushRadius * 1.4;
        const lineCount = Math.ceil((width + height) / lineSpacing);
      
        const frames = Math.ceil(duration / 16.67);
      
        let frame = 0;
        let uploadCounter = 0;
        let effectStepCounter = 0;
      
        const left   = x + brushRadius;
        const right  = x + width  - brushRadius;
        const top    = y + brushRadius;
        const bottom = y + height - brushRadius;
      
        const lines: { startX: number; startY: number }[] = [];
        const offsetStart = -((lineCount - 1) * 0.5) * lineSpacing;
      
        for (let i = 0; i < lineCount; i++) {
          const offset = offsetStart + i * lineSpacing;
      
          const startX = x + nx * offset;
          const startY = y + ny * offset;
      
          lines.push({ startX, startY });
        }
      
        return new Promise(resolve => {
          const step = () => {
            frame++;
            const progress = frame / frames;
            const lineProgress = len * progress;
      
            for (const { startX, startY } of lines) {
              const cx = startX + ux * lineProgress;
              const cy = startY + uy * lineProgress;
    
              if (cx < left || cx > right || cy < top || cy > bottom) {
                continue;
              }
    
              this.EraseCircle(cx, cy, brushRadius, false);
    
              effectStepCounter++;
              if (effectStepCounter % 6 === 0) {
                const worldPos = this.textureToWorld(cx, cy);
                //PLK.event.emit(MessageFlag.SCRATCH_ERASE, { worldPos, count: 1 });
              }
            }
      
            uploadCounter++;
            if (uploadCounter % 2 === 0) {
              this.workingTexture?.uploadData(this.textureData!);
            }
      
            if (frame < frames) {
              requestAnimationFrame(step);
            } else {
              this.workingTexture?.uploadData(this.textureData!);
              resolve();
            }
          };
      
          requestAnimationFrame(step);
        });
    }

    private textureToWorld(cx: number, cy: number): Vec3 {
        if (!this.renderedScratch) {
          return new Vec3();
        }
      
        const uiTransform = this.renderedScratch.getComponent(UITransform)!;
        const uiW = uiTransform.width;
        const uiH = uiTransform.height;
      
        // texture -> local
        const localX = (cx / this.textureWidth) * uiW - uiW / 2;
        const localY = uiH / 2 - (cy / this.textureHeight) * uiH;
        const localPos = new Vec3(localX, localY, 0);
      
        // local -> world
        const worldPos = new Vec3();
        uiTransform.convertToWorldSpaceAR(localPos, worldPos);
        return worldPos;
    }

    private ReadTexturePixels(texture: Texture2D): Uint8Array {
        const imageAsset = texture.image;
        const width = texture.width;
        const height = texture.height;

        const source = imageAsset && (imageAsset as any).data;

        if (source instanceof HTMLCanvasElement) {
            const ctx = source.getContext('2d');
            if (!ctx) {
                console.error('[ScratchRenderer] Failed to get canvas context');
                return this.CreateFallbackTextureData(width, height);
            }

            const imageData = ctx.getImageData(0, 0, width, height);
            return new Uint8Array(imageData.data);
        }

        if (source instanceof ImageData) {
            return new Uint8Array(source.data);
        }

        if (source instanceof HTMLImageElement) {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('[ScratchRenderer] Failed to get canvas context');
                return this.CreateFallbackTextureData(width, height);
            }

            ctx.drawImage(source, 0, 0, width, height);

            try {
                const imageData = ctx.getImageData(0, 0, width, height);
                return new Uint8Array(imageData.data);
            } catch (error) {
                console.error('[ScratchRenderer] Failed to read image pixels. Possible CORS issue.', error);
                return this.CreateFallbackTextureData(width, height);
            }
        }

        console.warn('[ScratchRenderer] Unsupported texture image source. Using fallback white texture.');
        return this.CreateFallbackTextureData(width, height);
    }

    private CreateFallbackTextureData(width: number, height: number): Uint8Array {
        const data = new Uint8Array(width * height * 4);

        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
            data[i + 3] = 255;
        }

        return data;
    }
}