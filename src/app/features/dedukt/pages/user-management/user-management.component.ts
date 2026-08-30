import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { PortalUser } from '../../../../core/models/user.model';
import { NewUserModalComponent } from '../../components/new-user-modal/new-user-modal.component';
import { ChangePasswordModalComponent } from '../../components/change-password-modal/change-password-modal.component';
import { ChangeRoleModalComponent } from '../../components/change-role-modal/change-role-modal.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NewUserModalComponent, ChangePasswordModalComponent, ChangeRoleModalComponent],
  template: `
    <div class="space-y-6">
      
      <!-- Top Title & Action Buttons -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-extrabold text-[#081A4D] tracking-tight">Users Management</h1>
        <div class="flex items-center space-x-3">
          <button 
            (click)="showChangePasswordModal.set(true)"
            class="dedukt-btn-outline px-4 py-2.5 shadow-sm text-sm cursor-pointer"
          >
            Change Password
          </button>
          <button 
            (click)="showNewUserModal.set(true)"
            class="dedukt-btn-teal px-5 py-2.5 shadow-sm text-sm cursor-pointer"
          >
            New User
          </button>
        </div>
      </div>

      <!-- Generated-password banner (shown after creating a user) -->
      @if (generatedPassword()) {
        <div class="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
          <svg class="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
          </svg>
          <div class="flex-1">
            <p class="font-semibold text-emerald-800">User created — share this temporary password</p>
            <p class="text-emerald-700 mt-0.5">
              Generated password: <span class="font-mono font-bold tracking-widest bg-emerald-100 px-2 py-0.5 rounded">{{ generatedPassword() }}</span>
            </p>
            <p class="text-xs text-emerald-600 mt-1">Ask the user to change this immediately after first login.</p>
          </div>
          <button (click)="generatedPassword.set(null)" class="text-emerald-500 hover:text-emerald-700 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }

      <!-- Search -->
      <div class="max-w-xs">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#717680]">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search for items"
            class="dedukt-input pl-9 text-xs"
          />
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white border border-[#C4C9D7] rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr>
                <th class="dedukt-table-th w-16 text-center">#</th>
                <th class="dedukt-table-th">USER</th>
                <th class="dedukt-table-th">EMAIL</th>
                <th class="dedukt-table-th">ROLE</th>
                <th class="dedukt-table-th">JOINED</th>
                <th class="dedukt-table-th w-48">ACTION</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F1F5F9]">

              <!-- Loading skeleton -->
              @if (userService.loading()) {
                @for (i of [1,2,3]; track i) {
                  <tr class="animate-pulse">
                    <td class="dedukt-table-td"><div class="h-3 bg-gray-200 rounded w-6 mx-auto"></div></td>
                    <td class="dedukt-table-td"><div class="h-3 bg-gray-200 rounded w-32"></div></td>
                    <td class="dedukt-table-td"><div class="h-3 bg-gray-200 rounded w-40"></div></td>
                    <td class="dedukt-table-td"><div class="h-3 bg-gray-200 rounded w-20"></div></td>
                    <td class="dedukt-table-td"><div class="h-3 bg-gray-200 rounded w-24"></div></td>
                    <td class="dedukt-table-td"><div class="h-7 bg-gray-200 rounded w-36"></div></td>
                  </tr>
                }
              } @else if (filteredUsers().length > 0) {
                @for (user of filteredUsers(); track user.id; let idx = $index) {
                  <tr class="hover:bg-[#F8FAFC] transition-colors">
                    
                    <!-- Index -->
                    <td class="dedukt-table-td text-center font-bold text-[#101828]">{{ idx + 1 }}</td>

                    <!-- Name -->
                    <td class="dedukt-table-td font-medium text-[#101828]">{{ user.name }}</td>

                    <!-- Email -->
                    <td class="dedukt-table-td text-[#475467]">{{ user.email }}</td>

                    <!-- Role badge -->
                    <td class="dedukt-table-td">
                      <span class="text-[10px] px-2 py-0.5 rounded bg-[#E6F4F5] text-[#00498B] font-semibold border border-[#008E97]/20">
                        {{ user.role }}
                      </span>
                    </td>

                    <!-- Joined date -->
                    <td class="dedukt-table-td text-[#475467] text-xs">
                      {{ user.createdAt | date:'mediumDate' }}
                    </td>

                    <!-- Action Dropdown -->
                    <td class="dedukt-table-td">
                      <div class="relative w-44">
                        <select 
                          (change)="onActionSelect($event, user)" 
                          class="w-full border border-[#0BA5EC] rounded-md px-3 py-2 text-xs font-medium text-[#00498B] bg-white hover:border-[#008E97] transition-all outline-none cursor-pointer pr-8"
                        >
                          <option value="" selected disabled>Select Action</option>
                          <option value="change-role">Change Role</option>
                          <option value="reset-password">Reset Password</option>
                          <option value="delete">Delete</option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#0BA5EC]">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                          </svg>
                        </div>
                      </div>
                    </td>

                  </tr>
                }
              } @else {
                <tr>
                  <td colspan="6" class="p-12 text-center text-[#717680] text-sm">
                    @if (searchQuery) {
                      No users matching "{{ searchQuery }}"
                    } @else {
                      No users found. Click <strong>New User</strong> to add one.
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Reset-password result banner -->
      @if (resetPasswordResult()) {
        <div class="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm">
          <svg class="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
          </svg>
          <div class="flex-1">
            <p class="font-semibold text-blue-800">Password reset successfully</p>
            <p class="text-blue-700 mt-0.5">
              New password: <span class="font-mono font-bold tracking-widest bg-blue-100 px-2 py-0.5 rounded">{{ resetPasswordResult() }}</span>
            </p>
          </div>
          <button (click)="resetPasswordResult.set(null)" class="text-blue-500 hover:text-blue-700 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }

      <!-- Delete Confirmation Dialog -->
      @if (userToDelete()) {
        <div class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#C4C9D7]">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-base font-bold text-[#081A4D]">Confirm User Deletion</h3>
                <p class="text-xs text-[#717680]">This action will revoke all system access.</p>
              </div>
            </div>

            <p class="text-xs text-[#334155] leading-relaxed my-3">
              Are you sure you want to permanently delete <strong class="text-[#101828]">{{ userToDelete()?.name }}</strong> ({{ userToDelete()?.email }})?
            </p>

            <div class="flex items-center justify-end space-x-3 pt-4 border-t border-[#E4E7EC] mt-4">
              <button 
                type="button" 
                (click)="userToDelete.set(null)" 
                class="dedukt-btn-outline text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button 
                type="button" 
                (click)="confirmDelete()" 
                [disabled]="deletingId() === userToDelete()?.id"
                class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold cursor-pointer disabled:opacity-60"
              >
                @if (deletingId() === userToDelete()?.id) { Deleting... } @else { Delete User }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Change Role Modal -->
      @if (userToChangeRole()) {
        <app-change-role-modal 
          [user]="userToChangeRole()!" 
          (close)="userToChangeRole.set(null)"
          (updated)="userToChangeRole.set(null)"
        ></app-change-role-modal>
      }

      <!-- Change Password Modal -->
      @if (showChangePasswordModal()) {
        <app-change-password-modal
          (close)="showChangePasswordModal.set(false)"
          (updated)="showChangePasswordModal.set(false)"
        ></app-change-password-modal>
      }

      <!-- New User Modal -->
      @if (showNewUserModal()) {
        <app-new-user-modal 
          (close)="showNewUserModal.set(false)"
          (created)="onUserCreated($event)"
        ></app-new-user-modal>
      }

    </div>
  `
})
export class UserManagementComponent implements OnInit {
  userService = inject(UserService);

