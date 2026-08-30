import { Component, EventEmitter, Output, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-new-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#C4C9D7] transform transition-all">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-[#E4E7EC]">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-[#E6F4F5] text-[#008E97] flex items-center justify-center font-bold">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-[#081A4D]">Create New Portal User</h3>
              <p class="text-xs text-[#717680]">Add an authorized officer to Dedukt</p>
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

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-[#354778] mb-1">
                First Name <span class="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                formControlName="firstName" 
                placeholder="e.g. Babatunde"
                class="dedukt-input"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-[#354778] mb-1">
                Last Name <span class="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                formControlName="lastName" 
                placeholder="e.g. Jinadu"
                class="dedukt-input"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-[#354778] mb-1">
              Email Address <span class="text-rose-500">*</span>
            </label>
            <input 
              type="email" 
              formControlName="email" 
              placeholder="babatunde.j@dedukt.co"
              class="dedukt-input"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-[#354778] mb-1">
              Assigned Role <span class="text-rose-500">*</span>
            </label>
            <select formControlName="role" class="dedukt-input capitalize">
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
              class="dedukt-btn-teal disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              @if (isSubmitting()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Creating...
              } @else {
                Add User
              }
            </button>
          </div>
        </form>

      </div>
    </div>
  `
})
export class NewUserModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  /** Emits the generated password returned by the API */
  @Output() created = new EventEmitter<string>();

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
      firstName: ['', [Validators.required]],
      lastName:  ['', [Validators.required]],
      email:     ['', [Validators.required, Validators.email]],
      role:      ['staff', [Validators.required]]
    });
  }

  async submitForm() {
    if (this.form.invalid || this.isSubmitting()) return;
    this.isSubmitting.set(true);

    const result = await this.userService.createUser(this.form.value);

    this.isSubmitting.set(false);
    if (result) {
      this.created.emit(result.newPassword);
    }
  }
}

