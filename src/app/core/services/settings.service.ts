import { Injectable, signal } from '@angular/core';
import { ToastService } from './toast.service';

const STORAGE_KEY = 'ibs_monthly_interest_rate';
const DEFAULT_MONTHLY_INTEREST_RATE = 1; // percent

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly _monthlyInterestRate = signal<number>(this.getStoredRate());
  readonly monthlyInterestRate = this._monthlyInterestRate.asReadonly();

  constructor(private toast: ToastService) {}

  private getStoredRate(): number {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved !== null ? Number(saved) : NaN;
    return Number.isFinite(parsed) ? parsed : DEFAULT_MONTHLY_INTEREST_RATE;
  }

  setMonthlyInterestRate(rate: number): void {
    this._monthlyInterestRate.set(rate);
    localStorage.setItem(STORAGE_KEY, String(rate));
    this.toast.success('Settings Updated', `Monthly interest rate set to ${rate}%.`);
  }
}
