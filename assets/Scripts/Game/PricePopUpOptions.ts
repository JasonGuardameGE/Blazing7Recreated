import {
    _decorator,
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

    /**
     * Designer-friendly list of price values.
     * You can edit this directly in the Cocos Inspector.
     */
    @property([CCInteger])
    private possiblePriceValues: number[] = [];

    @property(Boolean)
    enableInfinite: boolean = false;

    private infiniteStr: string = '∞';
    private initialized: boolean = false;
    /**
     * Initial selected price value.
     * Can be a number or infiniteStr.
     */
    @property(CCInteger)
    private initialPriceValue: number = 20;

    private currentPriceValue: number = 20;

    get CurrentPriceValue(): number {
        return this.currentPriceValue;
    }

    @property(CCInteger)
    private centerDetectDistance: number = 30;
    
    private priceOptions: Node[] = [];

    protected start(): void {
        this.currentPriceValue = this.initialPriceValue;
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

        const content = this.scrollView.content;

        this.ClearGeneratedPriceOptions();

        this.priceOptionTemplate.active = false;

        if(availableNumbers){
            this.possiblePriceValues = availableNumbers;
        }

        for (let i = 0; i < this.possiblePriceValues.length; i++) {
            const priceValue = this.possiblePriceValues[i];
            const priceOption = this.CreatePriceOption(priceValue.toString(), content);

            this.priceOptions.push(priceOption);
        }

        if (this.enableInfinite) {
            const infiniteOption = this.CreatePriceOption(this.infiniteStr, content);
            this.priceOptions.push(infiniteOption);
        }

        this.ValidateCurrentPriceValue();
        this.UpdateSelectedPriceByCenter();

        this.scheduleOnce(() => {
            this.initialized = true;
            this.ScrollToPriceValue(this.initialPriceValue);
            this.UpdateSelectedPriceByCenter();
        }, 0.01);
        
    }

    protected update(): void {
        this.UpdateSelectedPriceByCenter();
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
        if(!this.initialized) return;
        
        this.currentPriceValue = priceValue;

        if (this.centerSelectedLabel) {
            this.centerSelectedLabel.string = this.GetPriceLabelFromValue(priceValue);
        }

        EventHandler.emitEvents(this.onPriceValueUpdateCallback);
    }

    private ScrollToPriceValue(priceValue: number): void {
        if (!this.scrollView || !this.scrollView.content || !this.centerSelectedOption || !this.initialized) {
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