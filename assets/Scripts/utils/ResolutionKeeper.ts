import { _decorator, Component, view, screen, ResolutionPolicy } from 'cc';

const { ccclass } = _decorator;

@ccclass('ResolutionKeeper')
export class ResolutionKeeper extends Component {
    private readonly DESIGN_WIDTH = 375;
    private readonly DESIGN_HEIGHT = 680;

    onLoad() {
        // Web only: allow Cocos to resize the canvas when the browser viewport changes.
        view.resizeWithBrowserSize(true);

        this.applyResolution();

        // Cocos Creator 3.8 introduced screen events.
        screen.on('window-resize', this.applyResolution, this);
        screen.on('orientation-change', this.applyResolution, this);
    }

    onDestroy() {
        screen.off('window-resize', this.applyResolution, this);
        screen.off('orientation-change', this.applyResolution, this);
    }

    private applyResolution() {
        const win = screen.windowSize;
        const designRatio = this.DESIGN_WIDTH / this.DESIGN_HEIGHT;
        const winRatio = win.width / win.height;

        // Keep the whole design visible.
        const policy =
            winRatio > designRatio
                ? ResolutionPolicy.FIXED_HEIGHT
                : ResolutionPolicy.FIXED_WIDTH;

        view.setDesignResolutionSize(
            this.DESIGN_WIDTH,
            this.DESIGN_HEIGHT,
            policy
        );
    }
}