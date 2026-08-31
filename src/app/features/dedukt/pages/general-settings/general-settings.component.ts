import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../../core/services/settings.service';

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">

      <h1 class="text-3xl font-extrabold text-[#F9F8F7] tracking-tight">General Management</h1>
      <p class="text-sm text-[#6B6B6B] -mt-4">System-wide configuration applied across all deduction mandates.</p>

      <div class="bg-[#14171C] border border-[#2E353E] rounded-xl p-6 max-w-lg">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-[#7C5CFC]/20 text-[#7C5CFC] flex items-center justify-center font-bold">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2m9-8a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold text-[#F9F8F7]">Loan Interest Configuration</h3>
            <p class="text-xs text-[#6B6B6B]">Used to calculate monthly repayments on new deduction mandates</p>
          </div>
        </div>

        <label class="block text-xs font-semibold text-[#D9D9D9] mb-1">
          Monthly Interest Rate (%) <span class="text-rose-400">*</span>
        </label>
        <div class="flex items-center gap-3">
          <input
            type="number"
            step="0.1"
            min="0"
            [(ngModel)]="rateInput"
            class="w-full px-3 py-2 bg-[#1F242A] border border-[#2E353E] rounded-lg text-[#F9F8F7] placeholder-[#6B6B6B] focus:outline-none focus:border-[#7C5CFC] focus:ring-1 focus:ring-[#7C5CFC]/50 text-xs transition-all"
          />
          <button
            (click)="save()"
            [disabled]="rateInput === null || rateInput < 0"
            class="px-4 py-2 text-xs font-semibold text-[#0E0E0F] bg-[#7C5CFC] hover:bg-[#8F73FD] rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            Save
          </button>
        </div>
        <p class="text-[11px] text-[#6B6B6B] mt-2">
          Current active rate: <span class="font-mono font-semibold text-[#D9D9D9]">{{ settingsService.monthlyInterestRate() }}%</span> per month
        </p>
      </div>

    </div>
  `
})
export class GeneralSettingsComponent {
  settingsService = inject(SettingsService);

  rateInput: number = this.settingsService.monthlyInterestRate();

  save() {
    if (this.rateInput == null || this.rateInput < 0) return;
    this.settingsService.setMonthlyInterestRate(this.rateInput);
  }
}
