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

export const createOperatorSchema = (isEdit = false) =>
  yup.object({
    name: yup.string().required("Name is required").trim(),
    loginId: yup.string().required("Login ID is required").trim(),
    password: isEdit
      ? yup.string().min(6, "Password must be at least 6 characters").optional()
      : yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  }) as yup.ObjectSchema<{
    name: string;
    loginId: string;
    password?: string;
  }>;

export const createProductSchema = () =>
  yup.object({
    name: yup
      .string()
      .required("Product name is required")
      .min(2, "Product name must be at least 2 characters")
      .max(100, "Product name cannot exceed 100 characters")
      .trim(),
    description: yup.string().optional().trim(),
  }) as yup.ObjectSchema<{
    name: string;
    description?: string;
  }>;

export const createSopSchema = () =>
  yup.object({
    sop_name: yup.string().required("SOP name is required").min(2, "SOP name must be at least 2 characters").max(100, "SOP name cannot exceed 100 characters").trim(),
    sop_description: yup.string().optional().max(500, "SOP description cannot exceed 500 characters").trim(),
  }) as yup.ObjectSchema<{
    sop_name: string;
    sop_description?: string;
  }>;

export const createAudioSopSchema = () =>
  yup.object({
    product: yup.string().required("Product is required"),
    stage: yup.string().required("Stage is required"),
    language: yup.string().required("Language is required"),
    sop: yup.string().required("SOP is required").trim(),
    operators: yup.array().of(yup.string().required()).min(1, "Select at least one operator"),
  });

export const createLoginSchema = () => yup.object().shape({
  loginId: yup.string().required("Login ID is required"),
  password: yup.string().required("Password is required"),
});

export const createRegisterSchema = () => yup.object().shape({
  name: yup.string().required("Name is required"),
  empCode: yup.string().required("Employee code is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  mobile: yup.string().required("Mobile number is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

 
