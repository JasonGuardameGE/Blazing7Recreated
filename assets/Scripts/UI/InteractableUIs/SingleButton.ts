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
    UIOpacity,
    Tween,
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

    @property(UIOpacity)
    blinker: UIOpacity = null;

    @property(CCBoolean)
    enableBlinker: boolean = false;

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

    @property(CCBoolean)
    playClickSound: boolean = true;

    @property(CCFloat)
    clickScale: number = 0;

    @property(CCFloat)
    clickScaleDuration: number = 0.1;

    private _isSelect: boolean = false;
    private _disabled: boolean = false;
    private _isPressed: boolean = false;

    private _originScale: Vec3 = new Vec3();
    private _targetScale: Vec3 = new Vec3();

    private _uiTransform: UITransform | null = null;
    private _audioManager: AudioManager | null = null;

    private _currentVisualState: ButtonVisualState | null = null;
    private _isBlinking: boolean = false;

    @property(CCBoolean)
    get isSelect(): boolean {
        return this._isSelect;
    }

    set isSelect(value: boolean) {
        if (this._isSelect === value) {
            return;
        }

        this._isSelect = value;
        this.updateState();
    }

    @property(CCBoolean)
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (this._disabled === value) {
            return;
        }

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

        this._uiTransform = this.node.getComponent(UITransform);
        this._originScale.set(this.node.scale);

        this.updateState(true);
    }

    protected start(): void {
        this._audioManager = Services.GetService(AudioManager);
    }

    protected onEnable(): void {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        this.updateState(true);
    }

    protected onDisable(): void {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        this._isPressed = false;

        this.stopBlinkerTween();
        Tween.stopAllByTarget(this.node);
        this.node.setScale(this._originScale);

        this.updateState(true);
    }

    protected onDestroy(): void {
        this.stopBlinkerTween();
        Tween.stopAllByTarget(this.node);
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

        if (!isInside) {
            if (!this.autoChange) {
                this._isSelect = false;
            }

            this.updateState();
            return;
        }

        if (this.playClickSound) {
            this._audioManager?.playEffectByName('click');
        }

        if (this.autoChange) {
            this._isSelect = !this._isSelect;
        } else {
            this._isSelect = false;
        }

        this.updateState();
        this.playClickScaleAnimation();

        EventHandler.emitEvents(this.clickEndInsideCallbacks, this);
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
        if (!this._uiTransform) {
            console.warn('[SingleButton] Missing UITransform. Cannot check touch bounds.');
            return false;
        }

        const uiLocation = event.getUILocation();

        const localPos = this._uiTransform.convertToNodeSpaceAR(
            new Vec3(uiLocation.x, uiLocation.y, 0),
        );

        const halfWidth = this._uiTransform.width * 0.5;
        const halfHeight = this._uiTransform.height * 0.5;

        return (
            localPos.x >= -halfWidth &&
            localPos.x <= halfWidth &&
            localPos.y >= -halfHeight &&
            localPos.y <= halfHeight
        );
    }

    private updateState(forceRefresh: boolean = false): void {
        const newState = this.getCurrentVisualState();

        if (!forceRefresh && this._currentVisualState === newState) {
            return;
        }

        this._currentVisualState = newState;

        this.applyMainSprite(newState);
        this.applyTagSprite(newState);
        this.applyTag2Sprite(newState);
        this.applyLabelFont(newState);
        this.updateBlinker(newState);
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
        if (!this.mainSprite) {
            return;
        }

        const spriteFrame = this.getSpriteFrameByState(
            state,
            this.normal,
            this.select,
            this.disabledSprite,
        );

        if (spriteFrame && this.mainSprite.spriteFrame !== spriteFrame) {
            this.mainSprite.spriteFrame = spriteFrame;
        }
    }

    private applyTagSprite(state: ButtonVisualState): void {
        if (!this.tagSprite) {
            return;
        }

        const spriteFrame = this.getSpriteFrameByState(
            state,
            this.normal_Tag,
            this.select_Tag,
            this.disabled_Tag,
        );

        if (spriteFrame && this.tagSprite.spriteFrame !== spriteFrame) {
            this.tagSprite.spriteFrame = spriteFrame;
        }
    }

    private applyTag2Sprite(state: ButtonVisualState): void {
        if (!this.tag2Sprite) {
            return;
        }

        const spriteFrame = this.getSpriteFrameByState(
            state,
            this.normal_Tag2,
            this.select_Tag2,
            this.disabled_Tag2,
        );

        if (spriteFrame && this.tag2Sprite.spriteFrame !== spriteFrame) {
            this.tag2Sprite.spriteFrame = spriteFrame;
        }
    }

    private applyLabelFont(state: ButtonVisualState): void {
        if (!this.label) {
            return;
        }

        const font = this.getFontByState(
            state,
            this.normalFont,
            this.selectFont,
            this.disabledFont,
        );

        if (font && this.label.font !== font) {
            this.label.font = font;
        }
    }

    private updateBlinker(state: ButtonVisualState): void {
        if (!this.blinker) {
            return;
        }
    
        const shouldBlink =
            this.enableBlinker &&
            state === ButtonVisualState.Normal;
    
        if (!shouldBlink) {
            this.stopBlinkerTween();
            this.blinker.opacity = 0;
            return;
        }
    
        if (this._isBlinking) {
            return;
        }
    
        this._isBlinking = true;
        this.blinker.opacity = 0;
    
        tween(this.blinker)
            .to(0.6, { opacity: 200 })
            .to(0.6, { opacity: 0 })
            .union()
            .repeatForever()
            .start();
    }

    private stopBlinkerTween(): void {
        if (!this.blinker) {
            return;
        }
    
        if (!this._isBlinking) {
            return;
        }
    
        Tween.stopAllByTarget(this.blinker);
        this._isBlinking = false;
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

        Tween.stopAllByTarget(this.node);

        this._targetScale.set(
            this._originScale.x + this.clickScale,
            this._originScale.y + this.clickScale,
            this._originScale.z,
        );

        this.node.setScale(this._originScale);

        tween(this.node)
            .to(this.clickScaleDuration, { scale: this._targetScale }, { easing: 'quartOut' })
            .to(this.clickScaleDuration, { scale: this._originScale }, { easing: 'quartOut' })
            .start();
    }
}