  searchQuery = '';
  showNewUserModal = signal(false);
  showChangePasswordModal = signal(false);
  userToChangeRole = signal<PortalUser | null>(null);
  userToDelete = signal<PortalUser | null>(null);
  deletingId = signal<string | null>(null);
  generatedPassword = signal<string | null>(null);
  resetPasswordResult = signal<string | null>(null);

  filteredUsers = computed(() => {
    const list = this.userService.users();
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  ngOnInit() {
    this.userService.loadUsers();
    this.userService.loadRoles();
  }

  onActionSelect(event: Event, user: PortalUser) {
    const select = event.target as HTMLSelectElement;
    const action = select.value;
    select.value = '';

    if (action === 'change-role') {
      this.userToChangeRole.set(user);
    } else if (action === 'delete') {
      this.userToDelete.set(user);
    } else if (action === 'reset-password') {
      this.handleResetPassword(user);
    }
  }

  async confirmDelete() {
    const user = this.userToDelete();
    if (!user) return;
    this.deletingId.set(user.id);
    await this.userService.deleteUser(user.id);
    this.deletingId.set(null);
    this.userToDelete.set(null);
  }

  async handleResetPassword(user: PortalUser) {
    this.resetPasswordResult.set(null);
    const newPwd = await this.userService.resetPassword(user.id);
    if (newPwd) {
      this.resetPasswordResult.set(newPwd);
    }
  }

  onUserCreated(newPassword: string) {
    this.showNewUserModal.set(false);
    this.generatedPassword.set(newPassword);
  }
}

