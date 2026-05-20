import { _decorator, EventHandler, Node, Tween } from 'cc';
import { UIRoot } from '../UI/UIRoot';
import ResourceManager from './ResourceManager';
import { Services } from './Services';

const { ccclass } = _decorator;

export enum ScenePrefabPath {
    LOADING_SCENE = 'prefabs/Scenes/Loading-Scene',
    GAME_SCENE = 'prefabs/Scenes/Game-Scene',
    NEW_PLAYER_SCENE = 'prefabs/Scenes/NewPlayerGuide-Scene',
}

@ccclass('SceneManager')
export default class SceneManager {

    public onSceneChangeCallback: EventHandler[] = [];

    public CurrentScene: ScenePrefabPath = null;

    private _uiRoot: UIRoot = null;
    private _resourceManager: ResourceManager = null;

    private _preLoadedSceneNodes = new Map<ScenePrefabPath, Node>();
    private _currentScene: Node = null;

    public Init(uiRoot: UIRoot): void {
        this._uiRoot = uiRoot;
        this._resourceManager = Services.GetService(ResourceManager);

        console.log('[SceneManager] Initialized');
    }

    public SetCurrentScene(curScene: Node): void {
        this._currentScene = curScene;
    }

    public async PreLoadScene(scenePrefabPath: ScenePrefabPath): Promise<void> {
        if (!this.canUseSceneRoot()) {
            return;
        }

        if (this._preLoadedSceneNodes.has(scenePrefabPath)) {
            return;
        }

        const sceneNode = await this._resourceManager.LoadPrefab(scenePrefabPath);

        if (!sceneNode || !sceneNode.isValid) {
            console.error(`[SceneManager] Failed to preload scene: ${scenePrefabPath}`);
            return;
        }

        sceneNode.active = false;
        sceneNode.setPosition(0, 0, 0);

        /**
         * Important:
         * Attach it earlier, not when the scene is needed.
         * This moves part of the hierarchy/addChild cost away from the actual transition.
         */
        this._uiRoot.SceneRoot.addChild(sceneNode);

        this._preLoadedSceneNodes.set(scenePrefabPath, sceneNode);
    }

    public async LoadScene(scenePrefabPath: ScenePrefabPath): Promise<Node> {
        if (!this.canUseSceneRoot()) {
            return null;
        }

        let nextScene = this._preLoadedSceneNodes.get(scenePrefabPath);

        if (nextScene) {
            this._preLoadedSceneNodes.delete(scenePrefabPath);
        } else {
            nextScene = await this._resourceManager.LoadPrefab(scenePrefabPath);

            if (nextScene && nextScene.isValid) {
                nextScene.active = false;
                nextScene.setPosition(0, 0, 0);
                this._uiRoot.SceneRoot.addChild(nextScene);
            }
        }

        if (!nextScene || !nextScene.isValid) {
            console.error(`[SceneManager] Failed to load valid scene: ${scenePrefabPath}`);
            return null;
        }

        this.hideCurrentScene();

        nextScene.setPosition(0, 0, 0);
        nextScene.active = true;

        this.SetCurrentScene(nextScene);
        this.CurrentScene = scenePrefabPath;

        EventHandler.emitEvents(this.onSceneChangeCallback);

        return nextScene;
    }

    public UnloadPreloadedScene(scenePrefabPath: ScenePrefabPath): void {
        const sceneNode = this._preLoadedSceneNodes.get(scenePrefabPath);

        if (!sceneNode) {
            return;
        }

        this._preLoadedSceneNodes.delete(scenePrefabPath);

        if (sceneNode.isValid) {
            sceneNode.destroy();
        }
    }

    private hideCurrentScene(): void {
        if (!this._currentScene || !this._currentScene.isValid) {
            this._currentScene = null;
            return;
        }

        /**
         * Deactivate instead of destroy during transition.
         * destroy() can also cause spikes because it releases components,
         * children, tweens, events, and render data.
         */
        Tween.stopAllByTarget(this._currentScene);
        this._currentScene.active = false;
        this._currentScene = null;
    }

    private canUseSceneRoot(): boolean {
        if (!this._uiRoot) {
            console.error('[SceneManager] _uiRoot is null. Did you call Init()?');
            return false;
        }

        if (!this._uiRoot.SceneRoot) {
            console.error('[SceneManager] SceneRoot is null. Assign UIRoot.SceneRoot in Inspector.');
            return false;
        }

        if (!this._uiRoot.SceneRoot.isValid) {
            console.error('[SceneManager] SceneRoot is invalid/destroyed.');
            return false;
        }

        if (!this._resourceManager) {
            this._resourceManager = Services.GetService(ResourceManager);
        }

        return true;
    }
}