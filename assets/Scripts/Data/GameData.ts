import { _decorator, Component, Node } from 'cc';
import TicketData from './TicketData';

const { ccclass, property } = _decorator;

@ccclass('GameData')
export class GameData {

  // DEVICE TYPE
  private _deviceType: string = "h5";

  get DeviceType(){
    return this._deviceType;
  }

  set DeviceType(value :string){
    this._deviceType = value;
  }
  
  // CURRENT TICKET DATA
  private _currentTicketData: TicketData = null;
  set TicketData(value: TicketData) {
    this._currentTicketData = value;
  }

  get TicketData() {
    return this._currentTicketData;
  }

  // GAME LIST
  private _gameList: any[] = [];
  set gameList(value: any[]) {
    this._gameList = value;
  }

  get gameList() {
    return this._gameList;
  }

  // GAME ID
  private _gameId: string = "2000802906231672834";

  set gameId(value: string) {
    this._gameId = value;
  }

  get gameId() {
    return this._gameId;
  }

  // GameName
  private _gameName: string = "Go Bananas";
  set gameName(value: string) {
    this._gameName = value;
  }
  get gameName() {
    return this._gameName;
  }

  // CurrentPlayType
  private _currentPlayType: string = "GO_BANANAS2";
  set currentPlayType(value: string) {
    this._currentPlayType = value;
  }
  get currentPlayType() {
    // 当前游戏id对应的玩法
    this._gameList.forEach((game) => {
      if (game.gameId === this._gameId) {
        this._currentPlayType = game.playType;
      }
    });

    return this._currentPlayType;
  }

  // Last Win
  private _lastWinAmount: number = 0;
  set lastWinAmount(value: number) {
    this._lastWinAmount = value;
  }

  get lastWinAmount() {
    return this._lastWinAmount;
  }
  
  // Remaining Cards
  private _remainingCardCount: number = 0;

  set remainingCardCount(value: number) {
    this._remainingCardCount = value;
  }

  get remainingCardCount() {
    return this._remainingCardCount;
  }

  // Card Price
  private _cardPrice: number = 20;
  set cardPrice(value: number) {
    this._cardPrice = value;
  }

  get cardPrice() {
    return this._cardPrice;
  }

  // Auto Play
  private _isAutoPlay: boolean = true;
  set isAutoPlay(value: boolean) {
    this._isAutoPlay = value;
  }

  get isAutoPlay() {
    return this._isAutoPlay;
  }

  // Price List
  private _gamePriceList: number[] = [];
  set gamePriceList(value: number[]) {
    this._gamePriceList = value;
  }

  get gamePriceList() {
    return this._gamePriceList;
  }

  // Unit Price
  private _unitPrice: number = 20;
  set unitPrice(value: number) {
    this._unitPrice = value ?? 20;
  }

  get unitPrice() {
    return this._unitPrice;
  }

  // MaxWinMultiple
  private _maxWinMultiple: number = 14582;
  set maxWinMultiple(value: number) {
    this._maxWinMultiple = value;
  }

  get maxWinMultiple() {
    return this._maxWinMultiple;
  }


  // Token
  private _token: string = "";
  set token(value: string) {
    this._token = value;
  }

  get token() {
    return this._token;
  }

  // aesKey
  private _aesKey: string = "";
  set aesKey(value: string) {
    this._aesKey = value;
  }

  get aesKey() {
    return this._aesKey;
  }

  // CONFIG
  private _config: any = null;
  get config() {
    return this._config;
  }

  private _onlineConfig: any = null;
  private _productId: string = "GV1";
  
  private _urlParams: any = null;
  get urlParams() {
    return this._urlParams;
  }

  private _showBackBtn: boolean = true;
  public topItemDelay: number = 50;
  public contentItemDelay: number = 50;
  public topToContentDelay: number = 100;

  public initConfig() {
    this.getUrlParams();
    const win: any = window;
    this._config = {
      http: "https://lotto-gateway.gelotto-test.com",
      ws: "wss://lotto-scratch-websocket.gelotto-test.com/scratch/ws/lotto/websocket/",
      cdn: "https://minio-api.complexdevops.com/common-base/scratch/",
      sensors: "https://dev-8106.digiplus-bigdata.com/sa?project=BingoPlus",
      staticCdn: "https://detcslitqpsmv.cloudfront.net/img.gurl.ph/",
      otherGamePath: "https://scratch.gelotto-test.com/",
    };
    if (win.getAppConfig) {
      this._config = win.getAppConfig();
    }
    this.getGameConfig();
  }

  private async getGameConfig() {
    if (this.isLocal()) { 
      this._config.menuBundleRemoteUrl = "menu-bundle";
      this._showBackBtn = true;
      this.replaceConfig();
      return;
    }
    
    const cdn = this._config.cdn.split("/scratch/")[0] + "/scratch/";
    const config = await this.loadRemoteJson(
      window.location.origin + "/version",
    );
    this._config.menuBundleRemoteUrl =
      cdn + "menubundleremote/" + config.menu + "/dist/remote/menu-bundle";
    const hideBackBtn = config?.back_button_config?.hide || [];
    hideBackBtn.includes(this._productId)
      ? (this._showBackBtn = false)
      : (this._showBackBtn = true);
    this._onlineConfig = config;
    this.replaceConfig();
    return config;
  }  
  
