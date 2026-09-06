import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  Employee,
  EmployerOption,
  EmployersResponse,
  EmployeeSearchResponse,
  ApiEmployee,
  ApiEmployer
} from '../models/employee.model';
import {
  Deduction,
  ApiDeduction,
  DeductionsListResponse,
  DeductionQueryParams,
  CreateDeductionApiRequest,
  CreateDeductionApiResponse
} from '../models/deduction.model';
import {
  Cancellation,
  ApiCancellation,
  CancellationsListResponse,
  CancellationQueryParams
} from '../models/cancellation.model';
import { Bank, BanksResponse } from '../models/bank.model';
import { WalletData, WalletBalanceResponse } from '../models/wallet.model';
import { ToastService } from './toast.service';
import { environment } from '../../../environments/environment';

export interface EmployeeSearchState {
  employer: string;
  criteria: string;
  value: string;
  bankId: string;
  selectedEmployee: Employee | null;
  employeeDeductions: Deduction[];
}

function mapApiEmployer(e: ApiEmployer): EmployerOption {
  return {
    id: e.uuid,
    uuid: e.uuid,
    name: e.company_name,
    category: e.company_category,
    requiresDigisign: e.requires_digisign
  };
}

function mapApiEmployee(data: ApiEmployee): Employee {
  const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Employee Name';
  const companyName = data.company?.company_name || 'Employer';
  return {
    id: data.uuid,
    fullName: fullName,
    employer: companyName,
    companyUuid: data.company_uuid || data.company?.uuid,
    ippisNumber: data.service_number,
    staffNumber: data.service_number,
    accountNumber: data.salary_account_number,
    bankName: data.bank_name || 'Commercial Bank',
    serviceNumber: data.service_number,
    retirementDate: data.expected_retirement_date || 'N/A',
    availableDeductibleBalance: Number(data.available_deduction || 0),
    monthlyGrossSalary: Number(data.gross_pay || 0),
    monthlyNetSalary: Number(data.net_pay || 0),
    gradeLevel: data.company?.company_code || 'Cadre',
    ministryOrAgency: data.sub_company?.sub_company_name || companyName,
    bvn: '',
    phone: '',
    email: '',
    status: data.is_retired ? 'Retired' : 'Active',
    history: data.history
  };
}

function mapApiDeduction(item: ApiDeduction): Deduction {
  const startDate = item.repayment_period?.start_date
    ? item.repayment_period.start_date.split('T')[0]
    : (item.loan?.released_date ? item.loan.released_date.split('T')[0] : '');
  const endDate = item.repayment_period?.end_date
    ? item.repayment_period.end_date.split('T')[0]
    : '';

  return {
    id: item.uuid,
    uuid: item.uuid,
    customer: item.employee_service_number,
    employer: item.company_uuid,
    serviceNumber: item.employee_service_number,
    companyUuid: item.company_uuid,
    loanAmount: item.loan?.amount || 0,
    startDate: startDate,
    endDate: endDate,
    tenor: item.loan?.tenor || 0,
    repaymentAmount: item.loan?.repayment_amount || 0,
    totalRepayment: item.loan?.total_repayment_amount || 0,
    status: item.status,
    remarks: item.remarks,
    digisign: item.digisign,
    referenceNumber: item.uuid.substring(0, 8).toUpperCase(),
    createdAt: item.created_at
  };
}

function mapApiCancellation(item: ApiCancellation): Cancellation {
  return {
    id: item.uuid || item.id || `CAN-${Date.now()}`,
    customer: item.customer || 'Customer',
    serviceNumber: item.employee_service_number || item.serviceNumber || '',
    loanAmount: item.loan_amount || item.loanAmount || 0,
    tenor: item.tenor || 0,
    repaymentAmount: item.repayment_amount || item.repaymentAmount || 0,
    totalRepayment: item.total_repayment_amount || item.totalRepayment || 0,
    cancelledAt: item.cancelled_at || item.cancelledAt || new Date().toISOString().split('T')[0],
    cancellationReason: item.cancellation_reason || item.cancellationReason || 'Mandate Cancelled',
    cancelledBy: item.cancelled_by || item.cancelledBy || 'System Admin',
    originalDeductionId: item.original_deduction_id || item.originalDeductionId || ''
  };
}

@Injectable({
  providedIn: 'root'
})
export class DeduktService {
  // Employers Signals
  readonly employers = signal<EmployerOption[]>([]);
  readonly loadingEmployers = signal<boolean>(false);

