import { _decorator, Component } from 'cc';
import { Services } from './Services';
import SceneManager from './SceneManager';
import ResourceManager from './ResourceManager';
import { LoadingScene } from '../UI/Scenes/Loading/LoadingScene';

const { ccclass } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    protected onLoad(): void {
        this.registerServices();
    }

    private registerServices(){
        Services.Register(SceneManager, new SceneManager());
        Services.Register(ResourceManager, new ResourceManager());
        Services.Register(GameManager, this);

        console.log('[GameManager] Services registered');
    }
}