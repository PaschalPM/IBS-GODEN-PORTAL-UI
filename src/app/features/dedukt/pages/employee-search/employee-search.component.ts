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
import { DeleteDeductionModalComponent } from '../../components/delete-deduction-modal/delete-deduction-modal.component';

@Component({
  selector: 'app-employee-search',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    CurrencyNairaPipe, 
    CreateDeductionModalComponent, 
    CancelDeductionModalComponent,
    DeleteDeductionModalComponent
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
                <select 
                  formControlName="employer" 
                  class="dedukt-input appearance-none bg-white pr-10"
                  [ngClass]="{'border-rose-500': isFieldInvalid('employer')}"
                >
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
              @if (isFieldInvalid('employer')) {
                <p class="text-xs text-rose-500 mt-1">Please select an employer</p>
              }
            </div>

            <!-- Criteria (Only two items: Service Number & Account Number) -->
            <div>
              <label class="block text-sm font-semibold text-[#101828] mb-2">
                <span class="text-rose-500 font-bold">*</span> Criteria
              </label>
              <div class="relative">
                <select 
                  formControlName="criteria" 
                  (change)="onCriteriaChange()" 
                  class="dedukt-input appearance-none bg-white pr-10"
                  [ngClass]="{'border-rose-500': isFieldInvalid('criteria')}"
                >
                  <option value="" disabled>Select Criteria</option>
                  <option value="Service Number">Service Number</option>
                  <option value="Account Number">Account Number</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#717680]">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
              @if (isFieldInvalid('criteria')) {
                <p class="text-xs text-rose-500 mt-1">Please select a search criteria</p>
              }
            </div>

            <!-- Bank Selection (Visible when Account Number is selected) -->
            @if (searchForm.get('criteria')?.value === 'Account Number') {
              <div>
                <label class="block text-sm font-semibold text-[#101828] mb-2">
                  <span class="text-rose-500 font-bold">*</span> Select Bank
                </label>
                <div class="relative">
                  <select 
                    formControlName="bankId" 
                    class="dedukt-input appearance-none bg-white pr-10"
                    [ngClass]="{'border-rose-500': isFieldInvalid('bankId')}"
                  >
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
                {{ 
                  searchForm.get('criteria')?.value === 'Account Number' 
                    ? 'Account Number' 
                    : (searchForm.get('criteria')?.value === 'Service Number' ? 'Service Number' : 'Search Value') 
                }}
              </label>
              <input 
                type="text" 
                formControlName="value"
                [placeholder]="
                  searchForm.get('criteria')?.value === 'Account Number' 
                    ? 'Enter 10-digit account number' 
                    : 'Enter service number'
                "
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
                      <span 
                        class="px-2.5 py-0.5 rounded-full text-xs font-semibold border inline-flex items-center gap-1.5"
                        [ngClass]="{
                          'bg-emerald-500/20 text-emerald-300 border-emerald-400/40': emp.status === 'Active',
                          'bg-amber-500/20 text-amber-300 border-amber-400/40': emp.status === 'Suspended',
                          'bg-rose-500/20 text-rose-300 border-rose-400/40': emp.status === 'Retired'
                        }"
                      >
                        <span class="w-1.5 h-1.5 rounded-full" 
                          [ngClass]="{
                            'bg-emerald-400': emp.status === 'Active',
                            'bg-amber-400': emp.status === 'Suspended',
                            'bg-rose-400': emp.status === 'Retired'
                          }"
                        ></span>
                        <span>{{ emp.status }}</span>
                      </span>
                    </div>
                    <p class="text-xs text-[#E6F4F5] mt-0.5">{{ emp.employer }} &bull; {{ emp.ministryOrAgency }}</p>
                  </div>
                </div>

                <!-- Action Buttons: Create Deduction & Stoppage Request -->
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
                    (click)="openStopModalForEmployee()"
                    class="px-3.5 py-2 bg-white/10 hover:bg-amber-600/90 text-white rounded-lg text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                    </svg>
                    <span>Stoppage Request</span>
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
                  
                  @if (loadingEmployeeDeductions()) {
                    <div class="p-4 flex items-center justify-center gap-2 bg-gray-50 rounded-lg text-xs text-[#717680] border border-dashed border-[#C4C9D7]">
                      <svg class="animate-spin w-4 h-4 text-[#008E97]" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Loading deduction mandates...
                    </div>
                  } @else if (employeeDeductions().length > 0) {
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
                                <span 
                                  class="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5 border shadow-2xs"
                                  [ngClass]="getDeductionStatusBadgeClass(item.status)"
                                >
                                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="getDeductionStatusDotClass(item.status)"></span>
                                  <span>{{ item.status }}</span>
                                </span>
                              </td>
                              <td class="p-2.5 text-right">
                                @if (isSetupInCurrentMonth(item)) {
                                  <button 
                                    (click)="openDeleteModalForDeduction(item)"
                                    class="text-rose-600 hover:text-rose-800 font-semibold text-[11px] underline cursor-pointer inline-flex items-center gap-1"
                                    title="Permanently delete mandate set up in the current month via /dedukt/deductions/:uuid"
                                  >
                                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                    <span>Delete Mandate</span>
                                  </button>
                                } @else {
                                  <button 
                                    (click)="openStopModalForDeduction(item)"
                                    class="text-amber-700 hover:text-amber-900 font-semibold text-[11px] underline cursor-pointer inline-flex items-center gap-1"
                                    title="Submit deduction stoppage request via /dedukt/deductions/stop"
                                  >
                                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                                    </svg>
                                    <span>Stoppage Request</span>
                                  </button>
                                }
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

      <!-- Stoppage Request Modal (POST /dedukt/deductions/stop) -->
      @if (showStopModal() && activeDeductionToStop()) {
        <app-cancel-deduction-modal
          [deduction]="activeDeductionToStop()!"
          [employee]="selectedEmployee()!"
          (close)="showStopModal.set(false)"
          (cancelled)="onDeductionStopped()"
        ></app-cancel-deduction-modal>
      }

      <!-- Delete Mandate Modal (DELETE /dedukt/deductions/:uuid - current month setup only) -->
      @if (showDeleteModal() && activeDeductionToDelete()) {
        <app-delete-deduction-modal 
          [deduction]="activeDeductionToDelete()!" 
          (close)="showDeleteModal.set(false)"
          (deleted)="onDeductionDeleted()"
        ></app-delete-deduction-modal>
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
  loadingEmployeeDeductions = signal(false);
  
  showCreateModal = signal(false);
  showStopModal = signal(false);
  showDeleteModal = signal(false);
  activeDeductionToStop = signal<Deduction | null>(null);
  activeDeductionToDelete = signal<Deduction | null>(null);

  searchForm: FormGroup = this.fb.group({
    employer: ['', [Validators.required]],
    criteria: ['Service Number', [Validators.required]],
    value: ['', [Validators.required]],
    bankId: [''],
  });

  async ngOnInit() {
    // 1. Restore search state from DeduktService if one already exists
    const savedState = this.deduktService.employeeSearchState();
    if (savedState) {
      this.searchForm.patchValue({
        employer: savedState.employer,
        criteria: savedState.criteria,
        value: savedState.value,
        bankId: savedState.bankId
      });
      this.selectedEmployee.set(savedState.selectedEmployee);
      this.employeeDeductions.set(savedState.employeeDeductions);

      if (savedState.criteria === 'Account Number') {
        this.searchForm.get('bankId')?.setValidators([Validators.required]);
        this.searchForm.get('bankId')?.updateValueAndValidity();
      }
    }

    // 2. Preload employers and banks in background without forcing any defaults
    this.deduktService.loadEmployers();
    this.deduktService.loadBanks();
  }

  isSetupInCurrentMonth(deduction: Deduction): boolean {
    const dateStr = deduction.createdAt || deduction.startDate;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }

  async onCriteriaChange() {
    const crit = this.searchForm.get('criteria')?.value;
    const bankControl = this.searchForm.get('bankId');
    if (crit === 'Account Number') {
      bankControl?.setValidators([Validators.required]);
      this.deduktService.loadBanks();
    } else {
      bankControl?.clearValidators();
      bankControl?.setValue('');
    }
    bankControl?.updateValueAndValidity();
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

    let deductions: Deduction[] = [];
    if (result) {
      deductions = await this.refreshEmployeeDeductions(result.serviceNumber);
      // Refresh wallet balance after successful employee search
      await this.deduktService.loadWalletBalance();
      this.toastService.success('Employee Verified', `Found records for ${result.fullName} (${result.serviceNumber}).`);
    } else {
      this.employeeDeductions.set([]);
    }

    // Persist search state in service so it remains when navigating to other modules and back
    this.deduktService.setEmployeeSearchState({
      employer,
      criteria,
      value,
      bankId: bankId || '',
      selectedEmployee: result,
      employeeDeductions: deductions
    });

    this.isSearching.set(false);
  }

  async refreshEmployeeDeductions(serviceNumber: string): Promise<Deduction[]> {
    this.loadingEmployeeDeductions.set(true);
    const list = await this.deduktService.loadEmployeeDeductions(serviceNumber);
    this.employeeDeductions.set(list);
    this.loadingEmployeeDeductions.set(false);
    return list;
  }

  openCreateModal() {
    this.showCreateModal.set(true);
  }

  openStopModalForEmployee() {
    const activeList = this.employeeDeductions();
    if (activeList.length > 0) {
      this.activeDeductionToStop.set(activeList[0]);
      this.showStopModal.set(true);
    } else {
      this.toastService.info('No Active Mandate', 'This employee has no active deduction mandate for a stoppage request.');
    }
  }

  openStopModalForDeduction(deduction: Deduction) {
    this.activeDeductionToStop.set(deduction);
    this.showStopModal.set(true);
  }

  openDeleteModalForDeduction(deduction: Deduction) {
    this.activeDeductionToDelete.set(deduction);
    this.showDeleteModal.set(true);
  }

  async onDeductionCreated() {
    this.showCreateModal.set(false);
    await this.refreshCurrentEmployeeData();
  }

  async onDeductionStopped() {
    this.showStopModal.set(false);
    this.activeDeductionToStop.set(null);
    await this.refreshCurrentEmployeeData();
  }

  async onDeductionDeleted() {
    this.showDeleteModal.set(false);
    this.activeDeductionToDelete.set(null);
    await this.refreshCurrentEmployeeData();
  }

  private async refreshCurrentEmployeeData() {
    const emp = this.selectedEmployee();
    if (emp) {
      const updated = await this.deduktService.searchEmployee(emp.companyUuid || '', 'Service Number', emp.serviceNumber);
      if (updated) this.selectedEmployee.set(updated);
      const deductions = await this.refreshEmployeeDeductions(emp.serviceNumber);
      this.deduktService.updateSearchedEmployee(updated || emp, deductions);
    }
  }

  getDeductionStatusBadgeClass(status: string): string {
    const s = (status || '').toUpperCase().trim();
    if (['CANCELLED', 'STOPPED', 'REJECTED', 'FAILED'].includes(s)) {
      return 'bg-rose-50 text-rose-700 border-rose-300';
    }
    if (['NEW'].includes(s)) {
      return 'bg-sky-50 text-sky-700 border-sky-300';
    }
    if (['PENDING', 'PENDING_VERIFICATION', 'PENDING_APPROVAL', 'PROCESSING'].includes(s)) {
      return 'bg-amber-50 text-amber-800 border-amber-300';
    }
    if (['ACTIVE', 'APPROVED', 'RUNNING'].includes(s)) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    }
    if (['COMPLETED', 'SETTLED', 'LIQUIDATED', 'PAID'].includes(s)) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-300';
    }
    return 'bg-slate-50 text-slate-700 border-slate-300';
  }

  getDeductionStatusDotClass(status: string): string {
    const s = (status || '').toUpperCase().trim();
    if (['CANCELLED', 'STOPPED', 'REJECTED', 'FAILED'].includes(s)) return 'bg-rose-500';
    if (['NEW'].includes(s)) return 'bg-sky-500';
    if (['PENDING', 'PENDING_VERIFICATION', 'PENDING_APPROVAL', 'PROCESSING'].includes(s)) return 'bg-amber-500';
    if (['ACTIVE', 'APPROVED', 'RUNNING'].includes(s)) return 'bg-emerald-500';
    if (['COMPLETED', 'SETTLED', 'LIQUIDATED', 'PAID'].includes(s)) return 'bg-indigo-500';
    return 'bg-slate-400';
  }
}
