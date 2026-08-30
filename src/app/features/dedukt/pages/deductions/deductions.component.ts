import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DeduktService } from '../../../../core/services/dedukt.service';
import { Deduction } from '../../../../core/models/deduction.model';
import { CurrencyNairaPipe } from '../../../../shared/pipes/currency-naira.pipe';
import { CancelDeductionModalComponent } from '../../components/cancel-deduction-modal/cancel-deduction-modal.component';

@Component({
  selector: 'app-deductions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyNairaPipe, CancelDeductionModalComponent],
  template: `
    <div class="space-y-6">
      
      <!-- Top Metrics Cards -->
      <div class="flex flex-wrap gap-4 items-start">
        
        <!-- Card 1: Total Deduction -->
        <div class="bg-white border border-[#C4C9D7] rounded-xl p-5 w-56 shadow-sm">
          <div class="text-xs font-semibold text-[#475467] pb-2 border-b border-[#E4E7EC]">
            Total Deduction
          </div>
          <div class="text-3xl font-black text-[#354778] mt-3">
            {{ filteredDeductions().length }}
          </div>
        </div>

        <!-- Card 2: Total Loan Amount -->
        <div class="bg-white border border-[#C4C9D7] rounded-xl p-5 min-w-56 shadow-sm">
          <div class="text-xs font-semibold text-[#475467] pb-2 border-b border-[#E4E7EC]">
            Total Loan Amount
          </div>
          <div class="text-3xl font-black text-[#354778] mt-3">
            {{ filteredTotalLoanAmount() | naira }}
          </div>
        </div>

      </div>

      <!-- Filter Controls Bar -->
      <div class="bg-white border border-[#C4C9D7] rounded-xl p-6 shadow-sm">
        <form [formGroup]="filterForm" (ngSubmit)="applyFilter()" class="flex flex-wrap lg:flex-nowrap items-end gap-4">
          
          <!-- Search Text -->
          <div class="w-full sm:w-80">
            <label class="block text-xs font-semibold text-[#101828] mb-1.5">
              Search Service Number / Reference
            </label>
            <input 
              type="text" 
              formControlName="searchText" 
              placeholder="e.g. 01ED124420040389"
              class="dedukt-input"
            />
          </div>

          <!-- Start Date -->
          <div class="w-full sm:w-44">
            <label class="block text-xs font-semibold text-[#101828] mb-1.5">
              Start Date
            </label>
            <input 
              type="date" 
              formControlName="startDate" 
              class="dedukt-input text-[#334155]"
            />
          </div>

          <!-- End Date -->
          <div class="w-full sm:w-44">
            <label class="block text-xs font-semibold text-[#101828] mb-1.5">
              End Date
            </label>
            <input 
              type="date" 
              formControlName="endDate" 
              class="dedukt-input text-[#334155]"
            />
          </div>

          <!-- Buttons -->
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button 
              type="submit" 
              class="dedukt-btn-teal px-6 py-2.5 h-[42px] cursor-pointer"
            >
              Search
            </button>
            <button 
              type="button" 
              (click)="resetFilters()" 
              class="dedukt-btn-outline px-4 py-2.5 h-[42px] text-xs cursor-pointer"
            >
              Reset
            </button>
            <button 
              type="button" 
              (click)="exportData()" 
              class="dedukt-btn-outline px-4 py-2.5 h-[42px] text-xs cursor-pointer"
            >
              Export
            </button>
          </div>

        </form>
      </div>

      <!-- Data Table -->
      <div class="bg-white border border-[#C4C9D7] rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr>
                <th class="dedukt-table-th">SERVICE NUMBER</th>
                <th class="dedukt-table-th">LOAN AMOUNT</th>
                <th class="dedukt-table-th">REPAYMENT</th>
                <th class="dedukt-table-th">TENOR</th>
                <th class="dedukt-table-th">PERIOD</th>
                <th class="dedukt-table-th">STATUS</th>
                <th class="dedukt-table-th">DIGISIGN</th>
                <th class="dedukt-table-th text-right w-40">ACTION</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F1F5F9]">

              <!-- Loading Skeleton -->
              @if (deduktService.loadingDeductions()) {
                @for (i of [1,2,3,4]; track i) {
                  <tr class="animate-pulse">
                    <td class="dedukt-table-td"><div class="h-3 bg-gray-200 rounded w-28"></div></td>
                    <td class="dedukt-table-td"><div class="h-3 bg-gray-200 rounded w-20"></div></td>
                    <td class="dedukt-table-td"><div class="h-3 bg-gray-200 rounded w-20"></div></td>
                    <td class="dedukt-table-td"><div class="h-3 bg-gray-200 rounded w-12"></div></td>
                    <td class="dedukt-table-td"><div class="h-3 bg-gray-200 rounded w-28"></div></td>
                    <td class="dedukt-table-td"><div class="h-5 bg-gray-200 rounded w-16"></div></td>
                    <td class="dedukt-table-td"><div class="h-5 bg-gray-200 rounded w-20"></div></td>
                    <td class="dedukt-table-td"><div class="h-7 bg-gray-200 rounded w-24 ml-auto"></div></td>
                  </tr>
                }
              } @else if (filteredDeductions().length > 0) {
                @for (item of filteredDeductions(); track item.id) {
                  <tr class="hover:bg-[#F8FAFC] transition-colors">
                    
                    <!-- Service Number -->
                    <td class="dedukt-table-td">
                      <div class="font-mono font-bold text-xs text-[#00498B]">{{ item.serviceNumber }}</div>
                      <div class="text-[10px] text-[#717680]">{{ item.createdAt | date:'shortDate' }}</div>
                    </td>

                    <!-- Loan Amount -->
                    <td class="dedukt-table-td font-semibold text-[#101828]">
                      {{ item.loanAmount | naira }}
                    </td>

                    <!-- Repayment Amount -->
                    <td class="dedukt-table-td font-semibold text-[#008E97]">
                      {{ item.repaymentAmount | naira }}
                      <span class="block text-[10px] text-[#717680]">Total: {{ item.totalRepayment | naira }}</span>
                    </td>

                    <!-- Tenor -->
                    <td class="dedukt-table-td text-xs font-medium">
                      {{ item.tenor }} mos
                    </td>

                    <!-- Period -->
                    <td class="dedukt-table-td text-xs text-[#475467]">
                      <div>{{ item.startDate || 'N/A' }}</div>
                      @if (item.endDate) {
                        <div class="text-[10px] text-[#717680]">to {{ item.endDate }}</div>
                      }
                    </td>

                    <!-- Status Badge -->
                    <td class="dedukt-table-td">
                      <span 
                        class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                        [ngClass]="{
                          'bg-amber-100 text-amber-800 border border-amber-300': item.status === 'PENDING',
                          'bg-emerald-100 text-emerald-800 border border-emerald-300': item.status === 'NEW' || item.status === 'Active' || item.status === 'ACTIVE',
                          'bg-rose-100 text-rose-800 border border-rose-300': item.status === 'CANCELLED',
                          'bg-blue-100 text-blue-800 border border-blue-300': item.status === 'COMPLETED'
                        }"
                      >
                        {{ item.status }}
                      </span>
                      @if (item.remarks) {
                        <p class="text-[10px] text-[#717680] mt-0.5 max-w-xs truncate" [title]="item.remarks">{{ item.remarks }}</p>
                      }
                    </td>

                    <!-- DigiSign Info -->
                    <td class="dedukt-table-td text-xs">
                      @if (item.digisign?.link) {
                        <a 
                          [href]="item.digisign?.link" 
                          target="_blank" 
                          rel="noopener"
                          class="inline-flex items-center gap-1 text-[11px] font-semibold text-[#008E97] hover:underline"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                          </svg>
                          Sign ({{ item.digisign?.verification_status }})
                        </a>
                      } @else if (item.digisign?.signed_document) {
                        <a 
                          [href]="item.digisign?.signed_document" 
                          target="_blank" 
                          rel="noopener"
                          class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:underline"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          Signed Doc
                        </a>
                      } @else {
                        <span class="text-[10px] text-[#717680]">{{ item.digisign?.verification_status || 'N/A' }}</span>
                      }
                    </td>

                    <!-- Actions -->
                    <td class="dedukt-table-td text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        @if (item.status !== 'CANCELLED') {
                          <button 
                            (click)="openStopModal(item)"
                            class="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors cursor-pointer"
                            title="Stop Deduction"
                          >
                            Stop
                          </button>
                        }

                        <button 
                          (click)="deductionToDelete.set(item)"
                          class="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors cursor-pointer"
                          title="Delete Deduction"
                        >
                          Delete
                        </button>
                      </div>
                    </td>

                  </tr>
                }
              } @else {
                <tr>
                  <td colspan="8" class="p-12 text-center text-[#717680] text-sm">
                    No deduction records found.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Stop / Cancel Modal -->
      @if (deductionToCancel()) {
        <app-cancel-deduction-modal
          [deduction]="deductionToCancel()!"
          (close)="deductionToCancel.set(null)"
          (cancelled)="onDeductionStopped()"
        ></app-cancel-deduction-modal>
      }

      <!-- Delete Confirmation Dialog -->
      @if (deductionToDelete()) {
        <div class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#C4C9D7]">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </div>
              <div>
                <h3 class="text-base font-bold text-[#081A4D]">Confirm Deduction Deletion</h3>
                <p class="text-xs text-[#717680]">Permanently remove this mandate.</p>
              </div>
            </div>

            <p class="text-xs text-[#334155] leading-relaxed my-3">
              Are you sure you want to permanently delete deduction for service number <strong class="text-[#101828]">{{ deductionToDelete()?.serviceNumber }}</strong> ({{ deductionToDelete()?.loanAmount | naira }})?
            </p>

            <div class="flex items-center justify-end space-x-3 pt-4 border-t border-[#E4E7EC] mt-4">
              <button 
                type="button" 
                (click)="deductionToDelete.set(null)" 
                class="dedukt-btn-outline text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button 
                type="button" 
                (click)="confirmDelete()"
                [disabled]="isDeleting()"
                class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold cursor-pointer disabled:opacity-60"
              >
                @if (isDeleting()) { Deleting... } @else { Delete Mandate }
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class DeductionsComponent implements OnInit {
  private fb = inject(FormBuilder);
  deduktService = inject(DeduktService);

  deductionToCancel = signal<Deduction | null>(null);
  deductionToDelete = signal<Deduction | null>(null);
  isDeleting = signal<boolean>(false);

  filterForm: FormGroup = this.fb.group({
    startDate: [''],
    endDate: [''],
    searchText: ['']
  });

  filterParams = signal<{ startDate: string; endDate: string; searchText: string }>({
    startDate: '',
    endDate: '',
    searchText: ''
  });

  ngOnInit() {
    this.deduktService.loadDeductions();
  }

  filteredDeductions = computed(() => {
    const all = this.deduktService.allDeductions();
    const params = this.filterParams();

    return all.filter(d => {
      const matchText = !params.searchText || 
        d.customer.toLowerCase().includes(params.searchText.toLowerCase()) ||
        d.serviceNumber.toLowerCase().includes(params.searchText.toLowerCase()) ||
        d.referenceNumber.toLowerCase().includes(params.searchText.toLowerCase());

      const matchStart = !params.startDate || (d.startDate && new Date(d.startDate) >= new Date(params.startDate));
      const matchEnd = !params.endDate || (d.endDate && new Date(d.endDate) <= new Date(params.endDate));

      return matchText && matchStart && matchEnd;
    });
  });

  filteredTotalLoanAmount = computed(() => {
    return this.filteredDeductions().reduce((acc, cur) => acc + (cur.loanAmount || 0), 0);
  });

  applyFilter() {
    this.filterParams.set({
      startDate: this.filterForm.value.startDate || '',
      endDate: this.filterForm.value.endDate || '',
      searchText: (this.filterForm.value.searchText || '').trim()
    });
  }

  resetFilters() {
    this.filterForm.reset({
      startDate: '',
      endDate: '',
      searchText: ''
    });
    this.applyFilter();
  }

  openStopModal(deduction: Deduction) {
    this.deductionToCancel.set(deduction);
  }

  onDeductionStopped() {
    this.deductionToCancel.set(null);
  }

  async confirmDelete() {
    const d = this.deductionToDelete();
    if (!d) return;

    this.isDeleting.set(true);
    await this.deduktService.deleteDeduction(d.uuid || d.id);
    this.isDeleting.set(false);
    this.deductionToDelete.set(null);
  }

  exportData() {
    this.deduktService.exportToCsv('Deductions_Mandates', this.filteredDeductions());
  }
}


