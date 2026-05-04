import {
    _decorator,
    Component,
    Node,
    Sprite,
    UITransform,
    EventTouch,
    Texture2D,
    Vec2,
    Vec3,
    CCFloat,
    UIOpacity,
  } from "cc";
  
  import { ScratchMask } from "./ScratchMask";
  import { ScratchRenderer } from "./ScratchRenderer";
  import { ScratchTrajectoryRecorder } from "./ScratchTrajectory";
  import { GridCell } from "./ScratchTypes";
  //import PLK from "../PLK";
  //import { MessageFlag } from "../manager/MessageFlag";
  import { ScratchSound } from "./ScratchSound";
import { FragmentView } from "./FragmentView";
import { Services } from "../Managers/Services";
import { AudioManager } from "../Managers/AudioManager";
  
  const { ccclass, property } = _decorator;
  
  @ccclass("ScratchSystem")
  export class ScratchSystem extends Component {

    @property(FragmentView)
    fragmentView: FragmentView;

    @property(Sprite)
    coverImage: Sprite = null!;
  
    @property(Node)
    defaultImage: Node = null!;
  
    @property(Node)
    numberContainer: Node = null!;
  
    @property({ type: CCFloat, tooltip: "刮卡笔刷大小" })
    brushSize = 90;
  
    @property({ type: CCFloat, tooltip: "单个格子刮开的阈值，超过这个值则认为刮开" })
    singleErasedAreaThreshold = 30;
  
    public isAutoScratching = false;
    public isAllScratchOver = false;
    public openedCellsIndex: number[] = [];
  
    private scratchMask: ScratchMask | null = null;
    private scratchRenderer: ScratchRenderer | null = null;
    private trajectoryRecorder: ScratchTrajectoryRecorder | null = null;
    private scratchSound: ScratchSound | null = null;
  
    private scratchCount: number = 0;
    private textureWidth = 0;
    private textureHeight = 0;
    private isScratching = false;
    private lastTouchTexPos: Vec2 | null = null;
    private validCells: GridCell[] = [];
    private cellScratched: boolean[] = [];
    private _enableTouchNode = false;
  
    public set enableTouchNode(value: boolean) {
      this._enableTouchNode = value;
    }
  
    public get enableTouchNode(): boolean {
      return this._enableTouchNode;
    }
  
    onLoad() {
      //this.scratchSound = PLK.scratchSound;
      this.scratchSound?.resetScratchSoundState();
    }
  
    start() {
      this.initScratchSystem();
    }
  
    onDestroy() {
      this.clearScratchSystem();
    }
  
    clearScratchSystem() {
      this.disableTouch();
  
      this.scratchRenderer?.destroy();
      this.scratchMask?.destroy();
      this.trajectoryRecorder?.clear();
  
      this.scratchRenderer = null;
      this.scratchMask = null;
      this.trajectoryRecorder = null;
      this.scratchSound = null;
      this.lastTouchTexPos = null;
      this.validCells.length = 0;
      this.cellScratched.length = 0;
      this.openedCellsIndex.length = 0;
    }
  
    private initScratchSystem() {
        this.scratchSound = new ScratchSound();
        this.scratchSound.init(Services.GetService(AudioManager));
        
        this.defaultImage.active = true;
        this.coverImage.node.active = true;  
        this.initializeScratchRendererAndRecorder();
        this.defaultImage.active = false;
        this.calculateValidCellsFromNumberContainer();
        this.enableTouch();
  
      //PLK.gameData.currentCardStatus = "init";
    }
  
    private initializeScratchRendererAndRecorder() {
      if (this.scratchRenderer) return;
  
      const texture = this.coverImage.spriteFrame?.texture as Texture2D;
      if (!texture) {
        console.error("[ScratchSystem] Missing cover texture");
        return;
      }
  
      this.textureWidth = texture.width;
      this.textureHeight = texture.height;
  
      this.scratchMask = new ScratchMask();
      this.scratchMask.setTextureSize(this.textureWidth, this.textureHeight);
  
      this.scratchRenderer = new ScratchRenderer();
      this.scratchRenderer.init(this.coverImage, texture, this.scratchMask, this.fragmentView);
  
      this.trajectoryRecorder = new ScratchTrajectoryRecorder();
    }
  
    private calculateValidCellsFromNumberContainer() {
      if (!this.scratchMask) return;
  
      const coverUI = this.coverImage.getComponent(UITransform);
      if (!coverUI) return;
  
      const coverW = coverUI.width;
      const coverH = coverUI.height;
  
      this.validCells = this.numberContainer.children.map((child) => {
        const ui = child.getComponent(UITransform)!;
        const local = coverUI.convertToNodeSpaceAR(child.worldPosition);
  
        const texX = ((local.x + coverW / 2) / coverW) * this.textureWidth;
        const texY = ((coverH / 2 - local.y) / coverH) * this.textureHeight;
        const texW = (ui.width / coverW) * this.textureWidth;
        const texH = (ui.height / coverH) * this.textureHeight;
  
        return {
          row: 0,
          col: 0,
          x: texX - texW / 2,
          y: texY - texH / 2,
          width: texW,
          height: texH,
          valid: true,
        };
      });
  
      this.scratchMask.setCells(this.validCells);
      this.cellScratched = new Array(this.validCells.length).fill(false);
    }
  
    private enableTouch() {
      this.disableTouch();
      this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
      this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
      this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
      this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
  
    private disableTouch() {
      this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
      this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
      this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
      this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
  
    private canScratch(): boolean {
      return (
        this._enableTouchNode &&
        !this.isAutoScratching &&
        !this.isAllScratchOver &&
        !!this.scratchRenderer &&
        !!this.trajectoryRecorder
      );
    }
  
    private onTouchStart(e: EventTouch) {
      if (!this.canScratch()) return;
  
      //PLK.ticketData.inProgress = true;
      this.isScratching = true;
  
      const texPos = this.getTextureXYFromTouch(e);
      const eraseArea = this.scratchRenderer!.eraseCircle(texPos.x, texPos.y, this.brushSize / 2);
      const count = this.scratchCount++;
  
      this.lastTouchTexPos = texPos;
      this.trajectoryRecorder!.startManual(this.brushSize * 2);
      this.trajectoryRecorder!.recordStartPoint(texPos.x, texPos.y, 0, count);
  
      this.emitScratchEraseIfNeeded(e, texPos);
      this.scratchSound?.playScratchSound(Node.EventType.TOUCH_START, false, eraseArea);
  
      //PLK.event.emit(MessageFlag.SCARTCH_CARD_STATE_CHANGE, "start");
    }
  
    private onTouchMove(e: EventTouch) {
      if (!this.isScratching || !this.lastTouchTexPos || !this.canScratch()) return;
  
      const texPos = this.getTextureXYFromTouch(e);
  
      const eraseArea = this.scratchRenderer!.eraseLine(
        this.lastTouchTexPos.x,
        this.lastTouchTexPos.y,
        texPos.x,
        texPos.y,
        this.brushSize / 2,
      );
  
      const count = this.scratchCount++;
  
      this.emitScratchEraseIfNeeded(e, texPos);
      this.scratchSound?.playScratchSound(Node.EventType.TOUCH_MOVE, false, eraseArea);
      this.trajectoryRecorder!.recordPoint(texPos.x, texPos.y, 0, count);
  
      this.lastTouchTexPos = texPos;
      this.checkIndividualCells();
    }
  
    private onTouchEnd(e: EventTouch) {
      if (!this.isScratching || !this._enableTouchNode) return;
  
      this.isScratching = false;
      this.lastTouchTexPos = null;
  
      this.scratchSound?.playScratchSound(Node.EventType.TOUCH_END, false, 0);
      this.trajectoryRecorder?.stop(false);
      this.checkIndividualCells();
  
      //PLK.event.emit(MessageFlag.SCARTCH_CARD_STATE_CHANGE, "end");
    }
  
    private emitScratchEraseIfNeeded(e: EventTouch, texPos: Vec2) {
      //if (PLK.gameData.deviceLevel === "low") return;
      if (this.isCellAlreadyScratchedByTexPos(texPos)) return;
  
      this.fragmentView.spawnFragments(
        {
            worldPos: this.getWorldPosFromTouch(e),
            count: 3,
        })
    }
  
    private checkIndividualCells() {
      if (!this.scratchMask) return;
  
      let openedCount = 0;
  
      for (let i = 0; i < this.validCells.length; i++) {
        if (this.cellScratched[i]) {
          openedCount++;
          continue;
        }
  
        if (this.scratchMask.getCellPercent(i) < this.singleErasedAreaThreshold) {
          continue;
        }
  
        this.openCell(i);
        openedCount++;
      }
  
      if (openedCount >= this.validCells.length) {
        //PLK.gameData.currentCardStatus = "over";
        this.markScratchOver();
      }
    }
  
    private openCell(index: number) {
      if (this.cellScratched[index]) return;
  
      this.cellScratched[index] = true;
      this.openedCellsIndex.push(index);
  
      this.autoScratchIndex(index, true);
      //PLK.event.emit(MessageFlag.CHECK_WIN_ITEM, index);
    }
  
    private getTextureXYFromTouch(e: EventTouch): Vec2 {
      const uiTransform = this.coverImage.node.getComponent(UITransform)!;
      const location = e.getUILocation();
      const localPos = uiTransform.convertToNodeSpaceAR(new Vec3(location.x, location.y, 0));
  
      return new Vec2(
        ((localPos.x + uiTransform.width / 2) / uiTransform.width) * this.textureWidth,
        ((uiTransform.height / 2 - localPos.y) / uiTransform.height) * this.textureHeight,
      );
    }
  
    private getWorldPosFromTouch(e: EventTouch): Vec3 {
      const uiTransform = this.coverImage.node.getComponent(UITransform)!;
      const location = e.getUILocation();
      const localPos = uiTransform.convertToNodeSpaceAR(new Vec3(location.x, location.y, 0));
      const worldPos = new Vec3();
  
      uiTransform.convertToWorldSpaceAR(localPos, worldPos);
      return worldPos;
    }
  
    private isCellAlreadyScratchedByTexPos(texPos: Vec2): boolean {
      const index = this.validCells.findIndex(
        (cell) =>
          texPos.x >= cell.x &&
          texPos.x <= cell.x + cell.width &&
          texPos.y >= cell.y &&
          texPos.y <= cell.y + cell.height,
      );
  
      return index >= 0 && this.cellScratched[index];
    }
  
    get trajectory() {
      return this.trajectoryRecorder?.getTrajectory();
    }
  
    scratchWithPos(position: { x: number; y: number; count: number }) {
      this.scratchRenderer?.eraseCircle(position.x, position.y, this.brushSize / 2);
    }
  
    hasinit(): boolean {
      return !!this.scratchMask && !!this.scratchRenderer;
    }
  
    hideCover() {
      this.defaultImage.active = false;
    }
  
    showCover() {
      this.defaultImage.active = true;
    }
  
    getWordPos(x: number, y: number): Vec3 {
      const uiTransform = this.coverImage.node.getComponent(UITransform)!;
  
      const localPos = new Vec3(
        (x / this.textureWidth) * uiTransform.width - uiTransform.width / 2,
        uiTransform.height / 2 - (y / this.textureHeight) * uiTransform.height,
        0,
      );
  
      const worldPos = new Vec3();
      uiTransform.convertToWorldSpaceAR(localPos, worldPos);
  
      return worldPos;
    }
  
    isOpenedCell(cellIndex: number): boolean {
      return !!this.cellScratched[cellIndex];
    }
  
    getAllCells(): boolean[] {
      return this.cellScratched;
    }
  
    getAllOpenedCells(): boolean[] {
      return this.cellScratched.filter(Boolean);
    }
  
    public markScratchOver() {
      if (this.isAllScratchOver) return;
  
      if (!this.scratchRenderer) {
        this.initializeScratchRendererAndRecorder();
      }
  
      this.scratchRenderer?.eraseAll();
      this.isAllScratchOver = true;
  
      //PLK.event.emit(MessageFlag.SCRATCH_OVER, this.node.name);
    }
  
    scratchAll() {
      this.scratchRenderer?.eraseAll();
      this.cellScratched.fill(true);
      this.openedCellsIndex.length = 0;
      this.markScratchOver();
    }
  
    public resetScratch() {
      this.isScratching = false;
      this.isAutoScratching = false;
      this.isAllScratchOver = false;
      this.lastTouchTexPos = null;
      this.openedCellsIndex.length = 0;
  
      this.scratchRenderer?.resetFullOpaque();
      this.scratchMask?.reset();
      this.trajectoryRecorder?.clear();
      this.coverImage?.markForUpdateRenderData();
  
      this.cellScratched.fill(false);
    }
  
    hideCoverImage() {
      this.defaultImage.active = false;
      this.coverImage.getComponent(UIOpacity)!.opacity = 0;
    }
  
    showCoverImage() {
      this.defaultImage.active = false;
      this.coverImage.getComponent(UIOpacity)!.opacity = 255;
    }
  
    async autoScratchIndex(
      index: number,
      useAnimation = false,
      duration = 450,
      playSound = true,
    ): Promise<void> {
      const cell = this.validCells[index];
      if (!cell || !this.scratchRenderer) return;
  
      const isLowDevice = "low";//PLK.gameData.deviceLevel === "low";
      const shouldAnimate = useAnimation && duration > 0 && !isLowDevice;
  
      if (playSound && !isLowDevice) {
        this.scratchSound?.playAutoScratchSound(true);
      }
  
      if (shouldAnimate) {
        await this.scratchRenderer.autoScratchDiagonalOptimized(
          cell.x,
          cell.y,
          cell.width,
          cell.height,
          this.brushSize / 4,
          duration,
        );
      }
  
      this.scratchRenderer.eraseRect(cell.x, cell.y, cell.width, cell.height);
      this.cellScratched[index] = true;
    }
  
    async autoScratchMultiple(
      indices: number[],
      useAnimation = false,
      duration = 400,
      parallel = false,
    ): Promise<void> {
      if (parallel) {
        await Promise.all(indices.map((index) => this.autoScratchIndex(index, useAnimation, duration)));
        return;
      }
  
      for (const index of indices) {
        await this.autoScratchIndex(index, useAnimation, duration);
      }
    }
  }