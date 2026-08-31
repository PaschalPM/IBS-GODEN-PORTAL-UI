import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GeneralSettingsComponent } from '../pages/general-settings/general-settings.component';

@Component({
  selector: 'app-general-layout',
  standalone: true,
  imports: [CommonModule, GeneralSettingsComponent],
  template: `
    <div class="min-h-screen bg-[#0E0E0F] text-[#F9F8F7] flex flex-col font-sans">

      <!-- Topmost IBS Golden Partnership Ribbon -->
      <div class="bg-gradient-to-r from-[#0E0E0F] to-[#14171C] text-[#D9D9D9] px-6 py-3 border-b border-[#7C5CFC]/20 text-xs flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <img
            src="images/ibs-logo.jpg"
            alt="IBS Golden"
            class="w-5 h-5 rounded-md object-cover border border-[#7C5CFC]/40"
          />
          <span class="text-[#7C5CFC] font-bold tracking-widest">IBS GOLDEN</span>
          <span class="text-[#6B6B6B]">•</span>
          <span class="text-[#D9D9D9] font-medium">System Administration</span>
          <span class="text-[#6B6B6B]">•</span>
          <span class="text-[#D9D9D9]">General Management</span>
        </div>

        <button
          (click)="goBack()"
          class="flex items-center space-x-1.5 text-xs text-[#7C5CFC] hover:text-[#8F73FD] font-medium transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span>Return to Portal</span>
        </button>
      </div>

      <!-- Main Content -->
      <main class="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <app-general-settings></app-general-settings>
      </main>

      <!-- Footer -->
      <footer class="bg-[#14171C] border-t border-[#2E353E] py-4 px-6 text-center text-xs text-[#6B6B6B]">
        <div class="max-w-7xl mx-auto">
          <span>IBS Golden Portal &copy; 2026 &bull; System Administration & General Management</span>
        </div>
      </footer>
    </div>
  `
})
export class GeneralLayoutComponent {
  private router = inject(Router);

  goBack() {
    this.router.navigate(['/services']);
  }
}
