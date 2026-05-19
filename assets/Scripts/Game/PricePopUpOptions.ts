import {
    _decorator,
    CCFloat,
    CCInteger,
    Component,
    EventHandler,
    EventTouch,
    input,
    Input,
    instantiate,
    Label,
    Node,
    ScrollBar,
    ScrollView,
    tween,
    UITransform,
    Vec3
} from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PricePopUpOptions')
export class PricePopUpOptions extends Component {
    
    @property([EventHandler])
    onPriceValueUpdateCallback: EventHandler[] = [];

    @property(ScrollBar)
    scrollBar: ScrollBar | null = null;

    @property(ScrollView)
    scrollView: ScrollView | null = null;

    @property(Node)
    priceOptionTemplate: Node | null = null;

    @property(Node)
    centerSelectedOption: Node | null = null;

    @property(Label)
    centerSelectedLabel: Label | null = null;

    @property([CCInteger])
    private possiblePriceValues: number[] = [];

    @property(Boolean)
    enableInfinite: boolean = false;

    @property(CCInteger)
    private initialPriceValue: number = 20;

    @property(CCInteger)
    private centerDetectDistance: number = 30;

    @property(CCFloat)
    private scrollToClickedDuration: number = 0.18;

    private infiniteStr: string = '∞';
    private initialized: boolean = false;
    private isAutoCentering: boolean = false;

    private currentPriceValue: number = 20;
    private priceOptions: Node[] = [];

    private activeScrollTweenTarget: { value: number } | null = null;

    get CurrentPriceValue(): number {
        return this.currentPriceValue;
    }

    protected start(): void {
        this.Initialize();
    }

    protected onEnable(): void {
        input.on(Input.EventType.TOUCH_END, this.OnGlobalTouchEnd, this);
    }

    protected onDisable(): void {
        input.off(Input.EventType.TOUCH_END, this.OnGlobalTouchEnd, this);
    }

    public Initialize(availableNumbers: number[] = null): void {
        if (!this.scrollView || !this.scrollView.content || !this.priceOptionTemplate) {
            return;
        }

        this.unscheduleAllCallbacks();
        this.StopActiveAutoCenterTween();

        // Important: block center detection while rebuilding/repositioning.
        this.initialized = false;
        this.isAutoCentering = false;

        const content = this.scrollView.content;

        this.ClearGeneratedPriceOptions();

        this.priceOptionTemplate.active = false;

        if (availableNumbers) {
            this.possiblePriceValues = availableNumbers;
        }

        // Important: force starting value back to your desired initial value.
        this.currentPriceValue = this.initialPriceValue;

        for (let i = 0; i < this.possiblePriceValues.length; i++) {
            const priceValue = this.possiblePriceValues[i];
            const priceOption = this.CreatePriceOption(priceValue.toString(), content);

            priceOption.on(Node.EventType.TOUCH_END, () => {
                this.onOptionClicked(i);
            });

            this.priceOptions.push(priceOption);
        }

        if (this.enableInfinite) {
            const infiniteOption = this.CreatePriceOption(this.infiniteStr, content);
            const infiniteIndex = this.priceOptions.length;

            infiniteOption.on(Node.EventType.TOUCH_END, () => {
                this.onOptionClicked(infiniteIndex);
            });

            this.priceOptions.push(infiniteOption);
        }

        this.ValidateCurrentPriceValue();

        if (this.centerSelectedLabel) {
            this.centerSelectedLabel.string = this.GetPriceLabelFromValue(this.currentPriceValue);
        }

        this.scheduleOnce(() => {
            this.ScrollToPriceValueWithoutInitializedCheck(this.currentPriceValue);

            this.initialized = true;

            if (this.centerSelectedLabel) {
                this.centerSelectedLabel.string = this.GetPriceLabelFromValue(this.currentPriceValue);
            }
        }, 0.01);
    }

