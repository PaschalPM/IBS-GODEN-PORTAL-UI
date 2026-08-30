import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortalUser } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-change-role-modal',
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-[#081A4D]">Change User Role</h3>
              <p class="text-xs text-[#717680]">Assign new security access privileges</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-[#717680] hover:text-[#101828] p-1 rounded-lg">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Current User Info -->
        <div class="my-4 p-4 bg-[#F8FAFC] border border-[#E4E7EC] rounded-xl text-xs space-y-1">
          <p class="font-bold text-[#101828] text-sm">{{ user.name }}</p>
          <p class="text-[#475467]">{{ user.email }}</p>
          <p class="text-[#717680] mt-1">Current Role: <span class="font-semibold text-[#00498B] capitalize">{{ user.role }}</span></p>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="submitForm()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-[#354778] mb-1">
              Select New Role <span class="text-rose-500">*</span>
            </label>
            <select formControlName="role" class="dedukt-input font-medium capitalize">
              @if (roles().length > 0) {
                @for (role of roles(); track role.id) {
                  <option [value]="role.name">{{ role.name }}</option>
                }
              } @else {
                <option value="staff">staff</option>
                <option value="admin">admin</option>
              }
            </select>
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
              class="dedukt-btn-teal cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              @if (isSubmitting()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Saving...
              } @else {
                Save New Role
              }
            </button>
          </div>
        </form>

      </div>
    </div>
  `
})
export class ChangeRoleModalComponent implements OnInit {
  @Input({ required: true }) user!: PortalUser;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  form!: FormGroup;
  isSubmitting = signal(false);

  roles = this.userService.roles;

  ngOnInit() {
    if (!this.roles().length) {
      this.userService.loadRoles();
    }

    this.form = this.fb.group({
      role: [this.user?.role?.toLowerCase() || 'staff', [Validators.required]]
    });
  }

  async submitForm() {
    if (this.form.invalid || !this.user || this.isSubmitting()) return;
    this.isSubmitting.set(true);

    const selectedRole = this.form.value.role;
    const roleObj = this.roles().find(r => r.name.toLowerCase() === selectedRole.toLowerCase());

    const ok = await this.userService.changeRole(this.user.id, selectedRole, roleObj?.id);
    this.isSubmitting.set(false);

    if (ok) {
      this.updated.emit();
    }
  }
}