  public getUrlParams() {
    //const urlParams = new URLSearchParams(window.location.search);
    const urlParams = new URLSearchParams("?token=eyJhbGciOiJSUzI1NiIsInppcCI6IkdaSVAifQ.H4sIAAAAAAAA_y2KOw7CMBAF77J1irU3608uADQoFS3aOAYFkY-MI4EQd8cK6DVPM_OGJc39GvKhhwZ2JwUV3OfrMB1ljD9yrnlbMWF95HmMaYuN8eTZKW2INSmLfitSilN4Fd_u2wJueSif--CCFnSOqLbRi2jsOuWQLsxapISDZGiUtc6hYTQVxOfyB8SE5vMF6QLNWasAAAA.buAJCGQM6knBp78mPmZqf6FO4o8yNOFaDQMCp3CqOH_A7R4pffEIcL9PKmidIsflr01S856onli8eOCVFDEgf9c1w09cD3YgNTMMMuPedQUBOtgCWCQ_2ulrSdxe7KyfUExDhKIZZoQsnTfnUL2AJ4owxA1F9V99lkIPdXuN6kS7e_4LMDMRyin407K34QoL462xoZ2bv7frv2YbFcG28Q2w1VJiy5CfzsFrH503LP9uX-g9NNSw8WUNBgTsob7tprFgEnsJcTANDHt82v-Zlctq9b8CCYAKlZq-Is0sTdMVvBsgdDojmA_Qxa9x7risqDhPdsAWmAJ3t0EaI80MxA&gameId=2000802906231672834&lang=en-US&productId=GV1&gameName=BLAZING%207s&playType=BLAZING_7S_SCRATCH&callbackUrl=https://pilot.gelotto-test.com");
    const token = urlParams.get("token");
    const gameId = urlParams.get("gameId");
    const lang = urlParams.get("lang");
    const callbackUrl = urlParams.get("callbackUrl");
    const playType = urlParams.get("playType");

    const topItemDelay = urlParams.get("topItemDelay");
    const contentItemDelay = urlParams.get("contentItemDelay");
    const topToContentDelay = urlParams.get("topToContentDelay");

    const productId = urlParams.get("productId") || "GV1";
    this._productId = productId;

    if (topItemDelay) {
      this.topItemDelay = Number(topItemDelay);
    }
    if (contentItemDelay) {
      this.contentItemDelay = Number(contentItemDelay);
    }
    if (topToContentDelay) {
      this.topToContentDelay = Number(topToContentDelay);
    }
    if (gameId) {
      this.gameId = gameId;
    }

    this._urlParams = {
      token,
      gameId,
      lang,
      callbackUrl,
      playType,
      productId,
    };

    // 如果playType不为空，则设置当前游戏玩法
    if (playType) {
      this.currentPlayType = playType;
    }
    if (gameId) {
      this.gameId = gameId;
    }
    if (token) {
      this.token = token;
    }
  }

  replaceConfig() {
    for (const key in this._config) {
      this._config[key] = this.removeTrailingSlash(this._config[key]);
    }
  }

  //#region  big and top Amounts
  //TODO: VALUES ARE TEMPORARY, REMOVE INITIAL VALUE ONCE WE CONNECT TO API
  private _bigAmount: string = "100,2000";
  //TODO: VALUES ARE TEMPORARY, REMOVE INITIAL VALUE ONCE WE CONNECT TO API
  private _topAmount: string = "20,40";

  initTopAndBigAmount(bigAmount: string, topAmount: string){
    this._bigAmount = bigAmount;
    this._topAmount = topAmount;
  }

  get BigAmount(){
    return this._bigAmount;
  }

  set BigAmount(value: string){
    this._bigAmount = value;
  }

  get TopAmount(){
    return this._topAmount;
  }

  set TopAmount(value: string){
    this._topAmount = value;
  }

  //#endregion

  private removeTrailingSlash(str: string): string {
    if (!str) return str;
    return str.endsWith('/') ? str.slice(0, -1) : str;
  }

  private isLocal() : boolean {
    if (typeof window === "undefined") {
        return false;
    }

    const host = window.location.hostname;
    const port = window.location.port;

    // localhost or 127.0.0.1
    if (host === "localhost" || host === "127.0.0.1") {
        return true;
    }

    // IPv6 localhost
    if (host === "::1") {
        return true;
    }

    // 10.x.x.x 私有 IP 段
    if (/^10\.\d+\.\d+\.\d+$/.test(host)) {
        return true;
    }

    // 192.168.x.x 私有 IP 段
    if (/^192\.168\.\d+\.\d+$/.test(host)) {
        return true;
    }

    // 172.16.0.0 – 172.31.255.255 私有 IP 段
    if (/^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(host)) {
        return true;
    }



    return false;
  }

  async loadRemoteJson(url: string): Promise<any> {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return await res.json();
}
}