    protected update(): void {
        if (!this.initialized) {
            return;
        }

        if (this.isAutoCentering) {
            return;
        }

        this.UpdateSelectedPriceByCenter();
    }

    private onOptionClicked(optionIndex: number): void {
        if (!this.scrollView || !this.scrollView.content || !this.centerSelectedOption) {
            return;
        }

        if (optionIndex < 0 || optionIndex >= this.priceOptions.length) {
            return;
        }

        const targetOption = this.priceOptions[optionIndex];

        if (!targetOption || !targetOption.isValid) {
            return;
        }

        const label = targetOption.getComponentInChildren(Label);

        if (!label) {
            return;
        }

        const newPriceValue = this.GetPriceValueFromLabel(label.string);

        this.SmoothScrollOptionToCenter(targetOption, newPriceValue);
    }

    private SmoothScrollOptionToCenter(targetOption: Node, priceValue: number): void {
        if (!this.scrollView || !this.scrollView.content || !this.centerSelectedOption) {
            return;
        }

        const content = this.scrollView.content;

        this.scrollView.stopAutoScroll();
        this.StopActiveAutoCenterTween();

        const targetWorldPos = targetOption.worldPosition;
        const centerWorldPos = this.centerSelectedOption.worldPosition;
        const contentWorldPos = content.worldPosition;

        const startContentWorldPos = new Vec3(
            contentWorldPos.x,
            contentWorldPos.y,
            contentWorldPos.z
        );

        const offset = new Vec3(
            centerWorldPos.x - targetWorldPos.x,
            centerWorldPos.y - targetWorldPos.y,
            0
        );

        const targetContentWorldPos = new Vec3(
            contentWorldPos.x + offset.x,
            contentWorldPos.y + offset.y,
            contentWorldPos.z
        );

        const duration = Math.max(0.01, this.scrollToClickedDuration);

        this.isAutoCentering = true;
        this.activeScrollTweenTarget = { value: 0 };

        tween(this.activeScrollTweenTarget)
            .to(
                duration,
                { value: 1 },
                {
                    easing: 'sineOut',
                    onUpdate: (tweenTarget: { value: number }) => {
                        if (!content || !content.isValid) {
                            return;
                        }

                        const newWorldPos = new Vec3();

                        Vec3.lerp(
                            newWorldPos,
                            startContentWorldPos,
                            targetContentWorldPos,
                            tweenTarget.value
                        );

                        content.setWorldPosition(newWorldPos);
                    }
                }
            )
            .call(() => {
                if (content && content.isValid) {
                    content.setWorldPosition(targetContentWorldPos);
                }

                this.isAutoCentering = false;
                this.activeScrollTweenTarget = null;

                this.SetSelectedPrice(priceValue);
            })
            .start();
    }

    private StopActiveAutoCenterTween(): void {
        if (!this.activeScrollTweenTarget) {
            return;
        }

        tween(this.activeScrollTweenTarget).stop();

        this.activeScrollTweenTarget = null;
        this.isAutoCentering = false;
    }

    private ClearGeneratedPriceOptions(): void {
        for (let i = 0; i < this.priceOptions.length; i++) {
            if (this.priceOptions[i] && this.priceOptions[i].isValid) {
                this.priceOptions[i].destroy();
            }
        }

        this.priceOptions = [];
    }

    private ValidateCurrentPriceValue(): void {
        if (this.currentPriceValue.toString() === this.infiniteStr && this.enableInfinite) {
            return;
        }
    
        if (typeof this.currentPriceValue === 'number') {
            const hasCurrentValue = this.possiblePriceValues.indexOf(this.currentPriceValue) !== -1;
    
            if (hasCurrentValue) {
                return;
            }
        }

        // If initialPriceValue is not available, then fallback to first available value.
        if (this.possiblePriceValues.length > 0) {
            this.currentPriceValue = this.possiblePriceValues[0];
            return;
        }
    
        if (this.enableInfinite) {
            this.currentPriceValue = -1;
        }
    }

