import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { Input } from "../../shared/component/Input";
import { Button } from "../../shared/component/Button";
import { Select } from "../../shared/component/Select";
import { useLoader } from "../../shared/hooks/useLoader";
import authService from "../../services/auth";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store/store";
import { useNavigate, Link } from "react-router-dom";
import { login, fetchUserPermissions } from "../../redux/authSlice";
import type { AppDispatch } from "../../store/store";
import { ThemeToggleButton } from "../../layouts/ThemeToggleButton";

const schema = yup.object().shape({
  name: yup.string().trim().required("Name is required"),
  email: yup.string().trim().email("Email is invalid").required("Email is required").matches(/^[^\s@]+@bullmachine\.com$/, "Email must be from @bullmachine.com domain"),
  employeeCode: yup.string().trim().required("Employee Code is required"),
  mobile: yup.string().trim().matches(/^\d{10}$/, "Mobile Number must be exactly 10 digits").required("Mobile Number is required"),
  password: yup.string().trim().min(6, "Password must be at least 6 characters").required("Password is required"),
  plant: yup.string().trim().required("Plant is required"),
});

export default function Register() {
  const { simulateAsync } = useLoader();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const permissionsLoaded = useSelector(
    (state: RootState) => state.auth.permissionsLoaded
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const firstError = Object.values(errors)[0];
    if (firstError) {
      toast.error(firstError.message);
    }
  }, [errors]);

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    try {
      await simulateAsync(
        async () => {
          // Register user
          await authService.register({
            name: data.name,
            empCode: data.employeeCode,
            email: data.email,
            mobile: data.mobile,
            password: data.password,
            plant: data.plant,
          });

          // Auto-login after successful registration
          const response = await authService.login(data.employeeCode, data.password);
          dispatch(login(response));

          // Fetch user permissions only if not already loaded
          if (!permissionsLoaded) {
            dispatch(fetchUserPermissions());
          }

          toast.success("Registration successful! Welcome aboard!"); 
          reset();
          navigate("/dashboard");
        },
        "Creating Account...",
        3000
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Registration failed. Please try again."
      );
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="h-screen relative flex items-center justify-center overflow-hidden">
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggleButton />
      </div>

      {/* Full-Screen Background */}
      <img
        src="images/register.jpeg"
        alt="Register background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Centered Form Content */}
      <div className="relative z-10 w-full max-w-md mx-4 max-h-screen overflow-y-auto">
        {/* Mobile Hero - Hidden on desktop since we have full-screen background */}
        <div className="lg:hidden mb-6">
          <div className="relative h-48 rounded-2xl overflow-hidden">
            <img
              src="images/register.jpeg"
              alt="Register background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-4">
              <h1 className="text-xl font-bold mb-2">Join Our Team</h1>
              <p className="text-blue-100 text-sm">Create your account</p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center mb-3 animate-fadeIn" style={{animationDelay: '0.3s'}}>
            <img
              src="images/bull-logo-text.png"
              alt="Bull Machine Logo"
              className="h-6 w-auto dark:invert"
            />
          </div>
          <h2 className="text-2xl font-bold text-white animate-slideUp" style={{animationDelay: '0.5s'}}>
            Cost Rate Approval
          </h2>
          <p className="mt-1 text-sm text-gray-200 animate-slideUp" style={{animationDelay: '0.7s'}}>
            Enterprise Financial Management System
          </p>
        </div>

        {/* Form Card */}
        <div className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-2xl p-6 animate-slideUp" style={{animationDelay: '0.9s'}}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
               <Input
                {...register("name")}
                id="name"
                type="text"
                label="Full Name"
                placeholder="Enter your full name"
                className="backdrop-blur-sm bg-white/20 border-white/30 focus:border-blue-400 focus:ring-blue-400 text-white placeholder-gray-300 transition-all duration-300"
              /> 
             <div className="grid grid-cols-2 gap-4">    
              <Input
                {...register("email")}
                id="email"
                type="email"
                label="Email Address"
                placeholder="your.email@bullmachine.com"
                className="backdrop-blur-sm bg-white/20 border-white/30 focus:border-blue-400 focus:ring-blue-400 text-white placeholder-gray-300 transition-all duration-300"
              /> 
              <Input
                  {...register("employeeCode")}
                  id="employeeCode"
                  type="text"
                  label="Employee Code"
                  placeholder="EMP001"
                  className="backdrop-blur-sm bg-white/20 border-white/30 focus:border-blue-400 focus:ring-blue-400 text-white placeholder-gray-300 transition-all duration-300"
                /> 
            </div>
            <div className="grid grid-cols-2 gap-4">              
                
               
                <Input
                  {...register("mobile")}
                  id="mobile"
                  type="tel"
                  label="Mobile Number"
                  placeholder="9876543210"
                  className="backdrop-blur-sm bg-white/20 border-white/30 focus:border-blue-400 focus:ring-blue-400 text-white placeholder-gray-300 transition-all duration-300"
                /> 
                 <Select
                {...register("plant")}
                label="Plant"
                options={[
                  {label:"Select Plant",value: " "},
                  { label: "PLANT-1500", value: "PLANT-1500" },
                  { label: "PLANT-1000", value: "PLANT-1000" },
                ]}
                searchPlaceholder="Select your plant"
                className="backdrop-blur-sm bg-white/20 border-white/30 focus:border-blue-400 focus:ring-blue-400 text-white placeholder-gray-300 transition-all duration-300"
                required
              /> 
            </div>
                           
              <Input
                {...register("password")}
                id="password"
                label="Password"
                placeholder="Create a strong password"
                isPassword
                className="backdrop-blur-sm bg-white/20 border-white/30 focus:border-blue-400 focus:ring-blue-400 text-white placeholder-gray-300 transition-all duration-300"
              />
             

            <div className="flex justify-center">
              <Button
                label="Create Account"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              />
            </div>
          </form>

          {/* Login Link */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-200">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-300 hover:text-blue-200 transition-colors duration-200">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Security Badges */}
        <div className="mt-6 flex justify-center space-x-4">
          <div className="flex items-center space-x-1 text-xs text-gray-300">
            <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>SSL Encrypted</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-300">
            <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Enterprise Security</span>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <div className="flex justify-center space-x-4 text-xs text-gray-300">
            <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
