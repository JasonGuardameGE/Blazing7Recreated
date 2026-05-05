import {
    _decorator,
    CCBoolean,
    Component,
    Label,
    Sprite,
    SpriteFrame,
    CCFloat,
    tween,
    Vec3,
    Node,
    Font,
    EventTouch,
    UITransform,
    EventHandler,
} from 'cc';

import { AudioManager } from '../../Managers/AudioManager';
import { Services } from '../../Managers/Services';

const { ccclass, property } = _decorator;

enum ButtonVisualState {
    Normal,
    Selected,
    Disabled,
}

@ccclass('SingleButton')
export class SingleButton extends Component {

    clickEndInsideCallbacks: EventHandler[] = [];
    
    @property({ type: Sprite, tooltip: 'Main button sprite. If empty, will use Sprite on this node.' })
    mainSprite: Sprite = null;

    @property(Sprite)
    tagSprite: Sprite = null;

    @property(Sprite)
    tag2Sprite: Sprite = null;

    @property(Label)
    label: Label = null;

    @property({ type: SpriteFrame, group: 'Main SpriteFrames' })
    normal: SpriteFrame = null;

    @property({ type: SpriteFrame, group: 'Main SpriteFrames' })
    select: SpriteFrame = null;

    @property({ type: SpriteFrame, group: 'Main SpriteFrames' })
    disabledSprite: SpriteFrame = null;

    @property({ type: SpriteFrame, group: 'Tag SpriteFrames' })
    normal_Tag: SpriteFrame = null;

    @property({ type: SpriteFrame, group: 'Tag SpriteFrames' })
    select_Tag: SpriteFrame = null;

    @property({ type: SpriteFrame, group: 'Tag SpriteFrames' })
    disabled_Tag: SpriteFrame = null;

    @property({ type: SpriteFrame, group: 'Tag2 SpriteFrames' })
    normal_Tag2: SpriteFrame = null;

    @property({ type: SpriteFrame, group: 'Tag2 SpriteFrames' })
    select_Tag2: SpriteFrame = null;

    @property({ type: SpriteFrame, group: 'Tag2 SpriteFrames' })
    disabled_Tag2: SpriteFrame = null;

    @property({ type: Font, group: 'Label Fonts' })
    normalFont: Font = null;

    @property({ type: Font, group: 'Label Fonts' })
    selectFont: Font = null;

    @property({ type: Font, group: 'Label Fonts' })
    disabledFont: Font = null;

    @property(CCBoolean)
    autoChange: boolean = false;

    @property(CCFloat)
    clickScale: number = 0;

    private _isSelect: boolean = false;
    private _disabled: boolean = false;
    private _isPressed: boolean = false;

    private _originScale: Vec3 = new Vec3();
    private audioManager: AudioManager = null;

    @property(CCBoolean)
    get isSelect(): boolean {
        return this._isSelect;
    }

    set isSelect(value: boolean) {
        if (this._isSelect === value) return;

        this._isSelect = value;
        this.updateState();
    }

    @property(CCBoolean)
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (this._disabled === value) return;

        this._disabled = value;

        if (this._disabled) {
            this._isPressed = false;
        }

