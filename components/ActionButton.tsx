import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = 'font-semibold rounded-2xl transition-all duration-200 active:scale-95 flex items-center justify-center';
  
  const variants = {
    primary: 'bg-partner-green text-black hover:bg-opacity-90 shadow-sm',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
    secondary: 'bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-white',
    outline: 'border-2 border-partner-green text-partner-green bg-transparent'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};