import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ChangePasswordModalComponent } from '../dedukt/components/change-password-modal/change-password-modal.component';

@Component({
  selector: 'app-services-hub',
  standalone: true,
  imports: [CommonModule, ChangePasswordModalComponent],
  template: `
    <div class="min-h-screen bg-[#0E0E0F] text-[#F9F8F7] flex flex-col font-sans">
      <!-- IBS Golden Portal Navigation Header -->
      <header class="border-b border-[#1F242A] bg-[#0E0E0F]/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          
          <!-- Logo & Portal Title -->
          <div class="flex items-center space-x-3">
            <img 
              src="images/ibs-logo.jpg" 
              alt="IBS Golden" 
              class="w-10 h-10 rounded-xl object-cover shadow-md shadow-[#E09900]/20 border border-[#E09900]/40"
            />
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
                {{ (authService.currentUser()?.name || 'User').substring(0, 2).toUpperCase() }}
              </div>
              <div class="text-left">
                <p class="text-xs font-semibold text-[#F9F8F7]">{{ authService.currentUser()?.name }}</p>
                <p class="text-[11px] text-[#D9D9D9]">{{ authService.currentUser()?.role }}</p>
              </div>
            </div>

            <button
              (click)="showChangePasswordModal.set(true)"
              class="flex items-center space-x-1.5 text-xs text-[#D9D9D9] hover:text-[#E09900] bg-[#1F242A] hover:bg-[#2A313A] px-3.5 py-2 rounded-lg border border-[#2E353E] transition-all cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <span>Change Password</span>
            </button>

            <button
              (click)="showLogoutModal.set(true)"
              class="flex items-center space-x-1.5 text-xs text-[#D9D9D9] hover:text-[#E09900] bg-[#1F242A] hover:bg-[#2A313A] px-3.5 py-2 rounded-lg border border-[#2E353E] transition-all cursor-pointer"
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
            
            <!-- Top Status Ribbon with Dedukt Logo -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="h-12 px-3.5 rounded-xl bg-white flex items-center justify-center shadow-md border border-[#008E97]/30">
                  <img 
                    src="images/dedukt-logo.png" 
                    alt="Dedukt" 
                    class="h-6 object-contain"
                  />
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

          <!-- ADMIN ONLY: USERS MANAGEMENT -->
          @if (authService.currentUser()?.role === 'admin') {
            <div class="group relative bg-[#1F242A] hover:bg-[#252B33] border-2 border-[#E09900] rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-1 shadow-xl hover:shadow-[#E09900]/20 flex flex-col justify-between">
              
              <!-- Top Status Ribbon -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 rounded-xl bg-[#E09900]/20 border border-[#E09900]/40 flex items-center justify-center text-[#E09900] font-bold text-lg">
                    👥
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-white group-hover:text-[#FDB022] transition-colors">Portal Users</h3>
                    <p class="text-[11px] text-[#E09900] font-medium">System Administration</p>
                  </div>
                </div>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E09900]/15 text-[#E09900] border border-[#E09900]/30 text-xs font-semibold">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#E09900]"></span>
                  Admin
                </span>
              </div>

              <!-- Service Details -->
              <div class="my-3">
                <p class="text-xs text-[#D9D9D9] leading-relaxed">
                  Create new portal users, manage user roles and permissions, reset passwords, and administer portal access across the IBS Golden system.
                </p>

                <!-- Modules Included -->
                <div class="mt-4 grid grid-cols-2 gap-2 text-[11px] text-[#D9D9D9]">
                  <div class="flex items-center gap-1.5 bg-[#0E0E0F] p-2 rounded border border-[#2E353E]">
                    <span class="text-[#E09900]">✓</span> User Listings
                  </div>
                  <div class="flex items-center gap-1.5 bg-[#0E0E0F] p-2 rounded border border-[#2E353E]">
                    <span class="text-[#E09900]">✓</span> Create Users
                  </div>
                  <div class="flex items-center gap-1.5 bg-[#0E0E0F] p-2 rounded border border-[#2E353E]">
                    <span class="text-[#E09900]">✓</span> Change Roles
                  </div>
                  <div class="flex items-center gap-1.5 bg-[#0E0E0F] p-2 rounded border border-[#2E353E]">
                    <span class="text-[#E09900]">✓</span> Password Reset
                  </div>
                </div>
              </div>

              <!-- CTA Button -->
              <div class="mt-6 pt-4 border-t border-[#2E353E]">
                <button 
                  (click)="navigateToUsers()" 
                  class="w-full py-3 px-4 bg-[#E09900] hover:bg-[#FDB022] text-[#0E0E0F] font-bold rounded-xl transition-all shadow-lg shadow-[#E09900]/30 flex items-center justify-center space-x-2 text-sm cursor-pointer"
                >
                  <span>Manage Portal Users</span>
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
                </button>
              </div>
            </div>
          }

          <!-- ADMIN ONLY: GENERAL MANAGEMENT -->
          @if (authService.currentUser()?.role === 'admin') {
            <div class="group relative bg-[#1F242A] hover:bg-[#252B33] border-2 border-[#7C5CFC] rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-1 shadow-xl hover:shadow-[#7C5CFC]/20 flex flex-col justify-between">

              <!-- Top Status Ribbon -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 rounded-xl bg-[#7C5CFC]/20 border border-[#7C5CFC]/40 flex items-center justify-center text-[#7C5CFC] font-bold text-lg">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-white group-hover:text-[#8F73FD] transition-colors">General Management</h3>
                    <p class="text-[11px] text-[#7C5CFC] font-medium">System Administration</p>
                  </div>
                </div>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#7C5CFC]/15 text-[#7C5CFC] border border-[#7C5CFC]/30 text-xs font-semibold">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#7C5CFC]"></span>
                  Admin
                </span>
              </div>

              <!-- Service Details -->
              <div class="my-3">
                <p class="text-xs text-[#D9D9D9] leading-relaxed">
                  Configure system-wide settings applied across deduction mandates, starting with the monthly interest rate.
                </p>

                <!-- Modules Included -->
                <div class="mt-4 grid grid-cols-2 gap-2 text-[11px] text-[#D9D9D9]">
                  <div class="flex items-center gap-1.5 bg-[#0E0E0F] p-2 rounded border border-[#2E353E]">
                    <span class="text-[#7C5CFC]">✓</span> Interest Rate
                  </div>
                  <div class="flex items-center gap-1.5 bg-[#0E0E0F] p-2 rounded border border-[#2E353E] opacity-50">
                    <span class="text-[#7C5CFC]">•</span> More Coming Soon
                  </div>
                </div>
              </div>

              <!-- CTA Button -->
              <div class="mt-6 pt-4 border-t border-[#2E353E]">
                <button
                  (click)="navigateToSettings()"
                  class="w-full py-3 px-4 bg-[#7C5CFC] hover:bg-[#8F73FD] text-[#0E0E0F] font-bold rounded-xl transition-all shadow-lg shadow-[#7C5CFC]/30 flex items-center justify-center space-x-2 text-sm cursor-pointer"
                >
                  <span>Manage Settings</span>
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
                </button>
              </div>
            </div>
          }

        </div>
      </main>

      <!-- Portal Footer -->
      <footer class="border-t border-[#1F242A] py-5 px-6 text-center text-xs text-[#6B6B6B] bg-[#0E0E0F]">
        <p>IBS Golden Verification Portal &bull; Institutional Client Gateway &bull; Powered by Dedukt Integration</p>
      </footer>

      <!-- Logout Confirmation Modal -->
      @if (showLogoutModal()) {
        <!-- Backdrop -->
        <div 
          class="fixed inset-0 bg-black/50 z-40" 
          (click)="showLogoutModal.set(false)"
        ></div>

        <!-- Modal -->
        <div class="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div class="bg-[#0E0E0F] rounded-2xl shadow-2xl max-w-sm w-full border border-[#2E353E] animate-in fade-in zoom-in-95 duration-200">
            
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-rose-950 to-red-950 px-6 py-4 border-b border-[#2E353E] rounded-t-2xl">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-rose-900 text-rose-400 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
                <div>
                  <h2 class="text-lg font-bold text-[#F9F8F7]">Confirm Logout</h2>
                  <p class="text-xs text-[#D9D9D9] mt-0.5">You are about to sign out</p>
                </div>
              </div>
            </div>

            <!-- Modal Body -->
            <div class="px-6 py-5">
              <p class="text-sm text-[#D9D9D9] leading-relaxed">
                Are you sure you want to sign out of <strong>IBS Golden Portal</strong>?
              </p>
              <p class="text-xs text-[#6B6B6B] mt-2.5">
                You will need to log in again with your credentials to access your account.
              </p>
            </div>

            <!-- Modal Footer -->
            <div class="bg-[#1F242A] px-6 py-4 border-t border-[#2E353E] rounded-b-2xl flex items-center gap-3">
              <button
                type="button"
                (click)="showLogoutModal.set(false)"
                class="flex-1 px-4 py-2.5 text-sm font-semibold text-[#D9D9D9] bg-[#0E0E0F] border border-[#2E353E] hover:bg-[#252B33] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="confirmLogout()"
                class="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Change Password Modal -->
      @if (showChangePasswordModal()) {
        <app-change-password-modal
          (close)="showChangePasswordModal.set(false)"
          (updated)="showChangePasswordModal.set(false)"
        ></app-change-password-modal>
      }
    </div>
  `
})
export class ServicesHubComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  showLogoutModal = signal(false);
  showChangePasswordModal = signal(false);

  launchDedukt() {
    this.router.navigate(['/dedukt/search']);
  }

  navigateToUsers() {
    this.router.navigate(['/users']);
  }

  navigateToSettings() {
    this.router.navigate(['/settings']);
  }

  confirmLogout() {
    this.showLogoutModal.set(false);
    this.authService.logout();
  }
}
