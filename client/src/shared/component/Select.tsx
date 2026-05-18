import React, { useState, useMemo, useEffect } from "react";

interface SelectProps {
  divClassName?: string;
  label?: string;
  error?: string;
  className?: string;
  labelclassName?: string;
  options?: { label: string; value: string }[];  
  searchable?: boolean;
  searchPlaceholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
}

const Select = React.forwardRef<HTMLInputElement | HTMLSelectElement, SelectProps>(
  ({ 
    label, 
    error, 
    labelclassName = "", 
    className = "", 
    options = [], 
    divClassName = "",
    searchable = false,
    searchPlaceholder = "Search...",
    value,
    onChange,
    required,
    disabled = false,
    ...props 
  }, ref) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || "");

    // Filter options based on search term
    const filteredOptions = useMemo(() => {
      if (!searchable) return options;  // Show all options when not searchable
      if (!isDropdownOpen) return options;  // Show all options when dropdown is closed
      
      return options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }, [options, searchTerm, searchable, isDropdownOpen]);

    // Update selected value when prop changes
    useEffect(() => {
      setSelectedValue(value || "");
    }, [value]);

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    };

    // Handle dropdown open/close
    const handleDropdownToggle = () => {
      setIsDropdownOpen(!isDropdownOpen);
      if (!isDropdownOpen) {
        setSearchTerm(""); // Clear search when opening
      }
    };

    // Handle option selection
    const handleOptionSelect = (optionValue: string) => {
      setSelectedValue(optionValue);
      setSearchTerm("");
      setIsDropdownOpen(false);
      
      // Call onChange prop with proper event structure
      if (onChange) {
        const syntheticEvent = {
          target: { value: optionValue },
          currentTarget: { value: optionValue }
        } as any;
        onChange(syntheticEvent);
      }
    };

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest(".select-container")) {
          setIsDropdownOpen(false);
          setSearchTerm("");
        }
      };

      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
      <div className={`space-y-1 select-container ${divClassName}`}>
        {label && (
          <label
            className={`block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 ${labelclassName}`}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {/* Custom dropdown with search */}
          {searchable ? (
            <div className="relative">
              {/* Trigger button */}
              <div
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer bg-white dark:bg-gray-800 dark:border-gray-600 ${
                  error ? "border-red-500 focus:ring-red-500" : ""
                } ${disabled ? "bg-gray-100 cursor-not-allowed opacity-50" : ""} ${className}`}
                onClick={disabled ? undefined : handleDropdownToggle}
              >
                <span className={selectedValue ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}>
                  {options.find((opt) => opt.value === selectedValue)?.label || "Select an option"}
                </span>
                <span className="absolute right-3 top-2.5 text-gray-400 dark:text-gray-500">
                  {isDropdownOpen ? "▲" : "▼"}
                </span>
              </div>

              {/* Dropdown with search */}
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                  {/* Search input */}
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder={searchPlaceholder}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      autoFocus
                    />
                  </div>
                  
                  {/* Filtered options */}
                  <div className="max-h-48 overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                      filteredOptions.map((option) => (
                        <div
                          key={option.value}
                          className={`px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 ${
                            option.value === selectedValue ? "bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-gray-100"
                          }`}
                          onClick={() => handleOptionSelect(option.value)}
                        >
                          {option.label}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                        No options found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Original select for non-searchable mode */
            <select
              ref={ref as React.Ref<HTMLSelectElement>}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              } ${disabled ? "bg-gray-100 cursor-not-allowed opacity-50" : ""} ${className}`}
              value={value}
              onChange={onChange}
              disabled={disabled}
              {...props}
            >
             {options.map((opt) => (
                <option key={opt.value || opt.label} value={opt.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {/* Hidden select for form submission when searchable */}
          {searchable && (
            <input
              type="hidden"
              ref={ref as React.Ref<HTMLInputElement>}
              value={selectedValue}
              onChange={onChange}
              {...props}
            />
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
export type { SelectProps };

