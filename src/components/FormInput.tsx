import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  name: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  error?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = 'text',
  multiline = false,
  rows = 3,
  error,
  className = '',
  defaultValue = '',
  value,
  ...props
}) => {
  const baseClasses = "block w-full rounded-lg shadow-sm text-base transition-colors py-3 px-4";
  const stateClasses = error
    ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
    : "border-gray-600/25 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500";

  const inputClasses = `${baseClasses} ${stateClasses} ${className}`;

  // Ensure we're using either value or defaultValue, not both
  const inputProps = value !== undefined 
    ? { value } 
    : { defaultValue: defaultValue || '' };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-base font-medium text-white mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {multiline ? (
          <textarea
            id={name}
            name={name}
            rows={rows}
            className={inputClasses}
            {...inputProps}
            {...props}
          />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            className={inputClasses}
            {...inputProps}
            {...props}
          />
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export default FormInput;