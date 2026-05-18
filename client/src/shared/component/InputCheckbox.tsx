import React from "react";

interface InputCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  labelclassName?: string;
}

const InputCheckbox = React.forwardRef<HTMLInputElement, InputCheckboxProps>(
  ({ label, error, labelclassName = "", className = "", ...props }, ref) => {
    return (
      <div className={`flex items-center ${className}`}>
        <label className={`ml-2 block text-xs font-medium text-gray-500 ${labelclassName}`}>{label}</label>
        <input
          ref={ref}
          {...props}
          type="checkbox"
          className="form-checkbox h-3 w-3 text-blue-600 mt-0.5 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>
    );
  }
);
InputCheckbox.displayName = "InputCheckbox";
export { InputCheckbox };
export type { InputCheckboxProps };
