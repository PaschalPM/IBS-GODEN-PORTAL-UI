import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
  CreateDeductionApiRequest,
  CreateDeductionApiResponse,
  CreateDeductionRequest
} from '../models/deduction.model';
import { Cancellation } from '../models/cancellation.model';
import { PortalUser, CreateUserDto, UserRole } from '../models/user.model';
import { ToastService } from './toast.service';
import { environment } from '../../../environments/environment';

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

@Injectable({
  providedIn: 'root'
})
export class DeduktService {
  // Employer list
  readonly employers = signal<EmployerOption[]>([]);
  readonly loadingEmployers = signal<boolean>(false);
  readonly loadingDeductions = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  // ── GET /dedukt/employers?search_text= ────────────────────────────────────────
  async loadEmployers(searchText: string = ''): Promise<EmployerOption[]> {
    this.loadingEmployers.set(true);
    try {
      const res = await firstValueFrom(
        this.http.get<EmployersResponse>(`${environment.apiUrl}/dedukt/employers`, {
          params: { search_text: searchText }
        })
      );
      const mapped = (res.data || []).map(mapApiEmployer);
      this.employers.set(mapped);
      return mapped;
    } catch (err) {
      console.warn('Failed to load employers from API, using cached/fallback list', err);
      return this.employers();
    } finally {
      this.loadingEmployers.set(false);
    }
  }

