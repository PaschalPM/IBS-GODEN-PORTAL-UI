import { Component, EventEmitter, Output, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#C4C9D7] transform transition-all">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-[#E4E7EC]">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-[#E6F4F5] text-[#008E97] flex items-center justify-center font-bold">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-[#081A4D]">Change Password</h3>
              <p class="text-xs text-[#717680]">Update your account security credentials</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-[#717680] hover:text-[#101828] p-1 rounded-lg">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="submitForm()" class="space-y-4 my-4">
          <div>
            <label class="block text-xs font-semibold text-[#354778] mb-1">
              Current Password <span class="text-rose-500">*</span>
            </label>
            <input 
              type="password" 
              formControlName="current_password" 
              placeholder="Enter current password"
              class="dedukt-input"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-[#354778] mb-1">
              New Password <span class="text-rose-500">*</span>
            </label>
            <input 
              type="password" 
              formControlName="new_password" 
              placeholder="Enter new password (min 6 characters)"
              class="dedukt-input"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-[#354778] mb-1">
              Confirm New Password <span class="text-rose-500">*</span>
            </label>
            <input 
              type="password" 
              formControlName="confirm_password" 
              placeholder="Confirm new password"
              class="dedukt-input"
            />
            @if (form.errors?.['mismatch'] && form.get('confirm_password')?.touched) {
              <p class="text-xs text-rose-500 mt-1">Passwords do not match</p>
            }
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
              [disabled]="form.invalid || isSubmitting()"
              class="dedukt-btn-teal disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              @if (isSubmitting()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Updating...
              } @else {
                Update Password
              }
            </button>
          </div>
        </form>

      </div>
    </div>
  `
})
export class ChangePasswordModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  form!: FormGroup;
  isSubmitting = signal(false);

  ngOnInit() {
    this.form = this.fb.group({
      current_password: ['', [Validators.required]],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required]]
    }, {
      validators: (group: FormGroup) => {
        const p1 = group.get('new_password')?.value;
        const p2 = group.get('confirm_password')?.value;
        return p1 === p2 ? null : { mismatch: true };
      }
    });
  }

  async submitForm() {
    if (this.form.invalid || this.isSubmitting()) return;
    this.isSubmitting.set(true);

    const ok = await this.userService.changePassword({
      current_password: this.form.value.current_password,
      new_password: this.form.value.new_password
    });

    this.isSubmitting.set(false);
    if (ok) {
      this.updated.emit();
    }
  }
}
