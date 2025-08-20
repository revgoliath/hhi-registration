import React, { useState, useEffect } from 'react';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  required?: boolean;
}

const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'DD/MM/YYYY',
  min,
  max,
  required = false
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Convert ISO date to DD/MM/YYYY format for display
  const formatDateForDisplay = (isoDate: string): string => {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '';
    }
  };

  // Convert DD/MM/YYYY format to ISO date
  const formatDateForISO = (displayDate: string): string => {
    if (!displayDate) return '';
    const parts = displayDate.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      if (day && month && year && year.length === 4) {
        try {
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        } catch {
          // Invalid date
        }
      }
    }
    return '';
  };

  // Update display value when prop value changes
  useEffect(() => {
    setDisplayValue(formatDateForDisplay(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Remove any non-numeric characters except /
    inputValue = inputValue.replace(/[^\d/]/g, '');
    
    // Auto-format as user types
    if (inputValue.length <= 10) {
      // Add slashes automatically
      if (inputValue.length === 2 && !inputValue.includes('/')) {
        inputValue += '/';
      } else if (inputValue.length === 5 && inputValue.split('/').length === 2) {
        inputValue += '/';
      }
      
      setDisplayValue(inputValue);
      
      // Only call onChange if we have a complete date
      if (inputValue.length === 10) {
        const isoDate = formatDateForISO(inputValue);
        if (isoDate) {
          onChange(isoDate);
        }
      } else if (inputValue.length === 0) {
        onChange('');
      }
    }
  };

  const handleBlur = () => {
    // Validate and format the date on blur
    if (displayValue.length === 10) {
      const isoDate = formatDateForISO(displayValue);
      if (isoDate) {
        onChange(isoDate);
        setDisplayValue(formatDateForDisplay(isoDate));
      } else {
        // Invalid date, clear it
        setDisplayValue('');
        onChange('');
      }
    } else if (displayValue.length > 0 && displayValue.length < 10) {
      // Incomplete date, clear it
      setDisplayValue('');
      onChange('');
    }
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      className={`w-full px-3 sm:px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white ${className}`}
      placeholder={placeholder}
      maxLength={10}
      required={required}
    />
  );
};

export default DateInput;