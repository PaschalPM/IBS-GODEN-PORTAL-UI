import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-5 right-5 z-50 flex flex-col space-y-2 max-w-md w-full pointer-events-none px-4">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto p-4 rounded-lg shadow-lg border transition-all duration-300 transform translate-y-0 flex items-start space-x-3 backdrop-blur-md"
          [ngClass]="{
            'bg-emerald-950/90 border-emerald-500/50 text-emerald-100': toast.type === 'success',
            'bg-rose-950/90 border-rose-500/50 text-rose-100': toast.type === 'error',
            'bg-amber-950/90 border-amber-500/50 text-amber-100': toast.type === 'warning',
            'bg-sky-950/90 border-sky-500/50 text-sky-100': toast.type === 'info'
          }"
        >
          <!-- Status icon -->
          <div class="flex-shrink-0 mt-0.5">
            @if (toast.type === 'success') {
              <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            } @else if (toast.type === 'error') {
              <svg class="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            } @else if (toast.type === 'warning') {
              <svg class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            } @else {
              <svg class="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            }
          </div>

          <div class="flex-1">
            <h4 class="text-sm font-semibold">{{ toast.title }}</h4>
            <p class="text-xs mt-0.5 opacity-90 leading-relaxed">{{ toast.message }}</p>
          </div>

          <button 
            type="button" 
            (click)="toastService.remove(toast.id)" 
            class="text-white/60 hover:text-white transition-colors focus:outline-none"
            aria-label="Close notification"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);
}

