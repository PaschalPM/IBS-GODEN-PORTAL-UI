import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-services-hub',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[#0E0E0F] text-[#F9F8F7] flex flex-col font-sans">
      <!-- IBS Golden Portal Navigation Header -->
      <header class="border-b border-[#1F242A] bg-[#0E0E0F]/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          
          <!-- Logo & Portal Title -->
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E09900] to-[#D99A00] flex items-center justify-center font-extrabold text-black text-lg shadow-md shadow-[#E09900]/20">
              IBS
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-base font-bold tracking-tight text-[#F9F8F7]">IBS GOLDEN PORTAL</span>
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#E09900]/15 text-[#E09900] border border-[#E09900]/30 uppercase">
                  ENTERPRISE
                </span>
              </div>
              <p class="text-xs text-[#6B6B6B]">Institutional Services Gateway</p>
            </div>
          </div>

          <!-- User Info & Logout -->
          <div class="flex items-center space-x-5">
            <div class="hidden sm:flex items-center space-x-3 pr-4 border-r border-[#1F242A]">
              <div class="w-9 h-9 rounded-full bg-[#1F242A] border border-[#E09900]/40 flex items-center justify-center text-[#E09900] font-bold text-sm">
                GA
              </div>
              <div class="text-left">
                <p class="text-xs font-semibold text-[#F9F8F7]">{{ authService.currentUser()?.name }}</p>
                <p class="text-[11px] text-[#D9D9D9]">{{ authService.currentUser()?.role }}</p>
              </div>
            </div>

            <button 
              (click)="authService.logout()"
              class="flex items-center space-x-1.5 text-xs text-[#D9D9D9] hover:text-[#E09900] bg-[#1F242A] hover:bg-[#2A313A] px-3.5 py-2 rounded-lg border border-[#2E353E] transition-all"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Hub Content Area -->
      <main class="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10">
        
        <!-- Welcome Hero Banner -->
        <div class="relative bg-gradient-to-r from-[#1F242A] via-[#1F242A]/80 to-[#0E0E0F] border border-[#2E353E] rounded-3xl p-8 md:p-10 mb-10 overflow-hidden shadow-2xl">
          <div class="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#E09900]/10 to-transparent pointer-events-none"></div>
          <div class="relative z-10 max-w-2xl">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E09900]/15 border border-[#E09900]/30 text-[#E09900] text-xs font-semibold mb-4">
              <span class="w-2 h-2 rounded-full bg-[#E09900]"></span>
              IBS GOLDEN CORE SERVICES
            </span>
            <h1 class="text-3xl md:text-4xl font-extrabold text-[#F9F8F7] tracking-tight">
              Institutional Verification & Settlement Services
            </h1>
            <p class="text-sm md:text-base text-[#D9D9D9] mt-3 leading-relaxed">
              Welcome to the IBS Golden management suite. Access your integrated third-party verification partner services and deduction infrastructure below.
            </p>
          </div>
        </div>

        <!-- Section Title -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold text-[#F9F8F7] flex items-center gap-2">
              Available Verification Services
            </h2>
            <p class="text-xs text-[#6B6B6B] mt-0.5">Select an active partner service provider to begin operations</p>
          </div>
          <span class="text-xs px-3 py-1 rounded-md bg-[#1F242A] text-[#D9D9D9] border border-[#2E353E]">
            1 Active Service
          </span>
        </div>

        <!-- Services Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

          <!-- ACTIVE SERVICE: DEDUKT -->
          <div class="group relative bg-[#1F242A] hover:bg-[#252B33] border-2 border-[#008E97] rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-1 shadow-xl hover:shadow-[#008E97]/20 flex flex-col justify-between">
            
            <!-- Top Status Ribbon -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 rounded-xl bg-[#081A4D] border border-[#0BA5EC]/40 flex items-center justify-center text-white font-black text-xl shadow-md">
                  <span class="text-[#008E97]">D</span>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white group-hover:text-[#0BA5EC] transition-colors">Dedukt</h3>
                  <p class="text-[11px] text-[#0BA5EC] font-medium">Service Partner for IBS Golden</p>
                </div>
              </div>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#12B76A]/15 text-[#12B76A] border border-[#12B76A]/30 text-xs font-semibold">
                <span class="w-1.5 h-1.5 rounded-full bg-[#12B76A]"></span>
                Active
              </span>
            </div>

            <!-- Service Details -->
            <div class="my-3">
              <p class="text-xs text-[#D9D9D9] leading-relaxed">
                Direct government & parastatal employee verification, IPPIS/Staff lookup, deductible balance checks, loan deduction mandate booking, cancellations, and staff administration.
              </p>

              <!-- Modules Included -->
              <div class="mt-4 grid grid-cols-2 gap-2 text-[11px] text-[#D9D9D9]">
                <div class="flex items-center gap-1.5 bg-[#0E0E0F] p-2 rounded border border-[#2E353E]">
                  <span class="text-[#008E97]">✓</span> Employee Search
                </div>
                <div class="flex items-center gap-1.5 bg-[#0E0E0F] p-2 rounded border border-[#2E353E]">
                  <span class="text-[#008E97]">✓</span> Deductions Mandates
                </div>
                <div class="flex items-center gap-1.5 bg-[#0E0E0F] p-2 rounded border border-[#2E353E]">
                  <span class="text-[#008E97]">✓</span> Cancellations Desk
                </div>
                <div class="flex items-center gap-1.5 bg-[#0E0E0F] p-2 rounded border border-[#2E353E]">
                  <span class="text-[#008E97]">✓</span> User Management
                </div>
              </div>
            </div>

            <!-- CTA Button -->
            <div class="mt-6 pt-4 border-t border-[#2E353E]">
              <button 
                (click)="launchDedukt()" 
                class="w-full py-3 px-4 bg-[#008E97] hover:bg-[#007A82] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#008E97]/30 flex items-center justify-center space-x-2 text-sm cursor-pointer"
              >
                <span>Launch Dedukt Service</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- PLACEHOLDER 1: Identity & KYC Engine -->
          <div class="bg-[#14171C] border border-[#232931] rounded-2xl p-6 flex flex-col justify-between opacity-60">
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 rounded-xl bg-[#1F242A] border border-[#2E353E] flex items-center justify-center text-[#6B6B6B] font-bold text-lg">
                    ID
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-[#F9F8F7]">NIN & BVN Core KYC</h3>
                    <p class="text-[11px] text-[#6B6B6B]">Identity Verification</p>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-full bg-[#2A313A] text-[#6B6B6B] text-[11px] font-medium">
                  Coming Soon
                </span>
              </div>
              <p class="text-xs text-[#6B6B6B] leading-relaxed">
                Biometric national identity registry lookups and direct bank verification number matching algorithms.
              </p>
            </div>

            <div class="mt-6 pt-4 border-t border-[#1F242A]">
              <button disabled class="w-full py-2.5 px-4 bg-[#1F242A] text-[#6B6B6B] rounded-xl text-xs font-semibold cursor-not-allowed">
                Integration in Progress
              </button>
            </div>
          </div>

          <!-- PLACEHOLDER 2: Credit Risk Score -->
          <div class="bg-[#14171C] border border-[#232931] rounded-2xl p-6 flex flex-col justify-between opacity-60">
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 rounded-xl bg-[#1F242A] border border-[#2E353E] flex items-center justify-center text-[#6B6B6B] font-bold text-lg">
                    CR
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-[#F9F8F7]">Credit Score Engine</h3>
                    <p class="text-[11px] text-[#6B6B6B]">CRC & FirstCentral Credit</p>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-full bg-[#2A313A] text-[#6B6B6B] text-[11px] font-medium">
                  Coming Soon
                </span>
              </div>
              <p class="text-xs text-[#6B6B6B] leading-relaxed">
                Aggregated credit bureau scores, non-performing loan inquiry and debt consolidation evaluation.
              </p>
            </div>

            <div class="mt-6 pt-4 border-t border-[#1F242A]">
              <button disabled class="w-full py-2.5 px-4 bg-[#1F242A] text-[#6B6B6B] rounded-xl text-xs font-semibold cursor-not-allowed">
                Integration in Progress
              </button>
            </div>
          </div>

        </div>
      </main>

      <!-- Portal Footer -->
      <footer class="border-t border-[#1F242A] py-5 px-6 text-center text-xs text-[#6B6B6B] bg-[#0E0E0F]">
        <p>IBS Golden Verification Portal &bull; Institutional Client Gateway &bull; Powered by Dedukt Integration</p>
      </footer>
    </div>
  `
})
export class ServicesHubComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  launchDedukt() {
    this.router.navigate(['/dedukt/search']);
  }
}

