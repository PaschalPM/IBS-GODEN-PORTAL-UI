export interface Employee {
  id: string;
  fullName: string;
  employer: string;
  companyUuid?: string;
  ippisNumber: string;
  staffNumber: string;
  accountNumber: string;
  bankName: string;
  serviceNumber: string;
  retirementDate: string;
  availableDeductibleBalance: number;
  monthlyGrossSalary: number;
  monthlyNetSalary: number;
  gradeLevel: string;
  ministryOrAgency: string;
  bvn: string;
  phone: string;
  email: string;
  status: 'Active' | 'Suspended' | 'Retired';
  history?: ApiEmployeeHistory[];
}

export interface EmployerOption {
  id: string;
  uuid: string;
  name: string;
  code?: string;
  category: string;
  requiresDigisign?: boolean;
}

// ── API shapes ────────────────────────────────────────────────────────────────

export interface ApiEmployer {
  uuid: string;
  company_name: string;
  company_category: string;
  requires_digisign: boolean;
}

export interface EmployersResponse {
  status: string;
  message: string;
  data: ApiEmployer[];
}

export interface ApiEmployeeHistory {
  net_pay: number;
  gross_pay: number;
  gross_deduction: number;
  payment_date: string;
  month?: string;
  year?: string;
  bank_name: string;
  salary_account_number: string;
  available_deduction: number;
  has_extendable_deduction?: boolean;
  actual_dti?: number;
  is_retired?: boolean;
  company?: any;
}

export interface ApiEmployee {
  uuid: string;
  company_uuid: string;
  service_number: string;
  first_name: string;
  last_name: string;
  expected_retirement_date: string;
  is_retired: boolean;
  bank_name: string;
  salary_account_number: string;
  salary_bank_code: string | null;
  net_pay: number;
  gross_pay: number;
  gross_deduction: number;
  payment_date: string;
  available_deduction: number;
  history?: ApiEmployeeHistory[];
  sub_company?: {
    id: any;
    sub_company_name: string | null;
  };
  company?: {
    uuid: string;
    company_name: string;
    company_code: string;
  };
}

export interface EmployeeSearchResponse {
  status: string;
  message: string;
  data: ApiEmployee;
}
