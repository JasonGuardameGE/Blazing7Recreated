// ScratchRenderer.ts
import { Sprite, SpriteFrame, Texture2D, Rect, Size, Vec2, Vec3, UITransform } from "cc";
import { ScratchMask } from "./ScratchMask";
import { FragmentView } from "./FragmentView";
//import { MessageFlag } from "../manager/MessageFlag";
//import PLK from "../PLK";

export class ScratchRenderer {
  public textureWidth = 0;
  public textureHeight = 0;

  private workingTexture: Texture2D | null = null;
  private textureData: Uint8Array | null = null;
  private mask: ScratchMask | null = null;
  private coverSprite: Sprite | null = null;
  private originalTextureData: Uint8Array | null = null;
  private currentSpriteFrame: SpriteFrame | null = null;

  private fragmentView: FragmentView = null;

  constructor() {}


  destroy() {
    // 1. 销毁 SpriteFrame + 内部纹理
    if (this.currentSpriteFrame) {
        if (this.currentSpriteFrame.texture) {
            // 销毁 GPU 纹理
            this.currentSpriteFrame.texture.destroy();
        }
        this.currentSpriteFrame.destroy();
        this.currentSpriteFrame = null;
    }

    // 2. 销毁 workingTexture （自己创建的）
    if (this.workingTexture) {
        this.workingTexture.destroy();
        this.workingTexture = null;
    }

    // 3. 清理 CPU 层数据
    this.textureData = null;
    this.originalTextureData = null;

    // 4. 解绑 Sprite
    if (this.coverSprite) {
        this.coverSprite.spriteFrame = null;
    }
    this.coverSprite = null;

    // 5. 销毁 mask（如果你加入 destroy 方法）
    if (this.mask && typeof this.mask.destroy === "function") {
        this.mask.destroy();
    }
    this.mask = null;

    // 6. 清理尺寸
    this.textureWidth = 0;
    this.textureHeight = 0;
}


  /** 初始化：传入 coverImage、原始纹理、掩码 */
  init(coverSprite: Sprite, srcTexture: Texture2D, mask: ScratchMask, fragmentView : FragmentView) {
    this.coverSprite = coverSprite;
    this.mask = mask;

    this.textureWidth = srcTexture.width;
    this.textureHeight = srcTexture.height;

    this.fragmentView = fragmentView;

    this.mask.setTextureSize(this.textureWidth, this.textureHeight);

    // 读取像素
    const data = this.readTexturePixels(srcTexture);
    this.textureData = data;
    this.originalTextureData = new Uint8Array(data);
    // 创建可写纹理
    const workTex = new Texture2D();
    workTex.reset({
      width: this.textureWidth,
      height: this.textureHeight,
      format: Texture2D.PixelFormat.RGBA8888,
    });
    workTex.uploadData(data);
    this.workingTexture = workTex;

    // 绑到 Sprite 上
    const sf = new SpriteFrame();
    sf.texture = workTex;
    sf.rect = new Rect(0, 0, this.textureWidth, this.textureHeight);
    sf.originalSize = new Size(this.textureWidth, this.textureHeight);
    sf.offset = new Vec2(0, 0);

    this.coverSprite.spriteFrame = sf;
    this.coverSprite.sizeMode = Sprite.SizeMode.RAW;
    this.currentSpriteFrame = sf;
  }

  private readTexturePixels(tex: Texture2D): Uint8Array {
    const imgAsset = tex.image;
    const w = tex.width;
    const h = tex.height;
    const src = imgAsset && (imgAsset as any).data;
    let data: Uint8Array;

    if (src instanceof HTMLCanvasElement) {
      const ctx = src.getContext("2d")!;
      const imgData = ctx.getImageData(0, 0, w, h);
      data = new Uint8Array(imgData.data);
      return data;
    }

    if (src instanceof ImageData) {
      data = new Uint8Array(src.data);
      return data;
    }

    if (src instanceof HTMLImageElement) {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(src, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      data = new Uint8Array(imgData.data);
      return data;
    }

    console.warn("[ScratchRenderer] readTexturePixels fallback white");
    data = new Uint8Array(w * h * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
    return data;
  }

  /** 圆形擦除 + 记录到 Mask
   * @param applyImmediately 是否立刻上传到纹理（频繁调用时建议传 false，自行控制上传频率）
   */
  eraseCircle(cx: number, cy: number, radius: number, applyImmediately: boolean = true) {
    if (!this.textureData) return 0;
    const r = Math.floor(radius);
    const startX = Math.max(0, Math.floor(cx - r));
    const endX = Math.min(this.textureWidth, Math.ceil(cx + r));
    const startY = Math.max(0, Math.floor(cy - r));
    const endY = Math.min(this.textureHeight, Math.ceil(cy + r));

    let erased = 0;

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy > r * r) continue;

        const idx = (y * this.textureWidth + x) * 4;
        if (this.textureData[idx + 3] > 0) {
          this.textureData[idx + 3] = 0;
          erased++;
          if (this.mask) this.mask.markErased(x, y);
        }
      }
    }

