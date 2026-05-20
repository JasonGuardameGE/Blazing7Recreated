import {
  _decorator,
  Component,
  sys,
  AudioClip,
  AudioSource,
  CCFloat,
} from 'cc';

import ResourceManager from './ResourceManager';
import { Services } from '../Managers/Services';

const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {

  private readonly SOUND_ENABLED_KEY = 'sound';
  private readonly BGM_ENABLED_KEY = 'music';

  private resourceManager: ResourceManager | null = null;

  // Background Music
  @property({ type: CCFloat, range: [0, 1], slide: true })
  private backgroundVolume: number = 0.5;

  // Sound Effects
  @property(AudioSource)
  private effectAudioSource: AudioSource | null = null;

  @property({ type: CCFloat, range: [0, 1], slide: true })
  private effectVolume: number = 1.0;

  // Audio Toggles
  private isMutedEffect: boolean = false;
  private isMutedBackground: boolean = false;

  // Scratch Sound Settings
  private readonly SCRATCH_SOUND_NAME: string = 'scratch';

  private readonly MANUAL_SCRATCH_INTERVAL_MS: number = 250;
  private readonly MANUAL_SCRATCH_DURATION_MS: number = 300;

  private readonly AUTO_SCRATCH_INTERVAL_MS: number = 400;
  private readonly AUTO_SCRATCH_DURATION_MS: number = 300;

  // Scratch Sound State
  private lastManualScratchPlayTime: number = 0;
  private manualScratchPlayStartTime: number = 0;
  private isManualScratchSoundPlaying: boolean = false;

  private lastAutoScratchPlayTime: number = 0;
  private autoScratchPlayStartTime: number = 0;
  private isAutoScratchSoundPlaying: boolean = false;

  public Init(): void {
      this.resourceManager = Services.GetService(ResourceManager);
  }

  public async playEffectByName(fileName: string): Promise<void> {
      if (!this.canPlaySoundEffects()) {
          return;
      }

      try {
          const resourceManager = this.getResourceManager();
          const clip = await resourceManager.GetAudioClip(`mp3/${fileName}`);

          if (!clip) {
              console.warn(`[AudioManager] Missing audio clip: mp3/${fileName}`);
              return;
          }

          this.playEffect(clip as AudioClip);
      } catch (error) {
          console.error(`[AudioManager] Failed to load audio effect: ${fileName}`, error);
      }
  }

  public playEffect(clip: AudioClip, volume: number = this.effectVolume): void {
      if (this.isMutedEffect) {
          return;
      }

      if (!this.effectAudioSource) {
          console.error('[AudioManager] effectAudioSource is not assigned.');
          return;
      }

      this.effectAudioSource.playOneShot(clip, volume);
  }

  public playScratchEffectOneShot(): void {
      this.tryPlayScratchSound({
          intervalMs: this.MANUAL_SCRATCH_INTERVAL_MS,
          durationMs: this.MANUAL_SCRATCH_DURATION_MS,
          lastPlayTime: this.lastManualScratchPlayTime,
          playStartTime: this.manualScratchPlayStartTime,
          isPlaying: this.isManualScratchSoundPlaying,
          onPlay: (currentTime) => {
              this.lastManualScratchPlayTime = currentTime;
              this.manualScratchPlayStartTime = currentTime;
              this.isManualScratchSoundPlaying = true;

              this.scheduleOnce(() => {
                  this.isManualScratchSoundPlaying = false;
              }, this.MANUAL_SCRATCH_DURATION_MS / 1000);
          },
      });
  }

  public playAutoScratchSound(): void {
      this.tryPlayScratchSound({
          intervalMs: this.AUTO_SCRATCH_INTERVAL_MS,
          durationMs: this.AUTO_SCRATCH_DURATION_MS,
          lastPlayTime: this.lastAutoScratchPlayTime,
          playStartTime: this.autoScratchPlayStartTime,
          isPlaying: this.isAutoScratchSoundPlaying,
          onPlay: (currentTime) => {
              this.lastAutoScratchPlayTime = currentTime;
              this.autoScratchPlayStartTime = currentTime;
              this.isAutoScratchSoundPlaying = true;

              this.scheduleOnce(() => {
                  this.isAutoScratchSoundPlaying = false;
              }, this.AUTO_SCRATCH_DURATION_MS / 1000);
          },
      });
  }

  public playScratchEffectLongShot(): void {
      this.playEffectByName(this.SCRATCH_SOUND_NAME);
  }

  private tryPlayScratchSound(data: {
      intervalMs: number;
      durationMs: number;
      lastPlayTime: number;
      playStartTime: number;
      isPlaying: boolean;
      onPlay: (currentTime: number) => void;
  }): void {
      const currentTime = Date.now();

      const timeSinceLastPlay = currentTime - data.lastPlayTime;
      const timeSincePlayStarted = currentTime - data.playStartTime;

      const isStillPlaying =
          data.isPlaying &&
          timeSincePlayStarted < data.durationMs;

      if (timeSinceLastPlay < data.intervalMs || isStillPlaying) {
          return;
      }

      this.playScratchEffectLongShot();
      data.onPlay(currentTime);
  }

  private canPlaySoundEffects(): boolean {
      const isSoundDisabledInStorage =
          sys.localStorage.getItem(this.SOUND_ENABLED_KEY) === 'false';

      return !isSoundDisabledInStorage && !this.isMutedEffect;
  }

  private getResourceManager(): ResourceManager {
      if (!this.resourceManager) {
          this.resourceManager = Services.GetService(ResourceManager);
      }

      return this.resourceManager;
  }
}