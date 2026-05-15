import { _decorator,
    Component, 
    sys, 
    AudioClip, 
    AudioSource,
    CCFloat
} from 'cc';
import ResourceManager from './ResourceManager';
import { Services } from '../Managers/Services';

const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {

    private readonly SOUND_ENABLED_KEY = "sound";
    private readonly BGM_ENABLED_KEY = "music";

    private resourceManager: ResourceManager;

    // BACKGROUND
    @property({ type: CCFloat, range: [0, 1], slide: true })
    private backgroundVolume: number = .5;

    // EFFECTS
    @property(AudioSource)
    private effectAudioSource: AudioSource;
    @property({ type: CCFloat, range: [0, 1], slide: true })
    private effectVolume: number = 1.0;

    // TOGGLES
    private isMutedEffect: boolean = false;
    private isMutedBackground: boolean = false;

    // SCRATCHCARD FX
    private isAutoScratchSoundPlaying: boolean = false;
    private readonly AUTO_SCRATCH_SOUND_DURATION: number = 300;
    private readonly AUTO_SCRATCH_SOUND_INTERVAL: number = 400;
    private lastAutoScratchSoundTime: number = 0;
    private autoScratchSoundPlayStartTime: number = 0; // 自动刮卡音效开始播放的时间

    private lastScratchSoundTime: number = 0;
    private readonly SCRATCH_SOUND_INTERVAL: number = 250; // 手动刮卡音效间隔（毫秒），与组件内部保持一致
    private scratchSoundCallCount: number = 0; // 调用次数统计
    private scratchSoundPlayCount: number = 0; // 实际播放次数统计
    private scratchSoundSkipCount: number = 0; // 跳过次数统计
    private isScratchSoundPlaying: boolean = false; // 音效是否正在播放
    private scratchSoundPlayStartTime: number = 0; // 音效开始播放的时间
    private readonly SCRATCH_SOUND_DURATION: number = 300; // 音效持续时间（毫秒），用于判断是否还在播放

    public Init(): void{
        this.resourceManager = Services.GetService(ResourceManager);
    }

    public async playEffectByName(fileName: string) {
        let isMuted = sys.localStorage.getItem(this.SOUND_ENABLED_KEY) == "false";
        if (isMuted) return;
    
        try {
            if(!this.resourceManager){
                this.resourceManager = Services.GetService(ResourceManager);
            }
          
            const clip = await this.resourceManager.GetAudioClip(`mp3/${fileName}`);
          
            if (clip) {
                this.playEffect(clip as AudioClip);
            }else{
                console.warn(`[AudioManager] Trying To Play: ${fileName}, but clip is missing from mp3 folder`);
            }
        } catch (error) {
          console.error(`Failed to load audio effect: ${fileName}`, error);
        }  
    }

    playEffect(clip: AudioClip, volume: number = this.effectVolume) {
        if (this.isMutedEffect) return;
    
        if (!this.effectAudioSource) {
            console.error('[AudioManager] effectAudioSource is null');
            return;
        }
    
        this.effectAudioSource.playOneShot(clip, volume);
    }

    public playAutoScratchSound(): void {
        const currentTime = Date.now();
        const timeSinceLastPlay = currentTime - this.lastAutoScratchSoundTime;
    
        // 检查音效是否还在播放中（基于时间判断）
        const timeSincePlayStart = currentTime - this.autoScratchSoundPlayStartTime;
        const isStillPlaying = this.isAutoScratchSoundPlaying && timeSincePlayStart < this.AUTO_SCRATCH_SOUND_DURATION;
    
        // 双重检查：时间间隔 + 播放状态
        if (timeSinceLastPlay > this.AUTO_SCRATCH_SOUND_INTERVAL && !isStillPlaying) {
          this.playScratchEffectLongShot();
          this.lastAutoScratchSoundTime = currentTime;
          this.autoScratchSoundPlayStartTime = currentTime;
          this.isAutoScratchSoundPlaying = true;
    
          // 设置标志位，在音效持续时间后重置
          this.scheduleOnce(() => {
            this.isAutoScratchSoundPlaying = false;
          }, this.AUTO_SCRATCH_SOUND_DURATION / 1000); // 转换为秒
    
          // logger.log(`[AudioManager] playAutoScratchSound - 播放音效 | 距离上次: ${timeSinceLastPlay}ms`);
        } else {
          const reason = isStillPlaying ? '音效还在播放中' : '间隔太短';
          // logger.log(`[AudioManager] playAutoScratchSound - 跳过播放（${reason}） | 距离上次: ${timeSinceLastPlay}ms, 需要间隔: ${this.AUTO_SCRATCH_SOUND_INTERVAL}ms, 播放中: ${isStillPlaying}`);
        }
    }

    public playScratchEffectOneShot() {
        const currentTime = Date.now();
        const timeSinceLastPlay = currentTime - this.lastScratchSoundTime;
    
        this.scratchSoundCallCount++;
    
        const timeSincePlayStart = currentTime - this.scratchSoundPlayStartTime;
        const isStillPlaying = this.isScratchSoundPlaying && timeSincePlayStart < this.SCRATCH_SOUND_DURATION;
    
        if (timeSinceLastPlay >= this.SCRATCH_SOUND_INTERVAL && !isStillPlaying) {
          this.playEffectByName('scratch');
          this.lastScratchSoundTime = currentTime;
          this.scratchSoundPlayStartTime = currentTime;
          this.isScratchSoundPlaying = true;
          this.scratchSoundPlayCount++;
    
          this.scheduleOnce(() => {
            this.isScratchSoundPlaying = false;
          }, this.SCRATCH_SOUND_DURATION / 1000);
        } else {
          this.scratchSoundSkipCount++;
          const reason = isStillPlaying ? '音效还在播放中' : '间隔太短';
        }
    }

    playScratchEffectLongShot() {
        this.playEffectByName('scratch');
    }
}

