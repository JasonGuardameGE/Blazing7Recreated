import { _decorator, Component, Node, ProgressBar, Sprite, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LoadingBar')
export class LoadingBar extends Component {

    private evtOnLoadingBarStartLoading: () => Promise<void> = null;
    
    @property(Label)
    progressLabel: Label = null;

    @property(ProgressBar)
    progressBar: ProgressBar = null;

    @property(Sprite)
    bar: Sprite = null;

    @property(Sprite)
    progressTog: Sprite = null;

    private realProgress: number = 0;
    private isSceneLoading = false;

    public RealProgress: number = this.realProgress;
    
    public setEvtOnLoadingBarStartLoading(cb: () => Promise<void>){
        this.evtOnLoadingBarStartLoading = cb;
    }
    
    public init(){
        this.Reset();
    }

    public async StartLoading(){
        if(!this.evtOnLoadingBarStartLoading){
            console.error("Loading cannot start, No loading event registered.");
            return;
        }
    
        await this.evtOnLoadingBarStartLoading();
    }

    public Reset(){
        this.realProgress = 0;
        this.UpdateBar();
    }

    update(deltaTime: number) {
        
    }

    public SetProgress(newProgress: number){
        this.realProgress = newProgress;
        this.UpdateBar();
    }

    private UpdateBar() {
        const p = Math.min(Math.max(this.realProgress ?? 0, 0), 100);
        this.progressBar.progress = p / 100;
    }
}