  // ── GET /dedukt/deductions ───────────────────────────────────────────────────
  async loadDeductions(): Promise<Deduction[]> {
    this.loadingDeductions.set(true);
    try {
      const res = await firstValueFrom(
        this.http.get<DeductionsListResponse>(`${environment.apiUrl}/dedukt/deductions`)
      );
      const mapped = (res.data || []).map(mapApiDeduction);
      this.deductions.set(mapped);
      return mapped;
    } catch (err: any) {
      const msg = err?.error?.message?.message || err?.error?.message || err?.message || 'Failed to load deductions.';
      console.warn('Failed to load deductions from API', msg);
      return this.deductions();
    } finally {
      this.loadingDeductions.set(false);
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
        res.message || 'Loan request pending DigiSign verification.'
      );
      await this.loadDeductions();
      return true;
    } catch (err: any) {
      const msg = err?.error?.message?.message || err?.error?.message || err?.message || 'Failed to create deduction mandate.';
      this.toastService.error('Create Deduction Failed', msg);
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
      this.toastService.success('Deduction Deleted', 'Deduction mandate successfully deleted.');
      return true;
    } catch (err: any) {
      const msg = err?.error?.message?.message || err?.error?.message || err?.message || 'Failed to delete deduction mandate.';
      this.toastService.error('Delete Failed', msg);
      return false;
    }
  }

  // ── POST /dedukt/deductions/stop ────────────────────────────────────────────
  async stopDeduction(uuid: string, reason?: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/dedukt/deductions/stop`, {
          deduction_uuid: uuid,
          reason: reason || 'Stopped by Officer'
        })
      );
      this.deductions.update(list =>
        list.map(d => (d.uuid === uuid || d.id === uuid) ? { ...d, status: 'CANCELLED', remarks: reason || d.remarks } : d)
      );
      this.toastService.success('Deduction Stopped', 'Deduction mandate successfully stopped.');
      return true;
    } catch (err: any) {
      const msg = err?.error?.message?.message || err?.error?.message || err?.message || 'Failed to stop deduction mandate.';
      this.toastService.error('Stop Failed', msg);
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
    if (!trimmedVal) return null;

    // If companyUuid is provided, call real API
    if (companyUuid) {
      try {
        let endpoint = '';
        if (criteria === 'Account Number') {
          endpoint = `${environment.apiUrl}/dedukt/companies/${companyUuid}/employees/banks/${bankId}/accounts/${encodeURIComponent(trimmedVal)}`;
        } else {
          // Default to Service Number
          endpoint = `${environment.apiUrl}/dedukt/companies/${companyUuid}/employees/${encodeURIComponent(trimmedVal)}`;
        }

        const res = await firstValueFrom(
          this.http.get<EmployeeSearchResponse>(endpoint)
        );

        if (res?.data) {
          const emp = mapApiEmployee(res.data);
          return emp;
        }
      } catch (err: any) {
        const msg = err?.error?.message?.message || err?.error?.message || err?.message || 'Employee record not found.';
        this.toastService.warning('Search Result', msg);
        return null;
      }
    }

    // Fallback search over local mock database if no companyUuid or offline
    return this.employees().find(emp => {
      if (criteria === 'Account Number') {
        return emp.accountNumber.toLowerCase().includes(trimmedVal.toLowerCase());
      } else {
        return emp.serviceNumber.toLowerCase().includes(trimmedVal.toLowerCase()) ||
               emp.ippisNumber.toLowerCase().includes(trimmedVal.toLowerCase()) ||
               emp.fullName.toLowerCase().includes(trimmedVal.toLowerCase());
      }
    }) || null;
  }


  // Mock Employees Database
  private employees = signal<Employee[]>([
    {
      id: 'emp-e01',
      fullName: 'Oluwaseun Babatunde Adeyemi',
      employer: 'Federal Ministry of Finance',
      ippisNumber: 'IPPIS-774920',
      staffNumber: 'STF/2018/8831',
      accountNumber: '0123984712',
      bankName: 'Guaranty Trust Bank',
      serviceNumber: 'SN-994821',
      retirementDate: '14 Oct 2038',
      availableDeductibleBalance: 245000,
      monthlyGrossSalary: 480000,
      monthlyNetSalary: 395000,
      gradeLevel: 'Grade Level 12 / Step 4',
      ministryOrAgency: 'Budget Office of the Federation',
      bvn: '22334455667',
      phone: '08034567890',
      email: 'o.adeyemi@finance.gov.ng',
      status: 'Active'
    },
    {
      id: 'emp-e02',
      fullName: 'Inspector Chinedu Okonkwo',
      employer: 'Nigerian Police Force',
      ippisNumber: 'IPPIS-883910',
      staffNumber: 'NPF/2015/4492',
      accountNumber: '2049182736',
      bankName: 'First Bank of Nigeria',
      serviceNumber: 'NPF-SN-44921',
      retirementDate: '28 Jul 2035',
      availableDeductibleBalance: 180000,
      monthlyGrossSalary: 350000,
      monthlyNetSalary: 290000,
      gradeLevel: 'Inspectorate II',
      ministryOrAgency: 'Force Headquarters, Abuja',
      bvn: '22889900112',
      phone: '08123456789',
      email: 'c.okonkwo@npf.gov.ng',
      status: 'Active'
    },
    {
      id: 'emp-e03',
      fullName: 'Dr. Amina Garba Bello',
      employer: 'Federal Ministry of Health',
      ippisNumber: 'IPPIS-339281',
      staffNumber: 'FMH/2012/1029',
      accountNumber: '1098234710',
      bankName: 'Zenith Bank',
      serviceNumber: 'FMH-SN-10294',
      retirementDate: '19 May 2041',
      availableDeductibleBalance: 420000,
      monthlyGrossSalary: 720000,
      monthlyNetSalary: 590000,
      gradeLevel: 'Grade Level 14 / Step 2',
      ministryOrAgency: 'Department of Public Health',
      bvn: '22119933445',
      phone: '08098765432',
      email: 'amina.bello@health.gov.ng',
      status: 'Active'
    },
    {
      id: 'emp-e04',
      fullName: 'Riley Parker',
      employer: 'Federal Ministry of Education',
      ippisNumber: 'IPPIS-664019',
      staffNumber: 'FME/2019/3321',
      accountNumber: '3089124451',
      bankName: 'Access Bank',
      serviceNumber: 'FME-SN-33218',
      retirementDate: '03 Nov 2044',
      availableDeductibleBalance: 165000,
      monthlyGrossSalary: 310000,
      monthlyNetSalary: 260000,
      gradeLevel: 'Grade Level 09 / Step 2',
      ministryOrAgency: 'National Universities Commission',
      bvn: '22446688001',
      phone: '08129619267',
      email: 'riley.parker@example.test',
      status: 'Active'
    }
  ]);

  // Mock Deductions Database
  private deductions = signal<Deduction[]>([
    {
      id: 'DED-1001',
      customer: 'Oluwaseun Babatunde Adeyemi',
      employer: 'Federal Ministry of Finance',
      serviceNumber: 'SN-994821',
      loanAmount: 1500000,
      startDate: '01/15/2024',
      endDate: '01/15/2025',
      tenor: 12,
      repaymentAmount: 145000,
      totalRepayment: 1740000,
      status: 'Active',
      referenceNumber: 'REF-2024-0981',
      description: 'Personal Asset Financing Facility',
      createdAt: '2024-01-10'
    },
    {
      id: 'DED-1002',
      customer: 'Inspector Chinedu Okonkwo',
      employer: 'Nigerian Police Force',
      serviceNumber: 'NPF-SN-44921',
      loanAmount: 850000,
      startDate: '03/01/2024',
      endDate: '03/01/2025',
      tenor: 12,
      repaymentAmount: 82000,
      totalRepayment: 984000,
      status: 'Active',
      referenceNumber: 'REF-2024-1142',
      description: 'Consumer Loan Deduction',
      createdAt: '2024-02-24'
    },
    {
      id: 'DED-1003',
      customer: 'Dr. Amina Garba Bello',
      employer: 'Federal Ministry of Health',
      serviceNumber: 'FMH-SN-10294',
      loanAmount: 3200000,
      startDate: '05/01/2024',
      endDate: '05/01/2026',
      tenor: 24,
      repaymentAmount: 165000,
      totalRepayment: 3960000,
      status: 'Active',
      referenceNumber: 'REF-2024-2041',
      description: 'Professional Improvement Loan',
      createdAt: '2024-04-20'
    },
    {
      id: 'DED-1004',
      customer: 'Jamie Ellis',
      employer: 'Federal Inland Revenue Service (FIRS)',
      serviceNumber: 'FIRS-SN-7729',
      loanAmount: 2100000,
      startDate: '02/10/2024',
      endDate: '02/10/2025',
      tenor: 12,
      repaymentAmount: 198000,
      totalRepayment: 2376000,
      status: 'Active',
      referenceNumber: 'REF-2024-0812',
      description: 'Home Appliance Facility',
      createdAt: '2024-02-01'
    },
    {
      id: 'DED-1005',
      customer: 'Drew Carter',
      employer: 'Nigerian Ports Authority (NPA)',
      serviceNumber: 'NPA-SN-5519',
      loanAmount: 1200000,
      startDate: '04/01/2024',
      endDate: '10/01/2024',
      tenor: 6,
      repaymentAmount: 220000,
      totalRepayment: 1320000,
      status: 'Active',
      referenceNumber: 'REF-2024-1772',
      description: 'Quick Salary Advance',
      createdAt: '2024-03-25'
    }
  ]);

  // Mock Cancellations Database
  private cancellations = signal<Cancellation[]>([
    {
      id: 'CAN-801',
      customer: 'Musa Ibrahim Dantata',
      serviceNumber: 'SN-771920',
      loanAmount: 950000,
      tenor: 12,
      repaymentAmount: 91000,
      totalRepayment: 1092000,
      cancelledAt: '02/18/2024',
      cancellationReason: 'Early Full Liquidation by Customer',
      cancelledBy: 'Jordan Vale',
      originalDeductionId: 'DED-0912'
    },
    {
      id: 'CAN-802',
      customer: 'Folashade Evelyn Adebayo',
      serviceNumber: 'FME-SN-9912',
      loanAmount: 1400000,
      tenor: 18,
      repaymentAmount: 93000,
      totalRepayment: 1674000,
      cancelledAt: '03/05/2024',
      cancellationReason: 'Employer Transfer & Service Restructuring',
      cancelledBy: 'Avery Stone',
      originalDeductionId: 'DED-0945'
    },
    {
      id: 'CAN-803',
      customer: 'Emmanuel Chukwuma Eze',
      serviceNumber: 'NPF-SN-1102',
      loanAmount: 600000,
      tenor: 6,
      repaymentAmount: 110000,
      totalRepayment: 660000,
      cancelledAt: '04/12/2024',
      cancellationReason: 'Duplicate Mandate Cancellation',
      cancelledBy: 'Jordan Vale',
      originalDeductionId: 'DED-0978'
    }
  ]);

  // Mock Users Database matching Image 2
  private users = signal<PortalUser[]>([
    {
      id: 'demo-user-101',
      name: 'Avery Stone',
      branch: 'Demo Headquarters',
      email: 'avery.stone@example.test',
      phoneNumber: '08010001001',
      role: 'Analyst',
      status: 'Active',
      createdAt: '2023-11-12'
    },
    {
      id: 'demo-user-102',
      name: 'Morgan Reed',
      branch: 'Demo Headquarters',
      email: 'morgan.reed@example.test',
      phoneNumber: '08010001002',
      role: 'Verification Officer',
      status: 'Active',
      createdAt: '2023-10-05'
    },
    {
      id: 'demo-user-103',
      name: 'Jordan Vale',
      branch: 'Demo Headquarters',
      email: 'jordan.vale@example.test',
      phoneNumber: '08010001003',
      role: 'Branch Manager',
      status: 'Active',
      createdAt: '2023-08-19'
    },
    {
      id: 'demo-user-104',
      name: 'Taylor Quinn',
      branch: 'Demo Regional Branch',
      email: 'taylor.quinn@example.test',
      phoneNumber: '08010001004',
      role: 'Auditor',
      status: 'Active',
      createdAt: '2024-01-14'
    },
    {
      id: 'demo-user-105',
      name: 'Casey Blake',
      branch: 'Demo Support Branch',
      email: 'casey.blake@example.test',
      phoneNumber: '08010001005',
      role: 'Super Admin',
      status: 'Active',
      createdAt: '2024-02-20'
    }
  ]);

  // Readonly signals
  readonly allDeductions = this.deductions.asReadonly();
  readonly allCancellations = this.cancellations.asReadonly();
  readonly allUsers = this.users.asReadonly();

  // Computed metrics for Deductions screen
  readonly totalDeductionsCount = computed(() => this.deductions().length);
  readonly totalLoanAmountSum = computed(() => 
    this.deductions().reduce((sum, d) => sum + (d.loanAmount || 0), 0)
  );

  // Get employee deductions
  getEmployeeDeductions(serviceNumber: string): Deduction[] {
    return this.deductions().filter(d => d.serviceNumber.toLowerCase() === serviceNumber.toLowerCase());
  }

  // Create Deduction
  createDeduction(request: CreateDeductionRequest): Deduction {
    const newId = `DED-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date();
    const startDateFormatted = request.startDate || `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;
    
    // Calculate End Date based on tenor
    const endDateObj = new Date(today);
    endDateObj.setMonth(endDateObj.getMonth() + Number(request.tenor));
    const endDateFormatted = `${(endDateObj.getMonth() + 1).toString().padStart(2, '0')}/${endDateObj.getDate().toString().padStart(2, '0')}/${endDateObj.getFullYear()}`;

    const newDeduction: Deduction = {
      id: newId,
      customer: request.customer,
      employer: request.employer,
      serviceNumber: request.serviceNumber,
      loanAmount: Number(request.loanAmount),
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      tenor: Number(request.tenor),
      repaymentAmount: Number(request.repaymentAmount),
      totalRepayment: Number(request.totalRepayment),
      status: 'Active',
      referenceNumber: `REF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      description: request.purpose || 'Salary Deduction Mandate',
      createdAt: new Date().toISOString()
    };

    // Update deductions
    this.deductions.update(list => [newDeduction, ...list]);

    // Update employee available deductible balance
    this.employees.update(emps => emps.map(emp => {
      if (emp.serviceNumber === request.serviceNumber) {
        const remaining = Math.max(0, emp.availableDeductibleBalance - newDeduction.repaymentAmount);
        return { ...emp, availableDeductibleBalance: remaining };
      }
      return emp;
    }));

    this.toastService.success('Deduction Created', `Successfully created deduction ${newDeduction.referenceNumber} for ${request.customer}.`);
    return newDeduction;
  }

  // Cancel Deduction
  cancelDeduction(deductionId: string, reason: string): boolean {
    const target = this.deductions().find(d => d.id === deductionId);
    if (!target) {
      this.toastService.error('Error', 'Deduction record not found.');
      return false;
    }

    // Remove from active deductions list
    this.deductions.update(list => list.filter(d => d.id !== deductionId));

    const today = new Date();
    const dateFormatted = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;

    // Add to cancellations list
    const cancellation: Cancellation = {
      id: `CAN-${Math.floor(800 + Math.random() * 900)}`,
      customer: target.customer,
      serviceNumber: target.serviceNumber,
      loanAmount: target.loanAmount,
      tenor: target.tenor,
      repaymentAmount: target.repaymentAmount,
      totalRepayment: target.totalRepayment,
      cancelledAt: dateFormatted,
      cancellationReason: reason || 'Customer Requested Cancellation',
      cancelledBy: 'Current Officer',
      originalDeductionId: target.id
    };

    this.cancellations.update(list => [cancellation, ...list]);

    // Restore employee available deductible balance
    this.employees.update(emps => emps.map(emp => {
      if (emp.serviceNumber === target.serviceNumber) {
        return { ...emp, availableDeductibleBalance: emp.availableDeductibleBalance + target.repaymentAmount };
      }
      return emp;
    }));

    this.toastService.success('Deduction Cancelled', `Deduction for ${target.customer} has been moved to Cancellations.`);
    return true;
  }

  // User Management
  changeUserRole(userId: string, newRole: UserRole): boolean {
    let updated = false;
    this.users.update(list => list.map(u => {
      if (u.id === userId) {
        updated = true;
        return { ...u, role: newRole };
      }
      return u;
    }));

    if (updated) {
      this.toastService.success('Role Updated', `User role changed to ${newRole}.`);
    }
    return updated;
  }

  deleteUser(userId: string): boolean {
    const userToDelete = this.users().find(u => u.id === userId);
    this.users.update(list => list.filter(u => u.id !== userId));
    
    if (userToDelete) {
      this.toastService.info('User Deleted', `${userToDelete.name} has been removed from user management.`);
    }
    return true;
  }

  createUser(dto: CreateUserDto): PortalUser {
    const name = `${dto.firstName} ${dto.lastName}`.trim();
    const newUser: PortalUser = {
      id: `usr-${Date.now()}`,
      name: name,
      branch: 'Main Branch',
      email: dto.email,
      phoneNumber: '',
      role: dto.role as UserRole,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.users.update(list => [...list, newUser]);
    this.toastService.success('User Created', `Added ${name} (${dto.role}) to Dedukt users.`);
    return newUser;
  }

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
}
