import { _decorator, Component, Node, Scene, Toggle } from 'cc';
import SceneManager, { ScenePrefabPath } from '../../Managers/SceneManager';
import { Services } from '../../Managers/Services';

const { ccclass, property } = _decorator;

@ccclass('NewPlayerGuide')
export class NewPlayerGuide extends Component {
    
    @property(Node)
    continueButton: Node | null = null;

    @property([Toggle])
    public toggles: Toggle[] = [];

    @property([Node])
    public pages: Node[] = [];

    private activePage: Node = null;
    private activeToggle: Toggle = null;

    private _sceneManager: SceneManager;

    protected onLoad(): void {
        this.registerButtonEvents();
        this.registerToggleEvents();
        this.showPage(0);
    }

    protected start(): void {
        this._sceneManager = Services.GetService(SceneManager);

    }

    private registerButtonEvents(): void{
        this.continueButton.on(Node.EventType.TOUCH_END, this.onContinueButtonEnd, this);
    }

    private registerToggleEvents(): void {
        this.toggles.forEach((toggle, index) => {
            toggle.node.on(Toggle.EventType.TOGGLE, () => {
                if (!toggle.isChecked) {
                    return;
                }
    
                this.showPage(index);
            }, this);
        });
    }

    private showPage(activeIndex: number): void {
        if(this.activePage){
            this.activePage.active = false;
        }

        if (this.activeToggle) {
            this.activeToggle.isChecked = false;
        }

        this.activePage = this.pages[activeIndex];
        this.activePage.active = true;

        this.activeToggle = this.toggles[activeIndex];
    }

    protected onDestroy(): void {
        this.toggles.forEach((toggle) => {
            if (toggle && toggle.node) {
                toggle.node.off(Toggle.EventType.TOGGLE);
            }
        });
    }

    private onContinueButtonEnd(){
        this._sceneManager.LoadScene(ScenePrefabPath.GAME_SCENE);
    }
}