  // Deductions Signals
  readonly loadingDeductions = signal<boolean>(false);
  readonly deductionsTotal = signal<number>(0);
  private deductions = signal<Deduction[]>([]);
  readonly allDeductions = this.deductions.asReadonly();

  // Cancellations Signals
  readonly loadingCancellations = signal<boolean>(false);
  readonly cancellationsTotal = signal<number>(0);
  private cancellations = signal<Cancellation[]>([]);
  readonly allCancellations = this.cancellations.asReadonly();

  // Banks Signals
  readonly banks = signal<Bank[]>([]);
  readonly loadingBanks = signal<boolean>(false);

  // Wallet Signals
  readonly walletBalance = signal<number>(0);
  readonly walletData = signal<WalletData | null>(null);
  readonly loadingWallet = signal<boolean>(false);

  // Computed metrics
  readonly totalLoanAmountSum = computed(() =>
    this.deductions().reduce((sum, d) => sum + (d.loanAmount || 0), 0)
  );

  // Employee Search Persistent State
  readonly employeeSearchState = signal<EmployeeSearchState | null>(null);

  setEmployeeSearchState(state: EmployeeSearchState | null) {
    this.employeeSearchState.set(state);
  }

  updateSearchedEmployee(employee: Employee | null, deductionsList: Deduction[]) {
    const current = this.employeeSearchState();
    if (current) {
      this.employeeSearchState.set({
        ...current,
        selectedEmployee: employee,
        employeeDeductions: deductionsList
      });
    }
  }

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  // ── GET /dedukt/utilities/banks ──────────────────────────────────────────────
  async loadBanks(): Promise<Bank[]> {
    this.loadingBanks.set(true);
    try {
      const res = await firstValueFrom(
        this.http.get<BanksResponse>(`${environment.apiUrl}/dedukt/utilities/banks`)
      );
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        this.banks.set(res.data);
        return res.data;
      }
      this.banks.set(this.fallbackBanks);
      return this.fallbackBanks;
    } catch {
      this.banks.set(this.fallbackBanks);
      return this.fallbackBanks;
    } finally {
      this.loadingBanks.set(false);
    }
  }

  // ── GET /dedukt/utilities/wallet-balance ──────────────────────────────────────
  async loadWalletBalance(): Promise<number> {
    this.loadingWallet.set(true);
    try {
      const res = await firstValueFrom(
        this.http.get<WalletBalanceResponse>(`${environment.apiUrl}/dedukt/utilities/wallet-balance`)
      );

      let numericBalance = 0;
      if (typeof res?.data === 'number') {
        numericBalance = res.data;
      } else if (res?.data && typeof res.data === 'object') {
        numericBalance = Number(
          res.data.balance ??
          res.data.wallet_balance ??
          res.data.available_balance ??
          0
        );
      }

      this.walletBalance.set(numericBalance);
      this.walletData.set({
        balance: numericBalance,
        currency: (typeof res?.data === 'object' && res.data?.currency) ? res.data.currency : 'NGN',
        accountNumber: (typeof res?.data === 'object' && res.data?.account_number) ? res.data.account_number : '',
        accountName: (typeof res?.data === 'object' && res.data?.account_name) ? res.data.account_name : '',
        bankName: (typeof res?.data === 'object' && res.data?.bank_name) ? res.data.bank_name : '',
        status: (typeof res?.data === 'object' && res.data?.status) ? res.data.status : 'Active',
        lastUpdated: new Date().toLocaleTimeString()
      });

      return numericBalance;
    } catch {
      return this.walletBalance();
    } finally {
      this.loadingWallet.set(false);
    }
  }

  // ── GET /dedukt/employers?search_text= ────────────────────────────────────────
  async loadEmployers(searchText: string = ''): Promise<EmployerOption[]> {
    this.loadingEmployers.set(true);
    try {
      const res = await firstValueFrom(
        this.http.get<EmployersResponse>(`${environment.apiUrl}/dedukt/employers`, {
          params: { search_text: searchText }
        })
      );
      if (res?.data && Array.isArray(res.data)) {
        const mapped = res.data.map(mapApiEmployer);
        this.employers.set(mapped);
        return mapped;
      }
      this.employers.set([]);
      return [];
    } catch (err) {
      console.warn('Load employers warning:', err);
      this.employers.set([]);
      return [];
    } finally {
      this.loadingEmployers.set(false);
    }
  }

  // ── GET /dedukt/deductions (with Server-Side Pagination Query Params) ─────────
  async loadDeductions(params?: DeductionQueryParams): Promise<Deduction[]> {
    this.loadingDeductions.set(true);

    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
    if (params?.service_number) httpParams = httpParams.set('service_number', params.service_number);
    if (params?.start_date) httpParams = httpParams.set('start_date', params.start_date);
    if (params?.end_date) httpParams = httpParams.set('end_date', params.end_date);

    try {
      const res = await firstValueFrom(
        this.http.get<DeductionsListResponse>(`${environment.apiUrl}/dedukt/deductions`, {
          params: httpParams
        })
      );
      if (res?.data && Array.isArray(res.data)) {
        const mapped = res.data.map(mapApiDeduction);
        this.deductions.set(mapped);
        this.deductionsTotal.set(res.pagination?.total ?? mapped.length);
        return mapped;
      }
      this.deductions.set([]);
      this.deductionsTotal.set(0);
      return [];
    } catch {
      this.deductions.set([]);
      this.deductionsTotal.set(0);
      return [];
    } finally {
      this.loadingDeductions.set(false);
    }
  }

  // ── GET /dedukt/cancellations (with Server-Side Pagination Query Params) ───────
  async loadCancellations(params?: CancellationQueryParams): Promise<Cancellation[]> {
    this.loadingCancellations.set(true);

    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
    if (params?.search_text) httpParams = httpParams.set('search_text', params.search_text);
    if (params?.start_date) httpParams = httpParams.set('start_date', params.start_date);
    if (params?.end_date) httpParams = httpParams.set('end_date', params.end_date);

    try {
      const res = await firstValueFrom(
        this.http.get<CancellationsListResponse>(`${environment.apiUrl}/dedukt/cancellations`, {
          params: httpParams
        })
      );
      if (res?.data && Array.isArray(res.data)) {
        const mapped = res.data.map(mapApiCancellation);
        this.cancellations.set(mapped);
        this.cancellationsTotal.set(res.pagination?.total ?? mapped.length);
        return mapped;
      }
      this.cancellations.set([]);
      this.cancellationsTotal.set(0);
      return [];
    } catch {
      this.cancellations.set([]);
      this.cancellationsTotal.set(0);
      return [];
    } finally {
      this.loadingCancellations.set(false);
    }
  }

  // ── POST /dedukt/deductions/create ──────────────────────────────────────────
  async createDeductionApi(request: CreateDeductionApiRequest): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.post<CreateDeductionApiResponse>(`${environment.apiUrl}/dedukt/deductions/create`, request)
      );
      this.toastService.success(
        'Deduction Created',
        res.message || 'Loan request created successfully.'
      );
      await this.loadDeductions();
      return true;
    } catch (err) {
      const msg = this.extractMessage(err, 'Failed to create deduction mandate.');
      this.toastService.error('Deduction Creation Failed', msg);
      return false;
    }
  }

  // ── DELETE /dedukt/deductions/:deductionUuid ─────────────────────────────────
  async deleteDeduction(uuid: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.delete(`${environment.apiUrl}/dedukt/deductions/${uuid}`)
      );
      this.deductions.update(list => list.filter(d => d.uuid !== uuid && d.id !== uuid));
      this.deductionsTotal.update(t => Math.max(0, t - 1));
      this.toastService.success('Deduction Deleted', 'Deduction mandate successfully deleted.');
      return true;
    } catch (err) {
      const msg = this.extractMessage(err, 'Failed to delete deduction mandate.');
      this.toastService.error('Delete Failed', msg);
      return false;
    }
  }

  // ── POST /dedukt/deductions/stop ────────────────────────────────────────────
  async stopDeduction(employeeUuid: string, companyUuid: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/dedukt/deductions/stop`, {
          employee_uuid: employeeUuid,
          company_uuid: companyUuid
        })
      );
      await this.loadDeductions();
      await this.loadCancellations();
      this.toastService.success('Stoppage Submitted', 'Deduction mandate stoppage request submitted successfully.');
      return true;
    } catch (err) {
      const msg = this.extractMessage(err, 'Failed to submit stoppage request.');
      this.toastService.error('Stoppage Request Failed', msg);
      return false;
    }
  }

  // ── Employee Search APIs ───────────────────────────────────────────────────
  async searchEmployee(
    companyUuid: string,
    criteria: string,
    value: string,
    bankId: string | number = '1'
  ): Promise<Employee | null> {
    const trimmedVal = (value || '').trim();
    if (!trimmedVal || !companyUuid) return null;

    try {
      let endpoint = '';
      if (criteria === 'Account Number') {
        endpoint = `${environment.apiUrl}/dedukt/companies/${companyUuid}/employees/banks/${bankId}/accounts/${encodeURIComponent(trimmedVal)}`;
      } else {
        endpoint = `${environment.apiUrl}/dedukt/companies/${companyUuid}/employees/${encodeURIComponent(trimmedVal)}`;
      }

      const res = await firstValueFrom(
        this.http.get<EmployeeSearchResponse>(endpoint)
      );

      if (res?.data) {
        return mapApiEmployee(res.data);
      }
      this.toastService.error('Not Found', 'No employee record found matching search criteria.');
      return null;
    } catch (err) {
      const msg = this.extractMessage(err, 'Employee not found or search failed.');
      this.toastService.error('Search Failed', msg);
      return null;
    }
  }

  // ── GET /dedukt/deductions?service_number= (single employee, fetched live) ────
  async loadEmployeeDeductions(serviceNumber: string): Promise<Deduction[]> {
    if (!serviceNumber) return [];
    try {
      const res = await firstValueFrom(
        this.http.get<DeductionsListResponse>(`${environment.apiUrl}/dedukt/deductions`, {
          // Cache-bust: the backend caches this GET for 60s by exact URL, which would
          // otherwise serve stale results right after a create/stop/delete mutation.
          params: { service_number: serviceNumber, _t: Date.now().toString() }
        })
      );
      if (res?.data && Array.isArray(res.data)) {
        return res.data.map(mapApiDeduction);
      }
      return [];
    } catch (err) {
      const msg = this.extractMessage(err, 'Failed to load deduction mandates.');
      this.toastService.error('Load Failed', msg);
      return [];
    }
  }

  // Fallback Banks List (Standard Nigerian Financial Institutions)
  readonly fallbackBanks: Bank[] = [
    { id: 1, name: '9mobile 9Payment Service Bank', code: '120001' },
    { id: 2, name: 'Abbey Mortgage Bank', code: '801' },
    { id: 3, name: 'Above Only MFB', code: '51204' },
    { id: 4, name: 'Abulesoro MFB', code: '51312' },
    { id: 5, name: 'Access Bank', code: '044' },
    { id: 6, name: 'Access Bank (Diamond)', code: '063' },
    { id: 7, name: 'Airtel Smartcash PSB', code: '120004' },
    { id: 8, name: 'ALAT by WEMA', code: '035A' },
    { id: 9, name: 'Amju Unique MFB', code: '50926' },
    { id: 10, name: 'Aramoko MFB', code: '50083' },
    { id: 11, name: 'ASO Savings and Loans', code: '401' },
    { id: 12, name: 'Astrapolaris MFB LTD', code: 'MFB50094' },
    { id: 13, name: 'Bainescredit MFB', code: '51229' },
    { id: 14, name: 'Bowen Microfinance Bank', code: '50931' },
    { id: 15, name: 'Carbon', code: '565' },
    { id: 16, name: 'CEMCS Microfinance Bank', code: '50823' },
    { id: 17, name: 'Chanelle Microfinance Bank Limited', code: '50171' },
    { id: 18, name: 'Citibank Nigeria', code: '023' },
    { id: 19, name: 'Corestep MFB', code: '50204' },
    { id: 20, name: 'Coronation Merchant Bank', code: '559' },
    { id: 21, name: 'Crescent MFB', code: '51297' },
    { id: 22, name: 'Ecobank Nigeria', code: '050' },
    { id: 23, name: 'Ekimogun MFB', code: '50263' },
    { id: 24, name: 'Ekondo Microfinance Bank', code: '562' },
    { id: 25, name: 'Eyowo', code: '50126' },
    { id: 26, name: 'Fidelity Bank', code: '070' },
    { id: 27, name: 'Firmus MFB', code: '51314' },
    { id: 28, name: 'First Bank of Nigeria', code: '011' },
    { id: 29, name: 'First City Monument Bank', code: '214' },
    { id: 30, name: 'FSDH Merchant Bank Limited', code: '501' },
    { id: 31, name: 'Gateway Mortgage Bank LTD', code: '812' },
    { id: 32, name: 'Globus Bank', code: '00103' },
    { id: 33, name: 'GoMoney', code: '100022' },
    { id: 34, name: 'Guaranty Trust Bank', code: '058' },
    { id: 35, name: 'Hackman Microfinance Bank', code: '51251' },
    { id: 36, name: 'Hasal Microfinance Bank', code: '50383' },
    { id: 37, name: 'Heritage Bank', code: '030' },
    { id: 38, name: 'HopePSB', code: '120002' },
    { id: 39, name: 'Ibile Microfinance Bank', code: '51244' },
    { id: 40, name: 'Ikoyi Osun MFB', code: '50439' },
    { id: 41, name: 'Infinity MFB', code: '50457' },
    { id: 42, name: 'Jaiz Bank', code: '301' },
    { id: 43, name: 'Kadpoly MFB', code: '50502' },
    { id: 44, name: 'Keystone Bank', code: '082' },
    { id: 45, name: 'Kredi Money MFB LTD', code: '50200' },
    { id: 46, name: 'Kuda Bank', code: '50211' },
    { id: 47, name: 'Lagos Building Investment Company Plc.', code: '90052' },
    { id: 48, name: 'Links MFB', code: '50549' },
    { id: 49, name: 'Living Trust Mortgage Bank', code: '031' },
    { id: 50, name: 'Lotus Bank', code: '303' },
    { id: 51, name: 'Mayfair MFB', code: '50563' },
    { id: 88, name: 'MICRO-FINANCE/AGRIC BANKS - ENUGU', code: null },
    { id: 52, name: 'Mint MFB', code: '50304' },
    { id: 53, name: 'MTN Momo PSB', code: '120003' },
    { id: 54, name: 'Paga', code: '100002' },
    { id: 55, name: 'PalmPay', code: '999991' },
    { id: 56, name: 'Parallex Bank', code: '104' },
    { id: 57, name: 'Parkway - ReadyCash', code: '311' },
    { id: 58, name: 'Paycom', code: '999992' },
    { id: 59, name: 'Petra Mircofinance Bank Plc', code: '50746' },
    { id: 60, name: 'Polaris Bank', code: '076' },
    { id: 61, name: 'Polyunwana MFB', code: '50864' },
    { id: 62, name: 'PremiumTrust Bank', code: '105' },
    { id: 63, name: 'Providus Bank', code: '101' },
    { id: 64, name: 'QuickFund MFB', code: '51293' },
    { id: 65, name: 'Rand Merchant Bank', code: '502' },
    { id: 66, name: 'Refuge Mortgage Bank', code: '90067' },
    { id: 67, name: 'Rubies MFB', code: '125' },
    { id: 68, name: 'Safe Haven MFB', code: '51113' },
    { id: 69, name: 'Solid Rock MFB', code: '50800' },
    { id: 70, name: 'Sparkle Microfinance Bank', code: '51310' },
    { id: 71, name: 'Stanbic IBTC Bank', code: '221' },
    { id: 72, name: 'Standard Chartered Bank', code: '068' },
    { id: 73, name: 'Stellas MFB', code: '51253' },
    { id: 74, name: 'Sterling Bank', code: '232' },
    { id: 75, name: 'Suntrust Bank', code: '100' },
    { id: 76, name: 'TAJ Bank', code: '302' },
    { id: 77, name: 'Tangerine Money', code: '51269' },
    { id: 78, name: 'TCF MFB', code: '51211' },
    { id: 79, name: 'Titan Bank', code: '102' },
    { id: 80, name: 'Titan Paystack', code: '100039' },
    { id: 81, name: 'Unical MFB', code: '50871' },
    { id: 82, name: 'Union Bank of Nigeria', code: '032' },
    { id: 83, name: 'United Bank For Africa (UBA)', code: '033' },
    { id: 84, name: 'Unity Bank', code: '215' },
    { id: 85, name: 'VFD Microfinance Bank Limited', code: '566' },
    { id: 86, name: 'Wema Bank', code: '035' },
    { id: 87, name: 'Zenith Bank', code: '057' }
  ];

  // Export to CSV helper
  exportToCsv(filename: string, rows: object[]) {
    if (!rows || !rows.length) {
      this.toastService.warning('Export', 'No records found to export.');
      return;
    }
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => headers.map(header => {
        const val = (row as any)[header];
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastService.success('Export Successful', `Exported ${rows.length} records to ${filename}.csv`);
  }

  private extractMessage(err: unknown, fallback: string): string {
    const httpErr = err as HttpErrorResponse;
    return (
      httpErr?.error?.message?.message ??
      httpErr?.error?.message ??
      httpErr?.message ??
      fallback
    );
  }
}
