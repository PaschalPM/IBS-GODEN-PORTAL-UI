import { Component, inject, signal, OnInit, input, computed } from '@angular/core';
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
          [ngClass]="getHeaderClasses()"
          class="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl cursor-pointer transition-all shadow-2xs group"
          title="Click to view wallet details"
        >
          <!-- Wallet Icon -->
          <div [ngClass]="getIconClasses()" class="w-7 h-7 rounded-lg text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
          </div>

          <!-- Balance Details -->
          <div class="text-left">
            <div class="flex items-center gap-1.5 leading-none">
              <span [ngClass]="getLabelTextClasses()" class="text-[10px] font-bold uppercase tracking-wider">Wallet Balance</span>
              @if (deduktService.loadingWallet()) {
                <svg [ngClass]="getLabelSpinnerClasses()" class="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              }
            </div>
            <div [ngClass]="getBalanceTextClasses()" class="text-sm font-extrabold mt-0.5 tracking-tight font-sans">
              {{ deduktService.walletBalance() | naira }}
            </div>
          </div>

          <!-- Dropdown Chevron -->
          <svg 
            [ngClass]="getChevronClasses()"
            class="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" 
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

            <!-- Balance Card Inside Popover - Color based on balance -->
            <div [ngClass]="getBalanceCardClasses()" class="rounded-xl p-4 my-4 text-white shadow-inner">
              <span class="text-[10px] text-white/75 uppercase tracking-wider block font-medium">Available Balance</span>
              <div class="text-2xl font-black mt-1">
                {{ deduktService.walletBalance() | naira }}
              </div>
              <div class="flex items-center justify-between mt-3 pt-3 border-t border-white/10 text-[11px] text-white/75">
                <span>Currency: <strong>NGN</strong></span>
              </div>
            </div>

            <!-- Warning Message for Low Balance -->
            @if (walletStatus() === 'critical') {
              <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <div class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 3l9.09 16.91H2.91L12 3z"/>
                  </svg>
                  <div>
                    <p class="text-xs font-bold text-red-800">Critical Balance</p>
                    <p class="text-[10px] text-red-700 mt-0.5">Your wallet balance is critically low. Fund your wallet immediately to continue operations.</p>
                  </div>
                </div>
              </div>
            } @else if (walletStatus() === 'low') {
              <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                <div class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 3l9.09 16.91H2.91L12 3z"/>
                  </svg>
                  <div>
                    <p class="text-xs font-bold text-amber-800">Low Balance</p>
                    <p class="text-[10px] text-amber-700 mt-0.5">Your wallet balance is below ₦10,000. Consider funding your wallet soon.</p>
                  </div>
                </div>
              </div>
            }

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

  // Computed signal for wallet status
  walletStatus = computed(() => {
    const balance = this.deduktService.walletBalance();
    if (balance < 1000) return 'critical';
    if (balance <= 10000) return 'low';
    return 'normal';
  });

  ngOnInit() {
    this.deduktService.loadWalletBalance();
  }

  toggleDetails() {
    this.showDetails.update(v => !v);
  }

  refreshBalance() {
    this.deduktService.loadWalletBalance();
  }

  // Header container classes
  getHeaderClasses(): string {
    const status = this.walletStatus();
    const baseClasses = 'border hover:bg-opacity-75 transition-all';
    
    switch (status) {
      case 'critical':
        return `${baseClasses} bg-red-50 hover:bg-red-100 border-red-300`;
      case 'low':
        return `${baseClasses} bg-amber-50 hover:bg-amber-100 border-amber-300`;
      default:
        return `${baseClasses} bg-[#F0FDF4] hover:bg-[#DCFCE7] border-[#86EFAC]`;
    }
  }

  // Icon background classes
  getIconClasses(): string {
    const status = this.walletStatus();
    
    switch (status) {
      case 'critical':
        return 'bg-red-600';
      case 'low':
        return 'bg-amber-600';
      default:
        return 'bg-[#16A34A]';
    }
  }

  // Label text color classes
  getLabelTextClasses(): string {
    const status = this.walletStatus();
    
    switch (status) {
      case 'critical':
        return 'text-red-700';
      case 'low':
        return 'text-amber-700';
      default:
        return 'text-[#15803D]';
    }
  }

  // Label spinner color classes
  getLabelSpinnerClasses(): string {
    const status = this.walletStatus();
    
    switch (status) {
      case 'critical':
        return 'text-red-600';
      case 'low':
        return 'text-amber-600';
      default:
        return 'text-[#16A34A]';
    }
  }

  // Balance text color classes
  getBalanceTextClasses(): string {
    const status = this.walletStatus();
    
    switch (status) {
      case 'critical':
        return 'text-red-900';
      case 'low':
        return 'text-amber-900';
      default:
        return 'text-[#14532D]';
    }
  }

  // Chevron color classes
  getChevronClasses(): string {
    const status = this.walletStatus();
    
    switch (status) {
      case 'critical':
        return 'text-red-700';
      case 'low':
        return 'text-amber-700';
      default:
        return 'text-[#15803D]';
    }
  }

  // Balance card background classes (for popover)
  getBalanceCardClasses(): string {
    const status = this.walletStatus();
    
    switch (status) {
      case 'critical':
        return 'bg-gradient-to-br from-red-700 to-red-900';
      case 'low':
        return 'bg-gradient-to-br from-amber-600 to-amber-800';
      default:
        return 'bg-gradient-to-br from-[#081A4D] to-[#00498B]';
    }
  }
}

