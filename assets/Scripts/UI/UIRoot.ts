import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('UIRoot')
export class UIRoot extends Component {

    @property(Node)
    scene: Node = null;

    public get SceneRoot(): Node {
        return this.scene;
    }

    @property(Node)
    private popup: Node = null;
    
    public get PopUpRoot(): Node {
        return this.popup;
    }
}