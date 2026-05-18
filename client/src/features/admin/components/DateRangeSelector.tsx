import React, { useState, useEffect } from 'react';

interface DateRange {
  startDate: string;
  endDate: string;
  label: string;
}

interface DateRangeSelectorProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
  isLoading?: boolean;
  selectedStartDate?: string;
  selectedEndDate?: string;
  className?: string;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  onDateRangeChange,
  isLoading = false,
  selectedStartDate,
  selectedEndDate,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Predefined date ranges
  const getDateRanges = (): DateRange[] => {
    // Use local date for Today to avoid timezone issues
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const todayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; 

    // Create today date object for other calculations
    const today = new Date(year, month, day);

    return [
      {
        label: 'Today',
        startDate: todayString,
        endDate: todayString
      },
      {
        label: 'This Week',
        startDate: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      },
      {
        label: 'This Month',
        startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
      },
      {
        label: 'Last Month',
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0],
        endDate: new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
      },
      {
        label: 'Last 7 Days',
        startDate: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      },
      {
        label: 'Last 30 Days',
        startDate: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      }
    ];
  };

  // Format selected date range for display
  const getSelectedRangeText = () => {
    if (!selectedStartDate || !selectedEndDate) {
      return 'Date Range';
    }

    // Check if it matches any predefined range
    const dateRanges = getDateRanges();
    const matchingRange = dateRanges.find(range =>
      range.startDate === selectedStartDate && range.endDate === selectedEndDate
    );

    if (matchingRange) {
      return matchingRange.label;
    }

    // If no predefined range matches, show formatted dates
    const start = new Date(selectedStartDate);
    const end = new Date(selectedEndDate);

    if (selectedStartDate === selectedEndDate) {
      return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const handleQuickSelect = (range: DateRange) => { 
    onDateRangeChange(range.startDate, range.endDate); 
    setIsOpen(false);
  };

  const handleCustomRangeApply = () => {
    if (customStartDate && customEndDate) {
      onDateRangeChange(customStartDate, customEndDate);
      setIsOpen(false);
    }
  };

  const dateRanges = getDateRanges();

  // Track selected range internally for better UX
  const [selectedRange, setSelectedRange] = useState<string | null>(null);

  // Update internal state when props change
  useEffect(() => {
    if (selectedStartDate && selectedEndDate) {
      const matchingRange = dateRanges.find(range =>
        range.startDate === selectedStartDate && range.endDate === selectedEndDate
      );
      setSelectedRange(matchingRange ? matchingRange.label : null);
    } else {
      setSelectedRange(null);
    }
  }, [selectedStartDate, selectedEndDate, dateRanges]);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm ${className}`}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {getSelectedRangeText()}
        <svg className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50" onClick={(e) => e.stopPropagation()}>
          <div className="p-4">
            {/* Quick Select Buttons */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Select</h3>
              <div className="grid grid-cols-2 gap-2">
                {dateRanges.map((range) => {
                  const isSelected = selectedRange === range.label;
                  return (
                    <button
                      key={range.label}
                      onClick={() => { 
                        setSelectedRange(range.label);
                        handleQuickSelect(range);
                      }}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        isSelected
                          ? 'text-white bg-blue-600 hover:bg-blue-700'
                          : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {range.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Range */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Custom Range</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCustomRangeApply();
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => {
                        e.stopPropagation();
                        setCustomStartDate(e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      onBlur={(e) => e.stopPropagation()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => {
                        e.stopPropagation();
                        setCustomEndDate(e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      onBlur={(e) => e.stopPropagation()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    onClick={(e) => e.stopPropagation()}
                    disabled={!customStartDate || !customEndDate}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Apply Custom Range
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default DateRangeSelector;
