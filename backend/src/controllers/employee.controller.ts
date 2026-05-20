import { Request, Response } from 'express';
import Employee from '../models/Employee';
import axios from 'axios';

// Helper function to fix date format (similar to Laravel's AttendanceHelper::fixDate)
const fixDate = (date: any): Date | null => {
  if (!date) return null;
  try {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  } catch {
    return null;
  }
};

// Fetch employee data from Darwinbox API
export const fetchEmployeesFromDarwinbox = async () => {
  try {
    const apiKey = process.env.DARWINBOX_API_KEY || 'DARWINBOX123@API';
    const apiUrl = process.env.DARWINBOX_API_URL || 'http://192.168.1.33/api/darwinbox/employee.php';

    const response = await axios.get(apiUrl, {
      headers: {
        'API-KEY': apiKey,
        'Accept': 'application/json',
      },
    });

    if (response.data.status === 'error') {
      throw new Error(response.data.message || 'API returned error');
    }

    const employees = response.data.data || [];
    console.log(`${employees.length} Employees fetched from Darwinbox API`);

    return employees;
  } catch (error) {
    console.error('Error fetching employees from Darwinbox:', error);
    throw error;
  }
};

// Store employee data in MongoDB
export const storeEmployees = async (employees: any[]) => {
  try {
    if (employees.length === 0) {
      console.log('No employees to store');
      return { message: 'No employees to store', count: 0 };
    }

    const now = new Date();
    const records = [];

    for (const emp of employees) {
      const record = {
        emp_code: emp.employee_id,
        first_name: emp.first_name || null,
        last_name: emp.last_name || null,
        full_name: emp.full_name || null,
        date_of_birth: fixDate(emp.date_of_birth),
        date_of_joining: fixDate(emp.date_of_joining),
        date_of_confirmation: fixDate(emp.date_of_confirmation),
        date_of_exit: fixDate(emp.date_of_exit),
        business_unit: emp.business_unit || null,
        business_unit_code: emp.business_unit_code || null,
        department_id: emp.department_id || null,
        department: emp.department || null,
        department_code: emp.department_code || null,
        department_name: emp.department_name || null,
        designation: emp.designation || null,
        designation_code: emp.designation_code || null,
        designation_name: emp.designation_name || null,
        designation_title: emp.designation_title || null,
        designation_title_code: emp.designation_title_code || null,
        company_email: emp.company_email_id || null,
        gender: emp.gender || null,
        personal_mobile_no: emp.personal_mobile_no ? String(emp.personal_mobile_no).replace(/["']/g, '') : null,
        office_mobile_no: emp.office_mobile_no ? String(emp.office_mobile_no).replace(/["']/g, '') : null,
        location_type: emp.location_type ? emp.location_type.trim() : null,
        employee_type: emp.employee_type ? emp.employee_type.trim() : null,
        sub_employee_type: emp.sub_employee_type || null,
        employee_status: emp.employee_status || null,
        standard_role1: emp.standard_role1 || null,
        standard_role1_emp_code: emp.standard_role1_employee_id || null,
        standard_role1_name: emp.standard_role1_name || null,
        standard_role1_email: emp.standard_role1_email_id || null,
        hrbp_emp_code: emp.hrbp_employee_id || null,
        hrbp_name: emp.hrbp_name || null,
        hod: emp.hod || null,
        hod_emp_code: emp.hod_employee_id || null,
        hod_email: emp.hod_email_id || null,
        attendance_shift: emp.attendance_shift || null,
        current_attendance_shift: emp.current_attendance_shift || null,
        work_center_name: emp.work_center_name || null,
        work_area_code: emp.work_area_code || null,
        direct_manager: emp.direct_manager || null,
        direct_manager_emp_code: emp.direct_manager_employee_id || null,
        direct_manager_name: emp.direct_manager_name || null,
        direct_manager_email: emp.direct_manager_email_id || null,
        blood_group: emp.blood_group || null,
        nationality: emp.nationality || null,
        current_address: emp.current_address || null,
        native: emp.native || null,
        contractor_name: emp.contractor_name || null,
        separation_status: emp.separation_status || null,
        father_name: emp.father_name || null,
        spouse_name: emp.spouse_name || null,
        date_of_birth_original: fixDate(emp.date_of_birth_original),
        skill_matrix: emp.skill_matrix || null,
        created_at: now,
        updated_at: now,
      };
      records.push(record);
    }

    // Bulk upsert - update existing or insert new
    const bulkOps = records.map((record) => ({
      updateOne: {
        filter: { emp_code: record.emp_code },
        update: { $set: record as any },
        upsert: true,
      },
    }));

    const result = await Employee.bulkWrite(bulkOps as any, { ordered: false });
    console.log(`Employee data stored: ${result.upsertedCount} inserted, ${result.modifiedCount} updated`);

    return {
      message: 'Employee data stored successfully',
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
      total: records.length,
    };
  } catch (error) {
    console.error('Error storing employees:', error);
    throw error;
  }
};

// Manual trigger to fetch and store employee data
export const fetchAndStoreEmployees = async (req: Request, res: Response) => {
  try {
    console.log('Manual trigger: Fetching employees from Darwinbox API...');
    const employees = await fetchEmployeesFromDarwinbox();
    
    console.log('Manual trigger: Storing employees in database...');
    const result = await storeEmployees(employees);

    res.status(200).json({
      message: 'Employee data fetched and stored successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in fetchAndStoreEmployees:', error);
    res.status(500).json({
      message: 'Failed to fetch and store employee data',
      error: (error as Error).message,
    });
  }
};

// Retrieve stored employee data
export const getEmployees = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, search, department, status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { emp_code: { $regex: search, $options: 'i' } },
        { full_name: { $regex: search, $options: 'i' } },
        { company_email: { $regex: search, $options: 'i' } },
        { personal_mobile_no: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) {
      query.department_code = department;
    }

    if (status) {
      query.employee_status = status;
    }

    const [employees, total] = await Promise.all([
      Employee.find(query)
        .sort({ updated_at: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Employee.countDocuments(query),
    ]);

    res.status(200).json({
      data: employees,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error retrieving employees:', error);
    res.status(500).json({
      message: 'Failed to retrieve employee data',
      error: (error as Error).message,
    });
  }
};

// Get single employee by emp_code
export const getEmployeeByCode = async (req: Request, res: Response) => {
  try {
    const { empCode } = req.params;
    
    const employee = await Employee.findOne({ emp_code: empCode });
    
    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found',
      });
    }

    res.status(200).json({
      data: employee,
    });
  } catch (error) {
    console.error('Error retrieving employee:', error);
    res.status(500).json({
      message: 'Failed to retrieve employee data',
      error: (error as Error).message,
    });
  }
};

// Get employee statistics
export const getEmployeeStats = async (req: Request, res: Response) => {
  try {
    const stats = await Employee.aggregate([
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          activeEmployees: {
            $sum: {
              $cond: [{ $eq: ['$employee_status', 'Active'] }, 1, 0],
            },
          },
          inactiveEmployees: {
            $sum: {
              $cond: [{ $eq: ['$employee_status', 'Inactive'] }, 1, 0],
            },
          },
          departments: { $addToSet: '$department_name' },
        },
      },
      {
        $project: {
          _id: 0,
          totalEmployees: 1,
          activeEmployees: 1,
          inactiveEmployees: 1,
          departmentCount: { $size: '$departments' },
        },
      },
    ]);

    const lastUpdated = await Employee.findOne().sort({ updated_at: -1 }).select('updated_at');

    res.status(200).json({
      data: stats[0] || {
        totalEmployees: 0,
        activeEmployees: 0,
        inactiveEmployees: 0,
        departmentCount: 0,
      },
      lastUpdated: lastUpdated?.updated_at || null,
    });
  } catch (error) {
    console.error('Error retrieving employee stats:', error);
    res.status(500).json({
      message: 'Failed to retrieve employee statistics',
      error: (error as Error).message,
    });
  }
};
