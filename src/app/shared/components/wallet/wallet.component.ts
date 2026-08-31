import { Component, inject, signal, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeduktService } from '../../../core/services/dedukt.service';
import { CurrencyNairaPipe } from '../../pipes/currency-naira.pipe';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, CurrencyNairaPipe],
  template: `
    @if (mode() === 'header') {
      <!-- Header Compact Widget -->
      <div class="relative">
        <div 
          (click)="toggleDetails()"
          class="flex items-center gap-2.5 bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#86EFAC] px-3.5 py-1.5 rounded-xl cursor-pointer transition-all shadow-2xs group"
          title="Click to view wallet details"
        >
          <!-- Wallet Icon -->
          <div class="w-7 h-7 rounded-lg bg-[#16A34A] text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
          </div>

          <!-- Balance Details -->
          <div class="text-left">
            <div class="flex items-center gap-1.5 leading-none">
              <span class="text-[10px] font-bold text-[#15803D] uppercase tracking-wider">Wallet Balance</span>
              @if (deduktService.loadingWallet()) {
                <svg class="animate-spin w-3 h-3 text-[#16A34A]" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              }
            </div>
            <div class="text-sm font-extrabold text-[#14532D] mt-0.5 tracking-tight font-sans">
              {{ deduktService.walletBalance() | naira }}
            </div>
          </div>

          <!-- Dropdown Chevron -->
          <svg 
            class="w-3.5 h-3.5 text-[#15803D] group-hover:translate-y-0.5 transition-transform" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>

        <!-- Popover Details Modal -->
        @if (showDetails()) {
          <!-- Backdrop for closing -->
          <div class="fixed inset-0 z-40" (click)="showDetails.set(false)"></div>

          <div class="absolute right-0 mt-2 w-80 bg-white border border-[#C4C9D7] rounded-2xl shadow-xl z-50 p-5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div class="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-[#E6F4F5] text-[#008E97] flex items-center justify-center font-bold">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-[#081A4D]">IBS Golden Dedukt Wallet</h4>
                  <p class="text-[10px] text-[#717680]">Disbursement & Mandates Account</p>
                </div>
              </div>
              <button 
                (click)="showDetails.set(false)" 
                class="text-[#717680] hover:text-[#101828] p-1 rounded-md"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Balance Card Inside Popover -->
            <div class="bg-gradient-to-br from-[#081A4D] to-[#00498B] rounded-xl p-4 my-4 text-white shadow-inner">
              <span class="text-[10px] text-[#E6F4F5] uppercase tracking-wider block font-medium">Available Balance</span>
              <div class="text-2xl font-black mt-1">
                {{ deduktService.walletBalance() | naira }}
              </div>
              <div class="flex items-center justify-between mt-3 pt-3 border-t border-white/10 text-[11px] text-[#E6F4F5]">
                <span>Currency: <strong>NGN</strong></span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 mt-4 pt-3 border-t border-[#E4E7EC]">
              <button
                type="button"
                (click)="refreshBalance()"
                [disabled]="deduktService.loadingWallet()"
                class="flex-1 py-2 px-3 bg-[#E6F4F5] hover:bg-[#D0EFF2] text-[#008E97] font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <svg 
                  class="w-3.5 h-3.5" 
                  [ngClass]="{'animate-spin': deduktService.loadingWallet()}" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        }
      </div>
    } @else {
      <!-- Standalone Card Mode (can be embedded anywhere) -->
      <div class="bg-white border border-[#C4C9D7] rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center font-bold">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-[#081A4D]">Dedukt Wallet Balance</h3>
              <p class="text-xs text-[#717680]">Endpoint: /dedukt/utilities/wallet-balance</p>
            </div>
          </div>

          <button
            type="button"
            (click)="refreshBalance()"
            [disabled]="deduktService.loadingWallet()"
            class="px-3 py-1.5 text-xs font-semibold text-[#008E97] bg-[#E6F4F5] hover:bg-[#D0EFF2] rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-60"
          >
            <svg 
              class="w-3.5 h-3.5" 
              [ngClass]="{'animate-spin': deduktService.loadingWallet()}" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        <div class="text-3xl font-black text-[#101828] mb-2 font-sans">
          {{ deduktService.walletBalance() | naira }}
        </div>
        <p class="text-xs text-[#717680]">
          Last updated: {{ deduktService.walletData()?.lastUpdated || 'Just now' }}
        </p>
      </div>
    }
  `
})
export class WalletComponent implements OnInit {
  mode = input<'header' | 'card'>('header');
  deduktService = inject(DeduktService);

  showDetails = signal(false);

  ngOnInit() {
    this.deduktService.loadWalletBalance();
  }

  toggleDetails() {
    this.showDetails.update(v => !v);
  }

  refreshBalance() {
    this.deduktService.loadWalletBalance();
  }
}

