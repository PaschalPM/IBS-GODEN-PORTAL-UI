import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DeduktService } from '../../../../core/services/dedukt.service';
import { Cancellation } from '../../../../core/models/cancellation.model';
import { CurrencyNairaPipe } from '../../../../shared/pipes/currency-naira.pipe';

@Component({
  selector: 'app-cancellations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyNairaPipe],
  template: `
    <div class="space-y-6">
      
      <!-- Title matching Image 3 -->
      <div>
        <h1 class="text-2xl font-extrabold text-[#081A4D] tracking-tight">Cancellations</h1>
      </div>

      <!-- Filter Controls Bar matching Image 3 -->
      <div class="bg-white border border-[#C4C9D7] rounded-xl p-6 shadow-sm">
        <form [formGroup]="filterForm" (ngSubmit)="applyFilter()" class="flex flex-wrap lg:flex-nowrap items-end gap-4">
          
          <!-- Start Date -->
          <div class="w-full sm:w-52">
            <label class="block text-xs font-semibold text-[#101828] mb-1.5">
              <span class="text-rose-500 font-bold">*</span> Start Date
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
              <span class="text-rose-500 font-bold">*</span> End Date
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
              <span class="text-rose-500 font-bold">*</span> Search Text
            </label>
            <input 
              type="text" 
              formControlName="searchText" 
              placeholder="Search customer name or ID..."
              class="dedukt-input"
            />
          </div>

          <!-- Search & Export Buttons matching Image 3 -->
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button 
              type="submit" 
              class="dedukt-btn-teal px-7 py-2.5 h-[42px] cursor-pointer"
            >
              Search
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

      <!-- Data Table matching Image 3 -->
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
              @if (filteredCancellations().length > 0) {
                @for (item of filteredCancellations(); track item.id) {
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
                    No results
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class CancellationsComponent implements OnInit {
  private fb = inject(FormBuilder);
  deduktService = inject(DeduktService);

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

  filteredCancellations = computed(() => {
    const all = this.deduktService.allCancellations();
    const params = this.filterParams();

    return all.filter(c => {
      const matchText = !params.searchText || 
        c.customer.toLowerCase().includes(params.searchText.toLowerCase()) ||
        c.serviceNumber.toLowerCase().includes(params.searchText.toLowerCase()) ||
        c.cancellationReason.toLowerCase().includes(params.searchText.toLowerCase());

      const matchStart = !params.startDate || new Date(c.cancelledAt) >= new Date(params.startDate);
      const matchEnd = !params.endDate || new Date(c.cancelledAt) <= new Date(params.endDate);

      return matchText && matchStart && matchEnd;
    });
  });

  applyFilter() {
    this.filterParams.set({
      startDate: this.filterForm.value.startDate || '',
      endDate: this.filterForm.value.endDate || '',
      searchText: (this.filterForm.value.searchText || '').trim()
    });
  }

  exportData() {
    this.deduktService.exportToCsv('Dedukt_Cancellations', this.filteredCancellations());
  }
}

