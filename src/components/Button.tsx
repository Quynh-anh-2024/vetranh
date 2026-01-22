import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-bold rounded-2xl transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 shadow-md";
  
  const variants = {
    primary: "bg-kid-blue hover:bg-blue-400 text-white shadow-blue-200",
    secondary: "bg-kid-pink hover:bg-pink-400 text-white shadow-pink-200",
    outline: "border-2 border-gray-300 hover:border-kid-blue text-gray-600 hover:text-kid-blue bg-white",
    danger: "bg-red-400 hover:bg-red-500 text-white"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-xl"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
