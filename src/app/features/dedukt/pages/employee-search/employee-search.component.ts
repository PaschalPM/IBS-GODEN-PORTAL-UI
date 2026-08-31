import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeduktService } from '../../../../core/services/dedukt.service';
import { Employee } from '../../../../core/models/employee.model';
import { Deduction } from '../../../../core/models/deduction.model';
import { ToastService } from '../../../../core/services/toast.service';
import { CurrencyNairaPipe } from '../../../../shared/pipes/currency-naira.pipe';
import { CreateDeductionModalComponent } from '../../components/create-deduction-modal/create-deduction-modal.component';
import { CancelDeductionModalComponent } from '../../components/cancel-deduction-modal/cancel-deduction-modal.component';

@Component({
  selector: 'app-employee-search',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    CurrencyNairaPipe, 
    CreateDeductionModalComponent, 
    CancelDeductionModalComponent
  ],
  template: `
    <div class="space-y-8">
      
      <!-- Screen Title -->
      <div>
        <h1 class="text-2xl font-extrabold text-[#081A4D] tracking-tight">Search Employees</h1>
      </div>

      <!-- Cost / Charges Notice -->
      <div class="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-5 py-4 shadow-sm">
        <div class="flex-shrink-0 mt-0.5">
          <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 3l9.09 16.91H2.91L12 3z"/>
          </svg>
        </div>
        <div>
          <p class="text-sm font-bold text-amber-800">Charges Apply</p>
          <p class="text-xs text-amber-700 mt-0.5">
            Each employee verification search attracts a service charge that will be debited from your Dedukt wallet. 
            Please ensure your wallet is adequately funded before proceeding.
          </p>
        </div>
      </div>

      <!-- Main Container -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left: Search Form Card -->
        <div class="lg:col-span-5 bg-white border border-[#C4C9D7] rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 class="text-lg font-bold text-[#081A4D] mb-6">Search Criteria</h2>

          <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="space-y-6">
            
            <!-- Employer (Dropdown populated from GET /dedukt/employers) -->
            <div>
              <label class="block text-sm font-semibold text-[#101828] mb-2">
                <span class="text-rose-500 font-bold">*</span> Employer
              </label>
              <div class="relative">
                <select formControlName="employer" class="dedukt-input appearance-none bg-white pr-10">
                  <option value="" disabled>Select Employer</option>
                  @for (emp of deduktService.employers(); track emp.uuid) {
                    <option [value]="emp.uuid">{{ emp.name }}</option>
                  }
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#717680]">
                  @if (deduktService.loadingEmployers()) {
                    <svg class="animate-spin w-4 h-4 text-[#008E97]" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  }
                </div>
              </div>
            </div>

            <!-- Criteria (Only two items: Service Number & Account Number) -->
            <div>
              <label class="block text-sm font-semibold text-[#101828] mb-2">
                <span class="text-rose-500 font-bold">*</span> Criteria
              </label>
              <div class="relative">
                <select formControlName="criteria" (change)="onCriteriaChange()" class="dedukt-input appearance-none bg-white pr-10">
                  <option value="Service Number">Service Number</option>
                  <option value="Account Number">Account Number</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#717680]">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Bank Selection (Visible when Account Number is selected) -->
            @if (searchForm.get('criteria')?.value === 'Account Number') {
              <div>
                <label class="block text-sm font-semibold text-[#101828] mb-2">
                  <span class="text-rose-500 font-bold">*</span> Select Bank
                </label>
                <div class="relative">
                  <select formControlName="bankId" class="dedukt-input appearance-none bg-white pr-10">
                    <option value="" disabled>Select Bank</option>
                    @for (bank of deduktService.banks(); track bank.id) {
                      <option [value]="bank.id">{{ bank.name }}</option>
                    }
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#717680]">
                    @if (deduktService.loadingBanks()) {
                      <svg class="animate-spin w-4 h-4 text-[#008E97]" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                    } @else {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    }
                  </div>
                </div>
                @if (isFieldInvalid('bankId')) {
                  <p class="text-xs text-rose-500 mt-1">Please select a bank</p>
                }
              </div>
            }

            <!-- Value (Input: Account Number or Service Number) -->
            <div>
              <label class="block text-sm font-semibold text-[#101828] mb-2">
                <span class="text-rose-500 font-bold">*</span> 
                {{ searchForm.get('criteria')?.value === 'Account Number' ? 'Account Number' : 'Service Number' }}
              </label>
              <input 
                type="text" 
                formControlName="value"
                [placeholder]="searchForm.get('criteria')?.value === 'Account Number' ? 'e.g. 0123984712 (10-digit NUBAN)' : 'e.g. 01ED124420040389 or SN-994821'"
                class="dedukt-input font-mono"
                [ngClass]="{'border-rose-500': isFieldInvalid('value')}"
              />
              @if (isFieldInvalid('value')) {
                <p class="text-xs text-rose-500 mt-1">Please enter a valid search value</p>
              }
            </div>

            <!-- Search Employee Button (Teal #008E97) -->
            <button 
              type="submit" 
              [disabled]="isSearching()"
              class="w-full py-3.5 px-4 bg-[#008E97] hover:bg-[#007A82] text-white font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center space-x-2 text-sm disabled:opacity-60 cursor-pointer"
            >
              @if (isSearching()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verifying Employee...</span>
              } @else {
                <span>Search Employee</span>
              }
            </button>
          </form>
        </div>

        <!-- Right: Results & Employee Profile -->
        <div class="lg:col-span-7 space-y-6">
          
          @if (selectedEmployee(); as emp) {
            <!-- Employee Verified Profile Card -->
            <div class="bg-white border border-[#C4C9D7] rounded-xl shadow-sm overflow-hidden">
              
              <!-- Profile Card Header -->
              <div class="bg-gradient-to-r from-[#081A4D] to-[#00498B] p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-center space-x-4">
                  <div class="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-2xl backdrop-blur-sm shadow-inner">
                    {{ emp.fullName.substring(0, 1) }}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h2 class="text-xl font-bold text-white">{{ emp.fullName }}</h2>
                      <span class="px-2 py-0.5 rounded-full bg-[#12B76A]/20 text-[#12B76A] border border-[#12B76A]/40 text-xs font-semibold">
                        {{ emp.status }}
                      </span>
                    </div>
                    <p class="text-xs text-[#E6F4F5] mt-0.5">{{ emp.employer }} &bull; {{ emp.ministryOrAgency }}</p>
                  </div>
                </div>

                <!-- Action Buttons: Create Deduction & Cancel Deduction -->
                <div class="flex items-center gap-2">
                  <button 
                    (click)="openCreateModal()"
                    class="px-3.5 py-2 bg-[#008E97] hover:bg-[#007A82] text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    <span>Create Deduction</span>
                  </button>

                  <button 
                    (click)="openCancelModalForEmployee()"
                    class="px-3.5 py-2 bg-white/10 hover:bg-rose-600/90 text-white rounded-lg text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    <span>Cancel Deduction</span>
                  </button>
                </div>
              </div>

              <!-- Key Highlights Metric Cards (Retirement Date, Deductible Balance, Service Number) -->
              <div class="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E4E7EC] border-b border-[#E4E7EC] bg-[#F8FAFC]">
                
                <!-- Service Number -->
                <div class="p-5 text-center sm:text-left">
                  <span class="text-[11px] font-semibold text-[#717680] uppercase tracking-wider block">Service Number</span>
                  <span class="text-lg font-bold text-[#081A4D] mt-1 block font-mono">{{ emp.serviceNumber }}</span>
                  <span class="text-[11px] text-[#354778]">IPPIS: {{ emp.ippisNumber }}</span>
                </div>

                <!-- Available Deductible Balance -->
                <div class="p-5 text-center sm:text-left bg-[#F0F9FF]">
                  <span class="text-[11px] font-semibold text-[#00498B] uppercase tracking-wider block">Available Deductible Balance</span>
                  <span class="text-xl font-black text-[#008E97] mt-1 block">{{ emp.availableDeductibleBalance | naira }}</span>
                  <span class="text-[11px] text-[#717680]">Max monthly limit</span>
                </div>

                <!-- Retirement Date -->
                <div class="p-5 text-center sm:text-left">
                  <span class="text-[11px] font-semibold text-[#717680] uppercase tracking-wider block">Retirement Date</span>
                  <span class="text-lg font-bold text-[#354778] mt-1 block">{{ emp.retirementDate }}</span>
                  <span class="text-[11px] text-[#12B76A] font-medium">Eligible for long tenor</span>
                </div>

              </div>

              <!-- Detailed Employee Data Tabs/Grid -->
              <div class="p-6">
                <h3 class="text-xs font-bold text-[#717680] uppercase tracking-wider mb-3">Employment & Financial Profile</h3>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div class="bg-[#F8FAFC] p-3 rounded-lg border border-[#E4E7EC]">
                    <span class="text-[#717680] block mb-1">Staff / IPPIS ID</span>
                    <span class="font-bold text-[#101828]">{{ emp.staffNumber }} ({{ emp.ippisNumber }})</span>
                  </div>

                  <div class="bg-[#F8FAFC] p-3 rounded-lg border border-[#E4E7EC]">
                    <span class="text-[#717680] block mb-1">Grade & Cadre</span>
                    <span class="font-bold text-[#101828]">{{ emp.gradeLevel }}</span>
                  </div>

                  <div class="bg-[#F8FAFC] p-3 rounded-lg border border-[#E4E7EC]">
                    <span class="text-[#717680] block mb-1">Salary Account</span>
                    <span class="font-bold text-[#101828]">{{ emp.accountNumber }} &bull; {{ emp.bankName }}</span>
                  </div>

                  <div class="bg-[#F8FAFC] p-3 rounded-lg border border-[#E4E7EC]">
                    <span class="text-[#717680] block mb-1">Bank Verification Number (BVN)</span>
                    <span class="font-bold text-[#101828]">{{ emp.bvn }}</span>
                  </div>

                  <div class="bg-[#F8FAFC] p-3 rounded-lg border border-[#E4E7EC]">
                    <span class="text-[#717680] block mb-1">Monthly Gross Salary</span>
                    <span class="font-bold text-[#101828]">{{ emp.monthlyGrossSalary | naira }}</span>
                  </div>

                  <div class="bg-[#F8FAFC] p-3 rounded-lg border border-[#E4E7EC]">
                    <span class="text-[#717680] block mb-1">Monthly Net Salary</span>
                    <span class="font-bold text-[#101828]">{{ emp.monthlyNetSalary | naira }}</span>
                  </div>
                </div>

                <!-- Existing Employee Mandates List -->
                <div class="mt-6">
                  <h3 class="text-xs font-bold text-[#717680] uppercase tracking-wider mb-3">Active Deduction Mandates</h3>
                  
                  @if (employeeDeductions().length > 0) {
                    <div class="overflow-x-auto border border-[#E4E7EC] rounded-lg">
                      <table class="w-full text-xs text-left">
                        <thead class="bg-[#F8FAFC] text-[#1E293B] font-semibold uppercase">
                          <tr>
                            <th class="p-2.5">Reference</th>
                            <th class="p-2.5">Loan Amount</th>
                            <th class="p-2.5">Monthly</th>
                            <th class="p-2.5">Tenor</th>
                            <th class="p-2.5">Status</th>
                            <th class="p-2.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-[#E4E7EC]">
                          @for (item of employeeDeductions(); track item.id) {
                            <tr class="hover:bg-[#F0F9FF]">
                              <td class="p-2.5 font-medium text-[#00498B]">{{ item.referenceNumber }}</td>
                              <td class="p-2.5">{{ item.loanAmount | naira }}</td>
                              <td class="p-2.5 font-semibold text-[#081A4D]">{{ item.repaymentAmount | naira }}</td>
                              <td class="p-2.5">{{ item.tenor }} mos</td>
                              <td class="p-2.5">
                                <span class="px-2 py-0.5 rounded-full bg-[#12B76A]/15 text-[#12B76A] font-semibold text-[10px]">
                                  {{ item.status }}
                                </span>
                              </td>
                              <td class="p-2.5 text-right">
                                <button 
                                  (click)="openCancelModalForDeduction(item)"
                                  class="text-rose-600 hover:text-rose-800 font-semibold text-[11px] underline"
                                >
                                  Cancel Mandate
                                </button>
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  } @else {
                    <div class="p-4 text-center bg-gray-50 rounded-lg text-xs text-[#717680] border border-dashed border-[#C4C9D7]">
                      No active deduction mandates currently logged for this staff.
                    </div>
                  }
                </div>

              </div>

            </div>
          } @else {
            <!-- Empty state when no employee has been searched yet -->
            <div class="bg-white border border-[#C4C9D7] rounded-xl p-10 text-center shadow-sm flex flex-col items-center justify-center min-h-[350px]">
              <div class="w-16 h-16 rounded-full bg-[#E6F4F5] text-[#008E97] flex items-center justify-center mb-4">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <h3 class="text-base font-bold text-[#081A4D]">No Employee Selected</h3>
              <p class="text-xs text-[#717680] max-w-sm mt-1 leading-relaxed">
                Select an Employer, specify the search Criteria (IPPIS Number, Staff Number, or Account Number), and enter the value to verify records.
              </p>
            </div>
          }

        </div>

      </div>

      <!-- Create Deduction Modal -->
      @if (showCreateModal() && selectedEmployee()) {
        <app-create-deduction-modal 
          [employee]="selectedEmployee()!" 
          (close)="showCreateModal.set(false)"
          (created)="onDeductionCreated()"
        ></app-create-deduction-modal>
      }

      <!-- Cancel Deduction Modal -->
      @if (showCancelModal() && activeDeductionToCancel()) {
        <app-cancel-deduction-modal 
          [deduction]="activeDeductionToCancel()!" 
          (close)="showCancelModal.set(false)"
          (cancelled)="onDeductionCancelled()"
        ></app-cancel-deduction-modal>
      }

    </div>
  `
})
export class EmployeeSearchComponent implements OnInit {
  private fb = inject(FormBuilder);
  deduktService = inject(DeduktService);
  private toastService = inject(ToastService);

