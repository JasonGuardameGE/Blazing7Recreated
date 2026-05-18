import { _decorator, Component, Widget, screen, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BackgroundResize')
export class BackgroundResize extends Component {

    @property(Widget)
    backgroundWidget: Widget | null = null;

    start() {
        this.init();
        screen.on('window-resize', this.init, this);
    }

    protected onDestroy() {
        screen.off('window-resize', this.init, this);
    }

    init() {
        if (!this.backgroundWidget) return;

        const visibleSize = view.getVisibleSize();

        const width = visibleSize.width;
        const height = visibleSize.height;

        const isPortrait = height > width;

        if (isPortrait) {
            // Mobile portrait
            this.backgroundWidget.bottom = 0;
        } else {
            // PC / landscape
            this.backgroundWidget.bottom = -1756;
        }

        this.backgroundWidget.updateAlignment();
    }
}