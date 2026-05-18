import { _decorator, Component, Node, ResolutionPolicy, view } from 'cc';
import { GameManager } from '../Managers/GameManager';
import { Services } from '../Managers/Services';

const { ccclass, property } = _decorator;

@ccclass('UIRoot')
export class UIRoot extends Component {

    @property(Node)
    scene: Node = null;

    @property(Node)
    backgroundH5: Node = null;

    @property(Node)
    backgroundPC: Node = null;

    public get SceneRoot(): Node {
        return this.scene;
    }

    @property(Node)
    private popup: Node = null;
    
    public get PopUpRoot(): Node {
        return this.popup;
    }

    private _gameManager: GameManager;

    private detectedDeviceResolution: string = 'h5';
    get DetectedDeviceResolution() {
        return this.detectedDeviceResolution;
    }

    protected start(): void {
        this.detectCanvas();
    }

    onResize(){
        if(!this._gameManager){
            this._gameManager = Services.GetService(GameManager);
        }

        if(this._gameManager.GameData.DeviceType == 'pc'){
            this.backgroundPC && (this.backgroundPC.active = true);
            this.backgroundH5 && (this.backgroundH5.active = false);
        }else{
            this.backgroundPC && (this.backgroundPC.active = false);
            this.backgroundH5 && (this.backgroundH5.active = true);
        }
    }

    detectCanvas(){
        let visibleSize = view.getVisibleSize();
        let designSize = view.getDesignResolutionSize();

        if (visibleSize.height / visibleSize.width > designSize.height / designSize.width) { // 长屏
            view.setDesignResolutionSize(designSize.width, designSize.height, ResolutionPolicy.FIXED_WIDTH);
            this.detectedDeviceResolution = 'h5';
        } else { // 宽屏
            view.setDesignResolutionSize(designSize.width, designSize.height, ResolutionPolicy.FIXED_HEIGHT);
            this.detectedDeviceResolution = 'pc';
        }
    }
}