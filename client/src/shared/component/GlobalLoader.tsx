import React from 'react';
// import { useLoader } from '../hooks/useLoader';
// import FinanceLoader from './FinanceLoader';

// Enterprise-standard global loader component
interface GlobalLoaderProps {
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  customMessage?: string;
  overlay?: boolean;
}

const GlobalLoader: React.FC<GlobalLoaderProps> = ({
  // size = 'medium',
  // showProgress = false,
  // customMessage,
  overlay = true,
}) => {
  // const { isLoading, message } = useLoader();

  // if (!isLoading) return null;

  const loaderContent = (
    <div className="flex flex-col items-center justify-center">
      {/* <FinanceLoader
        size={size}
        showProgress={showProgress}
        message={customMessage || message}
      /> */}
    </div>
  );

  if (overlay) {
    return (
      <div></div>
      // <div className="fixed inset-0 backdrop-blur-xs bg-transparent flex items-center justify-center z-50">
      //   <div className="bg-white bg-opacity-95 rounded-lg p-8 shadow-2xl backdrop-blur-md">
      //     {loaderContent}
      //   </div>
      // </div>
    );
  }

  return loaderContent;
};

export default GlobalLoader;