    if (applyImmediately) {
      this.workingTexture?.uploadData(this.textureData);
    }
    return erased;
  }

  /** 线段擦除（用圆叠加）
   * @param applyImmediately 是否立刻上传到纹理（频繁调用时建议传 false，自行控制上传频率）
   */
  eraseLine(x0: number, y0: number, x1: number, y1: number, radius: number, applyImmediately: boolean = true) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const step = Math.max(1, radius * 0.5);
    const steps = Math.max(1, Math.ceil(dist / step));

    let totalErased = 0;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x0 + dx * t;
      const y = y0 + dy * t;
      totalErased += this.eraseCircle(x, y, radius, false);
    }

    if (applyImmediately && this.textureData) {
      this.workingTexture?.uploadData(this.textureData);
    }
    return totalErased;
  }

  /** 擦除指定矩形区域（格子） */
  eraseRect(x: number, y: number, width: number, height: number) {
    if (!this.textureData) return;
    
    const startX = Math.max(0, Math.floor(x));
    const endX = Math.min(this.textureWidth, Math.ceil(x + width));
    const startY = Math.max(0, Math.floor(y));
    const endY = Math.min(this.textureHeight, Math.ceil(y + height));

    for (let py = startY; py < endY; py++) {
      for (let px = startX; px < endX; px++) {
        const idx = (py * this.textureWidth + px) * 4;
        this.textureData[idx + 3] = 0; // 设置 alpha 为 0
        if (this.mask) this.mask.markErased(px, py);
        
      }
    }

    this.workingTexture?.uploadData(this.textureData);
  }

  // ScratchRenderer.ts 中增加一个工具方法
private textureToWorld(cx: number, cy: number): Vec3 {
  if (!this.coverSprite) {
    return new Vec3();
  }

  const uiTransform = this.coverSprite.node.getComponent(UITransform)!;
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


  async autoScratchDiagonalOptimized(
    x: number,
    y: number,
    width: number,
    height: number,
    brushRadius: number = 45,
    duration: number = 1200
  ): Promise<void> {
    if (!this.textureData) return;
  
    // --- 方向向量（左上 → 右下）
    const dx = width;
    const dy = height;
    const len = Math.hypot(dx, dy);
    if (len === 0) return;
  
    const ux = dx / len;
    const uy = dy / len;
  
    // --- 法向量（平行线偏移）
    const nx = -uy;
    const ny = ux;
  
    const lineSpacing = brushRadius * 1.4;
    const lineCount = Math.ceil((width + height) / lineSpacing);
  
    const frames = Math.ceil(duration / 16.67);
  
    let frame = 0;
    let uploadCounter = 0;
    // 控制特效触发频率：每 3 次有效擦除触发一次
    let effectStepCounter = 0;
  
    // ✅ 为了不让笔刷中心越界，可以适当“缩”一点有效区域
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

          // ⛔️ 如果中心点不在目标矩形范围内 → 跳过，不擦
          if (cx < left || cx > right || cy < top || cy > bottom) {
            continue;
          }

          this.eraseCircle(cx, cy, brushRadius, false);

          // 每 3 步触发一次世界坐标事件，避免频率过高
          effectStepCounter++;
          if (effectStepCounter % 6 === 0) {
            const curWorldPos = this.textureToWorld(cx, cy);
            
            this.fragmentView.spawnFragments({
              worldPos: curWorldPos,
              count: 1
            });

            //PLK.event.emit(MessageFlag.SCRATCH_ERASE, { curWorldPos, count: 1 });
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
  
  
  /** 延迟辅助函数 */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** 整个涂层擦掉 */
  eraseAll() {
    if (!this.textureData) return;
    for (let i = 3; i < this.textureData.length; i += 4) {
      this.textureData[i] = 0;
    }
    this.workingTexture?.uploadData(this.textureData);
  }

  /** 整体覆盖率（alpha==0 的像素占比） */
  getTotalCoveragePercent(): number {
    if (!this.textureData) return 0;
    const totalPixels = this.textureWidth * this.textureHeight;
    let erased = 0;
    for (let i = 3; i < this.textureData.length; i += 4) {
      if (this.textureData[i] === 0) erased++;
    }
    return (erased / totalPixels) * 100;
  }

  /** 完全重置（重新上一张卡用） */
  resetFullOpaque() {
    if (!this.textureData) return;
    this.textureData.set(this.originalTextureData);

    this.workingTexture?.uploadData(this.textureData);

    if (this.mask) this.mask.reset();
  }

 
}
