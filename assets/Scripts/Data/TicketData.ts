export default class TicketData {
    private _currentTicket: ticketItem = null;
    private tickets = new Map<string, ticketItem>();
    private _settleInfo:any =  null;
    private _scratchingCardInfo:any =  null;
    private _hasSettle:boolean = false;
    private _isAutoScratching:boolean = false;
    private _lastWin:number = 0;
    private _needInit:boolean = false;
    private _inProgress:boolean = false;
  
    updateTicketItem(data: any) {
        console.log("[GameManager] Updating TicketItem");
        try {
            // Returns marked Winning lines
            let codes: any = this.markWinningCells(data.codes);
            data.codes = codes;
            this.currentTicket = data;
            this.tickets.set(data.billId, data);
        } catch (error) {
            console.error(error);
        }
    }
  
    set inProgress(value: boolean) {
      this._inProgress = value;
    }
  
    get inProgress() {
      return this._inProgress;
    }
  
    set hasSettle(value: boolean) {
      this._hasSettle = value;  
    }
  
    get hasSettle() {
      return this._hasSettle;
    }
  
    set isAutoScratching(value: boolean) {
      this._isAutoScratching = value;
    }
  
    get isAutoScratching() {
      return this._isAutoScratching;
    }
  
  
    set currentTicket(data) {
      this._currentTicket = data;
      this.scratchingCardInfo = data.codes;
    }
    
  
    get currentTicket() {
      return this._currentTicket;
    }
  
    get currentTicketId() {
      return this._currentTicket?.billId || '';
    }
  
  
  
    get numberList() {
      return this.currentTicket?.codes || [];
    }
  
  
    set settleInfo(data) {
      this._settleInfo = data;
      if(data && data.totalPayout > 0) {
        this._lastWin = data.totalPayout;
      }
      
    }
  
    get lastWin() {
      return this._lastWin;
    }
  
    get settleInfo() {
      return this._settleInfo;
    }
  
    set scratchingCardInfo(data) {
      this._scratchingCardInfo = data;
    }
  
    get scratchingCardInfo() {
      return this._scratchingCardInfo;
    }
  
    get needInit() {
      return this._needInit;
    }
  
    markWinningCells(codeStr:string, target = 7) {
      const nums = codeStr.split(',').map(Number);
    
      // 3x3 grid
      const g = [
        nums.slice(0,3),
        nums.slice(3,6),
        nums.slice(6,9)
      ];
    
      // 默认全部不中奖
      const win = Array(9).fill(0);
    
      // Possible Win Combinations
      const lines = [
        // Rows
        [[0,0],[0,1],[0,2]],
        [[1,0],[1,1],[1,2]],
        [[2,0],[2,1],[2,2]],
        // Columns
        [[0,0],[1,0],[2,0]],
        [[0,1],[1,1],[2,1]],
        [[0,2],[1,2],[2,2]],
        // Diagonals
        [[0,0],[1,1],[2,2]],
        [[0,2],[1,1],[2,0]],
      ];
    
      // Loop thru each possible line and check it checks if each cell is equal to a line entry.
      lines.forEach(line => {
        if (line.every(([r,c]) => g[r][c] === target)) {
          line.forEach(([r,c]) => {
            win[r*3+c] = 1; // 标记中奖位置
          });
        }
      });
    
      // 输出结构化结果
      return nums.map((value, i) => ({
        value,
        win: win[i]
      }));
    }
    
    
  
  
    removeSettleTicket(id) {
      this.tickets.delete(id);
      if(this._currentTicket && this._currentTicket.billId == id) {
        this._currentTicket = null;
      }
  
      if(this.tickets.size > 0) {
        this._currentTicket = this.tickets.values().next().value;
        this._needInit = true;
      }else {
        this._needInit = false;
      }
    }
  }
  
  interface ticketItem {
    billId: string;
    cardNo: string;
    cardId: string;
    codes: myNumbers[];
    unitPrice: number;
    bonusMultiple: number;
    extField: string;
  }
  
  interface TicketItemCode {
    bigPrize: boolean;
    luckyNumbers: number[];
    myNumbers: number[];
    payout: number;
    topPrize: boolean;
    win: boolean;
  }
  
  interface myNumbers {
      value: number;
      win: number;
    
  }
  