  isSearching = signal(false);
  selectedEmployee = signal<Employee | null>(null);
  employeeDeductions = signal<Deduction[]>([]);
  
  showCreateModal = signal(false);
  showCancelModal = signal(false);
  activeDeductionToCancel = signal<Deduction | null>(null);

  searchForm: FormGroup = this.fb.group({
    employer: ['', [Validators.required]],
    criteria: ['Service Number', [Validators.required]],
    value: ['', [Validators.required]],
    bankId: [''],
  });

  async ngOnInit() {
    const employers = await this.deduktService.loadEmployers();
    if (employers.length > 0) {
      const current = this.searchForm.get('employer')?.value;
      const exists = employers.some(e => e.uuid === current);
      if (!exists) {
        this.searchForm.patchValue({ employer: employers[0].uuid });
      }
    }
    // Preload banks
    const banks = await this.deduktService.loadBanks();
    if (banks.length > 0 && !this.searchForm.get('bankId')?.value) {
      this.searchForm.patchValue({ bankId: String(banks[0].id) });
    }
  }

  async onCriteriaChange() {
    const crit = this.searchForm.get('criteria')?.value;
    if (crit === 'Account Number') {
      const banks = await this.deduktService.loadBanks();
      const currentBankId = this.searchForm.get('bankId')?.value;
      if (!currentBankId && banks.length > 0) {
        this.searchForm.patchValue({ bankId: String(banks[0].id) });
      }
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.searchForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  async onSearch() {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    this.isSearching.set(true);
    const { employer, criteria, value, bankId } = this.searchForm.value;

    const result = await this.deduktService.searchEmployee(employer, criteria, value, bankId || '1');
    this.selectedEmployee.set(result);

    if (result) {
      this.refreshEmployeeDeductions(result.serviceNumber);
      this.toastService.success('Employee Verified', `Found records for ${result.fullName} (${result.serviceNumber}).`);
    } else {
      this.employeeDeductions.set([]);
    }

    this.isSearching.set(false);
  }

  refreshEmployeeDeductions(serviceNumber: string) {
    const list = this.deduktService.getEmployeeDeductions(serviceNumber);
    this.employeeDeductions.set(list);
  }

  openCreateModal() {
    this.showCreateModal.set(true);
  }

  openCancelModalForEmployee() {
    const activeList = this.employeeDeductions();
    if (activeList.length > 0) {
      this.activeDeductionToCancel.set(activeList[0]);
      this.showCancelModal.set(true);
    } else {
      this.toastService.info('No Active Mandate', 'This employee has no active deduction mandate to cancel.');
    }
  }

  openCancelModalForDeduction(deduction: Deduction) {
    this.activeDeductionToCancel.set(deduction);
    this.showCancelModal.set(true);
  }

  async onDeductionCreated() {
    this.showCreateModal.set(false);
    const emp = this.selectedEmployee();
    if (emp) {
      const updated = await this.deduktService.searchEmployee(emp.companyUuid || '', 'Service Number', emp.serviceNumber);
      if (updated) this.selectedEmployee.set(updated);
      this.refreshEmployeeDeductions(emp.serviceNumber);
    }
  }

  async onDeductionCancelled() {
    this.showCancelModal.set(false);
    this.activeDeductionToCancel.set(null);
    const emp = this.selectedEmployee();
    if (emp) {
      const updated = await this.deduktService.searchEmployee(emp.companyUuid || '', 'Service Number', emp.serviceNumber);
      if (updated) this.selectedEmployee.set(updated);
      this.refreshEmployeeDeductions(emp.serviceNumber);
    }
  }
}
