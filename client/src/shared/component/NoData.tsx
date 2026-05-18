import React from 'react';

interface NoDataProps {
  image?: string;
  title?: string;
  message?: string;
  className?: string;
}

const NoData: React.FC<NoDataProps> = ({ 
  image = "images/404.png", 
  title = "No Data Found", 
  message = "There are no records to display at the moment.",
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <img 
        src={image} 
        alt="No data" 
        className="w-32 h-32 mb-4 opacity-50"
      />
      <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-500 text-center max-w-md">
        {message}
      </p>
    </div>
  );
};

export default NoData;
