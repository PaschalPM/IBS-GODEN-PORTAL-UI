import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DeduktService } from '../../../../core/services/dedukt.service';
import { Deduction } from '../../../../core/models/deduction.model';
import { CurrencyNairaPipe } from '../../../../shared/pipes/currency-naira.pipe';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-deductions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyNairaPipe, PaginationComponent],
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
            {{ deduktService.deductionsTotal() }}
          </div>
        </div>

        <!-- Card 2: Total Loan Amount -->
        <div class="bg-white border border-[#C4C9D7] rounded-xl p-5 min-w-56 shadow-sm">
          <div class="text-xs font-semibold text-[#475467] pb-2 border-b border-[#E4E7EC]">
            Total Loan Amount
          </div>
          <div class="text-3xl font-black text-[#354778] mt-3">
            {{ deduktService.totalLoanAmountSum() | naira }}
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
                <th class="dedukt-table-th">START DATE</th>
                <th class="dedukt-table-th">END DATE</th>
                <th class="dedukt-table-th">STATUS</th>
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
                    <td class="dedukt-table-td"><div class="h-3 bg-gray-200 rounded w-24"></div></td>
                    <td class="dedukt-table-td"><div class="h-3 bg-gray-200 rounded w-24"></div></td>
                    <td class="dedukt-table-td"><div class="h-5 bg-gray-200 rounded w-16"></div></td>
                  </tr>
                }
              } @else if (deduktService.allDeductions().length > 0) {
                @for (item of deduktService.allDeductions(); track item.id) {
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

                    <!-- Start Date -->
                    <td class="dedukt-table-td text-xs text-[#475467] font-medium">
                      {{ item.startDate || 'N/A' }}
                    </td>

                    <!-- End Date -->
                    <td class="dedukt-table-td text-xs text-[#475467] font-medium">
                      {{ item.endDate || 'N/A' }}
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

                  </tr>
                }
              } @else {
                <tr>
                  <td colspan="7" class="p-12 text-center text-[#717680] text-sm">
                    No deduction records found.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Reusable Server-Side Pagination -->
        <app-pagination
          [totalItems]="deduktService.deductionsTotal()"
          [pageSize]="pageSize()"
          [currentPage]="currentPage()"
          (pageChange)="onPageChange($event)"
          (pageSizeChange)="onPageSizeChange($event)"
        ></app-pagination>
      </div>

    </div>
  `
})
export class DeductionsComponent implements OnInit {
  private fb = inject(FormBuilder);
  deduktService = inject(DeduktService);

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  filterForm: FormGroup = this.fb.group({
    startDate: [''],
    endDate: [''],
    searchText: ['']
  });

  ngOnInit() {
    this.fetchDeductions();
  }

  fetchDeductions() {
    const formVals = this.filterForm.value;
    this.deduktService.loadDeductions({
      page: this.currentPage(),
      per_page: this.pageSize(),
      search_text: (formVals.searchText || '').trim(),
      start_date: formVals.startDate || undefined,
      end_date: formVals.endDate || undefined
    });
  }

  applyFilter() {
    this.currentPage.set(1);
    this.fetchDeductions();
  }

  resetFilters() {
    this.filterForm.reset({
      startDate: '',
      endDate: '',
      searchText: ''
    });
    this.currentPage.set(1);
    this.fetchDeductions();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.fetchDeductions();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.fetchDeductions();
  }

  exportData() {
    this.deduktService.exportToCsv('Deductions_Mandates', this.deduktService.allDeductions());
  }
}
