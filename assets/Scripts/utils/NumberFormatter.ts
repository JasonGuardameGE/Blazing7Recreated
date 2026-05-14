import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NumberFormatter')
export class NumberFormatter {

    static formatAmount(amount: number): string {
        if (!amount || !Number.isFinite(amount)) return '0';

        const absAmount = Math.abs(amount);
        const amountStr = absAmount.toString();

        let fractionDigits = 0;

        if (!amountStr.includes('e') && amountStr.includes('.')) {
            fractionDigits = amountStr.split('.')[1].length;
        }

        const decimalsToKeep = Math.min(fractionDigits, 2);
        const truncated = this.truncateNumber(absAmount, decimalsToKeep);
        const raw = this.formatFixedNoRound(truncated, decimalsToKeep);
        const parts = raw.split('.');
        const intPart = parts[0];
        const fracPart = parts[1];
        const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const sign = amount < 0 ? '-' : '';

        return fracPart ? `${sign}${intWithCommas}.${fracPart}` : `${sign}${intWithCommas}`;
    }

    static formatAmountWithDecimal(amount: number): string {
        if (amount == null || !Number.isFinite(amount)) return '0.00';

        const absAmount = Math.abs(amount);
        const truncated = this.truncateNumber(absAmount, 2);
        const raw = this.formatFixedNoRound(truncated, 2);
        const parts = raw.split('.');
        const intPart = parts[0];
        const fracPart = parts[1] || '00';
        const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const sign = amount < 0 ? '-' : '';

        return `${sign}${intWithCommas}.${fracPart}`;
    }

    static truncateNumber(value: number, decimals: number): number {
        if (!Number.isFinite(value)) return 0;

        const factor = Math.pow(10, decimals);
        const truncated = value < 0 ? Math.ceil(value * factor) : Math.floor(value * factor);

        return truncated / factor;
    }

    static formatFixedNoRound(value: number, decimals: number = 2): string {
        if (!Number.isFinite(value)) return '0';

        const factor = Math.pow(10, decimals);
        const truncated = value < 0 ? Math.ceil(value * factor) : Math.floor(value * factor);
        const absTruncated = Math.abs(truncated / factor);
        const integerPart = Math.floor(absTruncated);
        const sign = truncated < 0 ? '-' : '';

        if (decimals === 0) {
            return `${sign}${integerPart}`;
        }

        const fractionAsInt = Math.floor((absTruncated - integerPart) * factor);

        let fractionStr = fractionAsInt.toString();

        while (fractionStr.length < decimals) {
            fractionStr = `0${fractionStr}`;
        }

        return `${sign}${integerPart}.${fractionStr}`;
    }

    static parseFormattedAmount(value: string): number {
        if (!value) {
            return 0;
        }

        const normalized = value.replace(/,/g, '');
        const parsed = Number(normalized);

        return Number.isFinite(parsed) ? parsed : 0;
    }
}


