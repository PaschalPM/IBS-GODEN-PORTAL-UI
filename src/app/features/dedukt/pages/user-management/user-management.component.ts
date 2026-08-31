import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { PortalUser } from '../../../../core/models/user.model';
import { NewUserModalComponent } from '../../components/new-user-modal/new-user-modal.component';
import { ChangeRoleModalComponent } from '../../components/change-role-modal/change-role-modal.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NewUserModalComponent, ChangeRoleModalComponent],
  template: `
    <div class="space-y-6">

      <!-- Top Title & Action Buttons -->
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-extrabold text-[#F9F8F7] tracking-tight">Portal Users Management</h1>
        <div class="flex items-center space-x-3">
          <button
            (click)="showNewUserModal.set(true)"
            class="px-5 py-2.5 text-xs font-semibold text-[#0E0E0F] bg-[#E09900] hover:bg-[#FDB022] rounded-lg transition-colors cursor-pointer shadow-lg shadow-[#E09900]/30"
          >
            New User
          </button>
        </div>
      </div>

      <!-- Generated-password banner (shown after creating a user) -->
      @if (generatedCredentials(); as creds) {
        <div class="relative bg-gradient-to-br from-[#12B76A]/15 to-[#12B76A]/5 border border-[#12B76A]/30 rounded-2xl p-5 shadow-lg shadow-[#12B76A]/5">

          <!-- Dismiss -->
          <button
            (click)="generatedCredentials.set(null)"
            class="absolute top-4 right-4 text-[#12B76A]/50 hover:text-[#12B76A] transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <div class="flex items-start gap-3 pr-8">
            <div class="w-10 h-10 rounded-xl bg-[#12B76A]/20 border border-[#12B76A]/30 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-[#12B76A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="font-bold text-[#F9F8F7]">User Created Successfully</h3>
                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#12B76A]/20 text-[#12B76A] border border-[#12B76A]/30">
                  Temporary Password
                </span>
              </div>
              <p class="text-xs text-[#12B76A]/70 mt-1">Share these credentials with the user — they'll be asked to change the password on first login.</p>

              <!-- Credentials -->
              <div class="mt-3.5 bg-[#0E0E0F]/50 border border-[#12B76A]/20 rounded-xl divide-y divide-[#12B76A]/15 overflow-hidden">
                <div class="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span class="text-[10px] font-semibold uppercase tracking-wider text-[#12B76A]/60 shrink-0">Email</span>
                  <span class="text-xs font-mono text-[#F9F8F7] truncate">{{ creds.email }}</span>
                </div>
                <div class="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span class="text-[10px] font-semibold uppercase tracking-wider text-[#12B76A]/60 shrink-0">Password</span>
                  <span class="text-xs font-mono font-bold tracking-widest text-[#F9F8F7]">{{ creds.password }}</span>
                </div>
              </div>

              <button
                (click)="copyCredentials(creds)"
                class="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#0E0E0F] bg-[#12B76A] hover:bg-[#0FA05C] px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
              >
                @if (justCopied()) {
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Copied to Clipboard
                } @else {
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  Copy Email & Password
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Search -->
      <div class="max-w-xs">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B6B6B]">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input 
            type="text" 
            [ngModel]="searchQuery()" 
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Search users by name, email or role..."
            class="w-full pl-9 pr-4 py-2.5 text-xs bg-[#1F242A] border border-[#2E353E] rounded-lg text-[#F9F8F7] placeholder-[#6B6B6B] focus:outline-none focus:border-[#E09900] focus:ring-1 focus:ring-[#E09900]/50 transition-all"
          />
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-[#14171C] border border-[#2E353E] rounded-xl shadow-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#1F242A] border-b border-[#2E353E]">
                <th class="px-4 py-3 text-xs font-bold text-[#E09900] w-16 text-center">#</th>
                <th class="px-4 py-3 text-xs font-bold text-[#E09900]">USER</th>
                <th class="px-4 py-3 text-xs font-bold text-[#E09900]">EMAIL</th>
                <th class="px-4 py-3 text-xs font-bold text-[#E09900]">ROLE</th>
                <th class="px-4 py-3 text-xs font-bold text-[#E09900]">JOINED</th>
                <th class="px-4 py-3 text-xs font-bold text-[#E09900] w-48">ACTION</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#2E353E]">

              <!-- Loading skeleton -->
              @if (userService.loading()) {
                @for (i of [1,2,3]; track i) {
                  <tr class="animate-pulse bg-[#14171C]">
                    <td class="px-4 py-3"><div class="h-3 bg-[#2E353E] rounded w-6 mx-auto"></div></td>
                    <td class="px-4 py-3"><div class="h-3 bg-[#2E353E] rounded w-32"></div></td>
                    <td class="px-4 py-3"><div class="h-3 bg-[#2E353E] rounded w-40"></div></td>
                    <td class="px-4 py-3"><div class="h-3 bg-[#2E353E] rounded w-20"></div></td>
                    <td class="px-4 py-3"><div class="h-3 bg-[#2E353E] rounded w-24"></div></td>
                    <td class="px-4 py-3"><div class="h-7 bg-[#2E353E] rounded w-36"></div></td>
                  </tr>
                }
              } @else if (filteredUsers().length > 0) {
                @for (user of filteredUsers(); track user.id; let idx = $index) {
                  <tr class="hover:bg-[#1F242A] transition-colors bg-[#14171C]">
                    
                    <!-- Index -->
                    <td class="px-4 py-3 text-center font-bold text-[#D9D9D9] text-xs">{{ idx + 1 }}</td>

                    <!-- Name -->
                    <td class="px-4 py-3 font-medium text-[#F9F8F7] text-xs">{{ user.name }}</td>

                    <!-- Email -->
                    <td class="px-4 py-3 text-[#D9D9D9] text-xs">{{ user.email }}</td>

                    <!-- Role badge -->
                    <td class="px-4 py-3">
                      <span class="text-[10px] px-2.5 py-1 rounded-full bg-[#E09900]/20 text-[#FDB022] font-semibold border border-[#E09900]/40">
                        {{ user.role | uppercase }}
                      </span>
                    </td>

                    <!-- Joined date -->
                    <td class="px-4 py-3 text-[#D9D9D9] text-xs">
                      {{ user.createdAt | date:'mediumDate' }}
                    </td>

                    <!-- Action Dropdown -->
                    <td class="px-4 py-3">
                      <div class="relative w-44">
                        <select
                          (change)="onActionSelect($event, user)"
                          class="w-full appearance-none border border-[#E09900]/40 rounded-md px-3 py-2 text-xs font-medium text-[#E09900] bg-[#1F242A] hover:border-[#E09900]/60 focus:border-[#E09900] focus:ring-1 focus:ring-[#E09900]/50 transition-all outline-none cursor-pointer pr-8"
                        >
                          <option value="" selected disabled>Select Action</option>
                          <option value="change-role">Change Role</option>
                          <option value="delete">Delete</option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#E09900]">
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
                  <td colspan="6" class="p-12 text-center text-[#6B6B6B] text-sm bg-[#14171C]">
                    @if (searchQuery()) {
                      No users matching "{{ searchQuery() }}"
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

      <!-- Delete Confirmation Dialog -->
      @if (userToDelete()) {
        <div class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[#0E0E0F] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#2E353E]">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-rose-900 text-rose-400 flex items-center justify-center font-bold">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-base font-bold text-[#F9F8F7]">Confirm User Deletion</h3>
                <p class="text-xs text-[#D9D9D9]">This action will revoke all system access.</p>
              </div>
            </div>

            <p class="text-xs text-[#D9D9D9] leading-relaxed my-3">
              Are you sure you want to permanently delete <strong class="text-[#F9F8F7]">{{ userToDelete()?.name }}</strong> ({{ userToDelete()?.email }})?
            </p>

            <div class="flex items-center justify-end space-x-3 pt-4 border-t border-[#2E353E] mt-4">
              <button 
                type="button" 
                (click)="userToDelete.set(null)" 
                class="px-4 py-2 text-xs font-semibold text-[#D9D9D9] bg-[#1F242A] border border-[#2E353E] hover:bg-[#252B33] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" 
                (click)="confirmDelete()" 
                [disabled]="deletingId() === userToDelete()?.id"
                class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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

  searchQuery = signal('');
  showNewUserModal = signal(false);
  userToChangeRole = signal<PortalUser | null>(null);
  userToDelete = signal<PortalUser | null>(null);
  deletingId = signal<string | null>(null);
  generatedCredentials = signal<{ email: string; password: string } | null>(null);
  justCopied = signal(false);

  filteredUsers = computed(() => {
    const list = this.userService.users();
    const q = this.searchQuery().trim().toLowerCase();
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

  onUserCreated(credentials: { email: string; password: string }) {
    this.showNewUserModal.set(false);
    this.generatedCredentials.set(credentials);
  }

  async copyCredentials(creds: { email: string; password: string }) {
    await navigator.clipboard.writeText(`email: ${creds.email}, password: ${creds.password}`);
    this.justCopied.set(true);
    setTimeout(() => this.justCopied.set(false), 2000);
  }
}