    private CreatePriceOption(labelString: string, parent: Node): Node {
        const priceOption = instantiate(this.priceOptionTemplate!);

        priceOption.active = true;
        priceOption.parent = parent;

        const label = priceOption.getComponentInChildren(Label);

        if (label) {
            label.string = labelString;
        }

        return priceOption;
    }

    private UpdateSelectedPriceByCenter(): void {
        if (!this.initialized) {
            return;
        }

        if (this.isAutoCentering) {
            return;
        }

        if (!this.centerSelectedOption || this.priceOptions.length <= 0) {
            return;
        }

        let closestOption: Node | null = null;
        let closestDistance = Number.MAX_VALUE;

        const centerWorldPos = this.centerSelectedOption.worldPosition;

        for (let i = 0; i < this.priceOptions.length; i++) {
            const option = this.priceOptions[i];
            const distance = Vec3.distance(option.worldPosition, centerWorldPos);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestOption = option;
            }
        }

        if (!closestOption) {
            return;
        }

        if (closestDistance > this.centerDetectDistance) {
            return;
        }

        const label = closestOption.getComponentInChildren(Label);

        if (!label) {
            return;
        }

        const newPriceValue = this.GetPriceValueFromLabel(label.string);

        if (newPriceValue === this.currentPriceValue) {
            return;
        }

        this.SetSelectedPrice(newPriceValue);
    }

    private SetSelectedPrice(priceValue: number): void {
        if (!this.initialized) {
            return;
        }
        
        this.currentPriceValue = priceValue;

        if (this.centerSelectedLabel) {
            this.centerSelectedLabel.string = this.GetPriceLabelFromValue(priceValue);
        }

        EventHandler.emitEvents(this.onPriceValueUpdateCallback);
    }

    private ScrollToPriceValueWithoutInitializedCheck(priceValue: number): void {
        if (!this.scrollView || !this.scrollView.content || !this.centerSelectedOption) {
            return;
        }

        const targetOption = this.GetPriceOptionByValue(priceValue);

        if (!targetOption) {
            return;
        }

        const content = this.scrollView.content;

        this.scrollView.stopAutoScroll();

        const targetWorldPos = targetOption.worldPosition;
        const centerWorldPos = this.centerSelectedOption.worldPosition;
        const contentWorldPos = content.worldPosition;

        const offset = new Vec3(
            centerWorldPos.x - targetWorldPos.x,
            centerWorldPos.y - targetWorldPos.y,
            0
        );

        content.setWorldPosition(
            contentWorldPos.x + offset.x,
            contentWorldPos.y + offset.y,
            contentWorldPos.z
        );
    }

    private GetPriceOptionByValue(priceValue: number): Node | null {
        const targetLabelString = this.GetPriceLabelFromValue(priceValue);

        for (let i = 0; i < this.priceOptions.length; i++) {
            const label = this.priceOptions[i].getComponentInChildren(Label);

            if (label && label.string === targetLabelString) {
                return this.priceOptions[i];
            }
        }

        return null;
    }

    private GetPriceValueFromLabel(labelString: string): number {
        if (labelString === this.infiniteStr) {
            return -1;
        }

        return Number(labelString);
    }

    private GetPriceLabelFromValue(priceValue: number): string {
        if (priceValue === -1) {
            return this.infiniteStr;
        }

        return priceValue.toString();
    }

    private OnGlobalTouchEnd(event: EventTouch): void {
        if (!this.node.activeInHierarchy) {
            return;
        }

        const uiTransform = this.node.getComponent(UITransform);

        if (!uiTransform) {
            return;
        }

        const touchLocation = event.getUILocation();
        const boundingBox = uiTransform.getBoundingBoxToWorld();

        const isTouchInside = boundingBox.contains(touchLocation);

        if (!isTouchInside) {
            this.node.active = false;
        }
    }
}