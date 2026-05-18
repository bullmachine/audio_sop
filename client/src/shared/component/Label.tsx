import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  label?: string;
  labelclassName?: string;
  children: React.ReactNode;  
}

const Label: React.FC<LabelProps> = ({
  label,
  labelclassName = "",
  children, 
}) => {
  return (
    <div className="space-y-1" >
      {label && (
        <label
          className={`block text-xs font-medium text-gray-500 mb-1 ${labelclassName}`}
        >
          {label}
        </label>
      )}
      {children}
    </div>
  );
};

export { Label };
export type { LabelProps };
