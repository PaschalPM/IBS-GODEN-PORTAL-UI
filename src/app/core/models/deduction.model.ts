export interface ApiDeductionLoan {
  amount: number;
  released_date: string;
  tenor: number;
  repayment_amount: number;
  total_repayment_amount: number;
}

export interface ApiDeductionRepaymentPeriod {
  start_date: string;
  end_date: string;
}

export interface ApiDeductionDigisign {
  link: string | null;
  verification_status: string;
  signed_document: string | null;
}

export interface ApiDeduction {
  uuid: string;
  status: string;
  remarks: string | null;
  employee_service_number: string;
  company_uuid: string;
  loan: ApiDeductionLoan;
  repayment_period: ApiDeductionRepaymentPeriod;
  digisign: ApiDeductionDigisign;
  created_at: string;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface DeductionQueryParams {
  page?: number;
  per_page?: number;
  service_number?: string;
  start_date?: string;
  end_date?: string;
}

export interface DeductionsListResponse {
  status: string;
  message: string;
  data: ApiDeduction[];
  pagination?: PaginationMeta;
}

export interface CreateDeductionApiRequest {
  loan_released_date: string;
  loan_amount: number;
  number_of_repayments: number;
  repayment_amount: number;
  employee_uuid: string;
  company_uuid: string;
  use_digi_sign: boolean;
  bvn: string;
  nin: string;
  email: string;
  callback_email: string;
  allow_whatsapp_signing: boolean;
}

export interface CreateDeductionApiResponse {
  status: string;
  message: string;
  data?: any;
}

export interface Deduction {
  id: string;
  uuid?: string;
  customer: string;
  employer: string;
  serviceNumber: string;
  companyUuid?: string;
  loanAmount: number;
  startDate: string;
  endDate: string;
  tenor: number;
  repaymentAmount: number;
  totalRepayment: number;
  status: string;
  remarks?: string | null;
  digisign?: ApiDeductionDigisign | boolean;
  referenceNumber: string;
  description?: string;
  createdAt: string;
}

export interface CreateDeductionRequest {
  employeeId: string;
  customer: string;
  employer: string;
  companyUuid?: string;
  serviceNumber: string;
  loanAmount: number;
  tenor: number;
  repaymentAmount: number;
  totalRepayment: number;
  startDate: string;
  purpose: string;
  bvn?: string;
  nin?: string;
  email?: string;
  callbackEmail?: string;
  useDigiSign?: boolean;
  allowWhatsappSigning?: boolean;
}
