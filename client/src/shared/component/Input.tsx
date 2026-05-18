import React, { useState } from "react";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  labelclassName?: string;
  isPassword?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      labelclassName = "",
      isPassword = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleTogglePassword = () => {
      setShowPassword(!showPassword);
    };

    const inputType = isPassword
      ? showPassword
        ? "text"
        : "password"
      : props.type; 

    return (
      <div className="relative space-y-1">
        {label && (
          <label
            className={`block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 ${labelclassName}`}
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          type={inputType}
          className={`w-full text-xs sm:text-sm px-3 py-2 sm:py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
          } ${className}`}
          {...props}
        />

        {isPassword && (
          <span
            onClick={handleTogglePassword}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer transition-colors duration-200 ${
              error
                ? "text-red-500 hover:text-red-600"
                : "text-blue-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus-within:text-blue-500"
            }`}
          >
            {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          </span>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
