import { UserInfo } from "@ge/game-common-sdk";

export class GameUserInfo {
    private _userInfo: UserInfo = null;

    get userInfo() {
        return this._userInfo;
    }

    set userInfo(userInfo: UserInfo) {
        this._userInfo = userInfo;
    }

    get balance() {
        return this.userInfo.balance;
    }

    set balance(balance: number) {
        this.userInfo.balance = balance;
    }
}

