import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  emp_code: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  date_of_birth?: Date;
  date_of_joining?: Date;
  date_of_confirmation?: Date;
  date_of_exit?: Date;
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
  date_of_birth_original?: Date;
  skill_matrix?: string;
  created_at: Date;
  updated_at: Date;
}

const EmployeeSchema: Schema = new Schema(
  {
    emp_code: { type: String, required: true, unique: true },
    first_name: String,
    last_name: String,
    full_name: String,
    date_of_birth: Date,
    date_of_joining: Date,
    date_of_confirmation: Date,
    date_of_exit: Date,
    business_unit: String,
    business_unit_code: String,
    department_id: String,
    department: String,
    department_code: String,
    department_name: String,
    designation: String,
    designation_code: String,
    designation_name: String,
    designation_title: String,
    designation_title_code: String,
    company_email: String,
    gender: String,
    personal_mobile_no: String,
    office_mobile_no: String,
    location_type: String,
    employee_type: String,
    sub_employee_type: String,
    employee_status: String,
    standard_role1: String,
    standard_role1_emp_code: String,
    standard_role1_name: String,
    standard_role1_email: String,
    hrbp_emp_code: String,
    hrbp_name: String,
    hod: String,
    hod_emp_code: String,
    hod_email: String,
    attendance_shift: String,
    current_attendance_shift: String,
    work_center_name: String,
    work_area_code: String,
    direct_manager: String,
    direct_manager_emp_code: String,
    direct_manager_name: String,
    direct_manager_email: String,
    blood_group: String,
    nationality: String,
    current_address: String,
    native: String,
    contractor_name: String,
    separation_status: String,
    father_name: String,
    spouse_name: String,
    date_of_birth_original: Date,
    skill_matrix: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

// Index for faster queries
EmployeeSchema.index({ department_code: 1 });
EmployeeSchema.index({ employee_status: 1 });

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);
