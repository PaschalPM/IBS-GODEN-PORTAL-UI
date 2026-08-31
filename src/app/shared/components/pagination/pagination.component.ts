import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[#E4E7EC] bg-white">
      
      <!-- Info & Page Size -->
      <div class="flex flex-wrap items-center gap-4 text-xs text-[#475467]">
        @if (showInfo()) {
          <span>
            Showing 
            <span class="font-bold text-[#101828]">{{ startIndex() }}</span> 
            to 
            <span class="font-bold text-[#101828]">{{ endIndex() }}</span> 
            of 
            <span class="font-bold text-[#101828]">{{ totalItems() }}</span> 
            entries
          </span>
        }

        @if (showPageSizeSelector() && pageSizeOptions().length > 0) {
          <div class="flex items-center gap-1.5">
            <span>Show</span>
            <div class="relative">
              <select
                [value]="pageSize()"
                (change)="onPageSizeChange($event)"
                class="appearance-none bg-white border border-[#D0D5DD] text-[#101828] text-xs font-semibold rounded-md pl-2.5 pr-6 py-1 outline-none hover:border-[#008E97] transition-colors cursor-pointer"
              >
                @for (opt of pageSizeOptions(); track opt) {
                  <option [value]="opt">{{ opt }}</option>
                }
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5 text-[#717680]">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>
            <span>per page</span>
          </div>
        }
      </div>

      <!-- Navigation & Page Numbers -->
      @if (totalPages() > 1) {
        <nav class="inline-flex items-center gap-1 text-xs" aria-label="Pagination">
          
          <!-- Previous Button -->
          <button
            type="button"
            (click)="goToPage(currentPage() - 1)"
            [disabled]="currentPage() <= 1"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D0D5DD] bg-white text-[#344054] font-semibold hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            <span class="hidden sm:inline">Previous</span>
          </button>

          <!-- Page Numbers -->
          <div class="flex items-center gap-1">
            @for (p of pages(); track $index) {
              @if (p === '...') {
                <span class="px-2 py-1 text-[#717680] font-semibold select-none">...</span>
              } @else {
                <button
                  type="button"
                  (click)="goToPage(+p)"
                  class="min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center"
                  [ngClass]="{
                    'bg-[#008E97] text-white shadow-xs font-bold': p === currentPage(),
                    'text-[#344054] bg-white hover:bg-slate-50 border border-[#D0D5DD]': p !== currentPage()
                  }"
                >
                  {{ p }}
                </button>
              }
            }
          </div>

          <!-- Next Button -->
          <button
            type="button"
            (click)="goToPage(currentPage() + 1)"
            [disabled]="currentPage() >= totalPages()"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D0D5DD] bg-white text-[#344054] font-semibold hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span class="hidden sm:inline">Next</span>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

        </nav>
      }

    </div>
  `
})
export class PaginationComponent {
  totalItems = input<number>(0);
  pageSize = input<number>(10);
  currentPage = input<number>(1);
  pageSizeOptions = input<number[]>([5, 10, 20, 50]);
  showPageSizeSelector = input<boolean>(true);
  showInfo = input<boolean>(true);

  pageChange = output<number>();
  pageSizeChange = output<number>();

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.totalItems() / (this.pageSize() || 10)));
  });

  startIndex = computed(() => {
    if (this.totalItems() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  endIndex = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });

  pages = computed<(number | '...')[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }

    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, '...', current - 1, current, current + 1, '...', total];
  });

  goToPage(page: number) {
    const validPage = Math.max(1, Math.min(page, this.totalPages()));
    if (validPage !== this.currentPage()) {
      this.pageChange.emit(validPage);
    }
  }

  onPageSizeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const newSize = Number(select.value);
    if (newSize && newSize !== this.pageSize()) {
      this.pageSizeChange.emit(newSize);
    }
  }
}

