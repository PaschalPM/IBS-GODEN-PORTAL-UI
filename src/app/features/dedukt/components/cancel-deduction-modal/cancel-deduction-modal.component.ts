import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Deduction } from '../../../../core/models/deduction.model';
import { DeduktService } from '../../../../core/services/dedukt.service';
import { CurrencyNairaPipe } from '../../../../shared/pipes/currency-naira.pipe';

@Component({
  selector: 'app-cancel-deduction-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyNairaPipe],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#C4C9D7] transform transition-all">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-[#E4E7EC]">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-[#081A4D]">Stop / Cancel Deduction</h3>
              <p class="text-xs text-[#717680]">Revoke or stop active deduction authorization</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-[#717680] hover:text-[#101828] p-1 rounded-lg">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Deduction Details Card -->
        <div class="my-4 p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-2 text-xs">
          <div class="flex justify-between">
            <span class="text-[#475467]">Customer / Service Number:</span>
            <span class="font-bold text-[#101828]">{{ deduction.serviceNumber || deduction.customer }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#475467]">Loan Amount:</span>
            <span class="font-bold text-[#00498B]">{{ deduction.loanAmount | naira }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#475467]">Monthly Deduction:</span>
            <span class="font-semibold text-rose-600">{{ deduction.repaymentAmount | naira }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#475467]">Status:</span>
            <span class="font-bold text-[#081A4D]">{{ deduction.status }}</span>
          </div>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="submitForm()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-[#354778] mb-1">
              Cancellation / Stop Reason <span class="text-rose-500">*</span>
            </label>
            <select formControlName="reason" class="dedukt-input">
              <option value="Early Full Liquidation by Customer">Early Full Liquidation by Customer</option>
              <option value="Employer Transfer & Service Restructuring">Employer Transfer & Service Restructuring</option>
              <option value="Customer Loan Buyout by External Institution">Customer Loan Buyout by External Institution</option>
              <option value="Duplicate Mandate Entry Error">Duplicate Mandate Entry Error</option>
              <option value="Biometric verification was not completed within 24 hours.">Biometric verification not completed</option>
              <option value="Other Administrative Revocation">Other Administrative Revocation</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-[#354778] mb-1">
              Officer Audit Notes
            </label>
            <textarea 
              formControlName="notes" 
              rows="3" 
              placeholder="Enter optional audit remarks..."
              class="dedukt-input resize-none"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-[#E4E7EC] mt-6">
            <button 
              type="button" 
              (click)="close.emit()" 
              class="dedukt-btn-outline"
            >
              Back
            </button>

            <button 
              type="submit" 
              [disabled]="form.invalid || isSubmitting()"
              class="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-md text-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              @if (isSubmitting()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Stopping...
              } @else {
                Confirm Stop Deduction
              }
            </button>
          </div>
        </form>

      </div>
    </div>
  `
})
export class CancelDeductionModalComponent implements OnInit {
  @Input({ required: true }) deduction!: Deduction;
  @Output() close = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private deduktService = inject(DeduktService);

  form!: FormGroup;
  isSubmitting = signal(false);

  ngOnInit() {
    this.form = this.fb.group({
      reason: ['Early Full Liquidation by Customer', [Validators.required]],
      notes: ['']
    });
  }

  async submitForm() {
    if (this.form.invalid || !this.deduction || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    const targetUuid = this.deduction.uuid || this.deduction.id;
    const ok = await this.deduktService.stopDeduction(targetUuid, this.form.value.reason);
    this.isSubmitting.set(false);

    if (ok) {
      this.cancelled.emit();
    }
  }
}

