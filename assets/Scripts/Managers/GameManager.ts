import { _decorator, Component } from 'cc';
import { Services } from './Services';
import SceneManager from './SceneManager';
import ResourceManager from './ResourceManager';
import { AudioManager } from './AudioManager';
import { LoadingScene } from '../UI/Scenes/Loading/LoadingScene';
import { UIRoot } from '../UI/UIRoot';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property(UIRoot)
    uiRoot: UIRoot = null;
    @property(AudioManager)
    private audioManager: AudioManager;

    private sceneManager: SceneManager;
    private resourceManager: ResourceManager;

    protected onLoad(): void {
        this.registerServices();
        this.initializeServices();
    }

    private registerServices(){
        Services.Register(SceneManager, new SceneManager());
        Services.Register(ResourceManager, new ResourceManager());
        Services.Register(AudioManager, this.audioManager);
        Services.Register(GameManager, this);

        console.log('[GameManager] Services registered');
    }

    private initializeServices(){
        this.sceneManager = Services.GetService(SceneManager);
        this.resourceManager = Services.GetService(ResourceManager);
        this.audioManager = Services.GetService(AudioManager);

        this.sceneManager.Init(this.uiRoot);
        this.resourceManager.Init();
        this.audioManager.Init();

        console.log('[GameManager] Services initialized');
    }
}