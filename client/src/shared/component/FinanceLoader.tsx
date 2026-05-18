import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setLoaderState } from '../../redux/loaderSlice';
import type { RootState } from '../../store/store';

interface FinanceLoaderProps {
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  message?: string;
}

const FinanceLoader: React.FC<FinanceLoaderProps> = ({
  size = 'medium',
  showProgress = false,
  message = 'Loading...',
}) => {
  const dispatch = useDispatch();
  const loaderState = useSelector((state: RootState) => state.loader);
  const animationRef = useRef<number>(0);
  const [pulseScale, setPulseScale] = useState(1);

  // Size configurations
  const sizeConfig = {
    small: { imageSize: 80 },
    medium: { imageSize: 120 },
    large: { imageSize: 180 },
  };

  const { imageSize } = sizeConfig[size];

  // Update loader state in Redux
  useEffect(() => {
    const interval = setInterval(() => {
      animationRef.current = (animationRef.current + 0.02) % 1;
      dispatch(setLoaderState({
        progress: animationRef.current * 100,
        isAnimating: true,
        cyclePosition: animationRef.current,
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Pulse animation for the finance loader
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulseScale(1 + Math.sin(Date.now() * 0.003) * 0.1);
    }, 50);

    return () => clearInterval(pulseInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-600 via-indigo-800 to-purple-900 rounded-lg">
      <div className="relative">
        {/* Finance loader container */}
        <div 
          className="relative z-10 transition-all duration-75"
          style={{
            transform: `scale(${pulseScale}) translateY(${Math.sin(loaderState.cyclePosition * Math.PI * 2) * 3}px)`,
          }}
        >
          {/* Finance loader image */}
          <img 
            src="images/finance_loader1.webp"
            alt="Finance Loader"
            style={{ 
              width: imageSize,
              height: imageSize,
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
              transition: 'all 0.075s ease-in-out',
            }}
          />
        </div>
        
        {/* Animated glow effect */}
        <div
          className="absolute bg-blue-400 rounded-full blur-md opacity-50"
          style={{
            width: `${imageSize * 1.2}px`,
            height: `${imageSize * 1.2}px`,
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) scale(${1 + Math.sin(loaderState.cyclePosition * Math.PI * 2) * 0.2})`,
          }}
        />
        
        {/* Shadow */}
        <div
          className="absolute bg-black rounded-full blur-sm"
          style={{
            width: `${imageSize * 0.5}px`,
            height: `${imageSize * 0.1}px`,
            left: '50%',
            top: `${imageSize * 0.7}px`,
            transform: `translateX(-50%) scaleX(${1 + Math.sin(loaderState.cyclePosition * Math.PI * 2) * 0.1})`,
            opacity: 0.3,
          }}
        />
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="w-full max-w-xs mt-6">
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 transition-all duration-300"
              style={{ width: `${loaderState.progress}%` }}
            />
          </div>
          <p className="text-white text-sm mt-2 text-center font-medium">
            {Math.round(loaderState.progress)}% Complete
          </p>
        </div>
      )}

      {/* Loading message */}
      <p className="text-white text-lg font-semibold mt-6 animate-pulse">
        {message}
      </p>

      
    </div>
  );
};

export default FinanceLoader;
