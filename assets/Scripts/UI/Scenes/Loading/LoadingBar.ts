import { _decorator, Component, ProgressBar, Sprite, Label, tween } from 'cc';

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

    private _progressTweenTarget = { value: 0 };

    public get RealProgress(): number {
        return this._realProgress;
    }

    public setEvtOnLoadingBarStartLoading(cb: () => Promise<void>) {
        this.evtOnLoadingBarStartLoading = cb;
    }
    
    public init() {
        this.Reset();
    }

    public async StartLoading() {
        if (!this.evtOnLoadingBarStartLoading) {
            console.error('Loading cannot start, No loading event registered.');
            return;
        }
    
        await this.evtOnLoadingBarStartLoading();
    }

    public Reset() {
        tween(this._progressTweenTarget).stop();

        this._realProgress = 0;
        this._progressTweenTarget.value = 0;

        this.UpdateBar();
    }

    update(deltaTime: number) {
        
    }

    public SetProgress(newProgress: number) {
        this._realProgress = this.ClampProgress(newProgress);
        this._progressTweenTarget.value = this._realProgress;

        this.UpdateBar();
    }

    public SetProgressSmooth(
        targetProgress: number,
        duration: number = 0.4,
        onComplete?: () => void
    ): Promise<void> {
        return new Promise(resolve => {
            const target = this.ClampProgress(targetProgress);

            tween(this._progressTweenTarget).stop();

            this._progressTweenTarget.value = this._realProgress;

            tween(this._progressTweenTarget)
                .to(duration, { value: target }, {
                    onUpdate: () => {
                        this._realProgress = this._progressTweenTarget.value;
                        this.UpdateBar();
                    }
                })
                .call(() => {
                    this._realProgress = target;
                    this._progressTweenTarget.value = target;

                    this.UpdateBar();

                    if (onComplete) {
                        onComplete();
                    }

                    resolve();
                })
                .start();
        });
    }

    private UpdateBar() {
        const p = this.ClampProgress(this._realProgress);

        if (this.progressBar) {
            this.progressBar.progress = p / 100;
        }

        if (this.progressLabel) {
            this.progressLabel.string = `${Math.floor(p)}%`;
        }
    }

    private ClampProgress(value: number): number {
        if (!Number.isFinite(value)) {
            return 0;
        }

        return Math.min(Math.max(value, 0), 100);
    }
}