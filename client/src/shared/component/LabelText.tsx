import React from "react";

interface LabelTextProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  label?: string;
  labelclassName?: string;
  children: React.ReactNode;  
}

const LabelText: React.FC<LabelTextProps> = ({
  label,
  labelclassName = "",
  children, 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label
          className={`block text-xs font-medium text-gray-500 mb-1 ${labelclassName}`}
        >
          {label}
        </label>
      )}
      <p></p>
      {children}
    </div>
  );
};
LabelText.displayName="LabelText";
export { LabelText };
export type { LabelTextProps };