        this.updateState();
    }

    protected onLoad(): void {
        if (!this.mainSprite) {
            this.mainSprite = this.node.getComponent(Sprite);
        }

        this._originScale.set(this.node.scale);
        this.updateState();
    }

    protected start(): void {
        this.audioManager = Services.GetService(AudioManager);
    }

    protected onEnable(): void {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    protected onDisable(): void {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        this._isPressed = false;
        this.updateState();
    }

    private onTouchStart(): void {
        if (this._disabled) {
            return;
        }

        this._isPressed = true;
        this.updateState();
    }

    private onTouchEnd(event: EventTouch): void {
        if (this._disabled) {
            return;
        }

        const isInside = this.isTouchInsideButton(event);

        this._isPressed = false;

        if (isInside) {
            if (this.audioManager) {
                this.audioManager.playEffectByName('click');
            }

            if (this.autoChange) {
                this.isSelect = !this.isSelect;
            } else {
                this._isSelect = false;
                this.updateState();
            }

            this.playClickScaleAnimation();

            EventHandler.emitEvents(this.clickEndInsideCallbacks, this);
        } else {
            if (!this.autoChange) {
                this._isSelect = false;
            }

            this.updateState();
        }
    }

    private onTouchCancel(): void {
        if (this._disabled) {
            return;
        }

        this._isPressed = false;

        if (!this.autoChange) {
            this._isSelect = false;
        }

        this.updateState();
    }

    private isTouchInsideButton(event: EventTouch): boolean {
        const uiTransform = this.node.getComponent(UITransform);

        if (!uiTransform) {
            console.warn('[SingleButton] Missing UITransform. Cannot check touch bounds.');
            return false;
        }

        const uiLocation = event.getUILocation();

        const localPos = uiTransform.convertToNodeSpaceAR(
            new Vec3(uiLocation.x, uiLocation.y, 0),
        );

        const halfWidth = uiTransform.width * 0.5;
        const halfHeight = uiTransform.height * 0.5;

        return (
            localPos.x >= -halfWidth &&
            localPos.x <= halfWidth &&
            localPos.y >= -halfHeight &&
            localPos.y <= halfHeight
        );
    }

    private updateState(): void {
        const state = this.getCurrentVisualState();

        this.applyMainSprite(state);
        this.applyTagSprite(state);
        this.applyTag2Sprite(state);
        this.applyLabelFont(state);
    }

    private getCurrentVisualState(): ButtonVisualState {
        if (this._disabled) {
            return ButtonVisualState.Disabled;
        }

        if (this._isPressed) {
            return ButtonVisualState.Selected;
        }

        return this._isSelect
            ? ButtonVisualState.Selected
            : ButtonVisualState.Normal;
    }

    private applyMainSprite(state: ButtonVisualState): void {
        if (!this.mainSprite) return;

        const spriteFrame = this.getSpriteFrameByState(
            state,
            this.normal,
            this.select,
            this.disabledSprite,
        );

        if (spriteFrame) {
            this.mainSprite.spriteFrame = spriteFrame;
        }
    }

    private applyTagSprite(state: ButtonVisualState): void {
        if (!this.tagSprite) return;

        const spriteFrame = this.getSpriteFrameByState(
            state,
            this.normal_Tag,
            this.select_Tag,
            this.disabled_Tag,
        );

        if (spriteFrame) {
            this.tagSprite.spriteFrame = spriteFrame;
        }
    }

    private applyTag2Sprite(state: ButtonVisualState): void {
        if (!this.tag2Sprite) return;

        const spriteFrame = this.getSpriteFrameByState(
            state,
            this.normal_Tag2,
            this.select_Tag2,
            this.disabled_Tag2,
        );

        if (spriteFrame) {
            this.tag2Sprite.spriteFrame = spriteFrame;
        }
    }

    private applyLabelFont(state: ButtonVisualState): void {
        if (!this.label) return;

        const font = this.getFontByState(
            state,
            this.normalFont,
            this.selectFont,
            this.disabledFont,
        );

        if (font) {
            this.label.font = font;
        }
    }

    private getSpriteFrameByState(
        state: ButtonVisualState,
        normal: SpriteFrame,
        selected: SpriteFrame,
        disabled: SpriteFrame,
    ): SpriteFrame {
        switch (state) {
            case ButtonVisualState.Disabled:
                return disabled || normal;

            case ButtonVisualState.Selected:
                return selected || normal;

            default:
                return normal;
        }
    }

    private getFontByState(
        state: ButtonVisualState,
        normal: Font,
        selected: Font,
        disabled: Font,
    ): Font {
        switch (state) {
            case ButtonVisualState.Disabled:
                return disabled || normal;

            case ButtonVisualState.Selected:
                return selected || normal;

            default:
                return normal;
        }
    }

    private playClickScaleAnimation(): void {
        if (this.clickScale <= 0) {
            return;
        }

        tween(this.node).stop();

        const originScale = this._originScale.clone();
        const targetScale = new Vec3(
            originScale.x + this.clickScale,
            originScale.y + this.clickScale,
            originScale.z,
        );

        tween(this.node)
            .to(0.1, { scale: targetScale }, { easing: 'quartOut' })
            .to(0.1, { scale: originScale }, { easing: 'quartOut' })
            .start();
    }
}