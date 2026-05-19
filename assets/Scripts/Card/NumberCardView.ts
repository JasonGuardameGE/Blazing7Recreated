import { _decorator, Component, Label, Node, Skeleton, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NumberCardView')
export class NumberCardView extends Component {
    
    @property(Label)
    cardValueNumber: Label = null;

    @property(Node)
    numberWinNode: Node = null;

    @property(Sprite)
    background: Sprite | null = null;

    @property(SpriteFrame)
    winBg: SpriteFrame | null = null;

    @property(SpriteFrame)
    normalBg: SpriteFrame | null = null;

    private onScratchSetToWin: boolean = false;
    private partOfWinningCombination: boolean = false;

    public SetCardValue(newValue: number){
        this.cardValueNumber.string = newValue.toString();
    }

    public PartOfWinningTeam(toggle: boolean){
        this.partOfWinningCombination = toggle;
    }

    public ToggleWinBackground(toggle: boolean){
        this.onScratchSetToWin = toggle;
    }

    public PlayWin(){
        this.numberWinNode.active = this.partOfWinningCombination;
    }

    public UpdateBackground(){
        if(this.onScratchSetToWin){
            this.background.spriteFrame = this.winBg;
        }else{
            this.background.spriteFrame = this.normalBg;
        }
    }

    public Reset(){
        this.numberWinNode.active = false;
        this.ToggleWinBackground(false);
        this.UpdateBackground();
    }
}


