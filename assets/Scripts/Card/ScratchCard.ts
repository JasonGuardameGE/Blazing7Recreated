import { _decorator, Component, Node } from 'cc';
import { mockBuyCard, mockSettleScratch, settleScratch } from '../Api/GameApi';
import { GameManager } from '../Managers/GameManager';
import { SettleRes } from '../Types';
const { ccclass, property } = _decorator;

type CardNumberData = Array<{ value: number; win: number }>;

@ccclass('ScratchCard')
export class ScratchCard {

    /**
     * Called after a card is purchased and ticket card numbers are ready.
     */
    public onPurchaseUpdateCardVisualCallbacks: Array<(numbers: CardNumberData) => void> = [];

    private gameManager: GameManager;
    
    get GameData(){
        return this.gameManager?.GameData;
    }

    public Init(newGameManager: GameManager){
        this.gameManager = newGameManager;

    }

    public async PurchaseCard(): Promise<void> {        
        // TODO: Later get the data from the gameData.
        let params = {
            gameId: "Test",
            quantity: 1,
            showLoading: false,
            betType: 1,
            unitPrice: "20",//PLK.gameData.unitPrice.toString(),
            winType: this.gameManager.forcedWinType,
        };

        const res = await mockBuyCard(params);

        if (!res) {
            console.error('[GameManager] CardPurchased failed: response is null');
            return;
        }

        if (!res.scratchCardData) {
            console.error('[GameManager] CardPurchased failed: scratchCardData is missing', res);
            return;
        }

        this.GameData.TicketData.updateTicketItem(res.scratchCardData);

        const numbers = this.GameData.TicketData.currentTicket.codes as CardNumberData;

        console.log('[GameManager] Scratch Numbers:', numbers);

        this.onPurchaseUpdateCardVisualCallbacks.forEach((callback) => {
            callback(numbers);
        });
    }

    public async SettleCard(){
        try{
            const res = await mockSettleScratch({
                gameId: this.GameData.gameId,
                billId: this.GameData.TicketData.currentTicket.billId,
                showLoading: false,
                showLoadingMask: false,
                extField: "",
                scratchCardData: this.GameData.TicketData.currentTicket
            });
    
            res.billId = this.GameData.TicketData.currentTicket.billId;
            this.GameData.TicketData.settleInfo = res;
            this.GameData.TicketData.settleInfo.winType = this.getAmountType(this.GameData.TicketData.settleInfo.totalPayout);
            this.GameData.TicketData.removeSettleTicket(res.billId);    
        }catch(err){
            console.error(`[ScratchCard] Error while Settling Card: ${err}`);
        }
    }

    private getAmountType(amount: number): number {
        const bigAmountArr = this.GameData.BigAmount.split(',');
        const topAmountArr = this.GameData.TopAmount.split(',');

        if (amount >= parseInt(bigAmountArr[0]) && amount <= parseInt(bigAmountArr[1])) {
            return -1;
        } else if (amount >= parseInt(topAmountArr[0]) && amount <= parseInt(topAmountArr[1])) {
            return 1;
        } else {
            return 0;
        }
    }
}

