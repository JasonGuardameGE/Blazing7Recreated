import { _decorator, Component, EventHandler, Node } from 'cc';
import { GameOptions } from './GameOptions';
import { ScratchCardView } from '../Card/ScratchCardView';
import { ScratchSystem } from '../Scratch/ScratchSystem';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {

    @property(GameOptions)
    gameOptions: GameOptions;
    @property(ScratchCardView)
    scratchCardView: ScratchCardView;
    @property(ScratchSystem)
    scratchSystem: ScratchSystem;

    private cardCurrentlyShowing: boolean = false;
    private cardReady: boolean = false;

    public onLoad(): void {
        this.setupGameOptions();
        this.setupCardView();
        this.setupScratchSystem();
    }


    private setupCardView(){
        const eventHandler = this.NewEventHandler('Game', 'cardPlayInComplete');
        this.scratchCardView.cardFinishedPlayInCallbacks.push(eventHandler);
    }

    private setupScratchSystem(){
        const eventHandler = this.NewEventHandler('Game', 'cardAllScratched');
        this.scratchSystem.allCardScratchedCallbacks.push(eventHandler);
    }

    private setupGameOptions(): void {
        if (!this.gameOptions) {
            console.error('[Game] gameOptions is null');
            return;
        }

        this.SetupBuyButton();
    }


    private SetupBuyButton(){        
        if (!this.gameOptions.buyCardButton) {
            console.error('[Game] buyCardButton is null');
            return;
        }

        const eventHandler = this.NewEventHandler('Game', 'buyNewCard');
        this.gameOptions.buyCardButton.clickEndInsideCallbacks.push(eventHandler);
    }

    private buyNewCard(): void {
        if(this.cardCurrentlyShowing) return;

        console.log('[Game] BuyNewCard clicked');

        this.gameOptions.buyCardButton.disabled = true;

        this.scratchSystem.ToggleTouch(false);
        this.scratchSystem.GenerateScratchRenderer();
        this.scratchCardView.StartCardPlayIn();
        this.cardCurrentlyShowing = true;
    }

    private cardPlayInComplete(){
        this.scratchSystem.ToggleTouch(true);
    }

    private cardAllScratched(){
        this.gameOptions.buyCardButton.disabled = false;
        this.cardCurrentlyShowing = false;
    }

    private NewEventHandler(component: string, handler: string): EventHandler{

        const eventHandler = new EventHandler();
        eventHandler.target = this.node;
        eventHandler.component = component;
        eventHandler.handler = handler;

        return eventHandler;
    }
}


