import * as yup from 'yup'; 


export const createStageSchema = () => yup.object({
  stage: yup.string().required("Stage name is required").min(2, "Stage name must be at least 2 characters").max(100, "Stage name cannot exceed 100 characters").trim(),
  stage_description: yup.string().required("Stage description is required").min(2, "Stage description must be at least 2 characters").max(100, "Stage description cannot exceed 100 characters").trim(),
}) as yup.ObjectSchema<{ 
  stage: string; 
  stage_description: string; 
}>;

export const createLanguageSchema = () => yup.object({
  language: yup.string().required("Stage name is required").min(2, "Stage name must be at least 2 characters").max(100, "Stage name cannot exceed 100 characters").trim(),
}) as yup.ObjectSchema<{ 
  language: string;  
}>;

export const createRoleSchema = () => yup.object().shape({
  role: yup.string().required("Role is required"),
  description: yup.string().required("Description of role is required"),
});

export const createRoleUserSchema = () => yup.object().shape({
  role: yup.string().required("Role is required"),
  users: yup.array().min(1, "At least one user is required"),
  active: yup.boolean().default(true),
});

export const createPermissionSchema = () => yup.object().shape({
  module: yup.string().required("Module name is required"),
  isHeading: yup.boolean().optional(),
  actions: yup.array().of(yup.string()).min(1, 'At least one action is required'),
});

export const assignUserPermissionSchema = () => yup.object().shape({
  userId: yup.string(),
});

export const createUserSchema = () => yup.object().shape({
  name: yup.string().required("Name is required"),
  empCode: yup.string().required("Employee code is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  mobile: yup.string().optional(),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

export const createLoginSchema = () => yup.object().shape({
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export const createRegisterSchema = () => yup.object().shape({
  name: yup.string().required("Name is required"),
  empCode: yup.string().required("Employee code is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  mobile: yup.string().required("Mobile number is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

 
