import { _decorator, Node } from 'cc';
import { UIRoot } from '../UI/UIRoot';
import ResourceManager from './ResourceManager';

const { ccclass } = _decorator;

export enum ScenePrefabPath {
    LOADING_SCENE = 'prefabs/Loading-Scene',
    GAME_SCENE = 'prefabs/Game-Scene',
}

@ccclass('SceneManager')
export default class SceneManager {

    private _uiRoot: UIRoot = null;
    private _preLoadSceneNodes = new Map<ScenePrefabPath, Node>();
    private _currentScene: Node = null;

    public Init(uiRoot: UIRoot): void {
        this._uiRoot = uiRoot;
        console.log('[SceneManager] Initialized');
    }

    public SetCurrentScene(curScene: Node): void {
        this._currentScene = curScene;
    }

    public async PreLoadScene(scenePrefabPath: ScenePrefabPath): Promise<void> {
        if (this._preLoadSceneNodes.has(scenePrefabPath)) {
            return;
        }

        const node = await ResourceManager.LoadPrefab(scenePrefabPath);
        this._preLoadSceneNodes.set(scenePrefabPath, node);

        console.log(`[SceneManager] Scene Preloaded: ${scenePrefabPath}`);
    }

    public async LoadScene(scenePrefabPath: ScenePrefabPath): Promise<Node> {
        if (!this._uiRoot) {
            console.error('[SceneManager] _uiRoot is null. Did you call Init()?');
            return null;
        }

        if (!this._uiRoot.SceneRoot) {
            console.error('[SceneManager] SceneRoot is null. Assign UIRoot.scene in Inspector.');
            return null;
        }

        if (!this._uiRoot.SceneRoot.isValid) {
            console.error('[SceneManager] SceneRoot is invalid/destroyed.');
            return null;
        }

        console.log(`[SceneManager] Loading Scene: ${scenePrefabPath}`);

        let nextScene: Node = null;

        if (this._preLoadSceneNodes.has(scenePrefabPath)) {
            nextScene = this._preLoadSceneNodes.get(scenePrefabPath);
            this._preLoadSceneNodes.delete(scenePrefabPath);
        } else {
            nextScene = await ResourceManager.LoadPrefab(scenePrefabPath);
        }

        if (!nextScene || !nextScene.isValid) {
            console.error(`[SceneManager] Failed to load valid scene: ${scenePrefabPath}`);
            return null;
        }

        if (this._currentScene && this._currentScene.isValid) {
            this._currentScene.destroy();
            this._currentScene = null;
        }

        nextScene.active = true;
        nextScene.setPosition(0, 0, 0);

        this._uiRoot.SceneRoot.addChild(nextScene);
        this.SetCurrentScene(nextScene);

        console.log(`[SceneManager] New Scene Loaded: ${nextScene.name}`);
        console.log(`[SceneManager] Added to parent: ${nextScene.parent?.name}`);
        console.log(`[SceneManager] SceneRoot child count: ${this._uiRoot.SceneRoot.children.length}`);

        return nextScene;
    }
}