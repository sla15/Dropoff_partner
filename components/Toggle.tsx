import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, disabled }) => {
  return (
    <div className="flex items-center justify-between py-2">
      {label && <span className="text-base font-medium text-gray-900 dark:text-white">{label}</span>}
      <button 
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-partner-green focus:ring-offset-2 dark:focus:ring-offset-black ${
          checked ? 'bg-partner-green' : 'bg-gray-300 dark:bg-zinc-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`${
            checked ? 'translate-x-7' : 'translate-x-1'
          } inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform`}
        />
      </button>
    </div>
  );
};