import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  label?: string;
  name: string;
  options: Option[];
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  className?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  options,
  value,
  defaultValue,
  onChange,
  required,
  placeholder,
  error,
  className = ''
}) => {
  const baseClasses = "block w-full rounded-lg shadow-sm text-base transition-colors py-3 px-4 appearance-none bg-no-repeat";
  const stateClasses = error
    ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500"
    : "border-gray-600/25 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500";

  // If value is provided without onChange, make it readOnly
  const isReadOnly = value !== undefined && !onChange;

  const selectProps = isReadOnly
    ? { value, readOnly: true }
    : value !== undefined
    ? { value, onChange }
    : { defaultValue };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-base font-medium text-white mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={name}
          name={name}
          required={required}
          className={`${baseClasses} ${stateClasses} ${className} ${isReadOnly ? 'cursor-not-allowed opacity-75' : ''} pr-10`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 1rem center',
            backgroundSize: '1.25em 1.25em'
          }}
          {...selectProps}
        >
          {placeholder && (
            <option value="" className="bg-gray-800 text-white">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-gray-800 text-white">
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export default FormSelect;