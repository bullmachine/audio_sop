import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { Input } from "../../shared/component/Input";
import { Button } from "../../shared/component/Button";
import authService from "../../services/auth";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store/store";
import { useNavigate, Link } from "react-router-dom";
import { login, fetchUserPermissions } from "../../redux/authSlice";
import type { AppDispatch } from "../../store/store";
import { useLoader } from "../../shared/hooks/useLoader";
import { ThemeToggleButton } from "../../layouts/ThemeToggleButton";

const schema = yup.object().shape({
  empCode: yup.string().required("Employee Code is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { simulateAsync } = useLoader();

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

  const onSubmit = async (data: { empCode: string; password: string }) => {
    try {
      await simulateAsync(
        async () => {
          const response = await authService.login(data.empCode, data.password);
          dispatch(login(response));
          // Fetch user permissions only if not already loaded
          if (!permissionsLoaded) {
            dispatch(fetchUserPermissions());
          }
          toast.success("Login successful!"); 
          reset();
          navigate("/dashboard");
        },
        "Authenticating...",
        2000
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Login failed. Please try again."
      );
      console.error("Login error:", error);
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
        src="images/login.jpeg"
        alt="Login background"
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
              src="images/login.jpeg"
              alt="Login background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-4">
              <h1 className="text-xl font-bold mb-2">Welcome Back</h1>
              <p className="text-blue-100 text-sm">Audio SOP Management System</p>
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
            Audio SOP System
          </h2>
          <p className="mt-1 text-sm text-gray-200 animate-slideUp" style={{animationDelay: '0.7s'}}>
            Manufacturing Operations Management
          </p>
        </div>

        {/* Form Card */}
        <div className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-2xl p-6 animate-slideUp" style={{animationDelay: '0.9s'}}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="empCode" className="block text-sm font-medium text-white mb-1">
                Employee Code
              </label>
              <Input
                {...register("empCode")}
                id="empCode"
                type="text"
                label=""
                placeholder="Enter your employee code"
                className="backdrop-blur-sm bg-white/20 border-white/30 focus:border-blue-400 focus:ring-blue-400 text-white placeholder-gray-300 transition-all duration-300"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                Password
              </label>
              <Input
                {...register("password")}
                id="password"
                label=""
                placeholder="Enter your password"
                isPassword
                className="backdrop-blur-sm bg-white/20 border-white/30 focus:border-blue-400 focus:ring-blue-400 text-white placeholder-gray-300 transition-all duration-300"
              />
            </div>

            <div className="flex justify-center">
              <Button
                label="Sign In"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              />
            </div>
          </form>

          {/* Register Link */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-200">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-300 hover:text-blue-200 transition-colors duration-200">
                Create one
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
