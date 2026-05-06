import { _decorator, Component, Node } from 'cc';
import TicketData from './TicketData';

const { ccclass, property } = _decorator;

@ccclass('GameData')
export class GameData {

  private _currentTicketData: TicketData = null;

  set currentTicketData(value: TicketData) {
    this._currentTicketData = value;
  }

  get currentTicketData() {
    return this._currentTicketData;
  }
}


