import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIRoot')
export class UIRoot extends Component {

    @property(Node)
    private scene : Node;
    @property(Node)
    private popup : Node;
    @property(Node)
    private panel : Node;
    @property(Node)
    private toast : Node;
    @property(Node)
    private alert : Node;
    @property(Node)
    private loading : Node;
    @property(Node)
    private maskNode : Node;
    @property(Node)
    private apiLoading : Node;

    
    start() {

    }

    update(deltaTime: number) {
        
    }
}


