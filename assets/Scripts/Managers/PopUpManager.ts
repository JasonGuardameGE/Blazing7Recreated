import { _decorator, Component, Node } from 'cc';
import { UIRoot } from '../UI/UIRoot';
import ResourceManager from './ResourceManager';
import { Services } from './Services';
const { ccclass, property } = _decorator;

export enum PopUpPrefabPath{
    WIN_POPUP = 'prefabs/PopUps/Win-PopUp',
    WINNER_ANNOUNCEMENT_POPUP = 'prefabs/PopUps/WinnerBroadcast-PopUp',
    MAX_WIN_TOASTER_POPUP = 'prefabs/PopUps/MaxWinToaster-PopUp',
}

@ccclass('PopUpManager')
export class PopUpManager extends Component {
    private _uiRoot: UIRoot = null;
    private _preLoadPopups = new Map<PopUpPrefabPath, Node>();
    private _resourceManager: ResourceManager;

    private _spawnedPopups = new Map<PopUpPrefabPath, Node>();

    public Init(uiRoot: UIRoot): void {
        this._uiRoot = uiRoot;
        this._resourceManager = Services.GetService(ResourceManager);

        console.log('[PopUpManager] Initialized');
    }

    public RegisterPopup(popUpPrefabPath : PopUpPrefabPath, node : Node){
        this._spawnedPopups.set(popUpPrefabPath, node);
    }

    public async PreLoadPopUp(popUpPrefabPath: PopUpPrefabPath): Promise<void>{
        if(this._preLoadPopups.has(popUpPrefabPath)){
            return;
        }

        const node = await this._resourceManager.LoadPrefab(popUpPrefabPath);
        this._preLoadPopups.set(popUpPrefabPath, node);
    }

    public async LoadPopup(popUpPrefabPath: PopUpPrefabPath, active: boolean = false, siblingIndex: number = 0): Promise<Node> {
        if (!this._uiRoot) {
            console.error('[PopUpManager] _uiRoot is null. Did you call Init()?');
            return null;
        }

        if (!this._uiRoot.PopUpRoot) {
            console.error('[PopUpManager] PopUpRoot is null. Assign UIRoot.popup in Inspector.');
            return null;
        }

        if (!this._uiRoot.PopUpRoot.isValid) {
            console.error('[PopUpManager] PopUpRoot is invalid/destroyed.');
            return null;
        }

        // Popup already Spawned, we can re-use it.
        if(this._spawnedPopups.has(popUpPrefabPath)){
            return this._spawnedPopups.get(popUpPrefabPath);
        }

        let popup: Node = null;

        if (this._preLoadPopups.has(popUpPrefabPath)) {
            popup = this._preLoadPopups.get(popUpPrefabPath);
            this._preLoadPopups.delete(popUpPrefabPath);
        } else {
            popup = await this._resourceManager.LoadPrefab(popUpPrefabPath);
        }

        if (!popup || !popup.isValid) {
            console.error(`[PopUpManager] Failed to load valid PopUp: ${popUpPrefabPath}`);
            return null;
        }

        popup.active = active;

        this._uiRoot.PopUpRoot.addChild(popup);
        popup.setSiblingIndex(siblingIndex);
        
        // console.log(`[PopUpManager] New PopUp Loaded: ${popup.name}`);
        // console.log(`[PopUpManager] Added to parent: ${popup.parent?.name}`);
        // console.log(`[PopUpManager] PopUpRoot child count: ${this._uiRoot.PopUpRoot.children.length}`);

        return popup;
    }
}


