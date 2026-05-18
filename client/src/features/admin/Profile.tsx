import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import authService from "../../services/auth";
import { STORAGE_KEYS } from "../../services/storage";
import { useLoader } from "../../shared/hooks/useLoader"; 
import { Input } from "../../shared/component/Input"; 
import { Button } from "../../shared/component/Button";
import { Select } from "../../shared/component/Select";

// Validation schemas
const profileSchema = yup.object().shape({
  name: yup.string().trim().required("Name is required"),
  email: yup.string().trim().email("Email is invalid").required("Email is required"),
  mobile: yup.string().trim().matches(/^\d{10}$/, "Mobile Number must be exactly 10 digits").required("Mobile Number is required"),
  plant: yup.string().trim().required("Plant is required"),
});

const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup.string().min(6, "Password must be at least 6 characters").required("New password is required"),
  confirmPassword: yup.string().oneOf([yup.ref('newPassword')], "Passwords must match").required("Confirm password is required"),
});

export default function Profile() {
  const { simulateAsync } = useLoader();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [userData, setUserData] = useState<any>(null);

  

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
    setValue: setProfileValue,
  } = useForm({
    resolver: yupResolver(profileSchema),
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await authService.getCurrentUserProfile();
        if (response.success) {
          setUserData(response.user);
          // Pre-populate profile form
          setProfileValue('name', response.user.name);
          setProfileValue('email', response.user.email);
          setProfileValue('mobile', response.user.mobile);
          setProfileValue('plant', response.user.plant);
        }
      } catch (error: any) {
        toast.error("Failed to load profile data");
        console.error("Profile fetch error:", error);
      }
    };

    fetchUserProfile();
  }, [setProfileValue]);

  // Handle profile update
  const onProfileSubmit = async (data: any) => {
    try {
      await simulateAsync(
        async () => {
          const response = await authService.updateProfile({
            name: data.name,
            email: data.email,
            mobile: data.mobile,
            plant: data.plant,
          });

          if (response.success) {
            setUserData(response.user);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
            toast.success("Profile updated successfully!");
            resetProfile();
          } else {
            toast.error(response.message || "Failed to update profile");
          }
        },
        "Updating Profile...",
        2000
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
      console.error("Profile update error:", error);
    }
  };

  // Handle password change
  const onPasswordSubmit = async (data: any) => {
    try {
      await simulateAsync(
        async () => {
          const response = await authService.updateProfile({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
            confirmPassword: data.confirmPassword,
          });

          if (response.success) {
            toast.success("Password changed successfully!");
            resetPassword();
          } else {
            toast.error(response.message || "Failed to change password");
          }
        },
        "Changing Password...",
        2000
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to change password");
      console.error("Password change error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <img
              src="images/bull-logo-text.png"
              alt="Bull Machine Logo"
              className="h-8 w-auto dark:invert"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Manage your account settings and security</p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'password'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Change Password
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-6">
              <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6">
                {/* Employee Code (Read-only) */}
                <div>
                  <Input
                    value={userData?.empCode || ''}
                    readOnly
                    id="employeeCode"
                    placeholder="Enter your Employee Code" 
                    label="Employee Code"
                    className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />                  
                </div>

                {/* Name */}
                <div>
                  <Input
                    {...registerProfile("name")}
                    id="name"
                    placeholder="Enter your full name" 
                    label="Full Name"
                    error={profileErrors.name?.message}
                  />                      
                </div>

                {/* Email */}
                <div>
                  <Input
                    {...registerProfile("email")}
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    label="Email Address"
                    error={profileErrors.email?.message}
                  />
                </div>

                {/* Mobile */}
                <div>
                  <Input
                    {...registerProfile("mobile")}
                    type="tel"
                    id="mobile"
                    placeholder="Enter your mobile number"
                    label="Mobile Number"
                    error={profileErrors.mobile?.message}
                  />
                </div>

                {/* Plant */}
                <div>
                  <Select
                    {...registerProfile("plant")}
                    label="Plant"
                    options={[
                      { label: "PLANT-1500", value: "PLANT-1500" },
                      { label: "PLANT-1000", value: "PLANT-1000" },
                    ]}
                    searchPlaceholder="Select your plant"
                    className="w-full"
                    error={profileErrors.plant?.message}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  label="Update Profile"
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                />
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="p-6">
              <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6">
                {/* Current Password */}
                <div>
                  <Input
                    {...registerPassword("currentPassword")}
                    id="currentPassword"
                    placeholder="Enter your current password"
                    label="Current Password"
                    isPassword
                    error={passwordErrors.currentPassword?.message}
                  />
                </div>

                {/* New Password */}
                <div>
                  <Input
                    {...registerPassword("newPassword")}
                    id="newPassword"
                    placeholder="Enter new password"
                    label="New Password"
                    isPassword
                    error={passwordErrors.newPassword?.message}
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <Input
                    {...registerPassword("confirmPassword")}
                    id="confirmPassword"
                    placeholder="Confirm new password"
                    label="Confirm New Password"
                    isPassword
                    error={passwordErrors.confirmPassword?.message}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  label="Change Password"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                />
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
