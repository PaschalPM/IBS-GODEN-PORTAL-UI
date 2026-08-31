import { PaginationMeta } from './deduction.model';

export interface ApiCancellation {
  uuid?: string;
  id?: string;
  customer?: string;
  employee_service_number?: string;
  serviceNumber?: string;
  loan_amount?: number;
  loanAmount?: number;
  tenor?: number;
  repayment_amount?: number;
  repaymentAmount?: number;
  total_repayment_amount?: number;
  totalRepayment?: number;
  cancelled_at?: string;
  cancelledAt?: string;
  cancellation_reason?: string;
  cancellationReason?: string;
  cancelled_by?: string;
  cancelledBy?: string;
  original_deduction_id?: string;
  originalDeductionId?: string;
}

export interface CancellationQueryParams {
  page?: number;
  per_page?: number;
  search_text?: string;
  start_date?: string;
  end_date?: string;
}

export interface CancellationsListResponse {
  status: string;
  message: string;
  data: ApiCancellation[];
  pagination?: PaginationMeta;
}

export interface Cancellation {
  id: string;
  customer: string;
  serviceNumber: string;
  loanAmount: number;
  tenor: number;
  repaymentAmount: number;
  totalRepayment: number;
  cancelledAt: string; // MM/DD/YYYY or ISO
  cancellationReason: string;
  cancelledBy: string;
  originalDeductionId: string;
}

export interface CancelDeductionRequest {
  deductionId: string;
  reason: string;
  notes?: string;
}
