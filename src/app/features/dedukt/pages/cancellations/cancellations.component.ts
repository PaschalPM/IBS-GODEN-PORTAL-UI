import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DeduktService } from '../../../../core/services/dedukt.service';
import { Cancellation } from '../../../../core/models/cancellation.model';
import { CurrencyNairaPipe } from '../../../../shared/pipes/currency-naira.pipe';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-cancellations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyNairaPipe, PaginationComponent],
  template: `
    <div class="space-y-6">
      
      <!-- Title -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-extrabold text-[#081A4D] tracking-tight">Cancellations</h1>
        <div class="text-xs text-[#717680] font-medium">
          Total Cancellations: <span class="font-bold text-[#081A4D]">{{ deduktService.cancellationsTotal() }}</span>
        </div>
      </div>

      <!-- Filter Controls Bar -->
      <div class="bg-white border border-[#C4C9D7] rounded-xl p-6 shadow-sm">
        <form [formGroup]="filterForm" (ngSubmit)="applyFilter()" class="flex flex-wrap lg:flex-nowrap items-end gap-4">
          
          <!-- Start Date -->
          <div class="w-full sm:w-52">
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
          <div class="w-full sm:w-52">
            <label class="block text-xs font-semibold text-[#101828] mb-1.5">
              End Date
            </label>
            <input 
              type="date" 
              formControlName="endDate" 
              class="dedukt-input text-[#334155]"
            />
          </div>

          <!-- Search Text -->
          <div class="w-full sm:w-72">
            <label class="block text-xs font-semibold text-[#101828] mb-1.5">
              Search Text
            </label>
            <input 
              type="text" 
              formControlName="searchText" 
              placeholder="Search customer, ID, or reason..."
              class="dedukt-input"
            />
          </div>

          <!-- Search & Export Buttons -->
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button 
              type="submit" 
              class="dedukt-btn-teal px-7 py-2.5 h-[42px] cursor-pointer"
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
              class="dedukt-btn-outline px-6 py-2.5 h-[42px] cursor-pointer"
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
                <th class="dedukt-table-th">CUSTOMER</th>
                <th class="dedukt-table-th">SERVICE NUMBER</th>
                <th class="dedukt-table-th">LOAN AMOUNT</th>
                <th class="dedukt-table-th">TENOR</th>
                <th class="dedukt-table-th">REPAYMENT AMOUNT</th>
                <th class="dedukt-table-th">TOTAL REPAYMENT</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F1F5F9]">
              <!-- Loading Skeleton -->
              @if (deduktService.loadingCancellations()) {
                @for (i of [1,2,3]; track i) {
                  <tr class="animate-pulse">
                    <td class="dedukt-table-td"><div class="h-3 bg-gray-200 rounded w-36"></div></td>
                    <td class="dedukt-table-td"><div class="h-3 bg-gray-200 rounded w-28"></div></td>
                    <td class="dedukt-table-td"><div class="h-3 bg-gray-200 rounded w-20"></div></td>
                    <td class="dedukt-table-td"><div class="h-3 bg-gray-200 rounded w-12"></div></td>
                    <td class="dedukt-table-td"><div class="h-3 bg-gray-200 rounded w-20"></div></td>
                    <td class="dedukt-table-td"><div class="h-3 bg-gray-200 rounded w-20"></div></td>
                  </tr>
                }
              } @else if (deduktService.allCancellations().length > 0) {
                @for (item of deduktService.allCancellations(); track item.id) {
                  <tr class="hover:bg-[#F8FAFC] transition-colors">
                    <td class="dedukt-table-td">
                      <div class="font-semibold text-[#101828]">{{ item.customer }}</div>
                      <div class="text-[11px] text-[#717680] mt-0.5">{{ item.cancellationReason }} &bull; {{ item.cancelledAt }}</div>
                    </td>
                    <td class="dedukt-table-td font-mono text-xs text-[#00498B] font-medium">{{ item.serviceNumber }}</td>
                    <td class="dedukt-table-td font-semibold text-[#101828]">{{ item.loanAmount | naira }}</td>
                    <td class="dedukt-table-td text-xs font-medium">{{ item.tenor }} mos</td>
                    <td class="dedukt-table-td font-semibold text-[#354778]">{{ item.repaymentAmount | naira }}</td>
                    <td class="dedukt-table-td font-bold text-[#081A4D]">{{ item.totalRepayment | naira }}</td>
                  </tr>
                }
              } @else {
                <tr>
                  <td colspan="6" class="p-16 text-center text-[#717680] text-sm">
                    No cancellations found.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Reusable Server-Side Pagination -->
        <app-pagination
          [totalItems]="deduktService.cancellationsTotal()"
          [pageSize]="pageSize()"
          [currentPage]="currentPage()"
          (pageChange)="onPageChange($event)"
          (pageSizeChange)="onPageSizeChange($event)"
        ></app-pagination>
      </div>

    </div>
  `
})
export class CancellationsComponent implements OnInit {
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
    this.fetchCancellations();
  }

  fetchCancellations() {
    const formVals = this.filterForm.value;
    this.deduktService.loadCancellations({
      page: this.currentPage(),
      per_page: this.pageSize(),
      search_text: (formVals.searchText || '').trim(),
      start_date: formVals.startDate || undefined,
      end_date: formVals.endDate || undefined
    });
  }

  applyFilter() {
    this.currentPage.set(1);
    this.fetchCancellations();
  }

  resetFilters() {
    this.filterForm.reset({
      startDate: '',
      endDate: '',
      searchText: ''
    });
    this.currentPage.set(1);
    this.fetchCancellations();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.fetchCancellations();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.fetchCancellations();
  }

  exportData() {
    this.deduktService.exportToCsv('Dedukt_Cancellations', this.deduktService.allCancellations());
  }
}
