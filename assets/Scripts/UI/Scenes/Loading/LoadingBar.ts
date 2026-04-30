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

    private _realProgress: number = 0;
    private _isSceneLoading = false;

    public get RealProgress(): number {
        return this._realProgress;
    }

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
        this._realProgress = 0;
        this.UpdateBar();
    }

    update(deltaTime: number) {
        
    }

    public SetProgress(newProgress: number){
        this._realProgress = newProgress;
        this.UpdateBar();
    }

    private UpdateBar() {
        const p = Math.min(Math.max(this._realProgress ?? 0, 0), 100);
        this.progressBar.progress = p / 100;
    }
}


