import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-[#0E0E0F] text-[#F9F8F7] flex flex-col justify-between relative overflow-hidden font-sans">
      <!-- Background Ambient Glows -->
      <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#E09900]/10 blur-[130px] pointer-events-none"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#D99A00]/10 blur-[130px] pointer-events-none"></div>

      <!-- Top Branding Header -->
      <header class="w-full border-b border-[#1F242A] py-5 px-8 flex items-center justify-between z-10 backdrop-blur-md bg-[#0E0E0F]/80">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E09900] to-[#D99A00] flex items-center justify-center shadow-lg shadow-[#E09900]/20 font-bold text-black text-xl tracking-wider">
            IBS
          </div>
          <div>
            <h1 class="text-lg font-bold tracking-tight text-[#F9F8F7] flex items-center gap-2">
              IBS GOLDEN <span class="text-xs px-2 py-0.5 rounded bg-[#E09900]/20 text-[#E09900] border border-[#E09900]/30 font-medium">VERIFICATION PORTAL</span>
            </h1>
            <p class="text-xs text-[#6B6B6B]">Enterprise Verification & Core Financial Integrations</p>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <span class="text-xs text-[#D9D9D9] flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse"></span>
            System Online
          </span>
        </div>
      </header>

      <!-- Main Login Card Section -->
      <main class="flex-1 flex items-center justify-center p-6 z-10">
        <div class="w-full max-w-md bg-[#1F242A]/90 border border-[#2A313A] rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative">
          
          <!-- Golden top line accent -->
          <div class="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#E09900] to-transparent"></div>

          <div class="text-center mb-8">
            <div class="inline-flex p-3 rounded-2xl bg-[#0E0E0F] border border-[#2A313A] mb-4 text-[#E09900]">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-[#F9F8F7]">Welcome to IBS Golden</h2>
            <p class="text-sm text-[#D9D9D9] mt-1.5">Enter your institutional credentials to access services</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Email -->
            <div>
              <label class="block text-xs font-semibold text-[#D9D9D9] uppercase tracking-wider mb-2">
                Official Email Address
              </label>
              <div class="relative">
                <input 
                  type="email" 
                  formControlName="email"
                  placeholder="name@ibsgolden.com"
                  class="w-full bg-[#0E0E0F] border border-[#2E353E] rounded-lg px-4 py-3 text-sm text-[#F9F8F7] placeholder-[#6B6B6B] focus:border-[#E09900] focus:ring-1 focus:ring-[#E09900] transition-all outline-none"
                  [ngClass]="{'border-rose-500': isFieldInvalid('email')}"
                />
                <span class="absolute right-3.5 top-3.5 text-[#6B6B6B]">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                  </svg>
                </span>
              </div>
              @if (isFieldInvalid('email')) {
                <p class="text-xs text-rose-400 mt-1.5">Please provide a valid official email address</p>
              }
            </div>

            <!-- Password -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-xs font-semibold text-[#D9D9D9] uppercase tracking-wider">
                  Password
                </label>
                <a href="javascript:void(0)" (click)="forgotPassword()" class="text-xs text-[#E09900] hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div class="relative">
                <input 
                  [type]="showPassword() ? 'text' : 'password'" 
                  formControlName="password"
                  placeholder="••••••••••••"
                  class="w-full bg-[#0E0E0F] border border-[#2E353E] rounded-lg px-4 py-3 text-sm text-[#F9F8F7] placeholder-[#6B6B6B] focus:border-[#E09900] focus:ring-1 focus:ring-[#E09900] transition-all outline-none pr-10"
                  [ngClass]="{'border-rose-500': isFieldInvalid('password')}"
                />
                <button 
                  type="button" 
                  (click)="togglePasswordVisibility()"
                  class="absolute right-3.5 top-3.5 text-[#6B6B6B] hover:text-[#D9D9D9] transition-colors"
                >
                  @if (showPassword()) {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  }
                </button>
              </div>
              @if (isFieldInvalid('password')) {
                <p class="text-xs text-rose-400 mt-1.5">Password is required</p>
              }
            </div>

            <!-- Remember Me -->
            <div class="flex items-center">
              <input 
                id="rememberMe" 
                type="checkbox" 
                formControlName="rememberMe"
                class="w-4 h-4 rounded bg-[#0E0E0F] border-[#2E353E] text-[#E09900] focus:ring-[#E09900] focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer"
              />
              <label for="rememberMe" class="ml-2 text-xs text-[#D9D9D9] cursor-pointer select-none">
                Remember this device for 30 days
              </label>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              [disabled]="isLoading()"
              class="w-full py-3.5 px-4 bg-gradient-to-r from-[#E09900] to-[#D99A00] hover:from-[#F5B027] hover:to-[#E09900] text-black font-bold rounded-lg shadow-lg shadow-[#E09900]/25 transition-all transform active:scale-[0.99] flex items-center justify-center space-x-2 text-sm disabled:opacity-50 cursor-pointer"
            >
              @if (isLoading()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Authenticating...</span>
              } @else {
                <span>Sign In to IBS Golden</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              }
            </button>
          </form>
        </div>
      </main>

      <!-- Footer -->
      <footer class="w-full border-t border-[#1F242A] py-4 px-8 text-center text-xs text-[#6B6B6B] z-10 bg-[#0E0E0F]/80">
        <p>© 2026 IBS Golden Portal. All rights reserved. Secure 256-Bit SSL Encrypted Enterprise Channel.</p>
      </footer>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  showPassword = signal(false);
  isLoading = signal(false);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  forgotPassword() {
    alert('Please contact your IBS Golden IT Security Administrator to reset your institutional token.');
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    try {
      await this.authService.login(this.loginForm.value);
      this.router.navigate(['/services']);
    } catch {
      // handled in service
    } finally {
      this.isLoading.set(false);
    }
  }
}
