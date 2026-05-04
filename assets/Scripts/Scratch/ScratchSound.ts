import { _decorator, Component, Node, EventTouch } from "cc";
import { AudioManager } from "../Managers/AudioManager";

const { ccclass, property } = _decorator;
@ccclass("ScratchSound")
export class ScratchSound {
  private lastScratchTime = 0; // 上次刮卡时间
  private lastEraseTime = 0; // 上次擦除时间
  private lastEraseArea = 0; // 上次擦除面积
  private readonly MIN_ERASE_AREA = 1; // 最小擦除面积阈值（只要有擦除就播放）
  private readonly SOUND_INTERVAL = 250; // 音效播放间隔（0.2秒 = 200ms）
  private readonly AUTO_SCRATCH_SOUND_INTERVAL = 400; // 音效播放间隔（毫秒）
  

  private audioManager: AudioManager = null;

  // Sound FX:
  private lastAutoScratchSoundTime: number = 0;
  private autoScratchSoundPlayStartTime: number = 0;

  public init(newAudioManager: AudioManager): void{
    this.resetScratchSoundState();
    this.audioManager = newAudioManager;
  }

  public playScratchSound(
    eventType: string,
    isAuto = false,
    eraseArea = 0
  ): void {
    const currentTime = Date.now();

    if (eventType === Node.EventType.TOUCH_START) {
      // 开始刮卡，停止之前的音效
      this.lastScratchTime = currentTime;
      this.lastEraseTime = currentTime;
      this.lastEraseArea = eraseArea;

      // TOUCH_START 时，如果有擦除就立即播放音效
      if (eraseArea > this.MIN_ERASE_AREA) {
        // logger.log(`[PikaYourNumbersScratchRenderTexture] TOUCH_START 播放音效，擦除面积: ${eraseArea}`);
        this.playSingleScratchSound(isAuto);
        this.lastEraseTime = currentTime; // 更新播放时间
      }
      return;
    }

    if (eventType === Node.EventType.TOUCH_MOVE) {
      // 移动时，如果产生擦除且距离上次播放 >= 0.25s，就播放音效
      if (eraseArea > this.MIN_ERASE_AREA) {
        if (currentTime - this.lastEraseTime >= this.SOUND_INTERVAL) {
          // logger.log(`[PikaYourNumbersScratchRenderTexture] TOUCH_MOVE 播放音效，擦除面积: ${eraseArea}, 间隔: ${currentTime - this.lastEraseTime}ms`);
          this.playSingleScratchSound(isAuto);
          this.lastEraseTime = currentTime; // 更新播放时间
        }
      }
    }

    if (
      eventType === Node.EventType.TOUCH_END ||
      eventType === Node.EventType.TOUCH_CANCEL
    ) {
      // 结束刮卡，停止音效播放
      this.resetScratchSoundState();
    }
  }

  /**
   * 播放单次刮卡音效
   */
  private playSingleScratchSound(isAuto: boolean): void {
    if (isAuto) {
      this.audioManager.playAutoScratchSound();
    } else {
      AudioManager.getInstance().playScratchEffectOneShot();
    }
  }

  /**
   * 重置音效播放状态
   */
  public resetScratchSoundState() {
    this.lastScratchTime = 0;
  }

  /**
   * 播放自动刮卡音效（带状态控制）
   */
  public playAutoScratchSound(isAuto = false) {
    const currentTime = Date.now();

    // 检查时间间隔，避免音效重叠
    if (currentTime - this.lastScratchTime > this.AUTO_SCRATCH_SOUND_INTERVAL) {
      if (isAuto) {
        AudioManager.getInstance().playAutoScratchSound();
      } else {
        AudioManager.getInstance().playScratchEffectOneShot();
      }
      this.lastScratchTime = currentTime;
    }
  }
}
