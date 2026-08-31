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
      <div class="bg-[#0E0E0F] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#2E353E] transform transition-all">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-[#2E353E]">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-[#E09900]/20 text-[#E09900] flex items-center justify-center font-bold">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-[#F9F8F7]">Create New Portal User</h3>
              <p class="text-xs text-[#D9D9D9]">Add an authorized officer to the system</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-[#6B6B6B] hover:text-[#D9D9D9] p-1 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="submitForm()" class="space-y-4 my-4">

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-[#D9D9D9] mb-1">
                First Name <span class="text-rose-400">*</span>
              </label>
              <input 
                type="text" 
                formControlName="firstName" 
                placeholder="e.g. Babatunde"
                class="w-full px-3 py-2 bg-[#1F242A] border border-[#2E353E] rounded-lg text-[#F9F8F7] placeholder-[#6B6B6B] focus:outline-none focus:border-[#E09900] focus:ring-1 focus:ring-[#E09900]/50 text-xs transition-all"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-[#D9D9D9] mb-1">
                Last Name <span class="text-rose-400">*</span>
              </label>
              <input 
                type="text" 
                formControlName="lastName" 
                placeholder="e.g. Jinadu"
                class="w-full px-3 py-2 bg-[#1F242A] border border-[#2E353E] rounded-lg text-[#F9F8F7] placeholder-[#6B6B6B] focus:outline-none focus:border-[#E09900] focus:ring-1 focus:ring-[#E09900]/50 text-xs transition-all"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-[#D9D9D9] mb-1">
              Email Address <span class="text-rose-400">*</span>
            </label>
            <input 
              type="email" 
              formControlName="email" 
              placeholder="user@ibsgolden.com"
              class="w-full px-3 py-2 bg-[#1F242A] border border-[#2E353E] rounded-lg text-[#F9F8F7] placeholder-[#6B6B6B] focus:outline-none focus:border-[#E09900] focus:ring-1 focus:ring-[#E09900]/50 text-xs transition-all"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-[#D9D9D9] mb-1">
              Assigned Role <span class="text-rose-400">*</span>
            </label>
            <select formControlName="roleId" class="w-full px-3 py-2 bg-[#1F242A] border border-[#2E353E] rounded-lg text-[#F9F8F7] focus:outline-none focus:border-[#E09900] focus:ring-1 focus:ring-[#E09900]/50 text-xs transition-all capitalize cursor-pointer">
              @if (roles().length > 0) {
                @for (role of roles(); track role.id) {
                  <option [ngValue]="role.id">{{ role.name }}</option>
                }
              } @else {
                <option [ngValue]="null" disabled>Loading roles...</option>
              }
            </select>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-[#2E353E] mt-6">
            <button 
              type="button" 
              (click)="close.emit()" 
              class="px-4 py-2 text-xs font-semibold text-[#D9D9D9] bg-[#1F242A] border border-[#2E353E] hover:bg-[#252B33] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button 
              type="submit" 
              [disabled]="form.invalid || isSubmitting()"
              class="px-4 py-2 text-xs font-semibold text-[#0E0E0F] bg-[#E09900] hover:bg-[#FDB022] rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
  /** Emits the created user's email and the generated temporary password */
  @Output() created = new EventEmitter<{ email: string; password: string }>();

  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  form!: FormGroup;
  isSubmitting = signal(false);

  roles = this.userService.roles;

  ngOnInit() {
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName:  ['', [Validators.required]],
      email:     ['', [Validators.required, Validators.email]],
      roleId:    [null, [Validators.required]]
    });

    if (!this.roles().length) {
      this.userService.loadRoles().then(() => {
        const firstRole = this.roles()[0];
        if (firstRole) {
          this.form.patchValue({ roleId: firstRole.id });
        }
      });
    } else {
      this.form.patchValue({ roleId: this.roles()[0].id });
    }
  }

  async submitForm() {
    if (this.form.invalid || this.isSubmitting()) return;
    this.isSubmitting.set(true);

    const result = await this.userService.createUser(this.form.value);

    this.isSubmitting.set(false);
    if (result) {
      this.created.emit({ email: result.user.email, password: result.newPassword });
    }
  }
}

