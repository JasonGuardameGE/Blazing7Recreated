import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('UIRoot')
export class UIRoot extends Component {

    @property(Node)
    scene: Node = null;

    @property(Node)
    private popup: Node = null;

    @property(Node)
    private panel: Node = null;

    @property(Node)
    private toast: Node = null;

    @property(Node)
    private alert: Node = null;

    @property(Node)
    private loading: Node = null;

    @property(Node)
    private maskNode: Node = null;

    @property(Node)
    private apiLoading: Node = null;

    public get SceneRoot(): Node {
        return this.scene;
    }
}