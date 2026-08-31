import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Deduction } from '../../../../core/models/deduction.model';
import { DeduktService } from '../../../../core/services/dedukt.service';

@Component({
  selector: 'app-delete-deduction-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#C4C9D7] transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-base font-bold text-[#081A4D]">Delete Mandate</h3>
            <p class="text-sm text-[#475467] mt-1.5 leading-relaxed">
              Are you sure you want to delete this mandate?
            </p>
          </div>
          <button (click)="close.emit()" class="text-[#717680] hover:text-[#101828] p-1 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end space-x-3 pt-5 border-t border-[#E4E7EC] mt-6">
          <button 
            type="button" 
            (click)="close.emit()" 
            class="dedukt-btn-outline"
          >
            Cancel
          </button>

          <button 
            type="button"
            (click)="confirmDelete()" 
            [disabled]="isDeleting()"
            class="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            @if (isDeleting()) {
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span>Deleting...</span>
            } @else {
              <span>Confirm Delete</span>
            }
          </button>
        </div>

      </div>
    </div>
  `
})
export class DeleteDeductionModalComponent {
  @Input({ required: true }) deduction!: Deduction;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  private deduktService = inject(DeduktService);
  isDeleting = signal(false);

  async confirmDelete() {
    if (!this.deduction || this.isDeleting()) return;

    this.isDeleting.set(true);
    const targetUuid = this.deduction.uuid || this.deduction.id;
    const ok = await this.deduktService.deleteDeduction(targetUuid);
    this.isDeleting.set(false);

    if (ok) {
      this.deleted.emit();
    }
  }
}

