import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface CustomDatePickerProps {
  dateForm: string | null;
  name: string;
  handleChange: (e: { target: { name: string; value: string } }) => void;
  className?: string;
  labelclassName?: string;
  label?: string;
  [key: string]: any;
}

const CustomDatePicker = React.forwardRef<
  HTMLInputElement,
  CustomDatePickerProps
>(
  (
    {
      name,
      dateForm,
      handleChange,
      label,
      labelclassName,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className="space-y-1">
        {label && (
          <label
            className={`block text-xs font-medium text-gray-500 mb-1 ${labelclassName}`}
          >
            {label}
          </label>
        )}
        <DatePicker
          selected={dateForm ? new Date(dateForm) : null}
          onChange={(date: Date | null) => {
            handleChange({
              target: {
                name,
                value: date ? date.toISOString() : "",
              },
            });
          }}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
          wrapperClassName="w-full"
          {...props}
        />
      </div>
    );
  }
);

CustomDatePicker.displayName = "CustomDatePicker";

export { CustomDatePicker };
export default CustomDatePicker;
