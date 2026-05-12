import { _decorator, Component, Node, Toggle, CCFloat } from 'cc';
import SceneManager, { ScenePrefabPath } from '../../Managers/SceneManager';
import { Services } from '../../Managers/Services';
import { reportGuideComplete } from '../../Api/GameApi';
import { GameManager } from '../../Managers/GameManager';

const { ccclass, property } = _decorator;

@ccclass('NewPlayerGuide')
export class NewPlayerGuide extends Component {
    
    @property(Node)
    continueButton: Node | null = null;

    @property([Toggle])
    public toggles: Toggle[] = [];

    @property(Toggle)
    public doNotShowAgain: Toggle = null;

    @property([Node])
    public pages: Node[] = [];

    @property(CCFloat)
    public autoSwitchInterval: number = 1.25;

    private activePage: Node = null;
    private activeToggle: Toggle = null;
    private activePageIndex: number = 0;

    private _sceneManager: SceneManager = null;

    private toggleHandlers: Array<() => void> = [];
    private isInternalPageChange: boolean = false;

    protected onLoad(): void {
        this.registerButtonEvents();
        this.registerToggleEvents();

        this.showPage(0);
        this.startAutoSwitchPages();
    }

    protected start(): void {
        this._sceneManager = Services.GetService(SceneManager);
    }

    private registerButtonEvents(): void {
        if (!this.continueButton || !this.continueButton.isValid) {
            console.error('[NewPlayerGuide] continueButton is null or invalid');
            return;
        }

        this.continueButton.on(Node.EventType.TOUCH_END, this.onContinueButtonEnd, this);
    }

    private registerToggleEvents(): void {
        this.toggleHandlers = [];

        this.toggles.forEach((toggle, index) => {
            if (!toggle || !toggle.node || !toggle.node.isValid) {
                return;
            }

            const handler = () => {
                if (this.isInternalPageChange) {
                    return;
                }

                if (!toggle.isChecked) {
                    return;
                }

                this.showPage(index);
                this.restartAutoSwitchPages();
            };

            this.toggleHandlers[index] = handler;
            toggle.node.on(Toggle.EventType.TOGGLE, handler, this);
        });
    }

    private startAutoSwitchPages(): void {
        this.unschedule(this.autoSwitchToNextPage);

        if (!this.pages || this.pages.length <= 1) {
            return;
        }

        this.schedule(
            this.autoSwitchToNextPage,
            this.autoSwitchInterval,
        );
    }

    private restartAutoSwitchPages(): void {
        this.startAutoSwitchPages();
    }

    private autoSwitchToNextPage(): void {
        if (!this.pages || this.pages.length <= 1) {
            return;
        }

        let nextIndex = this.activePageIndex + 1;

        if (nextIndex >= this.pages.length) {
            nextIndex = 0;
        }

        this.showPage(nextIndex);
    }

    private showPage(activeIndex: number): void {
        if (!this.pages || activeIndex < 0 || activeIndex >= this.pages.length) {
            console.error(`[NewPlayerGuide] Invalid page index: ${activeIndex}`);
            return;
        }

        this.isInternalPageChange = true;

        if (this.activePage && this.activePage.isValid) {
            this.activePage.active = false;
        }

        if (this.activeToggle && this.activeToggle.isValid) {
            this.activeToggle.isChecked = false;
        }

        this.activePageIndex = activeIndex;

        this.activePage = this.pages[activeIndex];

        if (this.activePage && this.activePage.isValid) {
            this.activePage.active = true;
        }

        this.activeToggle = this.toggles[activeIndex];

        if (this.activeToggle && this.activeToggle.isValid) {
            this.activeToggle.isChecked = true;
        }

        this.isInternalPageChange = false;
    }

    protected onDestroy(): void {
        this.unschedule(this.autoSwitchToNextPage);

        if (this.continueButton && this.continueButton.isValid) {
            this.continueButton.off(Node.EventType.TOUCH_END, this.onContinueButtonEnd, this);
        }

        this.toggles.forEach((toggle, index) => {
            if (!toggle || !toggle.node || !toggle.node.isValid) {
                return;
            }

            const handler = this.toggleHandlers[index];

            if (handler) {
                toggle.node.off(Toggle.EventType.TOGGLE, handler, this);
            }
        });

        this.toggleHandlers = [];
    }

    private onContinueButtonEnd(): void {
        if (this.doNotShowAgain && this.doNotShowAgain.isChecked) {
            const gameManager = Services.GetService(GameManager);

            if (gameManager) {
                reportGuideComplete({
                    gameId: gameManager.GameData.gameId,
                });
            }
        }

        if (!this._sceneManager) {
            this._sceneManager = Services.GetService(SceneManager);
        }

        if (!this._sceneManager) {
            console.error('[NewPlayerGuide] SceneManager service not found');
            return;
        }

        this._sceneManager.LoadScene(ScenePrefabPath.GAME_SCENE);
    }
}