export interface Cancellation {
  id: string;
  customer: string;
  serviceNumber: string;
  loanAmount: number;
  tenor: number;
  repaymentAmount: number;
  totalRepayment: number;
  cancelledAt: string; // MM/DD/YYYY
  cancellationReason: string;
  cancelledBy: string;
  originalDeductionId: string;
}

export interface CancelDeductionRequest {
  deductionId: string;
  reason: string;
  notes?: string;
}

