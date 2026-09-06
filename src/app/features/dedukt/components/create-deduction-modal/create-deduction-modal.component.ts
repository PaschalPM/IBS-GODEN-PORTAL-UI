import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Employee } from '../../../../core/models/employee.model';
import { DeduktService } from '../../../../core/services/dedukt.service';
import { SettingsService } from '../../../../core/services/settings.service';
import { CurrencyNairaPipe } from '../../../../shared/pipes/currency-naira.pipe';

@Component({
  selector: 'app-create-deduction-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyNairaPipe],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#C4C9D7] transform transition-all max-h-[90vh] overflow-y-auto">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-[#E4E7EC]">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-[#E6F4F5] text-[#008E97] flex items-center justify-center font-bold">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-[#081A4D]">Create Deduction Mandate</h3>
              <p class="text-xs text-[#717680]">Initiate a new salary deduction for {{ employee.fullName }}</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-[#717680] hover:text-[#101828] p-1 rounded-lg">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Available Balance Info Banner -->
        <div class="my-4 p-3.5 bg-[#F0F9FF] border border-[#0BA5EC]/30 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span class="text-[#354778] font-medium">Available Deductible Balance:</span>
            <span class="ml-2 font-bold text-[#00498B] text-sm">{{ employee.availableDeductibleBalance | naira }}</span>
          </div>
          <span class="px-2 py-0.5 rounded bg-white text-[#008E97] font-semibold border border-[#008E97]/20 font-mono">
            {{ employee.serviceNumber }}
          </span>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="submitForm()" class="space-y-4">
          
          <!-- Loan Details Section -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <!-- Loan Principal Amount -->
            <div>
              <label class="block text-xs font-semibold text-[#354778] mb-1">
                Loan Amount (₦) <span class="text-rose-500">*</span>
              </label>
              <input 
                type="number" 
                formControlName="loan_amount" 
                (input)="calculateRepayment()"
                placeholder="e.g. 50000"
                class="dedukt-input"
              />
            </div>

            <!-- Tenor (Number of repayments) -->
            <div>
              <label class="block text-xs font-semibold text-[#354778] mb-1">
                Repayments (Tenor, Months) <span class="text-rose-500">*</span>
              </label>
              <input
                type="number"
                formControlName="number_of_repayments"
                (input)="calculateRepayment()"
                min="1"
                placeholder="e.g. 12"
                class="dedukt-input"
              />
            </div>

            <!-- Monthly Repayment Amount -->
            <div>
              <label class="block text-xs font-semibold text-[#354778] mb-1">
                Monthly Repayment (₦) <span class="text-rose-500">*</span>
              </label>
              <input
                type="number"
                formControlName="repayment_amount"
                class="dedukt-input font-semibold text-[#00498B]"
              />
              <p class="text-[11px] text-[#717680] mt-1">Calculated using the preconfigured monthly interest rate ({{ settingsService.monthlyInterestRate() }}%).</p>
              @if (isExceedingBalance()) {
                <p class="text-[11px] text-rose-600 mt-1">Warning: Monthly repayment exceeds available balance!</p>
              }
            </div>

            <!-- Loan Released Date -->
            <div>
              <label class="block text-xs font-semibold text-[#354778] mb-1">
                Loan Released Date <span class="text-rose-500">*</span>
              </label>
              <input
                type="date"
                formControlName="loan_released_date"
                class="dedukt-input"
              />
            </div>

          </div>

          <!-- Identity & Verification Section -->
          <div class="pt-2 border-t border-[#E4E7EC]">
            <h4 class="text-xs font-bold text-[#081A4D] uppercase tracking-wider mb-3">Verification & DigiSign Details</h4>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-[#354778] mb-1">
                  BVN <span class="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  formControlName="bvn" 
                  placeholder="Enter 11-digit BVN"
                  class="dedukt-input font-mono"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-[#354778] mb-1">
                  NIN <span class="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  formControlName="nin" 
                  placeholder="Enter 11-digit NIN"
                  class="dedukt-input font-mono"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-[#354778] mb-1">
                  Borrower Email <span class="text-rose-500">*</span>
                </label>
                <input 
                  type="email" 
                  formControlName="email" 
                  placeholder="borrower@example.com"
                  class="dedukt-input"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-[#354778] mb-1">
                  Callback Email <span class="text-rose-500">*</span>
                </label>
                <input 
                  type="email" 
                  formControlName="callback_email" 
                  placeholder="officer@dedukt.co"
                  class="dedukt-input"
                />
              </div>
            </div>

            <!-- Toggles for DigiSign & WhatsApp -->
            <div class="mt-4 space-y-2 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E4E7EC]">
              <label class="flex items-center space-x-2 text-xs font-medium text-[#101828] cursor-pointer">
                <input 
                  type="checkbox" 
                  formControlName="use_digi_sign"
                  class="rounded text-[#008E97] focus:ring-[#008E97] w-4 h-4"
                />
                <span>Enable DigiSign Biometric Verification</span>
              </label>

              <label class="flex items-center space-x-2 text-xs font-medium text-[#101828] cursor-pointer">
                <input 
                  type="checkbox" 
                  formControlName="allow_whatsapp_signing"
                  class="rounded text-[#008E97] focus:ring-[#008E97] w-4 h-4"
                />
                <span>Allow WhatsApp Biometric Document Signing</span>
              </label>
            </div>

          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-[#E4E7EC] mt-6">
            <button 
              type="button" 
              (click)="close.emit()" 
              class="dedukt-btn-outline"
            >
              Cancel
            </button>

            <button 
              type="submit" 
              [disabled]="form.invalid || isExceedingBalance() || isSubmitting()"
              class="dedukt-btn-teal disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              @if (isSubmitting()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Processing...
              } @else {
                Create Mandate
              }
            </button>
          </div>
        </form>

      </div>
    </div>
  `
})
export class CreateDeductionModalComponent implements OnInit {
  @Input({ required: true }) employee!: Employee;
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private deduktService = inject(DeduktService);
  settingsService = inject(SettingsService);

  form!: FormGroup;
  isSubmitting = signal(false);

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      loan_amount: ['', [Validators.required, Validators.min(1000)]],
      number_of_repayments: [12, [Validators.required, Validators.min(1)]],
      repayment_amount: ['', [Validators.required, Validators.min(100)]],
      loan_released_date: [today, [Validators.required]],
      bvn: [this.employee?.bvn || '', [Validators.required]],
      nin: [this.employee?.nin || '', [Validators.required]],
      email: [this.employee?.email || '', [Validators.required, Validators.email]],
      callback_email: ['', [Validators.required, Validators.email]],
      use_digi_sign: [true],
      allow_whatsapp_signing: [true]
    });
  }

  calculateRepayment() {
    const loan = Number(this.form.get('loan_amount')?.value || 0);
    const tenor = Number(this.form.get('number_of_repayments')?.value || 12);
    if (loan > 0 && tenor > 0) {
      const monthlyRate = this.settingsService.monthlyInterestRate() / 100;
      const totalInterest = loan * monthlyRate * tenor;
      const total = Math.round(loan + totalInterest);
      const monthly = Math.round(total / tenor);

      this.form.patchValue({
        repayment_amount: monthly
      }, { emitEvent: false });
    }
  }

  isExceedingBalance(): boolean {
    if (!this.employee) return false;
    const monthly = Number(this.form?.get('repayment_amount')?.value || 0);
    return monthly > this.employee.availableDeductibleBalance;
  }

  async submitForm() {
    if (this.form.invalid || isNaN(this.form.value.loan_amount) || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    const payload = {
      loan_released_date: this.form.value.loan_released_date,
      loan_amount: Number(this.form.value.loan_amount),
      number_of_repayments: Number(this.form.value.number_of_repayments),
      repayment_amount: Number(this.form.value.repayment_amount),
      employee_uuid: this.employee.id,
      company_uuid: this.employee.companyUuid || 'f3a5c8f7-7c4a-4e6d-9b3a-2e5d7c6a9f41',
      use_digi_sign: !!this.form.value.use_digi_sign,
      bvn: this.form.value.bvn,
      nin: this.form.value.nin,
      email: this.form.value.email,
      callback_email: this.form.value.callback_email,
      allow_whatsapp_signing: !!this.form.value.allow_whatsapp_signing
    };

    const ok = await this.deduktService.createDeductionApi(payload);
    this.isSubmitting.set(false);

    if (ok) {
      this.created.emit();
    }
  }
}
