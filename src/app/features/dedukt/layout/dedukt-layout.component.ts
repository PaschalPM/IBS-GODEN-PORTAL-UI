import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { WalletComponent } from '../../../shared/components/wallet/wallet.component';

@Component({
  selector: 'app-dedukt-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, WalletComponent],
  template: `
    <div class="min-h-screen bg-[#F8FAFC] text-[#101828] flex flex-col font-sans">
      
      <!-- Topmost IBS Golden Partnership Ribbon -->
      <div class="bg-[#0E0E0F] text-[#D9D9D9] px-6 py-2 border-b border-[#1F242A] text-xs flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <img 
            src="images/ibs-logo.jpg" 
            alt="IBS Golden" 
            class="w-5 h-5 rounded-md object-cover border border-[#E09900]/40"
          />
          <span class="text-[#E09900] font-bold tracking-wider">IBS GOLDEN</span>
          <span class="text-[#6B6B6B]">|</span>
          <span class="text-[#D9D9D9]">Verification Portal Channel</span>
          <span class="hidden sm:inline-block text-[#6B6B6B]">&bull; Active Provider: Dedukt Services</span>
        </div>

        <div class="flex items-center space-x-4">
          <a 
            routerLink="/services" 
            class="flex items-center space-x-1.5 text-xs text-[#E09900] hover:text-[#F5B027] font-medium transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            <span>Return to IBS Golden Hub</span>
          </a>
        </div>
      </div>

      <!-- Main Dedukt Header -->
      <header class="bg-white border-b border-[#C4C9D7] sticky top-0 z-20 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            
            <!-- Brand & Name with Official Dedukt Logo -->
            <div class="flex items-center space-x-8">
              <a routerLink="/dedukt/search" class="flex items-center space-x-3">
                <img 
                  src="images/dedukt-logo.png" 
                  alt="Dedukt" 
                  class="h-8 object-contain"
                />
              </a>

              <!-- Desktop Navigation Links -->
              <nav class="hidden md:flex space-x-1">
                <a 
                  routerLink="/dedukt/search" 
                  routerLinkActive="bg-[#E6F4F5] text-[#00498B] font-semibold border-b-2 border-[#008E97]" 
                  class="px-3.5 py-2 rounded-md text-sm text-[#475467] hover:text-[#00498B] hover:bg-[#F0F9FF] transition-all flex items-center gap-2"
                >
                  <svg class="w-4 h-4 text-[#717680]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  Search
                </a>

                <a 
                  routerLink="/dedukt/deductions" 
                  routerLinkActive="bg-[#E6F4F5] text-[#00498B] font-semibold border-b-2 border-[#008E97]" 
                  class="px-3.5 py-2 rounded-md text-sm text-[#475467] hover:text-[#00498B] hover:bg-[#F0F9FF] transition-all flex items-center gap-2"
                >
                  <svg class="w-4 h-4 text-[#717680]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"/>
                  </svg>
                  Deductions
                </a>

                <a 
                  routerLink="/dedukt/cancellations" 
                  routerLinkActive="bg-[#E6F4F5] text-[#00498B] font-semibold border-b-2 border-[#008E97]" 
                  class="px-3.5 py-2 rounded-md text-sm text-[#475467] hover:text-[#00498B] hover:bg-[#F0F9FF] transition-all flex items-center gap-2"
                >
                  <svg class="w-4 h-4 text-[#717680]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Cancellations
                </a>

                <a 
                  routerLink="/dedukt/users" 
                  routerLinkActive="bg-[#E6F4F5] text-[#00498B] font-semibold border-b-2 border-[#008E97]" 
                  class="px-3.5 py-2 rounded-md text-sm text-[#475467] hover:text-[#00498B] hover:bg-[#F0F9FF] transition-all flex items-center gap-2"
                >
                  <svg class="w-4 h-4 text-[#717680]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                  Users Management
                </a>
              </nav>
            </div>

            <!-- Right Wallet, Profile and Status -->
            <div class="flex items-center space-x-4">
              <!-- Live Wallet Balance Component -->
              <app-wallet mode="header"></app-wallet>

              <div class="flex items-center space-x-3 pl-3 border-l border-[#C4C9D7]">
                <div class="w-8 h-8 rounded-full bg-[#00498B] text-white flex items-center justify-center font-bold text-xs">
                  {{ (authService.currentUser()?.name || 'User').substring(0, 2).toUpperCase() }}
                </div>
                <div class="hidden sm:block text-left">
                  <p class="text-xs font-semibold text-[#081A4D]">{{ authService.currentUser()?.name }}</p>
                  <p class="text-[10px] text-[#717680]">{{ authService.currentUser()?.role }}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Mobile Navigation Row -->
        <div class="md:hidden flex overflow-x-auto border-t border-[#E4E7EC] px-4 py-2 space-x-2 bg-[#F8FAFC]">
          <a 
            routerLink="/dedukt/search" 
            routerLinkActive="bg-[#008E97] text-white font-medium" 
            class="px-3 py-1.5 rounded text-xs text-[#354778] whitespace-nowrap"
          >
            Search
          </a>
          <a 
            routerLink="/dedukt/deductions" 
            routerLinkActive="bg-[#008E97] text-white font-medium" 
            class="px-3 py-1.5 rounded text-xs text-[#354778] whitespace-nowrap"
          >
            Deductions
          </a>
          <a 
            routerLink="/dedukt/cancellations" 
            routerLinkActive="bg-[#008E97] text-white font-medium" 
            class="px-3 py-1.5 rounded text-xs text-[#354778] whitespace-nowrap"
          >
            Cancellations
          </a>
          <a 
            routerLink="/dedukt/users" 
            routerLinkActive="bg-[#008E97] text-white font-medium" 
            class="px-3 py-1.5 rounded text-xs text-[#354778] whitespace-nowrap"
          >
            Users Management
          </a>
        </div>
      </header>

      <!-- Main Router Outlet for Dedukt pages -->
      <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <router-outlet></router-outlet>
      </main>

      <!-- Dedukt Footer -->
      <footer class="bg-white border-t border-[#C4C9D7] py-4 px-6 text-center text-xs text-[#717680]">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Dedukt &copy; 2026 &bull; Official Employee Deduction & Verification Engine</span>
          <span class="text-[#00498B] font-medium">Configured for IBS Golden Portal</span>
        </div>
      </footer>
    </div>
  `
})
export class DeduktLayoutComponent {
  authService = inject(AuthService);
}
