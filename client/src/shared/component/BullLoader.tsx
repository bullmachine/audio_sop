import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setLoaderState } from '../../redux/loaderSlice';
import type { RootState } from '../../store/store';

// Animation constants
const ANIMATION_CONFIG = {
  FRAMES: 3,
  FRAME_DURATION: 120,
  SPRITE_WIDTH: 120,
  SPRITE_HEIGHT: 120,
} as const;

// Bull running frames
const BULL_FRAMES = [
  'images/bull-run-1.png',
  'images/bull-run-2.png',
  'images/bull-run-3.png',
];

interface BullLoaderProps {
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  message?: string;
  useImages?: boolean;
}

const BullLoader: React.FC<BullLoaderProps> = ({
  size = 'medium',
  showProgress = false,
  message = 'Loading...',
}) => {
  const dispatch = useDispatch();
  const loaderState = useSelector((state: RootState) => state.loader);
  const [currentFrame, setCurrentFrame] = useState(0);
  const animationRef = useRef<number>(0);
  const frameIntervalRef = useRef<number | null>(null);

  // Size configurations
  const sizeConfig = {
    small: { scale: 0.6 },
    medium: { scale: 1 },
    large: { scale: 1.5 },
  };

  const { scale } = sizeConfig[size];

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

  // Frame-based animation
  useEffect(() => {
    frameIntervalRef.current = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % ANIMATION_CONFIG.FRAMES);
    }, ANIMATION_CONFIG.FRAME_DURATION);

    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-lg">
      <div className="relative">
        {/* Bull sprite container */}
        <div 
          className="relative z-10 transition-all duration-75"
          style={{
            transform: `translateY(${Math.sin(loaderState.cyclePosition * Math.PI * 2 * 2) * 3}px)`,
          }}
        >
          {/* Actual image sprite */}
          <img 
            src={BULL_FRAMES[currentFrame]}
            alt={`Bull frame ${currentFrame + 1}`}
            style={{ 
              width: ANIMATION_CONFIG.SPRITE_WIDTH * scale,
              height: ANIMATION_CONFIG.SPRITE_HEIGHT * scale,
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
              transition: 'all 0.075s ease-in-out',
            }}
          />
        </div>
        
        {/* Shadow */}
        <div
          className="absolute bg-black rounded-full blur-sm"
          style={{
            width: `${60 * scale}px`,
            height: `${12 * scale}px`,
            left: '50%',
            top: `${85 * scale}px`,
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
              className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 transition-all duration-300"
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

      {/* Frame indicator */}
      <p className="text-gray-400 text-xs mt-2">
        Frame: {currentFrame + 1}/{ANIMATION_CONFIG.FRAMES}
      </p>
    </div>
  );
};

export default BullLoader;
