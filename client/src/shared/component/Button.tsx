import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string | React.ReactNode;
  className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ label, className = "", ...props }, ref) => {
    return (
      <button 
        ref={ref} 
        className={`px-3 sm:px-4 py-2 rounded text-white text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95 min-w-[44px] sm:min-w-[auto] ${className}`} 
        {...props}
      >
        {label}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
