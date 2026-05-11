import { _decorator, Component, Node } from 'cc';
import TicketData from './TicketData';

const { ccclass, property } = _decorator;

@ccclass('GameData')
export class GameData {

  private _deviceType: string = "h5";

  get DeviceType(){
    return this._deviceType;
  }

  set DeviceType(value :string){
    this._deviceType = value;
  }
  
  private _currentTicketData: TicketData = null;

  // bigAmount
  //TODO: VALUES ARE TEMPORARY, REMOVE INITIAL VALUE ONCE WE CONNECT TO API
  private _bigAmount: string = "100,2000";

  // totalAmount
  //TODO: VALUES ARE TEMPORARY, REMOVE INITIAL VALUE ONCE WE CONNECT TO API
  private _topAmount: string = "20,40";

  set TicketData(value: TicketData) {
    this._currentTicketData = value;
  }

  get TicketData() {
    return this._currentTicketData;
  }

  private _gameId: string = "2000802906231672834";



  set gameId(value: string) {
    this._gameId = value;
  }

  get gameId() {
    return this._gameId;
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
}


