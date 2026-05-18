import React, { useState, useRef, useEffect } from 'react';

interface MultiSelectProps {
  label?: string;
  options: Array<{ label: string; value: string }>;
  value?: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  value = [],
  onChange,
  placeholder = "Select options...",
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<{ label: string; value: string }[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize selected options when value prop changes
  useEffect(() => {
    if (value && value.length > 0) {
      const selected = options.filter(option => value.includes(option.value));
      setSelectedOptions(selected);
    } else {
      setSelectedOptions([]);
    }
  }, [value, options]);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectOption = (option: { label: string; value: string }) => {
    const isSelected = selectedOptions.some(selected => selected.value === option.value);
    
    if (isSelected) {
      // Remove from selection
      const newSelection = selectedOptions.filter(selected => selected.value !== option.value);
      setSelectedOptions(newSelection);
      onChange(newSelection.map(selected => selected.value));
    } else {
      // Add to selection
      const newSelection = [...selectedOptions, option];
      setSelectedOptions(newSelection);
      onChange(newSelection.map(selected => selected.value));
    }
    
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleRemoveOption = (optionToRemove: { label: string; value: string }) => {
    const newSelection = selectedOptions.filter(option => option.value !== optionToRemove.value);
    setSelectedOptions(newSelection);
    onChange(newSelection.map(selected => selected.value));
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      {label && (
        <label className={`block text-xs font-medium text-gray-500 mb-1 ${error ? 'text-red-500' : ''}`}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Selected Options Display */}
        <div
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          onClick={handleToggle}
        >
          {selectedOptions.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-blue-100 text-blue-800"
                >
                  {option.label}
                  <button
                    type="button"
                    className="ml-1 text-blue-600 hover:text-blue-800"
                    onClick={() => handleRemoveOption(option)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No users found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => handleSelectOption(option)}
                  >
                    {option.label}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default MultiSelect;
