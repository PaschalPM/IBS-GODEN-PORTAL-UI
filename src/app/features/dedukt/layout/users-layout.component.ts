import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserManagementComponent } from '../pages/user-management/user-management.component';

@Component({
  selector: 'app-users-layout',
  standalone: true,
  imports: [CommonModule, UserManagementComponent],
  template: `
    <div class="min-h-screen bg-[#0E0E0F] text-[#F9F8F7] flex flex-col font-sans">
      
      <!-- Topmost IBS Golden Partnership Ribbon -->
      <div class="bg-gradient-to-r from-[#0E0E0F] to-[#14171C] text-[#D9D9D9] px-6 py-3 border-b border-[#E09900]/20 text-xs flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <img 
            src="images/ibs-logo.jpg" 
            alt="IBS Golden" 
            class="w-5 h-5 rounded-md object-cover border border-[#E09900]/40"
          />
          <span class="text-[#E09900] font-bold tracking-widest">IBS GOLDEN</span>
          <span class="text-[#6B6B6B]">•</span>
          <span class="text-[#D9D9D9] font-medium">System Administration</span>
          <span class="text-[#6B6B6B]">•</span>
          <span class="text-[#D9D9D9]">Portal User Management</span>
        </div>

        <button
          (click)="goBack()"
          class="flex items-center space-x-1.5 text-xs text-[#E09900] hover:text-[#FDB022] font-medium transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span>Return to Portal</span>
        </button>
      </div>

      <!-- Main Users Management Content -->
      <main class="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <app-user-management></app-user-management>
      </main>

      <!-- Footer -->
      <footer class="bg-[#14171C] border-t border-[#2E353E] py-4 px-6 text-center text-xs text-[#6B6B6B]">
        <div class="max-w-7xl mx-auto">
          <span>IBS Golden Portal &copy; 2026 &bull; System Administration & User Management</span>
        </div>
      </footer>
    </div>
  `
})
export class UsersLayoutComponent {
  private router = inject(Router);

  goBack() {
    this.router.navigate(['/services']);
  }
}
