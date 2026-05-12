import { _decorator, Component, error, Node } from 'cc';
import { buyCard, getCardList, mockBuyCard, mockSettleScratch, settleScratch } from '../Api/GameApi';
import { GameManager } from '../Managers/GameManager';
import { SettleRes } from '../Types';
import logger from '../utils/logger';
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

    public async RequestRemainingCards(): Promise<void>{
        try{
            let currentCardList = null;

            currentCardList = await getCardList({
                page: 1,
                pageSize: 10,
                type: 3,
                gameId: this.gameManager.GameData.gameId,
              });
               
            if (currentCardList) {

                currentCardList.content.forEach((item: any) =>{
                    console.log("UPDATING UNOPENED TICKET!");
                    this.gameManager.GameData.TicketData.updateTicketItem(item);
                });          
            }
        }catch(err){
            logger.error(`[ScratchCard] Error when retrieving remaining cards:`, err);
        }
    }

    public async PurchaseCard(): Promise<void> {        
        // TODO: Later get the data from the gameData.
        try{
            let params = {
                gameId: this.gameManager.GameData.gameId,
                quantity: 1,
                showLoading: false,
                betType: 1,
                unitPrice: this.gameManager.GameData.unitPrice.toString(),
                winType: this.gameManager.forcedWinType,
            };
    
            const res = await buyCard(params);
    
            if (!res) {
                console.error('[GameManager] CardPurchased failed: response is null');
                return;
            }
    
            if (!res.scratchCardData) {
                console.error('[GameManager] CardPurchased failed: scratchCardData is missing', res);
                return;
            }
    
            this.gameManager.GameUserInfo.balance = res.balance || 0;
            this.GameData.TicketData.updateTicketItem(res.scratchCardData);
        }catch(err){
            logger.error('[ScratchCard] Error on Purchase:', err);
        }
    }

    public async SettleCard(){
        try{
            const res = await settleScratch({
                gameId: this.GameData.gameId,
                billId: this.GameData.TicketData.currentTicket.billId,
                showLoading: false,
                showLoadingMask: false,
                extField: "",
            });
    
            res.billId = this.GameData.TicketData.currentTicket.billId;
            // process Settlement front-end
            this.processSettlement(res);

            // Remove and settle ticketData
            this.GameData.TicketData.settleInfo = res;
            this.GameData.TicketData.settleInfo.winType = this.getAmountType(this.GameData.TicketData.settleInfo.totalPayout);
            this.GameData.TicketData.removeSettleTicket(res.billId);    
        }catch(err){
            console.error(`[ScratchCard] Error while Settling Card: ${err}`);
        }
    }

    public SetupCurrentCardNumbers(){
        const numbers = this.GameData.TicketData.currentTicket.codes as CardNumberData;

        this.onPurchaseUpdateCardVisualCallbacks.forEach((callback) => {
            callback(numbers);
        });
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

    private async processSettlement(settleinfo: any){
        this.GameData.lastWinAmount = settleinfo.totalPayout;

        if(settleinfo.totalPayout > 0){

        }else{
            this.gameManager.GameUserInfo.balance = settleinfo.balance;
        }
    }
}

