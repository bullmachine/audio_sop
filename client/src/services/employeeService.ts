import { apiRequest } from './axios';
import type { PaginationParams, PaginatedResponse } from '../types/common';

export interface Employee {
  _id?: string;
  emp_code: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  date_of_birth?: string;
  date_of_joining?: string;
  date_of_confirmation?: string;
  date_of_exit?: string;
  business_unit?: string;
  business_unit_code?: string;
  department_id?: string;
  department?: string;
  department_code?: string;
  department_name?: string;
  designation?: string;
  designation_code?: string;
  designation_name?: string;
  designation_title?: string;
  designation_title_code?: string;
  company_email?: string;
  gender?: string;
  personal_mobile_no?: string;
  office_mobile_no?: string;
  location_type?: string;
  employee_type?: string;
  sub_employee_type?: string;
  employee_status?: string;
  standard_role1?: string;
  standard_role1_emp_code?: string;
  standard_role1_name?: string;
  standard_role1_email?: string;
  hrbp_emp_code?: string;
  hrbp_name?: string;
  hod?: string;
  hod_emp_code?: string;
  hod_email?: string;
  attendance_shift?: string;
  current_attendance_shift?: string;
  work_center_name?: string;
  work_area_code?: string;
  direct_manager?: string;
  direct_manager_emp_code?: string;
  direct_manager_name?: string;
  direct_manager_email?: string;
  blood_group?: string;
  nationality?: string;
  current_address?: string;
  native?: string;
  contractor_name?: string;
  separation_status?: string;
  father_name?: string;
  spouse_name?: string;
  date_of_birth_original?: string;
  skill_matrix?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  departmentCount: number;
}

export interface FetchEmployeeResponse {
  message: string;
  data: {
    message: string;
    inserted: number;
    updated: number;
    total: number;
  };
}

class EmployeeService {
  private endpoint = '/employees';

  // Fetch and store employees from Darwinbox API
  async fetchAndStore(): Promise<FetchEmployeeResponse> {
    return apiRequest.post(`${this.endpoint}/fetch`);
  }

  // Get all employees with pagination and filters
  async getAll(params?: PaginationParams & { search?: string; department?: string; status?: string }): Promise<PaginatedResponse<Employee>> {
    return apiRequest.get(this.endpoint, { params });
  }

  // Get employee by emp_code
  async getByCode(empCode: string): Promise<{ data: Employee }> {
    return apiRequest.get(`${this.endpoint}/${empCode}`);
  }

  // Get employee statistics
  async getStats(): Promise<{ data: EmployeeStats; lastUpdated: string | null }> {
    return apiRequest.get(`${this.endpoint}/stats`);
  }
}

export default new EmployeeService();
